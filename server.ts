import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  GenerateStoryboardRequest,
  RegenerateSceneRequest,
  Scene,
  StoryboardProject,
} from './src/types/storyboard';
import { recalculateSceneTimings, calculateTotalDuration } from './src/utils/storyboard';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// JSON Schema definition for Gemini Structured Outputs
const storyboardSchema = {
  type: Type.OBJECT,
  properties: {
    projectTitle: {
      type: Type.STRING,
      description: 'A catchy, professional title for the video project',
    },
    mainMessage: {
      type: Type.STRING,
      description: 'The core takeaway or primary message of the video',
    },
    storySummary: {
      type: Type.STRING,
      description: 'Concise summary of the complete narrative arc (beginning, middle, ending)',
    },
    hook: {
      type: Type.STRING,
      description: 'The primary visual/auditory hook that captures attention in the first 3 seconds',
    },
    scenes: {
      type: Type.ARRAY,
      description: 'The ordered sequence of scenes that compose the storyboard',
      items: {
        type: Type.OBJECT,
        properties: {
          sceneNumber: { type: Type.INTEGER },
          title: { type: Type.STRING, description: 'Short evocative title for the scene' },
          duration: { type: Type.INTEGER, description: 'Duration in seconds (positive integer)' },
          shotType: {
            type: Type.STRING,
            description: 'Shot classification: Hook, Introduction, Main Scene, Transition, Climax, or Ending',
          },
          visualDescription: {
            type: Type.STRING,
            description: 'Detailed description of the visual action, lighting, characters, and environment',
          },
          imagePrompt: {
            type: Type.STRING,
            description: 'Highly detailed text-to-image prompt to visualize this scene (photorealistic/cinematic)',
          },
          dialogue: {
            type: Type.STRING,
            description: 'Spoken on-screen character dialogue, or empty string if none',
          },
          voiceOver: {
            type: Type.STRING,
            description: 'Narrator voice-over text in the specified language, or empty string if none',
          },
          cameraDirection: {
            type: Type.STRING,
            description: 'Camera angle (macro, wide, low-angle, dutch) and camera movement (push-in, pan, tracking)',
          },
          audioSuggestions: {
            type: Type.OBJECT,
            properties: {
              bgm: { type: Type.STRING, description: 'Background music style, tempo, and mood' },
              sfx: { type: Type.STRING, description: 'Sound effects and foley details' },
            },
            required: ['bgm', 'sfx'],
          },
          transition: {
            type: Type.STRING,
            description: 'Transition to next scene (Cut, Whip Pan, Dissolve, Match Cut, Fade)',
          },
        },
        required: [
          'sceneNumber',
          'title',
          'duration',
          'shotType',
          'visualDescription',
          'imagePrompt',
          'cameraDirection',
          'audioSuggestions',
          'transition',
        ],
      },
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        storyStructure: {
          type: Type.STRING,
          description: 'Narrative structure breakdown (e.g. Three-Act Arc, Problem-Solution-Proof-CTA)',
        },
        scores: {
          type: Type.OBJECT,
          properties: {
            hookStrength: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER, description: 'Score out of 10 (e.g. 8.5)' },
                explanation: { type: Type.STRING, description: 'Reasoned evaluation of hook strength' },
              },
              required: ['score', 'explanation'],
            },
            narrativeClarity: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER, description: 'Score out of 10' },
                explanation: { type: Type.STRING, description: 'Reasoned evaluation of clarity' },
              },
              required: ['score', 'explanation'],
            },
            audienceEngagement: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER, description: 'Score out of 10' },
                explanation: { type: Type.STRING, description: 'Reasoned evaluation of engagement potential' },
              },
              required: ['score', 'explanation'],
            },
            visualConsistency: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER, description: 'Score out of 10' },
                explanation: { type: Type.STRING, description: 'Reasoned evaluation of aesthetic continuity' },
              },
              required: ['score', 'explanation'],
            },
          },
          required: ['hookStrength', 'narrativeClarity', 'audienceEngagement', 'visualConsistency'],
        },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Key storytelling and production strengths',
        },
        weaknesses: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Identified weaknesses or pacing risks',
        },
        improvementSuggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Exactly 3 specific, actionable recommendations to improve the video',
        },
        productionProblems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Potential production challenges, missing information, or logistical hurdles',
        },
        qualityCheckNotes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Auditing observations regarding consistency and duration matching',
        },
      },
      required: [
        'storyStructure',
        'scores',
        'strengths',
        'weaknesses',
        'improvementSuggestions',
        'productionProblems',
      ],
    },
  },
  required: [
    'projectTitle',
    'mainMessage',
    'storySummary',
    'hook',
    'scenes',
    'analysis',
  ],
};

