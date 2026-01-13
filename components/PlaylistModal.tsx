
import React, { useState } from 'react';
import { User, Playlist } from '../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  videoId: string;
  onUpdateUser: (user: User) => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose, user, videoId, onUpdateUser }) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');

  if (!isOpen) return null;

  const toggleVideoInPlaylist = (playlistId: string) => {
    const updatedPlaylists = user.playlists.map(pl => {
      if (pl.id === playlistId) {
        const hasVideo = pl.videoIds.includes(videoId);
        return {
          ...pl,
          videoIds: hasVideo 
            ? pl.videoIds.filter(id => id !== videoId)
            : [...pl.videoIds, videoId]
        };
      }
      return pl;
    });
    onUpdateUser({ ...user, playlists: updatedPlaylists });
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist: Playlist = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlaylistName,
      videoIds: [videoId],
      createdAt: new Date().toLocaleDateString()
    };
    onUpdateUser({ ...user, playlists: [...user.playlists, newPlaylist] });
    setNewPlaylistName('');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="font-bold text-lg text-white">Save to playlist</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        
        <div className="p-4 max-h-60 overflow-y-auto space-y-2">
          {user.playlists.map(pl => (
            <label key={pl.id} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={pl.videoIds.includes(videoId)}
                onChange={() => toggleVideoInPlaylist(pl.id)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-zinc-200">{pl.name}</span>
            </label>
          ))}
          {user.playlists.length === 0 && <p className="text-zinc-500 text-sm text-center py-4">No playlists yet</p>}
        </div>

        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
            <button 
              onClick={createPlaylist}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
