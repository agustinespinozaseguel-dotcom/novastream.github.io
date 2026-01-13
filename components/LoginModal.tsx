
import React, { useState } from 'react';
import { User } from '../types';

interface LoginModalProps {
  onLogin: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      // Simulate real login
      // Fixed: Added 'playlists' property which is required by the User interface
      const mockUser: User = {
        username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        subscriptions: [],
        likedVideos: [],
        playlists: []
      };
      onLogin(mockUser);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15.5l6-3.5-6-3.5v7zM21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H3V6h18v12z"/></svg>
          </div>
          <h2 className="text-2xl font-bold">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-zinc-500 text-sm mt-2">Sign in to NovaStream to upload and interact</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
              placeholder="e.g. video_master"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold text-white transition-all shadow-lg shadow-red-900/20"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