// API: Generate Complete Storyboard
app.post('/api/generate-storyboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      idea,
      videoFormat,
      duration,
      aspectRatio,
      language,
      tone,
      targetAudience,
      numScenes,
      brandSettings,
    }: GenerateStoryboardRequest = req.body;

    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
      res.status(400).json({ error: 'Video idea description is required.' });
      return;
    }

    const targetSec = Number(duration) || 60;
    const scenePromptInstruction =
      numScenes && numScenes !== 'auto'
        ? `Generate exactly ${numScenes} scenes.`
        : `Choose an optimal scene count (typically 4 to 8 scenes for this duration) ensuring realistic pacing.`;

    const brandInstructions = brandSettings
      ? `
BRAND GUIDELINES TO STRICTLY FOLLOW:
- Brand Name: ${brandSettings.brandName || 'N/A'}
- Brand Colors & Aesthetics: ${brandSettings.brandColors || 'N/A'}
- Tone of Voice: ${brandSettings.toneOfVoice || 'N/A'}
- Product Details: ${brandSettings.productDetails || 'N/A'}
- Approved Slogans: ${brandSettings.approvedSlogans || 'N/A'}
- Prohibited Phrases: ${brandSettings.prohibitedPhrases || 'N/A'}
CRITICAL: Do NOT invent false product specifications, fake statistics, or counterfeit testimonials. Adhere strictly to the brand tone.`
      : '';

    const languageInstruction =
      language === 'Urdu'
        ? 'Write dialogue, voice-over, and narration in Urdu script (e.g., اردو میں). Scene titles, visual descriptions, and camera instructions remain in English for international production crew readability.'
        : language === 'Roman Urdu'
        ? 'Write dialogue and voice-over in natural, engaging Roman Urdu (e.g., "Kiya aap bhi..." / "Apni manzil tak pohnchnay ke liye..."). Scene descriptions and camera directions remain in English.'
        : 'Write all dialogue and voice-over in natural, punchy English.';

    const systemInstruction = `You are a world-class creative video director, screenplay consultant, and commercial storyboard producer.
Your mission is to turn the user's video concept into a production-ready, scene-by-scene storyboard with thorough story analysis and quality audit.

CRITICAL REQUIREMENTS:
1. Target video duration is EXACTLY ${targetSec} seconds. The sum of the durations of all scenes must equal ${targetSec} seconds (or within +/- 2 seconds). Every scene duration must be a positive integer >= 2 seconds.
2. Structure the narrative arc cleanly: Beginning (Hook & Setup), Middle (Escalation / Value / Narrative Journey), and Climax / Ending (Resolution & Call-to-Action).
3. Provide rich, film-school-grade camera directions (e.g., "Low-angle dolly tracking shot", "Macro push-in f/1.8", "Dutch angle slow zoom").
4. Provide cinematic image generation prompts for each scene that could be fed to high-end generative models.
5. Provide detailed audio suggestions (both background music style and specific sound effects/foley).
6. Provide an honest, objective story analysis with 4 core metrics scored out of 10 (Hook Strength, Narrative Clarity, Audience Engagement, Visual Consistency), strengths, weaknesses, 3 actionable suggestions, and logistical/production warnings.
7. Language rules: ${languageInstruction}
${brandInstructions}`;

    const userPrompt = `VIDEO BRIEF:
- Concept: "${idea.trim()}"
- Format: ${videoFormat || 'YouTube'}
- Target Duration: ${targetSec} seconds
- Aspect Ratio: ${aspectRatio || '16:9'}
- Tone: ${tone || 'Professional'}
- Target Audience: ${targetAudience || 'General video viewers'}
- Scene Count Preference: ${scenePromptInstruction}

Generate the complete storyboard and story analysis adhering strictly to the JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: storyboardSchema,
        temperature: 0.7,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      res.status(500).json({ error: 'Gemini returned an empty response. Please try again.' });
      return;
    }

    const parsedData = JSON.parse(rawText);

    // Ensure valid scene list & sequential timing
    const rawScenes: Scene[] = Array.isArray(parsedData.scenes)
      ? parsedData.scenes.map((s: any, idx: number) => ({
          id: `scene-${Date.now()}-${idx + 1}`,
          sceneNumber: idx + 1,
          title: s.title || `Scene ${idx + 1}`,
          startTime: '',
          endTime: '',
          duration: Math.max(2, Math.round(Number(s.duration) || Math.floor(targetSec / parsedData.scenes.length))),
          shotType: s.shotType || (idx === 0 ? 'Hook' : idx === parsedData.scenes.length - 1 ? 'Ending' : 'Main Scene'),
          visualDescription: s.visualDescription || '',
          imagePrompt: s.imagePrompt || '',
          dialogue: s.dialogue || '',
          voiceOver: s.voiceOver || '',
          cameraDirection: s.cameraDirection || 'Standard eye-level shot',
          audioSuggestions: {
            bgm: s.audioSuggestions?.bgm || 'Cinematic ambient track',
            sfx: s.audioSuggestions?.sfx || 'Subtle room tone',
          },
          transition: s.transition || (idx === parsedData.scenes.length - 1 ? 'Fade to black' : 'Cut'),
        }))
      : [];

    // Recalculate timing so start/end times and numbers are pristine
    const calibratedScenes = recalculateSceneTimings(rawScenes);
    const calculatedDuration = calculateTotalDuration(calibratedScenes);

    const project: StoryboardProject = {
      id: `proj-${Date.now()}`,
      projectTitle: parsedData.projectTitle || 'Untitled Video Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originalIdea: idea,
      videoFormat: videoFormat || 'YouTube',
      targetDuration: targetSec,
      totalCalculatedDuration: calculatedDuration,
      aspectRatio: aspectRatio || '16:9',
      language: language || 'English',
      tone: tone || 'Professional',
      targetAudience: targetAudience || 'General audience',
      brandSettings,
      numScenesRequested: numScenes,
      mainMessage: parsedData.mainMessage || '',
      storySummary: parsedData.storySummary || '',
      hook: parsedData.hook || '',
      scenes: calibratedScenes,
      analysis: {
        storySummary: parsedData.storySummary || '',
        mainObjective: parsedData.mainMessage || '',
        targetAudience: targetAudience || 'Target audience',
        storyStructure: parsedData.analysis?.storyStructure || 'Three-Act Commercial Arc',
        scores: {
          hookStrength: {
            score: parsedData.analysis?.scores?.hookStrength?.score ?? 8.5,
            explanation: parsedData.analysis?.scores?.hookStrength?.explanation || 'Captivating opening moment.',
          },
          narrativeClarity: {
            score: parsedData.analysis?.scores?.narrativeClarity?.score ?? 9.0,
            explanation: parsedData.analysis?.scores?.narrativeClarity?.explanation || 'Clear progression of thought.',
          },
          audienceEngagement: {
            score: parsedData.analysis?.scores?.audienceEngagement?.score ?? 8.8,
            explanation: parsedData.analysis?.scores?.audienceEngagement?.explanation || 'High viewer interest sustained throughout.',
          },
          visualConsistency: {
            score: parsedData.analysis?.scores?.visualConsistency?.score ?? 9.1,
            explanation: parsedData.analysis?.scores?.visualConsistency?.explanation || 'Unified color and cinematic treatment.',
          },
        },
        strengths: parsedData.analysis?.strengths || ['Strong visual pacing', 'Emotional resonance'],
        weaknesses: parsedData.analysis?.weaknesses || ['Requires tight editing'],
        improvementSuggestions: parsedData.analysis?.improvementSuggestions || [
          'Enhance contrast in key lighting',
          'Tighten audio transition between scenes 2 and 3',
          'Include an explicit call to action banner',
        ],
        productionProblems: parsedData.analysis?.productionProblems || [
          'Ensure high-framerate camera available for slow-motion shots',
        ],
        qualityCheckNotes: parsedData.analysis?.qualityCheckNotes || [
          `Target duration: ${targetSec}s, Generated duration: ${calculatedDuration}s`,
        ],
      },
    };

    res.json({ project });
  } catch (error: any) {
    console.error('Error generating storyboard:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate storyboard. Please try again.',
    });
  }
});

// Single Scene Schema for regeneration
const singleSceneSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    duration: { type: Type.INTEGER },
    shotType: { type: Type.STRING },
    visualDescription: { type: Type.STRING },
    imagePrompt: { type: Type.STRING },
    dialogue: { type: Type.STRING },
    voiceOver: { type: Type.STRING },
    cameraDirection: { type: Type.STRING },
    audioSuggestions: {
      type: Type.OBJECT,
      properties: {
        bgm: { type: Type.STRING },
        sfx: { type: Type.STRING },
      },
      required: ['bgm', 'sfx'],
    },
    transition: { type: Type.STRING },
  },
  required: [
    'title',
    'duration',
    'shotType',
    'visualDescription',
    'imagePrompt',
    'cameraDirection',
    'audioSuggestions',
    'transition',
  ],
};

// API: Regenerate a single scene with surrounding context
app.post('/api/regenerate-scene', async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentScene, projectContext, userGuidance }: RegenerateSceneRequest = req.body;

    if (!currentScene) {
      res.status(400).json({ error: 'Current scene details are required.' });
      return;
    }

    const systemInstruction = `You are an expert video director and script doctor.
