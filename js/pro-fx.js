/* SwiftSupply presentation FX — true 360° Monster can hero + scroll scene. */
(()=>{
  const $=s=>document.querySelector(s);
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  document.body.dataset.proPage=file;

  if(!document.getElementById('sp-progress')){
    const bar=document.createElement('div'); bar.id='sp-progress'; document.body.appendChild(bar);
  }
  const bar=$('#sp-progress'), hdr=$('.site-header'), mz=$('#mz'), steps=[...document.querySelectorAll('.mz-copy div')];
  let sy=scrollY;

  function onScroll(){
    sy=scrollY;
    const h=document.documentElement.scrollHeight-innerHeight;
    if(bar) bar.style.transform=`scaleX(${h?sy/h:0})`;
    if(hdr) hdr.classList.toggle('scrolled',sy>30);
    if(mz){
      const r=mz.getBoundingClientRect();
      const p=clamp(-r.top/Math.max(1,r.height-innerHeight));
      mz.style.setProperty('--p',p);
      const i=Math.min(steps.length-1,Math.floor(p*steps.length));
      steps.forEach((s,k)=>s.classList.toggle('on',k===i&&p>.015));
    }
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(x=>{
      if(x.isIntersecting){x.target.classList.add('visible');io.unobserve(x.target)}
    }),{threshold:.1,rootMargin:'0px 0px -36px 0px'});
    const watch=()=>document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible)').forEach(el=>io.observe(el));
    watch(); new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
  }

  const tiltSelector='.home-brand-card,.product-card,.home-feature,.pw-service,.about-pro-card';
  document.addEventListener('pointermove',e=>{
    if(reduce||matchMedia('(pointer: coarse)').matches)return;
    const c=e.target.closest&&e.target.closest(tiltSelector); if(!c)return;
    const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`perspective(950px) rotateX(${-y*4.5}deg) rotateY(${x*5.5}deg) translateY(-3px)`;
  });
  document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest(tiltSelector);if(c)c.style.transform=''});

  const intro=$('#intro');
  const finishIntro=()=>{intro&&intro.classList.add('done');document.body.classList.add('ready')};
  if(file!=='index'){setTimeout(finishIntro,intro?500:0);return}
  if(reduce){setTimeout(finishIntro,intro?550:0);return}

  function ensureThree(){
    if(window.THREE)return Promise.resolve(window.THREE);
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-three-swiftsupply]');
      if(existing){existing.addEventListener('load',()=>resolve(window.THREE),{once:true});existing.addEventListener('error',reject,{once:true});return}
      const s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      s.async=true;s.dataset.threeSwiftsupply='1';
      s.onload=()=>resolve(window.THREE);s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  function drawMonsterWrap(THREE){
    const c=document.createElement('canvas'); c.width=2048; c.height=1024;
    const ctx=c.getContext('2d');
    const W=c.width,H=c.height;
    ctx.fillStyle='#f0f1ed';ctx.fillRect(0,0,W,H);

    ctx.save();ctx.globalAlpha=.2;ctx.strokeStyle='#aeb3b0';ctx.lineWidth=2;
    for(let y=22;y<H;y+=42){
      for(let x=0;x<W;x+=78){
        ctx.beginPath();ctx.arc(x+(y%84),y,18+(x%3)*4,.2,Math.PI*1.5);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x,y+12);ctx.quadraticCurveTo(x+28,y-10,x+56,y+14);ctx.stroke();
      }
    }
    ctx.restore();

    const grd=ctx.createLinearGradient(0,0,W,0);
    grd.addColorStop(0,'rgba(255,255,255,.65)');grd.addColorStop(.14,'rgba(185,190,188,.16)');
    grd.addColorStop(.5,'rgba(255,255,255,.55)');grd.addColorStop(.78,'rgba(172,178,176,.16)');grd.addColorStop(1,'rgba(255,255,255,.62)');
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);

    const cx=W/2;
    ctx.textAlign='center';
    ctx.fillStyle='#111315';ctx.font='900 112px Arial Black, Arial';ctx.fillText('MONSTER',cx,625);
    ctx.font='700 48px Arial';ctx.fillText('ENERGY',cx,684);

    ctx.save();ctx.translate(cx,270);ctx.strokeStyle='#73b72b';ctx.lineWidth=36;ctx.lineCap='round';ctx.lineJoin='round';
    const claw=(dx,lean)=>{ctx.beginPath();ctx.moveTo(dx-lean,140);ctx.lineTo(dx-32,20);ctx.lineTo(dx+2,62);ctx.lineTo(dx+18,-105);ctx.stroke()};
    claw(-92,-12);claw(0,8);claw(92,22);ctx.restore();

    ctx.fillStyle='#33383a';ctx.font='700 46px Arial';ctx.fillText('ZERO ULTRA',cx,760);
    ctx.font='700 30px Arial';ctx.fillText('0 SUGAR  •  0 CALORIES',cx,812);
    ctx.font='600 22px Arial';ctx.fillText('ENERGY DRINK  •  16 FL OZ (473 mL)',cx,855);

    ctx.save();ctx.fillStyle='#25292a';ctx.textAlign='left';ctx.font='700 24px Arial';
    ctx.fillText('ZERO ULTRA',245,210);ctx.fillText('MONSTER ENERGY',245,246);
    ctx.textAlign='right';ctx.fillText('ZERO ULTRA',W-245,210);ctx.fillText('MONSTER ENERGY',W-245,246);ctx.restore();

    function backPanel(x){
      ctx.save();ctx.translate(x,0);ctx.fillStyle='rgba(255,255,255,.78)';ctx.strokeStyle='#232627';ctx.lineWidth=4;
      ctx.fillRect(-205,310,410,460);ctx.strokeRect(-205,310,410,460);
      ctx.fillStyle='#111';ctx.textAlign='left';ctx.font='900 34px Arial';ctx.fillText('NUTRITION FACTS',-184,355);
      ctx.fillRect(-184,371,366,6);ctx.font='700 22px Arial';ctx.fillText('Serving size 1 can',-184,407);
      ctx.font='900 42px Arial';ctx.fillText('0',-184,465);ctx.font='700 19px Arial';ctx.fillText('CALORIES',-132,463);
      ctx.fillRect(-184,486,366,4);ctx.font='600 18px Arial';
      ['Total Fat 0g','Sodium 370mg','Total Carbohydrate 6g','Total Sugars 0g','Includes 0g Added Sugars','Protein 0g'].forEach((t,i)=>ctx.fillText(t,-184,522+i*34));
      ctx.font='700 16px Arial';ctx.fillText('TAURINE • CAFFEINE • B VITAMINS',-184,743);
      let bx=82;for(let i=0;i<28;i++){const w=(i%4===0?4:2);ctx.fillRect(bx,604,w,126-(i%3)*14);bx+=w+3;}
      ctx.restore();
    }
    backPanel(0);backPanel(W);

    ctx.fillStyle='rgba(91,95,94,.25)';ctx.fillRect(0,18,W,14);ctx.fillRect(0,H-32,W,14);

    const tex=new THREE.CanvasTexture(c);
    tex.wrapS=THREE.RepeatWrapping;tex.wrapT=THREE.ClampToEdgeWrapping;
    tex.anisotropy=8;tex.encoding=THREE.sRGBEncoding;tex.needsUpdate=true;
    return tex;
  }

  function makeRenderer(THREE,canvas){
    const r=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
    r.setPixelRatio(Math.min(devicePixelRatio,2));r.outputEncoding=THREE.sRGBEncoding;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
    return r;
  }

  function makeCan(THREE,texture){
    const group=new THREE.Group();
    const sideMat=new THREE.MeshPhysicalMaterial({map:texture,metalness:.38,roughness:.34,clearcoat:.72,clearcoatRoughness:.2});
    const metal=new THREE.MeshPhysicalMaterial({color:0xc8ccd0,metalness:1,roughness:.2,clearcoat:.6});
    const dark=new THREE.MeshStandardMaterial({color:0x565b60,metalness:.95,roughness:.25});

    const body=new THREE.Mesh(new THREE.CylinderGeometry(1.17,1.14,4.92,96,1,true),sideMat);
    body.castShadow=true;body.receiveShadow=true;group.add(body);
    const topShoulder=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.17,.18,96,1,true),metal);topShoulder.position.y=2.55;group.add(topShoulder);
    const bottomShoulder=new THREE.Mesh(new THREE.CylinderGeometry(1.14,1.06,.16,96,1,true),metal);bottomShoulder.position.y=-2.54;group.add(bottomShoulder);
    const topDisc=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.08,.09,96),metal);topDisc.position.y=2.67;group.add(topDisc);
    const bottomDisc=new THREE.Mesh(new THREE.CylinderGeometry(1.06,1.06,.08,96),metal);bottomDisc.position.y=-2.66;group.add(bottomDisc);
    const topRim=new THREE.Mesh(new THREE.TorusGeometry(1.07,.047,18,96),metal);topRim.rotation.x=Math.PI/2;topRim.position.y=2.72;group.add(topRim);
    const bottomRim=new THREE.Mesh(new THREE.TorusGeometry(1.04,.04,18,96),dark);bottomRim.rotation.x=Math.PI/2;bottomRim.position.y=-2.7;group.add(bottomRim);
    const tabOuter=new THREE.Mesh(new THREE.TorusGeometry(.28,.055,12,40),dark);tabOuter.rotation.x=Math.PI/2;tabOuter.scale.z=.58;tabOuter.position.set(.06,2.735,.03);group.add(tabOuter);
    const tabBar=new THREE.Mesh(new THREE.BoxGeometry(.5,.035,.16),dark);tabBar.position.set(.06,2.73,-.08);group.add(tabBar);
    const greenRing=new THREE.Mesh(new THREE.TorusGeometry(1.05,.018,12,96),new THREE.MeshStandardMaterial({color:0x70b62c,emissive:0x70b62c,emissiveIntensity:.25,metalness:.6,roughness:.3}));
    greenRing.rotation.x=Math.PI/2;greenRing.position.y=-2.43;group.add(greenRing);
    group.rotation.y=Math.PI;
    return group;
  }

  function createScene(THREE,canvas,{hero=false}={}){
    const renderer=makeRenderer(THREE,canvas);
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(hero?35:40,1,.1,100);camera.position.set(0,.05,hero?9.2:8.3);
    scene.add(new THREE.HemisphereLight(0xffffff,0x0a0b0e,1.5));
    const key=new THREE.DirectionalLight(0xffffff,2.25);key.position.set(-4,5,6);key.castShadow=true;scene.add(key);
    const fill=new THREE.PointLight(0xdbe9ff,1.3,18);fill.position.set(4,1,5);scene.add(fill);
    const gold=new THREE.PointLight(0xf6c84c,2.5,22);gold.position.set(4,-1,2.5);scene.add(gold);
    const green=new THREE.PointLight(0x72b62b,.8,14);green.position.set(-3,-1,3);scene.add(green);

    const can=makeCan(THREE,drawMonsterWrap(THREE));scene.add(can);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.85,64),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.34,depthWrite:false}));
    shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.84;shadow.scale.y=.42;scene.add(shadow);
    const ring1=new THREE.Mesh(new THREE.TorusGeometry(hero?3.0:2.6,.02,14,160),new THREE.MeshBasicMaterial({color:0xf6c84c,transparent:true,opacity:hero ? .42 : .25}));ring1.rotation.x=1.08;ring1.position.z=-1.2;scene.add(ring1);
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(hero?3.7:3.1,.012,12,160),new THREE.MeshBasicMaterial({color:0xffedab,transparent:true,opacity:hero ? .2 : .12}));ring2.rotation.set(.9,.7,.2);ring2.position.z=-1.7;scene.add(ring2);
    const count=hero?220:100,geo=new THREE.BufferGeometry(),arr=new Float32Array(count*3);
    for(let i=0;i<count;i++){const j=i*3,ang=Math.random()*Math.PI*2,rad=2.5+Math.random()*(hero?5:3);arr[j]=Math.cos(ang)*rad;arr[j+1]=(Math.random()-.5)*(hero?9:7);arr[j+2]=Math.sin(ang)*rad-1.5;}
    geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
    const particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xf6c84c,size:.032,transparent:true,opacity:.5}));scene.add(particles);
    function resize(){const w=canvas.clientWidth||canvas.parentElement?.clientWidth||innerWidth,h=canvas.clientHeight||canvas.parentElement?.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();}
    return {renderer,scene,camera,can,shadow,ring1,ring2,particles,gold,resize};
  }

  ensureThree().then(THREE=>{
    const heroFrame=$('.hero-monster-frame'),mzStick=$('.mz-stick');
    if(!heroFrame||!mzStick){finishIntro();return}
    const heroCanvas=document.createElement('canvas');heroCanvas.className='monster-3d-canvas hero-monster-canvas';heroCanvas.setAttribute('aria-label','Rotating 3D white Monster Zero Ultra can');
    const mzCanvas=document.createElement('canvas');mzCanvas.className='monster-3d-canvas mz-monster-canvas';mzCanvas.setAttribute('aria-label','Rotating 3D white Monster Zero Ultra can');
    heroFrame.appendChild(heroCanvas);mzStick.insertBefore(mzCanvas,mzStick.querySelector('.mz-copy'));
    const H=createScene(THREE,heroCanvas,{hero:true});
    const M=createScene(THREE,mzCanvas,{hero:false});
    H.resize();M.resize();document.body.classList.add('monster-3d-ready');

    let mx=0,my=0,drag=false,lastX=0,spinKick=0;
    addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;if(drag){spinKick+=(e.clientX-lastX)*.012;lastX=e.clientX;}},{passive:true});
    heroFrame.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;heroFrame.setPointerCapture?.(e.pointerId)});
    heroFrame.addEventListener('pointerup',e=>{drag=false;heroFrame.releasePointerCapture?.(e.pointerId)});
    heroFrame.addEventListener('pointercancel',()=>drag=false);
    addEventListener('resize',()=>{H.resize();M.resize()});

    const t0=performance.now();finishIntro();
    (function loop(){
      const t=(performance.now()-t0)/1000;
      spinKick*=.94;
      H.can.rotation.y+=.010+spinKick;
      H.can.rotation.x+=(my*.18-H.can.rotation.x)*.04;
      H.can.rotation.z=-.06+Math.sin(t*.8)*.018;
      H.can.position.y=Math.sin(t*1.25)*.11;
      H.scene.rotation.y+=(mx*.12-H.scene.rotation.y)*.025;
      H.ring1.rotation.z=t*.18;H.ring2.rotation.z=-t*.12;H.particles.rotation.y=t*.025;H.gold.intensity=2.4+Math.sin(t*1.4)*.2;
      H.renderer.render(H.scene,H.camera);

      const r=mz.getBoundingClientRect(),p=clamp(-r.top/Math.max(1,r.height-innerHeight));
      M.can.rotation.y=Math.PI+p*Math.PI*4.2+t*.16;
      M.can.rotation.z=Math.sin(p*Math.PI*2)*.09;
      M.can.position.y=Math.sin(t*1.05)*.08;
      const sc=.9+Math.sin(p*Math.PI)*.32;M.can.scale.setScalar(sc);
      M.ring1.scale.setScalar(.82+p*.58);M.ring2.scale.setScalar(.9+p*.72);
      M.ring1.rotation.z=t*.22+p*2.7;M.ring2.rotation.z=-t*.15-p*2;M.particles.rotation.y=t*.018+p*.5;
      M.renderer.render(M.scene,M.camera);
      requestAnimationFrame(loop);
    })();
  }).catch(err=>{console.error('SwiftSupply 3D Monster failed:',err);finishIntro()});
})();
