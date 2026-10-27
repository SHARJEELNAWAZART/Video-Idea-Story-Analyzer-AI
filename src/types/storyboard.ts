export type VideoFormat =
  | 'YouTube'
  | 'YouTube Shorts'
  | 'TikTok'
  | 'Instagram Reels'
  | 'Advertisement'
  | 'Educational Video'
  | 'Short Film';

export type AspectRatio = '9:16' | '16:9' | '1:1';

export type Language = 'English' | 'Urdu' | 'Roman Urdu';

export type VideoTone =
  | 'Professional'
  | 'Cinematic'
  | 'Emotional'
  | 'Funny'
  | 'Educational'
  | 'Dramatic';

export type ShotType =
  | 'Hook'
  | 'Introduction'
  | 'Main Scene'
  | 'Transition'
  | 'Climax'
  | 'Ending';

export interface BrandSettings {
  brandName?: string;
  brandColors?: string;
  toneOfVoice?: string;
  productDetails?: string;
  approvedSlogans?: string;
  prohibitedPhrases?: string;
}

export interface AudioSuggestions {
  bgm: string;
  sfx: string;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  title: string;
  startTime: string; // "00:00"
  endTime: string;   // "00:06"
  duration: number;  // seconds (must be positive)
  shotType: ShotType;
  visualDescription: string;
  imagePrompt: string;
  dialogue?: string;
  voiceOver?: string;
  cameraDirection: string;
  audioSuggestions: AudioSuggestions;
  transition: string;
}

export interface ScoreMetric {
  score: number; // 1-10
  explanation: string;
}

export interface StoryAnalysisScores {
  hookStrength: ScoreMetric;
  narrativeClarity: ScoreMetric;
  audienceEngagement: ScoreMetric;
  visualConsistency: ScoreMetric;
}

export interface StoryAnalysis {
  storySummary: string;
  mainObjective: string;
  targetAudience: string;
  storyStructure: string;
  scores: StoryAnalysisScores;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[]; // exactly 3 specific recommendations
  productionProblems: string[];
  qualityCheckNotes?: string[];
}

export interface StoryboardProject {
  id: string;
  projectTitle: string;
  createdAt: string;
  updatedAt: string;
  originalIdea: string;
  videoFormat: VideoFormat;
  targetDuration: number; // e.g. 60
  totalCalculatedDuration: number;
  aspectRatio: AspectRatio;
  language: Language;
  tone: VideoTone;
  targetAudience: string;
  brandSettings?: BrandSettings;
  numScenesRequested?: number | 'auto';
  mainMessage: string;
  storySummary: string;
  hook: string;
  scenes: Scene[];
  analysis: StoryAnalysis;
}

export interface GenerateStoryboardRequest {
  idea: string;
  videoFormat: VideoFormat;
  duration: number;
  aspectRatio: AspectRatio;
  language: Language;
  tone: VideoTone;
  targetAudience: string;
  numScenes?: number | 'auto';
  brandSettings?: BrandSettings;
}

export interface RegenerateSceneRequest {
  currentScene: Scene;
  projectContext: {
    projectTitle: string;
    originalIdea: string;
    tone: VideoTone;
    targetAudience: string;
    brandSettings?: BrandSettings;
    previousScene?: Scene;
    nextScene?: Scene;
  };
  userGuidance?: string;
}
