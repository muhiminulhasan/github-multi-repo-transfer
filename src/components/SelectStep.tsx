import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, Star, GitFork, Eye, EyeOff, Calendar, User, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { GitHubRepository } from '../types/github';

interface SelectStepProps {
  repositories: GitHubRepository[];
  selectedRepos: string[];
  onSelectionChange: (repoNames: string[]) => void;
  onNext: () => void;
  loading: boolean;
}

export const SelectStep: React.FC<SelectStepProps> = ({
  repositories,
  selectedRepos,
  onSelectionChange,
  onNext,
  loading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'personal' | 'organization'>('all');

  // Get unique owners for filtering
  const owners = useMemo(() => {
    const ownerSet = new Set(repositories.map(repo => repo.owner.login));
    return Array.from(ownerSet).sort();
  }, [repositories]);

  const filteredRepositories = useMemo(() => {
    return repositories.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesVisibility = visibilityFilter === 'all' || 
        (visibilityFilter === 'private' && repo.private) ||
        (visibilityFilter === 'public' && !repo.private);
      
      const matchesOwner = ownerFilter === 'all' ||
        (ownerFilter === 'personal' && repo.owner.type === 'User') ||
        (ownerFilter === 'organization' && repo.owner.type === 'Organization');
      
      return matchesSearch && matchesVisibility && matchesOwner;
    });
  }, [repositories, searchQuery, visibilityFilter, ownerFilter]);

  // Keyboard shortcut for select all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target instanceof HTMLElement && 
          !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        handleSelectAll();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredRepositories, selectedRepos]);

  const handleSelectAll = () => {
    if (selectedRepos.length === filteredRepositories.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredRepositories.map(repo => repo.name));
    }
  };

  const handleRepoToggle = (repoName: string) => {
    if (selectedRepos.includes(repoName)) {
      onSelectionChange(selectedRepos.filter(name => name !== repoName));
    } else {
      onSelectionChange([...selectedRepos, repoName]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Repositories</h2>
        <p className="text-gray-600">
          Choose which repositories you want to transfer. You can select multiple repositories at once.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Owners</option>
                <option value="personal">Personal</option>
                <option value="organization">Organizations</option>
              </select>
              
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Repos</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>
              
              <button
                onClick={handleSelectAll}
                className="px-4 py-3 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                title="Ctrl/Cmd + A"
              >
                {selectedRepos.length === filteredRepositories.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>

        {/* Repository List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading repositories...</p>
            </div>
          ) : filteredRepositories.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery || visibilityFilter !== 'all' || ownerFilter !== 'all' 
                  ? 'No repositories match your filters.' 
                  : 'No repositories found.'}
              </p>
              {(searchQuery || visibilityFilter !== 'all' || ownerFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setVisibilityFilter('all');
                    setOwnerFilter('all');
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            filteredRepositories.map((repo) => (
              <div
                key={repo.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  selectedRepos.includes(repo.name) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedRepos.includes(repo.name)}
                    onChange={() => handleRepoToggle(repo.name)}
                    className="mt-1 h-5 w-5 text-blue-600 rounded border-2 border-gray-400 focus:ring-blue-500 focus:ring-2"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {repo.owner.type === 'Organization' ? (
                          <Building className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                        <span className="text-xs text-gray-500">@{repo.owner.login}</span>
                      </div>
                      <span className="text-gray-400">/</span>
                      <h3 className="font-semibold text-gray-900 truncate">{repo.name}</h3>
                      <div className="flex items-center gap-1">
                        {repo.private ? (
                          <EyeOff className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-600" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          repo.private ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {repo.private ? 'Private' : 'Public'}
                        </span>
                      </div>
                    </div>
                    
                    {repo.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{repo.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        repo.owner.type === 'Organization' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {repo.owner.type === 'Organization' ? 'Organization' : 'Personal'}
                      </span>
                      {repo.language && (
                        <span className="inline-flex items-center">
                          <span className="w-3 h-3 rounded-full bg-gray-400 mr-1"></span>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-4 h-4" />
                        {repo.forks_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selection Summary */}
        {selectedRepos.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedRepos.length} repositor{selectedRepos.length === 1 ? 'y' : 'ies'} selected
                </p>
                <p className="text-xs text-gray-500">
                  Use Ctrl/Cmd + A to select all visible repositories
                </p>
              </div>
              <button
                onClick={onNext}
                disabled={selectedRepos.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        {/* No selection state */}
        {selectedRepos.length === 0 && !loading && filteredRepositories.length > 0 && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Select repositories to transfer
              </p>
              <p className="text-xs text-gray-500">
                Use the checkboxes or "Select All" button to choose repositories
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};