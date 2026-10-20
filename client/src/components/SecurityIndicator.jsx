import React from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

/**
 * SecurityIndicator — Compact status pill shown in the call header bar.
 *
 * Reflects real live face detection state from MediaPipe and analysis loop.
 */
export default function SecurityIndicator({
  analysisResult = null,
  faceData = null,
  analysisState = 'inconclusive'
}) {
  const getConfig = () => {
    if (analysisState === 'analyzing') {
      return {
        label: 'Analyzing...',
        icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
        className: 'bg-blue-50 text-blue-700 border-blue-200'
      };
    }

    if (analysisState === 'unavailable') {
      return {
        label: 'AI Offline',
        icon: <XCircle className="w-3.5 h-3.5" />,
        className: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    }

    if (faceData) {
      if (faceData.face_detected) {
        return {
          label: `Face Detected (${faceData.face_count})`,
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      } else {
        return {
          label: 'No Face Detected',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      }
    }

    if (analysisResult?.securityStatus) {
      switch (analysisResult.securityStatus) {
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
          break;
      }
    }

    return {
      label: 'Security Analysis Waiting',
      icon: <Clock className="w-3.5 h-3.5" />,
      className: 'bg-slate-100 text-slate-600 border-slate-200'
    };
  };

  const { label, icon, className } = getConfig();

  return (
    <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${className} transition-colors`}>
      <Shield className="w-3 h-3 opacity-70" />
      {icon}
      <span>{label}</span>
    </div>
  );
}
