function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('ぼうグラフ がくしゅうツール')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
