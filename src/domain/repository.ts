export type Repository = {
  id: number;
  fullName: string;
  owner: string;
  repo: string;
  ownerAvatarUrl: string;
  language: string | null;
  stars: number;
  description: string | null;
};

export type RepositoryDetail = Repository & {
  watchers: number;
  forks: number;
  openIssues: number;
  htmlUrl: string;
};
