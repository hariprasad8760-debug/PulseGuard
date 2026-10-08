import React, { useState } from 'react';
import {
  Shield, Eye, Cpu, Activity, Brain, ChevronDown, ChevronUp, Info
} from 'lucide-react';

/**
 * SecurityPanel — Right-side AI security dashboard shown during active calls.
 *
 * Phase 2 Integration:
 *   Pass real-time `analysisResult` from RiskEngine.computeRisk() into this component.
 *   The panel will automatically display live scores when they are available.
 *
 * Expected `analysisResult` shape (from ai/RiskEngine.js ANALYSIS_RESULT_SCHEMA):
 *   {
 *     liveness: number | null,
 *     deepfakeRisk: number | null,
 *     rppgConfidence: number | null,
 *     faceConfidence: number | null,
 *     temporalConsistency: number | null,
 *     overallRisk: number | null,
 *     securityStatus: 'secure'|'warning'|'critical'|'unknown',
 *     flags: Array<string>
 *   }
 */

function MetricRow({ icon: Icon, label, value, description }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center space-x-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-deepsea-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-deepsea-700 dark:text-sky-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{label}</p>
          {description && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{description}</p>
          )}
        </div>
      </div>
      <div className="ml-2 shrink-0">
        {value === null || value === undefined ? (
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Not analyzed
          </span>
        ) : typeof value === 'number' ? (
          <div className="text-right">
            <span className={`text-xs font-bold ${
              value >= 0.8 ? 'text-emerald-600 dark:text-emerald-400' :
              value >= 0.5 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {Math.round(value * 100)}%
            </span>
          </div>
        ) : (
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {value}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SecurityPanel({ analysisResult = null, isCollapsible = false }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const hasResults = analysisResult && analysisResult.securityStatus !== 'unknown';

  const overallStatusConfig = () => {
    if (!hasResults) return { label: 'AI analysis not started', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800' };
    switch (analysisResult.securityStatus) {
      case 'secure': return { label: 'No significant risk detected', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900' };
      case 'warning': return { label: 'Potential risk detected', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900' };
      case 'critical': return { label: 'High-risk signal detected', color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900' };
      default: return { label: 'AI analysis not started', color: 'text-slate-500 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800' };
    }
  };
  const statusConfig = overallStatusConfig();

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-y-auto">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-deepsea-900 dark:bg-deepsea-800 flex items-center justify-center">
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-deepsea-900 dark:text-white">PulseGuard Security</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">AI Analysis Dashboard</p>
          </div>
        </div>
        {isCollapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex-1 p-4 space-y-4">
          {/* Coming Soon Notice */}
          <div className="bg-deepsea-50/70 dark:bg-slate-800/70 border border-deepsea-200/60 dark:border-slate-700 rounded-xl p-3 flex items-start space-x-2">
            <Info className="w-4 h-4 text-deepsea-700 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-deepsea-900 dark:text-white">AI Security Module</p>
              <p className="text-[10px] text-deepsea-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                AI analysis capabilities are under active development and will be activated in the next release.
              </p>
            </div>
          </div>

          {/* Analysis Metrics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1">
            <MetricRow
              icon={Eye}
              label="Liveness"
              value={analysisResult?.liveness ?? null}
              description="Live presence verification"
            />
            <MetricRow
              icon={Brain}
              label="Deepfake Risk"
              value={analysisResult?.deepfakeRisk ?? null}
              description="AI manipulation detection"
            />
            <MetricRow
              icon={Activity}
              label="Physiological Signal"
              value={analysisResult?.rppgConfidence ?? null}
              description="rPPG biometric analysis"
            />
            <MetricRow
              icon={Cpu}
              label="Facial Behavior"
              value={analysisResult?.faceConfidence ?? null}
              description="Landmark consistency"
            />
          </div>

          {/* Overall Status */}
          <div className={`rounded-xl border p-3 ${statusConfig.bg}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Overall Security Status</p>
            <p className={`text-sm font-bold ${statusConfig.color}`}>
              {statusConfig.label}
            </p>
            {analysisResult?.flags?.length > 0 && (
              <div className="mt-2 space-y-1">
                {analysisResult.flags.map((flag, i) => (
                  <div key={i} className="text-[10px] text-rose-700 dark:text-rose-400 flex items-center space-x-1">
                    <span className="w-1 h-1 rounded-full bg-rose-500 inline-block" />
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed px-1">
            AI analysis values shown here represent real-time module outputs. No fabricated detection results are generated.
          </p>
        </div>
      )}
    </div>
  );
}
