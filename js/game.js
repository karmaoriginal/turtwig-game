// Objeto G: bucle principal, combate 1v1, seleccion de luchador y pantallas VS.
"use strict";
// ---------------- juego
const G={
  init(){this.shk=0;this.hs=0;this.slow=0;this.flashA=0;this.toasts={p:null,e:null};this.help=false;this.ft=0;this.endT=0;this.buf=new Set();this.projectiles=[];this.floats=this.mkFloats();this.hitboxes=[];this.hitboxVis=[];this.debug=false;this.player=null;this.enemy=null;this.t=0;
    this.mode="fight";this.ballSkin=5;this.menu={cur:0};this.toMenu();
    this.viewer=false;this.vAnim=0;this.vDir=0;this.vPause=false;this.vPoints=true;this.va=new Animator(Bank);this.va.play(Bank.names[0])},
  toSelect(){this.scene="select";this.sel={phase:0,cur:0,p1:null,p2:null}},
  startFight(k1,k2){this.player=new Player(this,W/3,H/2+10,k1);this.enemy=new Enemy(this,W*2/3,H/2+10,k2);
    this.player.foe=this.enemy;this.enemy.foe=this.player;this.enemy.dir=6;this.player.imposter();this.enemy.imposter();
    FX.clear();this.shk=0;this.hs=0;this.slow=0;this.flashA=0;this.toasts={p:null,e:null};this.ft=0;this.endT=0;this.buf.clear();
    this.projectiles=[];this.floats=this.mkFloats();this.hitboxes=[];this.hitboxVis=[];this.scene="fight"},
  restart(){this.player.reset();this.enemy.reset();this.enemy.cool=60;this.projectiles=[];this.floats=this.mkFloats();FX.clear();this.toasts={p:null,e:null};this.ft=0;this.endT=0;this.slow=0;this.hs=0;this.buf.clear()},
  // ---- avisos sin tapar la pelea: cada luchador tiene su "toast" junto a su barra de vida; los números de daño son lo único que flota
  mkFloats(){const a=[],g=this;a.push=function(f){
      if(/^\+?\d+$/.test(f.text)){f.heal=f.text[0]==='+';f.dmg=Math.abs(+f.text);f.max=f.life;f.vx=(Math.random()-.5)*.5;Array.prototype.push.call(a,f);return}
      const P=g.player,E=g.enemy;if(!P||!E)return;
      const dp=Math.hypot(f.pos[0]-P.pos[0],f.pos[1]-P.pos[1]),de=Math.hypot(f.pos[0]-E.pos[0],f.pos[1]-E.pos[1]);
      g.say(dp<=de?"p":"e",f.text)};return a},
  say(side,text){const c=/Quemado|Paralizado|Confuso|hirió|Intimidación|falló|Falló|No afecta|Poco eficaz|nada|Atrapado|baja|Se confundió|Recargando|No conoce/.test(text)?"#ff7a6a":/Muy eficaz|Postrero|BOOM|Mismo Destino|crítico|Estática/.test(text)?"#ffb04a":/EVOLUCIONA|TRANSFORM|Disfraz|Barrera|Pantalla|Reflejo|sube|Impostor|Drenadoras/.test(text)?"#7ad8ff":"#d8dcec",o=this.toasts[side];
    if(o&&o.text===text){o.t=Math.min(o.t,8);return}this.toasts[side]={text,t:0,life:100,col:c}},
  shake(m){this.shk=Math.max(this.shk||0,m)},
  stop(n){this.hs=Math.max(this.hs||0,n)},
  flash(col,a){this.flashC=col;this.flashA=a},
  fxStep(){for(const e of [this.player,this.enemy]){
      if(e.flashT>0)e.flashT--;if(e.shieldHit>0)e.shieldHit--;
      if(e.ghosts){for(const g of e.ghosts)g.life--;e.ghosts=e.ghosts.filter(g=>g.life>0)}
      if(e.state==="free"&&e.anim.name==="Walk"){e.fxT=(e.fxT||0)+1;if(e.fxT%9===0){const f=e.foot();FX.dust(f[0],f[1],2,.4)}}
      if(Math.hypot(e.kb[0],e.kb[1])>1.4&&Math.random()<.5){const f=e.foot();FX.dust(f[0],f[1],1,.6)}
      if(e.burnT>0&&Math.random()<.55)FX.flame(e);
      if(e.parT>0&&Math.random()<.45)FX.zap(e);
      if((e.sp.key==="voltorb"||e.sp.key==="electrode")&&e.state==="free"&&Math.random()<.05)FX.zap(e);   // chispitas de Estática
      if(e.bondT>0&&Math.random()<.35)FX.wisp(e);
      if(e.seedT>0&&Math.random()<.3)FX.sparks(e.pos[0]+rnd(-5,5),e.pos[1]-4,"#5ac846",1,.5);
      if(e.wrapT>0&&Math.random()<.3)FX.sparks(e.pos[0]+rnd(-6,6),e.pos[1]-2,"#ffb0c8",1,.5);
      if(e.shredT>0&&Math.random()<.15)FX.sparks(e.pos[0]+rnd(-5,5),e.pos[1]-12,"#ff6a6a",1,.4)}},
  vignette(){if(!this.vigC){const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d"),g=x.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.62);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,.38)");x.fillStyle=g;x.fillRect(0,0,W,H);this.vigC=c}ctx.drawImage(this.vigC,0,0)},
  moveItems(P){const kit=P.moves(),it=ATKK.filter(a=>kit[a]).map(a=>[KL[a],kit[a].name||DEF_NAMES[a],Math.ceil((P.cds[a]||0)/60)]);if(P.kind==="ditto")it.push(["G","Transform",Math.ceil(P.morphCool/60)]);return it},
  statusLine(e){const s=[];if(e.burnT>0)s.push("Quemado");if(e.parT>0)s.push("Parálisis");if(e.confT>0)s.push("Confuso");if(e.seedT>0)s.push("Semilla");if(e.wrapT>0)s.push("Atrapado");if(e.blindT>0)s.push("Ceguera");
    if(e.shredT>0)s.push("Def-");if(e.guardT>0)s.push("Def+");if(e.bT>0)s.push(e.bAtk>1?"Atq+":"Atq-");if(e.lightT>0)s.push("P.Luz");if(e.reflT>0)s.push("Reflejo");return s.join(" ")},
    chips(items,cx,y,alpha){octx.font=`bold ${Math.round(3.2*S)}px ui-monospace,Consolas,Menlo,monospace`;
    const gap=7,ws=items.map(([k,n,c])=>8+octx.measureText(n+(c>0?" "+c:"")).width/S),tot=ws.reduce((a,b)=>a+b,0)+gap*(items.length-1);let x=cx-tot/2;
    items.forEach(([k,n,c],i)=>{ctx.globalAlpha=alpha*.85;ctx.fillStyle="#0a0e1a";ctx.fillRect(Math.round(x),y-1,6,7);ctx.fillStyle="rgba(255,255,255,.22)";ctx.fillRect(Math.round(x),y-1,6,1);ctx.globalAlpha=1;
      this.ta=alpha;this.text(k,x+3,y,"#fff","center",3.2);this.text(n+(c>0?" "+c:""),x+8,y,c>0?"#6f7794":"#cfd6ee","left",3.2);this.ta=1;x+=ws[i]+gap})},
  panelBox(lines,cx,yBottom,alpha,sz=3.4){octx.font=`bold ${Math.round(sz*S)}px ui-monospace,Consolas,Menlo,monospace`;
    const w=Math.max(...lines.map(l=>octx.measureText(l).width/S))+10,h=lines.length*(sz+2.4)+5,x=Math.round(cx-w/2),y=Math.round(yBottom-h);
    ctx.globalAlpha=alpha*.78;ctx.fillStyle="#0a0e1a";ctx.fillRect(x,y,Math.round(w),Math.round(h));ctx.globalAlpha=alpha*.5;ctx.fillStyle="#8a95bb";ctx.fillRect(x,y,Math.round(w),1);ctx.globalAlpha=1;
    this.ta=alpha;lines.forEach((l,i)=>this.text(l,cx,y+3+i*(sz+2.4),"#e6e9f6","center",sz));this.ta=1},
  drawHelp(P){const t=this.ft,auto=t<300?Math.min(1,(300-t)/50):0,a=this.help?1:auto;
    this.chips(this.moveItems(P),W/2,H-8,.6);
    if(a>0){const lines=["R reiniciar  ·  Esc selección  ·  Tab visor  ·  I ayuda"];
      if(KINDS[P.kind].hint)lines.push(...KINDS[P.kind].hint.split("\n"));
      else{lines.push(`Evolución: acumula daño (${EVO[0].dealt} → Grotle, ${EVO[1].dealt} → Torterra) y quédate con ${Math.round(EVO[0].hpFrac*100)}% de vida o menos`);lines.push("Espesura: con poca vida (<1/3) los golpes de Planta pegan +50%");lines.push("Grotle: Drenadoras, Megaagotar · Torterra: Mazazo, Terremoto, Síntesis")}
      this.panelBox(lines,W/2,H-14,a)}},
  drawToasts(){for(const [k,left] of [["p",true],["e",false]]){const o=this.toasts[k];if(!o)continue;
      const a=Math.min(1,o.t/6,(o.life-o.t)/20),y=57-(1-Math.min(1,o.t/6))*3;octx.font=`bold ${Math.round(3.6*S)}px ui-monospace,Consolas,Menlo,monospace`;
      const w=Math.round(octx.measureText(o.text).width/S+9),x=left?6:W-6-w;
      ctx.globalAlpha=a*.72;ctx.fillStyle="#0a0e1a";ctx.fillRect(x,Math.round(y)-1,w,9);ctx.fillStyle=o.col;ctx.fillRect(left?x:x+w-2,Math.round(y)-1,2,9);ctx.globalAlpha=1;
      this.ta=a;this.text(o.text,x+(left?5:3),y,"#fff","left",3.6);this.ta=1}},
  drawFloats(){for(const f of this.floats){const t=1-f.life/f.max,pop=t<.15?1+(.15-t)*5:1,sz=Math.min(8,3.8+f.dmg/9);
      this.ta=f.life<10?f.life/10:1;this.text(f.text,Math.round(f.pos[0]),Math.round(f.pos[1]),f.heal?"#6aff8a":f.dmg>=30?"#ff6a3a":f.dmg>=15?"#ffc84a":"#fff6d8","center",sz*pop);this.ta=1}},
  drawEnd(){const P=this.player,E=this.enemy,t=this.endT;if(t<=0)return;const lost=!P.alive(),a=t<8?t/8:t>60?Math.max(0,1-(t-60)/25):1;
    if(a>0){this.ta=a;this.text("K.O.",W/2,H/2-52,lost?"#ff6a6a":"#ffe070","center",Math.round(15*(t<10?1+(10-t)*.08:1)));this.ta=1}
    const msg=lost?"Derrota   ·   R reintentar   ·   Esc selección":"¡Victoria!   ·   el rival revive solo   ·   Esc selección";
    octx.font=`bold ${Math.round(3.6*S)}px ui-monospace,Consolas,Menlo,monospace`;const w=Math.round(octx.measureText(msg).width/S+10),x=Math.round(W/2-w/2);
    ctx.globalAlpha=.7;ctx.fillStyle="#0a0e1a";ctx.fillRect(x,4,w,10);ctx.fillStyle=lost?"#ff6a6a":"#7aff90";ctx.fillRect(x,4,w,1);ctx.globalAlpha=1;this.text(msg,W/2,6,"#fff","center",3.6)},

  viewerSet(i){const n=Bank.names.length;this.vAnim=((i%n)+n)%n;this.va.play(Bank.names[this.vAnim],true,true)},
  updateViewer(p){
    if(p.has("up"))this.viewerSet(this.vAnim-1);if(p.has("down"))this.viewerSet(this.vAnim+1);
    if(p.has("left"))this.vDir=(this.vDir+7)%8;if(p.has("right"))this.vDir=(this.vDir+1)%8;
    if(p.has("species")){const L=[...STAGES,"ditto","mimikyu","magikarp","gyarados","mrmime","lickitung","drifloon","voltorb","electrode","charmander","charmeleon","charizard"];Bank=SPECIES[L[(L.indexOf(Bank.key)+1)%L.length]];this.va=new Animator(Bank);this.vAnim=0;this.vDir=0;this.va.play(Bank.names[0])}
    if(p.has("pause"))this.vPause=!this.vPause;if(p.has("points"))this.vPoints=!this.vPoints;
    const a=this.va,c=Bank.info(a.name).durations.length;
    if(p.has("prev")){a.frame=(a.frame+c-1)%c;a.t=0}if(p.has("next")){a.frame=(a.frame+1)%c;a.t=0}
    if(!this.vPause)a.update()},
  // ---- selección de peleador
  updateSelect(p){const s=this.sel,n=ROSTER.length;this.t++;this.syncPrev();if(this.prev){const a=this.prev.a;a.update();if(a.done&&a.name!=="Idle")a.play("Idle",true,true)}
    if(p.has("up")||p.has("left"))s.cur=(s.cur+n-1)%n;
    if(p.has("down")||p.has("right"))s.cur=(s.cur+1)%n;
    if(p.has("ok")||p.has("atk1")){
      if(this.prev)this.prev.a.play("Pose",false,true);
      const k=ROSTER[s.cur]==="random"?PICKABLE[Math.floor(Math.random()*PICKABLE.length)]:ROSTER[s.cur];
      if(s.phase===0){s.p1=k;s.phase=1}
      else{s.p2=k;this.scene="vs";this.vsT=170}}
    else if((p.has("back")||p.has("atk2"))&&s.phase===1){s.phase=0;s.p1=null}
    else if(p.has("back")&&s.phase===0)this.toMenu()},
  updateVS(p){this.t++;this.vsT--;
    if(p.has("back")){this.toSelect();return}
    if(this.vsT<=0||(this.vsT<140&&(p.has("ok")||p.has("atk1"))))this.startFight(this.sel.p1,this.sel.p2)},
  update(held,p){
    if(p.has("viewer"))this.viewer=!this.viewer;if(p.has("debug"))this.debug=!this.debug;
    if(this.viewer){this.updateViewer(p);return}
    if(this.scene==="menu"){this.updateMenu(p);return}
    if(this.scene==="story"){this.updateStory(held,p);return}
    if(this.scene==="teams"){this.updateTeams(p);return}
    if(this.scene==="volley"){this.updateVolley(held,p);return}
    if(this.scene==="select"){this.updateSelect(p);return}
    if(this.scene==="vs"){this.updateVS(p);return}
    if(p.has("back")){this.toSelect();return}
    if(p.has("reset"))this.restart();
    if(p.has("help"))this.help=!this.help;
    this.shk*=.84;if(this.flashA>0)this.flashA=Math.max(0,this.flashA-.05);
    for(const k of ["p","e"]){const o=this.toasts[k];if(o&&++o.t>o.life)this.toasts[k]=null}
    if(this.hs>0){this.hs--;for(const k of p)if(k.startsWith("atk")||k==="transform")this.buf.add(k);return}   // hit-stop: congela el golpe (guarda tus botones)
    if(this.buf.size){p=new Set([...p,...this.buf]);this.buf.clear()}
    if(this.slow>0){this.slow--;if(this.slow%2){FX.update();return}}   // cámara lenta tras un K.O.
    this.ft++;
    this.hitboxes=[];this.player.update(held,p);this.enemy.update();
    for(const h of this.hitboxes)this.hitboxVis.push(h);
    for(const pr of this.projectiles)pr.update();this.projectiles=this.projectiles.filter(x=>!x.dead);
    for(const f of this.floats){f.pos[1]-=Math.max(.15,.8*f.life/f.max);f.pos[0]+=f.vx||0;f.life--}for(let i=this.floats.length-1;i>=0;i--)if(this.floats[i].life<=0)this.floats.splice(i,1);
    for(const h of this.hitboxVis)h[3]--;this.hitboxVis=this.hitboxVis.filter(h=>h[3]>0);
    this.fxStep();FX.update();
    this.endT=(!this.player.alive()||!this.enemy.alive())?this.endT+1:0},
  // texto a resolución real (canvas superpuesto) para que no se vea pixelado
  text(s,x,y,c="#fff",align="left",sz=4){const o=octx;o.font=`bold ${Math.round(sz*S)}px ui-monospace,Consolas,Menlo,monospace`;o.textBaseline="top";o.textAlign=align;
    o.globalAlpha=this.ta===undefined?1:this.ta;o.lineWidth=Math.max(2,S*.75);o.lineJoin="round";o.strokeStyle="#000";o.strokeText(s,x*S,y*S);o.fillStyle=c;o.fillText(s,x*S,y*S);o.globalAlpha=1},
  bar(e,col){const bw=24,x=Math.round(e.pos[0]-bw/2),y=Math.round(e.pos[1]-32);
    ctx.fillStyle="#1e1e1e";ctx.fillRect(x-1,y-1,bw+2,5);ctx.fillStyle=col;ctx.fillRect(x,y,Math.round(bw*e.hp/e.maxhp),3)},
  hud(e,label,x,y,col,right){const w=70,bx=right?x:x+44,px=right?x+w+4:x;   // x = borde del bloque (114 de ancho)
    ctx.fillStyle="#1e1e1e";ctx.fillRect(bx-1,y-1,w+2,7);ctx.fillStyle="#555";ctx.fillRect(bx,y,w,5);
    const f=Math.round(w*e.hp/e.maxhp);e.lag=e.lag===undefined||e.lag<e.hp?e.hp:Math.max(e.hp,e.lag-.35);const lf=Math.round(w*e.lag/e.maxhp);
    ctx.fillStyle="#f2e6a8";ctx.fillRect(right?bx+w-lf:bx,y,lf,5);ctx.fillStyle=col;ctx.fillRect(right?bx+w-f:bx,y,f,5);ctx.fillStyle="rgba(255,255,255,.28)";ctx.fillRect(right?bx+w-f:bx,y,f,1);
    const ex=e.state==="faint"?"dizzy":e.state==="hurt"?"pain":(e.foe&&!e.foe.alive()?"happy":"normal");
    ctx.fillStyle=col;ctx.fillRect(px-2,y-8,44,44);ctx.fillStyle="#10131c";ctx.fillRect(px-1,y-7,42,42);this.face(PIC[e.stage>0&&PIC[LINE[e.kind][e.stage]]?LINE[e.kind][e.stage]:e.kind][ex],px,y-6,40,40);
    const tx=right?bx+w:bx,al=right?"right":"left",gold=e.stage>0||e.morphed;
    this.text(label+" "+e.hp+(e.stage>0?"  "+LINE[e.kind][e.stage].toUpperCase():""),tx,y+7,gold?"#ffe070":"#fff",al);
    let l2=null,c2="#c8d0e8";
    if(e.kind==="turtwig"){if(EVO[e.stage])l2="EVO "+Math.min(e.dealt,EVO[e.stage].dealt)+"/"+EVO[e.stage].dealt}
    else if(e.kind==="magikarp"){const n=EVO_MK[e.stage];l2=n?"EXP "+Math.min(e.dealt+e.taken,n.xp)+"/"+n.xp:"Intimidación"}
    else if(e.kind==="mrmime"){l2=e.shield>0?"Barrera "+Math.ceil(e.shield):"Técnico·Filtro";c2="#ffb0f0"}
    else if(e.kind==="lickitung"){l2="Ritmo Propio";c2="#ffd0e0"}
    else if(e.kind==="mimikyu"){l2=e.busted?"Disfraz roto":"Disfraz activo";c2=e.busted?"#8a8fa8":"#ffe9a0"}
    else if(e.kind==="charmander"){const n=EVO_CH[e.stage];l2=n?"EXP "+Math.min(e.dealt+e.taken,n.xp)+"/"+n.xp:"Mar Llamas";c2="#ffb070"}
    else if(e.kind==="voltorb"){const n=EVO_VT[e.stage];l2=n?"EXP "+Math.min(e.dealt+e.taken,n.xp)+"/"+n.xp:"Estática·Insonorizar";c2="#ffe84a"}
    else if(e.kind==="electrode"){l2="Estática·Insonorizar";c2="#ffe84a"}
    else if(e.kind==="drifloon"){l2=e.burnT>0?"Quemado: Flare Boost":e.bondT>0?"Mismo Destino "+Math.ceil(e.bondT/60)+"s":"Postrero";c2=e.burnT>0?"#ffb070":"#c8a8ff"}
    else{if(e.morphed){l2="= "+e.sp.key.toUpperCase()+" "+Math.ceil(e.morphT/60)+"s";c2="#e0a8ff"}
      else if(e.morphCool>0)l2="Transform "+Math.ceil(e.morphCool/60)+"s";
      else{l2="Transform listo";c2="#e0a8ff"}}
    if(l2)this.text(l2,tx,y+13,c2,al);const st=this.statusLine(e);if(st)this.text(st,tx,y+19,"#ffcf70",al,3.4)},
  // ---- fondo / marcos / retratos
  bg(c1,c2){ctx.fillStyle=c1;ctx.fillRect(0,0,W,H);ctx.fillStyle=c2;const o=(this.t*.4)%36;
    for(let i=-H-36;i<W;i+=36){ctx.beginPath();ctx.moveTo(i+o,H);ctx.lineTo(i+o+14,H);ctx.lineTo(i+o+14+H,0);ctx.lineTo(i+o+H,0);ctx.fill()}},
  frame(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(x-3,y-3,w+6,h+6);ctx.fillStyle="#10131c";ctx.fillRect(x-1,y-1,w+2,h+2)},
  face(im,x,y,w,h){if(!im||!im.width)return;const k=w/im.width;
    if(Number.isInteger(k)&&w===h){ctx.drawImage(im,x,y,w,h);return}
    const T=im._th||(im._th={}),key=w+"x"+h;let c=T[key];
    if(!c){c=document.createElement("canvas");c.width=w;c.height=h;const t=c.getContext("2d");t.imageSmoothingEnabled=true;t.imageSmoothingQuality="high";
      let a=im;while((a.naturalWidth||a.width)/2>=w){const b=document.createElement("canvas");b.width=(a.naturalWidth||a.width)>>1;b.height=(a.naturalHeight||a.height)>>1;const u=b.getContext("2d");u.imageSmoothingEnabled=true;u.drawImage(a,0,0,b.width,b.height);a=b}
      t.drawImage(a,0,0,w,h);T[key]=c}
    ctx.drawImage(c,x,y)},
  pic(k,expr,x,y,sz,flip){const im=PIC[k]&&PIC[k][expr];if(!im)return;
    if(flip){ctx.save();ctx.translate(x+sz,y);ctx.scale(-1,1);this.face(im,0,0,sz,sz);ctx.restore()}else this.face(im,x,y,sz,sz)},
  // ---- selección y VS (estilo: retratos grandes arriba, fila de caras abajo)
  syncPrev(){const k=ROSTER[this.sel.cur];if(k==="random"){this.prev=null;return}
    if(!this.prev||this.prev.k!==k){const a=new Animator(SPECIES[k]);a.play("Idle");const im=SPECIES[k].image("Idle",0,0),c=document.createElement("canvas");c.width=im.width;c.height=im.height;const x=c.getContext("2d");x.drawImage(im,0,0);
      const d=x.getImageData(0,0,c.width,c.height).data;let y0=c.height,y1=0;for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++)if(d[(j*c.width+i)*4+3]>40){if(j<y0)y0=j;if(j>y1)y1=j}
      this.prev={k,a,sc:Math.max(2,Math.min(4,Math.round(56/Math.max(8,y1-y0+1))))}}},
  bigPic(x,y,k,col,who,expr,flip){const Z=80;this.frame(x,y,Z,Z,col);
    if(k&&k!=="random")this.pic(k,expr,x,y,Z,flip);
    else{ctx.fillStyle="#232a3f";ctx.fillRect(x,y,Z,Z);this.text("?",x+Z/2,y+18,"#6a7599","center",34)}
    this.text(who,x+3,y+3,col,"left",4.5);
    this.text(k==="random"?"ALEATORIO":k?KINDS[k].name:"- - -",x+Z/2,y+Z+5,k?"#fff":"#6a7599","center",5.5)},
  drawSelect(){const s=this.sel,t=this.t;this.bg("#1a2036","#212a47");
    const hov=ROSTER[s.cur],blink=Math.floor(t/10)%2===0,col=s.phase===0?"#3c78ff":"#ff4a4a",cx=W/2;
    this.text(s.phase===0?"SELECCIONA TU PELEADOR":"SELECCIONA AL RIVAL",cx,3,"#ffe070","center",6);
    this.bigPic(14,18,s.phase===0?hov:s.p1,"#3c78ff","JUGADOR",s.phase===0?"normal":"determined",false);
    this.bigPic(W-14-80,18,s.phase===1?hov:null,"#ff4a4a","RIVAL","normal",true);
    // centro: el peleador resaltado, animado, con su nombre y descripción
    if(hov==="random"){this.text("?",cx,40,"#6a7599","center",30);this.text("ALEATORIO",cx,96,"#fff","center",7);this.text("Te toca uno al azar",cx,107,"#aab4d6","center")}
    else{const kd=KINDS[hov];this.syncPrev();const a=this.prev.a,sc=a.sp.info(a.name).h<=40?2:1;
      ctx.fillStyle="rgba(255,255,255,.07)";ctx.beginPath();ctx.ellipse(cx,88,34,7,0,0,7);ctx.fill();
      a.sp.drawBig(a.name,0,a.frame,[cx,88],null,this.prev.sc,false);
      this.text(kd.name,cx,96,"#fff","center",7);kd.info.forEach((l,i)=>this.text(l,cx,106+i*6,"#aab4d6","center",3.6))}
    // fila de caras abajo
    const n=ROSTER.length,z=40,gap=4,vis=6,st=Math.max(0,Math.min(n-vis,s.cur-2)),x0=Math.round((W-(vis*z+(vis-1)*gap))/2),y0=124;
    ROSTER.forEach((k,i)=>{if(i<st||i>=st+vis)return;const x=x0+(i-st)*(z+gap),cur=i===s.cur;
      ctx.fillStyle=cur?(blink?"#ffe070":col):"#39425f";ctx.fillRect(x-2,y0-2,z+4,z+4);ctx.fillStyle="#10131c";ctx.fillRect(x-1,y0-1,z+2,z+2);
      if(k==="random"){ctx.fillStyle="#232a3f";ctx.fillRect(x,y0,z,z);this.text("?",x+z/2,y0+6,"#8a95bb","center",18)}
      else{ctx.globalAlpha=cur?1:.72;this.face(PIC[k][cur?"happy":"normal"],x,y0,z,z);ctx.globalAlpha=1}
      this.text(k==="random"?"???":KINDS[k].name,x+z/2,y0+z+3,cur?"#fff":"#7a82a8","center",3.4);
      if(s.phase===1&&s.p1===k)this.text("1P",x+2,y0+2,"#7aa8ff","left",5);
    });
    if(st>0)this.text("◄",x0-8,y0+14,"#aab4d6","center",6);if(st+vis<n)this.text("►",x0+vis*(z+gap)-gap+9,y0+14,"#aab4d6","center",6);
    this.text("←/→ mover     Z / Enter elegir     X / Esc volver     TAB visor",cx,H-4,"#8a95bb","center",3.4)},
  drawVS(){const s=this.sel,tt=170-this.vsT;this.bg("#14182a","#1c2240");
    ctx.fillStyle="rgba(40,90,190,.55)";ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(W/2+24,0);ctx.lineTo(W/2-24,H);ctx.lineTo(0,H);ctx.fill();
    ctx.fillStyle="rgba(190,50,60,.55)";ctx.beginPath();ctx.moveTo(W/2+24,0);ctx.lineTo(W,0);ctx.lineTo(W,H);ctx.lineTo(W/2-24,H);ctx.fill();
    const sl=Math.max(0,40-tt*2)*3,x1=24-sl,x2=W-24-80+sl,y=42;
    this.frame(x1,y,80,80,"#3c78ff");this.pic(s.p1,"determined",x1,y,80,false);
    this.frame(x2,y,80,80,"#ff4a4a");this.pic(s.p2,"determined",x2,y,80,true);
    this.text("JUGADOR",x1+40,y-18,"#7aa8ff","center",6);this.text("RIVAL",x2+40,y-18,"#ff8a7a","center",6);
    this.text(KINDS[s.p1].name,x1+40,y+88,"#fff","center",7);this.text(KINDS[s.p2].name,x2+40,y+88,"#fff","center",7);
    if(sl===0)this.text("VS",W/2,H/2-20,Math.floor(this.t/6)%2?"#ffe070":"#ff9a3c","center",Math.round(24+1.5*Math.sin(this.t/6)));
    if(this.vsT<140&&Math.floor(this.t/20)%2===0)this.text("Z / Enter: ¡a pelear!",W/2,H-12,"#fff","center",4.5)},
  draw(){
    ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=false;octx.clearRect(0,0,ov.width,ov.height);
    if(this.viewer){this.drawViewer();return}
    if(this.scene==="menu"){this.drawMenu();return}
    if(this.scene==="story"){this.drawStory();return}
    if(this.scene==="teams"){this.drawTeams();return}
    if(this.scene==="volley"){this.drawVolley();return}
    if(this.scene==="select"){this.drawSelect();return}
    if(this.scene==="vs"){this.drawVS();return}
    const P=this.player,E=this.enemy,sx=this.shk>.3?Math.round((Math.random()*2-1)*this.shk):0,sy=this.shk>.3?Math.round((Math.random()*2-1)*this.shk):0;
    ctx.save();ctx.translate(sx,sy);
    ctx.fillStyle="#4a804e";ctx.fillRect(-8,-8,W+16,H+16);ctx.strokeStyle="#447848";ctx.lineWidth=1;ctx.beginPath();
    for(let x=0;x<W;x+=16){ctx.moveTo(x+.5,-8);ctx.lineTo(x+.5,H+8)}for(let y=0;y<H;y+=16){ctx.moveTo(-8,y+.5);ctx.lineTo(W+8,y+.5)}ctx.stroke();
    FX.draw(FX.under);
    for(const e of [P,E].sort((a,b)=>a.pos[1]-b.pos[1])){
      if(e.inv>0&&e.state!=="faint"&&e.state!=="evolve"&&e.state!=="morph"&&Math.floor(e.inv/3)%2===0){ctx.globalAlpha=.55;e.draw();ctx.globalAlpha=1}else e.draw()}
    for(const p of this.projectiles)p.draw();
    FX.draw(FX.over);
    if(this.debug){ctx.lineWidth=1;ctx.strokeStyle="#ff0";for(const e of [P,E]){ctx.beginPath();ctx.arc(e.pos[0],e.pos[1],e.radius,0,7);ctx.stroke()}
      ctx.strokeStyle="#ff3c3c";for(const [x,y,r] of this.hitboxVis){ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke()}}
    ctx.restore();
    this.vignette();
    if(this.flashA>0){ctx.globalAlpha=Math.min(1,this.flashA);ctx.fillStyle=this.flashC||"#fff";ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
    this.hud(P,"TÚ",6,18,"#4cc85a",false);this.hud(E,"RIVAL",W-6-114,18,"#dc3c3c",true);
    this.drawToasts();this.drawFloats();this.drawEnd();this.drawHelp(P);
    if(this.debug)this.text(`${P.anim.name} f${P.anim.frame}   rival: ${E.state}`,4,H-22,"#e6e678")},
  drawViewer(){
    ctx.fillStyle="#303446";ctx.fillRect(0,0,W,H);
    const a=this.va,name=Bank.names[this.vAnim],info=Bank.info(name),pos=[W/2,H/2+6];
    ctx.fillStyle="#464b64";ctx.fillRect(0,pos[1],W,1);ctx.fillRect(pos[0],0,1,H);
    Bank.draw(name,this.vDir,a.frame,pos);
    const m=Bank.meta(name,this.vDir,a.frame);
    if(this.vPoints){const [cx,cy]=m.center;for(const [k,c] of [["head","#0f0"],["lhand","#f33"],["rhand","#58f"],["center","#fff"]]){ctx.fillStyle=c;ctx.fillRect(pos[0]+m[k][0]-cx,pos[1]+m[k][1]-cy,1,1)}}
    this.text(`${Bank.key.toUpperCase()}  ${name}  (${this.vAnim+1}/${Bank.names.length})  dir: ${info.rows===8?DIR_NAMES[this.vDir]:"-"}`,4,3);
    this.text(`frame ${a.frame+1}/${info.durations.length}  dur ${info.durations[a.frame]}t  ${this.vPause?"PAUSA":""}`,4,13);
    this.text(`rush=${info.rush} hit=${info.hit} return=${info.return}  ${info.w}x${info.h}`,4,23);
    let x=4;const y=H-16-Math.min(info.h,60);
    for(let i=0;i<info.durations.length;i++){const im=Bank.image(name,this.vDir,i);if(x+im.width>W)break;
      if(i===a.frame){ctx.strokeStyle="#ffdc50";ctx.strokeRect(x-.5,y-.5,im.width+1,im.height+1)}ctx.drawImage(im,x,y);x+=im.width+3}
    this.text("Arr/Abj anim   Izq/Der dir   Espacio pausa   , . frame   O puntos   P especie   TAB volver",4,H-11,"#b4bedc")}
};
