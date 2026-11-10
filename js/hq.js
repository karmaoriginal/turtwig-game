// Capa HQ: carga los sprites de assets_hq/ (4x, Scale2x) y los dibuja al tamaño lógico original,
// así el resto del código (coordenadas, atlas, width/height) sigue igual. Desactivar: añadir ?hq=0 a la URL.
(()=>{
  const K=4;
  if(/[?&]hq=0\b/.test(location.search))return;
  // solo lo que se ve ampliado en pantalla (retratos, pelotas, entrenadores, personajes de la historia)
  const OK=/^assets\/((?:portraits|balls|trainers)\/.+|story\/(?:protagonist|npcs|pokeball|trainer_atlas))\.png$/;
  const P=HTMLImageElement.prototype,D=Object.getOwnPropertyDescriptor(P,"src");
  Object.defineProperty(P,"src",{configurable:true,enumerable:true,get:D.get,set(v){
    if(typeof v==="string"&&!this.__hq&&OK.test(v)){
      const orig=v;this.__hq=K;
      Object.defineProperty(this,"width",{configurable:true,get(){return this.naturalWidth/K}});
      Object.defineProperty(this,"height",{configurable:true,get(){return this.naturalHeight/K}});
      // si el HQ no carga, vuelve al original
      this.addEventListener("error",()=>{this.__hq=0;delete this.width;delete this.height;D.set.call(this,orig)},{once:true});
      v="assets_hq/"+v.slice(7)}
    D.set.call(this,v)}});
  const dI=CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage=function(im,...a){
    const k=im&&im.__hq;
    if(k){
      if(a.length===2)a.push(im.naturalWidth/k,im.naturalHeight/k);   // (img,x,y) -> tamaño lógico
      else if(a.length===8)for(let i=0;i<4;i++)a[i]*=k}               // (img,sx,sy,sw,sh,...) -> recorte en px HQ
    return dI.call(this,im,...a)};
})();
