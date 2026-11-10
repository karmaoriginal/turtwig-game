// Motor: canvas, escalado de pantalla, sprites (Sprites) y animador (Animator).
"use strict";
const W=320,H=180;
const DIR_VEC=[[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
const DIR_NAMES=["down","down_right","right","up_right","up","up_left","left","down_left"];
const unit=d=>{const [x,y]=DIR_VEC[d],n=Math.hypot(x,y);return [x/n,y/n]};
const vecToDir=(dx,dy)=>DIR_VEC.findIndex(v=>v[0]===Math.sign(dx)&&v[1]===Math.sign(dy));
const cv=document.getElementById("c"),ctx=cv.getContext("2d");
ctx.imageSmoothingEnabled=false;
const ov=document.getElementById("ov"),octx=ov.getContext("2d");let S=3;
function fit(){S=Math.max(1,Math.floor(Math.min(innerWidth/W,innerHeight/H)));for(const c of [cv,ov]){c.style.width=W*S+"px";c.style.height=H*S+"px"}ov.width=W*S;ov.height=H*S;cv.width=W*S;cv.height=H*S;ctx.imageSmoothingEnabled=false}
addEventListener("resize",fit);fit();

// ---------------- sprites
const FALLBACK={Faint:"Hurt"};   // Grotle no trae Faint: usa Hurt
const IMGS={},SPECIES={},PIC={};let Bank;
class Sprites{
  constructor(key,data){this.key=key;this.data=data;this.anims=data.anims;this.aliases=data.aliases;this.names=Object.keys(data.anims);this.tints={}}
  resolve(n){n=this.aliases[n]||n;return this.anims[n]?n:(this.anims[FALLBACK[n]]?FALLBACK[n]:"Idle")}
  info(n){return this.anims[this.resolve(n)]}
  row(n,d){return d<this.info(n).rows?d:0}
  meta(n,d,i){return this.info(n).frames[this.row(n,d)][i]}
  image(n,d,i,tint){
    const m=this.meta(n,d,i),img=IMGS[this.key+"/"+m.file];
    if(!tint)return img;
    const k=m.file+tint;let c=this.tints[k];
    if(!c){c=document.createElement("canvas");c.width=img.width;c.height=img.height;const x=c.getContext("2d");x.drawImage(img,0,0);
      for(const part of tint.split("|")){   // "!c" = silueta de color, "~c" = capa translúcida, otro = multiplicar
        if(part[0]==="!"||part[0]==="~"){x.globalCompositeOperation="source-atop";x.fillStyle=part.slice(1);x.fillRect(0,0,c.width,c.height)}
        else{x.globalCompositeOperation="multiply";x.fillStyle=part;x.fillRect(0,0,c.width,c.height);x.globalCompositeOperation="destination-in";x.drawImage(img,0,0)}}
      x.globalCompositeOperation="source-over";
      this.tints[k]=c}
    return c}
  draw(n,d,i,pos,tint,shadow=true){
    const m=this.meta(n,d,i),[cx,cy]=m.center;
    if(shadow){const [sx,sy]=m.shadow,[w,h]=[[10,4],[14,5],[20,7]][Math.min(this.data.shadow_size,2)];
      ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();
      ctx.ellipse(Math.round(pos[0]+sx-cx),Math.round(pos[1]+sy-cy),w/2,h/2,0,0,7);ctx.fill()}
    ctx.drawImage(this.image(n,d,i,tint),Math.round(pos[0]-cx),Math.round(pos[1]-cy))}
  // sprite agrandado a escala ENTERA (cada píxel del sprite = sc x sc píxeles), anclado en los pies; sin suavizado
  drawBig(n,d,i,foot,tint,sc,shadow=true){const m=this.meta(n,d,i),[sx,sy]=m.shadow,img=this.image(n,d,i,tint);sc=Math.max(1,Math.round(sc*S))/S;const q=v=>Math.round(v*S)/S,fx=q(foot[0]),fy=q(foot[1]);
    if(shadow){const [w,h]=[[10,4],[14,5],[20,7]][Math.min(this.data.shadow_size,2)];ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(fx,fy,w/2*sc,h/2*sc,0,0,7);ctx.fill()}
    ctx.drawImage(img,q(fx-sx*sc),q(fy-sy*sc),q(img.width*sc),q(img.height*sc))}
}
function loadAll(){
  for(const k in ANIMS)SPECIES[k]=new Sprites(k,ANIMS[k]);Bank=SPECIES.turtwig;
  const jobs=Object.keys(FRAMES).map(f=>new Promise(r=>{const im=new Image();im.onload=r;im.src=FRAMES[f];IMGS[f]=im}));
  for(const s in PORTRAITS){PIC[s]={};for(const k in PORTRAITS[s])jobs.push(new Promise(r=>{const im=new Image();im.onload=r;im.src=PORTRAITS[s][k];PIC[s][k]=im}))}
  return Promise.all(jobs);
}

class Animator{
  constructor(sp){this.sp=sp;this.name=null;this.frame=0;this.t=0;this.loop=true;this.done=false}
  play(n,loop=true,restart=false){if(n===this.name&&!restart)return;Object.assign(this,{name:n,frame:0,t:0,loop,done:false})}
  update(){ // devuelve el frame al que se entró o null
    if(this.done||!this.name)return null;
    const durs=this.sp.info(this.name).durations;this.t++;
    if(this.t>=durs[this.frame]){this.t=0;
      if(this.frame+1>=durs.length){if(this.loop){this.frame=0;return 0}this.done=true;return null}
      this.frame++;return this.frame}
    return null}
}
