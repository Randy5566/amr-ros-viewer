# TaiwanGoBoT × MERRYCAN 開場動畫

| 檔案 | 用途 |
|---|---|
| `splash.json` | **主檔：Lottie 動畫**（1080×1200、60fps、3 秒、約 180 KB、透明背景）。Electron 與 Android 共用同一份 |
| `splash-final.svg` | 最後一幀的靜態向量圖，可當 fallback / 系統啟動畫面底圖 |
| `preview.html` | 直接用瀏覽器開啟即可預覽（含 Replay 按鈕） |
| `source/` | 原始 logo 點陣圖 |
| `tools/` | 重新產生動畫的腳本（trace.py → build.py → mkpreview.sh） |

## 動畫時間軸

| 時間 | 內容 |
|---|---|
| 0.0 – 1.7s | TaiwanGoBoT logo 從**左**側起筆描線；MERRYCAN logo 從**右**側起筆描線（每個輪廓從最左／最右點向兩側延伸） |
| 0.45 – 1.8s | 「TaiwanGoBoT」文字由左至右逐字描出（金色 `#D3A132`） |
| 1.35 – 2.0s | 中間「×」兩筆畫出並微放大 |
| 1.45 – 2.05s | 描線淡出、實心填色淡入 |
| 2.05 – 3.0s | 完成畫面停留 |

## 為什麼選 Lottie（JSON）

- **向量**：任何解析度、任何螢幕密度都清晰，檔案小。
- **一份檔案兩平台**：Electron 用 `lottie-web`，Android 用 `lottie-android`（Airbnb 官方，Compose / View 皆可）。
- 「描線 → 填色」靠 Lottie 的 Trim Paths 做，不需要逐幀圖片；GIF/MP4/WebP 動圖會有放大模糊、背景不透明、檔案較大等問題。
- 想更小可轉成 `.lottie`（dotLottie，zip 壓縮，約 40–60 KB），兩平台的 dotLottie 播放器都支援。

## Electron

```bash
npm i lottie-web
```

建立一個無邊框的 splash 視窗載入本地 HTML（不要用 CDN，打包後離線也能跑）：

```js
// main.js
const splash = new BrowserWindow({ width: 540, height: 600, frame: false, resizable: false,
  backgroundColor: '#ffffff', show: true, webPreferences: { preload: path.join(__dirname, 'splash-preload.js') } });
splash.loadFile('splash.html');
ipcMain.once('splash-done', () => { mainWindow.show(); splash.destroy(); });
```

```js
// splash.html 內的 script（splash.json 一起打包）
import lottie from 'lottie-web';
import data from './splash.json';
const anim = lottie.loadAnimation({ container: document.getElementById('anim'),
  renderer: 'svg', loop: false, autoplay: true, animationData: data });
anim.addEventListener('complete', () => window.splashApi.done()); // preload 內 ipcRenderer.send('splash-done')
```

建議：主視窗在背景 `show: false` 先載入，動畫結束 **且** 主視窗 `ready-to-show` 後才切換。

## Android

Android 12+ 一定會先顯示系統 SplashScreen（只能放一個圓形裁切的 icon，動態 icon 建議 ≤1 秒），**不適合**放兩個 logo + 文字的完整動畫。建議做法：

1. 系統 SplashScreen：背景設白色 `#FFFFFF`、icon 用透明或 TaiwanGoBoT 靜態 icon，並立刻結束（不延長）。
2. 接著顯示一個全螢幕 Splash 畫面播放 `splash.json`，播完再進主畫面。

```kotlin
// build.gradle
implementation("com.airbnb.android:lottie-compose:6.6.0")
```

把 `splash.json` 放到 `app/src/main/res/raw/splash.json`：

```kotlin
@Composable
fun SplashScreen(onFinished: () -> Unit) {
    val composition by rememberLottieComposition(LottieCompositionSpec.RawRes(R.raw.splash))
    val progress by animateLottieCompositionAsState(composition, iterations = 1)
    LaunchedEffect(progress) { if (progress == 1f) onFinished() }
    Box(Modifier.fillMaxSize().background(Color.White), contentAlignment = Alignment.Center) {
        LottieAnimation(composition, { progress }, Modifier.fillMaxWidth(0.8f))
    }
}
```

## 注意事項（上線前請處理）

1. **MERRYCAN logo 來源解析度很低**（170×76 px），「MERRYCAN」字樣是放大後描圖而來，中文與英文副標是用字型重建的。上線前建議向美利堅索取官方向量檔（AI / SVG / PDF），替換後重跑 `tools/`。
2. **字型授權**：目前「TaiwanGoBoT」用 Arial Rounded Bold、美立堅副標用 Arial Unicode / Arial（macOS 內建字型）轉外框。商用 App 內嵌這些字型的外框需確認授權；可改用開源字型（如 Nunito、M PLUS Rounded 1c、Noto Sans TC）—修改 `tools/trace.py` 中的字型路徑即可。
3. 背景為透明，設計上以**白底**為前提（MERRYCAN 灰／藍字在深色背景上對比不足）。

## 重新產生

```bash
python3 -m venv .venv && .venv/bin/pip install pillow numpy potracer fonttools
.venv/bin/python tools/trace.py source/taiwangobot-logo.png source/merrycan-logo.png shapes.json
.venv/bin/python tools/build.py shapes.json .
./tools/mkpreview.sh splash.json preview.html
```

時間、顏色、排版都在 `tools/build.py` 上方的常數與 layout 區塊調整。
