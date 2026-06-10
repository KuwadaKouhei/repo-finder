import type { Repository, RepositoryDetail } from '@/domain/repository';
import type { GitHubRepoRaw, GitHubSearchResponseRaw } from './types';
import { toRepository, toRepositoryDetail } from './adapters';
import { GitHubApiError, NotFoundError, RateLimitError, ValidationError } from './errors';

const BASE_URL = 'https://api.github.com';

type SearchParams = {
  q: string;
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
};

export type SearchResult = {
  totalCount: number;
  items: Repository[];
};

const buildHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const throwByStatus = (status: number): never => {
  if (status === 403 || status === 429) throw new RateLimitError();
  if (status === 404) throw new NotFoundError();
  if (status === 422) throw new ValidationError();
  throw new GitHubApiError('GitHub API リクエストに失敗しました', status);
};

export const searchRepositories = async (params: SearchParams): Promise<SearchResult> => {
  const url = new URL(`${BASE_URL}/search/repositories`);
  url.searchParams.set('q', params.q);
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.order) url.searchParams.set('order', params.order);
  url.searchParams.set('page', String(params.page ?? 1));
  url.searchParams.set('per_page', String(params.perPage ?? 30));

  const res = await fetch(url, { headers: buildHeaders() });
  if (!res.ok) throwByStatus(res.status);

  const data = (await res.json()) as GitHubSearchResponseRaw;
  return { totalCount: data.total_count, items: data.items.map(toRepository) };
};

export const getRepository = async (owner: string, repo: string): Promise<RepositoryDetail> => {
  const res = await fetch(
    `${BASE_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    { headers: buildHeaders() }
  );
  if (!res.ok) throwByStatus(res.status);

  const data = (await res.json()) as GitHubRepoRaw;
  return toRepositoryDetail(data);
};
