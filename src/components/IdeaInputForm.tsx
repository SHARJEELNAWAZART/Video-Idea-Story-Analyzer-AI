import React, { useState } from 'react';
import {
  Sparkles,
  Film,
  Clock,
  Ratio,
  Languages,
  Palette,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import {
  VideoFormat,
  AspectRatio,
  Language,
  VideoTone,
  BrandSettings,
  GenerateStoryboardRequest,
} from '../types/storyboard';

interface IdeaInputFormProps {
  onGenerate: (data: GenerateStoryboardRequest) => Promise<void>;
  isLoading: boolean;
  loadingStepText?: string;
  initialValues?: Partial<GenerateStoryboardRequest>;
}

const SAMPLE_IDEA_CHIPS = [
  {
    label: 'Smartwatch Ad (60s)',
    idea: 'A 60-second high-energy promotional video for a titanium fitness smartwatch that tracks heart rate, sleep recovery, and mountain trail navigation.',
    format: 'Advertisement' as VideoFormat,
    duration: 60,
    aspectRatio: '16:9' as AspectRatio,
    tone: 'Cinematic' as VideoTone,
  },
  {
    label: 'Abandoned House Mystery (90s)',
    idea: 'A suspenseful YouTube mystery story about an explorer entering an 1890s gothic estate hidden in the Appalachian woods where clocks still tick inside the sealed attic.',
    format: 'YouTube' as VideoFormat,
    duration: 90,
    aspectRatio: '16:9' as AspectRatio,
    tone: 'Dramatic' as VideoTone,
  },
  {
    label: 'Furniture Store Ad (30s)',
    idea: 'A stylish 30-second commercial for a Scandinavian handcrafted furniture studio emphasizing sustainable solid oak and minimalist living room transformations.',
    format: 'Instagram Reels' as VideoFormat,
    duration: 30,
    aspectRatio: '9:16' as AspectRatio,
    tone: 'Professional' as VideoTone,
  },
  {
    label: 'AI Explained Simply (60s)',
    idea: 'An educational motion-graphics video explaining how large language models predict the next word using probabilistic embeddings rather than conscious thinking.',
    format: 'Educational Video' as VideoFormat,
    duration: 60,
    aspectRatio: '16:9' as AspectRatio,
    tone: 'Educational' as VideoTone,
  },
  {
    label: 'Friendship Short Film (120s)',
    idea: 'A poignant 2-minute short film about two childhood friends meeting after ten years at an old rooftop bench where they buried a time capsule in high school.',
    format: 'Short Film' as VideoFormat,
    duration: 120,
    aspectRatio: '16:9' as AspectRatio,
    tone: 'Emotional' as VideoTone,
  },
];

export const IdeaInputForm: React.FC<IdeaInputFormProps> = ({
  onGenerate,
  isLoading,
  loadingStepText,
  initialValues,
}) => {
  const [idea, setIdea] = useState(initialValues?.idea || '');
  const [videoFormat, setVideoFormat] = useState<VideoFormat>(initialValues?.videoFormat || 'YouTube');
  const [durationPreset, setDurationPreset] = useState<number | 'custom'>(
    initialValues?.duration && [15, 30, 60, 90, 120].includes(initialValues.duration)
      ? initialValues.duration
      : 60
  );
  const [customDuration, setCustomDuration] = useState<number>(
    initialValues?.duration && ![15, 30, 60, 90, 120].includes(initialValues.duration)
      ? initialValues.duration
      : 45
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(initialValues?.aspectRatio || '16:9');
  const [language, setLanguage] = useState<Language>(initialValues?.language || 'English');
  const [tone, setTone] = useState<VideoTone>(initialValues?.tone || 'Professional');
  const [targetAudience, setTargetAudience] = useState<string>(
    initialValues?.targetAudience || 'General audience interested in high-quality storytelling'
  );
  const [numScenes, setNumScenes] = useState<number | 'auto'>('auto');

  // Brand guidelines collapsible
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [brandName, setBrandName] = useState(initialValues?.brandSettings?.brandName || '');
  const [brandColors, setBrandColors] = useState(initialValues?.brandSettings?.brandColors || '');
  const [toneOfVoice, setToneOfVoice] = useState(initialValues?.brandSettings?.toneOfVoice || '');
  const [productDetails, setProductDetails] = useState(initialValues?.brandSettings?.productDetails || '');
  const [approvedSlogans, setApprovedSlogans] = useState(initialValues?.brandSettings?.approvedSlogans || '');
  const [prohibitedPhrases, setProhibitedPhrases] = useState(
    initialValues?.brandSettings?.prohibitedPhrases || ''
  );

  const [formError, setFormError] = useState<string | null>(null);

  const handleApplyChip = (chip: typeof SAMPLE_IDEA_CHIPS[0]) => {
    setIdea(chip.idea);
    setVideoFormat(chip.format);
    setDurationPreset(chip.duration);
    setAspectRatio(chip.aspectRatio);
    setTone(chip.tone);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setFormError('Please enter a description of your video idea.');
      return;
    }
    setFormError(null);

    const actualDuration = durationPreset === 'custom' ? Math.max(5, customDuration) : durationPreset;

    const brandSettings: BrandSettings | undefined =
      brandName.trim() ||
      brandColors.trim() ||
      toneOfVoice.trim() ||
      productDetails.trim() ||
      approvedSlogans.trim() ||
      prohibitedPhrases.trim()
        ? {
            brandName: brandName.trim(),
            brandColors: brandColors.trim(),
            toneOfVoice: toneOfVoice.trim(),
            productDetails: productDetails.trim(),
            approvedSlogans: approvedSlogans.trim(),
            prohibitedPhrases: prohibitedPhrases.trim(),
          }
        : undefined;

    await onGenerate({
      idea: idea.trim(),
      videoFormat,
      duration: actualDuration,
      aspectRatio,
      language,
      tone,
      targetAudience: targetAudience.trim(),
      numScenes,
      brandSettings,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-7 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Describe Your Video Idea</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Enter any video concept and let AI engineer a scene-by-scene storyboard with professional timing and camera directions.
          </p>
        </div>
      </div>

      {/* Quick Inspiration Chips */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
          <span>Quick Inspiration Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_IDEA_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyChip(chip)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/80 hover:border-purple-200 transition-all text-left"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Idea Textarea */}
        <div>
          <label htmlFor="video-idea-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Video Concept & Key Elements <span className="text-purple-600">*</span>
          </label>
          <textarea
            id="video-idea-input"
            rows={4}
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="e.g. A 60-second cinematic commercial for an artisan coffee roastery. The story follows a misty dawn harvest, the crackle of hand-roasting beans, and an energetic morning rush in a cozy downtown cafe. Emphasize warmth and craftsmanship."
            className="w-full px-4 py-3 text-slate-900 text-sm sm:text-base placeholder-slate-400 bg-slate-50/60 rounded-xl border border-slate-300 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 transition-all outline-none resize-y"
            disabled={isLoading}
          />
          {formError && (
            <p className="mt-1.5 text-xs font-medium text-rose-600 flex items-center gap-1">
              <span>•</span> {formError}
            </p>
          )}
        </div>

        {/* Video Production Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70">
          {/* Format */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Film className="w-3.5 h-3.5 text-purple-600" />
              <span>Video Format</span>
            </label>
            <select
              value={videoFormat}
              onChange={(e) => setVideoFormat(e.target.value as VideoFormat)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              disabled={isLoading}
            >
              <option value="YouTube">YouTube Video</option>
              <option value="YouTube Shorts">YouTube Shorts</option>
              <option value="TikTok">TikTok</option>
              <option value="Instagram Reels">Instagram Reels</option>
              <option value="Advertisement">Advertisement / Commercial</option>
              <option value="Educational Video">Educational Video</option>
              <option value="Short Film">Short Film / Narrative</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Duration</span>
            </label>
            <div className="flex gap-1.5">
              <select
                value={durationPreset}
                onChange={(e) => {
                  const val = e.target.value;
                  setDurationPreset(val === 'custom' ? 'custom' : Number(val));
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                disabled={isLoading}
              >
                <option value={15}>15 Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds (1 min)</option>
                <option value={90}>90 Seconds (1.5 min)</option>
                <option value={120}>120 Seconds (2 min)</option>
                <option value="custom">Custom...</option>
              </select>
              {durationPreset === 'custom' && (
                <div className="flex items-center w-24">
                  <input
                    type="number"
                    min={5}
                    max={600}
                    value={customDuration}
                    onChange={(e) => setCustomDuration(Number(e.target.value))}
                    className="w-full px-2 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Sec"
                    disabled={isLoading}
                  />
                  <span className="text-xs text-slate-500 ml-1">s</span>
                </div>
              )}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Ratio className="w-3.5 h-3.5 text-purple-600" />
              <span>Aspect Ratio</span>
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              disabled={isLoading}
            >
              <option value="16:9">16:9 (Landscape - YouTube / TV)</option>
              <option value="9:16">9:16 (Vertical - Shorts / TikTok)</option>
              <option value="1:1">1:1 (Square - Feed / Social)</option>
            </select>
          </div>

          {/* Tone */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>Tone & Vibe</span>
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as VideoTone)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              disabled={isLoading}
            >
              <option value="Professional">Professional</option>
              <option value="Cinematic">Cinematic & Moody</option>
              <option value="Emotional">Emotional & Heartfelt</option>
              <option value="Funny">Funny & Lighthearted</option>
              <option value="Educational">Educational & Clear</option>
              <option value="Dramatic">Dramatic & Suspenseful</option>
            </select>
          </div>
        </div>

        {/* Secondary Parameters Row: Language, Target Audience, Scene Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Language Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Languages className="w-3.5 h-3.5 text-purple-600" />
              <span>Language (Dialogue & Script)</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              disabled={isLoading}
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو)</option>
              <option value="Roman Urdu">Roman Urdu (Urdu in Latin Script)</option>
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Target Audience</span>
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Young professionals, tech hobbyists, students"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              disabled={isLoading}
            />
          </div>

          {/* Number of Scenes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
              <span>Scene Count</span>
            </label>
            <select
              value={numScenes}
              onChange={(e) => {
                const val = e.target.value;
                setNumScenes(val === 'auto' ? 'auto' : Number(val));
              }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              disabled={isLoading}
            >
              <option value="auto">Automatic (AI Pacing)</option>
              <option value={3}>3 Scenes (Fast / Minimal)</option>
              <option value={4}>4 Scenes</option>
              <option value={5}>5 Scenes</option>
              <option value={6}>6 Scenes (Standard)</option>
              <option value={7}>7 Scenes</option>
              <option value={8}>8 Scenes</option>
              <option value={10}>10 Scenes (Extended)</option>
              <option value={12}>12 Scenes (Complex)</option>
            </select>
          </div>
        </div>

        {/* Collapsible Brand Guidelines Section */}
        <div className="border border-slate-200/90 rounded-xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setShowBrandPanel(!showBrandPanel)}
            className="w-full flex items-center justify-between p-3.5 text-left text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Brand Guidelines & Consistency Controls (Optional)</span>
              {(brandName || approvedSlogans || prohibitedPhrases) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                  Active
                </span>
              )}
            </div>
            {showBrandPanel ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showBrandPanel && (
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand / Company Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Lumina Audio, EcoLiving"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Colors & Style</label>
                <input
                  type="text"
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                  placeholder="e.g. Deep navy #0A192F, Electric cyan, minimalist white"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Details / Features</label>
                <input
                  type="text"
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                  placeholder="e.g. Active noise cancelling, 30h battery, recycled aluminum"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tone of Voice</label>
                <input
                  type="text"
                  value={toneOfVoice}
                  onChange={(e) => setToneOfVoice(e.target.value)}
                  placeholder="e.g. Bold, sophisticated, conversational, zero fluff"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Approved Slogans / Required Lines</label>
                <input
                  type="text"
                  value={approvedSlogans}
                  onChange={(e) => setApprovedSlogans(e.target.value)}
                  placeholder="e.g. Silence the noise. Hear the truth."
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prohibited Words & Claims</label>
                <input
                  type="text"
                  value={prohibitedPhrases}
                  onChange={(e) => setProhibitedPhrases(e.target.value)}
                  placeholder="e.g. cheap, #1 in the world, magical, guaranteed cures"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Generate Button & Progress State */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2.5 ${
              isLoading
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>{loadingStepText || 'Generating Storyboard & AI Analysis...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Storyboard</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
