/**
 * Google Apps Script 用エントリーポイント
 *
 * 使い方：
 * 1. Apps Script エディタで新規プロジェクトを作成
 * 2. この内容を「Code.gs」（自動生成されるファイル）に貼り付け
 * 3. 「ファイル」→「追加」→「HTML」で新規ファイルを作成し、ファイル名を index にする
 *    （拡張子.htmlは自動で付くので index.html という表示になります）
 * 4. index.html の内容として、このリポジトリの index.html の中身をすべてコピペする
 * 5. 「デプロイ」→「新しいデプロイ」→種類「ウェブアプリ」を選択
 *    アクセスできるユーザー：全員　を選び、デプロイするとURLが発行されます
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('合同な図形 学習ソフト')
    .addMetaTag('viewport', 'width=1024')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
