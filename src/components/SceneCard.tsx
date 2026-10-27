import React, { useState } from 'react';
import {
  Camera,
  Music,
  Volume2,
  ArrowRightLeft,
  Sparkles,
  Copy,
  Check,
  Edit3,
  Trash2,
  CopyPlus,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Mic,
  Clock,
  Eye,
} from 'lucide-react';
import { Scene, ShotType } from '../types/storyboard';

interface SceneCardProps {
  scene: Scene;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (scene: Scene) => void;
  onDelete: (id: string) => void;
  onDuplicate: (scene: Scene) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRegenerate: (scene: Scene) => void;
  onUpdateDuration: (sceneId: string, newDuration: number) => void;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
  index: number;
}

export const getShotTypeBadgeColor = (type: ShotType) => {
  switch (type) {
    case 'Hook':
      return 'bg-amber-50 text-amber-700 border-amber-200/80';
    case 'Introduction':
      return 'bg-blue-50 text-blue-700 border-blue-200/80';
    case 'Main Scene':
      return 'bg-purple-50 text-purple-700 border-purple-200/80';
    case 'Transition':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200/80';
    case 'Climax':
      return 'bg-rose-50 text-rose-700 border-rose-200/80';
    case 'Ending':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const SceneCard: React.FC<SceneCardProps> = ({
  scene,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onRegenerate,
  onUpdateDuration,
  onShowToast,
  index,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(scene.imagePrompt);
      setCopiedPrompt(true);
      onShowToast('success', `Copied image prompt for Scene #${scene.sceneNumber}!`);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      onShowToast('error', 'Failed to copy prompt.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4 relative group">
      {/* Top Header: Scene Number, Shot Type, Duration, Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Scene Number Badge */}
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold shrink-0">
            #{scene.sceneNumber}
          </span>

          {/* Shot Type */}
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getShotTypeBadgeColor(
              scene.shotType
            )}`}
          >
            {scene.shotType}
          </span>

          {/* Timecode & Duration */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-xs text-slate-700 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {scene.startTime} - {scene.endTime}
            </span>
            <span className="text-slate-400">|</span>
            <div className="flex items-center gap-1 font-sans">
              <button
                type="button"
                onClick={() => onUpdateDuration(scene.id, Math.max(1, scene.duration - 1))}
                className="w-4 h-4 rounded hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
                title="Decrease duration by 1s"
                aria-label={`Decrease duration of Scene ${scene.sceneNumber} by 1 second`}
              >
                -
              </button>
              <span className="font-semibold">{scene.duration}s</span>
              <button
                type="button"
                onClick={() => onUpdateDuration(scene.id, scene.duration + 1)}
                className="w-4 h-4 rounded hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs"
                title="Increase duration by 1s"
                aria-label={`Increase duration of Scene ${scene.sceneNumber} by 1 second`}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar Actions */}
        <div className="flex items-center gap-1">
          {/* Move Up */}
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={isFirst}
            className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
              isFirst ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Move scene up"
            aria-label={`Move Scene ${scene.sceneNumber} up`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={isLast}
            className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ${
              isLast ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Move scene down"
            aria-label={`Move Scene ${scene.sceneNumber} down`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          {/* Regenerate single scene */}
          <button
            type="button"
            onClick={() => onRegenerate(scene)}
            className="p-1.5 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors"
            title="Regenerate this scene with AI"
            aria-label={`Regenerate Scene ${scene.sceneNumber} with AI`}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Duplicate Scene */}
          <button
            type="button"
            onClick={() => onDuplicate(scene)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Duplicate scene"
            aria-label={`Duplicate Scene ${scene.sceneNumber}`}
          >
            <CopyPlus className="w-4 h-4" />
          </button>

          {/* Edit Scene Modal */}
          <button
            type="button"
            onClick={() => onEdit(scene)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Edit scene details"
            aria-label={`Edit Scene ${scene.sceneNumber}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete Scene */}
          <button
            type="button"
            onClick={() => onDelete(scene.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete scene"
            aria-label={`Delete Scene ${scene.sceneNumber}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {scene.title}
        </h3>
      </div>

      {/* Visual Description */}
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          <Eye className="w-3.5 h-3.5 text-purple-600" />
          <span>Visual Description</span>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed">
          {scene.visualDescription}
        </p>
      </div>

      {/* AI Image Generation Prompt */}
      <div className="bg-purple-50/40 p-3.5 rounded-xl border border-purple-100">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Image Prompt</span>
          </div>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-white/80 px-2 py-0.5 rounded-md border border-purple-200 transition-colors"
          >
            {copiedPrompt ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
          </button>
        </div>
        <p className="text-xs text-purple-950 font-mono leading-relaxed select-all">
          "{scene.imagePrompt}"
        </p>
      </div>

      {/* Dialogue or Voice-over */}
      {(scene.voiceOver || scene.dialogue) && (
        <div className="space-y-2">
          {scene.voiceOver && (
            <div className="p-3 rounded-xl bg-blue-50/40 border border-blue-100 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs uppercase tracking-wider mb-1">
                <Mic className="w-3.5 h-3.5 text-blue-600" />
                <span>Voice-Over / Narration</span>
              </div>
              <p className="italic text-slate-800 leading-relaxed font-serif">
                "{scene.voiceOver}"
              </p>
            </div>
          )}

          {scene.dialogue && (
            <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-100 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs uppercase tracking-wider mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Dialogue</span>
              </div>
              <p className="italic text-slate-800 leading-relaxed font-serif">
                "{scene.dialogue}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Technical Film Tags: Camera, Transition, Audio SFX & BGM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
        {/* Camera Direction */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
          <Camera className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-600 block text-[11px] uppercase">Camera</span>
            <span className="text-slate-800">{scene.cameraDirection}</span>
          </div>
        </div>

        {/* Transition */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
          <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-600 block text-[11px] uppercase">Transition</span>
            <span className="text-slate-800">{scene.transition}</span>
          </div>
        </div>

        {/* BGM */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
          <Music className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-600 block text-[11px] uppercase">Music (BGM)</span>
            <span className="text-slate-800">{scene.audioSuggestions.bgm}</span>
          </div>
        </div>

        {/* SFX */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
          <Volume2 className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-semibold text-slate-600 block text-[11px] uppercase">Sound Effects</span>
            <span className="text-slate-800">{scene.audioSuggestions.sfx}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
