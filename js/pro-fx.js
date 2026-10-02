/* SwiftSupply presentation FX + higher-fidelity native Three.js Monster Zero Ultra model. */
(()=>{
  const $=s=>document.querySelector(s), clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.dataset.proPage=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';

  if(!$('#sp-progress')){const b=document.createElement('div');b.id='sp-progress';document.body.appendChild(b)}
  const bar=$('#sp-progress'),hdr=$('.site-header'),mz=$('#mz'),lowerWrap=$('.mz-model-wrap'),steps=[...document.querySelectorAll('.mz-copy div')];
  let lowerProgress=0;
  function onScroll(){
    const sy=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform=`scaleX(${h?sy/h:0})`;
    hdr?.classList.toggle('scrolled',sy>30);
    if(mz){
      const r=mz.getBoundingClientRect();
      lowerProgress=clamp(-r.top/Math.max(1,r.height-innerHeight));
      mz.style.setProperty('--p',lowerProgress);
      if(lowerWrap&&!reduce){
        const y=(.5-lowerProgress)*3.2,s=.92+Math.sin(lowerProgress*Math.PI)*.11;
        lowerWrap.style.transform=`translate3d(0,${y}vh,0) scale(${s})`;
      }
      const i=Math.min(steps.length-1,Math.floor(lowerProgress*steps.length));
      steps.forEach((x,k)=>x.classList.toggle('on',k===i&&lowerProgress>.015));
    }
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -36px 0px'});
    const watch=()=>document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible)').forEach(el=>io.observe(el));
    watch();new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
  }

  const tilt='.home-brand-card,.product-card,.home-feature,.pw-service,.about-pro-card';
  document.addEventListener('pointermove',e=>{
    if(reduce||matchMedia('(pointer: coarse)').matches)return;
    const c=e.target.closest?.(tilt);if(!c)return;
    const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`perspective(950px) rotateX(${-y*4.5}deg) rotateY(${x*5.5}deg) translateY(-3px)`;
  });
  document.addEventListener('pointerout',e=>{const c=e.target.closest?.(tilt);if(c)c.style.transform=''});

  const intro=$('#intro'),introProgress=$('#introProgress');
  let introDone=false;
  function finishIntro(){if(introDone)return;introDone=true;if(introProgress)introProgress.style.width='100%';setTimeout(()=>{intro?.classList.add('done');document.body.classList.add('ready')},180)}
  if(introProgress)introProgress.style.width='18%';
  if(!window.THREE||!$('#monsterHeroCanvas')){finishIntro();return}
  const THREE=window.THREE;

  function rng(seed=1234567){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
  function clawPath(ctx,cx,cy,s){
    const draw=(dx,pts)=>{ctx.beginPath();pts.forEach((p,i)=>{const x=cx+(dx+p[0])*s,y=cy+p[1]*s;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill();ctx.stroke()};
    draw(-92,[[-16,-92],[0,-105],[17,-96],[9,-55],[18,-18],[6,22],[14,64],[-1,111],[-10,62],[-4,21],[-15,-19],[-7,-56]]);
    draw(0,[[-17,-108],[1,-120],[18,-108],[9,-62],[18,-20],[7,28],[15,79],[-1,135],[-11,80],[-4,27],[-16,-20],[-7,-62]]);
    draw(91,[[-16,-88],[0,-101],[17,-90],[8,-49],[17,-12],[5,25],[13,62],[-2,104],[-10,63],[-4,24],[-15,-12],[-7,-49]]);
  }
  function makeCanTextures(){
    const W=2048,H=1024,cv=document.createElement('canvas'),bp=document.createElement('canvas');cv.width=bp.width=W;cv.height=bp.height=H;
    const c=cv.getContext('2d'),b=bp.getContext('2d'),random=rng(42);
    c.fillStyle='#f7f8f8';c.fillRect(0,0,W,H);b.fillStyle='#777';b.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=2){const a=.018+random()*.022;c.fillStyle=`rgba(70,78,84,${a})`;c.fillRect(x,0,1,H)}
    const filigree=(ctx,color,alpha)=>{
      ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=alpha;ctx.lineWidth=2;
      for(let k=0;k<90;k++){
        const sx=random()*W,sy=random()*H,rad=20+random()*80,turn=(random()>.5?1:-1);
        ctx.beginPath();
        for(let j=0;j<36;j++){
          const t=j/35*Math.PI*2.1,rr=rad*(.22+j/42),x=sx+Math.cos(t*turn+k)*rr,y=sy+Math.sin(t*turn+k)*rr*.62;
          j?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.stroke();
      }
      ctx.restore();
    };
    filigree(c,'#7f8589',.21);filigree(b,'#b8b8b8',.32);
    c.fillStyle='#11151a';c.font='800 36px Arial';c.textAlign='center';
    for(const x of [256,768,1280,1792])c.fillText('+  ZERO SUGAR  +',x,62);
    const fx=512;c.save();c.translate(fx,0);
    const grd=c.createLinearGradient(-130,230,130,540);grd.addColorStop(0,'#f8fafb');grd.addColorStop(.34,'#6d747a');grd.addColorStop(.53,'#eceff1');grd.addColorStop(1,'#565e65');
    c.fillStyle=grd;c.strokeStyle='#111';c.lineWidth=9;clawPath(c,0,382,1.22);
    c.fillStyle='#0d1115';c.strokeStyle='transparent';c.font='900 72px Georgia,serif';c.textAlign='center';c.fillText('MONSTER',0,710);
    c.fillStyle='#43bce9';c.font='800 39px Arial';c.fillText('E N E R G Y',0,765);
    c.fillStyle='#111';c.font='900 36px Arial';c.fillText('ZERO ULTRA',0,825);
    c.fillStyle='#333';c.font='700 17px Arial';c.fillText('ENERGY DRINK     16 FL OZ (473 mL)',0,972);c.restore();
    const bx=1536;c.save();c.translate(bx-210,130);c.fillStyle='rgba(255,255,255,.96)';c.strokeStyle='#0c0c0c';c.lineWidth=6;rounded(c,0,0,420,760,10);c.fill();c.stroke();
    c.fillStyle='#111';c.textAlign='left';c.font='900 34px Arial';c.fillText('MONSTER',20,43);c.font='700 16px Arial';c.fillText('ENERGY · ZERO ULTRA',20,67);c.lineWidth=4;c.beginPath();c.moveTo(15,84);c.lineTo(405,84);c.stroke();
    c.font='900 42px Arial';c.fillText('Nutrition Facts',18,129);c.font='700 18px Arial';c.fillText('Serving size 1 can',18,156);c.lineWidth=5;c.beginPath();c.moveTo(15,172);c.lineTo(405,172);c.stroke();c.font='900 35px Arial';c.fillText('Calories                         10',18,211);
    const rows=['Total Fat 0g                     0%','Sodium 360mg                 16%','Total Carbohydrate 3g        1%','Total Sugars 0g','Includes 0g Added Sugars      0%','Protein 0g','Niacin (Vit. B3)             250%','Vitamin B6                   240%','Vitamin B12                  490%','Taurine                     1000mg','Caffeine                     160mg'];c.font='700 16px Arial';let ry=248;for(const row of rows){c.fillText(row,18,ry);ry+=33;c.lineWidth=1;c.beginPath();c.moveTo(15,ry-22);c.lineTo(405,ry-22);c.stroke()}
    c.fillStyle='#111';for(let i=0;i<30;i++){const xx=24+i*12,w=i%4===0?7:i%3===0?4:2;c.fillRect(xx,630,w,90)}c.font='700 13px Arial';c.fillText('0 70847 81147 3',110,740);c.restore();
    c.save();c.fillStyle='#333';c.font='700 15px Arial';c.textAlign='center';c.translate(1015,850);c.rotate(-Math.PI/2);c.fillText('TAURINE · GINSENG · L-CARNITINE · CAFFEINE',0,0);c.restore();
    c.save();c.fillStyle='#333';c.font='700 15px Arial';c.textAlign='center';c.translate(22,850);c.rotate(Math.PI/2);c.fillText('SERVE COLD · RECYCLE · MONSTER ENERGY',0,0);c.restore();
    const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=THREE.RepeatWrapping;tex.anisotropy=8;
    const bump=new THREE.CanvasTexture(bp);bump.wrapS=THREE.RepeatWrapping;bump.anisotropy=4;
    return {map:tex,bump};
  }
  function makeTabShape(){
    const s=new THREE.Shape();
    s.moveTo(-.32,-.52);s.quadraticCurveTo(-.48,-.28,-.38,.06);s.quadraticCurveTo(-.31,.43,0,.50);s.quadraticCurveTo(.31,.43,.38,.06);s.quadraticCurveTo(.48,-.28,.32,-.52);s.quadraticCurveTo(0,-.68,-.32,-.52);
    const h=new THREE.Path();h.absellipse(0,.08,.16,.21,0,Math.PI*2,false,0);s.holes.push(h);
    return new THREE.ExtrudeGeometry(s,{depth:.045,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:3,curveSegments:32});
  }
  function buildCan(){
    const G=new THREE.Group(),{map,bump}=makeCanTextures();
    const bodyMat=new THREE.MeshPhysicalMaterial({map,bumpMap:bump,bumpScale:.018,metalness:.34,roughness:.24,clearcoat:.9,clearcoatRoughness:.13,reflectivity:.82});
    const metal=new THREE.MeshPhysicalMaterial({color:0xd7dade,metalness:1,roughness:.17,clearcoat:.72,clearcoatRoughness:.09});
    const dark=new THREE.MeshPhysicalMaterial({color:0x181a1e,metalness:.82,roughness:.22,clearcoat:.45});
    const pts=[new THREE.Vector2(1.19,-3.02),new THREE.Vector2(1.26,-2.98),new THREE.Vector2(1.31,-2.86),new THREE.Vector2(1.345,-2.65),new THREE.Vector2(1.345,2.55),new THREE.Vector2(1.33,2.68),new THREE.Vector2(1.28,2.82),new THREE.Vector2(1.19,2.94)];
    const body=new THREE.Mesh(new THREE.LatheGeometry(pts,128),bodyMat);body.rotation.y=Math.PI/2;body.castShadow=true;body.receiveShadow=true;G.add(body);
    const topRim=new THREE.Mesh(new THREE.TorusGeometry(1.19,.065,22,128),metal);topRim.rotation.x=Math.PI/2;topRim.position.y=2.99;G.add(topRim);
    const lid=new THREE.Mesh(new THREE.CylinderGeometry(1.13,1.13,.06,128),metal);lid.position.y=2.955;G.add(lid);
    const lidGroove=new THREE.Mesh(new THREE.TorusGeometry(.88,.025,14,100),dark);lidGroove.rotation.x=Math.PI/2;lidGroove.position.y=2.992;G.add(lidGroove);
    const opening=new THREE.Mesh(new THREE.CircleGeometry(.19,50),new THREE.MeshPhysicalMaterial({color:0x090a0c,metalness:.4,roughness:.18}));opening.rotation.x=-Math.PI/2;opening.scale.set(1.45,.72,1);opening.position.set(0,2.996,-.33);G.add(opening);
    const rivet=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.035,40),metal);rivet.position.set(0,3.018,.12);G.add(rivet);
    const tab=new THREE.Mesh(makeTabShape(),dark);tab.scale.set(.78,.78,.78);tab.rotation.x=-Math.PI/2;tab.position.set(0,3.02,.16);G.add(tab);
    const bottomRim=new THREE.Mesh(new THREE.TorusGeometry(1.18,.055,20,128),metal);bottomRim.rotation.x=Math.PI/2;bottomRim.position.y=-3.02;G.add(bottomRim);
    const base=new THREE.Mesh(new THREE.CylinderGeometry(1.10,1.16,.06,128),metal);base.position.y=-3.00;G.add(base);
    const baseInset=new THREE.Mesh(new THREE.CircleGeometry(.83,96),new THREE.MeshPhysicalMaterial({color:0xbfc4c8,metalness:1,roughness:.22}));baseInset.rotation.x=Math.PI/2;baseInset.position.y=-3.035;G.add(baseInset);
    const baseGroove=new THREE.Mesh(new THREE.TorusGeometry(.85,.025,12,96),dark);baseGroove.rotation.x=Math.PI/2;baseGroove.position.y=-3.04;G.add(baseGroove);
    const dropGeo=new THREE.SphereGeometry(.032,10,8),dropMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.05,metalness:0,transmission:.95,thickness:.08,transparent:true,opacity:.72,ior:1.33});
    const drops=new THREE.InstancedMesh(dropGeo,dropMat,90),dummy=new THREE.Object3D(),random=rng(911);
    for(let i=0;i<90;i++){const a=random()*Math.PI*2,y=-2.48+random()*4.96,r=1.356,s=.35+random()*1.45;dummy.position.set(Math.sin(a)*r,y,Math.cos(a)*r);dummy.rotation.set(0,a,0);dummy.scale.set(s*.72,s*1.1,s*.48);dummy.updateMatrix();drops.setMatrixAt(i,dummy.matrix)}
    drops.instanceMatrix.needsUpdate=true;G.add(drops);G.rotation.z=-.035;return G;
  }
  function makeScene(canvas){
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(31,1,.1,100);camera.position.set(0,.05,12.4);scene.add(new THREE.HemisphereLight(0xffffff,0x0d1015,1.5));
    const key=new THREE.RectAreaLight(0xffffff,10,4.5,7);key.position.set(-4.4,2.4,5.5);key.lookAt(0,0,0);scene.add(key);
    const fill=new THREE.RectAreaLight(0xddeeff,5,3,6);fill.position.set(4,-1.5,3);fill.lookAt(0,0,0);scene.add(fill);
    const gold=new THREE.RectAreaLight(0xf6c84c,7,2.5,5.5);gold.position.set(3.3,2.5,-4);gold.lookAt(0,0,0);scene.add(gold);
    const rim=new THREE.PointLight(0xf6c84c,16,14);rim.position.set(-3.6,-1.5,-4.5);scene.add(rim);
    const can=buildCan();scene.add(can);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(2.15,96),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.25,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.y=.42;shadow.position.y=-3.08;scene.add(shadow);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.55,.014,12,180),new THREE.MeshBasicMaterial({color:0xf6c84c,transparent:true,opacity:.26}));ring.rotation.x=1.08;scene.add(ring);
    let drag=false,lastX=0,spin=0,px=0,py=0;
    canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture?.(e.pointerId)});
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5;if(drag){spin+=(e.clientX-lastX)*.010;lastX=e.clientX}});
    const stop=e=>{drag=false;try{canvas.releasePointerCapture?.(e.pointerId)}catch{}};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
    function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
    return {renderer,scene,camera,can,ring,rim,resize,getPointer:()=>({px,py}),getSpin:()=>spin};
  }
  try{
    if(introProgress)introProgress.style.width='64%';
    const hero=makeScene($('#monsterHeroCanvas')),lower=makeScene($('#monsterScrollCanvas'));
    if(introProgress)introProgress.style.width='92%';
    const start=performance.now();
    (function frame(){
      const t=(performance.now()-start)/1000;hero.resize();lower.resize();const hp=hero.getPointer();
      if(!reduce){hero.can.rotation.y=t*.34+hero.getSpin()+hp.px*.44;hero.can.rotation.x=hp.py*.11+Math.sin(t*.72)*.018;hero.can.position.y=Math.sin(t*.82)*.065;hero.ring.rotation.z=t*.075}
      hero.rim.intensity=15+Math.sin(t*1.5)*2;hero.renderer.render(hero.scene,hero.camera);
      lower.can.rotation.y=lowerProgress*Math.PI*4.2+t*(reduce?0:.055)+lower.getSpin();lower.can.rotation.x=Math.sin(lowerProgress*Math.PI*2)*.07;lower.ring.rotation.z=-lowerProgress*Math.PI*1.8;lower.renderer.render(lower.scene,lower.camera);requestAnimationFrame(frame)
    })();finishIntro();
  }catch(e){console.error('Monster 3D setup failed',e);finishIntro()}
})();
