/* SwiftSupply presentation FX — visual only; does not alter store/order logic. */
(()=>{
  const $=s=>document.querySelector(s), clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  document.body.dataset.proPage=file;

  if(!document.getElementById('sp-progress')){
    const bar=document.createElement('div');bar.id='sp-progress';document.body.appendChild(bar);
  }

  const bar=$('#sp-progress'),hdr=$('.site-header'),mz=$('#mz'),can=$('.mz-can'),steps=[...document.querySelectorAll('.mz-copy div')];
  let sy=scrollY;

  function onScroll(){
    sy=scrollY;
    const h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform=`scaleX(${h?sy/h:0})`;
    hdr&&hdr.classList.toggle('scrolled',sy>30);
    if(mz&&can){
      const r=mz.getBoundingClientRect(),p=clamp(-r.top/Math.max(1,r.height-innerHeight));
      mz.style.setProperty('--p',p);
      if(!reduce){
        const rot=p*380,sc=.78+Math.sin(p*Math.PI)*.35,x=Math.sin(p*Math.PI*2)*10;
        can.style.transform=`translate3d(${x}vw,${(.5-p)*5}vh,0) rotateY(${rot}deg) rotateZ(${Math.sin(p*Math.PI*2)*6}deg) scale(${sc})`;
      }
      const i=Math.min(steps.length-1,Math.floor(p*steps.length));
      steps.forEach((s,k)=>s.classList.toggle('on',k===i&&p>.015));
    }
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(x=>{
      if(x.isIntersecting){x.target.classList.add('visible');io.unobserve(x.target)}
    }),{threshold:.1,rootMargin:'0px 0px -36px 0px'});
    const watch=()=>document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible)').forEach(el=>io.observe(el));
    watch();new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
  }

  const tiltSelector='.home-brand-card,.product-card,.home-feature,.pw-service,.about-pro-card';
  document.addEventListener('pointermove',e=>{
    if(reduce||matchMedia('(pointer: coarse)').matches)return;
    const c=e.target.closest&&e.target.closest(tiltSelector);if(!c)return;
    const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`perspective(950px) rotateX(${-y*4.5}deg) rotateY(${x*5.5}deg) translateY(-3px)`;
  });
  document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest(tiltSelector);if(c)c.style.transform=''});

  const intro=$('#intro'),cv=$('#gl'),hero=$('.hero3d');
  const go=()=>{intro&&intro.classList.add('done');document.body.classList.add('ready')};
  if(!cv||!window.THREE||reduce){setTimeout(go,intro?700:0);return}

  let R;
  try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'})}
  catch(e){go();return}

  R.setPixelRatio(Math.min(devicePixelRatio,2));
  R.setClearColor(0x000000,0);
  R.shadowMap.enabled=true;
  R.shadowMap.type=THREE.PCFSoftShadowMap;
  if('outputEncoding'in R)R.outputEncoding=THREE.sRGBEncoding;

  const S=new THREE.Scene();
  const C=new THREE.PerspectiveCamera(42,1,.1,100);
  C.position.set(0,.15,13.5);

  /* Lighting makes the can read as a real volume instead of a flat image. */
  S.add(new THREE.HemisphereLight(0xf7fbff,0x090b0f,1.35));
  const key=new THREE.DirectionalLight(0xffffff,2.15);key.position.set(-4,5,7);key.castShadow=true;S.add(key);
  const gold=new THREE.PointLight(0xf6c84c,2.5,18);gold.position.set(6,2.5,4.5);S.add(gold);
  const rim=new THREE.PointLight(0xcfe6ff,1.45,16);rim.position.set(2.5,-1.5,-5);S.add(rim);

  const canGroup=new THREE.Group();
  S.add(canGroup);

  const bodyMat=new THREE.MeshPhysicalMaterial({
    color:0xe9edf0,metalness:.68,roughness:.22,clearcoat:.8,clearcoatRoughness:.16
  });
  const metalMat=new THREE.MeshPhysicalMaterial({
    color:0xbcc3c9,metalness:.96,roughness:.18,clearcoat:.7
  });
  const darkMetal=new THREE.MeshPhysicalMaterial({
    color:0x31353a,metalness:.8,roughness:.28
  });

  const body=new THREE.Mesh(
    new THREE.CylinderGeometry(1.27,1.27,5.35,96,1,false),
    [bodyMat,metalMat,metalMat]
  );
  body.castShadow=true;body.receiveShadow=true;canGroup.add(body);

  const top=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.18,.11,96),metalMat);
  top.position.y=2.69;top.castShadow=true;canGroup.add(top);
  const topRing=new THREE.Mesh(new THREE.TorusGeometry(1.08,.045,18,96),darkMetal);
  topRing.rotation.x=Math.PI/2;topRing.position.y=2.755;canGroup.add(topRing);

  const bottomRing=new THREE.Mesh(new THREE.TorusGeometry(1.08,.04,18,96),darkMetal);
  bottomRing.rotation.x=Math.PI/2;bottomRing.position.y=-2.705;canGroup.add(bottomRing);

  const tab=new THREE.Mesh(new THREE.TorusGeometry(.27,.055,14,44),darkMetal);
  tab.rotation.x=Math.PI/2;tab.scale.z=.62;tab.position.set(.08,2.82,.06);canGroup.add(tab);
  const tabBridge=new THREE.Mesh(new THREE.BoxGeometry(.42,.035,.15),darkMetal);
  tabBridge.position.set(.08,2.79,-.08);canGroup.add(tabBridge);

  /* Create a curved front label so the Monster artwork wraps around the can. */
  function curvedLabelGeometry(radius,height,arc,segments=64){
    const verts=[],uvs=[],idx=[];
    for(let i=0;i<=segments;i++){
      const u=i/segments,theta=-arc/2+u*arc,x=Math.sin(theta)*radius,z=Math.cos(theta)*radius;
      verts.push(x,-height/2,z,x,height/2,z);
      uvs.push(u,0,u,1);
      if(i<segments){const a=i*2,b=a+1,c=a+2,d=a+3;idx.push(a,c,b,b,c,d)}
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    g.setIndex(idx);g.computeVertexNormals();return g;
  }

  const loader=new THREE.TextureLoader();
  loader.load('assets/home-monster.webp?v=2',tex=>{
    tex.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());
    tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;
    if('encoding'in tex)tex.encoding=THREE.sRGBEncoding;
    const label=new THREE.Mesh(
      curvedLabelGeometry(1.286,5.1,1.9,72),
      new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,depthWrite:false})
    );
    label.renderOrder=2;canGroup.add(label);
  });

  /* A lit pedestal and orbit rings make the object feel grounded in the hero. */
  const pedestal=new THREE.Group();S.add(pedestal);
  const shadow=new THREE.Mesh(
    new THREE.CircleGeometry(2.05,64),
    new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.34,depthWrite:false})
  );
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.78;shadow.scale.y=.48;pedestal.add(shadow);

  const orbit1=new THREE.Mesh(
    new THREE.TorusGeometry(3.15,.018,16,180),
    new THREE.MeshBasicMaterial({color:0xf6c84c,transparent:true,opacity:.42})
  );
  orbit1.rotation.x=1.17;pedestal.add(orbit1);
  const orbit2=new THREE.Mesh(
    new THREE.TorusGeometry(3.85,.012,12,180),
    new THREE.MeshBasicMaterial({color:0xffe29a,transparent:true,opacity:.18})
  );
  orbit2.rotation.x=.9;orbit2.rotation.y=.5;pedestal.add(orbit2);

  const N=420,pg=new THREE.BufferGeometry(),pa=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const j=i*3,ang=Math.random()*Math.PI*2,r=3.1+Math.random()*5.2;
    pa[j]=Math.cos(ang)*r+4.2;pa[j+1]=(Math.random()-.5)*8;pa[j+2]=Math.sin(ang)*r-1.5;
  }
  pg.setAttribute('position',new THREE.BufferAttribute(pa,3));
  const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffdf7d,size:.035,transparent:true,opacity:.42}));
  S.add(pts);

  let mx=0,my=0,targetY=0,targetX=0,dragging=false,lastX=0,dragSpin=0,t0=performance.now();
  function pointer(e){
    mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;
    targetY=mx*.72;targetX=-my*.18;
    if(dragging){dragSpin+=(e.clientX-lastX)*.008;lastX=e.clientX}
  }
  addEventListener('pointermove',pointer,{passive:true});
  hero?.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;hero.setPointerCapture?.(e.pointerId)});
  hero?.addEventListener('pointerup',e=>{dragging=false;hero.releasePointerCapture?.(e.pointerId)});
  hero?.addEventListener('pointercancel',()=>dragging=false);

  function size(){
    const w=cv.clientWidth,h=cv.clientHeight;
    R.setSize(w,h,false);C.aspect=w/Math.max(1,h);C.updateProjectionMatrix();
    const mobile=w<760;
    canGroup.position.set(mobile?2.05:4.75,mobile?-1.1:.05,0);
    pedestal.position.copy(canGroup.position);
    const s=mobile?.68:1;
    canGroup.scale.setScalar(s);pedestal.scale.setScalar(s);
    C.position.z=mobile?15.8:13.5;
  }
  size();addEventListener('resize',size);
  setTimeout(go,900);

  (function loop(){
    const t=(performance.now()-t0)/1000,hy=clamp(sy/innerHeight);
    canGroup.rotation.y+=(targetY+dragSpin+Math.sin(t*.48)*.13-canGroup.rotation.y)*.055;
    canGroup.rotation.x+=(targetX+Math.sin(t*.7)*.025-canGroup.rotation.x)*.05;
    canGroup.rotation.z=-.075+Math.sin(t*.62)*.018;
    canGroup.position.y+=( (innerWidth<760?-1.1:.05)+Math.sin(t*.9)*.12-canGroup.position.y)*.045;
    pedestal.rotation.z=t*.055;orbit1.rotation.z=t*.12;orbit2.rotation.z=-t*.08;pts.rotation.y=t*.018;
    gold.intensity=2.35+Math.sin(t*1.5)*.18;
    C.position.x+=(mx*.72-C.position.x)*.035;
    C.position.y+=(.15-my*.3-C.position.y)*.035;
    C.lookAt(innerWidth<760?1.6:3.6,-.15,0);
    cv.style.opacity=String(1-hy*.9);
    if(hy<1.2)R.render(S,C);
    requestAnimationFrame(loop);
  })();
})();
