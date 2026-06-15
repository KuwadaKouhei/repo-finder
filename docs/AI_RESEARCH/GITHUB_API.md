# GitHub REST API 仕様まとめ（リポジトリ検索アプリ用）

> 本アプリで使う `GET /search/repositories` と `GET /repos/{owner}/{repo}` に絞ってまとめる。
> 出典は GitHub 公式ドキュメント（docs.github.com）。一次情報を優先し、フィールドの意味・制限・罠を実装観点で整理する。
> 設計判断との対応は `DESIGN.md`、要件との対応は `REQUIREMENTS.md` を参照。

---

## 1. 基本情報

| 項目 | 値 |
|---|---|
| ベースURL | `https://api.github.com` |
| 形式 | JSON（REST） |
| 推奨 `Accept` ヘッダ | `application/vnd.github+json` |
| APIバージョン指定 | `X-GitHub-Api-Version` ヘッダ（例: `2022-11-28`。最新の安定版を明示するのが推奨） |

リクエスト例（詳細取得）:

```http
GET /repos/{owner}/{repo} HTTP/1.1
Host: api.github.com
Accept: application/vnd.github+json
Authorization: Bearer <TOKEN>
X-GitHub-Api-Version: 2022-11-28
```

> **実装メモ**: `X-GitHub-Api-Version` を明示すると、GitHub側の破壊的変更から保護される（バージョンを固定できる）。プロダクション想定では付けておくのが望ましい。

---

## 2. 認証

| 方式 | レート制限への影響 | 本アプリでの扱い |
|---|---|---|
| 認証なし | 厳しい（§3参照） | 開発時のみ。本番は非推奨 |
| Personal Access Token（PAT）等を `Authorization: Bearer <TOKEN>` で付与 | 大幅に緩和 | これを採用。**サーバー環境変数**に置く |

- 公開リポジトリの検索・取得は認証なしでも可能だが、レート制限が厳しい。
- トークンを付けるだけで制限が緩和されるため、本アプリは認証ありで運用する。
- **トークンはサーバー側（環境変数）に置き、クライアントへ絶対に露出しない**（`NEXT_PUBLIC_` を付けない）。これは Server Components でサーバーフェッチする設計判断（DESIGN.md §5）の根拠の一つ。

---

## 3. レート制限

検索エンドポイントと通常（コア）エンドポイントで制限が別枠なのが重要。

| エンドポイント種別 | 認証あり | 認証なし |
|---|---|---|
| 検索（`/search/*`） | **30 リクエスト / 分** | **10 リクエスト / 分** |
| コア（`/repos/{owner}/{repo}` 等） | 5,000 リクエスト / 時 | 60 リクエスト / 時 |

- 検索は「分」単位、コアは「時」単位という別系統。詳細ページの `GET /repos/...` はコア枠を消費する。
- レスポンスヘッダで残量を確認できる:
  - `X-RateLimit-Limit` … 上限
  - `X-RateLimit-Remaining` … 残り
  - `X-RateLimit-Reset` … リセット時刻（UNIX秒）
  - `Retry-After` … 再試行までの秒数（返る場合）
- 超過時は `403`（または `429`）が返る。

> **実装メモ**: 認証なしの検索10req/分は、打鍵ごとに検索すると即枯渇する。デバウンス（入力が止まってから検索）と認証（30req/分へ緩和）の両方で対策する。超過時は生のステータスを見せず「混雑中・少し待って再試行」と翻訳して表示する（REQUIREMENTS.md FR-14）。

---

## 4. `GET /search/repositories`（リポジトリ検索）

### 4.1 クエリパラメータ

| パラメータ | 必須 | 説明 | 既定 / 制限 |
|---|---|---|---|
| `q` | 必須 | 検索キーワード＋修飾子（qualifier） | 後述の制限あり |
| `sort` | 任意 | 並び順の基準: `stars` / `forks` / `help-wanted-issues` / `updated` | 省略時は関連度（best match） |
| `order` | 任意 | `asc` / `desc` | `desc` |
| `per_page` | 任意 | 1ページあたり件数 | 既定30・最大100 |
| `page` | 任意 | ページ番号 | 1始まり |

> **実装メモ（ソート / REQUIREMENTS.md FR-17）**: 本アプリで採用するソート項目は **関連度（`sort`未指定）/ Star数（`stars`）/ Fork数（`forks`）/ 更新日時（`updated`）** の4種。`help-wanted-issues` はコントリビューター探し向けのニッチな軸で主目的から外れるため除外。**名前順はAPIの `sort` に存在しない**ため採用しない（クライアントで並べると現在ページ内だけのソートになり、全体の名前順にならない）。並び替えは必ず `sort`/`order` をAPIに渡してサーバー側で行う（取得は最大1000件・ページング前提のため、クライアントソートは「そのページ内だけ」になり誤り）。デフォルトを関連度（未指定）にして、キーワード検索の「探したいものが上に来る」基本体験を保つ。

