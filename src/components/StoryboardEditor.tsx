import React, { useState } from 'react';
import {
  LayoutGrid,
  Table as TableIcon,
  Plus,
  RefreshCw,
  Clock,
  Layers,
  Filter,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Scene, ShotType, StoryboardProject } from '../types/storyboard';
import { SceneCard } from './SceneCard';
import { StoryboardTable } from './StoryboardTable';

interface StoryboardEditorProps {
  project: StoryboardProject;
  onEditScene: (scene: Scene) => void;
  onDeleteScene: (id: string) => void;
  onDuplicateScene: (scene: Scene) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onAddNewScene: () => void;
  onRegenerateScene: (scene: Scene) => void;
  onUpdateDuration: (sceneId: string, newDuration: number) => void;
  onRecalculateTimings: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const StoryboardEditor: React.FC<StoryboardEditorProps> = ({
  project,
  onEditScene,
  onDeleteScene,
  onDuplicateScene,
  onMoveUp,
  onMoveDown,
  onAddNewScene,
  onRegenerateScene,
  onUpdateDuration,
  onRecalculateTimings,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [shotFilter, setShotFilter] = useState<string>('all');

  const filteredScenes =
    shotFilter === 'all'
      ? project.scenes
      : project.scenes.filter((s) => s.shotType === shotFilter);

  const durationDiff = project.totalCalculatedDuration - project.targetDuration;
  const isDurationExact = Math.abs(durationDiff) <= 1;
  const isDurationClose = Math.abs(durationDiff) <= 3;

  return (
    <div className="space-y-4">
      {/* Top Storyboard Header & Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Scene-by-Scene Storyboard
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              {project.scenes.length} Scenes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Format: <span className="font-semibold text-slate-700">{project.videoFormat}</span> | Ratio: <span className="font-semibold text-slate-700">{project.aspectRatio}</span> | Tone: <span className="font-semibold text-slate-700">{project.tone}</span>
          </p>
        </div>

        {/* View Switcher, Filter & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Shot Type */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <select
              value={shotFilter}
              onChange={(e) => setShotFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium outline-none pr-1 cursor-pointer"
              aria-label="Filter scenes by shot type"
            >
              <option value="all">All Shots</option>
              <option value="Hook">Hook</option>
              <option value="Introduction">Introduction</option>
              <option value="Main Scene">Main Scene</option>
              <option value="Transition">Transition</option>
              <option value="Climax">Climax</option>
              <option value="Ending">Ending</option>
            </select>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Switch to Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              aria-label="Switch to Table Breakdown View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Recalculate Timings */}
          <button
            type="button"
            onClick={onRecalculateTimings}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Recalculate sequential start/end timecodes"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Recalculate</span>
          </button>

          {/* Add Scene Button */}
          <button
            type="button"
            onClick={onAddNewScene}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scene</span>
          </button>
        </div>
      </div>

      {/* Duration & Pacing Alert */}
      <div
        className={`flex items-center justify-between p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${
          isDurationExact
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : isDurationClose
            ? 'bg-blue-50/70 border-blue-200 text-blue-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {isDurationExact ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>
            Total Duration: <strong className="font-mono">{project.totalCalculatedDuration}s</strong> (Target: <strong className="font-mono">{project.targetDuration}s</strong>)
            {durationDiff !== 0 && (
              <span className="ml-1 opacity-80">
                ({durationDiff > 0 ? `+${durationDiff}s over` : `${durationDiff}s under`})
              </span>
            )}
          </span>
        </div>

        <div className="text-xs font-medium opacity-90 hidden sm:block">
          Avg Scene: {(project.totalCalculatedDuration / (project.scenes.length || 1)).toFixed(1)}s
        </div>
      </div>

      {/* Scenes Container */}
      {filteredScenes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No scenes match the filter</h3>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            Try switching the shot type filter back to "All Shots" or add a new scene.
          </p>
          <button
            onClick={() => setShotFilter('all')}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white"
          >
            Show All Scenes
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-4">
          {filteredScenes.map((scene, index) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              index={index}
              isFirst={index === 0}
              isLast={index === filteredScenes.length - 1}
              onEdit={onEditScene}
              onDelete={onDeleteScene}
              onDuplicate={onDuplicateScene}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onRegenerate={onRegenerateScene}
              onUpdateDuration={onUpdateDuration}
              onShowToast={onShowToast}
            />
          ))}
        </div>
      ) : (
        <StoryboardTable
          scenes={filteredScenes}
          onEdit={onEditScene}
          onDelete={onDeleteScene}
          onDuplicate={onDuplicateScene}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onRegenerate={onRegenerateScene}
          onUpdateDuration={onUpdateDuration}
        />
      )}
    </div>
  );
};
