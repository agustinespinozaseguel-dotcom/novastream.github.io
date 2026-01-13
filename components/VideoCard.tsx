
import React, { useState, useEffect } from 'react';
import { VideoMetadata, GlobalAuthorStats } from '../types';

interface VideoCardProps {
  video: VideoMetadata;
  onClick: (video: VideoMetadata) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const [authorAvatar, setAuthorAvatar] = useState(video.thumbnail || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.author}`);

  useEffect(() => {
    // Attempt to pull latest avatar from global stats if available in localStorage
    const savedStats = localStorage.getItem('novastream_author_stats');
    if (savedStats) {
      const stats: GlobalAuthorStats = JSON.parse(savedStats);
      if (stats[video.author]?.avatar) {
        setAuthorAvatar(stats[video.author].avatar!);
      }
    }
  }, [video.author]);

  return (
    <div 
      onClick={() => onClick(video)}
      className="cursor-pointer group flex flex-col gap-4"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl group-hover:scale-[1.03] transition-all duration-500 ease-out group-hover:shadow-red-500/5 group-hover:border-zinc-700">
        <video 
          src={video.url} 
          className="w-full h-full object-cover transition-opacity duration-300 opacity-90 group-hover:opacity-100"
          muted
          onMouseEnter={(e) => e.currentTarget.play()}
          onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-transparent transition-all" />
        <span className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black text-white border border-white/10 tracking-wider">
          {video.duration}
        </span>
      </div>
      
      <div className="flex gap-4 px-1">
        <img 
          src={authorAvatar} 
          className="w-11 h-11 rounded-full bg-zinc-800 border-2 border-zinc-800 group-hover:border-red-500/50 transition-colors flex-shrink-0 object-cover" 
          alt="author"
        />
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-bold text-zinc-100 text-base line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
            {video.title}
          </h3>
          <p className="text-zinc-500 text-sm font-semibold mt-1.5 hover:text-zinc-300 transition-colors">{video.author}</p>
          <div className="flex items-center gap-1.5 text-zinc-600 text-[11px] mt-0.5 font-bold uppercase tracking-tight">
            <span>{video.views.toLocaleString()} views</span>
            <span className="text-zinc-800 font-normal">•</span>
            <span>{video.uploadedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
