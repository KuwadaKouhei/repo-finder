/**
 * 「この読み込みで、一覧から詳細へアプリ内遷移（<Link> のソフトナビゲーション）を
 * 経由して来たか」を表すクライアント上のメモリフラグ。一覧カードのクリック時に
 * 同期的に true にする（{@link markNavigatedInApp}）。
 *
 * 直アクセス・リロード・外部流入は必ずフルロードになり、その都度この JS モジュールが
 * 再評価されて false に戻る。一方カード経由のソフト遷移ではモジュールが保持され
 * true のまま残る。sessionStorage と違いセッションをまたいで残らないため、
 * 「過去に検索した」事実が後続の直アクセスへ漏れない（＝直アクセス判定が正確）。
 *
 * 戻るボタンの表示判定（直アクセス時は非表示）は描画時に確定している必要があるため、
 * 描画後に走る effect ではなく、遷移の起点（カードのクリック）で同期的に立てる。
 */
let navigatedInApp = false;

/** 一覧から詳細へのアプリ内遷移が発生したことを記録する（カードのクリック時に呼ぶ）。 */
export function markNavigatedInApp(): void {
  navigatedInApp = true;
}

/** この読み込みでアプリ内遷移を経由したかを返す。 */
export function hasNavigatedInApp(): boolean {
  return navigatedInApp;
}
