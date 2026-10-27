import React from 'react';
import { Scene } from '../types/storyboard';
import { getShotTypeBadgeColor } from './SceneCard';
import { Edit3, Trash2, Sparkles, CopyPlus, ArrowUp, ArrowDown, Clock, Eye, Mic } from 'lucide-react';

interface StoryboardTableProps {
  scenes: Scene[];
  onEdit: (scene: Scene) => void;
  onDelete: (id: string) => void;
  onDuplicate: (scene: Scene) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRegenerate: (scene: Scene) => void;
  onUpdateDuration: (sceneId: string, newDuration: number) => void;
}

export const StoryboardTable: React.FC<StoryboardTableProps> = ({
  scenes,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onRegenerate,
  onUpdateDuration,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 w-36">Shot & Timing</th>
              <th className="py-3 px-4 min-w-[240px]">Visual & Prompt</th>
              <th className="py-3 px-4 min-w-[200px]">Audio & Dialogue</th>
              <th className="py-3 px-4 min-w-[160px]">Camera & Move</th>
              <th className="py-3 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {scenes.map((scene, index) => (
              <tr key={scene.id} className="hover:bg-slate-50/60 transition-colors">
                {/* Scene # */}
                <td className="py-3.5 px-4 text-center align-top font-bold text-slate-800">
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs mx-auto">
                    {scene.sceneNumber}
                  </div>
                </td>

                {/* Shot & Timing */}
                <td className="py-3.5 px-4 align-top space-y-1.5">
                  <div className="font-bold text-slate-900 leading-tight">
                    {scene.title}
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getShotTypeBadgeColor(
                        scene.shotType
                      )}`}
                    >
                      {scene.shotType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-slate-600 text-xs">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{scene.startTime} - {scene.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onUpdateDuration(scene.id, Math.max(1, scene.duration - 1))}
                      className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]"
                      aria-label={`Decrease duration of Scene ${scene.sceneNumber}`}
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{scene.duration}s</span>
                    <button
                      type="button"
                      onClick={() => onUpdateDuration(scene.id, scene.duration + 1)}
                      className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]"
                      aria-label={`Increase duration of Scene ${scene.sceneNumber}`}
                    >
                      +
                    </button>
                  </div>
                </td>

                {/* Visual Description & Image Prompt */}
                <td className="py-3.5 px-4 align-top space-y-2">
                  <div className="text-slate-800 leading-relaxed text-xs">
                    {scene.visualDescription}
                  </div>
                  <div className="p-2 rounded bg-purple-50/50 border border-purple-100 text-[11px] text-purple-900 font-mono">
                    <span className="font-bold text-purple-700 uppercase block text-[9px]">AI Prompt:</span>
                    "{scene.imagePrompt}"
                  </div>
                </td>

                {/* Audio & Dialogue */}
                <td className="py-3.5 px-4 align-top space-y-1.5 text-xs">
                  {scene.voiceOver && (
                    <div className="text-blue-900">
                      <span className="font-semibold text-blue-700 uppercase text-[10px] block">Voice-Over:</span>
                      <p className="italic font-serif">"{scene.voiceOver}"</p>
                    </div>
                  )}
                  {scene.dialogue && (
                    <div className="text-amber-900">
                      <span className="font-semibold text-amber-700 uppercase text-[10px] block">Dialogue:</span>
                      <p className="italic font-serif">"{scene.dialogue}"</p>
                    </div>
                  )}
                  <div className="text-slate-600 text-[11px]">
                    <span className="font-semibold">BGM:</span> {scene.audioSuggestions.bgm}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <span className="font-semibold">SFX:</span> {scene.audioSuggestions.sfx}
                  </div>
                </td>

                {/* Camera & Transition */}
                <td className="py-3.5 px-4 align-top space-y-1 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Camera:</span>
                    <span className="text-slate-800 font-medium">{scene.cameraDirection}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Transition:</span>
                    <span className="text-slate-800 font-medium">{scene.transition}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 align-top text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-900 disabled:opacity-20"
                      title="Move Up"
                      aria-label={`Move Scene ${scene.sceneNumber} Up`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveDown(index)}
                      disabled={index === scenes.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-900 disabled:opacity-20"
                      title="Move Down"
                      aria-label={`Move Scene ${scene.sceneNumber} Down`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRegenerate(scene)}
                      className="p-1 rounded text-purple-600 hover:bg-purple-50"
                      title="Regenerate with AI"
                      aria-label={`Regenerate Scene ${scene.sceneNumber}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicate(scene)}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100"
                      title="Duplicate"
                      aria-label={`Duplicate Scene ${scene.sceneNumber}`}
                    >
                      <CopyPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(scene)}
                      className="p-1 rounded text-slate-500 hover:bg-slate-100"
                      title="Edit"
                      aria-label={`Edit Scene ${scene.sceneNumber}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(scene.id)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50"
                      title="Delete"
                      aria-label={`Delete Scene ${scene.sceneNumber}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
