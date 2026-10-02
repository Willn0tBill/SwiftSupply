/* SwiftSupply presentation FX + clean native Three.js Monster Zero Ultra product model. */
(()=>{
  const $=s=>document.querySelector(s);
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.dataset.proPage=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';

  if(!$('#sp-progress')){const el=document.createElement('div');el.id='sp-progress';document.body.appendChild(el)}
  const bar=$('#sp-progress'),hdr=$('.site-header'),mz=$('#mz'),lowerWrap=$('.mz-model-wrap'),steps=[...document.querySelectorAll('.mz-copy div')];
  let lowerProgress=0;

  function updateScroll(){
    const sy=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform=`scaleX(${h?sy/h:0})`;
    hdr?.classList.toggle('scrolled',sy>30);
    if(!mz)return;
    const r=mz.getBoundingClientRect();
    lowerProgress=clamp(-r.top/Math.max(1,r.height-innerHeight));
    mz.style.setProperty('--p',lowerProgress);
    if(lowerWrap&&!reduce){
      const y=(.5-lowerProgress)*2.4,s=.95+Math.sin(lowerProgress*Math.PI)*.08;
      lowerWrap.style.transform=`translate3d(0,${y}vh,0) scale(${s})`;
    }
    const i=Math.min(steps.length-1,Math.floor(lowerProgress*steps.length));
    steps.forEach((step,k)=>step.classList.toggle('on',k===i&&lowerProgress>.015));
  }
  addEventListener('scroll',updateScroll,{passive:true});updateScroll();

  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}}),{threshold:.1,rootMargin:'0px 0px -36px 0px'});
    const watch=()=>document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible)').forEach(el=>io.observe(el));
    watch();new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
  }

  const tiltSelector='.home-brand-card,.product-card,.home-feature,.pw-service,.about-pro-card';
  document.addEventListener('pointermove',e=>{
    if(reduce||matchMedia('(pointer: coarse)').matches)return;
    const c=e.target.closest?.(tiltSelector);if(!c)return;
    const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`perspective(950px) rotateX(${-y*4.5}deg) rotateY(${x*5.5}deg) translateY(-3px)`;
  });
  document.addEventListener('pointerout',e=>{const c=e.target.closest?.(tiltSelector);if(c)c.style.transform=''});

  const intro=$('#intro'),progress=$('#introProgress');
  let introDone=false;
  function finishIntro(){
    if(introDone)return;introDone=true;
    if(progress)progress.style.width='100%';
    setTimeout(()=>{intro?.classList.add('done');document.body.classList.add('ready')},170);
  }
  if(progress)progress.style.width='20%';
  if(!window.THREE||!$('#monsterHeroCanvas')){finishIntro();return}
  const THREE=window.THREE;

  function roundedRect(ctx,x,y,w,h,r){
    ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
  }

  function claw(ctx,cx,cy,s){
    const strokes=[
      [[-128,-172],[-111,-190],[-91,-181],[-101,-126],[-85,-64],[-99,-4],[-86,73],[-108,151],[-120,77],[-112,-2],[-130,-66],[-119,-125]],
      [[-21,-193],[0,-211],[21,-194],[10,-132],[27,-61],[11,11],[27,102],[0,198],[-14,105],[-5,9],[-25,-63],[-10,-133]],
      [[89,-163],[108,-181],[129,-164],[117,-110],[133,-50],[116,8],[129,71],[106,147],[96,74],[104,6],[86,-52],[100,-110]]
    ];
    strokes.forEach(points=>{
      ctx.beginPath();points.forEach((p,i)=>{const x=cx+p[0]*s,y=cy+p[1]*s;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill();ctx.stroke();
    });
  }

  function makeProductMaps(){
    const W=4096,H=2048;
    const color=document.createElement('canvas'),bump=document.createElement('canvas'),rough=document.createElement('canvas');
    color.width=bump.width=rough.width=W;color.height=bump.height=rough.height=H;
    const c=color.getContext('2d'),b=bump.getContext('2d'),r=rough.getContext('2d');

    c.fillStyle='#f7f8f7';c.fillRect(0,0,W,H);
    b.fillStyle='#777';b.fillRect(0,0,W,H);
    r.fillStyle='#b7b7b7';r.fillRect(0,0,W,H);

    // Subtle vertical printed-aluminum grain: high resolution, no scan pixels.
    for(let x=0;x<W;x+=4){
      const v=12+Math.floor(Math.random()*14);
      c.fillStyle=`rgba(48,55,61,${v/2000})`;c.fillRect(x,0,1,H);
      r.fillStyle=`rgb(${170+Math.floor(Math.random()*22)},${170+Math.floor(Math.random()*22)},${170+Math.floor(Math.random()*22)})`;r.fillRect(x,0,2,H);
    }

    // Zero Ultra filigree pattern around the full wrap.
    function filigree(ctx,colorValue,alpha,lineWidth){
      ctx.save();ctx.strokeStyle=colorValue;ctx.globalAlpha=alpha;ctx.lineWidth=lineWidth;
      for(let col=0;col<12;col++)for(let row=0;row<5;row++){
        const ox=col*360+(row%2)*110,oy=150+row*390;
        ctx.beginPath();
        for(let i=0;i<95;i++){
          const t=i/94*Math.PI*4.2,rad=18+i*1.35;
          const px=ox+Math.cos(t+col*.44)*rad,py=oy+Math.sin(t+col*.44)*rad*.55;
          i?ctx.lineTo(px,py):ctx.moveTo(px,py);
        }
        ctx.stroke();
        ctx.beginPath();ctx.moveTo(ox-120,oy+100);ctx.bezierCurveTo(ox+20,oy-90,ox+180,oy+40,ox+85,oy+215);ctx.stroke();
      }
      ctx.restore();
    }
    filigree(c,'#7e858a',.22,3.2);filigree(b,'#d6d6d6',.28,5.5);

    c.fillStyle='#171a1e';c.font='800 54px Arial';c.textAlign='center';
    for(const x of [512,1536,2560,3584])c.fillText('+  ZERO SUGAR  +',x,105);

    // Front panel centered at U=.25 (camera-facing side of LatheGeometry).
    const fx=1024;
    c.save();c.translate(fx,0);
    const silver=c.createLinearGradient(-280,360,280,1040);silver.addColorStop(0,'#f4f6f7');silver.addColorStop(.27,'#636a70');silver.addColorStop(.49,'#f0f2f3');silver.addColorStop(.75,'#7b8288');silver.addColorStop(1,'#e8ebec');
    c.fillStyle=silver;c.strokeStyle='#0d1115';c.lineWidth=15;claw(c,0,770,2.0);
    c.fillStyle='#101318';c.font='900 126px Georgia,serif';c.textAlign='center';c.fillText('MONSTER',0,1420);
    c.fillStyle='#37b6e6';c.font='800 68px Arial';c.fillText('E  N  E  R  G  Y',0,1540);
    c.fillStyle='#101318';c.font='900 64px Arial';c.fillText('ZERO ULTRA',0,1648);
    c.fillStyle='#34383c';c.font='700 28px Arial';c.fillText('ENERGY DRINK       16 FL OZ (473 mL)',0,1962);
    c.restore();

    // Back product label centered at U=.75.
    const bx=3072,boxW=800,boxH=1440,boxX=bx-boxW/2,boxY=210;
    c.save();c.fillStyle='rgba(255,255,255,.975)';c.strokeStyle='#0a0a0a';c.lineWidth=10;roundedRect(c,boxX,boxY,boxW,boxH,22);c.fill();c.stroke();
    c.fillStyle='#0a0a0a';c.textAlign='left';c.font='900 66px Arial';c.fillText('MONSTER',boxX+38,boxY+82);c.font='700 28px Arial';c.fillText('ENERGY · ZERO ULTRA',boxX+40,boxY+126);
    c.lineWidth=8;c.beginPath();c.moveTo(boxX+28,boxY+154);c.lineTo(boxX+boxW-28,boxY+154);c.stroke();
    c.font='900 76px Arial';c.fillText('Nutrition Facts',boxX+34,boxY+246);c.font='700 31px Arial';c.fillText('Serving size 1 can',boxX+34,boxY+298);
    c.lineWidth=10;c.beginPath();c.moveTo(boxX+28,boxY+330);c.lineTo(boxX+boxW-28,boxY+330);c.stroke();
    c.font='900 62px Arial';c.fillText('Calories                     10',boxX+34,boxY+410);
    const rows=['Total Fat 0g                         0%','Sodium 360mg                    16%','Total Carbohydrate 3g            1%','Total Sugars 0g','Includes 0g Added Sugars          0%','Protein 0g','Niacin (Vit. B3)                250%','Vitamin B6                      240%','Vitamin B12                     490%','Taurine                         1000mg','Caffeine                         160mg'];
    c.font='700 29px Arial';let yy=boxY+486;rows.forEach(row=>{c.fillText(row,boxX+34,yy);yy+=62;c.lineWidth=2;c.beginPath();c.moveTo(boxX+28,yy-42);c.lineTo(boxX+boxW-28,yy-42);c.stroke()});
    c.fillStyle='#111';for(let i=0;i<48;i++){const xx=boxX+52+i*13,w=i%5===0?10:i%3===0?7:4;c.fillRect(xx,boxY+1160,w,180)}
    c.font='700 24px Arial';c.fillText('0 70847 81147 3',boxX+230,boxY+1380);c.restore();

    // Side text to keep the 360 view product-like.
    c.save();c.fillStyle='#45494d';c.font='700 28px Arial';c.textAlign='center';c.translate(2030,1740);c.rotate(-Math.PI/2);c.fillText('TAURINE · GINSENG · L-CARNITINE · CAFFEINE',0,0);c.restore();
    c.save();c.fillStyle='#45494d';c.font='700 28px Arial';c.textAlign='center';c.translate(40,1740);c.rotate(Math.PI/2);c.fillText('SERVE COLD · RECYCLE · MONSTER ENERGY',0,0);c.restore();

    const map=new THREE.CanvasTexture(color),bumpMap=new THREE.CanvasTexture(bump),roughnessMap=new THREE.CanvasTexture(rough);
    map.colorSpace=THREE.SRGBColorSpace;
    [map,bumpMap,roughnessMap].forEach(t=>{t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=16;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true});
    return {map,bumpMap,roughnessMap};
  }

  function makeTabGeometry(){
    const s=new THREE.Shape();
    s.moveTo(-.35,-.52);s.quadraticCurveTo(-.5,-.22,-.39,.08);s.quadraticCurveTo(-.30,.43,0,.52);s.quadraticCurveTo(.30,.43,.39,.08);s.quadraticCurveTo(.5,-.22,.35,-.52);s.quadraticCurveTo(0,-.67,-.35,-.52);
    const hole=new THREE.Path();hole.absellipse(0,.07,.17,.22,0,Math.PI*2,false,0);s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:true,bevelSize:.022,bevelThickness:.02,bevelSegments:4,curveSegments:48});
  }

  function buildCan(maps){
    const group=new THREE.Group();
    const bodyMat=new THREE.MeshPhysicalMaterial({map:maps.map,bumpMap:maps.bumpMap,bumpScale:.012,roughnessMap:maps.roughnessMap,metalness:.23,roughness:.30,clearcoat:1,clearcoatRoughness:.12,reflectivity:.8});
    const aluminum=new THREE.MeshPhysicalMaterial({color:0xd9dde0,metalness:1,roughness:.16,clearcoat:.72,clearcoatRoughness:.08});
    const darkMetal=new THREE.MeshPhysicalMaterial({color:0x22262a,metalness:.88,roughness:.20,clearcoat:.35});
    const darkOpening=new THREE.MeshBasicMaterial({color:0x090a0b});

    const profile=[
      new THREE.Vector2(1.16,-3.04),new THREE.Vector2(1.23,-3.01),new THREE.Vector2(1.29,-2.91),new THREE.Vector2(1.33,-2.73),new THREE.Vector2(1.345,-2.56),
      new THREE.Vector2(1.345,2.50),new THREE.Vector2(1.33,2.66),new THREE.Vector2(1.29,2.78),new THREE.Vector2(1.23,2.88),new THREE.Vector2(1.16,2.93)
    ];
    const body=new THREE.Mesh(new THREE.LatheGeometry(profile,160),bodyMat);body.castShadow=true;body.receiveShadow=true;group.add(body);

    const topLip=new THREE.Mesh(new THREE.TorusGeometry(1.18,.067,24,160),aluminum);topLip.rotation.x=Math.PI/2;topLip.position.y=2.985;group.add(topLip);
    const lid=new THREE.Mesh(new THREE.CylinderGeometry(1.12,1.12,.055,160),aluminum);lid.position.y=2.955;group.add(lid);
    const lidInner=new THREE.Mesh(new THREE.TorusGeometry(.89,.025,16,128),darkMetal);lidInner.rotation.x=Math.PI/2;lidInner.position.y=2.988;group.add(lidInner);
    const opening=new THREE.Mesh(new THREE.CircleGeometry(.205,64),darkOpening);opening.rotation.x=-Math.PI/2;opening.scale.set(1.55,.72,1);opening.position.set(0,2.993,-.34);group.add(opening);
    const rivet=new THREE.Mesh(new THREE.CylinderGeometry(.092,.092,.038,48),aluminum);rivet.position.set(0,3.018,.12);group.add(rivet);
    const tab=new THREE.Mesh(makeTabGeometry(),darkMetal);tab.scale.set(.76,.76,.76);tab.rotation.x=-Math.PI/2;tab.position.set(0,3.02,.17);group.add(tab);

    const bottomLip=new THREE.Mesh(new THREE.TorusGeometry(1.17,.058,22,160),aluminum);bottomLip.rotation.x=Math.PI/2;bottomLip.position.y=-3.035;group.add(bottomLip);
    const bottomOuter=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.16,.07,160),aluminum);bottomOuter.position.y=-3.01;group.add(bottomOuter);
    const bottomInset=new THREE.Mesh(new THREE.CircleGeometry(.82,128),new THREE.MeshPhysicalMaterial({color:0xb8bec3,metalness:1,roughness:.24}));bottomInset.rotation.x=Math.PI/2;bottomInset.position.y=-3.051;group.add(bottomInset);
    const bottomGroove=new THREE.Mesh(new THREE.TorusGeometry(.84,.022,14,128),darkMetal);bottomGroove.rotation.x=Math.PI/2;bottomGroove.position.y=-3.055;group.add(bottomGroove);

    // Keep it clean: no fake condensation, no scan mesh, no background plane.
    group.rotation.z=-.025;
    return group;
  }

  function makeScene(canvas,maps){
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2.75));
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.08;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(30,1,.1,100);camera.position.set(0,.05,12.8);
    scene.add(new THREE.HemisphereLight(0xf8fbff,0x101216,1.55));
    const key=new THREE.DirectionalLight(0xffffff,3.1);key.position.set(-4.5,5.2,6.8);key.castShadow=true;scene.add(key);
    const fill=new THREE.PointLight(0xd8ecff,17,18);fill.position.set(4,-1,4.5);scene.add(fill);
    const gold=new THREE.PointLight(0xf6c84c,18,18);gold.position.set(4.2,2.4,-4.5);scene.add(gold);
    const rim=new THREE.PointLight(0xffffff,11,15);rim.position.set(-4,-2.2,-4);scene.add(rim);

    const can=buildCan(maps);scene.add(can);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(2.0,96),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.y=.36;shadow.position.y=-3.12;scene.add(shadow);

    let drag=false,lastX=0,userSpin=0,px=0,py=0,w=0,h=0;
    canvas.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;canvas.setPointerCapture?.(e.pointerId)});
    canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();px=(e.clientX-rect.left)/rect.width-.5;py=(e.clientY-rect.top)/rect.height-.5;if(drag){userSpin+=(e.clientX-lastX)*.0105;lastX=e.clientX}});
    const stop=e=>{drag=false;try{canvas.releasePointerCapture?.(e.pointerId)}catch{}};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
    function resize(){const nw=Math.max(1,Math.round(canvas.clientWidth)),nh=Math.max(1,Math.round(canvas.clientHeight));if(nw===w&&nh===h)return;w=nw;h=nh;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
    return {renderer,scene,camera,can,resize,getPointer:()=>({px,py}),getSpin:()=>userSpin,isDragging:()=>drag,gold};
  }

  try{
    if(progress)progress.style.width='48%';
    const maps=makeProductMaps();
    if(progress)progress.style.width='72%';
    const hero=makeScene($('#monsterHeroCanvas'),maps),lower=makeScene($('#monsterScrollCanvas'),maps);
    if(progress)progress.style.width='92%';

    const start=performance.now();
    (function frame(){
      const t=(performance.now()-start)/1000;
      hero.resize();lower.resize();
      const hp=hero.getPointer();

      // Hero: only the can turns. No orbit ring, no iframe background, no wrapper spin.
      if(!reduce){
        const auto=hero.isDragging()?0:t*.17;
        hero.can.rotation.y=auto+hero.getSpin()+hp.px*.16;
        hero.can.rotation.x=hp.py*.06;
        hero.can.position.y=Math.sin(t*.75)*.035;
      }else hero.can.rotation.y=.12+hero.getSpin();
      hero.gold.intensity=17+Math.sin(t*1.1)*.7;
      hero.renderer.render(hero.scene,hero.camera);

      // Lower section: rotation is driven by scroll, not constant spinning.
      lower.can.rotation.y=lowerProgress*Math.PI*2.35+lower.getSpin();
      lower.can.rotation.x=0;
      lower.renderer.render(lower.scene,lower.camera);
      requestAnimationFrame(frame);
    })();
    finishIntro();
  }catch(err){console.error('Monster product model failed to initialize',err);finishIntro()}
})();
