#!/bin/zsh
# usage: mkpreview.sh splash.json out.html
{
cat <<'H'
<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Splash Preview</title>
<style>
:root{--bg:#ffffff;--fg:#333}
html,body{margin:0;height:100%;background:var(--bg);color:var(--fg);font-family:system-ui,sans-serif}
#stage{position:fixed;inset:0;display:flex;align-items:center;justify-content:center}
#anim{width:min(100vw,90vh*0.9);height:min(100vh,100vw*1.111)}
#replay{position:fixed;right:16px;bottom:16px;padding:8px 14px;border:1px solid #ccc;border-radius:8px;background:#fff;cursor:pointer}
</style></head><body>
<div id="stage"><div id="anim"></div></div><button id="replay">Replay</button>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
<script>const DATA=
H
cat "$1"
cat <<'H'
;
const a=lottie.loadAnimation({container:document.getElementById('anim'),renderer:'svg',loop:false,autoplay:true,animationData:DATA,rendererSettings:{preserveAspectRatio:'xMidYMid meet'}});
window.__anim=a;
document.getElementById('replay').onclick=()=>a.goToAndPlay(0,true);
</script></body></html>
H
} > "$2"
