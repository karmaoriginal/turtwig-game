// Especies (KINDS), Entity, Fighter, Player y Enemy (IA).
"use strict";
// ---------------- entidades
const angOf=d=>Math.atan2(DIR_VEC[d][1],DIR_VEC[d][0]);
const angDiff=(a,d)=>{const x=a-angOf(d);return Math.abs(Math.atan2(Math.sin(x),Math.cos(x)))};
function dirFromAngle(a){let best=0,bd=9;for(let d=0;d<8;d++){const df=angDiff(a,d);if(df<bd){bd=df;best=d}}return best}
const KINDS={
  turtwig:{name:"TURTWIG",maxhp:100,spd:1,dmg:1,rad:7,proj:"#5ac846",eproj:"#e8643c",evolves:true,hint:null,info:["Planta. Espesura: con poca vida pega más.","Turtwig > Grotle > Torterra"]},
  magikarp:{name:"MAGIKARP",maxhp:50,spd:.8,dmg:.3,rad:5,proj:"#e8503a",eproj:"#e8503a",evolves:true,hint:"Magikarp (Agua): Z Placaje, X Azote (más fuerte con poca vida), B Salpicadura (nada)\nNerviosismo: si lo golpea Bicho/Fantasma/Siniestro, +velocidad. EXP 30 → Gyarados\nGyarados (Agua/Volador): Intimidación (rival -20% daño), Hidrobomba, Hiperrayo, Danza Dragón",info:["Agua. Débil... hasta que aguanta","y evoluciona a Gyarados"]},
  mrmime:{name:"MR. MIME",maxhp:75,spd:1.15,dmg:1,rad:7,proj:"#ff7ad9",eproj:"#c040a0",evolves:false,hint:"Mr. Mime (Psíquico/Hada): Z Placaje, X Confusión, C Psíquico, V Pantalla de Luz, B Reflejo, N Barrera\nLuz = mitad de daño especial, Reflejo = mitad de físico\nTécnico (golpes flojos +50%), Filtro (súper eficaz -25%), Insonorizar (inmune a sonido)",info:["Psíquico/Hada. Técnico, Filtro e","Insonorizar. Pantallas y Barrera"]},
  lickitung:{name:"LICKITUNG",maxhp:140,spd:.7,dmg:.9,rad:9,proj:"#a0e0ff",eproj:"#8080ff",evolves:false,hint:"Lickitung (Normal): Z Lengüetazo (paraliza), X Atizar, C Supersónico (confunde), V Pisotón\nB Constricción (atrapa), N Rodar (más fuerte si encadenas)\nRitmo Propio: inmune a la confusión",info:["Normal. Lento y resistente. Su Lick","paraliza; inmune a la confusión"]},
  ditto:{name:"DITTO",maxhp:110,spd:1.05,dmg:1,rad:7,proj:"#b878e0",eproj:"#d0508c",evolves:false,hint:"Ditto (Normal): Impostor = empieza ya transformado en el rival (8 s)\nG = Transform: copia especie, tipos, movimientos y pasivas. Z Forcejeo (se hiere)\nFlexibilidad: inmune a la parálisis",info:["Normal. Impostor: nace transformado.","G = Transform copia todo (8s)"]},
  drifloon:{name:"DRIFLOON",maxhp:95,spd:1.05,dmg:1,rad:7,proj:"#8a4ad8",eproj:"#c070ff",evolves:false,hint:"Drifloon (Fantasma/Volador): Z Impresionar, X Maleficio (x2 con estado), C Bola Sombra\nV Fuego Fatuo (quema), B Autodestrucción, N Mismo Destino\nPostrero: daña a quien lo derrote. Impulso Ardiente: +50% si está quemado",info:["Fantasma/Volador. Inmune a Normal y","Tierra; Postrero daña a su verdugo"]},
  charmander:{name:"CHARMANDER",maxhp:85,spd:1.1,dmg:1,rad:6,proj:"#ff8a3a",eproj:"#ff5a2a",evolves:true,hint:"Charmander (Fuego): Z Arañazo, X Ascuas (puede quemar), C Colmillo Ígneo, V Pantalla de Humo\nMar Llamas: con poca vida (<1/3) los golpes de Fuego pegan +50%. El Fuego no se quema\nNv.16 → Charmeleon (Aliento Dragón, Giro Ígneo) · Nv.36 → Charizard (Fuego/Volador)\nEXP 40 y 110 (daño hecho + recibido). Charizard: Lanzallamas, Envite Ígneo, Garra Dragón, Ataque Ala",info:["Fuego. Mar Llamas: con poca vida","pega más. Charmander > Charmeleon > Charizard"]},
  voltorb:{name:"VOLTORB",maxhp:70,spd:1.1,dmg:.9,rad:6,proj:"#ffe84a",eproj:"#ffd020",evolves:true,hint:"Voltorb (Eléctrico): Z Placaje, X Chispa (paraliza), C Bola Voltio, V Rodar, B Chirrido (baja defensa), N Autodestrucción\nEstática: al golpearlo cuerpo a cuerpo, 30% de paralizar. Insonorizar: inmune a sonido\nEXP 35 (daño hecho + recibido) → Electrode. Débil a Tierra",info:["Eléctrico. Rápido; su Estática paraliza","a quien lo golpea. Evoluciona."]},
  electrode:{name:"ELECTRODE",maxhp:110,spd:1.35,dmg:1.1,rad:7,proj:"#ffe84a",eproj:"#ffd020",evolves:false,hint:"Electrode (Eléctrico): Z Placaje, X Chispa (paraliza), C Rayo, V Pantalla de Luz, B Chirrido (baja defensa), N Explosión\nEstática: al golpearlo cuerpo a cuerpo, 30% de paralizar. Insonorizar: inmune a sonido\nExplosión: gran daño en área, pero se debilita. Débil a Tierra",info:["Eléctrico. El más veloz. Estática e","Insonorizar. Su Explosión es letal."]},
  mimikyu:{name:"MIMIKYU",maxhp:90,spd:1.1,dmg:1.15,rad:7,proj:"#8a5cc8",eproj:"#e8a040",evolves:false,hint:"Mimikyu (Fantasma/Hada): Z Sombra Vil, X Garra Umbría (crítico), C Bola Sombra\nV Mazazo, B Carantoña, N Danza Espada (+50% ataque)\nDisfraz: el 1er golpe no hace daño (romperlo cuesta 1/8 de vida)",info:["Fantasma/Hada. Su Disfraz absorbe","el 1er golpe. Rápido."]}};
