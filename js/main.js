// Arranque: carga de recursos y bucle a 60 fps.
"use strict";
// Space también cuenta como "pause" en el visor; en el juego no hace nada.
loadAll().then(()=>{G.init();window.__G=G;let last=performance.now(),acc=0;
  (function loop(now){acc+=Math.min(now-last,100);last=now;
    while(acc>=1000/60){G.update(held,pressed);pressed=new Set();acc-=1000/60}
    G.draw();requestAnimationFrame(loop)})(last)});
