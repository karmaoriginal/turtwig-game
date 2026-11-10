// Modo VOLEIBOL: constantes y jugadores (VP).
"use strict";
// ================= MODO VOLEIBOL (equipos de 1 a 6 jugadores, cancha grande con cámara) =================
// La pelota tiene x,y (suelo) y z (altura). Cada golpe calcula una trayectoria exacta hasta un punto de la cancha rival.
const BALL_SRC=["assets/balls/tenis.png", "assets/balls/basket.png", "assets/balls/futbol.png", "assets/balls/beisbol.png", "assets/balls/boliche.png", "assets/balls/azul.png"];
const BALL_NAMES=["Tenis","Basket","Fútbol","Béisbol","Boliche","Azul"];
const BALLS=BALL_SRC.map(s=>{const i=new Image();i.src=s;return i});
const VB={sc:1.5,target:7,netX:320,netH:10,g:.08,ww:640,wh:260,court:{x0:40,x1:600,y0:64,y1:224},ai:{speed:1,miss:.05,smart:.75}};   // <- ajusta el modo aquí (puntos, tamaño del mapa, red, gravedad, IA)
const VSTAT={magikarp:{p:.55},lickitung:{reach:8},drifloon:{reach:4},mrmime:{reach:2,jit:4},electrode:{p:1.1}};   // p = fuerza del remate, reach = alcance extra, jit = imprecisión
// posiciones por equipo (fracción desde el fondo hacia la red, fracción a lo ancho): primero los de la red, luego los de atrás
const FORM={1:[[.55,.5]],2:[[.72,.3],[.4,.7]],3:[[.76,.2],[.76,.8],[.4,.5]],4:[[.76,.2],[.76,.8],[.4,.25],[.4,.75]],
  5:[[.76,.17],[.76,.5],[.76,.83],[.4,.3],[.4,.7]],6:[[.78,.17],[.78,.5],[.78,.83],[.4,.17],[.4,.5],[.4,.83]]};
const vclamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const vhome=(side,n,i)=>{const c=VB.court,[fx,fy]=FORM[n][i];return [side==="L"?c.x0+fx*(VB.netX-c.x0):c.x1-fx*(c.x1-VB.netX),c.y0+fy*(c.y1-c.y0)]};
class VP extends Entity{
  constructor(side,kind,i,n){const h=vhome(side,n,i);super(G,h[0],h[1],null,kind);this.side=side;this.i=i;this.home=h;this.front=FORM[n][i][0]>=.7;this.dir=side==="L"?2:6;
    const k=KINDS[kind],v=VSTAT[kind]||{};this.spd=k.spd*(side==="R"?VB.ai.speed:1);this.reach=15+k.rad+(v.reach||0);this.pw=v.p??vclamp(Math.sqrt(k.dmg),.7,1.1);this.jit=v.jit??8;this.act=null;this.aiT=0;this.aim=null}
  start(k,ai){const A={pass:["Swing",14],set:["Attack",16],spike:["Hop",26],serve:["Swing",14],serveH:["Hop",26]}[k];this.act={k,t:0,done:false,len:A[1],ai};this.anim.play(A[0],false,true)}
  step(inp,ai){const V=G.vb,B=V.ball;if(this.flashT>0)this.flashT--;
    if(this.act){const a=this.act,jump=a.k==="spike"||a.k==="serveH";a.t++;this.anim.update();
      if(!a.done&&B.state!=="dead"&&a.t>=(jump?5:3)&&a.t<=(jump?22:14)&&G.vbTouch(this,a.k,a.ai?(this.aim||{ax:0,ay:0}):inp))a.done=true;
      if(a.t>=a.len){this.act=null;this.anim.play("Idle",true,true)}return}
    const srv=B.state==="serve";
    if((!srv||(B.server===this.side&&this.i===V.srv[this.side]))&&B.state!=="dead"&&(inp.z||inp.x||inp.c)){
      const k=inp.z?(srv?"serve":"pass"):inp.x?(srv?"serveH":"spike"):(srv?null:"set");
      if(k){this.start(k,ai);if(!ai)V.pb.z=V.pb.x=V.pb.c=0;return}}
    const {dx,dy}=inp;
    if(dx||dy){const n=Math.hypot(dx,dy),s=1.25*this.spd*(this.sprint?1.12:1);this.dir=vecToDir(dx,dy);this.pos[0]+=dx/n*s;this.pos[1]+=dy/n*s;this.anim.play("Walk")}else this.anim.play("Idle");
    const c=VB.court,[lo,hi]=this.side==="L"?[c.x0-20,VB.netX-10]:[VB.netX+10,c.x1+20];this.pos[0]=vclamp(this.pos[0],lo,hi);this.pos[1]=vclamp(this.pos[1],c.y0-12,c.y1+8);
    this.anim.update()}
  draw(){this.sp.drawBig(this.anim.name,this.dir,this.anim.frame,this.foot(),this.flashT>0?"!#ffffff":this.tint,VB.sc)}
}
