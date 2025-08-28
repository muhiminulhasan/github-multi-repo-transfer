import React, { useState } from 'react';
import { Eye, EyeOff, Github, Lock, LogOut, User } from 'lucide-react';
import type { GitHubUser } from '../types/github';

interface AuthStepProps {
  onAuthenticate: (token: string) => Promise<void>;
  currentUser: GitHubUser | null;
  onLogout: () => void;
  loading: boolean;
  error: string | null;
}

export const AuthStep: React.FC<AuthStepProps> = ({ 
  onAuthenticate, 
  currentUser, 
  onLogout, 
  loading, 
  error 
}) => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      await onAuthenticate(token.trim());
    }
  };

  // If user is already authenticated, show logout option
  if (currentUser) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Github className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Already Authenticated</h2>
          <p className="text-gray-600">
            You're currently logged in as <strong>{currentUser.name || currentUser.login}</strong>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{currentUser.name || currentUser.login}</p>
              <p className="text-sm text-gray-600">@{currentUser.login}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Remove Token & Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Github className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">GitHub Authentication</h2>
        <p className="text-gray-600">
          Enter your GitHub Personal Access Token to get started. We need admin access to your repositories for transfers.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Lock className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Token Requirements:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>Must have <code className="bg-amber-100 px-1 rounded">repo</code> scope for repository access</li>
              <li>Must have <code className="bg-amber-100 px-1 rounded">admin:org</code> scope for organization transfers</li>
              <li>Create token at <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">GitHub Settings</a></li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            Personal Access Token
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!token.trim() || loading}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Authenticating...
            </>
          ) : (
            'Authenticate with GitHub'
          )}
        </button>
      </form>
    </div>
  );
};