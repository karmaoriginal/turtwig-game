// Ataques, tabla de tipos, movimientos de cada especie, evoluciones y lineas evolutivas.
"use strict";
// ---------------- ataques (anim, daño, dash=[frameIni,frameFin,velocidad])
const ATTACKS={
  atk1:{anim:"Attack",dmg:10,dash:["rush","hit",4],reach:12,radius:14,knock:3},
  atk2:{anim:"Swing", dmg:18,reach:12,radius:22,knock:4.5},
  atk3:{anim:"Shoot", dmg:8,projectile:true,speed:3.5,life:70},
  atk4:{anim:"Charge",dmg:14,dash:[2,"hit",5],reach:10,radius:16,knock:4},
  atk5:{anim:"Hop",   dmg:16,reach:0,radius:26,knock:3.5},
  atk6:{anim:"Rotate",dmg:12,reach:0,radius:22,knock:3.5},
};
// ---- Tipos (18), ventajas y especies (pokemondb). Cada movimiento tiene tipo, categoría (p físico / s especial), potencia real y efectos.
const TCH={normal:{rock:.5,ghost:0,steel:.5},fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2},water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5},
  electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5},
  ice:{fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5},fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},
  poison:{grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2},ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2},
  flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5},psychic:{fighting:2,poison:2,psychic:.5,dark:0,steel:.5},
  bug:{fire:.5,grass:2,fighting:.5,poison:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5},rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5},
  ghost:{normal:0,psychic:2,ghost:2,dark:.5},dragon:{dragon:2,steel:.5,fairy:0},dark:{fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5},
  steel:{fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2},fairy:{fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5}};
const SPTYPE={turtwig:["grass"],grotle:["grass"],torterra:["grass","ground"],ditto:["normal"],mimikyu:["ghost","fairy"],magikarp:["water"],gyarados:["water","flying"],
  mrmime:["psychic","fairy"],lickitung:["normal"],drifloon:["ghost","flying"],voltorb:["electric"],electrode:["electric"],charmander:["fire"],charmeleon:["fire"],charizard:["fire","flying"]};
