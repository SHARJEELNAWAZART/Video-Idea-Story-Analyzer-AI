import React, { useState, useEffect } from 'react';
import {
  StoryboardProject,
  Scene,
  GenerateStoryboardRequest,
} from './types/storyboard';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { recalculateSceneTimings, calculateTotalDuration } from './utils/storyboard';
import { Navbar } from './components/Navbar';
import { IdeaInputForm } from './components/IdeaInputForm';
import { StoryboardEditor } from './components/StoryboardEditor';
import { StoryAnalyzerPanel } from './components/StoryAnalyzerPanel';
import { SceneEditModal } from './components/SceneEditModal';
import { RegenerateSceneModal } from './components/RegenerateSceneModal';
import { SavedProjectsModal } from './components/SavedProjectsModal';
import { PrintableView } from './components/PrintableView';
import { Toast, ToastMessage } from './components/Toast';
import {
  Sparkles,
  Clapperboard,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STORAGE_KEY = 'video_idea_analyzer_projects';

export default function App() {
  // Initialize with the sample project so user can immediately test
  const [currentProject, setCurrentProject] = useState<StoryboardProject | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      }
    } catch (e) {
      console.error('Error loading saved projects from localStorage:', e);
    }
    return SAMPLE_PROJECTS[0];
  });

  const [savedProjects, setSavedProjects] = useState<StoryboardProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved projects:', e);
    }
    // Seed with sample projects initially so users have rich examples
    return [...SAMPLE_PROJECTS];
  });

  // UI Navigation & View state
  const [activeTab, setActiveTab] = useState<'editor' | 'analyzer'>('editor');
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Modals state
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [regeneratingScene, setRegeneratingScene] = useState<Scene | null>(null);
  const [savedModalOpen, setSavedModalOpen] = useState(false);

  // Async AI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Analyzing idea & pacing...');
  const [isRegeneratingSceneAI, setIsRegeneratingSceneAI] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync saved projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProjects));
    } catch (e) {
      console.error('Error saving projects to localStorage:', e);
    }
  }, [savedProjects]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Generate complete storyboard via server-side Gemini
  const handleGenerateStoryboard = async (requestData: GenerateStoryboardRequest) => {
    setIsGenerating(true);
    setLoadingStepText('Understanding concept & narrative arc...');

    const stepInterval = setInterval(() => {
      setLoadingStepText((prev) => {
        if (prev.includes('Understanding')) return 'Designing scene-by-scene storyboard...';
        if (prev.includes('Designing')) return 'Calculating durations, camera angles & music...';
        if (prev.includes('Calculating')) return 'Auditing narrative clarity & consistency scores...';
        return 'Finalizing storyboard...';
      });
    }, 2500);

    try {
      const response = await fetch('/api/generate-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const { project } = await response.json();
      if (!project) {
        throw new Error('No project received in server response.');
      }

      setCurrentProject(project);
      setSavedProjects((prev) => {
        const filtered = prev.filter((p) => p.id !== project.id);
        return [project, ...filtered];
      });

      setShowIdeaForm(false);
      setActiveTab('editor');
      showToast('success', `Storyboard "${project.projectTitle}" generated successfully!`);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Generation failed:', err);
      showToast('error', err.message || 'Failed to generate storyboard. Please try again.');
    } finally {
      setIsGenerating(false);
      setLoadingStepText('Analyzing idea & pacing...');
    }
  };

  // Regenerate single scene via server-side Gemini
  const handleConfirmRegenerateScene = async (guidance: string) => {
    if (!currentProject || !regeneratingScene) return;

    setIsRegeneratingSceneAI(true);
    try {
      const sceneIndex = currentProject.scenes.findIndex((s) => s.id === regeneratingScene.id);
      const previousScene = sceneIndex > 0 ? currentProject.scenes[sceneIndex - 1] : undefined;
      const nextScene =
        sceneIndex < currentProject.scenes.length - 1
          ? currentProject.scenes[sceneIndex + 1]
          : undefined;

      const response = await fetch('/api/regenerate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScene: regeneratingScene,
          projectContext: {
            projectTitle: currentProject.projectTitle,
            originalIdea: currentProject.originalIdea,
            tone: currentProject.tone,
            targetAudience: currentProject.targetAudience,
            brandSettings: currentProject.brandSettings,
            previousScene,
            nextScene,
          },
          userGuidance: guidance,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to regenerate scene.');
      }

      const { scene: updatedScene } = await response.json();

      const newScenes = currentProject.scenes.map((s) =>
        s.id === regeneratingScene.id ? updatedScene : s
      );
      const calibrated = recalculateSceneTimings(newScenes);

      const updatedProj: StoryboardProject = {
        ...currentProject,
        scenes: calibrated,
        totalCalculatedDuration: calculateTotalDuration(calibrated),
        updatedAt: new Date().toISOString(),
      };

      setCurrentProject(updatedProj);
      updateProjectInStorage(updatedProj);
      setRegeneratingScene(null);
      showToast('success', `Scene #${updatedScene.sceneNumber} regenerated successfully!`);
    } catch (err: any) {
      console.error('Regeneration error:', err);
      showToast('error', err.message || 'Failed to regenerate scene.');
    } finally {
      setIsRegeneratingSceneAI(false);
    }
  };

  // Project Helper to update current project and saved list
  const updateProjectInStorage = (updatedProj: StoryboardProject) => {
    setSavedProjects((prev) =>
      prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
    );
  };

  // Add new blank scene
  const handleAddNewScene = () => {
    if (!currentProject) return;

    const newSceneNumber = currentProject.scenes.length + 1;
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      sceneNumber: newSceneNumber,
      title: `Scene ${newSceneNumber}`,
      startTime: '',
      endTime: '',
      duration: 6,
      shotType: 'Main Scene',
      visualDescription: 'New scene visual description. Add character actions and setting details.',
      imagePrompt: 'Cinematic visual composition with dynamic lighting and camera depth',
      cameraDirection: 'Eye-level medium tracking shot',
      audioSuggestions: {
        bgm: 'Cinematic ambient background score',
        sfx: 'Subtle environmental ambience',
      },
      transition: 'Cut',
    };

    const newScenes = recalculateSceneTimings([...currentProject.scenes, newScene]);
    const updatedProj: StoryboardProject = {
      ...currentProject,
      scenes: newScenes,
      totalCalculatedDuration: calculateTotalDuration(newScenes),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
    showToast('info', `Added Scene #${newSceneNumber}.`);
  };

  // Delete scene
  const handleDeleteScene = (sceneId: string) => {
    if (!currentProject) return;
    if (currentProject.scenes.length <= 1) {
      showToast('error', 'A storyboard must have at least one scene.');
      return;
    }

    const filtered = currentProject.scenes.filter((s) => s.id !== sceneId);
    const calibrated = recalculateSceneTimings(filtered);
    const updatedProj: StoryboardProject = {
      ...currentProject,
      scenes: calibrated,
      totalCalculatedDuration: calculateTotalDuration(calibrated),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
    showToast('info', 'Scene deleted.');
  };

  // Duplicate scene
  const handleDuplicateScene = (scene: Scene) => {
    if (!currentProject) return;

    const duplicatedScene: Scene = {
      ...scene,
      id: `scene-${Date.now()}`,
      title: `${scene.title} (Copy)`,
    };

    const index = currentProject.scenes.findIndex((s) => s.id === scene.id);
    const newScenes = [...currentProject.scenes];
    newScenes.splice(index + 1, 0, duplicatedScene);

    const calibrated = recalculateSceneTimings(newScenes);
    const updatedProj: StoryboardProject = {
      ...currentProject,
      scenes: calibrated,
      totalCalculatedDuration: calculateTotalDuration(calibrated),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
    showToast('success', `Duplicated Scene #${scene.sceneNumber}.`);
  };

  // Move scene up
  const handleMoveUp = (index: number) => {
    if (!currentProject || index <= 0) return;
    const newScenes = [...currentProject.scenes];
    const [moved] = newScenes.splice(index, 1);
    newScenes.splice(index - 1, 0, moved);

    const calibrated = recalculateSceneTimings(newScenes);
    const updatedProj: StoryboardProject = {
      ...currentProject,
      scenes: calibrated,
      totalCalculatedDuration: calculateTotalDuration(calibrated),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
  };

  // Move scene down
  const handleMoveDown = (index: number) => {
    if (!currentProject || index >= currentProject.scenes.length - 1) return;
    const newScenes = [...currentProject.scenes];
    const [moved] = newScenes.splice(index, 1);
    newScenes.splice(index + 1, 0, moved);

    const calibrated = recalculateSceneTimings(newScenes);
    const updatedProj: StoryboardProject = {
      ...currentProject,
      scenes: calibrated,
      totalCalculatedDuration: calculateTotalDuration(calibrated),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
  };

  // Update single scene duration
  const handleUpdateDuration = (sceneId: string, newDuration: number) => {
    if (!currentProject) return;

    const newScenes = currentProject.scenes.map((s) =>
      s.id === sceneId ? { ...s, duration: Math.max(1, newDuration) } : s
    );
    const calibrated = recalculateSceneTimings(newScenes);
    const updatedProj: StoryboardProject = {
      ...currentProject,
      scenes: calibrated,
      totalCalculatedDuration: calculateTotalDuration(calibrated),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
  };

  // Recalculate all sequential timings
  const handleRecalculateTimings = () => {
    if (!currentProject) return;
    const calibrated = recalculateSceneTimings(currentProject.scenes);
    const updatedProj: StoryboardProject = {
      ...currentProject,
      scenes: calibrated,
      totalCalculatedDuration: calculateTotalDuration(calibrated),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
    showToast('success', 'Sequential start and end timings recalibrated.');
  };

  // Save changes from Edit Modal
  const handleSaveSceneEdit = (updatedScene: Scene) => {
    if (!currentProject) return;
    const newScenes = currentProject.scenes.map((s) =>
      s.id === updatedScene.id ? updatedScene : s
    );
    const calibrated = recalculateSceneTimings(newScenes);
    const updatedProj: StoryboardProject = {
      ...currentProject,
      scenes: calibrated,
      totalCalculatedDuration: calculateTotalDuration(calibrated),
      updatedAt: new Date().toISOString(),
    };

    setCurrentProject(updatedProj);
    updateProjectInStorage(updatedProj);
    showToast('success', `Saved edits for Scene #${updatedScene.sceneNumber}.`);
  };

  // Start new project
  const handleStartNewProject = () => {
    setShowIdeaForm(true);
    setActiveTab('editor');
  };

  // Manual save project to local storage
  const handleManualSave = () => {
    if (!currentProject) return;
    setSavedProjects((prev) => {
      const exists = prev.some((p) => p.id === currentProject.id);
      if (exists) {
        return prev.map((p) => (p.id === currentProject.id ? currentProject : p));
      }
      return [currentProject, ...prev];
    });
    showToast('success', `Project "${currentProject.projectTitle}" saved locally!`);
  };

  // Delete project from storage
  const handleDeleteProject = (id: string) => {
    const nextSaved = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(nextSaved);
    if (currentProject?.id === id) {
      setCurrentProject(nextSaved[0] || null);
    }
    showToast('info', 'Project deleted.');
  };

  // Rename project in storage
  const handleRenameProject = (id: string, newTitle: string) => {
    setSavedProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, projectTitle: newTitle } : p))
    );
    if (currentProject?.id === id) {
      setCurrentProject((prev) => (prev ? { ...prev, projectTitle: newTitle } : null));
    }
    showToast('success', 'Project renamed.');
  };

  // Duplicate saved project
  const handleDuplicateProject = (proj: StoryboardProject) => {
    const newProj: StoryboardProject = {
      ...proj,
      id: `proj-${Date.now()}`,
      projectTitle: `${proj.projectTitle} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSavedProjects((prev) => [newProj, ...prev]);
    setCurrentProject(newProj);
    showToast('success', 'Project duplicated.');
  };

  // If in printable view mode, render print layout
  if (isPrintMode && currentProject) {
    return <PrintableView project={currentProject} onExit={() => setIsPrintMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentProject={currentProject}
        savedCount={savedProjects.length}
        onOpenSavedModal={() => setSavedModalOpen(true)}
        onOpenSampleModal={() => setSavedModalOpen(true)}
        onStartNewProject={handleStartNewProject}
        onEnterPrintMode={() => setIsPrintMode(true)}
        onShowToast={showToast}
        onSaveProject={handleManualSave}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Collapsible Idea Generation Section */}
        <section>
          {showIdeaForm || !currentProject ? (
            <div className="space-y-3">
              {currentProject && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowIdeaForm(false)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    <span>Hide Video Idea Form</span>
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              )}
              <IdeaInputForm
                onGenerate={handleGenerateStoryboard}
                isLoading={isGenerating}
                loadingStepText={loadingStepText}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                    Active Video Concept
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {currentProject.videoFormat} ({currentProject.totalCalculatedDuration}s)
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic line-clamp-2 font-serif">
                  "{currentProject.originalIdea}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIdeaForm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Change / Refine Idea</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </section>

        {/* Workspace & Tabs */}
        {currentProject && (
          <section className="space-y-5">
            {/* Main Workspace Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'editor'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Storyboard Editor</span>
                  <span className="px-2 py-0.2 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {currentProject.scenes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('analyzer')}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'analyzer'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>Story Analyzer & Quality Audit</span>
                  {currentProject.analysis?.scores && (
                    <span className="px-2 py-0.2 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                      {currentProject.analysis.scores.hookStrength.score.toFixed(1)}/10
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Active Tab Content */}
            {activeTab === 'editor' ? (
              <StoryboardEditor
                project={currentProject}
                onEditScene={(scene) => setEditingScene(scene)}
                onDeleteScene={handleDeleteScene}
                onDuplicateScene={handleDuplicateScene}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onAddNewScene={handleAddNewScene}
                onRegenerateScene={(scene) => setRegeneratingScene(scene)}
                onUpdateDuration={handleUpdateDuration}
                onRecalculateTimings={handleRecalculateTimings}
                onShowToast={showToast}
              />
            ) : (
              <StoryAnalyzerPanel project={currentProject} />
            )}
          </section>
        )}
      </main>

      {/* Edit Scene Modal */}
      {editingScene && (
        <SceneEditModal
          scene={editingScene}
          isOpen={true}
          onClose={() => setEditingScene(null)}
          onSave={handleSaveSceneEdit}
        />
      )}

      {/* Regenerate Scene Modal */}
      {regeneratingScene && (
        <RegenerateSceneModal
          scene={regeneratingScene}
          isOpen={true}
          onClose={() => setRegeneratingScene(null)}
          onConfirmRegenerate={handleConfirmRegenerateScene}
          isRegenerating={isRegeneratingSceneAI}
        />
      )}

      {/* Saved Projects & Samples Modal */}
      <SavedProjectsModal
        isOpen={savedModalOpen}
        onClose={() => setSavedModalOpen(false)}
        savedProjects={savedProjects}
        currentProjectId={currentProject?.id || null}
        onSelectProject={(proj) => {
          setCurrentProject(proj);
          setActiveTab('editor');
          showToast('info', `Opened "${proj.projectTitle}".`);
        }}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        onDuplicateProject={handleDuplicateProject}
        onStartNewProject={handleStartNewProject}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
