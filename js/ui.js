// Fase 2: UI animada — transiciones entre pantallas, fondo/marcos nuevos, menú animado y toques directos.
"use strict";
const UI=window.UI={ok:false};
const c01=x=>x<0?0:x>1?1:x,eOut=x=>1-Math.pow(1-c01(x),3),eBack=x=>{x=c01(x);return 1+2.70158*Math.pow(x-1,3)+1.70158*Math.pow(x-1,2)};
UI.sm=(o,k,v,r=.2)=>{if(o[k]===undefined)o[k]=v;o[k]+=(v-o[k])*r;if(Math.abs(v-o[k])<.01)o[k]=v;return o[k]};   // suavizado hacia un objetivo
UI.notch=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+1,y,w-2,h);ctx.fillRect(x,y+1,w,h-2)};                      // rectángulo con esquinas cortadas

// ---- fondo con degradado, franjas lentas, partículas y viñeta; marcos con sombra y brillo
const PT=Array.from({length:26},()=>({x:Math.random()*W,y:Math.random()*H,s:Math.random()<.3?2:1,v:.12+Math.random()*.3,ph:Math.random()*6.28,a:.12+Math.random()*.28}));
G.bg=function(c1,c2){const g=ctx.createLinearGradient(0,0,0,H),t=performance.now()/1000;g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(255,255,255,.03)";for(let x=-H-48+(t*10)%48;x<W+48;x+=48){ctx.beginPath();ctx.moveTo(x,H);ctx.lineTo(x+14,H);ctx.lineTo(x+14+H,0);ctx.lineTo(x+H,0);ctx.fill()}
  ctx.fillStyle="#d8ecff";for(const p of PT){p.y-=p.v;p.x+=Math.sin(t*.8+p.ph)*.18;if(p.y<-3){p.y=H+3;p.x=Math.random()*W}ctx.globalAlpha=p.a*(.6+.4*Math.sin(t*2+p.ph));ctx.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s)}
  ctx.globalAlpha=1;const v=ctx.createRadialGradient(W/2,H/2,H*.4,W/2,H/2,H*1.05);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.4)");ctx.fillStyle=v;ctx.fillRect(0,0,W,H)};
G.frame=function(x,y,w,h,col){ctx.fillStyle="rgba(0,0,0,.4)";ctx.fillRect(x-1,y,w+6,h+6);UI.notch(x-3,y-3,w+6,h+6,col);UI.notch(x-1,y-1,w+2,h+2,"#10131c");ctx.fillStyle="rgba(255,255,255,.22)";ctx.fillRect(x-2,y-3,w+4,1)};

// ---- logo con degradado, rebote de entrada y brillo que lo barre
UI.title=(str,cx,y,sz,t,a)=>{const o=octx;o.save();o.globalAlpha=a;o.font="900 "+Math.round(sz*S)+"px ui-monospace,Consolas,Menlo,monospace";o.textBaseline="top";o.textAlign="center";
  const w=o.measureText(str).width,X=cx*S,Y=y*S;o.lineJoin="round";o.lineWidth=Math.max(3,S*1.3);o.strokeStyle="#0a0d18";o.strokeText(str,X,Y+S*1.5);
  const g=o.createLinearGradient(0,Y,0,Y+sz*S);g.addColorStop(0,"#fff6c0");g.addColorStop(.5,"#ffd24a");g.addColorStop(1,"#ff9a2a");o.fillStyle=g;o.strokeText(str,X,Y);o.fillText(str,X,Y);
  const sx=X-w/2+w*(((t%160)/160)*1.7-.35),h=o.createLinearGradient(sx-w*.12,0,sx+w*.12,0);h.addColorStop(0,"rgba(255,255,255,0)");h.addColorStop(.5,"rgba(255,255,255,.8)");h.addColorStop(1,"rgba(255,255,255,0)");o.fillStyle=h;o.fillText(str,X,Y);o.restore()};

// ---- transiciones: se congela la pantalla anterior y el navegador anima las nuevas (deslizar / iris)
(()=>{const D={menu:0,select:1,teams:1,vs:2,fight:3,story:3,volley:3},B="translate(-50%,-50%)",snap=document.createElement("canvas");let run=[];
  snap.style.display="none";document.body.insertBefore(snap,cv);
  UI.go=(from,to)=>{if(!UI.ok||!cv.animate)return;run.forEach(a=>{try{a.cancel()}catch(_){}});
    snap.width=cv.width;snap.height=cv.height;snap.style.width=cv.style.width;snap.style.height=cv.style.height;const x=snap.getContext("2d");x.drawImage(cv,0,0);x.drawImage(ov,0,0);snap.style.display="block";
    const f=(D[to]??1)-(D[from]??1),d=f>=0?1:-1,iris=D[to]===3&&D[from]!==3,du=iris?560:360,A=[];
    if(iris){const k=[{clipPath:"circle(0% at 50% 50%)"},{clipPath:"circle(78% at 50% 50%)"}],o={duration:du,easing:"cubic-bezier(.4,0,.2,1)"};
      A.push(cv.animate(k,o),ov.animate(k,o),snap.animate([{transform:B+" scale(1)",opacity:1,offset:0},{transform:B+" scale(1.04)",opacity:1,offset:.7},{transform:B+" scale(1.08)",opacity:0,offset:1}],{duration:du,fill:"forwards"}))}
    else if(f!==0){const k=[{transform:B+" translateX("+d*34+"%)",opacity:0},{transform:B,opacity:1}],o={duration:du,easing:"cubic-bezier(.22,.8,.24,1)"};
      A.push(cv.animate(k,o),ov.animate(k,o),snap.animate([{transform:B,opacity:1},{transform:B+" translateX("+-d*16+"%)",opacity:0}],{...o,fill:"forwards"}))}
    else{const o={duration:du};A.push(cv.animate([{opacity:0},{opacity:1}],o),ov.animate([{opacity:0},{opacity:1}],o),snap.animate([{opacity:1},{opacity:0}],{...o,fill:"forwards"}))}
    run=A;Promise.all(A.map(a=>a.finished)).then(()=>{if(run===A){snap.style.display="none";run=[]}}).catch(()=>{})};
  let sc=G.scene;Object.defineProperty(G,"scene",{configurable:true,enumerable:true,get(){return sc},set(v){const o=sc;sc=v;if(v!==o)UI.go(o,v)}});
  const d0=G.draw;G.draw=function(){d0.call(this);UI.ok=true}})();