const ROSTER=["turtwig","ditto","mimikyu","magikarp","mrmime","lickitung","drifloon","voltorb","charmander","random"],PICKABLE=["turtwig","ditto","mimikyu","magikarp","mrmime","lickitung","drifloon","voltorb","charmander"];
const MORPH={time:480,cool:200,tint:"~rgba(190,110,235,.42)"};   // Transform de Ditto: duración y recarga (en ticks, 60 = 1 s)
class Entity{
  constructor(g,x,y,tint,kind="turtwig"){this.g=g;this.kind=kind;this.pos=[x,y];this.dir=0;this.sp=SPECIES[kind];this.anim=new Animator(this.sp);this.anim.play("Idle");this.tint=tint||null;
    this.maxhp=this.hp=Math.round(KINDS[kind].maxhp*HPX);this.kb=[0,0];this.state="free";this.radius=KINDS[kind].rad}
  // caja real del sprite en pantalla (bbox de los píxeles visibles, suavizada) para centrar escudo, luz y auras en cualquier especie
  body(){const m=this.sp.meta(this.anim.name,this.dir,this.anim.frame),img=IMGS[this.sp.key+"/"+m.file];let bb=img._bb;
    if(!bb){const c=document.createElement("canvas");c.width=img.width;c.height=img.height;const x=c.getContext("2d");x.drawImage(img,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=-1,y1=-1;
      for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++)if(d[(j*c.width+i)*4+3]>40){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}
      bb=img._bb=x1<0?[0,0,c.width,c.height]:[x0,y0,x1-x0+1,y1-y0+1]}
    const tx=this.pos[0]-m.center[0]+bb[0]+bb[2]/2,ty=this.pos[1]-m.center[1]+bb[1]+bb[3]/2,k=this.bs;
    if(!k||k.sp!==this.sp.key)this.bs={sp:this.sp.key,w:bb[2],h:bb[3],ox:tx-this.pos[0],oy:ty-this.pos[1]};
    else{k.w+=(bb[2]-k.w)*.12;k.h+=(bb[3]-k.h)*.12;k.ox+=(tx-this.pos[0]-k.ox)*.12;k.oy+=(ty-this.pos[1]-k.oy)*.12}
    return {cx:this.pos[0]+this.bs.ox,cy:this.pos[1]+this.bs.oy,w:this.bs.w,h:this.bs.h}}
  foot(){const m=this.sp.meta(this.anim.name,this.dir,this.anim.frame),[cx,cy]=m.center,[sx,sy]=m.shadow;return [this.pos[0]+sx-cx,this.pos[1]+sy-cy]}
  addGhost(){(this.ghosts||(this.ghosts=[])).push({n:this.anim.name,d:this.dir,f:this.anim.frame,p:[this.pos[0],this.pos[1]],life:8});if(this.ghosts.length>6)this.ghosts.shift()}
  // detrás del sprite: estelas del dash, aura de evolución/transformación, brillo de Meditación
  drawBack(){const B=this.body(),cx=Math.round(B.cx),cy=Math.round(B.cy);
    if(this.ghosts)for(const g of this.ghosts){ctx.globalAlpha=g.life/8*.32;this.sp.draw(g.n,g.d,g.f,g.p,"!#bfe4ff",false)}ctx.globalAlpha=1;
    if(this.state==="evolve"){const T=this.evoT,k=Math.min(1,T/40)*(T>50?Math.max(0,1-(T-50)/30):1);
      glow(cx,cy,14+26*k,"255,245,190",.6*k);ctx.save();ctx.globalCompositeOperation="lighter";ctx.fillStyle=`rgba(255,245,200,${.16*k})`;const r0=T*.06;
      for(let i=0;i<8;i++){const a=r0+i*.785;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,46*k,a,a+.2);ctx.closePath();ctx.fill()}ctx.restore()}
    else if(this.state==="morph"){const T=this.evoT,k=Math.sin(Math.min(1,T/40)*Math.PI);glow(cx,cy,12+20*k,"200,150,255",.6*k)}
    if(this.bT>0&&this.bAtk>1)glow(cx,cy,16+2*Math.sin(performance.now()/200),"255,140,220",.16);
    if(this.guardT>0)glow(cx,cy,15,"150,210,110",.16+.04*Math.sin(performance.now()/180))}
  // delante del sprite: burbuja de Barrera, panel de Pantalla de Luz, estrellas de confusión
  drawFront(){const B=this.body(),cx=Math.round(B.cx),cy=Math.round(B.cy),pu=.5+.5*Math.sin(performance.now()/160);
    if(this.shield>0){const hit=this.shieldHit>0?this.shieldHit/8:0,rx=B.w/2+5+hit*2,ry=B.h/2+5+hit*2,R=Math.max(rx,ry),g=ctx.createRadialGradient(cx,cy,R*.35,cx,cy,R);
      g.addColorStop(0,"rgba(140,230,255,0)");g.addColorStop(1,`rgba(140,230,255,${.24+.28*hit+.08*pu})`);
      ctx.save();ctx.translate(cx,cy);ctx.scale(rx/R,ry/R);ctx.translate(-cx,-cy);ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();
      ctx.strokeStyle=`rgba(190,245,255,${.5+.3*pu+.3*hit})`;ctx.lineWidth=1/Math.min(rx/R,ry/R);ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,.55)";ctx.beginPath();ctx.arc(cx,cy,R-2.5,3.7,4.6);ctx.stroke();ctx.restore()}
    if(this.lightT>0){const hw=Math.round(B.w/2+6),hh=Math.round(B.h/2+5),off=(performance.now()/45)%12;ctx.save();ctx.beginPath();ctx.rect(cx-hw,cy-hh,hw*2,hh*2);ctx.clip();
      ctx.fillStyle="rgba(255,240,150,.13)";ctx.fillRect(cx-hw,cy-hh,hw*2,hh*2);
      ctx.fillStyle="rgba(255,255,255,.16)";for(let i=-hh*2;i<hw*2+hh*2;i+=12){ctx.beginPath();ctx.moveTo(cx-hw+i+off,cy+hh);ctx.lineTo(cx-hw+5+i+off,cy+hh);ctx.lineTo(cx-hw+5+i+off+hh*2,cy-hh);ctx.lineTo(cx-hw+i+off+hh*2,cy-hh);ctx.fill()}ctx.restore();
      ctx.strokeStyle="rgba(255,240,150,.55)";ctx.lineWidth=1;ctx.strokeRect(cx-hw+.5,cy-hh+.5,hw*2-1,hh*2-1)}
    if(this.confT>0){const m=this.sp.meta(this.anim.name,this.dir,this.anim.frame),hx=this.pos[0]+m.head[0]-m.center[0],hy=this.pos[1]+m.head[1]-m.center[1]-5,t=performance.now()/260;
      for(let i=0;i<3;i++){const a=t+i*2.094,x=Math.round(hx+Math.cos(a)*10),y=Math.round(hy+Math.sin(a)*3);ctx.globalAlpha=Math.sin(a)>-.4?1:.5;ctx.fillStyle=i%2?"#ffe070":"#ff9ae0";ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y-1,1,3)}ctx.globalAlpha=1}}
  hitFx(dmg,from,ty,attacker){const [ux,uy]=unit(from),x=this.pos[0]-ux*this.radius*.5,y=this.pos[1]-8-uy*this.radius*.3;
    FX.hit(x,y,dmg,TYPE_COL[ty]||"#ffe9a0",ux,uy);this.flashT=4;G.shake(Math.min(5,1+dmg/8));G.stop(Math.min(9,2+Math.floor(dmg/6)));const f=this.foot();FX.dust(f[0],f[1],3,.8)}
  alive(){return this.state!=="faint"}
  clamp(){this.pos[0]=Math.min(Math.max(this.pos[0],({gyarados:40,charizard:30}[this.sp.key]||14)),W-({gyarados:40,charizard:30}[this.sp.key]||14));this.pos[1]=Math.min(Math.max(this.pos[1],26),H-10)}
  applyKnock(){this.pos[0]+=this.kb[0];this.pos[1]+=this.kb[1];this.kb[0]*=.82;this.kb[1]*=.82;this.clamp()}
  draw(){let t=this.tint;if(this.confT>0)t=(t?t+"|":"")+"~rgba(255,120,220,.35)";if(this.parT>0)t=(t?t+"|":"")+"~rgba(255,230,60,.35)";if(this.burnT>0)t=(t?t+"|":"")+"~rgba(255,110,40,.32)";
    if(this.morphed)t=(t?t+"|":"")+MORPH.tint;
    if(this.state==="evolve"){const T=this.evoT,p=T<50?4:3;if(T>8&&Math.floor(T/p)%2===0)t="!#ffffff"}
    else if(this.state==="morph"){if(this.evoT>2&&Math.floor(this.evoT/3)%2===0)t="!#e6c8ff"}
    if(this.flashT>0)t="!#ffffff";
    this.drawBack();
    this.sp.draw(this.anim.name,this.dir,this.anim.frame,this.pos,t);
    this.drawFront()}
}
class Fighter extends Entity{
  constructor(g,x,y,tint,dmgMult=1,kind="turtwig"){super(g,x,y,tint,kind);this.atk=null;this.hitDone=false;this.inv=0;this.dmgMult=dmgMult*KINDS[kind].dmg;this.foe=null;this.home=[x,y];this.projColor=KINDS[kind].proj;this.baseDmg=dmgMult*KINDS[kind].dmg;this.busted=false;this.baseRadius=KINDS[kind].rad;this.dealt=0;this.taken=0;this.stage=0;this.spd=KINDS[kind].spd;this.evoT=0;
    this.form={d:1,s:1,r:0};this.morphed=false;this.morphT=0;this.morphCool=0;this.morphTo=null;this.cds={};this.bAtk=1;this.bSpd=1}
  applyForm(sp,f){this.cds={};this.sp=sp;this.anim.sp=sp;this.form=f;this.dmgMult=this.baseDmg*f.d;this.spd=KINDS[this.kind].spd*f.s;this.radius=this.baseRadius+f.r}
  moves(){return MOVES[this.sp.key]||ATTACKS}
  burn(){if(this.burnT>0||!this.alive()||this.state==="evolve"||(SPTYPE[this.sp.key]||[]).includes("fire"))return;this.burnT=360;this.g.floats.push({text:"¡Quemado!",pos:[this.pos[0],this.pos[1]-30],life:50})}
  forceFaint(){this.hp=0;this.state="faint";this.timer=150;this.atk=null;if(this.morphed){this.applyForm(SPECIES[this.kind],{d:1,s:1,r:0});this.morphed=false}this.anim.play("Faint",false,true)}
  atkMod(a){let m=1;const k=this.sp.key,f=this.foe;
    if(this.burnT>0)m*=(k==="drifloon"?1.5:.7);   // Quemado: -30% de daño; Flare Boost (Drifloon): +50%
    if(a.hex&&f&&(f.confT>0||f.parT>0||f.burnT>0||f.seedT>0||f.wrapT>0||f.shredT>0))m*=2;   // Maleficio
    if(k==="mrmime"&&(a.pw||99)<=60)m*=1.5;   // Técnico
    if(a.ty==="grass"&&(k==="turtwig"||k==="grotle"||k==="torterra")&&this.hp<this.maxhp/3)m*=1.5;   // Espesura
    if(a.ty==="fire"&&(k==="charmander"||k==="charmeleon"||k==="charizard")&&this.hp<this.maxhp/3)m*=1.5;   // Mar Llamas
    if(this.bT>0)m*=this.bAtk;
    if(f&&f.sp.key==="gyarados")m*=.8;   // Intimidación
    return m}
  mspd(){return this.spd*(this.spdT>0?1.5:1)*(this.bT>0?(this.bSpd||1):1)}
  say(t,dy=-30){this.g.floats.push({text:t,pos:[this.pos[0],this.pos[1]+dy],life:50})}
  healBy(n){const h=Math.min(this.maxhp-this.hp,n);if(h>0){this.hp+=h;this.g.floats.push({text:"+"+h,pos:[this.pos[0],this.pos[1]-26],life:30})}}
  selfHurt(n){const d=Math.min(this.hp-1,Math.max(0,n));if(d>0){this.hp-=d;this.g.floats.push({text:String(d),pos:[this.pos[0],this.pos[1]-26],life:30})}}
  boostUp(b){const cur=this.bT>0?this.bAtk:1;this.bAtk=Math.min(b.cap||2,Math.max(b.min||.5,cur*b.atk));if(b.spd)this.bSpd=Math.min(1.6,(this.bT>0?this.bSpd:1)*b.spd);this.bT=b.t;
    FX.aura(this,b.atk>=1?"255,140,220":"150,150,170");this.say(b.atk>=1?"¡Ataque sube!":"¡Ataque baja!")}
  confuse(){if(this.sp.key==="lickitung"||this.confT>0||!this.alive())return;this.confT=240;this.g.floats.push({text:"¡Confuso!",pos:[this.pos[0],this.pos[1]-30],life:50})}   // Ritmo Propio
  paralyze(t){if(this.parT>0||!this.alive())return;if(this.sp.key==="ditto"){this.say("¡No afecta!");return}this.parT=t;this.g.floats.push({text:"¡Paralizado!",pos:[this.pos[0],this.pos[1]-30],life:50})}   // Flexibilidad
  seed(src){if(!this.alive())return;if((SPTYPE[this.sp.key]||[]).includes("grass")){this.say("¡No afecta!");return}if(!(this.seedT>0)){this.seedT=480;this.seedBy=src;this.say("¡Drenadoras!")}}
  wrap(t){if(!this.alive()||this.wrapT>0)return;this.wrapT=t;this.say("¡Atrapado!")}
  status(t,a){if(!t.alive())return;
    if(a.dmg>0&&!(t.lastReal>0))return;   // si el golpe no hizo daño (inmune, disfraz, barrera) no aplica efectos
    if(a.sound&&SOUNDPROOF.has(t.sp.key)){t.say("¡No afecta!");return}   // Insonorizar
    if(a.confuse&&Math.random()<a.confuse)t.confuse();
    if(a.para&&Math.random()<a.para)t.paralyze(a.parT||240);
    if(a.burn&&Math.random()<a.burn)t.burn();
    if(a.flinch&&Math.random()<a.flinch)t.lockT=Math.max(t.lockT||0,28);
    if(a.shred&&Math.random()<a.shred){if(!(t.shredT>0))t.say("¡Defensa baja!");t.shredT=300}
    if(a.blind){t.blindT=a.blind;t.say("¡Precisión baja!")}
    if(a.seed)t.seed(this);
    if(a.wrap)t.wrap(a.wrap)}
  startAttack(k){const m=this.moves()[k];if(!m){if(this.g.player===this)this.g.floats.push({text:"No conoce ese movimiento",pos:[this.pos[0],this.pos[1]-30],life:40});return}
    if((this.cds[k]||0)>0){if(this.g.player===this)this.g.floats.push({text:"Recargando",pos:[this.pos[0],this.pos[1]-30],life:30});return}
    if(this.confT>0&&Math.random()<.33){this.hp=Math.max(1,this.hp-6);this.g.floats.push({text:"¡Se hirió de confusión!",pos:[this.pos[0],this.pos[1]-30],life:50});this.state="hurt";this.atk=null;this.anim.play("Hurt",false,true);return}
    this.cds[k]=m.cd||0;this.atk=m;this.atkKey=k;this.state="attack";this.hitDone=false;this.anim.play(this.atk.anim,false,true)}
    fi(v){return typeof v==="string"?(this.sp.info(this.atk.anim)[v]??0):v}
  doHit(){const a=this.atk,[ux,uy]=unit(this.dir),ty=a.ty||"normal",say=(t,dy)=>this.say(t,dy);
    if(a.barrier){this.shield=70;this.shieldT=360;FX.aura(this,"140,230,255");say("¡Barrera!");return}
    if(a.light){this.lightT=a.light;FX.aura(this,"255,240,150");say("¡Pantalla de Luz!");return}
    if(a.reflect){this.reflT=a.reflect;FX.aura(this,"255,170,130");say("¡Reflejo!");return}
    if(a.guard){this.guardT=a.guard;FX.aura(this,"150,210,110");say("¡Defensa sube!");return}
    if(a.heal){FX.aura(this,"120,255,140");this.healBy(Math.round(this.maxhp*a.heal));return}
    if(a.boost){this.boostUp(a.boost);return}
    if(a.bond){this.bondT=240;FX.aura(this,"170,110,255");say("¡Mismo Destino!");return}
    if(a.splash){FX.water(this);say("¡Pero no pasó nada!");return}
    if(!a.boom&&((a.acc&&Math.random()>a.acc)||(this.blindT>0&&Math.random()<.35))){say("¡Falló!");return}
    let base=a.flail?CD(flailPow(this.hp/this.maxhp))*1.5:a.dmg,mul=1;
    if(a.ramp){this.rollN=this.rollT>0?Math.min(4,(this.rollN||0)+1):1;this.rollT=200;mul*=1+.45*(this.rollN-1);if(this.rollN>1)say("Rodar x"+this.rollN)}
    if(a.crit&&Math.random()<a.crit){mul*=1.5;say("¡Golpe crítico!")}
    const stab=(SPTYPE[this.sp.key]||[]).includes(ty)?1.25:1,dmg=Math.round(base*this.dmgMult*this.atkMod(a)*mul*stab);
    if(a.boom){this.g.hitboxes.push([this.pos[0],this.pos[1],a.radius,14]);FX.boom(this,a.radius);say("¡BOOM!");
      const t=this.foe;if(t.alive()&&Math.hypot(t.pos[0]-this.pos[0],t.pos[1]-this.pos[1])<a.radius+t.radius)t.takeHit(dmg,dirFromAngle(Math.atan2(t.pos[1]-this.pos[1],t.pos[0]-this.pos[0])),a.knock,this,false,ty,a.cat);
      this.forceFaint();return}
    if(a.projectile){const pr=new Projectile([this.pos[0]+ux*10,this.pos[1]+uy*10-2],this.dir,dmg,a.speed,a.life,this.foe,a.col||this.projColor,this);pr.mv=a;pr.ty=ty;pr.cat=a.cat;this.g.projectiles.push(pr);FX.muzzle(pr.pos[0],pr.pos[1],pr.color,ux,uy);if(a.after)this.boostUp(a.after);return}
    const cx=this.pos[0]+ux*a.reach,cy=this.pos[1]+uy*a.reach;
    this.g.hitboxes.push([cx,cy,a.radius,8]);FX.swing(this,a,cx,cy,ty);
    const t=this.foe;if(t.alive()&&Math.hypot(t.pos[0]-cx,t.pos[1]-cy)<a.radius+t.radius){t.takeHit(dmg,this.dir,a.knock,this,true,ty,a.cat);this.status(t,a);
      if(a.drain&&t.lastReal>0)this.healBy(Math.max(1,Math.round(t.lastReal*a.drain)));
      if(a.recoil&&t.lastReal>0)this.selfHurt(Math.round(t.lastReal*a.recoil))}
    if(a.selfHp)this.selfHurt(Math.max(1,Math.round(this.maxhp*a.selfHp)));
    if(a.selfConf&&Math.random()<a.selfConf){this.confT=150;say("¡Se confundió!")}
    if(a.after)this.boostUp(a.after)}
    takeHit(dmg,from,knock,attacker,contact=true,ty=null,cat="p"){
    this.lastReal=0;if(!this.alive()||this.inv>0)return;
    const key=this.sp.key,wasDrif=key==="drifloon",say=(t,dy=-30)=>this.g.floats.push({text:t,pos:[this.pos[0],this.pos[1]+dy],life:40});
    if(ty){const m=typeMult(ty,SPTYPE[key]||["normal"]);
      if(m===0){say("¡No afecta!");this.inv=20;return}
      if(m>1&&key==="mrmime")dmg*=.75;   // Filtro
      dmg=Math.max(1,Math.round(dmg*m));
      if(m>1)say("¡Muy eficaz!",-36);else if(m<1)say("Poco eficaz",-36);
      if(key==="magikarp"&&(ty==="bug"||ty==="ghost"||ty==="dark")){this.spdT=360;say("¡Nervioso!",-36)}}   // Nerviosismo
    if(this.shield>0){const ab=Math.min(this.shield,dmg);this.shield-=ab;dmg-=ab;this.shieldHit=8;FX.shieldHit(this);G.shake(1.5);this.g.floats.push({text:"¡Barrera!",pos:[this.pos[0],this.pos[1]-26],life:30});if(dmg<=0){this.inv=20;return}}
    if(this.guardT>0)dmg=Math.ceil(dmg*.5);
    if(this.lightT>0&&cat==="s")dmg=Math.ceil(dmg*.5);
    if(this.reflT>0&&cat!=="s")dmg=Math.ceil(dmg*.5);
    if(this.shredT>0)dmg=Math.ceil(dmg*1.25);
    if(this.kind==="mimikyu"&&!this.busted){   // Disfraz: el primer golpe no hace daño (romperlo cuesta 1/8 de vida)
      this.busted=true;this.inv=40;this.hp=Math.max(1,this.hp-Math.round(this.maxhp/8));FX.pop(this.pos[0],this.pos[1]-8,"#e8d890");G.stop(5);G.shake(2);const [vx,vy]=unit(from);this.kb=[vx*knock*.5,vy*knock*.5];
      this.g.floats.push({text:"¡Disfraz!",pos:[this.pos[0],this.pos[1]-26],life:50});return}
    const real=Math.min(dmg,this.hp);this.lastReal=real;this.hp=Math.max(0,this.hp-dmg);this.taken+=real;if(attacker)attacker.dealt+=real;const [ux,uy]=unit(from);this.kb=[ux*knock,uy*knock];
    this.dir=(from+4)%8;this.inv=40;this.atk=null;
    this.g.floats.push({text:String(dmg),pos:[this.pos[0],this.pos[1]-26],life:40});this.hitFx(dmg,from,ty,attacker);
    if(contact&&attacker&&attacker!==this&&attacker.alive()&&(key==="voltorb"||key==="electrode")&&Math.random()<.3){   // Estática
      this.say("¡Estática!");FX.ring(FX.over,this.pos[0],this.pos[1]-8,3,22,10,"#ffe84a",{w:1.5});FX.sparks(attacker.pos[0],attacker.pos[1]-8,"#ffe84a",10,2);attacker.paralyze(180)}
    if(this.hp<=0){if(this.morphed){this.applyForm(SPECIES[this.kind],{d:1,s:1,r:0});this.morphed=false}   // Ditto vuelve a su forma al caer
      this.state="faint";this.timer=150;this.anim.play("Faint",false,true);FX.ko(this.pos[0],this.pos[1]-8);G.slow=45;G.shake(8);G.flash("#fff",.7);
      const A=attacker;if(A&&A!==this&&A.alive()){
        if(this.bondT>0){this.g.floats.push({text:"¡Mismo Destino!",pos:[A.pos[0],A.pos[1]-30],life:60});A.forceFaint()}
        else if(wasDrif&&contact){this.g.floats.push({text:"¡Postrero!",pos:[A.pos[0],A.pos[1]-30],life:60});A.hp=Math.max(0,A.hp-Math.round(A.maxhp/4));if(A.hp<=0)A.forceFaint()}}}
    else if(this.canEvolve())this.startEvolve();
    else{this.state="hurt";this.anim.play("Hurt",false,true)}}
    canEvolve(){const n=(EVOS[this.kind]||[])[this.stage];return KINDS[this.kind].evolves&&!!n&&this.alive()&&this.state!=="evolve"&&this.hp>0&&(n.xp?this.dealt+this.taken>=n.xp:(this.dealt>=n.dealt&&this.hp<=this.maxhp*n.hpFrac))}
  startEvolve(){this.state="evolve";this.atk=null;this.evoT=0;this.inv=999;this.anim.play("Pose",false,true);
    this.g.floats.push({text:"¡EVOLUCIONA!",pos:[this.pos[0],this.pos[1]-30],life:80})}
  stepEvolve(){this.evoT++;this.anim.update();this.applyKnock();FX.evolveTick(this);
    if(this.evoT===50){const n=EVOS[this.kind][this.stage];this.stage++;this.applyForm(SPECIES[LINE[this.kind][this.stage]],{d:n.dmg,s:n.speed,r:n.rad});
      if(this.kind==="magikarp"&&this.foe){this.g.floats.push({text:"¡Intimidación!",pos:[this.foe.pos[0],this.foe.pos[1]-30],life:70})}this.maxhp=Math.round(n.maxhp*HPX);this.hp=Math.min(this.maxhp,this.hp+Math.round(n.heal*HPX));this.anim.play("Idle",true,true)}
    if(this.evoT>=80){this.state="free";this.inv=60;this.anim.play("Idle",true,true)}}
  // ---- Ditto: Transform (copia sprites, daño, velocidad y tamaño del rival; conserva su propia vida)
  tryTransform(){
    if(this.kind!=="ditto"||this.state!=="free")return false;
    if(this.morphed){this.beginMorph(null);return true}                       // volver a Ditto antes de tiempo
    const f=this.foe;if(this.morphCool>0||!f||!f.alive())return false;
    if(f.sp.key==="ditto"){this.morphCool=60;this.g.floats.push({text:"¡Pero falló!",pos:[this.pos[0],this.pos[1]-30],life:60});return true}
    this.beginMorph({sp:f.sp,form:{d:f.form.d*KINDS[f.kind].dmg,s:f.spd/KINDS[this.kind].spd,r:f.form.r}});return true}
  beginMorph(to){this.state="morph";this.atk=null;this.evoT=0;this.morphTo=to;this.inv=999;this.kb=[0,0];this.anim.play("Pose",false,true);
    this.g.floats.push({text:to?"¡TRANSFORM!":"Ditto",pos:[this.pos[0],this.pos[1]-30],life:60})}
  stepMorph(){this.evoT++;this.anim.update();this.applyKnock();FX.morphTick(this);
    if(this.evoT===20){const to=this.morphTo;
      if(to){this.applyForm(to.sp,to.form);this.morphed=true;this.morphT=MORPH.time}
      else{this.applyForm(SPECIES[this.kind],{d:1,s:1,r:0});this.morphed=false;this.morphCool=MORPH.cool}
      this.anim.play("Idle",true,true)}
    if(this.evoT>=40){this.state="free";this.inv=30;this.anim.play("Idle",true,true)}}
  morphTick(){if(this.bondT>0)this.bondT--;if(this.burnT>0){this.burnT--;if(this.burnT%60===30&&this.hp>1){const d=Math.min(this.hp-1,Math.max(1,Math.round(this.maxhp/40)));this.hp-=d;this.g.floats.push({text:String(d),pos:[this.pos[0],this.pos[1]-26],life:25})}}if(this.confT>0)this.confT--;if(this.lightT>0)this.lightT--;if(this.shieldT>0)this.shieldT--;else this.shield=0;this.parSkip=false;if(this.parT>0){this.parT--;this.parSkip=this.parT%2===0}if(this.morphCool>0)this.morphCool--;if(this.morphed&&this.morphT>0)this.morphT--;this.tickEx()}
  imposter(){const f=this.foe;if(this.kind!=="ditto"||this.morphed||!f||!f.alive()||f.sp.key==="ditto")return;   // Impostor: nace transformado
    this.applyForm(f.sp,{d:f.form.d*KINDS[f.kind].dmg,s:f.spd/KINDS[this.kind].spd,r:f.form.r});this.morphed=true;this.morphT=MORPH.time;this.say("¡Impostor!")}
  tickEx(){for(const k in this.cds)if(this.cds[k]>0)this.cds[k]--;
    if(this.guardT>0)this.guardT--;if(this.reflT>0)this.reflT--;if(this.shredT>0)this.shredT--;if(this.spdT>0)this.spdT--;if(this.blindT>0)this.blindT--;if(this.rollT>0)this.rollT--;
    if(this.bT>0&&--this.bT<=0){this.bAtk=1;this.bSpd=1}
    if(this.seedT>0){this.seedT--;if(this.seedT%60===0&&this.hp>1){const d=Math.min(this.hp-1,Math.max(2,Math.round(this.maxhp/20)));this.hp-=d;this.g.floats.push({text:String(d),pos:[this.pos[0],this.pos[1]-26],life:25});const s=this.seedBy;if(s&&s.alive())s.healBy(d)}}
    if(this.wrapT>0){this.wrapT--;if(this.wrapT%30===0&&this.hp>1){const d=Math.min(this.hp-1,Math.max(1,Math.round(this.maxhp/60)));this.hp-=d;this.g.floats.push({text:String(d),pos:[this.pos[0],this.pos[1]-26],life:25})}if(this.wrapT%2===0)this.parSkip=true}}
  morphExpired(){return this.morphed&&this.morphT<=0}
  stepHurt(){this.anim.update();this.applyKnock();if(this.anim.done){this.state="free";this.anim.play("Idle",true,true)}}
  stepAttack(){const a=this.atk;
    if(a.dash){const f0=this.fi(a.dash[0]),f1=this.fi(a.dash[1]);
      if(f0<=this.anim.frame&&this.anim.frame<f1){const [ux,uy]=unit(this.dir);this.pos[0]+=ux*a.dash[2];this.pos[1]+=uy*a.dash[2];this.clamp();this.addGhost();if((this.fxT=(this.fxT||0)+1)%3===0){const f=this.foot();FX.dust(f[0],f[1],2,.7)}}}
    const e=this.anim.update(),hf=a.hitAt??this.sp.info(a.anim).hit;
    if(e!==null&&!this.hitDone&&hf!==null&&e>=hf){this.hitDone=true;this.doHit()}
    if(this.anim.done&&this.state==="attack"){if(!this.hitDone){this.hitDone=true;this.doHit()}this.lockT=(this.atk&&this.atk.lock)||0;this.state="free";this.atk=null;this.anim.play("Idle",true,true)}}
  reset(){this.applyForm(SPECIES[this.kind],{d:1,s:1,r:0});this.morphed=false;this.morphT=0;this.morphCool=0;this.morphTo=null;this.busted=false;this.burnT=0;this.bondT=0;this.confT=0;this.parT=0;this.shield=0;this.shieldT=0;this.lightT=0;this.cds={};this.guardT=0;this.reflT=0;this.shredT=0;this.spdT=0;this.rollT=0;this.seedT=0;this.wrapT=0;this.blindT=0;this.bT=0;this.bAtk=1;this.bSpd=1;this.lockT=0;this.stage=0;this.dealt=0;this.taken=0;this.maxhp=Math.round(KINDS[this.kind].maxhp*HPX);this.evoT=0;this.hp=this.maxhp;this.state="free";this.atk=null;this.inv=0;this.pos=[...this.home];this.kb=[0,0];this.anim.play("Idle",true,true);this.imposter()}
}
class Player extends Fighter{
  constructor(g,x,y,kind){super(g,x,y,null,1,kind)}
  update(held,pressed){
    if(this.inv>0)this.inv--;this.morphTick();
    if(pressed.has("faint")){if(this.state==="faint")this.reset();else{this.state="faint";this.anim.play("Faint",false,true)}}
    if(this.state==="faint"){this.anim.update();this.applyKnock();return}
    if(this.state==="evolve"){this.stepEvolve();return}
    if(this.state==="morph"){this.stepMorph();return}
    if(pressed.has("hurt")&&this.state==="free")this.takeHit(5,(this.dir+4)%8,2);
    if(this.state==="hurt"){this.stepHurt();return}
    if(this.state==="attack"){this.stepAttack();return}
    if(this.canEvolve()){this.startEvolve();return}
    if(this.kind==="ditto"){if(this.morphExpired()){this.beginMorph(null);return}if(pressed.has("transform")&&this.tryTransform())return}
    if(this.parSkip){this.anim.update();this.applyKnock();return}
    if(this.lockT>0){this.lockT--;this.anim.play("Idle");this.anim.update();this.applyKnock();return}
    const dx=(held.has("right")?1:0)-(held.has("left")?1:0),dy=(held.has("down")?1:0)-(held.has("up")?1:0);
    let atk=null;for(const k in ATTACKS)if(pressed.has(k)){atk=k;break}
    if(atk){if(dx||dy)this.dir=vecToDir(dx,dy);this.startAttack(atk)}
    else if(dx||dy){this.dir=vecToDir(dx,dy);const n=Math.hypot(dx,dy);this.pos[0]+=dx/n*1.25*this.mspd();this.pos[1]+=dy/n*1.25*this.mspd();this.clamp();this.anim.play("Walk")}
    else this.anim.play("Idle");
    this.anim.update();this.applyKnock()}
}
// Rival con IA: te persigue, se pone a distancia y usa Attack / Swing / Rotate / Charge / Shoot (Ditto además usa Transform).
const AI={speed:0.95,dmgMult:0.7,cooldownMin:55,cooldownRand:55};   // <- ajusta la dificultad aquí
class Enemy extends Fighter{
  constructor(g,x,y,kind){super(g,x,y,"#ffaaaa",AI.dmgMult,kind);this.dir=6;this.radius=8;this.baseRadius=8;this.cool=60;this.projColor=KINDS[kind].eproj}
  // elige un movimiento según su papel (ai), la distancia, la vida y las recargas
  aiPick(dist,aligned){const kit=this.moves(),hpf=this.hp/this.maxhp,f=this.foe,o=[];let tot=0;
    for(const k of ATKK){const m=kit[k];if(!m||(this.cds[k]||0)>0||(m.on&&this[m.on]>0)||(m.fon&&f[m.fon]>0))continue;const r=m.ai||"melee";let w=0;
      if(r==="melee")w=dist<34?3:0;
      else if(r==="area")w=dist<(m.radius||26)+8?2:0;
      else if(r==="dash")w=dist<34?1.6:(dist<75&&aligned?1.4:0);
      else if(r==="range")w=aligned?(dist>55?2:dist>30?.8:0):0;
      else if(r==="heal")w=hpf<.5?5:0;
      else if(r==="self")w=dist<130?1.1:0;
      else if(r==="suicide")w=hpf<.3&&dist<40?3:0;
      else if(r==="bond")w=hpf<.45&&dist<80?2:0;
      else if(r==="idle")w=dist>40?.1:0;
      if(w>0){o.push([k,w]);tot+=w}}
    if(!tot)return null;let x=Math.random()*tot;for(const [k,w] of o){if((x-=w)<=0)return k}return o[0][0]}
  update(){
    if(this.inv>0)this.inv--;this.morphTick();
    if(this.state==="faint"){this.anim.update();this.applyKnock();if(--this.timer<=0)this.reset();return}
    if(this.state==="evolve"){this.stepEvolve();return}
    if(this.state==="morph"){this.stepMorph();return}
    if(this.state==="hurt"){this.stepHurt();return}
    if(this.state==="attack"){this.stepAttack();return}
    if(this.canEvolve()){this.startEvolve();return}
    if(this.parSkip){this.anim.update();this.applyKnock();return}
    if(this.lockT>0){this.lockT--;this.anim.play("Idle");this.anim.update();this.applyKnock();return}
    const p=this.foe;
    if(!p.alive()){this.anim.play("Idle");this.anim.update();return}
    const dx=p.pos[0]-this.pos[0],dy=p.pos[1]-this.pos[1],dist=Math.hypot(dx,dy),a=Math.atan2(dy,dx);
    if(this.kind==="ditto"){
      if(this.morphExpired()){this.beginMorph(null);return}
      if(!this.morphed&&this.morphCool<=0&&dist<120&&Math.random()<0.012&&this.tryTransform())return}
    this.dir=dirFromAngle(a);
    if(this.cool>0)this.cool--;
    const aligned=angDiff(a,this.dir)<0.22;
    if(this.cool<=0){
      const k=Math.random()<.4?this.aiPick(dist,aligned):null;
      if(k){this.startAttack(k);this.cool=AI.cooldownMin+Math.random()*AI.cooldownRand;this.anim.update();return}
    }
    if(dist>30){this.pos[0]+=dx/dist*AI.speed*this.mspd();this.pos[1]+=dy/dist*AI.speed*this.mspd();this.clamp();this.anim.play("Walk")}
    else if(dist<18&&dist>.01){this.pos[0]-=dx/dist*AI.speed*.6*this.mspd();this.pos[1]-=dy/dist*AI.speed*.6*this.mspd();this.clamp();this.anim.play("Walk")}
    else this.anim.play("Idle");
    this.anim.update();this.applyKnock()}
}
