import React, { useState } from 'react';
import { X, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Scene } from '../types/storyboard';

interface RegenerateSceneModalProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRegenerate: (guidance: string) => Promise<void>;
  isRegenerating: boolean;
}

const QUICK_PRESETS = [
  'Make the visual more dramatic and cinematic',
  'Increase the pacing and tension',
  'Add punchier, emotional voice-over',
  'Focus closely on product craftsmanship',
  'Add unexpected visual contrast',
];

export const RegenerateSceneModal: React.FC<RegenerateSceneModalProps> = ({
  scene,
  isOpen,
  onClose,
  onConfirmRegenerate,
  isRegenerating,
}) => {
  if (!isOpen) return null;

  const [guidance, setGuidance] = useState('');

  const handlePresetClick = (preset: string) => {
    setGuidance((prev) => (prev ? `${prev}. ${preset}` : preset));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmRegenerate(guidance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-purple-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Regenerate Scene #{scene.sceneNumber}
              </h3>
              <p className="text-xs text-slate-500">
                "{scene.title}" ({scene.duration}s)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isRegenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Director Instructions for AI (Optional)
            </label>
            <textarea
              rows={3}
              value={guidance}
              onChange={(e) => setGuidance(e.target.value)}
              placeholder="e.g. Make this scene more cinematic and mysterious. Focus on the camera movement..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              disabled={isRegenerating}
            />
          </div>

          <div>
            <span className="block text-slate-500 font-semibold mb-2 text-[11px] uppercase tracking-wider">
              Quick Suggestions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(p)}
                  disabled={isRegenerating}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 text-xs transition-colors"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isRegenerating}
              className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRegenerating}
              className={`px-5 py-2 rounded-xl font-bold text-white flex items-center gap-2 ${
                isRegenerating
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 cursor-pointer'
              }`}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Regenerate Scene</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
