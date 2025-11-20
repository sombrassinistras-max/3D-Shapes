import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, Download } from 'lucide-react';
import { generateImageService } from '../services/gemini';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateImageService(prompt);
      setGeneratedImage(result);
    } catch (error) {
      console.error(error);
      // Simple alert for demo purposes, in real app use a toast
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">AI Image Studio</h2>
        <p className="text-slate-400">Powered by Imagen 4.0. Describe your vision in detail.</p>
      </div>

      <form onSubmit={handleGenerate} className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <Sparkles size={20} />
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic city with flying cars, neon lights, cyberpunk style..."
          className="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-32 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        />
        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isGenerating ? 'Creating...' : 'Generate'}
        </button>
      </form>

      {generatedImage && (
        <div className="bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-2xl animate-fade-in">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl group">
                <img 
                    src={generatedImage} 
                    alt={prompt} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                        href={generatedImage} 
                        download={`neuroshape-${Date.now()}.jpg`}
                        className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center space-x-2 hover:bg-slate-100 transition-transform hover:scale-105"
                    >
                        <Download size={20} />
                        <span>Download HD</span>
                    </a>
                </div>
            </div>
        </div>
      )}
      
      {!generatedImage && !isGenerating && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <ImageIcon size={48} className="mb-4 opacity-50" />
              <p>Your masterpiece will appear here</p>
          </div>
      )}
    </div>
  );
};
