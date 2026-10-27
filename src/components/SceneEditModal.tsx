import React, { useState } from 'react';
import { X, Save, Clock, Film, Eye, Sparkles, Mic, MessageSquare, Camera, Music, Volume2, ArrowRightLeft } from 'lucide-react';
import { Scene, ShotType } from '../types/storyboard';

interface SceneEditModalProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedScene: Scene) => void;
}

export const SceneEditModal: React.FC<SceneEditModalProps> = ({
  scene,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(scene.title);
  const [duration, setDuration] = useState(scene.duration);
  const [shotType, setShotType] = useState<ShotType>(scene.shotType);
  const [visualDescription, setVisualDescription] = useState(scene.visualDescription);
  const [imagePrompt, setImagePrompt] = useState(scene.imagePrompt);
  const [voiceOver, setVoiceOver] = useState(scene.voiceOver || '');
  const [dialogue, setDialogue] = useState(scene.dialogue || '');
  const [cameraDirection, setCameraDirection] = useState(scene.cameraDirection);
  const [bgm, setBgm] = useState(scene.audioSuggestions.bgm);
  const [sfx, setSfx] = useState(scene.audioSuggestions.sfx);
  const [transition, setTransition] = useState(scene.transition);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...scene,
      title: title.trim() || `Scene ${scene.sceneNumber}`,
      duration: Math.max(1, Number(duration) || 3),
      shotType,
      visualDescription: visualDescription.trim(),
      imagePrompt: imagePrompt.trim(),
      voiceOver: voiceOver.trim() || undefined,
      dialogue: dialogue.trim() || undefined,
      cameraDirection: cameraDirection.trim(),
      audioSuggestions: {
        bgm: bgm.trim(),
        sfx: sfx.trim(),
      },
      transition: transition.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                #{scene.sceneNumber}
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Edit Scene #{scene.sceneNumber}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Refine scene timing, visuals, camera angles, and dialogue
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Row 1: Title, Duration, Shot Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-semibold text-slate-700 mb-1">Scene Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Duration (Seconds)</span>
              </label>
              <input
                type="number"
                min={1}
                max={300}
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1 font-semibold text-slate-700 mb-1">
                <Film className="w-3.5 h-3.5 text-purple-600" />
                <span>Shot Type</span>
              </label>
              <select
                value={shotType}
                onChange={(e) => setShotType(e.target.value as ShotType)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="Hook">Hook</option>
                <option value="Introduction">Introduction</option>
                <option value="Main Scene">Main Scene</option>
                <option value="Transition">Transition</option>
                <option value="Climax">Climax</option>
                <option value="Ending">Ending</option>
              </select>
            </div>
          </div>

          {/* Visual Description */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
              <Eye className="w-4 h-4 text-purple-600" />
              <span>Visual Description</span>
            </label>
            <textarea
              rows={3}
              value={visualDescription}
              onChange={(e) => setVisualDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Describe character actions, lighting, set details..."
              required
            />
          </div>

          {/* AI Image Generation Prompt */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold text-purple-900 mb-1">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Image Generation Prompt</span>
            </label>
            <textarea
              rows={2}
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              className="w-full p-2.5 bg-purple-50/40 border border-purple-200 rounded-lg text-purple-950 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Cinematic prompt for text-to-image models..."
              required
            />
          </div>

          {/* Voice-over & Dialogue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <Mic className="w-4 h-4 text-blue-600" />
                <span>Voice-Over / Narration</span>
              </label>
              <textarea
                rows={2}
                value={voiceOver}
                onChange={(e) => setVoiceOver(e.target.value)}
                placeholder="Narrator lines..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>On-Screen Dialogue</span>
              </label>
              <textarea
                rows={2}
                value={dialogue}
                onChange={(e) => setDialogue(e.target.value)}
                placeholder="Spoken character lines..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          {/* Technical Specs: Camera, Transition, Audio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <Camera className="w-4 h-4 text-slate-600" />
                <span>Camera Direction & Movement</span>
              </label>
              <input
                type="text"
                value={cameraDirection}
                onChange={(e) => setCameraDirection(e.target.value)}
                placeholder="e.g. Low angle slow zoom-in f/1.8"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <ArrowRightLeft className="w-4 h-4 text-slate-600" />
                <span>Transition to Next Scene</span>
              </label>
              <input
                type="text"
                value={transition}
                onChange={(e) => setTransition(e.target.value)}
                placeholder="e.g. Cut, Whip Pan, Dissolve"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <Music className="w-4 h-4 text-purple-600" />
                <span>Background Music (BGM)</span>
              </label>
              <input
                type="text"
                value={bgm}
                onChange={(e) => setBgm(e.target.value)}
                placeholder="e.g. Driving rhythmic synth beat"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>Sound Effects (SFX)</span>
              </label>
              <input
                type="text"
                value={sfx}
                onChange={(e) => setSfx(e.target.value)}
                placeholder="e.g. Metallic click, heartbeat whoosh"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