Regenerate a single scene in a storyboard while keeping perfect narrative and aesthetic continuity with the rest of the project.
Target Duration for this scene: ${currentScene.duration || 6} seconds.`;

    const userPrompt = `PROJECT CONTEXT:
- Title: ${projectContext.projectTitle}
- Concept: ${projectContext.originalIdea}
- Tone: ${projectContext.tone}
- Target Audience: ${projectContext.targetAudience}

NEIGHBORING SCENES:
- Previous Scene: ${projectContext.previousScene ? `${projectContext.previousScene.title} (${projectContext.previousScene.visualDescription})` : 'None (This is Scene 1)'}
- Next Scene: ${projectContext.nextScene ? `${projectContext.nextScene.title} (${projectContext.nextScene.visualDescription})` : 'None (This is the final scene)'}

CURRENT SCENE TO REGENERATE:
- Scene #${currentScene.sceneNumber}: "${currentScene.title}"
- Current Visual: ${currentScene.visualDescription}
- Current Voice-over/Dialogue: ${currentScene.voiceOver || currentScene.dialogue || 'None'}

USER GUIDANCE FOR THIS REVISION:
${userGuidance ? userGuidance.trim() : 'Provide a fresh, more compelling and cinematic take with enhanced visual impact.'}

Output the regenerated scene conforming strictly to the JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: singleSceneSchema,
        temperature: 0.8,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      res.status(500).json({ error: 'AI returned an empty response.' });
      return;
    }

    const parsed = JSON.parse(rawText);
    const updatedScene: Scene = {
      ...currentScene,
      title: parsed.title || currentScene.title,
      duration: Math.max(1, Number(parsed.duration) || currentScene.duration),
      shotType: parsed.shotType || currentScene.shotType,
      visualDescription: parsed.visualDescription || currentScene.visualDescription,
      imagePrompt: parsed.imagePrompt || currentScene.imagePrompt,
      dialogue: parsed.dialogue ?? currentScene.dialogue,
      voiceOver: parsed.voiceOver ?? currentScene.voiceOver,
      cameraDirection: parsed.cameraDirection || currentScene.cameraDirection,
      audioSuggestions: {
        bgm: parsed.audioSuggestions?.bgm || currentScene.audioSuggestions.bgm,
        sfx: parsed.audioSuggestions?.sfx || currentScene.audioSuggestions.sfx,
      },
      transition: parsed.transition || currentScene.transition,
    };

    res.json({ scene: updatedScene });
  } catch (error: any) {
    console.error('Error regenerating scene:', error);
    res.status(500).json({
      error: error?.message || 'Failed to regenerate scene.',
    });
  }
});

// Mount Vite or serve static dist
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Video Idea Story Analyzer AI running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
