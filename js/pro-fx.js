/* SwiftSupply presentation FX — shared motion + real Sketchfab model readiness. */
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
  const lowerWrap=$('.mz-model-wrap');
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
      if(lowerWrap&&!reduce){
        const x=Math.sin(p*Math.PI*2)*1.5;
        const y=(.5-p)*4.5;
        const s=.9+Math.sin(p*Math.PI)*.12;
        const rz=Math.sin(p*Math.PI*2)*1.8;
        lowerWrap.style.transform=`translate3d(${x}vw,${y}vh,0) rotateZ(${rz}deg) scale(${s})`;
      }
      const i=Math.min(steps.length-1,Math.floor(p*steps.length));
      steps.forEach((step,k)=>step.classList.toggle('on',k===i&&p>.015));
    }
  }
  addEventListener('scroll',onScroll,{passive:true});
  onScroll();

  if('IntersectionObserver'in window){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target)}
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
  let loaderFinished=false;

  function setTarget(n){
    targetProgress=Math.max(targetProgress,Math.min(loaderFinished?100:99,Math.max(0,n)));
  }

  function animateProgress(){
    if(!progress||loaderFinished)return;
    visualProgress+=(targetProgress-visualProgress)*.12;
    if(Math.abs(targetProgress-visualProgress)<.08)visualProgress=targetProgress;
    progress.style.width=`${visualProgress}%`;
    progress.setAttribute('aria-valuenow',String(Math.round(visualProgress)));
    requestAnimationFrame(animateProgress);
  }

  function revealPage(){
    if(loaderFinished)return;
    loaderFinished=true;
    targetProgress=100;
    const fill=()=>{
      visualProgress+=(100-visualProgress)*.22;
      if(100-visualProgress<.1)visualProgress=100;
      if(progress){
        progress.style.width=`${visualProgress}%`;
        progress.setAttribute('aria-valuenow',String(Math.round(visualProgress)));
      }
      if(visualProgress<100){requestAnimationFrame(fill);return}
      setTimeout(()=>{
        intro&&intro.classList.add('done');
        document.body.classList.add('ready');
      },160);
    };
    fill();
  }

  if(progress){
    progress.style.width='0%';
    progress.setAttribute('role','progressbar');
    progress.setAttribute('aria-valuemin','0');
    progress.setAttribute('aria-valuemax','100');
    progress.setAttribute('aria-valuenow','0');
    requestAnimationFrame(animateProgress);
  }

  if(!intro){document.body.classList.add('ready');return}

  if(file!=='index'){
    setTarget(70);
    const done=()=>revealPage();
    if(document.readyState==='complete')done();
    else addEventListener('load',done,{once:true});
    return;
  }

  const MODEL_UID='62f9706628244398804e23adeb2bc982';
  const viewers=[
    {name:'hero',frame:$('#monsterHeroViewer')},
    {name:'scroll',frame:$('#monsterScrollViewer')}
  ].filter(v=>v.frame);

  const pageReady={value:document.readyState==='complete'};
  const states=Object.fromEntries(viewers.map(v=>[v.name,{
    mesh:0,
    texture:0,
    preloadDone:false,
    viewerReady:false,
    error:false,
    api:null
  }]));

  function actualProgress(){
    let total=pageReady.value?10:0;
    const each=viewers.length?90/viewers.length:90;
    viewers.forEach(v=>{
      const s=states[v.name];
      const readyPart=s.viewerReady?0.1:0;
      const preloadPart=s.preloadDone?0.1:0;
      const part=(s.mesh*.4)+(s.texture*.4)+readyPart+preloadPart;
      total+=each*Math.min(1,part);
    });
    setTarget(Math.min(99,total));
  }

  function modelsAreActuallyVisible(){
    return viewers.length===2&&viewers.every(v=>{
      const s=states[v.name];
      return !s.error&&s.preloadDone&&s.viewerReady;
    });
  }

  function maybeFinish(){
    actualProgress();
    if(pageReady.value&&modelsAreActuallyVisible())revealPage();
  }

  const markPageReady=()=>{pageReady.value=true;maybeFinish()};
  if(document.readyState==='complete')markPageReady();
  else addEventListener('load',markPageReady,{once:true});

  function loadSketchfabApi(){
    if(window.Sketchfab)return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src='https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
      script.async=true;
      script.onload=resolve;
      script.onerror=()=>reject(new Error('Sketchfab Viewer API failed to load'));
      document.head.appendChild(script);
    });
  }

  function directFallback(frame){
    frame.src=`https://sketchfab.com/models/${MODEL_UID}/embed?autostart=1&autospin=0&preload=1&dnt=1&ui_theme=dark&ui_hint=0&ui_infos=0&ui_controls=0&ui_stop=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&ui_inspector=0&ui_ar=0`;
    frame.closest('.monster-viewer-shell,.mz-model-wrap')?.classList.add('viewer-ready');
  }

  function initViewer(viewer){
    return new Promise((resolve,reject)=>{
      const state=states[viewer.name];
      const client=new window.Sketchfab('1.12.1',viewer.frame);

      client.init(MODEL_UID,{
        autostart:0,
        autospin:0,
        animation_autoplay:0,
        camera:0,
        preload:1,
        transparent:0,
        dnt:1,
        scrollwheel:0,
        double_click:0,
        ui_theme:'dark',
        ui_hint:0,
        ui_infos:0,
        ui_controls:0,
        ui_stop:0,
        ui_help:0,
        ui_settings:0,
        ui_vr:0,
        ui_fullscreen:0,
        ui_annotations:0,
        ui_inspector:0,
        ui_ar:0,
        success(api){
          state.api=api;

          api.addEventListener('modelLoadProgress',factor=>{
            state.mesh=Math.max(state.mesh,Number(factor)||0);
            actualProgress();
          });

          api.addEventListener('textureLoadProgress',factor=>{
            state.texture=Math.max(state.texture,Number(factor)||0);
            actualProgress();
          });

          api.addEventListener('viewerready',()=>{
            // Force the viewer background to SwiftSupply's dark surface instead
            // of the model's white studio background.
            api.setBackground({color:[0.035,0.039,0.051]},()=>{});
            api.setUserInteraction(true,()=>{});

            state.viewerReady=true;
            viewer.frame.closest('.monster-viewer-shell,.mz-model-wrap')?.classList.add('viewer-ready');
            maybeFinish();
            resolve(api);
          });

          api.load(()=>{
            state.preloadDone=true;
            state.mesh=Math.max(state.mesh,1);
            actualProgress();
            api.start(()=>{});
          });
        },
        error(err){
          state.error=true;
          console.error(`Sketchfab ${viewer.name} viewer failed`,err);
          directFallback(viewer.frame);
          reject(err||new Error('Sketchfab viewer failed'));
        }
      });
    });
  }

  setTarget(3);
  loadSketchfabApi()
    .then(()=>Promise.all(viewers.map(initViewer)))
    .catch(err=>{
      console.error('Sketchfab API initialization failed; restoring direct embeds.',err);
      viewers.forEach(v=>directFallback(v.frame));
      setTarget(96);
    });
})();
