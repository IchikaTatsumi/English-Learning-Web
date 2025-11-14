import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface MicroRecordingButtonProps {
  vocabId: number;
  targetWord: string;
  onRecordingComplete: (result: RecognitionResult) => void;
  className?: string;
}

interface RecognitionResult {
  recognizedText: string;
  isCorrect: boolean;
  confidence: number;
  accuracy: number;
  pronunciationScore: {
    accuracy: number;
    fluency: number;
    completeness: number;
  };
}

export function MicroRecordingButton({
  vocabId,
  targetWord,
  onRecordingComplete,
  className = '',
}: MicroRecordingButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setResult(null);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied. Please allow microphone permission.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Process audio with STT
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Send to backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/vocabulary-practice/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            vocabId,
            audioBase64: base64Audio,
            answers: [
              {
                questionId: vocabId,
                questionType: 'Pronunciation',
                questionText: `Say: ${targetWord}`,
                correctAnswer: targetWord,
                userAnswer: '',
                isCorrect: false,
              },
            ],
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to process audio');

      const data = await response.json();
      
      // Extract STT result from response
      // (Backend should return recognition result)
      const recognitionResult: RecognitionResult = {
        recognizedText: data.recognizedText || '',
        isCorrect: data.isCorrect || false,
        confidence: data.confidence || 0,
        accuracy: data.accuracy || 0,
        pronunciationScore: data.pronunciationScore || {
          accuracy: 0,
          fluency: 0,
          completeness: 0,
        },
      };

      setResult(recognitionResult);
      onRecordingComplete(recognitionResult);
    } catch (error) {
      console.error('Failed to process audio:', error);
      alert('Failed to process your recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper: Convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  // Processing state
  if (isProcessing) {
    return (
      <button
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 cursor-wait ${className}`}
        disabled
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Processing...</span>
      </button>
    );
  }

  // Result state
  if (result) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {result.isCorrect ? (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <div>
              <div className="font-medium">Correct!</div>
              <div className="text-sm">
                You said: "{result.recognizedText}" ({result.accuracy}%)
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700">
            <XCircle className="w-5 h-5" />
            <div>
              <div className="font-medium">Try Again</div>
              <div className="text-sm">
                You said: "{result.recognizedText}" (Expected: "{targetWord}")
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setResult(null)}
          className="px-3 py-2 text-sm text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // Recording state
  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isRecording
          ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
    >
      {isRecording ? (
        <>
          <Square className="w-5 h-5" />
          <span>Stop Recording</span>
        </>
      ) : (
        <>
          <Mic className="w-5 h-5" />
          <span>Record Pronunciation</span>
        </>
      )}
    </button>
  );
}