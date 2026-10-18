"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sounds } from "@/lib/utils/confetti-sound";

interface VoiceDictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  lang?: string;
}

// Window declaration for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
}

export function VoiceDictationButton({
  onTranscript,
  className = "",
  lang = "ar-EG",
}: VoiceDictationButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
          .webkitSpeechRecognition;

      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = lang;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
          if (finalTranscript.trim()) {
            onTranscript(finalTranscript.trim());
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          toast.error("حدث خطأ في استقبال الصوت أو تم رفض إذن الميكروفون");
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [lang, onTranscript]);

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) {
      toast.info("الإملاء الصوتي متاح في متصفحات Google Chrome وEdge");
      return;
    }

    sounds.playTactileClick();

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.success("تم إيقاف الإملاء الصوتي");
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("جارٍ الاستماع... تحدث بالعامية المصرية الآن 🎙️");
      } catch {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  };

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
        isListening
          ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30"
          : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
      } ${className}`}
      title={isListening ? "إيقاف الإملاء الصوتي" : "تفعيل الإملاء الصوتي بالعامية المصرية (Voice-to-Text)"}
    >
      {isListening ? (
        <MicOff className="h-3.5 w-3.5" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
