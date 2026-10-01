/* SwiftSupply presentation FX — visual only; does not alter store/order logic. */
(()=>{
  const $=s=>document.querySelector(s), clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  document.body.dataset.proPage=file;

  if(!document.getElementById('sp-progress')){
    const bar=document.createElement('div');bar.id='sp-progress';document.body.appendChild(bar);
  }

  const bar=$('#sp-progress');
  const hdr=$('.site-header');
  const mz=$('#mz');
  const can=$('.mz-can');
  const steps=[...document.querySelectorAll('.mz-copy div')];
  const hero=$('.hero-monster-frame');
  let sy=scrollY,mx=0,my=0;

  function onScroll(){
    sy=scrollY;
    const h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform=`scaleX(${h?sy/h:0})`;
    hdr&&hdr.classList.toggle('scrolled',sy>30);

    if(mz&&can){
      const r=mz.getBoundingClientRect();
      const p=clamp(-r.top/Math.max(1,r.height-innerHeight));
      mz.style.setProperty('--p',p);

      if(!reduce){
        const sc=.86+Math.sin(p*Math.PI)*.17;
        const y=(.5-p)*5.5;
        const x=Math.sin(p*Math.PI*2)*1.6;
        const rz=Math.sin(p*Math.PI*2)*2.1;
        can.style.transform=`translate3d(${x}vw,${y}vh,0) rotateZ(${rz}deg) scale(${sc})`;
      }

      const i=Math.min(steps.length-1,Math.floor(p*steps.length));
      steps.forEach((s,k)=>s.classList.toggle('on',k===i&&p>.015));
    }
  }

  function moveHero(){
    if(!hero||reduce)return;
    const rx=-my*5.5;
    const ry=mx*7.5;
    hero.style.transform=`perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${mx*10}px,${my*8}px,0)`;
  }

  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('pointermove',e=>{
    mx=e.clientX/innerWidth-.5;
    my=e.clientY/innerHeight-.5;
    moveHero();
  },{passive:true});
  addEventListener('pointerleave',()=>{
    mx=0;my=0;
    if(hero)hero.style.transform='';
  });
  onScroll();

  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(x=>{
      if(x.isIntersecting){x.target.classList.add('visible');io.unobserve(x.target)}
    }),{threshold:.1,rootMargin:'0px 0px -36px 0px'});
    const watch=()=>document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible)').forEach(el=>io.observe(el));
    watch();
    new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
  }

  const tiltSelector='.home-brand-card,.product-card,.home-feature,.pw-service,.about-pro-card';
  document.addEventListener('pointermove',e=>{
    if(reduce||matchMedia('(pointer: coarse)').matches)return;
    const c=e.target.closest&&e.target.closest(tiltSelector);if(!c)return;
    const r=c.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`perspective(950px) rotateX(${-y*4.5}deg) rotateY(${x*5.5}deg) translateY(-3px)`;
  });
  document.addEventListener('pointerout',e=>{
    const c=e.target.closest&&e.target.closest(tiltSelector);
    if(c)c.style.transform='';
  });

  const intro=$('#intro');
  const go=()=>{intro&&intro.classList.add('done');document.body.classList.add('ready')};
  setTimeout(go,intro?700:0);
})();
