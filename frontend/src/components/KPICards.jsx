import React from 'react';
import { DollarSign, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function KPICards({ analytics }) {
  const failedAmt = analytics?.total_failed_amount || 0;
  const recoveredAmt = analytics?.total_recovered_amount || 0;
  const recoveryRate = analytics?.recovery_rate_pct || 0;
  const blockedCount = analytics?.blocked_guardrail_count || 0;
  const recoveredCount = analytics?.recovered_count || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      
      {/* Total Failed Revenue */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue at Risk</span>
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center border border-rose-500/30">
            <DollarSign className="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white font-heading mb-1">
          ${failedAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="text-rose-400 font-medium">Failed Payments</span>
          <span>across monitored gateway</span>
        </div>
      </div>

      {/* Recovered Revenue */}
      <div className="glass-card glass-card-emerald p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl group-hover:bg-emerald-500/25 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Recovered Revenue</span>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-emerald-400 font-heading mb-1">
          ${recoveredAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-300/80">
          <span className="font-semibold text-emerald-400">+{recoveredCount} Txns</span>
          <span>successfully salvaged</span>
        </div>
      </div>

      {/* Recovery Success Rate */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Recovery Rate</span>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/15 flex items-center justify-center border border-cyan-500/30">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white font-heading mb-1">
          {recoveryRate}%
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-1000" 
            style={{ width: `${Math.min(100, recoveryRate)}%` }}
          ></div>
        </div>
      </div>

      {/* Guardrails Protection */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Guardrails Shielded</span>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center border border-indigo-500/30">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white font-heading mb-1">
          {blockedCount} <span className="text-xs font-normal text-slate-400">Interventions</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-indigo-300">
          <span className="font-medium">100% Policy Compliant</span>
          <span>(Max retries / PCI)</span>
        </div>
      </div>

    </div>
  );
}
