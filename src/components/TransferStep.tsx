import React from 'react';
import { CheckCircle, XCircle, ExternalLink, Package, AlertTriangle, User, Building } from 'lucide-react';
import type { TransferResult } from '../types/github';

interface TransferStepProps {
  results: TransferResult[];
  destination: string;
  destinationUser: any;
  onStartOver: () => void;
  loading: boolean;
}

export const TransferStep: React.FC<TransferStepProps> = ({
  results,
  destination,
  destinationUser,
  onStartOver,
  loading
}) => {
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const totalCount = results.length;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Package className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transferring Repositories</h2>
        <p className="text-gray-600 mb-8">
          Please wait while we process your repository transfers...
        </p>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing transfers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
          failureCount === 0 ? 'bg-green-100' : successCount > 0 ? 'bg-amber-100' : 'bg-red-100'
        }`}>
          {failureCount === 0 ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : successCount > 0 ? (
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transfer Results</h2>
        <p className="text-gray-600">
          {failureCount === 0 
            ? `Successfully transferred all ${totalCount} repositories`
            : `${successCount} of ${totalCount} repositories transferred successfully`
          }
        </p>
      </div>

      {/* Transfer Summary */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Transfer Summary</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{successCount}</p>
            <p className="text-sm text-gray-600">Successful</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{failureCount}</p>
            <p className="text-sm text-gray-600">Failed</p>
          </div>
        </div>

        {destinationUser && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {destinationUser.type === 'Organization' ? (
                <Building className="w-6 h-6 text-blue-600" />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
              <div>
                <p className="font-medium text-blue-900">
                  Transferred to: {destinationUser.name || destinationUser.login}
                </p>
                <p className="text-sm text-blue-700">@{destinationUser.login}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Results</h3>
        
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex-shrink-0">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-gray-900">{result.repository}</p>
                </div>
                {result.success ? (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-700">Successfully transferred</p>
                    {result.new_url && (
                      <a
                        href={result.new_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-700">{result.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Next Steps */}
      {successCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Next Steps</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>• The recipient ({destination}) will receive a notification about the transfer request</p>
            <p>• They have <strong>24 hours</strong> to accept the transfer</p>
            <p>• If not accepted within 24 hours, the transfer will be automatically canceled</p>
            <p>• You will receive an email confirmation once the transfer is accepted</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="text-center">
        <button
          onClick={onStartOver}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-medium"
        >
          Start New Transfer
        </button>
      </div>
    </div>
  );
};