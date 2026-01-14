
import React, { useState } from 'react';
import { VideoMetadata } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (video: VideoMetadata) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Pre-fill title with filename (minus extension) as a starting point
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return;

    setIsUploading(true);
    setStatus('Processing video data...');

    const videoUrl = URL.createObjectURL(file);
    
    // REAL DATA: All metrics start at pure zero. No AI analysis.
    const newVideo: VideoMetadata = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description.trim() || "No description provided.",
      url: videoUrl,
      thumbnail: '', 
      duration: '0:30', // Simplified for demo
      views: 0,
      likes: 0,
      author: 'User', // Will be overwritten by App's handleUpload
      uploadedAt: 'Just now',
      qualities: ['360p', '720p', '1080p', '4K'],
      category: category
    };

    setTimeout(() => {
      onUpload(newVideo);
      setIsUploading(false);
      resetForm();
      onClose();
    }, 1200);
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setCategory('General');
    setStatus('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Upload Content</h2>
          <button onClick={handleClose} className="text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-10">
          {!isUploading ? (
            <div className="flex flex-col gap-6">
              {!file ? (
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
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm13 0H5v8h10V6z"/></svg>
                    <span className="text-xs font-bold text-zinc-400 truncate flex-1">{file.name}</span>
                    <button onClick={() => setFile(null)} className="text-zinc-600 hover:text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Video Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your video a name..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this video about?"
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-red-600 transition-colors"
                    >
                      {['General', 'Music', 'Gaming', 'AI', 'Coding', 'Live', 'Comedy'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    disabled={!title.trim()}
                    onClick={handleUpload}
                    className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all text-sm mt-4 ${title.trim() ? 'bg-white text-black hover:bg-zinc-200 shadow-2xl shadow-white/5 active:scale-[0.98]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                  >
                    Publish Content
                  </button>
                </div>
              )}
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
