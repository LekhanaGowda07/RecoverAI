import React, { useState } from 'react';
import { Search, Filter, Zap, CheckCircle, AlertTriangle, ShieldX, Clock, ChevronRight } from 'lucide-react';

export default function TransactionTable({ 
  transactions, 
  totalCount, 
  onSelectTransaction, 
  selectedStatus, 
  onStatusChange, 
  searchQuery, 
  onSearchChange,
  isLoading 
}) {

  const getStatusBadge = (status) => {
    switch (status) {
      case 'recovered':
        return (
          <span className="badge badge-recovered">
            <CheckCircle className="w-3 h-3" /> Recovered
          </span>
        );
      case 'blocked_guardrail':
        return (
          <span className="badge badge-guardrail">
            <ShieldX className="w-3 h-3" /> Blocked Guardrail
          </span>
        );
      case 'failed_permanently':
        return (
          <span className="badge badge-failed">
            <AlertTriangle className="w-3 h-3" /> Permanent Fail
          </span>
        );
      case 'in_recovery':
        return (
          <span className="badge bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Zap className="w-3 h-3 animate-spin" /> In Recovery
          </span>
        );
      default:
        return (
          <span className="badge badge-pending">
            <Clock className="w-3 h-3" /> Pending Recovery
          </span>
        );
    }
  };

  const getReasonBadgeClass = (reason) => {
    switch (reason) {
      case 'network_error':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'expired_card':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'insufficient_funds':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      case 'authentication_failed':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'limit_exceeded':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-card p-6 mb-8">
      
      {/* Table Filter Controls Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white font-heading">Failed Payment Logs</h2>
          <p className="text-xs text-slate-400">Select any transaction to inspect AI telemetry & execute agent recovery</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              id="input-search"
              type="text" 
              placeholder="Search Txn ID or Customer..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-dark w-full pl-9 text-xs"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            {['all', 'failed', 'recovered', 'blocked_guardrail'].map((st) => (
              <button
                key={st}
                id={`filter-${st}`}
                onClick={() => onStatusChange(st)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  selectedStatus === st 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'blocked_guardrail' ? 'Guardrails' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] bg-slate-900/40">
              <th className="py-3 px-4 rounded-l-lg">Transaction & Customer</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Method & Country</th>
              <th className="py-3 px-4">Failure Reason</th>
              <th className="py-3 px-4">Recovery Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 rounded-r-lg text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 animate-spin text-emerald-400" />
                    <span>Loading payment telemetry...</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No matching payment transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => (
                <tr 
                  key={txn.transaction_id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectTransaction(txn)}
                >
                  {/* Txn ID & Customer */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {txn.transaction_id}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>{txn.customer_id}</span>
                      {txn.is_subscription && (
                        <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded text-[9px]">Sub</span>
                      )}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    {txn.currency} ${txn.amount.toFixed(2)}
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4">
                    <span className="capitalize text-slate-300 font-medium">{txn.payment_method.replace('_', ' ')}</span>
                    <span className="text-slate-500 text-[11px] block">{txn.country} • {txn.device_type}</span>
                  </td>

                  {/* Failure Reason */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] border font-medium inline-block capitalize ${getReasonBadgeClass(txn.failure_reason)}`}>
                      {txn.failure_reason.replace('_', ' ')}
                    </span>
                  </td>

                  {/* ML Score */}
                  <td className="py-3.5 px-4">
                    {txn.recovery_score !== null && txn.recovery_score !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${txn.recovery_score > 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {(txn.recovery_score * 100).toFixed(0)}%
                        </span>
                        <div className="w-12 bg-slate-800 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${txn.recovery_score > 0.5 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${txn.recovery_score * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">Unanalyzed</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {getStatusBadge(txn.final_status)}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(txn);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium inline-flex items-center gap-1 transition-all"
                    >
                      <span>Inspect Agent</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
