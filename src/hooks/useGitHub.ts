import { useState, useCallback } from 'react';
import { useEffect } from 'react';
import { githubService } from '../services/github';
import type { GitHubRepository, GitHubUser, GitHubOrganization } from '../types/github';

export const useGitHub = () => {
  const [user, setUser] = useState<GitHubUser | null>(githubService.getCurrentUser());
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [organizations, setOrganizations] = useState<GitHubOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for stored token on mount
  useEffect(() => {
    const checkStoredAuth = async () => {
      if (githubService.isAuthenticated()) {
        const isValid = await githubService.validateStoredToken();
        if (isValid) {
          setUser(githubService.getCurrentUser());
        } else {
          setUser(null);
        }
      }
    };
    
    checkStoredAuth();
  }, []);

  const authenticate = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const authenticatedUser = await githubService.authenticate(token);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRepositories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const repos = await githubService.getRepositories();
      setRepositories(repos);
      return repos;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrganizations = useCallback(async () => {
    try {
      const orgs = await githubService.getOrganizations();
      setOrganizations(orgs);
      return orgs;
    } catch (err: any) {
      console.error('Failed to fetch organizations:', err);
      return [];
    }
  }, []);

  const validateDestination = useCallback(async (username: string) => {
    if (!username.trim()) return null;
    try {
      return await githubService.validateUser(username);
    } catch (err: any) {
      throw new Error('Failed to validate destination');
    }
  }, []);

  return {
    user,
    repositories,
    organizations,
    loading,
    error,
    authenticate,
    fetchRepositories,
    fetchOrganizations,
    validateDestination,
  };
};