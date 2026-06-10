import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { searchRepositories, getRepository } from './client';
import { RateLimitError, NotFoundError, ValidationError } from './errors';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const rawRepo = {
  id: 1,
  name: 'react',
  full_name: 'facebook/react',
  owner: { login: 'facebook', avatar_url: 'https://example.com/a.png' },
  html_url: 'https://github.com/facebook/react',
  description: 'desc',
  language: 'JavaScript',
  stargazers_count: 1,
  watchers_count: 1,
  subscribers_count: 2,
  forks_count: 3,
  open_issues_count: 4,
};

describe('searchRepositories', () => {
  it('検索結果をドメイン型の一覧に変換して返す', async () => {
    server.use(
      http.get('https://api.github.com/search/repositories', () =>
        HttpResponse.json({ total_count: 1, incomplete_results: false, items: [rawRepo] })
      )
    );
    const result = await searchRepositories({ q: 'react' });
    expect(result.totalCount).toBe(1);
    expect(result.items[0].fullName).toBe('facebook/react');
  });

  it('空白を含むクエリをエンコードして送る', async () => {
    let capturedUrl = '';
    server.use(
      http.get('https://api.github.com/search/repositories', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ total_count: 0, incomplete_results: false, items: [] });
      })
    );
    await searchRepositories({ q: 'react hooks' });
    const sent = new URL(capturedUrl).searchParams.get('q');
    expect(sent).toBe('react hooks'); // デコード後に元のクエリへ戻る＝正しく伝わる
  });

  it('403 のとき RateLimitError を投げる', async () => {
    server.use(
      http.get('https://api.github.com/search/repositories', () =>
        HttpResponse.json({ message: 'rate limit' }, { status: 403 })
      )
    );
    await expect(searchRepositories({ q: 'x' })).rejects.toBeInstanceOf(RateLimitError);
  });

  it('422 のとき ValidationError を投げる', async () => {
    server.use(
      http.get('https://api.github.com/search/repositories', () =>
        HttpResponse.json({ message: 'validation' }, { status: 422 })
      )
    );
    await expect(searchRepositories({ q: 'x' })).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('getRepository', () => {
  it('詳細をドメイン型に変換して返す（watchers は subscribers_count 由来）', async () => {
    server.use(
      http.get('https://api.github.com/repos/facebook/react', () => HttpResponse.json(rawRepo))
    );
    const detail = await getRepository('facebook', 'react');
    expect(detail.watchers).toBe(2);
  });

  it('404 のとき NotFoundError を投げる', async () => {
    server.use(
      http.get('https://api.github.com/repos/x/y', () =>
        HttpResponse.json({ message: 'not found' }, { status: 404 })
      )
    );
    await expect(getRepository('x', 'y')).rejects.toBeInstanceOf(NotFoundError);
  });
});
