import { Scene, StoryboardProject } from '../types/storyboard';

/**
 * Formats a duration in seconds to MM:SS format
 */
export function formatSecondsToTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses MM:SS or SSS into seconds
 */
export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':');
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  return parseInt(timeStr, 10) || 0;
}

/**
 * Recalculates start times, end times, and scene numbers sequentially
 */
export function recalculateSceneTimings(scenes: Scene[]): Scene[] {
  let currentTime = 0;

  return scenes.map((scene, index) => {
    const duration = Math.max(1, Math.round(Number(scene.duration) || 3));
    const startTime = formatSecondsToTime(currentTime);
    currentTime += duration;
    const endTime = formatSecondsToTime(currentTime);

    return {
      ...scene,
      sceneNumber: index + 1,
      duration,
      startTime,
      endTime,
    };
  });
}

/**
 * Calculates sum of durations in seconds
 */
export function calculateTotalDuration(scenes: Scene[]): number {
  return scenes.reduce((acc, scene) => acc + (Number(scene.duration) || 0), 0);
}

/**
 * Quality check / validation for storyboard data
 */
export function validateStoryboard(project: Partial<StoryboardProject>): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!project.projectTitle?.trim()) {
    errors.push('Project title is missing.');
  }

  if (!project.scenes || project.scenes.length === 0) {
    errors.push('Storyboard contains no scenes.');
    return { valid: false, errors, warnings };
  }

  const targetDuration = project.targetDuration || 60;
  const totalDuration = calculateTotalDuration(project.scenes);

  // Check tolerance: within 10% or +/- 5 seconds
  const tolerance = Math.max(5, targetDuration * 0.1);
  if (Math.abs(totalDuration - targetDuration) > tolerance) {
    warnings.push(
      `Total scene duration (${totalDuration}s) differs from target (${targetDuration}s).`
    );
  }

  project.scenes.forEach((scene, idx) => {
    const num = idx + 1;
    if (!scene.title?.trim()) {
      errors.push(`Scene #${num} is missing a title.`);
    }
    if (!scene.visualDescription?.trim()) {
      errors.push(`Scene #${num} is missing a visual description.`);
    }
    if (scene.duration <= 0) {
      errors.push(`Scene #${num} has an invalid non-positive duration (${scene.duration}s).`);
    }
    if (!scene.imagePrompt?.trim()) {
      warnings.push(`Scene #${num} is missing an AI image prompt.`);
    }
    if (!scene.cameraDirection?.trim()) {
      warnings.push(`Scene #${num} is missing camera direction.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Export full storyboard as structured plain text script
 */
export function exportStoryboardAsText(project: StoryboardProject): string {
  const lines: string[] = [];
  lines.push(`====================================================`);
  lines.push(`TITLE: ${project.projectTitle.toUpperCase()}`);
  lines.push(`FORMAT: ${project.videoFormat} | ASPECT RATIO: ${project.aspectRatio}`);
  lines.push(`TARGET DURATION: ${project.targetDuration}s | CALCULATED: ${project.totalCalculatedDuration}s`);
  lines.push(`LANGUAGE: ${project.language} | TONE: ${project.tone}`);
  lines.push(`TARGET AUDIENCE: ${project.targetAudience}`);
  if (project.brandSettings?.brandName) {
    lines.push(`BRAND: ${project.brandSettings.brandName}`);
  }
  lines.push(`====================================================\n`);

  lines.push(`ORIGINAL IDEA:`);
  lines.push(`${project.originalIdea}\n`);

  lines.push(`HOOK:`);
  lines.push(`${project.hook}\n`);

  lines.push(`STORY SUMMARY:`);
  lines.push(`${project.storySummary}\n`);

  lines.push(`----------------------------------------------------`);
  lines.push(`SCENE-BY-SCENE STORYBOARD (${project.scenes.length} Scenes)`);
  lines.push(`----------------------------------------------------\n`);

  project.scenes.forEach((s) => {
    lines.push(`[SCENE ${s.sceneNumber}: ${s.title.toUpperCase()}]`);
    lines.push(`TIMECODE: ${s.startTime} - ${s.endTime} (${s.duration}s) | SHOT TYPE: ${s.shotType}`);
    lines.push(`CAMERA: ${s.cameraDirection}`);
    lines.push(`TRANSITION: ${s.transition}`);
    lines.push(`VISUAL: ${s.visualDescription}`);
    lines.push(`IMAGE PROMPT: ${s.imagePrompt}`);
    if (s.dialogue) lines.push(`DIALOGUE: "${s.dialogue}"`);
    if (s.voiceOver) lines.push(`VOICE-OVER: "${s.voiceOver}"`);
    lines.push(`AUDIO: BGM: ${s.audioSuggestions.bgm} | SFX: ${s.audioSuggestions.sfx}`);
    lines.push(``);
  });

  if (project.analysis) {
    lines.push(`====================================================`);
    lines.push(`AI STORY ANALYSIS & QUALITY AUDIT`);
    lines.push(`====================================================\n`);
    lines.push(`STRUCTURE: ${project.analysis.storyStructure}`);
    lines.push(`SCORES (Out of 10):`);
    lines.push(`- Hook Strength: ${project.analysis.scores.hookStrength.score}/10 (${project.analysis.scores.hookStrength.explanation})`);
    lines.push(`- Narrative Clarity: ${project.analysis.scores.narrativeClarity.score}/10 (${project.analysis.scores.narrativeClarity.explanation})`);
    lines.push(`- Audience Engagement: ${project.analysis.scores.audienceEngagement.score}/10 (${project.analysis.scores.audienceEngagement.explanation})`);
    lines.push(`- Visual Consistency: ${project.analysis.scores.visualConsistency.score}/10 (${project.analysis.scores.visualConsistency.explanation})`);
    lines.push(`\nTOP STRENGTHS:`);
    project.analysis.strengths.forEach((st) => lines.push(`+ ${st}`));
    lines.push(`\nAREAS FOR IMPROVEMENT:`);
    project.analysis.improvementSuggestions.forEach((sugg, i) => lines.push(`${i + 1}. ${sugg}`));
    lines.push(`\nPOTENTIAL PRODUCTION ISSUES:`);
    project.analysis.productionProblems.forEach((prob) => lines.push(`! ${prob}`));
  }

  return lines.join('\n');
}

/**
 * Export full storyboard as formatted Markdown
 */
export function exportStoryboardAsMarkdown(project: StoryboardProject): string {
  const lines: string[] = [];
  lines.push(`# ${project.projectTitle}`);
  lines.push(`*Generated by Video Idea Story Analyzer AI*\n`);

  lines.push(`| Specification | Detail |`);
  lines.push(`| --- | --- |`);
  lines.push(`| **Format** | ${project.videoFormat} |`);
  lines.push(`| **Target Duration** | ${project.targetDuration} seconds |`);
  lines.push(`| **Calculated Duration** | ${project.totalCalculatedDuration} seconds |`);
  lines.push(`| **Aspect Ratio** | ${project.aspectRatio} |`);
  lines.push(`| **Tone** | ${project.tone} |`);
  lines.push(`| **Language** | ${project.language} |`);
  lines.push(`| **Target Audience** | ${project.targetAudience} |`);
  if (project.brandSettings?.brandName) {
    lines.push(`| **Brand** | ${project.brandSettings.brandName} |`);
  }
  lines.push(`\n> **Core Hook:** ${project.hook}\n`);
  lines.push(`**Story Summary:** ${project.storySummary}\n`);

  lines.push(`## Scene Breakdown\n`);

  project.scenes.forEach((s) => {
    lines.push(`### Scene ${s.sceneNumber}: ${s.title}`);
    lines.push(`- **Timing:** \`${s.startTime}\` – \`${s.endTime}\` (${s.duration}s) | **Shot:** \`${s.shotType}\``);
    lines.push(`- **Camera:** ${s.cameraDirection} | **Transition:** ${s.transition}`);
    lines.push(`- **Visual:** ${s.visualDescription}`);
    lines.push(`- **Image Prompt:** *${s.imagePrompt}*`);
    if (s.dialogue) lines.push(`- **Dialogue:** "${s.dialogue}"`);
    if (s.voiceOver) lines.push(`- **Voice-Over:** "${s.voiceOver}"`);
    lines.push(`- **Audio:** SFX: *${s.audioSuggestions.sfx}* | BGM: *${s.audioSuggestions.bgm}*`);
    lines.push(``);
  });

  return lines.join('\n');
}

/**
 * Export storyboard as pretty JSON
 */
export function exportStoryboardAsJSON(project: StoryboardProject): string {
  return JSON.stringify(project, null, 2);
}
