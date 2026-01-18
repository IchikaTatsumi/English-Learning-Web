'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { calculateAccuracy } from '@/lib/utils/string-similarity'; // ✅ Import hàm so sánh

// Định nghĩa lại Type cho Web Speech API (vì TypeScript mặc định chưa có đủ)
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export interface RecognitionResult {
  recognizedText: string;
  isCorrect: boolean;
  accuracy: number;
  confidence: number;
}

interface MicroRecordingButtonProps {
  vocabId: number;
  targetWord: string;
  onRecordingComplete: (result: RecognitionResult) => void;
  className?: string;
}

export function MicroRecordingButton({
  targetWord,
  onRecordingComplete,
  className = '',
}: MicroRecordingButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ref để giữ instance nhận diện giọng nói
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Khởi tạo SpeechRecognition một lần khi mount
    const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
    const SpeechRecognitionApi = SpeechRecognition || webkitSpeechRecognition;

    if (SpeechRecognitionApi) {
      const recognition = new SpeechRecognitionApi();
      recognition.continuous = false; // Dừng ngay khi người dùng ngừng nói
      recognition.lang = 'en-US'; // ⚠️ Bắt buộc set tiếng Anh chuẩn
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // Khi bắt đầu ghi âm
      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
        setResult(null);
      };

      // Khi kết thúc ghi âm (hoặc tự ngắt)
      recognition.onend = () => {
        setIsRecording(false);
      };

      // Xử lý lỗi
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setError("Microphone access denied.");
        } else if (event.error === 'no-speech') {
          // Người dùng không nói gì -> bỏ qua, không báo lỗi đỏ lòm
          setIsRecording(false);
        } else {
          setError("Error occurred in recognition.");
        }
      };

      // ✅ XỬ LÝ KẾT QUẢ TRẢ VỀ (QUAN TRỌNG NHẤT)
      recognition.onresult = (event: any) => {
        setIsProcessing(true);
        
        // Lấy text người dùng nói
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;

        // 1. Tính điểm chính xác ngay tại Frontend
        const accuracy = calculateAccuracy(targetWord, transcript);
        
        // 2. Quyết định đúng/sai (Ngưỡng đúng là 80%)
        const isCorrect = accuracy >= 80; 

        const finalResult: RecognitionResult = {
          recognizedText: transcript,
          isCorrect,
          accuracy,
          confidence
        };

        setResult(finalResult);
        // Gọi callback để QuizUI nhận kết quả và tự động Next (nếu muốn)
        onRecordingComplete(finalResult);
        setIsProcessing(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError("Browser not supported. Please use Chrome, Edge or Safari.");
    }
  }, [targetWord, onRecordingComplete]);

  const startRecording = () => {
    if (recognitionRef.current) {
      try {
        setResult(null);
        setError(null);
        recognitionRef.current.start();
      } catch (err) {
        // Đôi khi start liên tục sẽ gây lỗi, cần stop trước
        recognitionRef.current.stop();
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
  };

  // --- RENDER UI ---

  // 1. Trạng thái lỗi (Browser không hỗ trợ hoặc cấm Micro)
  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 mt-4">
        <div className="text-red-500 text-sm bg-red-50 px-3 py-1 rounded-full">{error}</div>
        <button onClick={handleRetry} className="text-blue-600 text-xs underline font-medium">Reset</button>
      </div>
    );
  }

  // 2. Trạng thái đang xử lý (Hiếm khi hiện lâu vì Frontend xử lý rất nhanh)
  if (isProcessing) {
    return (
      <button className={`inline-flex items-center gap-2 px-6 py-4 rounded-full bg-blue-50 text-blue-600 cursor-wait shadow-inner ${className}`} disabled>
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="font-medium">Analyzing...</span>
      </button>
    );
  }

  // 3. Trạng thái đã có kết quả (Đúng/Sai)
  if (result) {
    return (
      <div className={`flex flex-col items-center gap-4 w-full ${className}`}>
        {result.isCorrect ? (
          <div className="flex flex-col items-center p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 animate-in zoom-in duration-300 w-full max-w-md">
            <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-6 h-6" />
                <span className="font-bold text-lg">Good Job!</span>
            </div>
            <div className="text-sm text-center">
              You said: <span className="font-semibold text-green-900">"{result.recognizedText}"</span>
              <br/>
              Match: {result.accuracy}%
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-in zoom-in duration-300 w-full max-w-md">
            <div className="flex items-center gap-2 mb-1">
                <XCircle className="w-6 h-6" />
                <span className="font-bold text-lg">Try Again</span>
            </div>
            <div className="text-sm text-center">
              You said: <span className="font-semibold text-red-900">"{result.recognizedText}"</span>
              <br/>
              Expected: <span className="font-semibold">"{targetWord}"</span>
            </div>
          </div>
        )}
        
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  // 4. Trạng thái mặc định / Đang ghi âm
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
          isRecording
            ? 'bg-red-500 text-white ring-4 ring-red-200 animate-pulse'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
        } ${className}`}
      >
        {isRecording ? (
          <>
            <Square className="w-6 h-6 fill-current" />
            <span className="font-semibold text-lg">Listening...</span>
          </>
        ) : (
          <>
            <Mic className="w-6 h-6" />
            <span className="font-semibold text-lg">Tap to Speak</span>
          </>
        )}
      </button>
      {isRecording && <p className="text-xs text-gray-500 font-medium animate-bounce">Speak the word clearly...</p>}
    </div>
  );
}