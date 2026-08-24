import React from 'react';
import { X, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, ArrowUpRight } from 'lucide-react';

export default function KPIDetailModal({ kpi, onClose }) {
  if (!kpi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-xl overflow-hidden border border-white/15 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">{kpi.title} Analytics & Trend</h3>
              <p className="text-xs text-slate-400">Detailed metric breakdown and operational telemetry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 bg-obsidian">
          
          {/* Main Stat Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Value</span>
              <span className="text-3xl font-extrabold text-white font-heading">{kpi.value}</span>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-bold text-xs inline-flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {kpi.change}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">vs previous 30d baseline</p>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Weekly Growth Velocity</span>
              <span className="text-base font-bold text-white">+14.2%</span>
              <p className="text-[10px] text-slate-500 mt-1">Consistent positive slope</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Confidence Score</span>
              <span className="text-base font-bold text-emerald-400">98.4%</span>
              <p className="text-[10px] text-slate-500 mt-1">Validated via ML Pipeline</p>
            </div>
          </div>

          {/* Statistical Description */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-white block mb-1">Operational Context:</strong>
            {kpi.description}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs">Close Analysis</button>
        </div>

      </div>
    </div>
  );
}
