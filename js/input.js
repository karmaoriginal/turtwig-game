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
// ---- controles táctiles: usan los mismos "held"/"pressed" que el teclado
(()=>{const root=document.getElementById("tc");if(!root)return;
  if(!(matchMedia("(pointer:coarse)").matches||"ontouchstart" in window||/[?&]touch=1/.test(location.search)))return;
  root.style.display="block";document.body.classList.add("touchy");
  const press=a=>{pressed.add(a);held.add(a)},rel=a=>held.delete(a);
  addEventListener("contextmenu",e=>e.preventDefault());
  let fs=false;addEventListener("pointerdown",()=>{if(fs)return;fs=true;try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen({navigationUI:"hide"}).catch(()=>{})}catch(e){}},{once:true});
  root.querySelectorAll("[data-k]").forEach(b=>{const a=b.dataset.k;
    const dn=e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId)}catch(_){}b.classList.add("on");press(a)},up=e=>{e.preventDefault();b.classList.remove("on");rel(a)};
    b.addEventListener("pointerdown",dn);b.addEventListener("pointerup",up);b.addEventListener("pointercancel",up);b.addEventListener("lostpointercapture",up)});
  const js=document.getElementById("tj"),kn=document.getElementById("tjk"),D=["up","down","left","right"];let pid=null;
  const setDirs=(dx,dy)=>{const r=js.clientWidth/2,d=Math.hypot(dx,dy),on={};
    if(d>r*.22){const ax=dx/d,ay=dy/d;on.left=ax<-.38;on.right=ax>.38;on.up=ay<-.38;on.down=ay>.38}
    for(const a of D){if(on[a]){if(!held.has(a))press(a)}else rel(a)}
    const k=Math.min(d,r*.6)/(d||1);kn.style.transform="translate("+dx*k+"px,"+dy*k+"px)"};
  const move=e=>{const b=js.getBoundingClientRect();setDirs(e.clientX-(b.left+b.width/2),e.clientY-(b.top+b.height/2))};
  js.addEventListener("pointerdown",e=>{e.preventDefault();pid=e.pointerId;try{js.setPointerCapture(pid)}catch(_){}move(e)});
  js.addEventListener("pointermove",e=>{if(e.pointerId===pid){e.preventDefault();move(e)}});
  const end=e=>{if(e.pointerId===pid){pid=null;setDirs(0,0)}};
  js.addEventListener("pointerup",end);js.addEventListener("pointercancel",end);js.addEventListener("lostpointercapture",end);
})();
