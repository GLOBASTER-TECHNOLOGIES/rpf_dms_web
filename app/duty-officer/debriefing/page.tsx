"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Square,
  ChevronLeft,
  ShieldCheck,
  Clock,
  Send,
  Globe
} from "lucide-react";

export default function DebriefingModule() {

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("en-IN");

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Use Chrome.");
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

    recognition.onend = () => {
      if (isRecording) recognition.start();
    };

    recognitionRef.current = recognition;

  }, [language, isRecording]);



  const startRecording = () => {

    if (!recognitionRef.current) return;

    recognitionRef.current.lang = language;
    recognitionRef.current.start();

    setIsRecording(true);
  };



  const stopRecording = () => {

    recognitionRef.current?.stop();
    setIsRecording(false);
  };



  const handleSubmit = () => {

    console.log("Submitted:", transcript);

    finalTranscriptRef.current = "";
    setTranscript("");
  };



  return (

    <div className="min-h-screen text-black bg-slate-50 px-4 sm:px-6 py-8 flex justify-center">

      <div className="w-full max-w-4xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

          <Link
            href="/duty-officer"
            className="flex items-center gap-2 border bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 w-fit"
          >
            <ChevronLeft size={18} />
            Back to Dashboard
          </Link>

          <ShieldCheck className="text-blue-600 hidden sm:block" size={26} />

        </div>



        {/* TITLE */}

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex gap-3 items-center">
              <Mic className="text-blue-600" />
              Duty Debriefing
            </h1>

            <p className="text-slate-500 mt-2 text-sm">
              Record or type your end-of-shift report.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-slate-400 uppercase">Officer</p>
            <p className="font-semibold">Cst. Murugan R.</p>
          </div>

        </div>



        {/* SHIFT BAR */}

        <div className="bg-white border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">

          <Clock size={16} className="text-slate-400" />

          <span className="text-xs sm:text-sm font-semibold uppercase text-slate-600">
            Morning Shift (06:00 - 14:00) • PF 1-3
          </span>

        </div>



        {/* MAIN CARD */}

        <div className="bg-white border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">

          {/* LANGUAGE SELECT */}

          <div className="flex items-center gap-3">

            <Globe size={16} />

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRecording}
              className="border rounded-md px-3 py-1 text-sm"
            >
              <option value="en-IN">English</option>
              <option value="hi-IN">Hindi</option>
              <option value="ta-IN">Tamil</option>
            </select>

          </div>



          {/* RECORDING CONTROLS */}

          <div className="flex flex-col items-center gap-4">

            <div className="flex gap-4">

              {/* START BUTTON */}

              <button
                onClick={startRecording}
                disabled={isRecording}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-300"
              >
                <Mic size={18} />
                Start
              </button>


              {/* STOP BUTTON */}

              <button
                onClick={stopRecording}
                disabled={!isRecording}
                className="flex bg-red-600 items-center gap-2 px-5 py-3 rounded-xl text-white font-semibold "
              >
                <Square size={16} />
                Stop
              </button>

            </div>

            <p className="text-sm text-slate-500 text-center">
              {isRecording
                ? "Listening... You can pause and continue speaking."
                : "Press Start to begin recording."}
            </p>

          </div>



          {/* TRANSCRIPT */}

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            readOnly={isRecording}
            placeholder="Transcript appears here..."
            className="w-full min-h-[160px] sm:min-h-[200px] bg-slate-50 border rounded-xl p-4 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />



          {/* SUBMIT */}

          <button
            onClick={handleSubmit}
            disabled={!transcript.trim() || isRecording}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:bg-slate-300"
          >
            <Send size={18} />
            Submit Debrief Report
          </button>

        </div>

      </div>

    </div>
  );
}