### 4.2 クエリ `q` の構文と制限

- 形式: `キーワード 修飾子` を空白区切り（例: `react in:name language:typescript stars:>1000`）。
- 主な修飾子の例: `in:name`（名前で一致）、`language:`（言語）、`stars:>N`（Star数）、`user:` / `org:`（所有者）、`topic:`（トピック）。
- **必ず URL エンコードする**（`encodeURIComponent`）。空白や `>` 等が含まれるため。
- 制限（超えると `422 Validation Failed`）:
  - `q` は **256文字以内**（修飾子・演算子を除く）。
  - `AND` / `OR` / `NOT` 演算子は **5個まで**。

```javascript
// クエリ構築の例
const q = encodeURIComponent("react language:typescript stars:>1000");
const url = `https://api.github.com/search/repositories?q=${q}&per_page=30&page=1`;
```

### 4.3 結果数とタイムアウトの制限

- **1回の検索で取得できるのは最大 1,000 件**（`total_count` がそれ以上でも、ページングで取れるのは1000件まで）。
- 内部的に検索対象とするリポジトリ数にも上限がある（パフォーマンス維持のため）。
- クエリが時間制限を超えると、見つかった分だけ返し、`incomplete_results` が `true` になる。`true` でも「結果が不完全」とは限らない点に注意。

> **実装メモ**: 1000件上限があるため、本アプリは「無限に流れるデータ」ではない。ページネーションが素直に成立する根拠（DESIGN.md §4・無限スクロール不採用の理由）。`total_count` を使って「全N件」を表示できる。

### 4.4 レスポンス構造

```jsonc
{
  "total_count": 12345,          // 該当総数（最大1000件まで取得可）
  "incomplete_results": false,    // タイムアウトで打ち切られたか
  "items": [ /* リポジトリの配列 */ ]
}
```

### 4.5 `items[]` の主なフィールド（本アプリで使う分）

| フィールド | 型 | 意味 |
|---|---|---|
| `id` | number | リポジトリID（安定識別子） |
| `name` | string | リポジトリ名 |
| `full_name` | string | `owner/repo` 形式 |
| `owner.login` | string | オーナー名 |
| `owner.avatar_url` | string | オーナーアイコンURL |
| `html_url` | string | GitHub上のページURL |
| `description` | string \| null | 説明 |
| `language` | string \| null | 主要言語（無い場合 `null`） |
| `stargazers_count` | number | **Star数** |
| `watchers_count` | number | ⚠️ Star数のエイリアス（§6の罠） |
| `forks_count` | number | Fork数 |
| `open_issues_count` | number | オープンなIssue数（PR含む場合あり） |

> **注意**: `open_issues_count` は Issue と Pull Request の合計を指すことがある（GitHubはPRもIssueの一種として扱う）。「純粋なIssue数」が必要なら別途絞り込みが要るが、本課題の表示要件としては `open_issues_count` で十分。

---

## 5. `GET /repos/{owner}/{repo}`（リポジトリ詳細取得）

詳細ページで使う。検索結果のデータを使い回さず、これを改めて叩くのが推奨（理由は §6）。

### 5.1 パスパラメータ

| パラメータ | 説明 |
|---|---|
| `owner` | オーナー名 |
| `repo` | リポジトリ名 |

### 5.2 主なレスポンスフィールド（詳細表示の7項目に対応）

| 表示要件 | 使うフィールド | 備考 |
|---|---|---|
| リポジトリ名 | `full_name` / `name` | |
| オーナーアイコン | `owner.avatar_url` | `alt` はオーナー名 |
| プロジェクト言語 | `language` | `null` あり |
| Star数 | `stargazers_count` | |
| **Watcher数** | **`subscribers_count`** | ⚠️ ここが罠。§6必読 |
| Fork数 | `forks_count` | |
| Issue数 | `open_issues_count` | |

- 存在しない `owner/repo` を指定すると `404 Not Found`。
- このエンドポイントはコアのレート制限枠（認証あり5000/時）を使う。

---

## 6. ⚠️ Watcher数の罠（最重要・公式仕様）

### 6.1 何が起きるか

GitHub公式ドキュメントによる定義:

- **`subscribers_count`** … 真の「Watcher（ウォッチャー）数」＝ そのリポジトリの更新通知を購読している人数。
- **`watchers` / `watchers_count` / `stargazers_count`** … いずれも「Star数」を指す（同じ値）。

つまり `watchers_count` という名前に反して、中身はStar数。歴史的経緯（2012年8月に「Watch」の意味が「Star」に変わったが、API互換性のためフィールド名は据え置かれた）による負債。

### 6.2 具体例

人気リポジトリ（例: vscode）で実際に観測される値:

| フィールド | 値の例 | 実際の意味 |
|---|---|---|
| `stargazers_count` | 70,274 | Star数 |
| `watchers_count` | 70,274 | ← Star数と同じ（罠） |
| `watchers` | 70,274 | ← Star数と同じ |
| `subscribers_count` | 2,667 | ← これが本当のWatcher数 |

`watchers_count` を表示すると「Star数 = Watcher数」になるバグが必ず出る。

### 6.3 実装方針（このアプリの結論）

- **Watcher数は `subscribers_count` を使う。`watchers_count` は使わない。**
- 重要な注意: **`subscribers_count` は検索結果（`/search/repositories`）に必ずしも含まれない**。確実に取得できるのは `GET /repos/{owner}/{repo}`。
- したがって **詳細ページは検索結果を使い回さず、`GET /repos/{owner}/{repo}` を改めて取得する**。これにより正確な `subscribers_count` が得られ、かつ詳細ページが一覧に依存しない自己完結ページになる（DESIGN.md §4.3・§6.3、REQUIREMENTS.md FR-09 と整合）。
- アンチコラプションレイヤ（アダプタ）の中で `watchers: raw.subscribers_count` と一度だけ正しくマップし、この罠をUIから完全に隠す。

---

## 6.5 ⚠️ `open_issues_count` の注意（Issue数にPRを含む）

### 何が起きるか

詳細表示の「Issue数」に使う **`open_issues_count`** は、名前に反して **オープンな Issue 数 ＋ オープンな Pull Request 数の合算**である。純粋な Issue だけの件数ではない。

理由: GitHub のデータモデルでは Pull Request は「コード差分が紐づいた Issue」として扱われ、Issue と同じ番号体系・同じ枠組みを共有する。そのため `open_issues_count` も PR を含む。

例: オープン Issue 10 件・オープン PR 5 件のリポジトリ → `open_issues_count` は 15。

### 実装方針（このアプリの結論）

- **`open_issues_count` をそのまま「Issue数」として表示する。**
- 根拠: GitHub 自身がリポジトリの代表値として（UI 上でも）この値を使っており、要件 §3.3 の「Issue数」表示としてはこれが妥当。
- 純粋な Issue 数（PR 除外）が必要なら `GET /search/issues?q=...+type:issue` で別途取得が要るが、追加の API コール・複雑さに見合わないため本アプリのスコープ外とする（過剰実装の回避）。

---

## 7. ページネーション

- `page`（1始まり）と `per_page`（最大100）で制御。
- レスポンスの `Link` ヘッダに次/前/最後のページURLが入る（`rel="next"`, `rel="prev"`, `rel="last"`, `rel="first"`）。
- ただし検索は **合計1000件が上限**（§4.3）。`per_page=100` なら最大10ページ。
- 本アプリは `?page=` をURLクエリに反映し、リロード・共有で再現できるようにする（REQUIREMENTS.md FR-05）。

---

## 8. エラーレスポンス

| ステータス | 意味 | 主な原因 | UIでの扱い |
|---|---|---|---|
| `401` | Unauthorized | トークン不正・期限切れ | 設定ミス。開発時に検知 |
| `403` / `429` | レート制限超過 | 検索10〜30req/分等を超過 | 「混雑中・再試行」と表示。`Retry-After` を尊重 |
| `404` | Not Found | 存在しない `owner/repo` | `not-found.tsx`（FR-15） |
| `422` | Validation Failed | クエリ不正（256字超・演算子過多・権限外リソース指定） | 「検索条件を見直してください」等 |
| `503` 等 | Service 系 | GitHub側の一時障害 | フォールバックUI＋再試行（FR-14） |

> **実装メモ**: `lib/github/errors.ts` で `RateLimitError` / `ValidationError` / `NotFoundError` に型付けし、UIは型に応じて人間向けメッセージへ翻訳する。生のステータスコードやGitHubの生メッセージをそのまま見せない。

---

## 9. このアプリでのエンドポイント使い分け（まとめ）

| 画面 | エンドポイント | レート枠 | 取得フィールド |
|---|---|---|---|
| 検索一覧 | `GET /search/repositories?q=&page=&per_page=` | 検索（30/分） | `total_count` / `items[]`（名前・オーナー・言語・Star等） |
| 詳細 | `GET /repos/{owner}/{repo}` | コア（5000/時） | 7項目（Watcherは `subscribers_count`） |

設計上のポイント（再掲）:

1. どちらもサーバー側で叩き、トークンを秘匿する（§2）。
2. 生レスポンスはアダプタ（ACL）でドメイン型に変換し、`watchers_count` の罠・snake_case をUIから隠す（§6.3）。
3. 検索は1000件上限・別レート枠を踏まえ、デバウンス＋ページネーションで設計する（§3・§4.3）。

---

## 10. 参考（公式ドキュメント）

- REST API / Search: `https://docs.github.com/en/rest/search/search`
- REST API / Repositories（Get a repository）: `https://docs.github.com/en/rest/repos/repos`
- レート制限: `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api`
- Watching（Watcher数の定義）: `https://docs.github.com/en/rest/activity/watching`
- ページネーション: `https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api`
