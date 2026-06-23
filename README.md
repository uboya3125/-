# 合同な図形 学習ソフト

小学5年生算数「合同な図形」単元の習熟用Webアプリです。

## 使い方

下記URLをブラウザで開いてください（インストール不要）：
https://（ユーザー名）.github.io/（リポジトリ名）/

## 機能

- **演習モード**：合同な図形の対応する辺・角度を求める問題（三角形・四角形）
- **作図モード**：コンパス・定規・分度器を使って合同な三角形をかく手順を体験

## ローカルでの使用

`index.html` をダウンロードしてブラウザで開くだけで動作します。

## 動作環境

- Windows PC（Chrome / Edge / Firefox 推奨）
- インターネット接続：Google Fontsの読み込みに必要（オフラインでも文字は表示されます）

## 先生向け：問題の追加方法

`index.html` 内の `<script>` タグの先頭にある `QUIZ_PROBLEMS`（演習モード用）・`DRAW_PROBLEMS`（作図モード用）の配列に、同じ形式でデータを追加すると問題を増やせます。

## GitHub Pages 公開手順

1. GitHubで新しいリポジトリを作成（例：goudou-app）
2. `index.html` と `README.md` をプッシュ
3. リポジトリの Settings → Pages → Branch: main / root → Save
4. 数分後に `https://（ユーザー名）.github.io/goudou-app/` で公開完了

## Google Apps Script (GAS) での公開手順

1. [script.google.com](https://script.google.com) で新規プロジェクトを作成
2. 自動生成される `コード.gs`（Code.gs）に、このリポジトリの `Code.gs` の内容をコピペ
3. 「ファイル」→「追加」→「HTML」でファイル名を `index` として新規作成
4. 作成された `index.html` に、このリポジトリの `index.html` の内容をそのままコピペ
5. 「デプロイ」→「新しいデプロイ」→種類「ウェブアプリ」を選択し、アクセスできるユーザーを設定してデプロイ
6. 発行されたURLでアプリが使用できます

## ライセンス

教育目的での自由な利用・改変を許可します。
