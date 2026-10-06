import React from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

/**
 * SecurityIndicator — Compact status pill shown in the call header bar.
 *
 * Accepts an `analysisResult` prop (conforming to RiskEngine.ANALYSIS_RESULT_SCHEMA).
 * When `analysisResult` is null/undefined, displays "Security Analysis Waiting".
 *
 * Phase 2 Integration:
 *   Pass real-time results from RiskEngine.computeRisk() into the `analysisResult` prop.
 */
export default function SecurityIndicator({ analysisResult = null }) {
  const getConfig = () => {
    if (!analysisResult || analysisResult.securityStatus === 'unknown') {
      return {
        label: 'Security Analysis Waiting',
        icon: <Clock className="w-3.5 h-3.5" />,
        className: 'bg-slate-100 text-slate-600 border-slate-200'
      };
    }

    switch (analysisResult.securityStatus) {
      case 'processing':
        return {
          label: 'Analyzing...',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'secure':
        return {
          label: 'Secure',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'warning':
        return {
          label: 'Warning Detected',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'critical':
        return {
          label: 'Critical Risk',
          icon: <XCircle className="w-3.5 h-3.5" />,
          className: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      default:
        return {
          label: 'Security Analysis Waiting',
          icon: <Clock className="w-3.5 h-3.5" />,
          className: 'bg-slate-100 text-slate-600 border-slate-200'
        };
    }
  };

  const { label, icon, className } = getConfig();

  return (
    <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${className}`}>
      <Shield className="w-3 h-3 opacity-70" />
      {icon}
      <span>{label}</span>
    </div>
  );
}
