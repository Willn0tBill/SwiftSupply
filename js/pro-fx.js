/* SwiftSupply presentation FX — visual only; does not alter store/order logic. */
(()=>{
  const $=s=>document.querySelector(s), clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  document.body.dataset.proPage=file;
  if(!document.getElementById('sp-progress')){const bar=document.createElement('div');bar.id='sp-progress';document.body.appendChild(bar)}
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
      if(!reduce){const rot=p*380,sc=.78+Math.sin(p*Math.PI)*.35,x=Math.sin(p*Math.PI*2)*10;can.style.transform=`translate3d(${x}vw,${(.5-p)*5}vh,0) rotateY(${rot}deg) rotateZ(${Math.sin(p*Math.PI*2)*6}deg) scale(${sc})`}
      const i=Math.min(steps.length-1,Math.floor(p*steps.length));steps.forEach((s,k)=>s.classList.toggle('on',k===i&&p>.015));
    }
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('visible');io.unobserve(x.target)}}),{threshold:.1,rootMargin:'0px 0px -36px 0px'});
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
  const intro=$('#intro'),cv=$('#gl');
  const go=()=>{intro&&intro.classList.add('done');document.body.classList.add('ready')};
  if(!cv||!window.THREE||reduce){setTimeout(go,intro?700:0);return}
  let R;try{R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){go();return}
  R.setPixelRatio(Math.min(devicePixelRatio,2));
  const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(50,1,.1,100);C.position.set(0,0,14);
  const L=new THREE.TextureLoader(),imgs=['home-monster','home-alani-cutout','home-cheetos'],pos=[[-1,.4],[0,-.2],[1,.3]],cards=[];
  imgs.forEach((n,i)=>L.load(`assets/${n}.webp?v=2`,t=>{const a=t.image.width/t.image.height,m=new THREE.Mesh(new THREE.PlaneGeometry(4.55*a,4.55),new THREE.MeshBasicMaterial({map:t,transparent:true}));m.position.set(5.2+pos[i][0]*3.15,pos[i][1]*2,-i%2*1.5);m.userData={i,b:m.position.clone()};S.add(m);cards.push(m)}));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(5,.018,16,160),new THREE.MeshBasicMaterial({color:0xf6c84c,transparent:true,opacity:.42}));ring.position.set(5.5,0,-3);S.add(ring);
  const N=520,g=new THREE.BufferGeometry(),a=new Float32Array(N*3);for(let i=0;i<N*3;i++)a[i]=(Math.random()-.5)*40;g.setAttribute('position',new THREE.BufferAttribute(a,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xffe29a,size:.045,transparent:true,opacity:.48}));S.add(pts);
  let mx=0,my=0,t0=performance.now();addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
  function size(){const w=cv.clientWidth,h=cv.clientHeight;R.setSize(w,h,false);C.aspect=w/Math.max(1,h);C.updateProjectionMatrix();const m=w<760;S.position.x=m?-3.25:0;cards.forEach(c=>c.scale.setScalar(m?.7:1))}size();addEventListener('resize',size);
  setTimeout(go,1100);
  (function loop(){const t=(performance.now()-t0)/1000,k=clamp(t/2.1),ease=1-Math.pow(1-k,4),hy=clamp(sy/innerHeight);C.position.z=THREE.MathUtils.lerp(25,14,ease)+hy*5;C.position.x+=(mx*1.8-C.position.x)*.04;C.position.y+=(-my-C.position.y)*.04;C.lookAt(3,0,0);cards.forEach(c=>{const i=c.userData.i;c.position.y=c.userData.b.y+Math.sin(t*1.05+i*2)*.3;c.rotation.y=Math.sin(t*.55+i)*.27-mx*.4+(1-ease)*2.1;c.rotation.z=Math.sin(t*.75+i)*.045});ring.rotation.x=t*.2;ring.rotation.y=t*.15;pts.rotation.y=t*.016+sy*.00025;cv.style.opacity=1-hy*.92;if(hy<1.15)R.render(S,C);requestAnimationFrame(loop)})();
})();
