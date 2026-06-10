import type { Repository, RepositoryDetail } from '@/domain/repository';
import type { GitHubRepoRaw } from './types';

/** http/https のみ許可。それ以外（javascript: 等）は空文字に落とす */
const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : '';
  } catch {
    return '';
  }
};

export const toRepository = (raw: GitHubRepoRaw): Repository => ({
  id: raw.id,
  fullName: raw.full_name,
  owner: raw.owner.login,
  repo: raw.name,
  ownerAvatarUrl: sanitizeUrl(raw.owner.avatar_url),
  language: raw.language,
  stars: raw.stargazers_count,
  description: raw.description,
});

export const toRepositoryDetail = (raw: GitHubRepoRaw): RepositoryDetail => ({
  ...toRepository(raw),
  watchers: raw.subscribers_count ?? 0, // 真のWatcher数。watchers_countはStar数のエイリアスのため使わない
  forks: raw.forks_count,
  openIssues: raw.open_issues_count,
  htmlUrl: sanitizeUrl(raw.html_url),
});
