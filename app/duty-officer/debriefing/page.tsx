"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Mic,
  Square,
  ChevronLeft,
  ShieldCheck,
  Clock,
  Send,
  Globe,
  AlertCircle
} from "lucide-react";

export default function DebriefingModule() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  // Initialize Speech Recognition
  const initSpeech = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = finalTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text + " ";
        } else {
          interimTranscript += text;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error:", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access blocked. Please enable it in browser settings.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      // Only restart if the user didn't manually stop it
      if (isRecording) {
        try {
          recognition.start();
        } catch (e) {
          console.error("Restart failed", e);
        }
      }
    };

    recognitionRef.current = recognition;
  }, [language, isRecording]);

  useEffect(() => {
    initSpeech();
  }, [initSpeech]);

  const startRecording = () => {
    setError(null);
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recognition start error:", err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSubmit = () => {
    console.log("Submitted:", transcript);
    finalTranscriptRef.current = "";
    setTranscript("");
  };

  return (
    <div className="min-h-screen text-slate-900 bg-slate-50 px-4 sm:px-6 py-8 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <Link
            href="/duty-officer"
            className="flex items-center gap-2 border bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors w-fit text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back to Dashboard
          </Link>
          <ShieldCheck className="text-blue-600 hidden sm:block" size={26} />
        </div>

        {/* TITLE */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex gap-3 items-center">
              <Mic className={`${isRecording ? "text-red-600 animate-pulse" : "text-blue-600"}`} />
              Duty Debriefing
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Record or type your end-of-shift report.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-left sm:text-right">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Duty Officer</p>
            <p className="font-bold text-slate-800">Cst. Murugan R.</p>
          </div>
        </div>

        {/* SHIFT BAR */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
          <Clock size={16} className="text-slate-400" />
          <span className="text-xs sm:text-sm font-bold uppercase text-slate-600 tracking-wide">
            Morning Shift (06:00 - 14:00) • Platform 1-3
          </span>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          
          {/* ERROR ALERT */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isRecording}
                className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
              >
                <option value="en-IN">English (India)</option>
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="ta-IN">Tamil (தமிழ்)</option>
              </select>
            </div>
            {isRecording && (
              <span className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase animate-pulse">
                <span className="h-2 w-2 bg-red-600 rounded-full" />
                Live Recording
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="group flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                >
                  <Mic size={20} className="group-hover:scale-110 transition-transform" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="group flex items-center gap-2 px-8 py-4 rounded-full bg-red-600 text-white font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:-translate-y-0.5 transition-all"
                >
                  <Square size={18} fill="currentColor" />
                  Stop Recording
                </button>
              )}
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {isRecording
                ? "Listening... Speak clearly into your microphone."
                : "Click the button to dictate your report."}
            </p>
          </div>

          <div className="relative">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              readOnly={isRecording}
              placeholder="Your transcript will appear here as you speak..."
              className="w-full min-h-[200px] bg-slate-50 border border-slate-200 rounded-xl p-5 text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!transcript.trim() || isRecording}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Send size={18} />
            Submit Final Report
          </button>
        </div>
      </div>
    </div>
  );
}