/* SwiftSupply presentation FX — shared motion + real loading progress. */
(()=>{
  const $=s=>document.querySelector(s);
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  document.body.dataset.proPage=file;

  // Keep the Monster viewer still by default. It remains manually rotatable by
  // the visitor, while the lower feature section only moves with page scroll.
  // The watermark flags are official Sketchfab embed options; Sketchfab may
  // still enforce branding if the model/account does not permit white-labeling.
  if(file==='index'){
    document.querySelectorAll('iframe.monster-viewer').forEach(frame=>{
      try{
        const url=new URL(frame.src,location.href);
        const params={
          autospin:'0',
          camera:'0',
          animation_autoplay:'0',
          ui_animations:'0',
          ui_hint:'0',
          ui_infos:'0',
          ui_controls:'0',
          ui_stop:'0',
          ui_help:'0',
          ui_settings:'0',
          ui_vr:'0',
          ui_fullscreen:'0',
          ui_watermark:'0',
          ui_watermark_link:'0'
        };
        Object.entries(params).forEach(([key,value])=>url.searchParams.set(key,value));
        const next=url.toString();
        if(frame.src!==next)frame.src=next;
      }catch(e){console.warn('Could not normalize Monster viewer settings',e)}
    });
  }

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
  const progress=$('#introProgress');
  let visualProgress=0;
  let targetProgress=0;
  let loaderDone=false;

  function setTarget(n){targetProgress=Math.max(targetProgress,Math.min(100,n));}
  function tickProgress(){
    if(!progress)return;
    visualProgress+=(targetProgress-visualProgress)*.11;
    if(targetProgress>=100&&100-visualProgress<.25)visualProgress=100;
    progress.style.width=`${visualProgress}%`;
    progress.setAttribute('aria-valuenow',String(Math.round(visualProgress)));
    if(!loaderDone)requestAnimationFrame(tickProgress);
  }

  function finishLoader(){
    if(loaderDone)return;
    setTarget(100);
    const complete=()=>{
      if(visualProgress<99.8){requestAnimationFrame(complete);return}
      visualProgress=100;
      if(progress)progress.style.width='100%';
      setTimeout(()=>{
        intro&&intro.classList.add('done');
        document.body.classList.add('ready');
        loaderDone=true;
      },180);
    };
    complete();
  }

  if(progress){
    progress.style.width='0%';
    progress.setAttribute('role','progressbar');
    progress.setAttribute('aria-valuemin','0');
    progress.setAttribute('aria-valuemax','100');
    tickProgress();
  }

  if(!intro){document.body.classList.add('ready');return}

  if(file!=='index'){
    setTarget(35);
    const done=()=>{setTarget(100);finishLoader()};
    if(document.readyState==='complete')done();else addEventListener('load',done,{once:true});
    setTimeout(done,7000);
    return;
  }

  const tracked=[...document.querySelectorAll('.js-loader-asset')];
  let loaded=0;
  const total=Math.max(1,tracked.length+1); // +1 for the page itself

  const mark=()=>{
    loaded++;
    setTarget(8+(loaded/total)*82);
    if(loaded>=total)finishLoader();
  };

  setTarget(8);
  tracked.forEach(el=>{
    let settled=false;
    const once=()=>{if(settled)return;settled=true;mark()};
    el.addEventListener('load',once,{once:true});
    el.addEventListener('error',once,{once:true});
  });

  const pageReady=()=>mark();
  if(document.readyState==='complete')pageReady();else addEventListener('load',pageReady,{once:true});

  // Never leave somebody stuck forever if a third-party viewer fails.
  setTimeout(()=>{
    setTarget(95);
    if(!loaderDone)finishLoader();
  },12000);
})();
