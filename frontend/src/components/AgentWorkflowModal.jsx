import React, { useState, useEffect } from 'react';
import { X, Zap, ShieldCheck, Cpu, Send, CheckCircle2, AlertTriangle, ShieldX, Play } from 'lucide-react';

export default function AgentWorkflowModal({ transactionId, onClose, onRefreshData }) {
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(4);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionId}`);
      if (res.ok) {
        const data = await res.json();
        setDetailData(data);
      }
    } catch (e) {
      console.error("Error fetching transaction details:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) {
      fetchDetail();
    }
  }, [transactionId]);

  const handleRunSingleRecovery = async () => {
    setIsExecuting(true);
    setActiveStep(1);

    // Simulate animated step progression
    setTimeout(() => setActiveStep(2), 600);
    setTimeout(() => setActiveStep(3), 1200);
    setTimeout(async () => {
      setActiveStep(4);
      try {
        await fetch(`/api/recover/${transactionId}`, { method: 'POST' });
        await fetchDetail();
        if (onRefreshData) onRefreshData();
      } catch (e) {
        console.error("Error running recovery:", e);
      } finally {
        setIsExecuting(false);
      }
    }, 1800);
  };

  if (!transactionId) return null;

  const txn = detailData?.transaction;
  const auditLogs = detailData?.audit_logs || [];

  const getStepAudit = (stepNum) => {
    return auditLogs.find(a => a.step_number === stepNum);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/15 shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-heading">AI Agent Diagnostic & Execution Trail</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                  {transactionId}
                </span>
              </div>
              <p className="text-xs text-slate-400">Step-by-step audit log of autonomous decision engine</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-obsidian">
          
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-emerald-400 animate-spin" />
              <span>Fetching AI telemetry and audit log history...</span>
            </div>
          ) : !txn ? (
            <div className="py-12 text-center text-slate-400">Transaction log details unavailable.</div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="glass-panel p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Customer ID</span>
                  <span className="font-mono text-white font-bold">{txn.customer_id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Amount</span>
                  <span className="font-bold text-emerald-400">{txn.currency} ${txn.amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Failure Telemetry</span>
                  <span className="font-medium text-amber-300 capitalize">{txn.failure_reason.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Status</span>
                  <span className="font-bold uppercase text-slate-200">{txn.final_status}</span>
                </div>
              </div>

              {/* 4-Step Agentic Workflow Visualizer */}
              <div className="space-y-4">
                
                {/* Step 1 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeStep >= 1 ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                        1
                      </div>
                      <span className="font-bold text-white text-sm">Diagnostics & Telemetry Triage</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      ML Inference Score: {((txn.recovery_score || 0.65) * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 pl-9 space-y-1">
                    <p><span className="text-slate-400">Classified Root Cause:</span> <strong className="text-white">{txn.failure_category || 'Soft Decline / Gateway Network Latency'}</strong></p>
                    <p><span className="text-slate-400">Recommended Action:</span> <strong className="text-emerald-300">{txn.recommended_action || 'SMART_RETRY_SCHEDULED'}</strong></p>
                    {getStepAudit(1) && (
                      <pre className="mt-2 p-2.5 rounded bg-slate-950 text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                        {getStepAudit(1).details}
                      </pre>
                    )}
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeStep >= 2 ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                        2
                      </div>
                      <span className="font-bold text-white text-sm">Risk & Compliance Guardrails</span>
                    </div>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                      txn.final_status === 'blocked_guardrail' 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {txn.final_status === 'blocked_guardrail' ? 'GUARDRAIL TRIGGERED' : 'POLICY PASSED'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 pl-9 space-y-1">
                    {getStepAudit(2) ? (
                      <pre className="p-2.5 rounded bg-slate-950 text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                        {getStepAudit(2).details}
                      </pre>
                    ) : (
                      <p className="text-slate-400">Rule G-101 (Max 3 retries), Rule G-102 ($3k Fraud cap), Rule G-103 (PCI Expiry) evaluated.</p>
                    )}
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeStep >= 3 ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                        3
                      </div>
                      <span className="font-bold text-white text-sm">Strategy & Dynamic Nudge Formulation</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                      Razorpay Webhook Payload
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 pl-9">
                    {getStepAudit(3) ? (
                      <pre className="p-2.5 rounded bg-slate-950 text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                        {getStepAudit(3).details}
                      </pre>
                    ) : (
                      <p className="text-slate-400">Synthesizing personalized customer nudge and smart retry timing...</p>
                    )}
                  </div>
                </div>

                {/* Step 4 */}
                <div className={`p-4 rounded-xl border transition-all ${
                  activeStep >= 4 ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                        4
                      </div>
                      <span className="font-bold text-white text-sm">Autonomous Webhook Execution</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                      VERDICT: {txn.final_status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 pl-9">
                    {getStepAudit(4) ? (
                      <pre className="p-2.5 rounded bg-slate-950 text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                        {getStepAudit(4).details}
                      </pre>
                    ) : (
                      <p className="text-slate-400">Executing recovery payload across payment gateway node...</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Audit logs stored securely in SQLite database with millisecond timestamps.
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Close
            </button>

            <button 
              id="btn-run-agent-modal"
              onClick={handleRunSingleRecovery}
              disabled={isExecuting}
              className="btn-primary text-xs"
            >
              <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Agent Executing...' : 'Re-trigger Agent Workflow'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
