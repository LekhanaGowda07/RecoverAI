import React from 'react';
import { Zap, PlusCircle, RefreshCw, Activity, ShieldCheck } from 'lucide-react';

export default function Header({ 
  onOpenSimulator, 
  onOpenBatchModal, 
  onRefresh, 
  isRefreshing, 
  healthData, 
  lastSyncTime 
}) {
  return (
    <header className="glass-card rounded-none border-x-0 border-t-0 border-b border-white/10 px-6 py-4 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left Branding Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-heading">
                Recover<span className="text-emerald-400">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-md uppercase tracking-wider">
                Razorpay Edition
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Payment Failure Recovery Agent</p>
          </div>
        </div>

        {/* Center Live Engine Status Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400">AI Engine Online</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="text-slate-300">
            <span className="font-bold text-white">{healthData?.database_records || 5000}</span> Txns Monitored
          </div>

          <span className="text-slate-700">|</span>

          <div className="text-slate-400">
            Synced: <span className="text-slate-200 font-mono">{lastSyncTime || 'Just now'}</span>
          </div>

          <span className="text-slate-700">|</span>

          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
            DEMO
          </span>
        </div>

        {/* Right Action Triggers */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <button 
            id="btn-simulate"
            onClick={onOpenSimulator}
            className="btn-secondary text-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>+ Simulate Failure</span>
          </button>

          <button 
            id="btn-batch"
            onClick={onOpenBatchModal}
            className="btn-primary text-xs"
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Batch Recover</span>
          </button>

          <button 
            id="btn-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

      </div>
    </header>
  );
}