const SOUNDPROOF=new Set(["mrmime","voltorb","electrode"]);   // Insonorizar
const typeMult=(ty,types)=>{let m=1;for(const t of types)m*=((TCH[ty]||{})[t]??1);return Math.min(3,m)};   // tope x3 (los x4 de los juegos son demasiado en tiempo real)
const SPECIAL_T=new Set(["fire","water","grass","electric","psychic","ice","dragon","dark"]);
const AT=ATTACKS,SLF={reach:0,radius:0,knock:0},PRJ=(speed=3.5,life=70)=>({anim:"Shoot",projectile:true,speed,life});
// mv(nombre, base de animación/alcance, tipo, potencia real, extras). dmg = potencia x .22 salvo que se indique. ai = papel del movimiento para el rival; cd = recarga en ticks.
// Balance: el daño se comprime con la potencia (los golpes fuertes ya no quitan media barra) y todos tienen más vida
const HPX=1.4,CD=pw=>Math.round(pw<=50?pw*.2:10+(pw-50)*.07);
const MV=(name,base,ty,pw,o={})=>({...base,name,ty,pw,dmg:CD(pw),cat:SPECIAL_T.has(ty)?"s":"p",...o});
const flailPow=r=>r>=.6875?20:r>=.3542?40:r>=.2083?80:r>=.1042?100:r>=.0417?150:200;   // Azote: más fuerte con poca vida (como en los juegos)
const MOVES={
  // Turtwig / Grotle / Torterra (Espesura: Planta +50% con menos de 1/3 de vida)
  turtwig:{atk1:MV("Placaje",AT.atk1,"normal",40,{ai:"dash"}),
    atk2:MV("Absorber",{...AT.atk2,radius:20,knock:2},"grass",20,{dmg:7,drain:.5,ai:"melee"}),
    atk3:MV("Hoja Afilada",PRJ(3.5,70),"grass",55,{cat:"p",crit:.2,cd:50,ai:"range"}),
    atk4:MV("Refugio",{anim:"Withdraw",...SLF},"normal",0,{guard:300,cd:600,ai:"self",on:"guardT"})},
  grotle:{atk1:MV("Placaje",AT.atk1,"normal",40,{ai:"dash"}),
    atk2:MV("Mordisco",{...AT.atk2,radius:20,knock:3},"dark",60,{cat:"p",flinch:.3,ai:"melee"}),
    atk3:MV("Hoja Afilada",PRJ(3.5,70),"grass",55,{cat:"p",crit:.2,cd:50,ai:"range"}),
    atk4:MV("Refugio",{anim:"Withdraw",...SLF},"normal",0,{guard:300,cd:600,ai:"self",on:"guardT"}),
    atk5:MV("Drenadoras",PRJ(2.8,80),"grass",0,{seed:1,acc:.9,cd:420,ai:"range",fon:"seedT"}),
    atk6:MV("Megaagotar",{...AT.atk5},"grass",40,{dmg:11,drain:.5,cd:150,ai:"area"})},
  torterra:{atk1:MV("Triturar",{...AT.atk2,radius:22,knock:4},"dark",80,{cat:"p",shred:.3,cd:40,ai:"melee"}),
    atk2:MV("Mazazo",{...AT.atk4,reach:12,radius:20,knock:5},"grass",120,{cat:"p",recoil:.33,cd:200,ai:"dash"}),
    atk3:MV("Lluevehojas",PRJ(4,90),"grass",130,{after:{atk:.7,t:480,min:.5},cd:300,ai:"range"}),
    atk4:MV("Refugio",{anim:"Withdraw",...SLF},"normal",0,{guard:300,cd:600,ai:"self",on:"guardT"}),
    atk5:MV("Terremoto",{...AT.atk5,radius:42,knock:5},"ground",100,{cat:"p",cd:180,ai:"area"}),
    atk6:MV("Síntesis",{anim:"Hop",...SLF},"grass",0,{heal:.3,cd:1200,ai:"heal"})},
  // Ditto (Flexibilidad: inmune a parálisis; Impostor: empieza ya transformado). Su único movimiento propio es Forcejeo (se hiere).
  ditto:{atk1:MV("Forcejeo",AT.atk1,"normal",50,{selfHp:.04,ai:"dash"})},
  // Mimikyu (Disfraz)
  mimikyu:{atk1:MV("Sombra Vil",{...AT.atk1,dash:["rush","hit",5]},"ghost",40,{cat:"p",ai:"dash"}),
    atk2:MV("Garra Umbría",{anim:"Strike",reach:12,radius:22,knock:3},"ghost",70,{cat:"p",crit:.3,ai:"melee"}),
    atk3:MV("Bola Sombra",PRJ(3.5,70),"ghost",80,{cat:"s",shred:.2,cd:90,ai:"range"}),
    atk4:MV("Mazazo",{...AT.atk4,reach:12,radius:20,knock:5},"grass",120,{cat:"p",recoil:.33,cd:240,ai:"dash"}),
    atk5:MV("Carantoña",{...AT.atk5,radius:28},"fairy",90,{cat:"p",acc:.9,cd:120,ai:"area"}),
    atk6:MV("Danza Espada",{anim:"Double",...SLF},"normal",0,{boost:{atk:1.5,t:720,cap:2},cd:900,ai:"self",on:"bT"})},
  // Magikarp: Placaje flojo, Azote (Flail) y Salpicadura. Nerviosismo: +velocidad si lo golpea Bicho/Fantasma/Siniestro
  magikarp:{atk1:MV("Placaje",AT.atk1,"normal",40,{dmg:14,ai:"dash"}),
    atk2:MV("Azote",{anim:"Swing",reach:12,radius:22,knock:3},"normal",0,{flail:true,dmg:0,ai:"melee"}),
    atk5:MV("Salpicadura",{anim:"Hop",...SLF},"water",0,{splash:true,dmg:0,ai:"idle"})},
  // Gyarados (Intimidación: el rival hace -20% de daño)
  gyarados:{atk1:MV("Mordisco",{...AT.atk1,reach:16,radius:18},"dark",60,{cat:"p",flinch:.3,ai:"dash"}),
    atk2:MV("Cascada",{...AT.atk2,radius:30},"water",80,{cat:"p",flinch:.2,cd:60,ai:"melee"}),
    atk3:MV("Hidrobomba",PRJ(4,90),"water",110,{acc:.8,cd:150,ai:"range"}),
    atk4:MV("Hiperrayo",{anim:"RearUp",projectile:true,speed:4,life:90,lock:90},"normal",150,{cat:"s",cd:480,ai:"range"}),
    atk5:MV("Danza Dragón",{anim:"Double",...SLF},"dragon",0,{boost:{atk:1.25,spd:1.2,t:720,cap:2},cd:900,ai:"self",on:"bT"}),
    atk6:MV("Pataleta",{...AT.atk6,radius:30,knock:4},"normal",120,{cat:"p",selfConf:.5,cd:300,ai:"area"})},
  // Mr. Mime (Técnico: golpes de potencia <=60 +50%; Filtro: súper eficaz -25%; Insonorizar: inmune a sonido)
  mrmime:{atk1:MV("Placaje",{...AT.atk1,knock:2},"normal",40,{ai:"dash"}),
    atk2:MV("Confusión",{...AT.atk2,radius:24},"psychic",50,{confuse:.25,ai:"melee"}),
    atk3:MV("Psíquico",PRJ(3.8,80),"psychic",90,{shred:.2,cd:120,ai:"range"}),
    atk4:MV("Pantalla de Luz",{anim:"Hop",...SLF},"psychic",0,{light:420,cd:600,ai:"self",on:"lightT"}),
    atk5:MV("Reflejo",{anim:"Hop",...SLF},"psychic",0,{reflect:420,cd:600,ai:"self",on:"reflT"}),
    atk6:MV("Barrera",{anim:"Charge",...SLF},"psychic",0,{barrier:true,cd:540,ai:"self",on:"shield"})},
  // Lickitung (Ritmo Propio: inmune a la confusión)
  lickitung:{atk1:MV("Lengüetazo",{anim:"Lick",dash:["rush","hit",1.2],reach:20,radius:18,knock:2},"ghost",30,{cat:"p",dmg:9,para:.3,ai:"dash"}),
    atk2:MV("Atizar",{...AT.atk2,radius:26,knock:5},"normal",80,{acc:.75,cd:60,ai:"melee"}),
    atk3:MV("Supersónico",PRJ(3,80),"normal",0,{sound:true,confuse:1,acc:.6,cd:240,ai:"range",fon:"confT"}),
    atk4:MV("Pisotón",{...AT.atk4,radius:20},"normal",65,{flinch:.3,cd:60,ai:"dash"}),
    atk5:MV("Constricción",{...AT.atk5,radius:30,knock:0},"normal",15,{dmg:3,wrap:150,cd:360,ai:"area",fon:"wrapT"}),
    atk6:MV("Rodar",{...AT.atk6,radius:24},"rock",30,{cat:"p",dmg:9,ramp:true,cd:20,ai:"area"})},
  // Drifloon (Postrero: daña a quien lo derrote; Impulso Ardiente: +50% si está quemado)
  drifloon:{atk1:MV("Impresionar",{...AT.atk1,knock:2.5},"ghost",30,{cat:"p",dmg:9,flinch:.3,ai:"dash"}),
    atk2:MV("Maleficio",{...AT.atk2,radius:24},"ghost",65,{cat:"s",hex:true,cd:60,ai:"melee"}),
    atk3:MV("Bola Sombra",PRJ(3.2,80),"ghost",80,{cat:"s",shred:.2,cd:90,ai:"range"}),
    atk4:MV("Fuego Fatuo",{anim:"Charge",projectile:true,speed:2.6,life:90,col:"#5ab4ff"},"fire",0,{burn:1,acc:.85,cd:300,ai:"range",fon:"burnT"}),
    atk5:MV("Autodestrucción",{anim:"Swell",boom:true,hitAt:7,reach:0,radius:40,knock:7},"normal",200,{cat:"p",dmg:28,ai:"suicide"}),
    atk6:MV("Mismo Destino",{anim:"Double",...SLF},"ghost",0,{bond:true,cd:900,ai:"bond"})},
  // Charmander / Charmeleon / Charizard (Mar Llamas: Fuego +50% con menos de 1/3 de vida; los tipo Fuego no se queman)
  charmander:{atk1:MV("Arañazo",AT.atk1,"normal",40,{ai:"dash"}),
    atk2:MV("Ascuas",PRJ(3.5,70),"fire",40,{burn:.1,cd:40,ai:"range"}),
    atk3:MV("Colmillo Ígneo",{...AT.atk2,radius:20,knock:3},"fire",65,{cat:"p",acc:.95,burn:.1,flinch:.1,ai:"melee"}),
    atk4:MV("Pantalla de Humo",PRJ(3,70),"normal",0,{blind:360,cd:420,ai:"range",fon:"blindT"})},
  charmeleon:{atk1:MV("Arañazo",AT.atk1,"normal",40,{ai:"dash"}),
    atk2:MV("Ascuas",PRJ(3.5,70),"fire",40,{burn:.1,cd:40,ai:"range"}),
    atk3:MV("Aliento Dragón",PRJ(3.5,70),"dragon",60,{para:.3,cd:80,ai:"range"}),
    atk4:MV("Colmillo Ígneo",{...AT.atk2,radius:22,knock:3},"fire",65,{cat:"p",acc:.95,burn:.1,flinch:.1,ai:"melee"}),
    atk5:MV("Giro Ígneo",PRJ(3,80),"fire",35,{wrap:150,acc:.85,cd:300,ai:"range",fon:"wrapT"}),
    atk6:MV("Pantalla de Humo",PRJ(3,70),"normal",0,{blind:360,cd:420,ai:"range",fon:"blindT"})},
  charizard:{atk1:MV("Garra Dragón",{...AT.atk2,reach:14,radius:26,knock:4},"dragon",80,{cat:"p",ai:"melee"}),
    atk2:MV("Tajo",{anim:"Strike",reach:14,radius:26,knock:3},"normal",70,{cat:"p",crit:.35,ai:"melee"}),
    atk3:MV("Lanzallamas",PRJ(4,80),"fire",90,{burn:.1,cd:60,ai:"range"}),
    atk4:MV("Envite Ígneo",{...AT.atk4,reach:14,radius:22,knock:5},"fire",120,{cat:"p",recoil:.33,burn:.1,cd:240,ai:"dash"}),
    atk5:MV("Carga Dragón",{...AT.atk5,radius:32,knock:5},"dragon",100,{cat:"p",acc:.75,flinch:.2,cd:180,ai:"area"}),
    atk6:MV("Ataque Ala",{...AT.atk6,radius:30},"flying",60,{cat:"p",cd:40,ai:"area"})},
  // Voltorb (Estática: 30% de paralizar a quien lo golpea cuerpo a cuerpo; Insonorizar: inmune a sonido)
  voltorb:{atk1:MV("Placaje",AT.atk1,"normal",40,{ai:"dash"}),
    atk2:MV("Chispa",{...AT.atk2,radius:24,knock:3},"electric",65,{para:.3,ai:"melee"}),
    atk3:MV("Bola Voltio",PRJ(3.4,80),"electric",75,{cd:90,ai:"range"}),
    atk4:MV("Rodar",{...AT.atk6,radius:24},"rock",30,{cat:"p",dmg:9,ramp:true,cd:20,ai:"area"}),
    atk5:MV("Chirrido",PRJ(3.2,80),"normal",0,{sound:true,shred:1,acc:.85,cd:240,ai:"range",fon:"shredT"}),
    atk6:MV("Autodestrucción",{anim:"Double",boom:true,hitAt:13,reach:0,radius:40,knock:7},"normal",200,{cat:"p",dmg:26,ai:"suicide"})},
  // Electrode: más rápido y fuerte. Explosión: más radio y daño que Autodestrucción
  electrode:{atk1:MV("Placaje",AT.atk1,"normal",40,{ai:"dash"}),
    atk2:MV("Chispa",{...AT.atk2,radius:24,knock:3},"electric",65,{para:.3,ai:"melee"}),
    atk3:MV("Rayo",PRJ(4.2,80),"electric",90,{para:.1,cd:100,ai:"range"}),
    atk4:MV("Pantalla de Luz",{anim:"Hop",...SLF},"psychic",0,{light:420,cd:600,ai:"self",on:"lightT"}),
    atk5:MV("Chirrido",PRJ(3.2,80),"normal",0,{sound:true,shred:1,acc:.85,cd:240,ai:"range",fon:"shredT"}),
    atk6:MV("Explosión",{anim:"Double",boom:true,hitAt:13,reach:0,radius:50,knock:8},"normal",250,{cat:"p",dmg:32,ai:"suicide"})}};
