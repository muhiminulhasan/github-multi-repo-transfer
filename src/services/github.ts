import { Octokit } from '@octokit/rest';
import type { GitHubRepository, GitHubUser, GitHubOrganization, TransferResult } from '../types/github';

export class GitHubService {
  private octokit: Octokit | null = null;
  private currentUser: GitHubUser | null = null;
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      this.token = savedToken;
      this.octokit = new Octokit({ auth: savedToken });
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage() {
    const savedUser = localStorage.getItem('github_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch (error) {
        localStorage.removeItem('github_user');
      }
    }
  }

  private saveUserToStorage(user: GitHubUser) {
    localStorage.setItem('github_user', JSON.stringify(user));
  }

  async authenticate(token: string): Promise<GitHubUser> {
    this.octokit = new Octokit({ auth: token });
    
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      this.currentUser = data as GitHubUser;
      this.token = token;
      
      // Save to localStorage
      localStorage.setItem('github_token', token);
      this.saveUserToStorage(this.currentUser);
      
      // Validate required permissions
      const { data: rateLimit } = await this.octokit.rest.rateLimit.get();
      if (!rateLimit) {
        throw new Error('Invalid token or insufficient permissions');
      }
      
      return this.currentUser;
    } catch (error) {
      this.octokit = null;
      this.currentUser = null;
      this.token = null;
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_user');
      throw new Error('Authentication failed. Please check your token.');
    }
  }

  logout() {
    this.octokit = null;
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
  }

  async validateStoredToken(): Promise<boolean> {
    if (!this.token || !this.octokit) return false;
    
    try {
      await this.octokit.rest.rateLimit.get();
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  async getRepositories(): Promise<GitHubRepository[]> {
    if (!this.octokit) throw new Error('Not authenticated');
    
    const repositories: GitHubRepository[] = [];
    
    // Get user's personal repositories
    let page = 1;
    while (true) {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
        page,
        type: 'owner',
      });
      
      repositories.push(...data as GitHubRepository[]);
      if (data.length < 100) break;
      page++;
    }
    
    // Get organization repositories
    try {
      const { data: orgs } = await this.octokit.rest.orgs.listForAuthenticatedUser();
      
      for (const org of orgs) {
        page = 1;
        while (true) {
          const { data: orgRepos } = await this.octokit.rest.repos.listForOrg({
            org: org.login,
            sort: 'updated',
            direction: 'desc',
            per_page: 100,
            page,
            type: 'all',
          });
          
          repositories.push(...orgRepos as GitHubRepository[]);
          if (orgRepos.length < 100) break;
          page++;
        }
      }
    } catch (error) {
      console.error('Error fetching organization repositories:', error);
      // Continue with user repositories even if org repos fail
    }
    
    return repositories;
  }

  async getOrganizations(): Promise<GitHubOrganization[]> {
    if (!this.octokit) throw new Error('Not authenticated');
    
    const { data } = await this.octokit.rest.orgs.listForAuthenticatedUser();
    return data as GitHubOrganization[];
  }

  private userValidationCache: Record<string, { user: GitHubUser | null; timestamp: number }> = {};
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async validateUser(username: string): Promise<GitHubUser | null> {
    if (!this.octokit) throw new Error('Not authenticated');
    
    // Clean up expired cache entries
    const now = Date.now();
    Object.entries(this.userValidationCache).forEach(([key, value]) => {
      if (now - value.timestamp > this.CACHE_TTL) {
        delete this.userValidationCache[key];
      }
    });

    // Check cache first
    const cacheKey = username.toLowerCase();
    const cached = this.userValidationCache[cacheKey];
    if (cached && (now - cached.timestamp) <= this.CACHE_TTL) {
      return cached.user;
    }
    
    try {
      console.log(`Fetching user: ${username}`);
      const { data } = await this.octokit.rest.users.getByUsername({ username });
      const user = data as GitHubUser;
      
      // Update cache
      this.userValidationCache[cacheKey] = {
        user,
        timestamp: now
      };
      
      return user;
    } catch (error) {
      // Cache negative results too, but with a shorter TTL
      this.userValidationCache[cacheKey] = {
        user: null,
        timestamp: now
      };
      return null;
    }
  }

  async transferRepository(repoName: string, newOwner: string): Promise<TransferResult> {
    if (!this.octokit || !this.currentUser) throw new Error('Not authenticated');
    
    try {
      await this.octokit.rest.repos.transfer({
        owner: this.currentUser.login,
        repo: repoName,
        new_owner: newOwner,
      });
      
      return {
        repository: repoName,
        success: true,
        new_url: `https://github.com/${newOwner}/${repoName}`,
      };
    } catch (error: any) {
      return {
        repository: repoName,
        success: false,
        error: error.message || 'Transfer failed',
      };
    }
  }

  getCurrentUser(): GitHubUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.octokit !== null;
  }
}

export const githubService = new GitHubService();