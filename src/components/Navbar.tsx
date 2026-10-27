import React, { useState, useRef, useEffect } from 'react';
import {
  Clapperboard,
  Clock,
  Layers,
  FolderArchive,
  Sparkles,
  Download,
  Copy,
  Printer,
  FileCode,
  FileText,
  PlusCircle,
  Check,
  ChevronDown,
} from 'lucide-react';
import { StoryboardProject } from '../types/storyboard';
import {
  exportStoryboardAsText,
  exportStoryboardAsMarkdown,
  exportStoryboardAsJSON,
} from '../utils/storyboard';

interface NavbarProps {
  currentProject: StoryboardProject | null;
  savedCount: number;
  onOpenSavedModal: () => void;
  onOpenSampleModal: () => void;
  onStartNewProject: () => void;
  onEnterPrintMode: () => void;
  onShowToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onSaveProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  savedCount,
  onOpenSavedModal,
  onOpenSampleModal,
  onStartNewProject,
  onEnterPrintMode,
  onShowToast,
  onSaveProject,
}) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyScript = async () => {
    if (!currentProject) return;
    try {
      const text = exportStoryboardAsText(currentProject);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onShowToast('success', 'Full storyboard script copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
      setExportOpen(false);
    } catch {
      onShowToast('error', 'Failed to copy script to clipboard.');
    }
  };

  const handleDownloadFile = (type: 'txt' | 'md' | 'json') => {
    if (!currentProject) return;
    try {
      let content = '';
      let filename = `${currentProject.projectTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`;
      let mime = 'text/plain';

      if (type === 'txt') {
        content = exportStoryboardAsText(currentProject);
        filename += '_storyboard.txt';
      } else if (type === 'md') {
        content = exportStoryboardAsMarkdown(currentProject);
        filename += '_storyboard.md';
        mime = 'text/markdown';
      } else {
        content = exportStoryboardAsJSON(currentProject);
        filename += '_project.json';
        mime = 'application/json';
      }

      const blob = new Blob([content], { type: `${mime};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowToast('success', `Downloaded ${filename} successfully!`);
      setExportOpen(false);
    } catch {
      onShowToast('error', 'Failed to download file.');
    }
  };

  const durationMatch =
    currentProject &&
    Math.abs(currentProject.totalCalculatedDuration - currentProject.targetDuration) <= 2;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 shrink-0">
            <Clapperboard className="w-5 h-5" />
          </div>
          <div className="shrink-0">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                Video Idea <span className="text-purple-600">Story Analyzer AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
                Studio
              </span>
            </div>
            <p className="hidden xl:block text-xs text-slate-500 font-medium">
              Scene-by-scene script planning, visuals, and narrative audit
            </p>
          </div>
        </div>

        {/* Current Project Quick Stats */}
        {currentProject && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-100/70 border border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 max-w-[200px] truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="truncate">{currentProject.projectTitle}</span>
            </div>
            <div className="h-3 w-px bg-slate-300"></div>
            <div
              className={`flex items-center gap-1 font-semibold ${
                durationMatch ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {currentProject.totalCalculatedDuration}s / {currentProject.targetDuration}s
              </span>
            </div>
            <div className="h-3 w-px bg-slate-300"></div>
            <div className="flex items-center gap-1 text-slate-700 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>{currentProject.scenes.length} Scenes</span>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Sample Templates */}
          <button
            onClick={onOpenSampleModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
            title="Explore rich sample storyboards"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Samples</span>
          </button>

          {/* Saved Projects */}
          <button
            onClick={onOpenSavedModal}
            className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Saved projects in browser storage"
          >
            <FolderArchive className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Projects</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* New Project Button */}
          <button
            onClick={onStartNewProject}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Start new video idea"
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span className="hidden md:inline">New Idea</span>
          </button>

          {currentProject && (
            <>
              {/* Quick Save Project */}
              <button
                onClick={onSaveProject}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50 border border-slate-200 transition-colors"
                title="Save current project to local storage"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Save</span>
              </button>

              {/* Print / Save PDF View */}
              <button
                onClick={onEnterPrintMode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Open print-friendly multi-page layout"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="hidden md:inline">Print / PDF</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg text-white bg-purple-600 hover:bg-purple-700 shadow-sm shadow-purple-600/20 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={exportOpen}
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Export Options
                    </div>
                    <button
                      onClick={handleCopyScript}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>Copy Full Script</span>
                    </button>
                    <button
                      onClick={() => handleDownloadFile('md')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>Download Markdown (.md)</span>
                    </button>
                    <button
                      onClick={() => handleDownloadFile('txt')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>Download Plain Text (.txt)</span>
                    </button>
                    <button
                      onClick={() => handleDownloadFile('json')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors text-left"
                    >
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      <span>Download JSON Data (.json)</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
