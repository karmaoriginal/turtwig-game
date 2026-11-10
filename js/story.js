// Modo HISTORIA: logica y dibujo (G.toStory, updateStory, drawStory...).
"use strict";
Object.assign(G,{
  storyZ(){return Math.max(1,Math.ceil(S*STORY.zoom-1e-9))},   // píxeles de pantalla por píxel de sprite (entero => nítido)
  storyCam(snap){const s=this.st,Z=this.storyZ(),VW=W*S/Z,VH=H*S/Z,tx=Math.min(Math.max(s.x-VW/2,0),STORY.ww-VW),ty=Math.min(Math.max(s.y-14-VH/2,0),STORY.wh-VH);
    if(snap)s.cam={x:tx,y:ty};else{s.cam.x+=(tx-s.cam.x)*.12;s.cam.y+=(ty-s.cam.y)*.12}},
  toStory(){this.scene="story";this.t=0;this.st={x:640,y:924,dir:0,step:0,moving:false,skin:"ent",cam:{x:0,y:0},act:null,balls:[],run:false};this.st.wild=wildSpawn(this.st.x,this.st.y);this.st.npcs=npcSpawn();this.storyCam(true)},
  updateStory(held,p){const s=this.st;this.t++;
    if(p.has("back")){this.toMenu();return}
    if(this.t<100){held=new Set();p=new Set()}   // durante la intro no se mueve ni se habla
    if(p.has("talk")){   // E: hablar con el NPC de al lado / avanzar / cerrar el diálogo
      const T=s.talk;
      if(T){if(T.c<T.txt.length)T.c=T.txt.length;else if(T.i+1<T.lines.length){T.i++;T.c=0;T.txt=T.lines[T.i]}else s.talk=null}
      else{let b=null,bd=40;for(const n of s.npcs){const d=Math.hypot(s.x-n.x,s.y-n.y);if(d<bd){bd=d;b=n}}
        if(b){const l=NPC_TALK[b.k]||[b.say];b.dir=npcDir(s.x-b.x,s.y-b.y);b.state="idle";b.t=9999;s.talk={n:b,i:0,c:0,txt:l[0],lines:l}}}}
    if(s.talk){s.talk.c=Math.min(s.talk.txt.length,s.talk.c+.6);held=new Set();s.talk.n.state="idle";s.talk.n.t=Math.max(s.talk.n.t,30);
      if(Math.hypot(s.x-s.talk.n.x,s.y-s.talk.n.y)>64)s.talk=null}
    if(p.has("atk2"))s.skin=SKINS_ST[(SKINS_ST.indexOf(s.skin)+1)%3];
    // (lanzar pokébola desactivado: queda para el futuro)
    if(s.act){s.act.t++;if(s.act.t===14){const v=[[0,-1],[0,1],[-1,0],[1,0]][s.dir];s.balls.push({x:s.x+v[0]*7,y:s.y+v[1]*3,vx:v[0]*2.3,vy:v[1]*1.5,z:11,vz:1.1,t:0,rot:0})}if(s.act.t>=26)s.act=null}
    for(const b of s.balls){b.t++;if(b.t<110){
    const nx=b.x+b.vx,ny=b.y+b.vy;if(treeBlocked(nx,b.y))b.vx*=-.5;if(treeBlocked(b.x,ny))b.vy*=-.5;if(nx<14||nx>STORY.ww-14)b.vx*=-.5;if(ny<60||ny>STORY.wh-10)b.vy*=-.5;
    b.x+=b.vx;b.y+=b.vy;b.z+=b.vz;b.vz-=.2;
    if(b.z<=0){b.z=0;b.vz=Math.abs(b.vz)>.9?Math.abs(b.vz)*.45:0;if(b.vz===0){b.vx*=.955;b.vy*=.955}}   // rebota y luego rueda con fricción
    b.rot+=Math.hypot(b.vx,b.vy)}}s.balls=s.balls.filter(b=>b.t<134);
    let dx=(held.has("right")?1:0)-(held.has("left")?1:0),dy=(held.has("down")?1:0)-(held.has("up")?1:0);if(p.has("left")||p.has("right"))s.ax=0;if(p.has("up")||p.has("down"))s.ax=1;if(dx&&dy){if(s.ax)dx=0;else dy=0}
    s.run=held.has("run")&&s.skin==="ent";s.moving=!!(dx||dy)&&!s.act;
    if(s.moving){
      const keep=(s.dir===2&&dx<0)||(s.dir===3&&dx>0)||(s.dir===0&&dy<0)||(s.dir===1&&dy>0);
      if(!(dx&&dy&&keep))s.dir=dx&&!dy?(dx<0?2:3):dy&&!dx?(dy<0?0:1):(dx<0?2:3);
      const n=Math.hypot(dx,dy),sp=s.run?2.1:1.3,mx=dx/n*sp,my=dy/n*sp;const wb=(x,y)=>treeBlocked(x,y)||s.wild.some(w=>Math.abs(x-w.x)<8&&Math.abs(y-w.y)<5)||s.npcs.some(n=>Math.abs(x-n.x)<9&&Math.abs(y-n.y)<6);if(!wb(s.x+mx,s.y))s.x+=mx;if(!wb(s.x,s.y+my))s.y+=my;s.step+=s.run?1.5:1}
    else s.step=0;
    s.x=Math.min(Math.max(s.x,14),STORY.ww-14);s.y=Math.min(Math.max(s.y,14),STORY.wh-10);
    for(const w of s.wild){const d=Math.hypot(s.x-w.x,s.y-w.y),shy=WILD_SHY[w.k];w.t--;
      if(d<70&&!(shy&&d<34)){w.dir=wildDir(s.x-w.x,s.y-w.y);if(w.state==="walk"){w.state="idle";w.t=40}}   // te mira
      if(shy&&d<34){w.state="flee";const n=d||1;w.tx=w.x-(s.x-w.x)/n*40;w.ty=w.y-(s.y-w.y)/n*40;w.t=20}
      else if(w.state==="flee"&&w.t<=0){w.state="idle";w.t=60}
      if(w.state==="idle"&&w.t<=0&&d>=70){w.state="walk";w.t=50+Math.floor(Math.random()*70);const a=Math.random()*6.283,r=10+Math.random()*40;
        w.tx=Math.min(Math.max(w.hx+Math.cos(a)*r,16),STORY.ww-16);w.ty=Math.min(Math.max(w.hy+Math.sin(a)*r,14),STORY.wh-12)}
      else if(w.state==="idle"&&w.t<=0){w.t=60}
      if(w.state==="walk"||w.state==="flee"){const dx=w.tx-w.x,dy=w.ty-w.y,n=Math.hypot(dx,dy),v=w.state==="flee"?w.sp*3:w.sp;
        if(n<1||w.t<=0){w.state="idle";w.t=50+Math.floor(Math.random()*90)}
        else{const hz=Math.abs(dx)>=1;w.dir=hz?wildDir(dx,0):wildDir(0,dy);const mx=hz?Math.sign(dx)*Math.min(v,Math.abs(dx)):0,my=hz?0:Math.sign(dy)*Math.min(v,Math.abs(dy));
          const ok=(x,y)=>!treeBlocked(x,y)&&x>16&&x<STORY.ww-16&&y>14&&y<STORY.wh-12&&!(Math.abs(x-s.x)<8&&Math.abs(y-s.y)<5);
          if(ok(w.x+mx,w.y))w.x+=mx;if(ok(w.x,w.y+my))w.y+=my}}
      w.a.play(w.state==="idle"?wildAnim(w.k,"Idle"):wildAnim(w.k,"Walk"));w.a.update()}
    for(const n of s.npcs){const d=Math.hypot(s.x-n.x,s.y-n.y);n.t--;
      if(d<56){if(n.state==="walk"){n.state="idle";n.t=50}n.dir=npcDir(s.x-n.x,s.y-n.y)}   // te mira
      if(n.state==="idle"&&n.t<=0&&d>=56){n.state="walk";n.t=60+Math.floor(Math.random()*80);const a=Math.random()*6.283,r=8+Math.random()*n.r;n.tx=n.hx+Math.cos(a)*r;n.ty=n.hy+Math.sin(a)*r*.6}
      else if(n.state==="idle"&&n.t<=0)n.t=60;
      if(n.state==="walk"){const dx=n.tx-n.x,dy=n.ty-n.y,m=Math.hypot(dx,dy);
        if(m<1||n.t<=0){n.state="idle";n.t=60+Math.floor(Math.random()*120)}
        else{const hz=Math.abs(dx)>=1,v=.45;n.dir=hz?npcDir(dx,0):npcDir(0,dy);const mx=hz?Math.sign(dx)*Math.min(v,Math.abs(dx)):0,my=hz?0:Math.sign(dy)*Math.min(v,Math.abs(dy));
          const ok=(x,y)=>!treeBlocked(x,y)&&!(Math.abs(x-s.x)<10&&Math.abs(y-s.y)<6)&&!s.npcs.some(o=>o!==n&&Math.abs(x-o.x)<10&&Math.abs(y-o.y)<6)&&!s.wild.some(w=>Math.abs(x-w.x)<9&&Math.abs(y-w.y)<6);
          if(ok(n.x+mx,n.y))n.x+=mx;else n.t=Math.min(n.t,8);if(ok(n.x,n.y+my))n.y+=my;else n.t=Math.min(n.t,8);n.step+=1}}}
    this.storyCam(false)},
  drawStory(){const s=this.st,img=TR_IMG[s.skin]||TR_IMG.boy,Z=this.storyZ(),VW=W*S/Z,VH=H*S/Z,cx=Math.round(s.cam.x*Z)/Z,cy=Math.round(s.cam.y*Z)/Z;
    ctx.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);   // mundo a escala entera de pantalla, con la cámara alineada a píxeles
    ctx.fillStyle="#2f5a35";ctx.fillRect(cx-1,cy-1,VW+2,VH+2);if(ZGROUND.complete)ctx.drawImage(ZGROUND,0,0);
    const D=[],Zc=Z+1,big=(fx,fy,fn)=>{ctx.save();ctx.setTransform(Zc,0,0,Zc,Math.round((fx-cx)*Z)-fx*Zc,Math.round((fy-cy)*Z)-fy*Zc);fn();ctx.restore()};   // protagonista y NPC: 1 px de sprite = Z+1 px de pantalla (entero, sin suavizado)
    if(ZATLAS.complete)for(const [k,x,y] of ZOBJ){const m=ZMETA[k];if(x<cx-m[2]||x>cx+VW+m[2]||y<cy||y>cy+VH+m[3])continue;
      if(k>=23&&k<=26)D.push([y,()=>{   // viento: cada fila del árbol se corre un número ENTERO de píxeles (la copa más, el tronco nada) => se mece sin animar sprites ni suavizar
        const x0=Math.round(x-m[2]/2),y0=y-m[3],w=wind(x,this.t);
        for(let r=0;r<m[3];r++){const f=(m[3]-1-r)/m[3],dx=Math.round(w*f*f*3.2);ctx.drawImage(ZATLAS,m[0],m[1]+r,m[2],1,x0+dx,y0+r,m[2],1)}}]);
      else if(k<=4||(k>=7&&k<=10))D.push([y,()=>{   // flores y plantas del pack nuevo (tamaño original) con viento leve: filas enteras, sin suavizado
        const fm=k>=9?FL_PATCH:FL_SING,q=FL_META[fm[Math.abs(x*7+y*13+k*5)%fm.length]],x0=Math.round(x-q[2]/2),y0=y-q[3],w=wind(x*1.7+31,this.t);
        for(let r=0;r<q[3];r++){const f=(q[3]-1-r)/q[3],dx=Math.round(w*f*f*1.6);ctx.drawImage(FL_IMG,q[0],q[1]+r,q[2],1,x0+dx,y0+r,q[2],1)}}]);
      else D.push([y,()=>ctx.drawImage(ZATLAS,m[0],m[1],m[2],m[3],Math.round(x-m[2]/2),y-m[3],m[2],m[3])])}
    for(const b of s.balls)D.push([b.y+1,()=>{const bx=Math.round(b.x),by=Math.round(b.y-b.z);ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(bx,Math.round(b.y),3,1.2,0,0,7);ctx.fill();
      if(b.t>=110){ctx.globalAlpha=Math.max(0,1-(b.t-110)/24);ctx.strokeStyle="#fff";ctx.beginPath();ctx.arc(bx,by-4,2+(b.t-110)*.3,0,7);ctx.stroke();ctx.globalAlpha=1}
      else if(BALL_IMG.complete)ctx.drawImage(BALL_IMG,(Math.floor(b.rot/2.5)%4)*18,0,18,18,bx-9,by-18,18,18)}]);
    for(const w of s.wild){if(w.x<cx-30||w.x>cx+VW+30||w.y<cy-4||w.y>cy+VH+40)continue;
      D.push([w.y,()=>{const sp=SPECIES[w.k];ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(Math.round(w.x),Math.round(w.y)-1,7,2.5,0,0,7);ctx.fill();
        sp.draw(w.a.name,w.dir,w.a.frame,[Math.round(w.x),Math.round(w.y)])}]);}
    for(const n of s.npcs){if(n.x<cx-30||n.x>cx+VW+30||n.y<cy-4||n.y>cy+VH+40)continue;
      D.push([n.y,()=>big(Math.round(n.x),Math.round(n.y),()=>{ctx.fillStyle="rgba(0,0,0,.25)";ctx.beginPath();ctx.ellipse(Math.round(n.x),Math.round(n.y)-1,6,2.2,0,0,7);ctx.fill();
        const f=n.state==="walk"?[1,0,1,2][Math.floor(n.step/9)%4]:1;
        if(NPC_IMG.complete)ctx.drawImage(NPC_IMG,(n.k*3+f)*24,npcDirRow[n.dir]*24,24,24,Math.round(n.x)-12,Math.round(n.y)-22,24,24)})])}
    D.push([s.y,()=>big(Math.round(s.x),Math.round(s.y),()=>{ctx.fillStyle="rgba(0,0,0,.28)";ctx.beginPath();ctx.ellipse(Math.round(s.x),Math.round(s.y)-1,7,2.5,0,0,7);ctx.fill();
      if(s.skin==="ent"&&PROTA_IMG.complete){const r=PROTA_ROW[s.dir],f=s.moving&&!s.act?Math.floor(s.step/7)%4:0;
        ctx.drawImage(PROTA_IMG,f*27,r*24,27,24,Math.round(s.x)-PROTA_AX[r],Math.round(s.y)-22,27,24)}
      else if(img&&img.complete){const f=s.moving?[1,0,2,0][Math.floor(s.step/7)%4]:0;ctx.drawImage(img,f*TR_W,s.dir*TR_H,TR_W,TR_H,Math.round(s.x-TR_W/2),Math.round(s.y-TR_H+2),TR_W,TR_H)}})]);
    D.sort((p,q)=>p[0]-q[0]);for(const d of D)d[1]();
    ctx.setTransform(S,0,0,S,0,0);   // la interfaz vuelve a la escala normal
    this.vignette();
    {const T=s.talk;let hn=null;if(!T)for(const n of s.npcs)if(Math.hypot(s.x-n.x,s.y-n.y)<40){hn=n;break}
      const nn=T?T.n:hn;
      if(nn){const k=Math.max(1,Math.round(S/2)),fs=16*k,o=octx;o.font=fs+"px PixOp,monospace";o.textBaseline="top";o.textAlign="left";
        const full=T?T.txt:"E",shown=T?T.txt.slice(0,Math.floor(T.c)):"E",maxw=104;
        const words=full.split(" "),lines=[];let cur="";for(const w of words){const t=cur?cur+" "+w:w;if(o.measureText(t).width/S>maxw&&cur){lines.push(cur);cur=w}else cur=t}lines.push(cur);
        const lw=Math.max(...lines.map(l=>o.measureText(l).width/S)),lh=Math.round(fs*1.05)/S,bw=Math.round(lw+11),bh=Math.round(lines.length*lh+6);
        const tx=Math.round((nn.x-cx)*Z/S),ty=Math.round((nn.y-cy)*Z/S-24*Zc/S);
        let bx=Math.round(tx-bw/2);bx=Math.max(3,Math.min(W-3-bw,bx));const by=Math.max(3,ty-4-bh);
        const bk=ctx;bk.fillStyle="#000";bk.fillRect(bx+1,by-1,bw-2,bh+2);bk.fillRect(bx-1,by+1,bw+2,bh-2);bk.fillStyle="#fff";bk.fillRect(bx+1,by,bw-2,bh);bk.fillRect(bx,by+1,bw,bh-2);
        const ax=Math.max(bx+5,Math.min(bx+bw-5,tx));
        for(let i=0;i<4;i++){const yy=by+bh+i,l=ax-3+i,r=ax+3-i;bk.fillStyle="#000";bk.fillRect(l,yy,1,1);bk.fillRect(r,yy,1,1);if(r-l>1){bk.fillStyle="#fff";bk.fillRect(l+1,yy,r-l-1,1)}}
        o.fillStyle="#1a1a1a";let used=0;
        lines.forEach((l,i)=>{const part=shown.slice(used,used+l.length+1);used+=l.length+1;o.fillText(part.trimEnd(),Math.round((bx+5)*S),Math.round((by+3+i*lh)*S))})}}
    for(const w of s.wild){if(Math.hypot(s.x-w.x,s.y-w.y)<44)this.text(wildName(w.k),(w.x-cx)*Z/S,(w.y-cy)*Z/S-24*Z/S,"#fff","center",3.2)}
    {const t=this.t,o=octx,fs=16*Math.max(1,Math.round(S/2));   // intro: pantalla negra con la región, se aclara y aparece el cartel del lugar
      if(t<150){ctx.globalAlpha=t<100?1:1-(t-100)/50;ctx.fillStyle="#000";ctx.fillRect(0,0,W,H);ctx.globalAlpha=1}
      o.font=fs+"px PixOp,monospace";o.textAlign="center";o.textBaseline="middle";
      if(t<100){o.globalAlpha=Math.max(0,Math.min(1,t/30,(100-t)/25));o.fillStyle="#fff";o.fillText("REGIÓN HONKAMA",Math.round(W/2*S),Math.round(H/2*S));o.globalAlpha=1}
      if(t>=130&&t<330){const a=Math.max(0,Math.min(1,(t-130)/25,(330-t)/40));ctx.globalAlpha=a;ctx.fillStyle="rgba(10,14,24,.8)";ctx.fillRect(W/2-58,16,116,28);ctx.fillStyle="#ffe070";ctx.fillRect(W/2-58,16,116,1);ctx.fillRect(W/2-58,43,116,1);ctx.globalAlpha=1;
        o.globalAlpha=a;o.fillStyle="#ffe070";o.fillText("RUTA 001",Math.round(W/2*S),Math.round(25*S));o.fillStyle="#fff";o.fillText("PUEBLO VERDE",Math.round(W/2*S),Math.round(35*S));o.globalAlpha=1}
      this.ta=t<100?0:Math.min(1,(t-100)/40)}
    this.text("HISTORIA",6,5,"#ffe070","left",5);this.text("Shift correr",6,13,"#d8dcec","left",3.4);
    this.text("Flechas / WASD mover     Shift correr     X cambiar entrenador     Esc menú",W/2,H-8,"#e6e9f6","center",3.4);this.ta=undefined},
});
