/* SwiftSupply presentation FX — shared motion around the scanned Monster model. */
(()=>{
  const $=s=>document.querySelector(s),clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.dataset.proPage=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';

  if(!$('#sp-progress')){const bar=document.createElement('div');bar.id='sp-progress';document.body.appendChild(bar)}
  const bar=$('#sp-progress'),hdr=$('.site-header'),mz=$('#mz'),lowerWrap=$('.mz-model-wrap'),steps=[...document.querySelectorAll('.mz-copy div')];

  function onScroll(){
    const sy=scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform=`scaleX(${h?sy/h:0})`;
    hdr?.classList.toggle('scrolled',sy>30);
    if(mz){
      const r=mz.getBoundingClientRect(),p=clamp(-r.top/Math.max(1,r.height-innerHeight));
      mz.style.setProperty('--p',p);
      if(lowerWrap&&!reduce){
        const y=(.5-p)*3.5,s=.92+Math.sin(p*Math.PI)*.12,rz=Math.sin(p*Math.PI*2)*1.2;
        lowerWrap.style.transform=`translate3d(0,${y}vh,0) rotateZ(${rz}deg) scale(${s})`;
      }
      const i=Math.min(steps.length-1,Math.floor(p*steps.length));
      steps.forEach((el,k)=>el.classList.toggle('on',k===i&&p>.015));
    }
  }
  addEventListener('scroll',onScroll,{passive:true});onScroll();

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
  if(!intro){document.body.classList.add('ready');return}
  let done=false,loaded=0;
  const frames=[...document.querySelectorAll('.monster-scan-viewer')];
  const finish=()=>{if(done)return;done=true;if(progress)progress.style.width='100%';setTimeout(()=>{intro.classList.add('done');document.body.classList.add('ready')},160)};
  if(progress)progress.style.width='25%';
  if(!frames.length){finish();return}
  frames.forEach(frame=>frame.addEventListener('load',()=>{loaded++;if(progress)progress.style.width=`${Math.min(92,25+loaded*(67/frames.length))}%`;if(loaded>=frames.length)finish()},{once:true}));
  setTimeout(finish,4200);
})();
