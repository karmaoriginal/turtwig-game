// Teclado y controles tactiles.
"use strict";
// ---------------- entrada + bucle
const KEYMAP={ArrowUp:"up",KeyW:"up",ArrowDown:"down",KeyS:"down",ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",
  KeyE:"talk",KeyZ:"atk1",KeyX:"atk2",KeyC:"atk3",KeyV:"atk4",KeyB:"atk5",KeyN:"atk6",KeyH:"hurt",KeyF:"faint",KeyR:"reset",KeyG:"transform",KeyI:"help",Enter:"ok",Escape:"back",
  Tab:"viewer",F3:"debug",Space:"pause",KeyO:"points",KeyP:"species",Comma:"prev",Period:"next",ShiftLeft:"run",ShiftRight:"run"};
const held=new Set();let pressed=new Set();
addEventListener("keydown",e=>{const a=KEYMAP[e.code];if(!a)return;e.preventDefault();if(!e.repeat)pressed.add(a);held.add(a)});
addEventListener("keyup",e=>{const a=KEYMAP[e.code];if(a){e.preventDefault();held.delete(a)}});
addEventListener("blur",()=>held.clear());
// ---- pantalla completa + controles táctiles: usan los mismos "held"/"pressed" que el teclado
(()=>{const $=id=>document.getElementById(id),de=document.documentElement;
  // pantalla completa: botón (también con ratón) y, en el móvil, al primer toque
  const fsb=$("fsb"),isFS=()=>document.fullscreenElement||document.webkitFullscreenElement,canFS=!!(de.requestFullscreen||de.webkitRequestFullscreen);
  const enterFS=()=>{try{Promise.resolve((de.requestFullscreen||de.webkitRequestFullscreen).call(de,{navigationUI:"hide"})).then(()=>{try{screen.orientation.lock("landscape").catch(()=>{})}catch(_){}}).catch(()=>{})}catch(_){}};
  const exitFS=()=>{try{(document.exitFullscreen||document.webkitExitFullscreen).call(document)}catch(_){}};
  const refit=()=>{if(fsb)fsb.classList.toggle("is-fs",!!isFS());setTimeout(()=>{if(typeof fit==="function")fit()},80)};
  document.addEventListener("fullscreenchange",refit);document.addEventListener("webkitfullscreenchange",refit);
  if(fsb&&canFS){fsb.style.display="flex";fsb.addEventListener("click",()=>isFS()?exitFS():enterFS())}
  const root=$("tc");if(!root)return;
  if(!(matchMedia("(pointer:coarse)").matches||"ontouchstart" in window||/[?&]touch=1/.test(location.search)))return;
  root.style.display="block";document.body.classList.add("touchy");
  const press=a=>{pressed.add(a);held.add(a)},rel=a=>held.delete(a),buzz=()=>{try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}};
  addEventListener("contextmenu",e=>e.preventDefault());
  if(canFS)addEventListener("pointerup",()=>{if(!isFS())enterFS()},{once:true});   // el navegador solo permite fullscreen al soltar el dedo
  root.querySelectorAll("[data-k]").forEach(b=>{const a=b.dataset.k;
    const dn=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add("on");buzz();press(a)},up=e=>{e.preventDefault();b.classList.remove("on");rel(a)};
    b.addEventListener("pointerdown",dn);b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);b.addEventListener("lostpointercapture",up)});
  // joystick flotante: la base aparece donde pones el pulgar (mitad izquierda) y sigue al dedo si te pasas
  const zone=$("tz"),js=$("tj"),kn=$("tjk"),D=["up","down","left","right"];let pid=null,bx=0,by=0;if(!zone||!js||!kn)return;
  const rad=()=>js.offsetWidth/2,place=(x,y)=>{js.style.left=x+"px";js.style.top=y+"px"};
  const setDirs=(dx,dy)=>{const r=rad(),d=Math.hypot(dx,dy),on={};
    if(d>r*.2){const ax=dx/d,ay=dy/d;on.left=ax<-.38;on.right=ax>.38;on.up=ay<-.38;on.down=ay>.38}
    for(const a of D){if(on[a]){if(!held.has(a))press(a)}else rel(a)}
    const k=Math.min(d,r*.62)/(d||1);kn.style.transform="translate(-50%,-50%) translate("+dx*k+"px,"+dy*k+"px)"};
  const move=e=>{let dx=e.clientX-bx,dy=e.clientY-by;const d=Math.hypot(dx,dy),lim=rad()*1.1;
    if(d>lim){const f=(d-lim)/d;bx+=dx*f;by+=dy*f;dx=e.clientX-bx;dy=e.clientY-by;place(bx,by)}
    setDirs(dx,dy)};
  zone.addEventListener("pointerdown",e=>{e.preventDefault();if(pid!==null)return;pid=e.pointerId;try{zone.setPointerCapture(pid)}catch(_){}
    const m=rad()+10,zr=zone.getBoundingClientRect();
    bx=Math.min(Math.max(e.clientX,zr.left+m),zr.right-m);by=Math.min(Math.max(e.clientY,m),innerHeight-m);
    place(bx,by);js.classList.add("on");move(e)});
  zone.addEventListener("pointermove",e=>{if(e.pointerId===pid){e.preventDefault();move(e)}});
  const end=e=>{if(e.pointerId!==pid)return;pid=null;setDirs(0,0);js.classList.remove("on");js.style.left=js.style.top=""};
  zone.addEventListener("pointerup",end);zone.addEventListener("pointercancel",end);zone.addEventListener("lostpointercapture",end);
})();
