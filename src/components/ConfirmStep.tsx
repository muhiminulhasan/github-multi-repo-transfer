import React, { useState } from 'react';
import { AlertTriangle, Package, User, Building, Eye, EyeOff } from 'lucide-react';
import type { GitHubRepository, GitHubUser } from '../types/github';

interface ConfirmStepProps {
  selectedRepos: string[];
  repositories: GitHubRepository[];
  destination: string;
  isOrganization: boolean;
  destinationUser: GitHubUser | null;
  onTransfer: () => void;
  onBack: () => void;
  loading: boolean;
}

export const ConfirmStep: React.FC<ConfirmStepProps> = ({
  selectedRepos,
  repositories,
  destination,
  isOrganization,
  destinationUser,
  onTransfer,
  onBack,
  loading
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [finalConfirmed, setFinalConfirmed] = useState(false);

  const selectedRepositories = repositories.filter(repo => 
    selectedRepos.includes(repo.name)
  );

  const handleTransfer = () => {
    if (confirmed && finalConfirmed) {
      onTransfer();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Transfer</h2>
        <p className="text-gray-600">
          Please review the transfer details carefully. This action cannot be easily undone.
        </p>
      </div>

      <div className="space-y-6">
        {/* Destination Summary */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {isOrganization ? <Building className="w-6 h-6" /> : <User className="w-6 h-6" />}
            Transfer Destination
          </h3>
          
          {destinationUser && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  {isOrganization ? <Building className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {destinationUser.name || destinationUser.login}
                  </p>
                  <p className="text-sm text-gray-600">@{destinationUser.login}</p>
                  <p className="text-xs text-gray-500">
                    {isOrganization ? 'Organization' : 'User Account'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Repositories */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Selected Repositories ({selectedRepositories.length})
          </h3>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {selectedRepositories.map((repo) => (
              <div key={repo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
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
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{repo.name}</p>
                  {repo.description && (
                    <p className="text-sm text-gray-600 truncate">{repo.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Warning */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Critical Warning - Read Carefully
              </h3>
              <div className="text-sm text-red-700 space-y-2">
                <p><strong>This action will permanently transfer {selectedRepositories.length} repositor{selectedRepositories.length === 1 ? 'y' : 'ies'} to {destinationUser?.name || destination}.</strong></p>
                
                <div className="bg-red-100 rounded-lg p-3 mt-3">
                  <p className="font-medium mb-2">Consequences:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You will <strong>immediately lose admin access</strong> to all transferred repositories</li>
                    <li>You will not be able to modify settings, manage collaborators, or delete the repositories</li>
                    <li>The recipient must accept the transfer within 24 hours, or it will be canceled</li>
                    <li>All repository data, issues, pull requests, and history will be transferred</li>
                    <li>Private repositories may become public if the recipient doesn't have private repo access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Checkboxes */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              I understand that I will lose admin access to the selected repositories and this action cannot be easily undone.
            </span>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={finalConfirmed}
              onChange={(e) => setFinalConfirmed(e.target.checked)}
              disabled={!confirmed}
              className="mt-1 h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500 disabled:opacity-50"
            />
            <span className="text-sm text-gray-700">
              I have reviewed all details and want to proceed with the transfer to <strong>{destinationUser?.name || destination}</strong>.
            </span>
          </label>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onBack}
            disabled={loading}
            className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
          >
            Back
          </button>
          
          <button
            onClick={handleTransfer}
            disabled={!confirmed || !finalConfirmed || loading}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                Processing...
              </>
            ) : (
              'Transfer Repositories'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};