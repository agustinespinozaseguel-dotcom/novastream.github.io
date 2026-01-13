
import React, { useState, useRef, useEffect } from 'react';
import { VideoMetadata, VideoQuality } from '../types';

interface VideoPlayerProps {
  video: VideoMetadata;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeQuality = (quality: VideoQuality) => {
    setCurrentQuality(quality);
    setShowQualityMenu(false);
    // In a real app, you would swap the 'src' here to a different URL
    // For this demo, we maintain the same blob but simulate the switch
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      videoRef.current.load();
      videoRef.current.currentTime = currentTime;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative group bg-black rounded-xl overflow-hidden shadow-2xl aspect-video w-full">
      <video
        ref={videoRef}
        src={video.url}
        className={`w-full h-full object-contain ${currentQuality === '360p' ? 'blur-[1px]' : ''}`}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Custom Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <div className="text-sm font-medium">{video.title}</div>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowQualityMenu(!showQualityMenu)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs font-bold border border-white/20 flex items-center gap-2"
          >
            {currentQuality}
            <svg className={`w-3 h-3 transition-transform ${showQualityMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
          </button>

          {showQualityMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-32 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 overflow-hidden z-50">
              {(['4K', '1080p', '720p', '360p'] as VideoQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => changeQuality(q)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${currentQuality === q ? 'text-red-500 font-bold' : 'text-zinc-300'}`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
