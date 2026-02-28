import { useState, useRef, useCallback } from 'react';
import { createAudioPipeline, type PitchResult, type AudioPipeline } from '../lib/pitchDetector';
import { frequencyToNote, type NoteInfo } from '../lib/noteMapping';

export interface PitchState {
  isListening: boolean;
  currentPitch: PitchResult | null;
  currentNote: NoteInfo | null;
  audioLevel: number;
  error: string | null;
}

export function usePitchDetector() {
  const [state, setState] = useState<PitchState>({
    isListening: false,
    currentPitch: null,
    currentNote: null,
    audioLevel: 0,
    error: null,
  });

  const pipelineRef = useRef<AudioPipeline | null>(null);

  // Smoothing: keep a short history to reduce jitter
  const historyRef = useRef<number[]>([]);
  const HISTORY_SIZE = 5;

  const smoothFrequency = useCallback((freq: number): number => {
    const history = historyRef.current;
    history.push(freq);
    if (history.length > HISTORY_SIZE) {
      history.shift();
    }

    // Median filter — more robust than mean against outliers
    const sorted = [...history].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  }, []);

  const startListening = useCallback(async () => {
    if (pipelineRef.current?.isRunning()) return;

    try {
      const pipeline = createAudioPipeline((result: PitchResult | null, level?: number) => {
        if (result) {
          const smoothed = smoothFrequency(result.frequency);
          const note = frequencyToNote(smoothed);
          setState({
            isListening: true,
            currentPitch: { ...result, frequency: smoothed },
            currentNote: note,
            audioLevel: level ?? 0,
            error: null,
          });
        } else {
          setState((prev) => ({
            ...prev,
            currentPitch: null,
            currentNote: null,
            audioLevel: level ?? 0,
          }));
        }
      });

      pipelineRef.current = pipeline;
      await pipeline.start();
      setState((prev) => ({ ...prev, isListening: true, error: null }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access microphone';
      let helpText = message;
      if (message.toLowerCase().includes('permission') || message.toLowerCase().includes('denied') || message.toLowerCase().includes('not allowed')) {
        helpText = 'Microphone access denied. Please allow microphone access in your browser settings and reload the page.';
      } else if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('no device')) {
        helpText = 'No microphone found. Please connect a microphone and try again.';
      }
      setState((prev) => ({ ...prev, error: helpText, isListening: false }));
    }
  }, [smoothFrequency]);

  const stopListening = useCallback(() => {
    if (pipelineRef.current) {
      pipelineRef.current.stop();
      pipelineRef.current = null;
    }
    historyRef.current = [];
    setState({
      isListening: false,
      currentPitch: null,
      currentNote: null,
      audioLevel: 0,
      error: null,
    });
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
  };
}
