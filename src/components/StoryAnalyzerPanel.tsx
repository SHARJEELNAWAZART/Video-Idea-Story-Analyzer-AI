import React from 'react';
import {
  Sparkles,
  Target,
  Users,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Info,
  Flame,
  BookOpen,
  Activity,
  Palette,
} from 'lucide-react';
import { StoryboardProject } from '../types/storyboard';

interface StoryAnalyzerPanelProps {
  project: StoryboardProject;
  onApplySuggestionPrompt?: (suggestion: string) => void;
}

export const StoryAnalyzerPanel: React.FC<StoryAnalyzerPanelProps> = ({ project }) => {
  const { analysis } = project;

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center text-slate-500">
        <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" />
        <p className="text-sm">Analysis pending or not generated for this project.</p>
      </div>
    );
  }

  const { scores } = analysis;

  const getScoreColor = (score: number) => {
    if (score >= 9.0) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 7.5) return 'text-purple-600 bg-purple-50 border-purple-200';
    if (score >= 6.0) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getScoreProgressBar = (score: number) => {
    const pct = Math.min(100, Math.max(0, (score / 10) * 100));
    return (
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 9.0
              ? 'bg-emerald-500'
              : score >= 7.5
              ? 'bg-purple-600'
              : score >= 6.0
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Disclaimer */}
      <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-purple-950">
          <strong className="font-bold">Narrative Analysis & Quality Audit:</strong> Evaluated using film and commercial pacing benchmarks. Scores and suggestions are AI-assisted estimates to strengthen your screenplay, not guaranteed real-world audience metrics.
        </div>
      </div>

      {/* 4 Core Metric Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hook Strength */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Hook Strength</span>
              </span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded-full border ${getScoreColor(
                  scores.hookStrength.score
                )}`}
              >
                {scores.hookStrength.score.toFixed(1)}/10
              </span>
            </div>
            {getScoreProgressBar(scores.hookStrength.score)}
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              {scores.hookStrength.explanation}
            </p>
          </div>
        </div>

        {/* Narrative Clarity */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span>Narrative Clarity</span>
              </span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded-full border ${getScoreColor(
                  scores.narrativeClarity.score
                )}`}
              >
                {scores.narrativeClarity.score.toFixed(1)}/10
              </span>
            </div>
            {getScoreProgressBar(scores.narrativeClarity.score)}
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              {scores.narrativeClarity.explanation}
            </p>
          </div>
        </div>

        {/* Engagement Potential */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>Engagement Potential</span>
              </span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded-full border ${getScoreColor(
                  scores.audienceEngagement.score
                )}`}
              >
                {scores.audienceEngagement.score.toFixed(1)}/10
              </span>
            </div>
            {getScoreProgressBar(scores.audienceEngagement.score)}
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              {scores.audienceEngagement.explanation}
            </p>
          </div>
        </div>

        {/* Visual Consistency */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-emerald-500" />
                <span>Visual Consistency</span>
              </span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded-full border ${getScoreColor(
                  scores.visualConsistency.score
                )}`}
              >
                {scores.visualConsistency.score.toFixed(1)}/10
              </span>
            </div>
            {getScoreProgressBar(scores.visualConsistency.score)}
            <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
              {scores.visualConsistency.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Story Architecture & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Story Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Story Summary</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed font-serif">
            "{analysis.storySummary || project.storySummary}"
          </p>
        </div>

        {/* Main Objective */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span>Main Objective</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed">
            {analysis.mainObjective || project.mainMessage}
          </p>
        </div>

        {/* Target Audience & Structure */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Target Audience</span>
            </div>
            <p className="text-xs text-slate-800 font-medium">
              {analysis.targetAudience || project.targetAudience}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Structure Arc
            </span>
            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs">
              {analysis.storyStructure}
            </span>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Identified Strengths</span>
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Risks */}
        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Narrative Risks & Challenges</span>
          </h3>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3 Actionable Suggestions */}
      <div className="bg-white rounded-2xl border border-purple-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              3 Specific Storyboard Improvements
            </h3>
            <p className="text-xs text-slate-500">
              High-impact recommendations to elevate audience retention and production polish
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {analysis.improvementSuggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs mb-2">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {suggestion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Potential Production Problems & Logistical Hurdles */}
      {analysis.productionProblems && analysis.productionProblems.length > 0 && (
        <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider mb-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Missing Information & Potential Production Hurdles</span>
          </div>
          <ul className="space-y-1.5">
            {analysis.productionProblems.map((prob, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-rose-950">
                <span className="text-rose-500 font-bold">•</span>
                <span>{prob}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
