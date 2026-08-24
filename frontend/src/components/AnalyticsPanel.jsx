import React from 'react';
import { PieChart, ShieldCheck, BarChart3, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function AnalyticsPanel({ analytics }) {
  const failureBreakdown = analytics?.failure_breakdown || [];
  const totalCount = analytics?.total_transactions || 5000;

  const failureColorMap = {
    network_error: 'bg-emerald-400 text-emerald-300 border-emerald-500/30',
    expired_card: 'bg-amber-400 text-amber-300 border-amber-500/30',
    insufficient_funds: 'bg-blue-400 text-blue-300 border-blue-500/30',
    authentication_failed: 'bg-purple-400 text-purple-300 border-purple-500/30',
    limit_exceeded: 'bg-rose-400 text-rose-300 border-rose-500/30',
    bank_declined: 'bg-indigo-400 text-indigo-300 border-indigo-500/30',
    invalid_payment_method: 'bg-teal-400 text-teal-300 border-teal-500/30',
    unknown: 'bg-slate-400 text-slate-300 border-slate-500/30'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* Root Cause Failure Distribution */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white font-heading">Payment Failure Telemetry Distribution</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">5,000 Sampled Events</span>
        </div>

        <div className="space-y-3.5">
          {failureBreakdown.map((item) => {
            const pct = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : 0;
            const barColorClass = failureColorMap[item.reason]?.split(' ')[0] || 'bg-emerald-400';
            
            return (
              <div key={item.reason} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="capitalize text-slate-300">{item.reason.replace('_', ' ')}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{item.count} txns</span>
                    <span className="font-bold text-white w-10 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-700 ${barColorClass}`}
                    style={{ width: `${Math.max(3, pct)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guardrail Safety & Compliance Monitor */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white font-heading">Autonomous Agent Guardrail Policies</h3>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Strict safety rules enforced by the AI Agent to prevent customer spam, chargebacks, and regulatory violations.
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Max Retry Fatigue Cap (Rule G-101)</div>
                <div className="text-[11px] text-slate-400">Restricts total recovery retries to ≤3 attempts per invoice cycle.</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">High Value Fraud Threshold (Rule G-102)</div>
                <div className="text-[11px] text-slate-400">Blocks auto-retry on transactions &gt;$3,000 for accounts under 14 days tenure.</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Expired Card Protection (Rule G-103)</div>
                <div className="text-[11px] text-slate-400">Suppresses direct charge attempts on expired instruments; mandates update link.</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">PCI-DSS Tokenized Dispatch (Rule G-104)</div>
                <div className="text-[11px] text-slate-400">All webhook recovery dispatches use tokenized gateway credentials.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Active Guardrails Enforced</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">100% PASS RATE</span>
        </div>
      </div>

    </div>
  );
}
