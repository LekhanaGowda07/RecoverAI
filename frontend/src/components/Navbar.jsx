import React from 'react';
import { ShieldCheck, Zap, RefreshCw, PlusCircle, Activity } from 'lucide-react';

export default function Navbar({ onOpenSimulator, onTriggerBatch, onRefresh, isBatchLoading, healthData }) {
  return (
    <header className="sticky top-0 z-30 w-full glass-card border-b border-white/10 px-6 py-4 mb-8 rounded-none border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                Recover<span className="text-emerald-400">AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md uppercase tracking-wider">
                Razorpay Edition
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Payment Failure Recovery Agent</p>
          </div>
        </div>

        {/* Live Engine Indicator */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-full border border-slate-700/50 text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-200">AI Engine Online</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 font-semibold">{healthData?.database_records || 5000} Txns Monitored</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button 
            id="btn-simulate"
            onClick={onOpenSimulator}
            className="btn-secondary text-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Simulate Failure</span>
          </button>

          <button 
            id="btn-batch"
            onClick={onTriggerBatch}
            disabled={isBatchLoading}
            className="btn-primary text-xs"
          >
            <Zap className={`w-4 h-4 ${isBatchLoading ? 'animate-spin' : ''}`} />
            <span>{isBatchLoading ? 'Running Agent...' : 'Batch Recover'}</span>
          </button>

          <button 
            id="btn-refresh"
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
