import { describe, it, expect } from 'vitest';
import { toRepository, toRepositoryDetail } from './adapters';
import type { GitHubRepoRaw } from './types';

const buildRaw = (overrides: Partial<GitHubRepoRaw> = {}): GitHubRepoRaw => ({
  id: 1,
  name: 'react',
  full_name: 'facebook/react',
  owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631' },
  html_url: 'https://github.com/facebook/react',
  description: 'A library for building UI',
  language: 'JavaScript',
  stargazers_count: 70274,
  watchers_count: 70274,
  subscribers_count: 2667,
  forks_count: 9800,
  open_issues_count: 520,
  ...overrides,
});

describe('toRepository', () => {
  it('snake_case のフィールドを camelCase のドメイン型に変換する', () => {
    const r = toRepository(buildRaw());
    expect(r).toEqual({
      id: 1,
      fullName: 'facebook/react',
      owner: 'facebook',
      repo: 'react',
      ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/69631',
      language: 'JavaScript',
      stars: 70274,
      description: 'A library for building UI',
    });
  });

  it('language が null のとき null を保持する', () => {
    expect(toRepository(buildRaw({ language: null })).language).toBeNull();
  });

  it('description が null のとき null を保持する', () => {
    expect(toRepository(buildRaw({ description: null })).description).toBeNull();
  });

  it('avatar_url が http/https 以外のスキームのとき空文字にする', () => {
    const r = toRepository(buildRaw({ owner: { login: 'x', avatar_url: 'javascript:alert(1)' } }));
    expect(r.ownerAvatarUrl).toBe('');
  });
});

describe('toRepositoryDetail', () => {
  it('watchers には watchers_count ではなく subscribers_count を使う', () => {
    const d = toRepositoryDetail(buildRaw({ watchers_count: 70274, subscribers_count: 2667 }));
    expect(d.watchers).toBe(2667);
  });

  it('subscribers_count が欠損しているとき 0 にフォールバックする', () => {
    const d = toRepositoryDetail(buildRaw({ subscribers_count: undefined }));
    expect(d.watchers).toBe(0);
  });

  it('html_url が http/https 以外のスキームのとき空文字にする', () => {
    const d = toRepositoryDetail(buildRaw({ html_url: 'javascript:alert(1)' }));
    expect(d.htmlUrl).toBe('');
  });

  it('forks / openIssues を変換する', () => {
    const d = toRepositoryDetail(buildRaw());
    expect(d.forks).toBe(9800);
    expect(d.openIssues).toBe(520);
  });
});
