import React from 'react';
import { Printer, ArrowLeft, Clapperboard, Clock, Eye, Sparkles, Mic, MessageSquare, Camera } from 'lucide-react';
import { StoryboardProject } from '../types/storyboard';
import { getShotTypeBadgeColor } from './SceneCard';

interface PrintableViewProps {
  project: StoryboardProject;
  onExit: () => void;
}

export const PrintableView: React.FC<PrintableViewProps> = ({ project, onExit }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 sm:p-10 max-w-5xl mx-auto">
      {/* Floating Print Navigation Bar (hidden in actual printout) */}
      <div className="no-print sticky top-4 z-50 mb-8 p-4 rounded-2xl bg-slate-900 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Studio</span>
          </button>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Print Preview Mode (Styles optimized for standard paper / PDF)
          </span>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Document Header */}
      <div className="border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Clapperboard className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Video Idea Story Analyzer AI • Official Storyboard Script
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          {project.projectTitle}
        </h1>

        {/* Spec Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Format</span>
            <span className="font-semibold text-slate-900">{project.videoFormat}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Duration</span>
            <span className="font-semibold text-slate-900 font-mono">
              {project.totalCalculatedDuration}s (Target: {project.targetDuration}s)
            </span>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Ratio & Tone</span>
            <span className="font-semibold text-slate-900">{project.aspectRatio} • {project.tone}</span>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-bold text-[10px] block">Audience</span>
            <span className="font-semibold text-slate-900 truncate block">{project.targetAudience}</span>
          </div>
        </div>

        {/* Narrative premise */}
        <div className="mt-4 space-y-2 text-xs sm:text-sm">
          <p>
            <strong className="text-slate-900">Original Idea:</strong> {project.originalIdea}
          </p>
          <p>
            <strong className="text-purple-700">Core Hook:</strong> {project.hook}
          </p>
          <p>
            <strong className="text-slate-900">Summary:</strong> {project.storySummary}
          </p>
        </div>
      </div>

      {/* Scene-by-Scene Breakdown */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">
          Scene Breakdown ({project.scenes.length} Scenes)
        </h2>

        {project.scenes.map((scene) => (
          <div
            key={scene.id}
            className="page-break-inside-avoid p-5 rounded-xl border border-slate-300 bg-white space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  #{scene.sceneNumber}
                </span>
                <span className="font-bold text-base text-slate-900">{scene.title}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getShotTypeBadgeColor(
                    scene.shotType
                  )}`}
                >
                  {scene.shotType}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-700">
                {scene.startTime} - {scene.endTime} ({scene.duration}s)
              </span>
            </div>

            {/* Visual Description */}
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Visual:</span>
              <p className="text-slate-800 leading-relaxed">{scene.visualDescription}</p>
            </div>

            {/* AI Image Generation Prompt */}
            <div className="p-2.5 rounded bg-purple-50/60 border border-purple-200 text-xs text-purple-950 font-mono">
              <span className="font-bold uppercase text-[9px] block text-purple-700">Image Generation Prompt:</span>
              "{scene.imagePrompt}"
            </div>

            {/* Voice-Over / Dialogue */}
            {(scene.voiceOver || scene.dialogue) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {scene.voiceOver && (
                  <div className="p-2 rounded bg-blue-50/50 border border-blue-100">
                    <span className="font-bold text-blue-900 text-[10px] uppercase block">Voice-Over:</span>
                    <p className="italic font-serif">"{scene.voiceOver}"</p>
                  </div>
                )}
                {scene.dialogue && (
                  <div className="p-2 rounded bg-amber-50/50 border border-amber-100">
                    <span className="font-bold text-amber-900 text-[10px] uppercase block">Dialogue:</span>
                    <p className="italic font-serif">"{scene.dialogue}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Production notes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
              <div>
                <span className="font-bold uppercase text-[9px] text-slate-400 block">Camera</span>
                <span>{scene.cameraDirection}</span>
              </div>
              <div>
                <span className="font-bold uppercase text-[9px] text-slate-400 block">Transition</span>
                <span>{scene.transition}</span>
              </div>
              <div>
                <span className="font-bold uppercase text-[9px] text-slate-400 block">BGM</span>
                <span>{scene.audioSuggestions.bgm}</span>
              </div>
              <div>
                <span className="font-bold uppercase text-[9px] text-slate-400 block">SFX</span>
                <span>{scene.audioSuggestions.sfx}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Analysis Report */}
      {project.analysis && (
        <div className="page-break-inside-avoid mt-10 pt-6 border-t-2 border-slate-900 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            AI Story Analysis & Quality Audit
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Hook Strength</span>
              <span className="text-lg font-bold text-purple-700">
                {project.analysis.scores.hookStrength.score}/10
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Clarity</span>
              <span className="text-lg font-bold text-blue-700">
                {project.analysis.scores.narrativeClarity.score}/10
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Engagement</span>
              <span className="text-lg font-bold text-emerald-700">
                {project.analysis.scores.audienceEngagement.score}/10
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 uppercase text-[10px] font-bold block">Consistency</span>
              <span className="text-lg font-bold text-indigo-700">
                {project.analysis.scores.visualConsistency.score}/10
              </span>
            </div>
          </div>

          <div className="text-xs space-y-2 pt-2">
            <div>
              <strong className="text-slate-900">Recommendations:</strong>
              <ol className="list-decimal pl-4 mt-1 space-y-1 text-slate-700">
                {project.analysis.improvementSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
