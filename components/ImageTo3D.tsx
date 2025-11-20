import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, Download, Box, AlertCircle } from 'lucide-react';
import { generate3DFromImageService } from '../services/gemini';
import { ThreePreview } from './ThreePreview';

export const ImageTo3D: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [objData, setObjData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size too large. Please upload an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setObjData(null); // Reset previous result
        setError(null);
        setProgress(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setIsGenerating(true);
    setError(null);
    setObjData(null);
    setProgress(0);

    // Simulate progress since the API doesn't return stream for this specific task easily
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        // Non-linear progress simulation
        const increment = prev < 30 ? 5 : prev < 70 ? 2 : 0.5;
        return Math.min(prev + increment, 95);
      });
    }, 150);

    try {
      const result = await generate3DFromImageService(image);
      
      if (!result.includes("v ") || !result.includes("f ")) {
          throw new Error("The AI did not produce a valid OBJ structure. Please try a clearer image.");
      }
      
      clearInterval(interval);
      setProgress(100);

      // Small delay to allow user to see 100% completion before rendering
      setTimeout(() => {
        setObjData(result);
        setIsGenerating(false);
      }, 600);
      
    } catch (err: any) {
      clearInterval(interval);
      setIsGenerating(false);
      setError(err.message || "Failed to generate 3D model. Please try again.");
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!objData) return;
    const blob = new Blob([objData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model.obj';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-white">Image to 3D Transformation</h1>
        <p className="text-slate-400">
          Upload an image and let our AI interpret its geometry to create a 3D .OBJ model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
        {/* Left Column: Input */}
        <div className="flex flex-col space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <div className="flex-1 relative border-2 border-dashed border-slate-700 rounded-xl overflow-hidden bg-slate-900/50 group transition-colors hover:border-indigo-500/50">
            {image ? (
              <img 
                src={image} 
                alt="Upload preview" 
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                <Upload size={48} className="text-slate-600 group-hover:text-indigo-500 transition-colors" />
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs">Supports PNG, JPG, WEBP</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center space-x-3 text-red-400 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!image || isGenerating}
            className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
              !image || isGenerating
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" size={20} />
                <span>Processing Geometry...</span>
              </>
            ) : (
              <>
                <Box size={20} />
                <span>Generate 3D Model</span>
              </>
            )}
          </button>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="w-full space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                <span>Analyzing Structure</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div 
                  className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col bg-slate-900/50 p-6 rounded-2xl border border-slate-800 relative">
            <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative">
                {objData ? (
                  <ThreePreview objData={objData} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                      <div className="text-center px-8">
                        {isGenerating ? (
                          <p className="animate-pulse text-indigo-400">AI is imagining 3D shapes...</p>
                        ) : (
                          <>
                            <p>The 3D preview will appear here after generation.</p>
                            <span className="text-xs opacity-50 block mt-2">Interactive viewer powered by Three.js</span>
                          </>
                        )}
                      </div>
                  </div>
                )}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-slate-500">
                    Format: Wavefront (.obj)
                </span>
                <button
                    onClick={handleDownload}
                    disabled={!objData}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        objData 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    <Download size={18} />
                    <span>Download .OBJ</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};