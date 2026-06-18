# CLAUDE.md

GitHub公開リポジトリを検索・閲覧するWebアプリ（Next.js 16 / App Router / TypeScript）。
設計の詳細は `docs/`（REQUIREMENTS / DESIGN / DETAIL_DESIGN / TECK_STACK / TASKS）を正とする。

## コマンド

```bash
npm run dev          # 開発サーバー (localhost:3000)
npm run build        # 本番ビルド
npm run lint         # ESLint
npm test             # Vitest（単体・コンポーネント・結合）一括実行
npm run test:watch   # Vitest ウォッチ
npm run test:e2e     # Playwright E2E（dev サーバーを自動起動・実API使用）
```

単一テスト: `npx vitest run src/lib/format.test.ts`

## アーキテクチャ

依存方向: `app`（ページ/RSC）→ `features`（機能UI）→ `components`（共有UI）。横断で `domain`（型）と `lib/github`（APIアクセス）に依存。

- `src/app/` — Next規約。ページ・レイアウト・ルーティングのみで薄く保つ
- `src/features/<機能>/components/` — 機能軸コロケーション（コンポーネント＋テストを同居）。`repository-search` / `repository-detail`
- `src/components/` — 複数機能で使う共有UI。`ui/` は shadcn/ui（Radix + CVA）
- `src/domain/repository.ts` — ドメイン型 `Repository` / `RepositoryDetail`（camelCase）
- `src/lib/github/` — APIアクセス層。`client.ts`(窓口) / `adapters.ts`(変換=ACL) / `types.ts`(RAW型) / `errors.ts`(型付き例外)
- `src/test/` — `setup.ts`(jsdomポリフィル＋MSW初期化) / `msw/`

データフロー: URLクエリ(`q`/`sort`/`order`/`page`) → RSCで `searchParams` を await → `lib/github/client` → `adapters` でドメイン型へ変換 → コンポーネント描画。

## 必ず守るルール

- **アダプタ層を必ず経由する**: RAWレスポンスを直接コンポーネントに渡さない。`toRepository()` / `toRepositoryDetail()` を通してドメイン型にする。`any` 禁止（`strict: true`）。
- **GitHubトークンはサーバーのみ**: `.env.local` の `GITHUB_TOKEN` を RSC（`lib/github/client.ts`）経由でのみ使う。ブラウザへ露出させない。クライアントから直接 fetch しない。
  - `.env` 系ファイルは読まない。秘密情報をコードに直書きしない。
- **状態の置き場所を分ける**:
  - 検索条件（`q` / `sort` / `order` / `page`）= **URL**（共有・再現対象）
  - テーマ・表示形式(view リスト/グリッド)= **localStorage**（個人設定。URLに入れない）
  - フォーム入力等の一時状態 = **useState**
- **エラーは型付きで扱う**: `RateLimitError`(403/429) / `NotFoundError`(404) / `ValidationError`(422) / `GitHubApiError`(基底)。型ガードで描き分ける。try-catchで握りつぶさない。
- **テストはテスティングトロフィー方針**: ①純粋関数の単体（adapters/format） ②コンポーネント(props契約) ③結合(MSWでネットワーク境界モック・最厚) ④E2E(任意)。**fetch直モックは使わない**（MSWを使う）。
- **状態管理ライブラリを足さない**: Redux/Zustand/TanStack Query等は不要（YAGNI）。URL + useState + RSC fetch で充足。依存追加時は `docs/TECK_STACK.md` を更新。
- **a11yを省かない**: shadcn/uiで土台は確保されるが、label / alt / ARIA を省略しない。

## ドメイン上の注意点（GitHub API由来の罠）

- **Watcher数は `subscribers_count`** を使う。`watchers_count` は実質Star数なので使わない（検索結果には watchers が無いため詳細取得時のみ）。
- アダプタで: 外部URLは `http`/`https` スキームのみ許可（XSS対策）、数値欠損は0、`topics` 欠損は`[]`、`license.spdx_id` の NOASSERTION/未設定は`null`、`updatedAt` は `pushed_at → updated_at → ''` の順でフォールバック。
- ソートは GitHub API準拠（関連度/stars/forks/updated）。APIに無い「言語順・Issue数順」は実装しない。
- ページネーションは 1000件・最大34ページ上限（per_page=30）。

## 規約

- ファイル名 kebab-case、コンポーネント PascalCase（サフィックスなし: `SearchBox`/`RepositoryCard`）。
- import エイリアスは `@/*` → `src/*`。
- Client Componentは先頭に `"use client"`。API呼び出しはRSC側で行い、コンポーネントは表示専用に保つ。
- 詳細ページは `React.cache()` でメタデータ＋本体の重複リクエストを排除。
- 固有デザインが必要なshadcnボタン等は `variant="none" size="none"` で className に全権委譲。

## コミュニケーション

- ユーザーへの返答・説明は日本語。変更後はどこを変更したか必ず説明する。
