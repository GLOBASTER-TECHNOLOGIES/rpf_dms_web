"use client";

import { FileText, ShieldAlert, Clock } from "lucide-react";
// import BottomNav from "@/components/dutyOfficer/BottomNav";

// Mock Data: Later, you will fetch this from your database/API
const MOCK_CIRCULARS = [
  "HIGH ALERT: Intensify checks for unauthorized vendors on all platforms during Morning Shift.",
  "SOP UPDATE: Ensure body-worn cameras are active during ticket-checking assistance.",
  "DIRECTIVE: Special focus on unaccompanied minors entering general coaches."
];

export default function ViewCircularsPage() {
  return (
    <div className="min-h-screen font-sans pb-24 relative">
      

      {/* Main Content: Circulars List */}
      <div className="px-5 mt-6 max-w-md mx-auto">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Circulars</h2>
        
        <ul className="space-y-4">
          {MOCK_CIRCULARS.map((circ, idx) => (
            <li key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 leading-relaxed shadow-sm flex flex-col gap-2 relative overflow-hidden">
              {/* Decorative side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
              
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" />
                <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px]">HQ Directive</span>
              </div>
              <p className="pl-6">{circ}</p>
            </li>
          ))}
        </ul>
      </div>


      
    </div>
  );
}