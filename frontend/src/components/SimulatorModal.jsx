import React, { useState } from 'react';
import { X, PlusCircle, Zap, DollarSign, CreditCard, AlertCircle } from 'lucide-react';

export default function SimulatorModal({ onClose, onSimulated }) {
  const [amount, setAmount] = useState('129.99');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [failureReason, setFailureReason] = useState('network_error');
  const [isSubscription, setIsSubscription] = useState(true);
  const [tenureDays, setTenureDays] = useState('180');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          failure_reason: failureReason,
          is_subscription: isSubscription,
          customer_tenure_days: parseInt(tenureDays, 10)
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Immediately trigger AI Agent workflow on newly simulated transaction!
        await fetch(`/api/recover/${data.transaction_id}`, { method: 'POST' });
        onSimulated(data.transaction_id);
        onClose();
      }
    } catch (err) {
      console.error("Error simulating payment failure:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-lg overflow-hidden border border-white/15 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">Simulate Live Payment Failure</h3>
              <p className="text-xs text-slate-400">Generate a custom failed transaction to test instant AI recovery</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-obsidian">
          
          {/* Amount & Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Transaction Amount ($)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                id="sim-amount"
                type="number" 
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-dark w-full pl-9 text-xs"
                placeholder="e.g. 129.99"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
            <select 
              id="sim-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input-dark w-full text-xs"
            >
              <option value="credit_card">Credit Card (Visa / Mastercard)</option>
              <option value="debit_card">Debit Card</option>
              <option value="upi">UPI (Google Pay / PhonePe)</option>
              <option value="net_banking">Net Banking</option>
              <option value="ach">ACH Direct Debit</option>
            </select>
          </div>

          {/* Failure Reason Telemetry */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Simulated Failure Telemetry Code</label>
            <select 
              id="sim-reason"
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="input-dark w-full text-xs"
            >
              <option value="network_error">network_error (Gateway Timeout - Soft Decline)</option>
              <option value="expired_card">expired_card (Hard Decline - Card Expired)</option>
              <option value="insufficient_funds">insufficient_funds (Balance Deficit)</option>
              <option value="authentication_failed">authentication_failed (3DS OTP Challenge Timeout)</option>
              <option value="limit_exceeded">limit_exceeded (Daily Spend Cap Exceeded)</option>
              <option value="bank_declined">bank_declined (Issuing Bank Block)</option>
            </select>
          </div>

          {/* Customer Tenure & Subscription toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Tenure (Days)</label>
              <input 
                id="sim-tenure"
                type="number"
                value={tenureDays}
                onChange={(e) => setTenureDays(e.target.value)}
                className="input-dark w-full text-xs"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800">
                <input 
                  type="checkbox"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                  className="rounded text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-xs font-medium text-slate-200">Subscription Invoice</span>
              </label>
            </div>
          </div>

          {/* Notice Banner */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
            <Zap className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>Upon submission, the AI Agent will immediately run Diagnostics, Guardrail checks, Strategy formulation, and Webhook dispatch!</span>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary text-xs">
              Cancel
            </button>
            <button 
              id="sim-submit"
              type="submit" 
              disabled={isSubmitting}
              className="btn-primary text-xs"
            >
              <Zap className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>{isSubmitting ? 'Processing Simulation...' : 'Simulate & Intercept with AI'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
