/* SwiftSupply presentation FX — shared motion + Sketchfab-controlled loading. */
(()=>{
  const $=s=>document.querySelector(s);
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const file=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
  document.body.dataset.proPage=file;

  if(!document.getElementById('sp-progress')){
    const bar=document.createElement('div');
    bar.id='sp-progress';
    document.body.appendChild(bar);
  }

  const bar=$('#sp-progress');
  const hdr=$('.site-header');
  const mz=$('#mz');
  const model=$('.mz-model-wrap');
  const steps=[...document.querySelectorAll('.mz-copy div')];

  function onScroll(){
    const sy=scrollY;
    const h=document.documentElement.scrollHeight-innerHeight;
    if(bar)bar.style.transform=`scaleX(${h?sy/h:0})`;
    if(hdr)hdr.classList.toggle('scrolled',sy>30);

    if(mz){
      const r=mz.getBoundingClientRect();
      const p=clamp(-r.top/Math.max(1,r.height-innerHeight));
      mz.style.setProperty('--p',p);

      if(model&&!reduce){
        const x=Math.sin(p*Math.PI*2)*1.5;
        const y=(.5-p)*4.5;
        const s=.9+Math.sin(p*Math.PI)*.12;
        const rz=Math.sin(p*Math.PI*2)*1.8;
        model.style.transform=`translate3d(${x}vw,${y}vh,0) rotateZ(${rz}deg) scale(${s})`;
      }

      const i=Math.min(steps.length-1,Math.floor(p*steps.length));
      steps.forEach((step,k)=>step.classList.toggle('on',k===i&&p>.015));
    }
  }
  addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    }),{threshold:.1,rootMargin:'0px 0px -36px 0px'});

    const watch=()=>document.querySelectorAll('.reveal:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible)').forEach(el=>io.observe(el));
    watch();
    new MutationObserver(watch).observe(document.body,{childList:true,subtree:true});
  }

  const tiltSelector='.home-brand-card,.product-card,.home-feature,.pw-service,.about-pro-card';
  document.addEventListener('pointermove',e=>{
    if(reduce||matchMedia('(pointer: coarse)').matches)return;
    const c=e.target.closest&&e.target.closest(tiltSelector);
    if(!c)return;
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
  const progress=$('#introProgress');
  let visualProgress=0;
  let targetProgress=0;
  let loaderDone=false;

  function setTarget(n){
    const next=Math.min(loaderDone?100:99,Math.max(0,n));
    targetProgress=Math.max(targetProgress,next);
  }

  function tickProgress(){
    if(!progress||loaderDone)return;
    visualProgress+=(targetProgress-visualProgress)*.12;
    if(Math.abs(targetProgress-visualProgress)<.08)visualProgress=targetProgress;
    progress.style.width=`${visualProgress}%`;
    progress.setAttribute('aria-valuenow',String(Math.round(visualProgress)));
    requestAnimationFrame(tickProgress);
  }

  function completeLoader(){
    if(loaderDone)return;
    loaderDone=true;
    targetProgress=100;

    const finishBar=()=>{
      visualProgress+=(100-visualProgress)*.2;
      if(100-visualProgress<.12)visualProgress=100;
      if(progress){
        progress.style.width=`${visualProgress}%`;
        progress.setAttribute('aria-valuenow',String(Math.round(visualProgress)));
      }
      if(visualProgress<100){
        requestAnimationFrame(finishBar);
        return;
      }
      setTimeout(()=>{
        intro&&intro.classList.add('done');
        document.body.classList.add('ready');
      },180);
    };
    finishBar();
  }

  if(progress){
    progress.style.width='0%';
    progress.setAttribute('role','progressbar');
    progress.setAttribute('aria-valuemin','0');
    progress.setAttribute('aria-valuemax','100');
    progress.setAttribute('aria-valuenow','0');
    requestAnimationFrame(tickProgress);
  }

  if(!intro){
    document.body.classList.add('ready');
    return;
  }

  if(file!=='index'){
    setTarget(55);
    const done=()=>{
      loaderDone=true;
      visualProgress=100;
      if(progress)progress.style.width='100%';
      intro.classList.add('done');
      document.body.classList.add('ready');
    };
    if(document.readyState==='complete')done();
    else addEventListener('load',done,{once:true});
    return;
  }

  const MODEL_UID='62f9706628244398804e23adeb2bc982';
  const viewers=[
    {name:'hero',frame:document.querySelector('.monster-viewer-hero iframe.monster-viewer')},
    {name:'scroll',frame:document.querySelector('.mz-model-wrap iframe.monster-viewer')}
  ].filter(v=>v.frame);

  const pageState={ready:document.readyState==='complete'?1:0};
  const viewerState=Object.fromEntries(viewers.map(v=>[v.name,{mesh:0,texture:0,ready:false,error:false,api:null}]));

  function allModelsReady(){
    return viewers.length>0&&viewers.every(v=>{
      const s=viewerState[v.name];
      return s.ready&&s.mesh>=.999&&s.texture>=.999&&!s.error;
    });
  }

  function updateLoaderFromReality(){
    // 10% = page, 45% = each of the two real Sketchfab models.
    // A model's share is based on actual mesh progress, texture progress,
    // and viewerready. The bar is hard-capped at 99 until both are truly ready.
    let p=pageState.ready*10;
    const share=viewers.length?90/viewers.length:90;
    viewers.forEach(v=>{
      const s=viewerState[v.name];
      const part=(s.mesh*.44)+(s.texture*.44)+(s.ready ? .12 : 0);
      p+=share*part;
    });
    setTarget(Math.min(99,p));

    if(pageState.ready&&allModelsReady())completeLoader();
  }

  function markPageReady(){
    pageState.ready=1;
    updateLoaderFromReality();
  }
  if(document.readyState==='complete')markPageReady();
  else addEventListener('load',markPageReady,{once:true});

  function loadSketchfabApi(){
    if(window.Sketchfab)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-sketchfab-api]');
      if(existing){
        existing.addEventListener('load',resolve,{once:true});
        existing.addEventListener('error',reject,{once:true});
        return;
      }
      const script=document.createElement('script');
      script.src='https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
      script.async=true;
      script.dataset.sketchfabApi='1';
      script.onload=resolve;
      script.onerror=reject;
      document.head.appendChild(script);
    });
  }

  function initViewer(viewer){
    return new Promise((resolve,reject)=>{
      const frame=viewer.frame;
      const state=viewerState[viewer.name];

      // client.init owns the iframe. Clearing the old embed first prevents the
      // page from keeping an independently running non-API viewer around.
      try{frame.src='about:blank'}catch(_e){}

      const client=new window.Sketchfab('1.12.1',frame);
      client.init(MODEL_UID,{
        autostart:1,
        autospin:0,
        animation_autoplay:0,
        camera:0,
        preload:1,
        transparent:1,
        dnt:1,
        scrollwheel:0,
        double_click:0,
        ui_hint:0,
        ui_infos:0,
        ui_controls:0,
        ui_stop:0,
        ui_help:0,
        ui_settings:0,
        ui_vr:0,
        ui_fullscreen:0,
        success(api){
          state.api=api;

          api.addEventListener('modelLoadProgress',factor=>{
            state.mesh=Math.max(state.mesh,Number(factor)||0);
            updateLoaderFromReality();
          });

          api.addEventListener('textureLoadProgress',factor=>{
            state.texture=Math.max(state.texture,Number(factor)||0);
            updateLoaderFromReality();
          });

          api.addEventListener('viewerready',()=>{
            state.ready=true;
            // Make the actual Sketchfab camera draggable/orbitable with the mouse.
            api.setUserInteraction(true,()=>{});
            updateLoaderFromReality();
            resolve(api);
          });

          api.start(()=>{});
        },
        error(err){
          state.error=true;
          console.error(`Sketchfab ${viewer.name} viewer failed to initialize`,err);
          updateLoaderFromReality();
          reject(err||new Error('Sketchfab viewer failed'));
        }
      });
    });
  }

  setTarget(4);
  loadSketchfabApi()
    .then(()=>Promise.all(viewers.map(initViewer)))
    .catch(err=>{
      // Do not lie with a 100% bar if the 3D models are not actually ready.
      // Keep the loader below 100 and expose the failure in the console.
      console.error('SwiftSupply 3D loading stopped before completion',err);
      setTarget(99);
    });
})();
