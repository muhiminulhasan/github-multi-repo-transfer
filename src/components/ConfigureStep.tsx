import React, { useState, useEffect, useRef } from 'react';
import { User, Building, AlertTriangle, Check } from 'lucide-react';
import type { GitHubOrganization, GitHubUser } from '../types/github';

interface ConfigureStepProps {
  organizations: GitHubOrganization[];
  onDestinationChange: (destination: string, isOrganization: boolean, user: GitHubUser | null) => void;
  onValidateDestination: (username: string) => Promise<GitHubUser | null>;
  onNext: () => void;
  onBack: () => void;
}

export const ConfigureStep: React.FC<ConfigureStepProps> = ({
  organizations,
  onDestinationChange,
  onValidateDestination,
  onNext,
  onBack
}) => {
  const [transferType, setTransferType] = useState<'user' | 'org'>('user');
  const [customUsername, setCustomUsername] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [orgSearchTerm, setOrgSearchTerm] = useState('');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validatedUser, setValidatedUser] = useState<GitHubUser | null>(null);
  const validationInProgress = useRef<boolean>(false);
  const lastValidationId = useRef<number>(0);

  const filteredOrgs = organizations.filter(org => 
    org.login.toLowerCase().includes(orgSearchTerm.toLowerCase()) ||
    (org.name && org.name.toLowerCase().includes(orgSearchTerm.toLowerCase()))
  );

  const destination = transferType === 'user' ? customUsername : selectedOrg;
  const canProceed = destination && validationStatus === 'valid';

  useEffect(() => {
    // Skip if no destination or already validating
    if (!destination) {
      setValidationStatus('idle');
      setValidatedUser(null);
      return;
    }

    // Skip if just whitespace
    if (!destination.trim()) {
      setValidationStatus('idle');
      setValidatedUser(null);
      return;
    }

    // Increment the validation ID for this validation attempt
    const validationId = ++lastValidationId.current;
    validationInProgress.current = true;
    
    const validateDestination = async () => {
      // Skip if another validation has started
      if (validationId !== lastValidationId.current) return;
      
      setValidationStatus('validating');
      
      try {
        const user = await onValidateDestination(destination);
        
        // Skip if another validation has started
        if (validationId !== lastValidationId.current) return;
        
        if (user) {
          setValidationStatus('valid');
          setValidatedUser(user);
          onDestinationChange(destination, transferType === 'org', user);
        } else {
          setValidationStatus('invalid');
          setValidatedUser(null);
        }
      } catch (error) {
        // Skip if another validation has started
        if (validationId !== lastValidationId.current) return;
        setValidationStatus('invalid');
        setValidatedUser(null);
      } finally {
        if (validationId === lastValidationId.current) {
          validationInProgress.current = false;
        }
      }
    };

    // Clear any pending validation
    const timeoutId = setTimeout(validateDestination, 800);
    
    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      // Only mark as not in progress if this is the most recent validation
      if (validationId === lastValidationId.current) {
        validationInProgress.current = false;
      }
    };
  }, [destination, transferType, onValidateDestination, onDestinationChange]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure Transfer</h2>
        <p className="text-gray-600">
          Specify where you want to transfer your selected repositories.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
        {/* Transfer Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Transfer Destination Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTransferType('user')}
              className={`flex items-center p-4 border-2 rounded-lg transition-all ${
                transferType === 'user'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <User className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">User Account</div>
                <div className="text-sm opacity-75">Transfer to another GitHub user</div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setTransferType('org')}
              className={`flex items-center p-4 border-2 rounded-lg transition-all ${
                transferType === 'org'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <Building className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Organization</div>
                <div className="text-sm opacity-75">Transfer to an organization</div>
              </div>
            </button>
          </div>
        </div>

        {/* Destination Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {transferType === 'user' ? 'Username' : 'Organization'}
          </label>
          
          {transferType === 'user' ? (
            <div className="relative">
              <input
                type="text"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {validationStatus === 'validating' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
                {validationStatus === 'valid' && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {validationStatus === 'invalid' && (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={selectedOrg ? organizations.find(o => o.login === selectedOrg)?.name || selectedOrg : orgSearchTerm}
                onChange={(e) => {
                  setSelectedOrg('');
                  setOrgSearchTerm(e.target.value);
                  setShowOrgDropdown(true);
                }}
                onFocus={() => setShowOrgDropdown(true)}
                onBlur={() => setTimeout(() => setShowOrgDropdown(false), 200)}
                placeholder="Search organizations..."
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {showOrgDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                  {filteredOrgs.length > 0 ? (
                    filteredOrgs.map((org) => (
                      <div
                        key={org.id}
                        className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedOrg(org.login);
                          setOrgSearchTerm('');
                          setShowOrgDropdown(false);
                          onDestinationChange(org.login, true, null);
                        }}
                      >
                        <div className="font-medium">{org.name || org.login}</div>
                        {org.name && org.name !== org.login && (
                          <div className="text-sm text-gray-500">@{org.login}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No organizations found</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Validation Result */}
        {validatedUser && validationStatus === 'valid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-800">
                  {transferType === 'user' ? 'User' : 'Organization'} Found
                </p>
                <p className="text-sm text-green-700">
                  {validatedUser.name || validatedUser.login} ({validatedUser.login})
                </p>
              </div>
            </div>
          </div>
        )}

        {validationStatus === 'invalid' && destination && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-800">Invalid Destination</p>
                <p className="text-sm text-red-700">
                  The specified {transferType === 'user' ? 'user' : 'organization'} does not exist or is not accessible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Repository transfers are permanent and cannot be easily undone</li>
                <li>You will lose admin access to transferred repositories</li>
                <li>All collaborators, issues, and pull requests will be preserved</li>
                <li>The destination must accept the transfer within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Back
          </button>
          
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};