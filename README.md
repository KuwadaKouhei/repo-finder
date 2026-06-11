# Repo Finder（GitHub リポジトリ検索アプリ）

<!-- TODO: 完成時にスクリーンショットを置く（ライト/ダーク両方） -->

GitHubの公開リポジトリをキーワードで検索し、一覧・詳細を閲覧できるWebアプリケーション。
Next.js 16（App Router）/ React 19 / TypeScript で実装。

<!-- TODO: 課題の出典・デプロイURL（あれば）を1行 -->

---

## セットアップ・起動方法

```bash
# 前提: Node.js 22 LTS（最低 20.9+）/ npm
 
# 1. 依存のインストール
npm install
 
# 2. 環境変数の設定（GitHubトークン）
#    .env.example をコピーして GITHUB_TOKEN を設定
#    ※ トークン未設定でも動作するが、レート制限が厳しくなる（検索 10req/分）
cp .env.example .env.local
 
# 3. 開発サーバー起動
npm run dev
 
# テスト実行
npm test
```

### GitHub アクセストークンの取得方法

公開リポジトリの検索・取得のみのため、**追加の権限（スコープ）は一切不要**です。

1. GitHub にログインし、[Personal access tokens (classic)](https://github.com/settings/tokens) を開く
   （画面からたどる場合: 右上アイコン → **Settings** → 左メニュー最下部 **Developer settings** → **Personal access tokens** → **Tokens (classic)**）
2. **Generate new token (classic)** をクリック
3. **Note** に用途（例: `repo-finder`）を入力し、**Expiration** は任意（30日程度を推奨）
4. **スコープのチェックボックスはすべて未チェックのまま**にする（公開情報の読み取りに権限は不要。最小権限の原則）
5. **Generate token** をクリックし、表示されたトークン（`ghp_` で始まる文字列）をコピー
   ※ トークンはこの画面でしか表示されないため、閉じる前に必ずコピーする
6. `.env.local` の `GITHUB_TOKEN=` の後ろに貼り付ける

> Fine-grained tokens でも動作するが、本アプリは公開情報のみのため classic の無スコープで十分。
> トークンは `.env.local`（gitignore 済み）にのみ置き、コミットしないこと。

<!-- TODO: scaffold後、実際のコマンド・envキー名と一致しているか確認して確定 -->

---

## 技術スタック

| 区分 | 採用 |
| --- | --- |
| フレームワーク | Next.js 16.2 系（App Router） |
| 言語 / ランタイム | TypeScript 5.x / React 19.2 / Node.js 22 LTS |
| スタイリング / UI | Tailwind CSS 4.x / shadcn/ui |
| テーマ | next-themes（ダーク/ライト） |
| テスト | Vitest / React Testing Library / MSW |

選定理由・不採用技術・バージョン方針の詳細: [docs/TECH_STACK.md](./docs/TECH_STACK.md)

---

## 設計判断とトレードオフ

<!-- このプロジェクトの心臓部。実装中に判断が固まるたびに追記する。各項目は「何を・なぜ・代替案」の形で簡潔に。 -->

### データ取得は Server Components（サーバーフェッチ）
<!-- TODO: トークン秘匿・初期JS削減・Next16ネイティブ。代替案: クライアント + TanStack Query（無限スクロール/ミューテーション主体なら）。 -->

### URL を状態の単一の真実とする
<!-- TODO: q/sort/order/page/view をURLに同期。共有・リロード・戻るで再現。例外: テーマは個人設定のため localStorage。 -->

### Watcher数の罠への対応
<!-- TODO: watchers_count はStar数のエイリアス。真のWatcher数 subscribers_count は詳細エンドポイントで取得するため、詳細ページは /repos/{owner}/{repo} を再取得。 -->

### アンチコラプションレイヤ（アダプタ）
<!-- TODO: GitHub生レスポンスをドメイン型に変換し、API変更の影響を lib/github に局所化。 -->

### 並び替えはサーバーソート（API委譲）
<!-- TODO: 検索は最大1000件・ページング前提のため、クライアントソートは「現在ページ内だけ」になり誤り。名前順がAPIに無いため不採用にした判断も。 -->

### 検索は submit 方式
<!-- TODO: ボタン/Enterで確定。レート制限（認証あり30req/分）に優しく、意図的な検索操作として自然。 -->

設計の全体像: [docs/DESIGN_PHILOSOPHY.md](./docs/DESIGN_PHILOSOPHY.md) / 各設計書は「ドキュメント一覧」参照

---

## やらないこと（スコープ外）と理由

<!-- 「盛らない判断」を見せる章。理由つきで明記する。 -->

- **認証ログイン** — 検索・閲覧が主目的のため不要
- **無限スクロール** — 「戻る」の位置復元とSSRの相性で複雑性が跳ね上がる。GitHub APIの1000件上限・ページネーションと噛み合うため、ページネーションを採用
- **グローバル状態管理（Redux等）** — サーバー状態=RSC / 共有状態=URL / ローカル状態=useState・localStorage で充足。導入理由がない

<!-- TODO: 実装中に「見送った判断」が増えたらここに追記 -->

---

## 使った Next.js の機能

<!-- Next自走力を示す章。実装したら該当項目を確定させる。 -->

- App Router / Server Components（データ取得・初期JS最小化）
- `searchParams` / `params` の await（Next 16 の Promise 化に対応）
- `loading.tsx`（Suspense・スケルトン）/ `error.tsx`（再試行）/ `not-found.tsx` + `notFound()`
- 動的ルート `repositories/[owner]/[repo]`
- `generateMetadata`（リポジトリごとの動的メタデータ）
- `next/image`（アバター最適化）
- キャッシュ方針 <!-- TODO: use cache / cacheLife を使った・使わなかった判断を記載 -->

---

## テスト

```bash
npm test
```

方針の要約:

- **4層構造**: ①ユニット（最も壊れやすいロジック）/ ②コンポーネント（UIの責務）/ ③結合（繋いだときの正しさ）/ ④E2E（実際のユーザー体験）を、各層の保証対象で役割分担
- **配分はテスティングトロフィー**: 静的解析 > ① > ③（最厚）> ④
- **振る舞いをテスト**: role / label / text で検証し、実装詳細に依存しない
- **MSWで境界モック**: ネットワーク境界のみモックし、内側は本物を動かす
- **アダプタはテストファースト**: APIとUIの契約を先にテストで固定
詳細: [docs/TEST_PHILOSOPHY.md](./docs/TEST_PHILOSOPHY.md)

<!-- TODO: 実装後、テスト構成（単体/結合の本数・対象）を一覧で追記 -->

---

## AI利用レポート

### 分担の原則

**判断は人間、実行（調査・文書化・生成）はAI、出力のレビューと採否の決定は人間。**

<!-- TODO: 既存READMEのAI利用ポイントの記述をここに統合 -->

### 工程ごとの分担

| 工程 | AIの役割 | 人間の役割 | 人間がレビュー・修正した点 |
| --- | --- | --- | --- |
| 要件定義 | ドキュメント作成・要件の提案・整理 | 要件の提案・トレードオフの判断 | ドキュメント内容のレビュー |
| 設計（基本/詳細） | ドキュメント作成・設計の壁打ち・設計の提案 | 設計思想の決定・設計壁打ち・設計の判断 | ドキュメント内容のレビュー |
| API仕様調査 | 調査 | 内容のレビュー | なし |
| 実装 | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| テスト | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |
| ドキュメント | <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |

### AIの提案を却下・修正した例

<!-- AIを制御している証跡として最も効く部分。具体例を1〜2個。候補: -->
<!-- ・モックのソート項目（名前順・Issue数順）はGitHub APIのsortに存在しない/意味が異なるため不採用とし、API準拠の4項目に修正した -->
<!-- ・UI構成の提案を、本課題の規模・変更の局所化の観点から見直し、機能軸＋コロケーションに決定した -->

---

## ドキュメント一覧

| ドキュメント | 内容 |
| --- | --- |
| [REQUIREMENTS.md](./docs/REQUIREMENTS.md) | 要件定義（機能要件・非機能要件・スコープ外） |
| [DESIGN.md](./docs/DESIGN.md) | 基本設計（システム構成・画面・外部I/F） |
| [DETAIL_DESIGN.md](./docs/DETAIL_DESIGN.md) | 詳細設計（ディレクトリ・コンポーネント・データフロー） |
| [GITHUB_API.md](./docs/AI_Research/GITHUB_API.md) | GitHub API仕様（レート制限・Watcher数の罠） |
| [TECH_STACK.md](./docs/TECH_STACK.md) | 技術選定（採用/不採用・バージョン） |
| [DESIGN_PHILOSOPHY.md](./docs/Philosophy/DESIGN_PHILOSOPHY.md) | 全体設計思想 |
| [UI_DESIGN_PHILOSOPHY.md](./docs/Philosophy/UI_DESIGN_PHILOSOPHY.md) | UI設計思想 |
| [TEST_PHILOSOPHY.md](./docs/Philosophy/TEST_PHILOSOPHY.md) | テスト思想 |
| [TASKS.md](./docs/TASKS.md) | タスク一覧・進捗 |
