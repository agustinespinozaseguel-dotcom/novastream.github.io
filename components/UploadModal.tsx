
import React, { useState } from 'react';
import { analyzeVideoContent } from '../services/geminiService';
import { VideoMetadata } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (video: VideoMetadata) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus('Initializing AI analysis...');

    try {
      const aiResult = await analyzeVideoContent(file.name);
      const videoUrl = URL.createObjectURL(file);
      
      // REAL DATA: All metrics start at pure zero.
      const newVideo: VideoMetadata = {
        id: Math.random().toString(36).substr(2, 9),
        title: aiResult.title || file.name,
        description: aiResult.description || "No description provided.",
        url: videoUrl,
        thumbnail: '', // Use first frame or dummy
        duration: '0:30', 
        views: 0,
        likes: 0,
        author: 'User', // Will be overwritten by App's handleUpload
        uploadedAt: 'Just now',
        qualities: ['360p', '720p', '1080p', '4K'],
        category: aiResult.category || "General"
      };

      setStatus('Finalizing real-time upload...');
      setTimeout(() => {
        onUpload(newVideo);
        setIsUploading(false);
        setFile(null);
        onClose();
      }, 1200);

    } catch (error) {
      console.error(error);
      setStatus('Failed to upload. Connection reset.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-2xl font-black text-white tracking-tight">NEW CONTENT</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-10">
          {!isUploading ? (
            <div className="flex flex-col items-center gap-8">
              <div className="w-full aspect-[16/9] border-4 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center bg-zinc-950 hover:bg-zinc-900 hover:border-red-600/40 transition-all cursor-pointer group relative overflow-hidden">
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                />
                <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-all text-zinc-500">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  </div>
                  <p className="text-zinc-400 font-black tracking-widest text-xs uppercase">Select Master File</p>
                  {file && <p className="mt-4 text-red-500 font-black text-sm">{file.name}</p>}
                </div>
              </div>
              <button
                disabled={!file}
                onClick={handleUpload}
                className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all text-sm ${file ? 'bg-white text-black hover:bg-zinc-200 shadow-2xl shadow-white/5 active:scale-[0.98]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
              >
                Launch with Gemini AI
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-16">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-8 border-zinc-800 rounded-full" />
                <div className="absolute inset-0 border-8 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
              </div>
              <p className="mt-10 text-zinc-400 font-black tracking-widest uppercase text-xs animate-pulse">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
