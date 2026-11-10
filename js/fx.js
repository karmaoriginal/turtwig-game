// Efectos visuales (FX), nombres de ataques y proyectiles.
"use strict";
// ---------------- efectos (partículas, anillos, destellos, estelas...) — todo en el canvas pixelado, sin texto sobre los luchadores
const TYPE_COL={normal:"#fff2c0",fire:"#ff9a40",water:"#5ab4ff",grass:"#7ae04a",psychic:"#ff80e0",ghost:"#b088f0",dark:"#a08ab8",fairy:"#ffc0e8",dragon:"#8a7aff",flying:"#c0d4ff",ground:"#d0a868",rock:"#c8b890",electric:"#ffe84a"};
const rnd=(a,b)=>a+Math.random()*(b-a);
function glow(x,y,r,rgb,a){ctx.save();ctx.globalCompositeOperation="lighter";const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore()}
const FX={
  under:[],over:[],
  clear(){this.under.length=0;this.over.length=0},
  add(L,o){L.push(o);if(L.length>500)L.shift()},
  part(L,x,y,vx,vy,life,col,sz=1,o){this.add(L,{k:"p",x,y,vx,vy,life,max:life,col,sz,g:0,drag:.93,...o})},
  sparks(x,y,col,n,spd,o={}){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=rnd(.35,1)*spd;this.part(this.over,x,y,Math.cos(a)*s+(o.bx||0),Math.sin(a)*s+(o.by||0),rnd(10,24)|0,col,Math.random()<.25?2:1,{g:.05})}},
  ring(L,x,y,r0,r1,life,col,o={}){this.add(L,{k:"ring",x,y,r0,r1,life,max:life,col,w:o.w||1,fl:o.fl})},
  burst(x,y,r,life,col,n=8){this.add(this.over,{k:"burst",x,y,r,life,max:life,col,n,a0:Math.random()*6.283})},
  flash(x,y,r,life,col){this.add(this.over,{k:"flash",x,y,r,life,max:life,col})},
  puff(x,y,vx,vy,r,life,col){this.add(this.under,{k:"puff",x,y,vx,vy,r,life,max:life,col})},
  dust(x,y,n=3,s=.5){for(let i=0;i<n;i++)this.puff(x+rnd(-3,3),y+rnd(-1,1),rnd(-s,s),rnd(-.25,-.05),rnd(1.5,3),rnd(14,24)|0,"235,230,205")},
  // golpe recibido: destello, rayos, onda y chispas (más grande cuanto más daño)
  hit(x,y,dmg,col,ux,uy){const k=Math.min(1,dmg/30);
    this.flash(x,y,5+8*k,6,"#fff");this.burst(x,y,7+12*k,7,"#fff",8);
    this.ring(this.over,x,y,2,9+14*k,11,col,{w:1.5});
    this.sparks(x,y,col,6+Math.round(14*k),2+2.2*k,{bx:ux*1.3,by:uy*1.3});this.sparks(x,y,"#ffffff",3+Math.round(5*k),1.7)},
  // ataque cuerpo a cuerpo: tajo en arco, o onda de choque en el suelo si golpea alrededor
  swing(e,a,cx,cy,ty){const col=TYPE_COL[ty]||"#fff",[ux,uy]=unit(e.dir);
    if(!a.reach){const f=e.foot();this.ring(this.under,f[0],f[1],4,a.radius,14,col,{w:2,fl:1});this.ring(this.under,f[0],f[1],2,a.radius*.7,10,"#fff",{w:1,fl:1});this.dust(f[0],f[1],5,1.1);G.shake(a.radius>30?3:1.5)}
    else this.add(this.over,{k:"slash",x:cx-ux*a.reach*.5,y:cy-uy*a.reach*.5-6,ang:Math.atan2(uy,ux),r:a.radius+6,life:8,max:8,col,flip:Math.random()<.5})},
  muzzle(x,y,col,ux,uy){this.flash(x,y,6,5,"#fff");this.burst(x,y,9,6,col,6);this.sparks(x,y,col,7,1.8,{bx:ux*1.6,by:uy*1.6})},
  shieldHit(e){const x=e.pos[0],y=e.pos[1]-12;this.ring(this.over,x,y,8,24,10,"#9aeeff",{w:2});this.sparks(x,y,"#bff4ff",8,2)},
  pop(x,y,col){this.ring(this.over,x,y,3,20,12,col,{w:2});this.burst(x,y,14,8,"#fff",10);this.sparks(x,y,col,16,2.4)},
  ko(x,y){this.flash(x,y,18,10,"#fff");this.burst(x,y,26,12,"#fff",12);this.ring(this.over,x,y,4,46,18,"#fff",{w:3});this.ring(this.over,x,y,2,30,14,"#ffd84a",{w:2});this.sparks(x,y,"#ffe9a0",30,3.4);this.sparks(x,y,"#fff",16,2.4)},
  water(e){const f=e.foot();for(let i=0;i<12;i++)this.part(this.over,f[0]+rnd(-5,5),f[1]-2,rnd(-1.3,1.3),rnd(-2.8,-1.2),rnd(20,32)|0,Math.random()<.3?"#d8f0ff":"#6cc0ff",1+(Math.random()<.3),{g:.14,drag:.98});
    this.ring(this.under,f[0],f[1],2,16,16,"#bfe6ff",{w:1.5,fl:1})},
  aura(e,rgb){const x=e.pos[0],y=e.pos[1]-10;this.flash(x,y,20,10,"rgba("+rgb+",.55)");this.ring(this.over,x,y,4,28,14,"rgb("+rgb+")",{w:2});for(let i=0;i<14;i++)this.part(this.over,x+rnd(-12,12),y+rnd(0,14),rnd(-.2,.2),rnd(-1.2,-.4),rnd(18,30)|0,"rgb("+rgb+")",1+(Math.random()<.3),{drag:.97})},
  boom(e,r){const x=e.pos[0],y=e.pos[1]-8;this.flash(x,y,r*.9,12,"#fff");this.burst(x,y,r,10,"#ffe9a0",14);this.ring(this.over,x,y,4,r*1.2,18,"#ff9a40",{w:3});this.ring(this.over,x,y,2,r*.8,14,"#fff",{w:2});this.ring(this.under,x,y+8,4,r*1.3,20,"#ffd070",{w:2,fl:1});
    this.sparks(x,y,"#ffb040",40,4);this.sparks(x,y,"#fff",16,3);G.shake(8);G.stop(7);G.flash("#fff",.5)},
  flame(e){this.part(this.over,e.pos[0]+rnd(-6,6),e.pos[1]-rnd(0,18),rnd(-.1,.1),rnd(-.55,-.2),rnd(14,22)|0,["#ff5a1e","#ff9a30","#ffd04a"][Math.random()*3|0],1+(Math.random()<.4),{g:-.01,drag:.96})},
  zap(e){const x=e.pos[0]+rnd(-9,9),y=e.pos[1]-rnd(2,22);this.part(this.over,x,y,rnd(-1.6,1.6),rnd(-1.6,1.6),rnd(4,8)|0,Math.random()<.5?"#fff06a":"#fff",1,{drag:.55})},
  wisp(e){this.part(this.over,e.pos[0]+rnd(-9,9),e.pos[1]-rnd(0,10),rnd(-.15,.15),rnd(-.6,-.25),rnd(18,28)|0,Math.random()<.5?"#b07aff":"#7a4ad8",1+(Math.random()<.35),{drag:.97})},
  evolveTick(e){const T=e.evoT,cx=e.pos[0],cy=e.pos[1]-10;
    if(T<50&&T%2===0){const a=Math.random()*6.283,r=rnd(26,46);this.part(this.over,cx+Math.cos(a)*r,cy+Math.sin(a)*r,-Math.cos(a)*r/14,-Math.sin(a)*r/14,14,"#fff8c0",1+(Math.random()<.3),{drag:1})}
    if(T===50){G.flash("#fff",1);G.shake(5);this.ring(this.over,cx,cy,4,58,22,"#fff",{w:3});this.ring(this.over,cx,cy,4,38,16,"#ffe9a0",{w:2});this.ring(this.under,cx,cy+10,4,48,24,"#ffe9a0",{w:2,fl:1});this.sparks(cx,cy,"#fff8c0",38,3.4);this.sparks(cx,cy,"#ffd84a",22,2.2)}
    if(T>50&&T<78&&T%3===0)this.part(this.over,cx+rnd(-14,14),cy+rnd(-6,14),rnd(-.2,.2),rnd(-1,-.4),22,"#fff3b0",1+(Math.random()<.3),{drag:.97})},
  morphTick(e){const T=e.evoT,cx=e.pos[0],cy=e.pos[1]-10;
    if(T<20){const a=T*.7+Math.random()*.4,r=30-T*1.2;this.part(this.over,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,-Math.cos(a)*1.1,-Math.sin(a)*.8,12,Math.random()<.5?"#e6c8ff":"#b878e0",1+(Math.random()<.3),{drag:.97})}
    if(T===20){G.flash("rgb(226,200,255)",.55);this.ring(this.over,cx,cy,3,34,16,"#e6c8ff",{w:2});this.burst(cx,cy,20,9,"#fff",10);this.sparks(cx,cy,"#d8a8ff",22,2.6)}},
  update(){for(const L of [this.under,this.over])for(let i=L.length-1;i>=0;i--){const o=L[i];if(--o.life<=0){L.splice(i,1);continue}
    if(o.k==="p"){o.x+=o.vx;o.y+=o.vy;o.vy+=o.g;o.vx*=o.drag;o.vy*=o.drag}
    else if(o.k==="puff"){o.x+=o.vx;o.y+=o.vy}}},
  draw(L){for(const o of L){const t=1-o.life/o.max;
    if(o.k==="p"){const s=Math.max(1,Math.round(o.sz*(1-t*.5)));ctx.globalAlpha=Math.min(1,o.life/o.max*1.7);ctx.fillStyle=o.col;ctx.fillRect(Math.round(o.x-s/2),Math.round(o.y-s/2),s,s)}
    else if(o.k==="puff"){ctx.globalAlpha=(1-t)*.5;ctx.fillStyle="rgb("+o.col+")";ctx.beginPath();ctx.arc(o.x,o.y,o.r*(.6+.9*t),0,7);ctx.fill()}
    else if(o.k==="ring"){const r=o.r0+(o.r1-o.r0)*(1-(1-t)*(1-t));ctx.globalAlpha=(1-t)*.9;ctx.strokeStyle=o.col;ctx.lineWidth=Math.max(.6,o.w*(1-t*.7));ctx.beginPath();ctx.ellipse(o.x,o.y,r,o.fl?r*.42:r,0,0,7);ctx.stroke()}
    else if(o.k==="burst"){ctx.globalAlpha=1-t;ctx.strokeStyle=o.col;ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<o.n;i++){const a=o.a0+i*6.283/o.n,r0=o.r*(.25+.5*t),r1=o.r*(.55+.45*t);ctx.moveTo(o.x+Math.cos(a)*r0,o.y+Math.sin(a)*r0);ctx.lineTo(o.x+Math.cos(a)*r1,o.y+Math.sin(a)*r1)}ctx.stroke()}
    else if(o.k==="flash"){ctx.globalAlpha=(1-t)*.9;ctx.fillStyle=o.col;ctx.beginPath();ctx.arc(o.x,o.y,o.r*(.6+.5*t),0,7);ctx.fill()}
    else if(o.k==="slash"){const e=1-(1-t)*(1-t),s=o.flip?-1:1,head=o.ang+s*(-1.15+2.3*e);
      for(let i=0;i<3;i++){const span=[1.0,.6,.3][i],tail=head-s*span;ctx.globalAlpha=(1-t)*(.35+.25*i);ctx.strokeStyle=i===2?"#fff":o.col;ctx.lineWidth=1+i*.9;ctx.beginPath();ctx.arc(o.x,o.y,o.r-i*.6,s>0?tail:head,s>0?head:tail);ctx.stroke()}}}
    ctx.globalAlpha=1}
};
const KL={atk1:"Z",atk2:"X",atk3:"C",atk4:"V",atk5:"B",atk6:"N"},ATKK=["atk1","atk2","atk3","atk4","atk5","atk6"];
const DEF_NAMES={atk1:"Attack",atk2:"Swing",atk3:"Shoot",atk4:"Charge",atk5:"Hop",atk6:"Rotate"};
const MOVE_NAMES={};
class Projectile{
  constructor(pos,d,dmg,speed,life,foe,color,owner){this.owner=owner;const [ux,uy]=unit(d);this.pos=[...pos];this.v=[ux*speed,uy*speed];this.dmg=dmg;this.life=life;this.dir=d;this.dead=false;this.r=5;this.foe=foe;this.color=color;this.tr=[];this.big=Math.min(1.7,.85+dmg/45)}
  update(){this.tr.push([this.pos[0],this.pos[1]]);if(this.tr.length>9)this.tr.shift();this.pos[0]+=this.v[0];this.pos[1]+=this.v[1];if(Math.random()<.6)FX.part(FX.over,this.pos[0]+rnd(-2,2),this.pos[1]+rnd(-2,2),rnd(-.3,.3),rnd(-.3,.3),rnd(8,14)|0,this.color,1,{drag:.9});
    if(--this.life<=0||this.pos[0]<-20||this.pos[0]>W+20||this.pos[1]<-20||this.pos[1]>H+20)this.dead=true,FX.sparks(this.pos[0],this.pos[1],this.color,5,1.2);
    const t=this.foe;if(t.alive()&&Math.hypot(t.pos[0]-this.pos[0],t.pos[1]-this.pos[1])<this.r+t.radius){if(this.dmg>0)t.takeHit(this.dmg,this.dir,2.5,this.owner,false,this.ty,this.cat);if(this.mv){this.owner.status(t,this.mv);if(this.mv.drain&&t.lastReal>0)this.owner.healBy(Math.max(1,Math.round(t.lastReal*this.mv.drain)))}if(!(this.dmg>0)){FX.ring(FX.over,this.pos[0],this.pos[1],2,14,10,this.color,{w:1.5});FX.sparks(this.pos[0],this.pos[1],this.color,8,1.6)}this.dead=true}}
  draw(){const [x,y]=this.pos,b=this.big,n=this.tr.length;
    ctx.save();ctx.globalCompositeOperation="lighter";
    for(let i=0;i<n;i++){const f=(i+1)/n,[tx,ty]=this.tr[i];ctx.globalAlpha=f*.45;ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(tx,ty,(1+3*b)*f,0,7);ctx.fill()}
    ctx.globalAlpha=.3+.1*Math.sin(performance.now()/60);ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(x,y,7*b,0,7);ctx.fill();ctx.restore();
    ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(x,y,3.2*b,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,1.8*b,0,7);ctx.fill()}
}
