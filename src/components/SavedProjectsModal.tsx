import React, { useState } from 'react';
import {
  X,
  FolderArchive,
  Trash2,
  Edit2,
  Check,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Copy,
} from 'lucide-react';
import { StoryboardProject } from '../types/storyboard';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: StoryboardProject[];
  currentProjectId: string | null;
  onSelectProject: (project: StoryboardProject) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newTitle: string) => void;
  onDuplicateProject: (project: StoryboardProject) => void;
  onStartNewProject: () => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
  onDuplicateProject,
  onStartNewProject,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'saved' | 'samples'>('saved');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (project: StoryboardProject) => {
    setEditingId(project.id);
    setEditTitle(project.projectTitle);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameProject(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-purple-600" />
              <span>Project Management</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between saved storyboards or explore curated sample projects
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            aria-label="Close project modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-5 pt-3 bg-white gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'saved'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Saved Projects</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-slate-100 text-slate-700">
              {savedProjects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('samples')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'samples'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Templates</span>
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-purple-50 text-purple-700 font-bold">
              {SAMPLE_PROJECTS.length}
            </span>
          </button>
        </div>

        {/* Project List Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'saved' ? (
            savedProjects.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-3">
                <FolderArchive className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-sm font-medium">No saved projects yet in browser storage.</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartNewProject();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Video Project</span>
                </button>
              </div>
            ) : (
              savedProjects.map((proj) => {
                const isCurrent = proj.id === currentProjectId;
                const isEditing = editingId === proj.id;

                return (
                  <div
                    key={proj.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-purple-400 bg-purple-50/30 ring-1 ring-purple-300'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="px-2.5 py-1 text-sm bg-white border border-purple-400 rounded-lg outline-none w-full max-w-sm"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(proj.id)}
                            className="p-1 rounded bg-purple-600 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {proj.projectTitle}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                              Active
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStartRename(proj)}
                            className="text-slate-400 hover:text-slate-700 p-0.5"
                            title="Rename Project"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{proj.videoFormat}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {proj.totalCalculatedDuration}s
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-purple-600" />
                          {proj.scenes.length} Scenes
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onDuplicateProject(proj)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        title="Duplicate project"
                        aria-label={`Duplicate ${proj.projectTitle}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete project"
                        aria-label={`Delete ${proj.projectTitle}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(proj);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            SAMPLE_PROJECTS.map((sample) => (
              <div
                key={sample.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">
                      {sample.projectTitle}
                    </h4>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      Template
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {sample.originalIdea}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{sample.videoFormat}</span>
                    <span>•</span>
                    <span className="font-mono">{sample.totalCalculatedDuration}s</span>
                    <span>•</span>
                    <span>{sample.scenes.length} Scenes</span>
                    <span>•</span>
                    <span>Tone: {sample.tone}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectProject(sample);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Template</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartNewProject();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Fresh Project</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
