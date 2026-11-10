// Menu de modos, editor de equipos y partida de voleibol.
"use strict";
Object.assign(G,{
  teams:{L:["turtwig","ditto","mimikyu"],R:["mrmime","lickitung","drifloon"]},   // equipos editables (1 a 6)
  // ---- menú de modo
  toMenu(){this.scene="menu";this.t=0},
  updateMenu(p){this.t++;if(p.has("up"))this.menu.cur=(this.menu.cur+2)%3;if(p.has("down"))this.menu.cur=(this.menu.cur+1)%3;
    if(p.has("ok")||p.has("atk1")){this.mode=["fight","volley","story"][this.menu.cur];if(this.mode==="volley")this.toTeams();else if(this.mode==="story")this.toStory();else this.toSelect()}},
  drawMenu(){const t=this.t,blink=Math.floor(t/10)%2===0;this.bg("#1a2036","#212a47");
    this.text("MODO DE JUEGO",W/2,6,"#ffe070","center",9);this.text("Elige cómo quieres jugar",W/2,22,"#aab4d6","center",3.8);
    [["COMBATE","Pelea 1 vs 1 · evoluciones, tipos y estados"],["VOLEIBOL","Equipos de 1 a 6 · pase, colocación y remate"],["HISTORIA","Explora con tu entrenador (modo de prueba)"]].forEach(([n,d],i)=>{
      const y=36+i*43,cur=i===this.menu.cur;ctx.fillStyle=cur?(blink?"#ffe070":"#3c78ff"):"#39425f";ctx.fillRect(38,y-2,244,40);ctx.fillStyle="#10131c";ctx.fillRect(39,y-1,242,38);
      if(i===0)this.face(PIC.turtwig.normal,44,y+1,34,34);else if(i===1)this.face(BALLS[this.ballSkin],46,y+3,32,32);
      else{const im=TR_IMG.boy;if(im&&im.complete)ctx.drawImage(im,0,TR_H,TR_W,TR_H,50,y+3,TR_W,TR_H)}
      this.text(n,88,y+6,cur?"#fff":"#8a95bb","left",8);this.text(d,88,y+21,cur?"#c8d0e8":"#6f7794","left",3.6)});
    this.text("↑/↓ elegir     Z / Enter confirmar",W/2,H-9,"#8a95bb","center",3.4)},
  // ---- editor de equipos: fila 0 = nº de jugadores, luego un Pokémon por jugador, y al final la pelota
  toTeams(){this.scene="teams";this.t=0;this.tm={phase:0,row:0}},
  updateTeams(p){const t=this.tm,S=PICKABLE,team=this.teams[t.phase?"R":"L"];this.t++;
    if(p.has("back")||p.has("atk2")){if(t.phase){t.phase=0;t.row=0}else this.toMenu();return}
    let rows=team.length+2;if(p.has("up"))t.row=(t.row+rows-1)%rows;if(p.has("down"))t.row=(t.row+1)%rows;
    const dx=(p.has("right")?1:0)-(p.has("left")?1:0);
    if(dx){if(t.row===0){const nn=vclamp(team.length+dx,1,6);while(team.length<nn)team.push(S[Math.floor(Math.random()*S.length)]);team.length=nn}
      else if(t.row<=team.length){const i=t.row-1;team[i]=S[(S.indexOf(team[i])+dx+S.length)%S.length]}
      else this.ballSkin=(this.ballSkin+dx+6)%6}
    if(p.has("transform")){for(let i=0;i<team.length;i++)team[i]=S[Math.floor(Math.random()*S.length)]}
    rows=team.length+2;t.row=Math.min(t.row,rows-1);
    if(p.has("ok")||p.has("atk1")){if(!t.phase){t.phase=1;t.row=0}else this.startVolley()}},
  drawTeams(){const t=this.tm,blink=Math.floor(this.t/10)%2===0;this.bg("#1a2036","#212a47");
    this.text("ARMA TUS EQUIPOS",W/2,3,"#ffe070","center",7);
    for(const [ph,side,x0,col,lab] of [[0,"L",8,"#3c78ff","TU EQUIPO"],[1,"R",166,"#ff4a4a","RIVAL"]]){const team=this.teams[side],act=t.phase===ph,rowY=r=>30+r*16;
      ctx.fillStyle=act?col:"#39425f";ctx.fillRect(x0-2,15,148,139);ctx.fillStyle="#10131c";ctx.fillRect(x0-1,16,146,137);this.text(lab,x0+4,18,col,"left",4.5);
      const hl=r=>{if(act&&t.row===r){ctx.fillStyle=blink?"rgba(255,224,112,.30)":"rgba(255,255,255,.14)";ctx.fillRect(x0,rowY(r)-2,144,15)}};
      hl(0);this.text("Jugadores  ◄ "+team.length+" ►",x0+6,rowY(0)+1,"#fff","left",4.5);
      team.forEach((k,i)=>{const gx=x0+4+(i%3)*47,gy=46+((i/3)|0)*52,on=act&&t.row===i+1;ctx.fillStyle=on?(blink?"#ffe070":"#fff"):"#39425f";ctx.fillRect(gx-2,gy-2,44,44);ctx.fillStyle="#10131c";ctx.fillRect(gx-1,gy-1,42,42);this.face(PIC[k].normal,gx,gy,40,40);this.text(KINDS[k].name,gx+20,gy+42,on?"#fff":"#aab4d6","center",3.4);this.text(String(i+1),gx+2,gy+2,"#fff","left",4)})}
    const n=this.teams[t.phase?"R":"L"].length;if(t.row===n+1){ctx.fillStyle=blink?"rgba(255,224,112,.30)":"rgba(255,255,255,.14)";ctx.fillRect(W/2-62,155,124,14)}
    this.face(BALLS[this.ballSkin],W/2-62,154,16,16);this.text("Pelota  ◄ "+BALL_NAMES[this.ballSkin]+" ►",W/2-42,158,"#fff","left",4.2);
    this.text("↑/↓ fila   ←/→ cambiar   Z / Enter: siguiente   G: equipo al azar   Esc: atrás",W/2,H-8,"#8a95bb","center",3.2)},
  // ---- partida
  startVolley(){const mk=()=>({x:0,y:0,z:16,vx:0,vy:0,vz:0,rot:0,tr:[],state:"serve",server:"L",lastSide:null,lastP:null,net:false}),tm=s=>this.teams[s].map((k,i,a)=>new VP(s,k,i,a.length));
    this.vb={cam:{x:0,y:0},team:{L:tm("L"),R:tm("R")},score:{L:0,R:0},ball:mk(),touches:0,msg:null,tx:null,over:null,dead:0,hs:0,netT:0,next:"L",pb:{z:0,x:0,c:0},ctrl:0,srv:{L:0,R:0},seen:{},slip:{L:0,R:0},chs:{},autoL:false,autoSw:false,sw:0};
    FX.clear();this.shk=0;this.scene="volley";this.t=0;this.vbServe("L");this.vbBall();for(let i=0;i<80;i++)this.vbCam()},
  vbServe(side){const V=this.vb,B=V.ball,c=VB.court;for(const p of [...V.team.L,...V.team.R]){p.pos=[...p.home];p.act=null;p.aiT=0}
    const s=V.team[side][V.srv[side]];s.pos=[side==="L"?c.x0-4:c.x1+4,s.home[1]];
    if(side==="L")V.ctrl=V.srv.L;else{const b=V.team.L.find(q=>!q.front);V.ctrl=b?b.i:0}
    Object.assign(B,{state:"serve",server:side,lastSide:null,lastP:null,net:false,vx:0,vy:0,vz:0,tr:[]});V.touches=0;V.msg=null;V.dead=0;V.seen={};V.slip={L:0,R:0};V.chs={}},
  vbLz(B){const t=(B.vz+Math.sqrt(B.vz*B.vz+2*VB.g*Math.max(B.z,0)))/VB.g;return [B.x+B.vx*t,B.y+B.vy*t,t]},
  // calcula la velocidad para llegar en T ticks a (tx,ty); si cruza la red, alarga T hasta pasar por encima
  vbSolve(B,tx,ty,T0,m){const g=VB.g,nx=VB.netX,cross=(B.x-nx)*(tx-nx)<0;let T=T0;
    for(;T<T0+90;T+=2){if(!cross)break;const vx=(tx-B.x)/T,vz=-B.z/T+g*(T-1)/2,tn=(nx-B.x)/vx;if(B.z+vz*tn-g*tn*(tn-1)/2>=VB.netH+m)break}
    B.vx=(tx-B.x)/T;B.vy=(ty-B.y)/T;B.vz=-B.z/T+g*(T-1)/2;return T},
  vbFx(p,hard){const B=this.vb.ball,y=B.y-B.z-7;FX.ring(FX.over,B.x,y,2,hard?16:11,hard?10:8,hard?"#ffe070":"#fff",{w:hard?2:1});FX.sparks(B.x,y,hard?"#ffe070":"#fff",hard?10:4,hard?2.4:1.2);
    if(hard){this.shake(2.5);this.vb.hs=3;this.vb.tx={text:"¡REMATE!",t:0}}},
  // contacto: devuelve true si el golpe conecta (alcance, altura, máx. 3 toques por equipo y no dos seguidos del mismo jugador)
  vbTouch(p,k,aim){const V=this.vb,B=V.ball,c=VB.court,nx=VB.netX,dir=p.side==="L"?1:-1,opps=V.team[p.side==="L"?"R":"L"],mates=V.team[p.side];
    // puntería: ←/→ = corto (hacia la red) o profundo; ↑/↓ = lado. Sin dirección: apunta al hueco más lejos de los rivales (la IA a veces apunta al azar)
    const place=()=>{const j=p.jit;
      if(aim.ax||aim.ay||aim.r){const f=aim.ax?(aim.ax*dir>0?.15:.9):.3+Math.random()*.55,cy=(c.y0+c.y1)/2,hh=(c.y1-c.y0)/2-8;
        return [nx+dir*(10+f*(c.x1-nx-20))+rnd(-j,j),(aim.ay?cy+aim.ay*hh*.8:c.y0+8+Math.random()*2*hh)+rnd(-j,j)]}
      let best=null,bs=-1;for(let i=0;i<10;i++){const x=nx+dir*(14+Math.random()*(c.x1-nx-30)),y=c.y0+8+Math.random()*(c.y1-c.y0-16);let m=1e9;for(const o of opps){const f=o.foot();m=Math.min(m,Math.hypot(f[0]-x,f[1]-y))}if(m>bs){bs=m;best=[x,y]}}
      return [best[0]+rnd(-j,j),best[1]+rnd(-j,j)]};
    if(B.state==="serve"){if(B.server!==p.side||p.i!==V.srv[p.side])return false;const hard=k==="serveH",[tx,ty]=place();
      this.vbSolve(B,tx,ty,hard?44:66,hard?1:3);if(hard&&Math.random()<.15)B.vz-=.35;
      B.state="play";B.lastSide=p.side;B.lastP=p;V.touches=3;B.net=false;this.vbFx(p,hard);return true}
    if(B.lastSide===p.side&&(V.touches>=3||(mates.length>1&&B.lastP===p)))return false;
    const [fx,fy]=p.foot(),d=Math.hypot(B.x-fx,B.y-fy),jump=k==="spike";
    if(d>p.reach+(jump?3:0)+(aim.dx!==undefined?6:0)||(jump?(B.z<6||B.z>42):B.z>20))return false;
    if(B.lastSide!==p.side)V.touches=0;V.touches++;B.lastSide=p.side;B.lastP=p;B.net=false;
    if(k==="set"){   // colocación: hacia un compañero de la red (↑/↓ elige cuál; si no, al azar)
      const fr=mates.filter(q=>q!==p&&q.front);let ty=B.y,tx=nx-dir*34;
      if(fr.length){const q=aim.ay?fr.reduce((a,b)=>(aim.ay>0?b.pos[1]>a.pos[1]:b.pos[1]<a.pos[1])?b:a):fr[Math.floor(Math.random()*fr.length)];ty=q.pos[1];tx=nx-dir*(30+rnd(0,6))}
      this.vbSolve(B,tx,vclamp(ty,c.y0+8,c.y1-8)+rnd(-3,3),vclamp(50+Math.hypot(tx-B.x,ty-B.y)/12,56,80),0)}
    else{const [tx,ty]=place(),dist=Math.hypot(tx-B.x,ty-B.y);
      if(jump){this.vbSolve(B,tx,ty,vclamp(dist/(4.2*p.pw),16,56),1.5);if(Math.random()<.15)B.vz-=.35}   // a veces el remate roza la red
      else this.vbSolve(B,tx,ty,50+dist/10,3)}
    this.vbFx(p,jump);return true},
  vbBall(){const V=this.vb,B=V.ball;if(V.netT>0)V.netT--;
    if(B.state==="serve"){const s=V.team[B.server][V.srv[B.server]],f=s.foot();B.x=f[0]+(s.side==="L"?9:-9);B.y=f[1];B.z=16+Math.sin(this.t/9)*2;B.vx=B.vy=B.vz=0;return}
    if(B.state!=="play")return;
    const px=B.x;B.x+=B.vx;B.y+=B.vy;B.z+=B.vz;B.vz-=VB.g;B.rot+=B.vx*.12;B.tr.push([B.x,B.y-B.z]);if(B.tr.length>6)B.tr.shift();
    if((px-VB.netX)*(B.x-VB.netX)<0&&B.z<VB.netH){B.x=VB.netX+Math.sign(px-VB.netX)*2;B.vx*=-.25;B.vy*=.3;B.vz=Math.max(B.vz,0);B.net=true;V.netT=12;FX.sparks(VB.netX,B.y-B.z-7,"#fff",6,1.2)}
    if(B.z<=0&&B.vz<0){B.z=0;this.vbLand()}},
  vbLand(){const V=this.vb,B=V.ball,c=VB.court,inside=B.x>=c.x0&&B.x<=c.x1&&B.y>=c.y0&&B.y<=c.y1,side=B.x<VB.netX?"L":"R";let win,why;
    if(inside){win=side==="L"?"R":"L";why=B.net?"La pelota tocó la red":"¡Cayó dentro!"}else{win=B.lastSide==="L"?"R":"L";why="¡Fuera!"}
    V.score[win]++;if(win!==B.server)V.srv[win]=(V.srv[win]+1)%V.team[win].length;   // al recuperar el saque, rota el sacador
    B.state="dead";V.msg={text:why,side:win};V.next=win;V.dead=0;if(V.score[win]>=VB.target)V.over=win;
    FX.ring(FX.under,B.x,B.y,2,16,14,"#fff",{w:2,fl:1});FX.dust(B.x,B.y,5,1);this.shake(3)},
  // el jugador del equipo humano que debe ir por la pelota (el más cercano al punto de caída; nunca el que acaba de tocarla)
  vbCtrl(){const V=this.vb,B=V.ball,T=V.team.L;if(T.length<2||B.state!=="play")return;const cur=T[V.ctrl];if(cur.act)return;
    const lz=this.vbLz(B);if(lz[0]>=VB.netX)return;
    const bad=q=>B.lastSide==="L"&&B.lastP===q,dist=q=>{const f=q.foot();return Math.hypot(f[0]-lz[0],f[1]-lz[1])};
    let best=null,bd=1e9;for(const q of T){if(bad(q))continue;const d=dist(q);if(d<bd){bd=d;best=q}}
    if(best&&best!==cur&&bd+14<(bad(cur)?1e9:dist(cur)))V.ctrl=best.i},
  // IA de un equipo: uno persigue la pelota (pase, colocación o remate según los toques), el resto cubre su zona
  vbTeam(side){const V=this.vb,B=V.ball,T=V.team[side],dir=side==="L"?1:-1,c=VB.court,res=new Map(),human=(side==="L"&&!V.autoL)?T[V.ctrl]:null,srvP=T[V.srv[side]];
    const goTo=(p,inp,tx,ty)=>{const [fx,fy]=p.foot(),ex=tx-fx,ey=ty-fy;inp.dx=Math.abs(ex)>2.5?Math.sign(ex):0;inp.dy=Math.abs(ey)>2.5?Math.sign(ey):0};
    const aim=p=>{const r=Math.random();p.aim={ax:r<.15?dir:r<.3?-dir:0,ay:0,r:Math.random()>VB.ai.smart}};   // casi siempre apunta al hueco; a veces toque corto/profundo
    const mk=()=>({dx:0,dy:0,z:0,x:0,c:0,ax:0,ay:0});
    for(const p of T)p.sprint=false;
    if(B.state!=="play"){for(const p of T){if(p===human)continue;const inp=mk();let tx=p.home[0],ty=p.home[1];
        if(B.state==="serve"&&B.server===side&&p===srvP){tx=side==="L"?c.x0-4:c.x1+4;if(++p.aiT>60&&!p.act){aim(p);if(Math.random()<.3)inp.x=1;else inp.z=1;p.aiT=0}}
        goTo(p,inp,tx,ty);res.set(p,inp)}return res}
    const lz=this.vbLz(B),mine=(lz[0]-VB.netX)*dir<0;
    if(V.seen[side]!==B.lastSide){V.seen[side]=B.lastSide;V.slip[side]=B.lastSide&&B.lastSide!==side&&Math.random()<VB.ai.miss?rnd(-40,40):0;V.chs[side]=null}
    const dd=p=>{const f=p.foot();return Math.hypot(f[0]-lz[0],f[1]-lz[1])},bad=p=>T.length>1&&B.lastSide===side&&B.lastP===p;
    let chaser=null,backup=null;
    if(mine){const cand=T.filter(p=>p!==human&&!bad(p)).sort((a,b)=>dd(a)-dd(b));chaser=cand[0]||null;backup=cand[1]||null;
      const pv=V.chs[side];if(chaser&&pv&&pv!==chaser&&cand.includes(pv)&&dd(pv)<dd(chaser)+16){chaser=pv;backup=cand.find(q=>q!==pv)||null}
      V.chs[side]=chaser;
      // si tú estás cerca de la pelota te la dejan; si no llegas, la toma un compañero
      if(human&&!bad(human)){const dh=dd(human);if(dh<(chaser?dd(chaser):1e9)+24&&!(lz[2]<16&&dh>human.reach+14)){backup=chaser;chaser=null}}
      if(human&&human.act&&!human.act.done)chaser=null}
    for(const p of T){if(p===human)continue;const inp=mk(),[fx,fy]=p.foot();
      if(p===chaser){p.sprint=true;goTo(p,inp,lz[0]+V.slip[side]*.5,lz[1]+V.slip[side]);
        const d=Math.hypot(B.x-fx,B.y-fy),tc=B.lastSide===side?V.touches:0,hasMate=T.some(q=>q!==p&&q.front&&!bad(q)),z=B.z;
        if(!p.act&&d<p.reach+3&&tc<3){   // 1er toque: recibe y coloca · 2º: remata · 3º: devuelve
          if(tc>=1&&z>=8&&z<=40&&B.vz<=.3&&Math.random()<.85){aim(p);inp.x=1}
          else if(z<=18){aim(p);if(tc>=2||!hasMate)inp.z=1;else if(tc===0)inp[Math.random()<.85?"c":"z"]=1;else inp[Math.random()<.6?"c":"z"]=1}}}
      else{let tx=p.home[0],ty=p.home[1]+(B.y-p.home[1])*.3;
        if(mine&&p===backup){tx=lz[0]-dir*30;ty=lz[1]}else if(mine&&chaser)ty=p.home[1]+(lz[1]-p.home[1])*.2;   // el segundo lo respalda por detrás
        goTo(p,inp,tx,vclamp(ty,c.y0,c.y1))}
      res.set(p,inp)}
    return res},
  vbCam(){const V=this.vb,B=V.ball,C=V.cam,cp=V.autoL?{pos:[B.x,B.y]}:V.team.L[V.ctrl];
    const fx=B.x*.65+cp.pos[0]*.35,fy=B.y*.5+cp.pos[1]*.5,tx=vclamp(fx-W/2,0,VB.ww-W),ty=vclamp(fy-H/2+10,0,VB.wh-H);C.x+=(tx-C.x)*.12;C.y+=(ty-C.y)*.12},
  updateVolley(held,p){const V=this.vb,T=V.team;this.t++;
    if(p.has("back")){this.toTeams();return}
    if(p.has("reset")||(V.over&&V.dead>70&&(p.has("ok")||p.has("atk1")))){this.startVolley();return}
    this.shk*=.84;for(const e of ["z","x","c"])V.pb[e]=Math.max(0,V.pb[e]-1);
    if(p.has("atk1"))V.pb.z=9;if(p.has("atk2"))V.pb.x=9;if(p.has("atk3"))V.pb.c=9;
    if(p.has("atk4")&&T.L.length>1&&!V.autoL&&!T.L[V.ctrl].act){const B=V.ball,ds=q=>Math.hypot(q.pos[0]-B.x,q.pos[1]-B.y),ord=[...T.L].sort((a,b)=>ds(a)-ds(b));V.ctrl=ord[(ord.indexOf(T.L[V.ctrl])+1)%ord.length].i}   // V: cambiar de jugador
    if(p.has("atk5"))V.autoSw=!V.autoSw;   // B: cambio automático de jugador (apagado por defecto: tus compañeros juegan solos)
    if(V.hs>0){V.hs--;FX.update();this.vbCam();return}
    if(V.tx&&++V.tx.t>50)V.tx=null;
    if(V.ball.state==="serve"&&V.ball.server==="L"&&!V.autoL){if(++V.sw>360)V.pb.z=9}else V.sw=0;   // si no sacas en 6 s, saca solo (suave)
    if(!V.autoL&&V.autoSw)this.vbCtrl();
    const dx=(held.has("right")?1:0)-(held.has("left")?1:0),dy=(held.has("down")?1:0)-(held.has("up")?1:0),hin={dx,dy,z:V.pb.z>0,x:V.pb.x>0,c:V.pb.c>0,ax:dx,ay:dy};
    const inL=this.vbTeam("L"),inR=this.vbTeam("R");
    for(const q of T.L){const c=!V.autoL&&q.i===V.ctrl;q.step(c?hin:inL.get(q),!c)}
    for(const q of T.R)q.step(inR.get(q),true);
    this.vbBall();if(V.ball.state==="dead"){V.dead++;if(!V.over&&V.dead>100)this.vbServe(V.next)}
    FX.update();this.vbCam()},
  drawVolley(){const V=this.vb,B=V.ball,c=VB.court,nx=VB.netX,C=V.cam,sx=this.shk>.3?Math.round((Math.random()*2-1)*this.shk):0,sy=this.shk>.3?Math.round((Math.random()*2-1)*this.shk):0;
    ctx.save();ctx.translate(sx-Math.round(C.x),sy-Math.round(C.y));
    ctx.fillStyle="#2b3656";ctx.fillRect(-8,-8,VB.ww+16,VB.wh+16);ctx.fillStyle="#3a4a73";ctx.fillRect(-8,-8,VB.ww+16,50);
    for(let i=0;i<54;i++){ctx.fillStyle=["#ffcf70","#ff8a7a","#8ad0ff","#b8f08a"][i%4];ctx.globalAlpha=.55;ctx.fillRect(i*12+4,20+(i%3)*3,5,5);ctx.fillRect(i*12+4+((i+1)%2)*5,30+((i+1)%3)*3,5,5)}ctx.globalAlpha=1;
    ctx.fillStyle="#4d6aa0";ctx.fillRect(c.x0-24,c.y0-16,c.x1-c.x0+48,c.y1-c.y0+32);
    ctx.fillStyle="#dba55e";ctx.fillRect(c.x0,c.y0,c.x1-c.x0,c.y1-c.y0);
    ctx.fillStyle="rgba(120,70,20,.16)";for(let x=c.x0;x<c.x1;x+=14)ctx.fillRect(x,c.y0,1,c.y1-c.y0);
    ctx.strokeStyle="#fff";ctx.lineWidth=1;ctx.strokeRect(c.x0+.5,c.y0+.5,c.x1-c.x0-1,c.y1-c.y0-1);
    ctx.beginPath();for(const lx of [nx-90,nx+90]){ctx.moveTo(lx+.5,c.y0);ctx.lineTo(lx+.5,c.y1)}ctx.stroke();
    ctx.fillStyle="rgba(0,0,0,.25)";ctx.fillRect(nx+1,c.y0-6,3,c.y1-c.y0+12);
    for(let y=c.y0-6;y<c.y1+6;y+=3){ctx.fillStyle=V.netT>0?"#ffe070":((y/3|0)%2?"#f4f4f4":"#9aa4bd");ctx.fillRect(nx-1,y,2,3)}
    ctx.fillStyle="#222";ctx.fillRect(nx-2,c.y0-9,4,5);ctx.fillRect(nx-2,c.y1+4,4,5);
    FX.draw(FX.under);
    const dB=()=>{const s=1-Math.min(B.z,40)/110;ctx.fillStyle="rgba(0,0,0,.35)";ctx.beginPath();ctx.ellipse(Math.round(B.x),Math.round(B.y),5*s,2*s+.6,0,0,7);ctx.fill();
      for(let i=0;i<B.tr.length;i++){ctx.globalAlpha=(i+1)/B.tr.length*.35;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(B.tr[i][0],B.tr[i][1]-7,2.5,0,7);ctx.fill()}ctx.globalAlpha=1;
      ctx.save();ctx.translate(Math.round(B.x),Math.round(B.y-B.z-7));ctx.rotate(B.rot);ctx.drawImage(BALLS[this.ballSkin],-8,-8);ctx.restore()};
    const all=[...V.team.L,...V.team.R],cp=V.autoL?null:V.team.L[V.ctrl];
    [...all.map(q=>[q.foot()[1],()=>q.draw()]),[B.y,dB]].sort((a,b)=>a[0]-b[0]).forEach(o=>o[1]());
    if(cp){const f=cp.foot(),bob=Math.sin(this.t/6)*1.5;ctx.strokeStyle="#ffe070";ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(f[0],f[1],13,5,0,0,7);ctx.stroke();   // jugador que controlas
      const m=cp.sp.meta(cp.anim.name,cp.dir,cp.anim.frame),hy=f[1]-(m.shadow[1]-m.head[1])*VB.sc-8+bob;ctx.fillStyle="#ffe070";ctx.beginPath();ctx.moveTo(cp.pos[0]-4,hy-5);ctx.lineTo(cp.pos[0]+4,hy-5);ctx.lineTo(cp.pos[0],hy);ctx.closePath();ctx.fill()}
    FX.draw(FX.over);ctx.restore();this.vignette();
    // marcador: caras de cada equipo (la tuya resalta al jugador que controlas)
    for(const [s,x0,col] of [["L",6,"#3c78ff"],["R",W-6,"#ff4a4a"]]){const L=s==="L",T=V.team[s],n=T.length;
      T.forEach((q,i)=>{const x=L?x0+i*18:x0-18*n+i*18,on=L&&!V.autoL&&q.i===V.ctrl;ctx.fillStyle=on?"#ffe070":col;ctx.fillRect(x-1,3,16,16);ctx.fillStyle="#10131c";ctx.fillRect(x,4,14,14);this.face(PIC[q.kind].normal,x,4,14,14)});
      const used=B.lastSide===s&&B.state==="play"?V.touches:0,bx=L?x0:x0-21;
      for(let i=0;i<3;i++){ctx.fillStyle=i<3-used?"#ffe070":"#39425f";ctx.fillRect(bx+i*7,22,5,5)}
      if(B.state==="serve"&&B.server===s)this.text("SAQUE",L?x0+25:x0-26,22,"#7aff90",L?"left":"right",3.6);
      if(L&&!V.autoL)this.text(KINDS[T[V.ctrl].kind].name+" · cambio auto "+(V.autoSw?"SÍ":"NO"),x0,30,"#fff","left",3.6)}
    this.text(V.score.L+" - "+V.score.R,W/2,3,"#ffe070","center",16);this.text("a "+VB.target+" · "+V.team.L.length+" vs "+V.team.R.length,W/2,22,"#aab4d6","center",3.4);
    if(V.msg&&V.dead<90){const w=V.msg.side==="L";this.ta=Math.min(1,V.dead/6,(90-V.dead)/14);this.text(w?"¡PUNTO PARA TI!":"PUNTO DEL RIVAL",W/2,72,w?"#7aff90":"#ff7a6a","center",9);this.text(V.msg.text,W/2,86,"#fff","center",5);this.ta=1}
    if(V.tx){this.ta=Math.min(1,(50-V.tx.t)/12);this.text(V.tx.text,W/2,40,"#ffe070","center",6);this.ta=1}
    if(B.state==="serve"&&B.server==="L"&&!V.autoL)this.text("Z saque suave  ·  X saque fuerte (puede rozar la red)",W/2,H-50,"#fff","center",3.8);
    if(V.over&&V.dead>25){this.text(V.over==="L"?"¡VICTORIA!":"DERROTA",W/2,100,V.over==="L"?"#7aff90":"#ff7a6a","center",15);if(V.dead>70)this.text("Z / Enter: otra vez   ·   Esc: equipos",W/2,124,"#fff","center",4.2)}
    // minimapa
    const mx=W-86,my=H-42,k=80/VB.ww;ctx.fillStyle="rgba(10,14,26,.7)";ctx.fillRect(mx-1,my-1,82,VB.wh*k+2);ctx.fillStyle="rgba(219,165,94,.75)";ctx.fillRect(mx+c.x0*k,my+c.y0*k,(c.x1-c.x0)*k,(c.y1-c.y0)*k);
    ctx.fillStyle="#fff";ctx.fillRect(mx+nx*k,my+c.y0*k,1,(c.y1-c.y0)*k);
    for(const q of all){ctx.fillStyle=q.side==="L"?(cp&&q===cp?"#ffe070":"#7aa8ff"):"#ff7a6a";ctx.fillRect(Math.round(mx+q.pos[0]*k)-1,Math.round(my+q.pos[1]*k)-1,3,3)}
    ctx.fillStyle="#fff";ctx.fillRect(Math.round(mx+B.x*k)-1,Math.round(my+(B.y-B.z*.3)*k)-1,3,3);ctx.strokeStyle="rgba(255,255,255,.6)";ctx.strokeRect(mx+C.x*k+.5,my+C.y*k+.5,W*k,H*k);
    this.chips(V.team.L.length>1?[["Z","Pase"],["X","Remate"],["C","Colocar"],["V","Cambiar"],["B","Auto"]]:[["Z","Pase"],["X","Remate"],["C","Colocar"]],W/2-46,H-8,.7);
    if(this.t<420)this.panelBox(["Flechas: moverte; mantén una dirección al golpear para apuntar","Z pase · C colocar (↑/↓ elige rematador) · X remate · V cambiar jugador · B cambio auto","Tus compañeros juegan solos; tú controlas al marcado · 3 toques, nadie toca dos seguidas"],W/2-34,H-15,Math.min(1,(420-this.t)/50))}
});
