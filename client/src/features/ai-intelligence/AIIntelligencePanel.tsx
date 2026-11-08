import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { LeadAnalysis } from '../../types';
import {
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface AIIntelligencePanelProps {
  leadId: string;
  initialAnalysis?: LeadAnalysis | null;
}

export const AIIntelligencePanel: React.FC<AIIntelligencePanelProps> = ({
  leadId,
  initialAnalysis,
}) => {
  const queryClient = useQueryClient();
  const [analysis, setAnalysis] = useState<LeadAnalysis | null>(initialAnalysis || null);
  const [copied, setCopied] = useState(false);

  // Sync state if initialAnalysis changes from parent query
  React.useEffect(() => {
    if (initialAnalysis) {
      setAnalysis(initialAnalysis);
    }
  }, [initialAnalysis]);

  const mutation = useMutation({
    mutationFn: () => api.analyzeLead(leadId),
    onSuccess: (data) => {
      setAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const handleCopyEmail = () => {
    if (!analysis?.followUpMessage) return;
    const text = `Subject: ${analysis.followUpMessage.subject}\n\n${analysis.followUpMessage.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <Card className="border-indigo-100/80 bg-gradient-to-b from-indigo-50/20 via-white to-white overflow-hidden shadow-sm">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-indigo-100/60 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI Lead Intelligence
              </h3>
              {analysis && (
                <Badge
                  variant={analysis.provider === 'gemini' ? 'info' : 'warning'}
                  className="text-[10px] uppercase font-semibold"
                >
                  {analysis.provider === 'gemini' ? (analysis.model || 'Gemini') : 'Demo / Mock AI'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded, objective conversion scoring & contextual sales guidance
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={analysis ? 'outline' : 'primary'}
          onClick={() => mutation.mutate()}
          isLoading={mutation.isPending}
          icon={analysis ? <RotateCcw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
        >
          {analysis ? 'Re-analyze Lead' : 'Generate AI Assessment'}
        </Button>
      </div>

      {mutation.isError && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {(mutation.error as Error).message ||
              'Failed to generate AI intelligence. Please try again.'}
          </span>
        </div>
      )}

      {mutation.isPending && (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
            <Sparkles className="h-5 w-5 text-indigo-600 absolute inset-0 m-auto" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Analyzing lead profile & interaction logs...
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Synthesizing historical touchpoints and overdue milestones
            </p>
          </div>
        </div>
      )}

      {!mutation.isPending && !analysis && (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-500">
            No intelligence assessment has been run for this lead yet.
          </p>
          <Button
            size="sm"
            onClick={() => mutation.mutate()}
            className="mt-3"
            icon={<Sparkles className="h-4 w-4" />}
          >
            Run Intelligence Analysis
          </Button>
        </div>
      )}

      {!mutation.isPending && analysis && (
        <div className="mt-5 space-y-5">
          {/* Key Metrics: Score & Probability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Score */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Lead Health Score
                </span>
                <span className="text-xs text-slate-400">Scale 1–100</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-3xl font-extrabold px-3 py-1 rounded-lg border',
                    getScoreColor(analysis.score)
                  )}
                >
                  {analysis.score}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Calculated from stage velocity, deal value, and responsiveness.
              </p>
            </div>

            {/* Estimated Conversion Probability */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  Est. Conversion Probability
                  <span title="Estimated statistical projection, not a guaranteed outcome." className="cursor-help">
                    <Info className="h-3 w-3 text-slate-400" />
                  </span>
                </span>
                <Badge variant="outline" className="text-[10px] font-normal">
                  Estimate
                </Badge>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-blue-600">
                  {analysis.conversionProbability}%
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-400 italic">
                *Statistical estimation based on available CRM data; not a guaranteed outcome.
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Executive Summary
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Key Signals */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
              Key Signals & Observations
            </h4>
            <ul className="space-y-1.5">
              {analysis.keySignals.map((signal, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Best Action */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Recommended Next Best Action
            </h4>
            <p className="text-xs text-blue-950 font-medium leading-relaxed">
              {analysis.nextBestAction}
            </p>
          </div>

          {/* Personalized Follow-up Message */}
          {analysis.followUpMessage && (
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Suggested Follow-up Email Draft
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyEmail}
                  icon={
                    copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {copied ? 'Copied!' : 'Copy Email'}
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Subject: </span>
                  <span className="text-slate-900 font-semibold">
                    {analysis.followUpMessage.subject}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap font-sans text-xs border border-slate-100">
                  {analysis.followUpMessage.body}
                </div>
              </div>
            </div>
          )}

          {/* Data Limitations Disclosure */}
          {analysis.limitations && analysis.limitations.length > 0 && (
            <div className="text-[11px] text-slate-500 bg-amber-50/60 border border-amber-200/40 p-3 rounded-lg space-y-1">
              <span className="font-semibold text-amber-800">Uncertainty & Data Gaps:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                {analysis.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Provider / Model meta footer */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
            <span>
              Generated: {new Date(analysis.createdAt).toLocaleDateString()} at{' '}
              {new Date(analysis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="font-mono text-[10px]">Model: {analysis.model}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
