import { useState, useEffect } from 'react';
import { Coffee, Heart, Github } from 'lucide-react';
import { useGitHub } from './hooks/useGitHub';
import { githubService } from './services/github';
import { StepIndicator } from './components/StepIndicator';
import { AuthStep } from './components/AuthStep';
import { SelectStep } from './components/SelectStep';
import { ConfigureStep } from './components/ConfigureStep';
import { ConfirmStep } from './components/ConfirmStep';
import { TransferStep } from './components/TransferStep';
import type { TransferStep as Step, GitHubUser, TransferResult } from './types/github';

function App() {
  const {
    user,
    repositories,
    organizations,
    loading,
    error,
    authenticate,
    fetchRepositories,
    fetchOrganizations,
    validateDestination,
  } = useGitHub();

  const [currentStep, setCurrentStep] = useState<Step>('auth');
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [destination, setDestination] = useState('');
  const [isOrganization, setIsOrganization] = useState(false);
  const [destinationUser, setDestinationUser] = useState<GitHubUser | null>(null);
  const [transferResults, setTransferResults] = useState<TransferResult[]>([]);
  const [transferring, setTransferring] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    if (user && repositories.length === 0) {
      fetchRepositories().catch(console.error);
      fetchOrganizations().catch(console.error);
    }
  }, [user, repositories.length, fetchRepositories, fetchOrganizations]);

  // Auto-advance after successful authentication
  useEffect(() => {
    if (user && currentStep === 'auth' && repositories.length > 0) {
      setCurrentStep('select');
    }
  }, [user, currentStep, repositories.length]);

  const handleAuthenticate = async (token: string) => {
    await authenticate(token);
    // Fetch data after authentication
    await fetchRepositories();
    await fetchOrganizations();
  };

  const handleLogout = () => {
    githubService.logout();
    setCurrentStep('auth');
    setSelectedRepos([]);
    setDestination('');
    setIsOrganization(false);
    setDestinationUser(null);
    setTransferResults([]);
    setTransferring(false);
    window.location.reload(); // Force refresh to clear all state
  };

  const handleDestinationChange = async (dest: string, isOrg: boolean, user: GitHubUser | null) => {
    setDestination(dest);
    setIsOrganization(isOrg);
    setDestinationUser(user);
  };

  const handleTransfer = async () => {
    setTransferring(true);
    setCurrentStep('transfer');
    
    const results: TransferResult[] = [];
    
    for (const repoName of selectedRepos) {
      try {
        const result = await githubService.transferRepository(repoName, destination);
        results.push(result);
        setTransferResults([...results]);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        results.push({
          repository: repoName,
          success: false,
          error: error.message || 'Unknown error',
        });
        setTransferResults([...results]);
      }
    }
    
    setTransferring(false);
  };

  const handleStartOver = () => {
    setCurrentStep('auth');
    setSelectedRepos([]);
    setDestination('');
    setIsOrganization(false);
    setDestinationUser(null);
    setTransferResults([]);
    setTransferring(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <Github className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              GitHub Repository Transfer
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Securely transfer multiple GitHub repositories to other users or organizations
            with comprehensive safety measures and validation.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step Content */}
        <div className="max-w-6xl mx-auto">
          {currentStep === 'auth' && (
            <AuthStep
              onAuthenticate={handleAuthenticate}
              currentUser={user}
              onLogout={handleLogout}
              loading={loading}
              error={error}
            />
          )}

          {currentStep === 'select' && (
            <SelectStep
              repositories={repositories}
              selectedRepos={selectedRepos}
              onSelectionChange={setSelectedRepos}
              onNext={() => setCurrentStep('configure')}
              loading={loading}
            />
          )}

          {currentStep === 'configure' && (
            <ConfigureStep
              organizations={organizations}
              onDestinationChange={(dest, isOrg, user) => handleDestinationChange(dest, isOrg, user)}
              onValidateDestination={validateDestination}
              onNext={() => setCurrentStep('confirm')}
              onBack={() => setCurrentStep('select')}
            />
          )}

          {currentStep === 'confirm' && (
            <ConfirmStep
              selectedRepos={selectedRepos}
              repositories={repositories}
              destination={destination}
              isOrganization={isOrganization}
              destinationUser={destinationUser}
              onTransfer={handleTransfer}
              onBack={() => setCurrentStep('configure')}
              loading={transferring}
            />
          )}

          {currentStep === 'transfer' && (
            <TransferStep
              results={transferResults}
              destination={destination}
              destinationUser={destinationUser}
              onStartOver={handleStartOver}
              loading={transferring}
            />
          )}
        </div>

        {/* Buy Me a Coffee Floating Button */}
        <a
          href="https://www.buymeacoffee.com/muhiminulhasan"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-50"
          title="Buy me a coffee"
        >
          <Coffee className="w-6 h-6" />
        </a>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500 space-y-2">
          <p>Built with security and safety in mind. All transfers require explicit confirmation.</p>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500" /> by{' '}
            <a 
              href="https://muhiminulhasan.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
             A. S. M. Muhiminul Hasan
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;