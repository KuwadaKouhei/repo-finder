export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export class RateLimitError extends GitHubApiError {
  constructor() {
    super('GitHub API のレート制限に達しました', 403);
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends GitHubApiError {
  constructor() {
    super('リポジトリが見つかりません', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends GitHubApiError {
  constructor() {
    super('検索条件が不正です', 422);
    this.name = 'ValidationError';
  }
}