// Evolución: haces EVO.dealt de daño al rival y te quedas con <= EVO.hpFrac de tu vida
const STAGES=["turtwig","grotle","torterra"];
const EVO=[   // EVO[n] = requisitos y stats para pasar de la etapa n a la n+1 (el daño hecho es acumulado)
  {dealt:60, hpFrac:.35,heal:50,maxhp:140,dmg:1.35,speed:1.15,rad:1},
  {dealt:150,hpFrac:.35,heal:70,maxhp:200,dmg:1.8, speed:1.0, rad:3}];
// Magikarp: EXP = daño hecho + daño recibido (nivel 20 en los juegos). Evoluciona a Gyarados al llegar a xp (sin importar la vida).
// dmg:6 sobre su 0.3 base = x1.8 (como Torterra); speed .8*1.45; Intimidación baja el daño del rival al evolucionar.
const EVO_MK=[{xp:30,heal:60,maxhp:220,dmg:6,speed:1.45,rad:6}];
// Voltorb: EXP = daño hecho + recibido; evoluciona a Electrode (como en los juegos, por nivel)
const EVO_VT=[{xp:35,heal:45,maxhp:110,dmg:1.2,speed:1.22,rad:1}];
// Charmander: Charmeleon al nivel 16 y Charizard al 36 (pokemondb). EXP = daño hecho + recibido (40 y 110).
const EVO_CH=[{xp:40,heal:45,maxhp:130,dmg:1.3,speed:1.05,rad:1},{xp:110,heal:60,maxhp:180,dmg:1.7,speed:1.1,rad:3}];
const LINE={turtwig:STAGES,magikarp:["magikarp","gyarados"],voltorb:["voltorb","electrode"],charmander:["charmander","charmeleon","charizard"]},EVOS={turtwig:EVO,magikarp:EVO_MK,voltorb:EVO_VT,charmander:EVO_CH};
