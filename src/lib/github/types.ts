export type GitHubRepoRaw = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number; // ⚠ Star数のエイリアス。使わない
  subscribers_count?: number; // 真のWatcher数。検索結果には含まれない場合がある
  forks_count: number;
  open_issues_count: number;
};

export type GitHubSearchResponseRaw = {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepoRaw[];
};