// ---- menú principal animado
const CARDS=[["COMBATE","Pelea 1 vs 1 · evoluciones, tipos y estados"],["VOLEIBOL","Equipos de 1 a 6 · pase, colocación y remate"],["HISTORIA","Explora con tu entrenador (modo de prueba)"]];
UI.card=i=>({x:38,y:34+i*43,w:244,h:40});
G.drawMenu=function(){const t=this.t,m=this.mn||(this.mn={}),cur=this.menu.cur;this.bg("#141a30","#27356a");
  UI.title("TURTWIG",W/2,2-(1-eBack(t/34))*30,12,t,c01(t/12));
  this.ta=c01((t-12)/14);this.text("Elige cómo quieres jugar",W/2,19,"#aab4d6","center",3.8);this.ta=undefined;
  CARDS.forEach(([n,ds],i)=>{const r=UI.card(i),d=6+i*7,p=eBack((t-d)/26),a=c01((t-d)/10),sel=UI.sm(m,"s"+i,i===cur?1:0,.22),gr=Math.round(sel*2),
      x=r.x-gr+Math.round((1-p)*180),y=r.y-gr,w=r.w+gr*2,h=r.h+gr*2;
    ctx.globalAlpha=a;ctx.fillStyle="rgba(0,0,0,.35)";ctx.fillRect(x+2,y+3,w,h);UI.notch(x,y,w,h,sel>.5?"#ffd24a":"#39425f");UI.notch(x+1,y+1,w-2,h-2,"#10131c");
    if(sel>.02){const g=ctx.createLinearGradient(x,0,x+w,0);g.addColorStop(0,"rgba(60,120,255,.4)");g.addColorStop(1,"rgba(60,120,255,0)");ctx.globalAlpha=a*sel;ctx.fillStyle=g;ctx.fillRect(x+1,y+1,w-2,h-2);
      ctx.globalAlpha=a*sel*(.1+.08*Math.sin(t/7));ctx.fillStyle="#ffe070";ctx.fillRect(x+1,y+1,w-2,h-2);ctx.globalAlpha=a}
    const iy=y+3+Math.round(Math.sin(t/13+i*2)*(1+sel*1.2));
    if(i===0)this.face(PIC.turtwig.normal,x+6,iy,34,34);else if(i===1)this.face(BALLS[this.ballSkin],x+8,iy+2,32,32);else{const im=TR_IMG.boy;if(im&&im.width)ctx.drawImage(im,0,TR_H,TR_W,TR_H,x+18,iy+2,TR_W,TR_H)}
    ctx.globalAlpha=1;this.ta=a;const nx=x+50+Math.round(sel*4);this.text(n,nx,y+6,sel>.5?"#fff":"#8a95bb","left",8);this.text(ds,nx,y+21,sel>.5?"#cfd8f5":"#5d6890","left",3.8);
    if(i===cur)this.text("▶",24+Math.round(Math.sin(t/6)*2),y+14,"#ffe070","left",8);this.ta=undefined});
  this.ta=c01((t-30)/14);this.text(document.body.classList.contains("touchy")?"Toca una opción":"↑ ↓ elegir      Z / Enter confirmar",W/2,H-9,"#7e89b0","center",3.4);this.ta=undefined};

// ---- toques/clics directos (menú, selector de peleador, pantalla VS)
UI.tapAt=(cx,cy)=>{const r=cv.getBoundingClientRect(),x=(cx-r.left)/S,y=(cy-r.top)/S;if(x>=0&&y>=0&&x<=W&&y<=H&&G.tap)G.tap(x,y)};
G.tap=function(x,y){const ok=()=>{pressed.add("ok");held.add("ok");setTimeout(()=>held.delete("ok"),60)};
  if(this.scene==="menu"){for(let i=0;i<3;i++){const r=UI.card(i);if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h){this.menu.cur=i;ok();return}}}
  else if(this.scene==="select"){const s=this.sel,n=ROSTER.length,z=40,gap=4,vis=6,st=Math.max(0,Math.min(n-vis,s.cur-2)),x0=Math.round((W-(vis*z+(vis-1)*gap))/2);
    if(y>=118&&y<=178){const i=Math.floor((x-x0)/(z+gap))+st;if(i>=st&&i<Math.min(n,st+vis)&&(x-x0)%(z+gap)<=z){if(i===s.cur)ok();else s.cur=i}}else if(y>=18&&y<=118&&x>=100&&x<=220)ok()}
  else if(this.scene==="vs")ok()};
{let pd=null;addEventListener("pointerdown",e=>{pd=(e.target===cv||e.target.id==="tz")?{x:e.clientX,y:e.clientY,t:performance.now()}:null},true);
  addEventListener("pointerup",e=>{const p=pd;pd=null;if(p&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<14&&performance.now()-p.t<380)UI.tapAt(e.clientX,e.clientY)},true)}
