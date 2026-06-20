# 通知表所見メーカー（Phase 1 MVP）

座席表から児童を選び、評価観点別キーワードを選択するとClaude APIが所見文のドラフトを生成する、小学校教員向けの通知表所見作成支援ツール。Phase 1は算数のみ・教員1名（自分専用アカウント）での動作を対象とする。

## セットアップ

1. Supabaseプロジェクトを作成し、`supabase/schema.sql` → `supabase/seed.sql` の順に実行する。
2. `.env.local.example` を `.env.local` にコピーし、以下を設定する。
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: SupabaseのプロジェクトURLとservice role key
   - `ANTHROPIC_API_KEY`: Claude APIキー
   - `APP_PASSWORD`: ログイン用の簡易パスワード（任意の文字列）
   - `SESSION_SECRET`: セッショントークン署名用のランダムな文字列
3. 依存関係をインストールして開発サーバーを起動する。

```bash
npm install
npm run dev
```

`http://localhost:3000` にアクセスするとログイン画面に遷移する。`APP_PASSWORD` でログイン後、座席表ビュー（`/seats`）が表示される。

## 機能（Phase 1）

- 簡易パスワード認証 + 30分の操作なしセッションタイムアウト
- 座席表ビュー（未着手／下書き／確定の色分け表示）
- 評価観点別キーワード選択 → Claude APIによる所見文生成（文字数指定対応）
- 同一単元・クラス内の直近の所見文との表現重複を避ける生成ロジック
- 所見文の編集履歴の保持（誰が・いつ・何を変更したか）
- Excel(.xlsx)形式での所見一覧エクスポート

## 今後のフェーズ

- Phase 2: 全教科対応、単元・キーワード管理画面
- Phase 3: 複数教員対応（Supabase Authへの移行）
- Phase 4: 年間指導計画アップロード解析、Googleスプレッドシート連携
