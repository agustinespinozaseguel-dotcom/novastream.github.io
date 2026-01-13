
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { VideoMetadata, User, GlobalAuthorStats, Playlist } from './types';
import { VideoCard } from './components/VideoCard';
import { VideoPlayer } from './components/VideoPlayer';
import { UploadModal } from './components/UploadModal';
import { LoginModal } from './components/LoginModal';
import { PlaylistModal } from './components/PlaylistModal';

type ViewMode = 'HOME' | 'VIDEO' | 'PROFILE' | 'PLAYLIST';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('HOME');
  const [profileAuthor, setProfileAuthor] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('novastream_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [videos, setVideos] = useState<VideoMetadata[]>(() => {
    const saved = localStorage.getItem('novastream_videos');
    return saved ? JSON.parse(saved) : [];
  });

  const [authorStats, setAuthorStats] = useState<GlobalAuthorStats>(() => {
    const saved = localStorage.getItem('novastream_author_stats');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistence
  useEffect(() => {
    localStorage.setItem('novastream_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('novastream_author_stats', JSON.stringify(authorStats));
  }, [authorStats]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('novastream_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('novastream_user');
    }
  }, [currentUser]);

  // Handlers
  const handleLogin = (user: User) => {
    const initialUser = { ...user, playlists: user.playlists || [] };
    setCurrentUser(initialUser);
    if (!authorStats[user.username]) {
      setAuthorStats(prev => ({
        ...prev,
        [user.username]: { subscriberCount: 0, videoCount: 0, avatar: user.avatar }
      }));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('HOME');
  };

  const handleUpload = (newVideo: VideoMetadata) => {
    if (!currentUser) return;
    const videoWithUser = { ...newVideo, author: currentUser.username, views: 0, likes: 0 };
    setVideos(prev => [videoWithUser, ...prev]);
    setAuthorStats(prev => ({
      ...prev,
      [currentUser.username]: {
        ...prev[currentUser.username],
        videoCount: (prev[currentUser.username]?.videoCount || 0) + 1
      }
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Update current user
        setCurrentUser({ ...currentUser, avatar: base64String });
        
        // Update global author stats for consistency
        setAuthorStats(prev => ({
          ...prev,
          [currentUser.username]: {
            ...prev[currentUser.username],
            avatar: base64String
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoClick = (video: VideoMetadata) => {
    setSelectedVideo(video);
    setViewMode('VIDEO');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, views: v.views + 1 } : v));
  };

  const navigateToProfile = (authorName: string) => {
    setProfileAuthor(authorName);
    setViewMode('PROFILE');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSubscribe = (authorName: string) => {
    if (!currentUser || authorName === currentUser.username) return;
    const isSubscribed = currentUser.subscriptions.includes(authorName);
    const newSubs = isSubscribed
      ? currentUser.subscriptions.filter(s => s !== authorName)
      : [...currentUser.subscriptions, authorName];

    setCurrentUser({ ...currentUser, subscriptions: newSubs });
    setAuthorStats(prev => ({
      ...prev,
      [authorName]: {
        ...prev[authorName],
        subscriberCount: isSubscribed 
          ? Math.max(0, (prev[authorName]?.subscriberCount || 0) - 1) 
          : (prev[authorName]?.subscriberCount || 0) + 1
      }
    }));
  };

  const toggleLike = (videoId: string) => {
    if (!currentUser) return;
    const isLiked = currentUser.likedVideos.includes(videoId);
    const newLikedVideos = isLiked 
      ? currentUser.likedVideos.filter(id => id !== videoId)
      : [...currentUser.likedVideos, videoId];
    setCurrentUser({ ...currentUser, likedVideos: newLikedVideos });
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, likes: isLiked ? Math.max(0, v.likes - 1) : v.likes + 1 } : v));
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(v => 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videos, searchQuery]);

  if (!currentUser) return <LoginModal onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pb-20 bg-[#0f0f0f]">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleAvatarChange} 
        className="hidden" 
        accept="image/*" 
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 md:px-8">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('HOME')}>
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15.5l6-3.5-6-3.5v7zM21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12z"/></svg>
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block">NOVA<span className="text-red-600">STREAM</span></h1>
          </div>

          <div className="flex-1 max-w-2xl relative group">
            <input 
              type="text" 
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full px-6 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all text-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-zinc-800 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-700 transition-all flex items-center gap-2 border border-zinc-700 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              <span className="hidden md:inline">Upload</span>
            </button>
            <div className="group relative">
              <img src={currentUser.avatar} className="w-9 h-9 rounded-full border-2 border-zinc-800 hover:border-red-500 cursor-pointer transition-colors object-cover" alt="avatar" />
              <div className="absolute right-0 top-full mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-3 z-50">
                <div className="px-3 py-2 border-b border-zinc-800 mb-2">
                  <p className="font-bold truncate text-white">{currentUser.username}</p>
                </div>
                <button onClick={() => navigateToProfile(currentUser.username)} className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors font-bold flex items-center gap-2">
                   Your Profile
                </button>
                <div className="mt-2 py-2 border-t border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-500 uppercase px-3 mb-1">Playlists</p>
                  {currentUser.playlists.map(pl => (
                    <button 
                      key={pl.id} 
                      onClick={() => { setSelectedPlaylist(pl); setViewMode('PLAYLIST'); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors truncate"
                    >
                      {pl.name}
                    </button>
                  ))}
                </div>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-colors font-bold border-t border-zinc-800 mt-2">
                   Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 py-8 md:px-8">
        {viewMode === 'VIDEO' && selectedVideo ? (
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 lg:max-w-[72%]">
              <VideoPlayer video={selectedVideo} />
              <div className="mt-8">
                <h2 className="text-2xl font-black text-white">{selectedVideo.title}</h2>
                <div className="flex flex-wrap items-center justify-between gap-6 mt-6 py-6 border-y border-zinc-800/50">
                  <div className="flex items-center gap-4">
                    <img 
                      onClick={() => navigateToProfile(selectedVideo.author)}
                      src={authorStats[selectedVideo.author]?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedVideo.author}`} 
                      className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 cursor-pointer hover:border-red-500 transition-colors object-cover" 
                      alt="author" 
                    />
                    <div>
                      <p onClick={() => navigateToProfile(selectedVideo.author)} className="font-bold text-lg text-white cursor-pointer hover:text-red-500 transition-colors">{selectedVideo.author}</p>
                      <p className="text-zinc-500 text-sm">{(authorStats[selectedVideo.author]?.subscriberCount || 0).toLocaleString()} real subscribers</p>
                    </div>
                    {selectedVideo.author !== currentUser.username && (
                      <button onClick={() => toggleSubscribe(selectedVideo.author)} className={`ml-6 px-8 py-2.5 rounded-full text-sm font-black transition-all active:scale-95 ${currentUser.subscriptions.includes(selectedVideo.author) ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-black hover:bg-zinc-200'}`}>
                        {currentUser.subscriptions.includes(selectedVideo.author) ? 'SUBSCRIBED' : 'SUBSCRIBE'}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleLike(selectedVideo.id)} className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${currentUser.likedVideos.includes(selectedVideo.id) ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                      <span className="font-black">{selectedVideo.likes.toLocaleString()}</span>
                    </button>
                    <button onClick={() => setIsPlaylistModalOpen(true)} className="flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                      Save
                    </button>
                  </div>
                </div>
                <div className="mt-6 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                  <p className="text-sm font-bold text-white mb-2">{selectedVideo.views.toLocaleString()} views • {selectedVideo.uploadedAt}</p>
                  <p className="text-base text-zinc-300 leading-relaxed">{selectedVideo.description}</p>
                </div>
              </div>
            </div>
            <div className="lg:w-[28%] flex flex-col gap-6">
              <h3 className="font-black text-sm uppercase tracking-widest text-zinc-500 mb-2">Recommended</h3>
              {videos.filter(v => v.id !== selectedVideo.id).map(video => (
                <div key={video.id} onClick={() => handleVideoClick(video)} className="flex gap-4 cursor-pointer group">
                  <div className="w-44 h-28 rounded-xl overflow-hidden flex-shrink-0 relative bg-zinc-800 border border-zinc-800 shadow-sm group-hover:border-red-500/50 transition-colors">
                    <video src={video.url} className="w-full h-full object-cover" muted />
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-zinc-100 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">{video.title}</h4>
                    <p className="text-xs text-zinc-500 font-medium">{video.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'PROFILE' && profileAuthor ? (
          <div className="flex flex-col gap-10">
             <div className="flex flex-col md:flex-row items-center gap-8 p-10 bg-zinc-900/40 rounded-3xl border border-zinc-800 shadow-xl">
                <div className="relative group">
                  <img 
                    src={authorStats[profileAuthor]?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileAuthor}`} 
                    className="w-32 h-32 rounded-full border-4 border-zinc-800 shadow-2xl object-cover" 
                    alt="profile" 
                  />
                  {profileAuthor === currentUser.username && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </button>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <h2 className="text-4xl font-black text-white">{profileAuthor}</h2>
                    {profileAuthor === currentUser.username && (
                      <span className="px-2 py-0.5 bg-red-600/10 text-red-500 text-[10px] font-black uppercase rounded border border-red-500/20">Creator</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-zinc-500">
                    <span className="font-bold">{(authorStats[profileAuthor]?.subscriberCount || 0).toLocaleString()} Subscribers</span>
                    <span>•</span>
                    <span className="font-bold">{(authorStats[profileAuthor]?.videoCount || 0)} Videos</span>
                  </div>
                </div>
                {profileAuthor !== currentUser.username && (
                  <button onClick={() => toggleSubscribe(profileAuthor)} className={`px-10 py-3 rounded-full text-lg font-black transition-all active:scale-95 ${currentUser.subscriptions.includes(profileAuthor) ? 'bg-zinc-800 text-zinc-400' : 'bg-red-600 text-white hover:bg-red-700 shadow-xl'}`}>
                    {currentUser.subscriptions.includes(profileAuthor) ? 'SUBSCRIBED' : 'SUBSCRIBE'}
                  </button>
                )}
             </div>
             <div>
                <h3 className="text-xl font-black mb-8 border-b border-zinc-800 pb-4 text-white uppercase tracking-widest">Uploaded Videos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {videos.filter(v => v.author === profileAuthor).map(video => (
                    <VideoCard key={video.id} video={video} onClick={handleVideoClick} />
                  ))}
                  {videos.filter(v => v.author === profileAuthor).length === 0 && <p className="text-zinc-600 col-span-full py-10 text-center text-lg italic">No videos uploaded yet.</p>}
                </div>
             </div>
          </div>
        ) : viewMode === 'PLAYLIST' && selectedPlaylist ? (
          <div className="flex flex-col gap-8">
            <div className="flex items-end gap-8 p-10 bg-gradient-to-t from-zinc-900 to-zinc-800/20 rounded-3xl border border-zinc-800 min-h-[300px] shadow-2xl">
              <div className="w-64 aspect-video bg-zinc-800 rounded-2xl flex items-center justify-center shadow-2xl border border-zinc-700">
                 <svg className="w-16 h-16 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-2">Playlist</p>
                <h2 className="text-5xl font-black text-white">{selectedPlaylist.name}</h2>
                <p className="mt-4 text-zinc-400 font-bold">{selectedPlaylist.videoIds.length} Videos • Created {selectedPlaylist.createdAt}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {videos.filter(v => selectedPlaylist.videoIds.includes(v.id)).map(video => (
                <VideoCard key={video.id} video={video} onClick={handleVideoClick} />
              ))}
              {selectedPlaylist.videoIds.length === 0 && <p className="text-zinc-600 col-span-full py-20 text-center text-lg italic">This playlist is empty.</p>}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
              {['All', 'Music', 'Gaming', 'AI', 'Coding', 'Live', 'Comedy'].map((cat, i) => (
                <button key={cat} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-white text-black shadow-md' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                  {cat}
                </button>
              ))}
            </div>
            {filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-12">
                {filteredVideos.map(video => (
                  <VideoCard key={video.id} video={video} onClick={handleVideoClick} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                 <h3 className="text-2xl font-black mb-3 text-white">No content found</h3>
                 <p className="text-zinc-500 max-w-md mb-10 text-lg">Be the first to upload and earn real subscribers.</p>
                 <button onClick={() => setIsUploadModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-red-900/30 transition-all flex items-center gap-3 text-lg">Upload Now</button>
              </div>
            )}
          </div>
        )}
      </main>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />
      {selectedVideo && (
        <PlaylistModal 
          isOpen={isPlaylistModalOpen} 
          onClose={() => setIsPlaylistModalOpen(false)} 
          user={currentUser} 
          videoId={selectedVideo.id}
          onUpdateUser={setCurrentUser}
        />
      )}
    </div>
  );
};

export default App;
