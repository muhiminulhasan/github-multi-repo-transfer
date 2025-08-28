export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  owner: {
    login: string;
    type: 'User' | 'Organization';
  };
  html_url: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

export interface GitHubUser {
  login: string;
  id: number;
  type: 'User' | 'Organization';
  name?: string;
  email?: string;
}

export interface GitHubOrganization {
  login: string;
  id: number;
  description?: string;
  name?: string;
}

export interface TransferRequest {
  repo: string;
  new_owner: string;
  team_ids?: number[];
}

export interface TransferResult {
  repository: string;
  success: boolean;
  error?: string;
  new_url?: string;
}

export type TransferStep = 'auth' | 'select' | 'configure' | 'confirm' | 'transfer';