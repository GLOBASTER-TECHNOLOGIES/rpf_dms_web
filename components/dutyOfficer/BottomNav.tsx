"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Train, FileText, Mic, Home } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 pb-safe z-30 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto px-6">
        
        <Link href="/duty-officer" className={`flex flex-col items-center justify-center w-full transition-colors ${isActive('/duty-officer') ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}>
          <Home size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>

        <Link href="/duty-officer/view-train-details" className={`flex flex-col items-center justify-center w-full transition-colors ${isActive('/duty-officer/view-train-details') ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}>
          <Train size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Trains</span>
        </Link>
        
        <Link href="/duty-officer/view-circulars" className={`flex flex-col items-center justify-center w-full transition-colors ${isActive('/duty-officer/view-circulars') ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-500'}`}>
          <FileText size={22} className="mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Circulars</span>
        </Link>

        {/* Debrief Trigger */}
        <button className="flex flex-col items-center justify-center w-full text-slate-400 hover:text-indigo-600 transition-colors group">
          <div className="bg-slate-100 p-3 rounded-full -mt-6 border-4 border-white shadow-sm group-hover:bg-indigo-50 transition-colors">
            <Mic size={24} className="text-indigo-600" />
          </div>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Debrief</span>
        </button>

      </div>
    </div>
  );
}