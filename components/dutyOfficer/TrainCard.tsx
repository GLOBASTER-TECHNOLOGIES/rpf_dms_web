import { useState } from "react";
import { AlertTriangle, MapPin } from "lucide-react";
import AIAssistantPrompt from "./AIAssistantPrompt";

interface TrainCardProps {
  train: any; // Ideally replace 'any' with your Train interface
}

export default function TrainCard({ train }: TrainCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);

  // Mock function to simulate AI generation delay
  const handleGenerateAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setAiPrompt(
        "1. POSITION: Stand near general coach (S1-S3) entry.\n2. WATCH FOR: Luggage thieves operating during boarding.\n3. ALERT: HIGH crowd expected. Watch for unauthorized vendors.\n4. CIRCULAR: Check for unaccompanied minors per HQ directive."
      );
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all mb-4">
      
      {/* Train Header - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-slate-50 flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-inner ${train.recentIncidents.length > 0 ? 'bg-orange-500' : 'bg-indigo-500'}`}>
            {train.platform}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-tight">{train.number}</h3>
            <p className="text-slate-500 text-sm">{train.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-indigo-700">{train.eta}</p>
          <p className={`text-xs font-bold ${train.status === 'On Time' ? 'text-green-600' : 'text-red-500'}`}>
            {train.status}
          </p>
        </div>
      </div>

      {/* Expanded Details: Incidents & AI */}
      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-5">
          
          {/* Raw Incident Data */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-2">
              <AlertTriangle size={14} className={train.recentIncidents.length > 0 ? "text-orange-500" : "text-slate-400"} /> 
              Recent Incident History
            </h4>
            {train.recentIncidents.length > 0 ? (
              <ul className="space-y-2">
                {train.recentIncidents.map((incident: string, idx: number) => (
                  <li key={idx} className="text-sm text-slate-700 bg-white border border-slate-200 py-2 px-3 rounded-lg flex items-start gap-2 shadow-sm">
                    <span className="text-orange-500 mt-0.5">•</span> {incident}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic bg-white py-2 px-3 rounded-lg border border-slate-200">No major incidents in the last 30 days.</p>
            )}
          </div>

          {/* AI Synthesis Trigger */}
          <AIAssistantPrompt 
            isLoading={isGenerating} 
            aiPrompt={aiPrompt} 
            onGenerate={handleGenerateAI} 
          />
        </div>
      )}
    </div>
  );
}