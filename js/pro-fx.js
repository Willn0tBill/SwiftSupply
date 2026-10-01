/* SwiftSupply presentation FX — shared motion + exact 3D model scroll staging. */
(()=>{
  const $=s=>document.querySelector(s);
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  document.body.dataset.proPage=file;

  if(!document.getElementById('sp-progress')){const bar=document.createElement('div');bar.id='sp-progress';document.body.appendChild(bar)}
  const bar=$('#sp-progress'),hdr=$('.site-header'),mz=$('#mz'),model=$('.mz-model-wrap'),steps=[...document.querySelectorAll('.mz-copy div')];

  function onScroll(){
    const sy=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform=`scaleX(${h?sy/h:0})`;
    if(hdr)hdr.classList.toggle('scrolled',sy>30);
    if(mz){
      const r=mz.getBoundingClientRect(),p=clamp(-r.top/Math.max(1,r.height-innerHeight));
      mz.style.setProperty('--p',p);
      if(model&&!reduce){
        const x=Math.sin(p*Math.PI*2)*1.5;
        const y=(.5-p)*4.5;
        const s=.9+Math.sin(p*Math.PI)*.12;
        const rz=Math.sin(p*Math.PI*2)*1.8;
        model.style.transform=`translate3d(${x}vw,${y}vh,0) rotateZ(${rz}deg) scale(${s})`;
      }
      const i=Math.min(steps.length-1,Math.floor(p*steps.length));
      steps.forEach((s,k)=>s.classList.toggle('on',k===i&&p>.015));
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

  const intro=$('#intro');
  setTimeout(()=>{intro&&intro.classList.add('done');document.body.classList.add('ready')},file==='index'?850:450);
})();
