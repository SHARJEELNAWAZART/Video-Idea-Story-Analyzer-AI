import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSecondsToTime,
  parseTimeToSeconds,
  recalculateSceneTimings,
  calculateTotalDuration,
  validateStoryboard,
} from './storyboard';
import { Scene, StoryboardProject } from '../types/storyboard';

test('formatSecondsToTime formats seconds into MM:SS correctly', () => {
  assert.equal(formatSecondsToTime(0), '00:00');
  assert.equal(formatSecondsToTime(5), '00:05');
  assert.equal(formatSecondsToTime(65), '01:05');
  assert.equal(formatSecondsToTime(125), '02:05');
  assert.equal(formatSecondsToTime(-10), '00:00');
});

test('parseTimeToSeconds converts MM:SS and raw strings correctly', () => {
  assert.equal(parseTimeToSeconds('00:00'), 0);
  assert.equal(parseTimeToSeconds('01:30'), 90);
  assert.equal(parseTimeToSeconds('45'), 45);
});

test('recalculateSceneTimings updates start/end time and sequential scene numbers', () => {
  const dummyScenes: Scene[] = [
    {
      id: 's1',
      sceneNumber: 99,
      title: 'Intro',
      startTime: '',
      endTime: '',
      duration: 5,
      shotType: 'Hook',
      visualDescription: 'A glowing watch dial',
      imagePrompt: 'Macro shot of smartwatch',
      cameraDirection: 'Slow zoom in',
      audioSuggestions: { bgm: 'Subtle synth', sfx: 'Click sound' },
      transition: 'Cut',
    },
    {
      id: 's2',
      sceneNumber: 1,
      title: 'Action',
      startTime: '',
      endTime: '',
      duration: 10,
      shotType: 'Main Scene',
      visualDescription: 'Runner checking pulse',
      imagePrompt: 'Athlete running at sunrise',
      cameraDirection: 'Tracking side angle',
      audioSuggestions: { bgm: 'Uptempo beat', sfx: 'Footsteps on gravel' },
      transition: 'Fade',
    },
  ];

  const recalculated = recalculateSceneTimings(dummyScenes);

  assert.equal(recalculated[0].sceneNumber, 1);
  assert.equal(recalculated[0].startTime, '00:00');
  assert.equal(recalculated[0].endTime, '00:05');

  assert.equal(recalculated[1].sceneNumber, 2);
  assert.equal(recalculated[1].startTime, '00:05');
  assert.equal(recalculated[1].endTime, '00:15');

  assert.equal(calculateTotalDuration(recalculated), 15);
});

test('validateStoryboard checks for required fields and duration discrepancies', () => {
  const invalidProject: Partial<StoryboardProject> = {
    projectTitle: '',
    targetDuration: 60,
    scenes: [],
  };

  const result1 = validateStoryboard(invalidProject);
  assert.equal(result1.valid, false);
  assert.ok(result1.errors.some((e) => e.includes('Project title')));
  assert.ok(result1.errors.some((e) => e.includes('no scenes')));

  const validProject: Partial<StoryboardProject> = {
    projectTitle: 'Smartwatch Launch',
    targetDuration: 15,
    scenes: [
      {
        id: 's1',
        sceneNumber: 1,
        title: 'Hook',
        startTime: '00:00',
        endTime: '00:15',
        duration: 15,
        shotType: 'Hook',
        visualDescription: 'Close-up smartwatch screen with vibrant display',
        imagePrompt: 'Smartwatch close-up in studio lighting',
        cameraDirection: 'Static push',
        audioSuggestions: { bgm: 'Pulse beat', sfx: 'Beep' },
        transition: 'Fade out',
      },
    ],
  };

  const result2 = validateStoryboard(validProject);
  assert.equal(result2.valid, true);
  assert.equal(result2.errors.length, 0);
});
