import { FileText } from "lucide-react";

interface CircularMenuProps {
  onClose: () => void;
  circulars: string[]; // Pass the raw circular summaries here
}

export default function CircularMenu({ onClose, circulars }: CircularMenuProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-40 flex items-end justify-center backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl z-50 animate-in slide-in-from-bottom-8" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="text-indigo-600" /> Active Circulars
        </h2>
        
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {circulars.map((circ, idx) => (
            <li key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-700 leading-relaxed shadow-sm">
              <span className="font-bold text-indigo-700 block mb-1">HQ DIRECTIVE:</span> 
              {circ}
            </li>
          ))}
        </ul>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
        >
          Close Instructions
        </button>
      </div>
    </div>
  );
}