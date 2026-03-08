import { Zap, Loader2, ShieldCheck } from "lucide-react";

interface AIAssistantPromptProps {
  isLoading: boolean;
  aiPrompt: string | null;
  onGenerate: () => void;
}

export default function AIAssistantPrompt({ isLoading, aiPrompt, onGenerate }: AIAssistantPromptProps) {
  if (!aiPrompt && !isLoading) {
    return (
      <button 
        onClick={onGenerate}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200"
      >
        <Zap size={16} /> Synthesize Duty Instructions
      </button>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
      <h4 className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-1.5 mb-3">
        <ShieldCheck size={16} className="text-indigo-600" /> AI Duty Synthesis
      </h4>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-4 text-indigo-500">
          <Loader2 className="animate-spin mb-2" size={24} />
          <p className="text-xs font-semibold uppercase tracking-widest">Processing Intelligence...</p>
        </div>
      ) : (
        <div className="prose prose-sm prose-indigo text-slate-700 whitespace-pre-wrap leading-relaxed">
          {aiPrompt}
        </div>
      )}
    </div>
  );
}