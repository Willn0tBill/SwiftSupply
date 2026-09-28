document.addEventListener("DOMContentLoaded", () => {
  const isAdmin=location.pathname.includes("/admin/");
  const prefix=isAdmin?"../":"";
  ["css/decor.css","css/mobile.css","css/store-upgrade.css","css/dark-theme.css","css/professional.css"].forEach(file=>{const link=document.createElement("link");link.rel="stylesheet";link.href=prefix+file;document.head.appendChild(link)});
  const menuButton=document.querySelector(".menu-button"),navLinks=document.querySelector(".nav-links");

  if(navLinks&&!isAdmin){
    navLinks.innerHTML=`
      <li><a class="nav-link" data-section="home" href="${prefix}index.html">Home</a></li>
      <li><a class="nav-link" data-section="ssshop" href="${prefix}shop.html">Direct Ordering</a></li>
      <li><a class="nav-link" data-section="ssvm" href="${prefix}vending.html">Vending</a></li>
      <li><a class="nav-link power-washing-link" data-section="sspw" href="${prefix}power-washing.html">Power Washing</a></li>
      <li><a class="nav-link" data-section="about" href="${prefix}about.html">About SwiftSupply</a></li>
      <li><a class="nav-link" data-section="support" href="${prefix}support.html">Support</a></li>
      <li><a class="nav-link admin-link" data-section="admin" href="${prefix}admin/">Admin</a></li>
      <li><a class="nav-link cart-link" data-section="cart" href="${prefix}checkout.html">Cart <span data-cart-count hidden>0</span></a></li>`;
  }

  if(menuButton&&navLinks){menuButton.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open))});navLinks.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{navLinks.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}))}

  if(isAdmin){
    document.querySelectorAll('h3').forEach(heading=>{
      if(heading.textContent.trim()==='SS Importer')heading.textContent='SwiftSupply Importer';
      if(heading.textContent.trim()==='SS Updater')heading.textContent='SwiftSupply Updater';
    });
    if(!document.querySelector('script[data-admin-powerwashing]')){
      const script=document.createElement('script');
      script.src=prefix+'js/admin-powerwashing.js';
      script.dataset.adminPowerwashing='true';
      document.body.appendChild(script);
    }
  }

  function updateCartBadge(){let count=0;try{count=JSON.parse(localStorage.getItem('swiftsupplyCartV1')||'[]').reduce((n,i)=>n+Number(i.quantity||0),0)}catch{}document.querySelectorAll('[data-cart-count]').forEach(el=>{el.textContent=count;el.hidden=count===0})}updateCartBadge();window.addEventListener('cart-updated',updateCartBadge);window.addEventListener('storage',updateCartBadge);

  const revealElements=document.querySelectorAll(".reveal,.reveal-left,.reveal-right");if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)requestAnimationFrame(()=>entry.target.classList.add("visible"));else entry.target.classList.remove("visible")}),{threshold:.12,rootMargin:"0px 0px -45px 0px"});revealElements.forEach(element=>observer.observe(element))}else revealElements.forEach(element=>element.classList.add("visible"));

  if(navLinks&&!isAdmin){
    const page=location.pathname.split("/").pop()||"index.html";
    let section='';
    if(page==='index.html'||page==='')section='home';
    else if(['shop.html','stock.html','product.html','bulk-orders.html','alerts.html','requests.html','order.html','track.html'].includes(page))section='ssshop';
    else if(page==='vending.html')section='ssvm';
    else if(page==='power-washing.html')section='sspw';
    else if(['about.html','goal.html','faq.html'].includes(page))section='about';
    else if(page==='support.html')section='support';
    else if(page==='checkout.html')section='cart';

    document.body.dataset.ssSection=section||'swiftsupply';
    navLinks.querySelectorAll('.nav-link').forEach(link=>link.classList.toggle('active',link.dataset.section===section));

    const eyebrow=document.querySelector('.page-hero .eyebrow');
    if(eyebrow){
      const text=eyebrow.textContent.trim();
      if(section==='ssshop'&&!/^SWIFTSUPPLY DIRECT ORDERING\b/i.test(text))eyebrow.textContent='SWIFTSUPPLY DIRECT ORDERING · '+text;
      else if(section==='ssvm'&&!/^SWIFTSUPPLY VENDING\b/i.test(text))eyebrow.textContent='SWIFTSUPPLY VENDING · '+text;
      else if(section==='sspw'&&!/^SWIFTSUPPLY POWER WASHING\b/i.test(text))eyebrow.textContent='SWIFTSUPPLY POWER WASHING · '+text;
      else if(section==='support'&&!/^SWIFTSUPPLY\b/i.test(text))eyebrow.textContent='SWIFTSUPPLY · '+text;
    }

    document.querySelectorAll('.site-footer .footer-text').forEach(el=>{el.textContent='Direct Ordering · Vending · Power Washing. One SwiftSupply.'});
  }

  const year=document.querySelector("[data-year]");if(year)year.textContent=new Date().getFullYear();
  const isIntroPage=location.pathname.endsWith("/")||location.pathname.endsWith("/index.html");
  const reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(isIntroPage&&!reduceMotion&&!sessionStorage.getItem("swiftsupplyIntroSeen")){
    const css=document.createElement("link");css.rel="stylesheet";css.href=prefix+"css/intro.css";document.head.appendChild(css);
    const intro=document.createElement("div");intro.id="siteIntro";intro.innerHTML='<div class="intro-orbs"><i class="intro-orb orb-1"></i><i class="intro-orb orb-2"></i><i class="intro-orb orb-3"></i><i class="intro-orb orb-4"></i><i class="intro-orb orb-5"></i><i class="intro-orb orb-6"></i></div><div class="intro-content"><div class="intro-logo-wrap"><span class="intro-ring"></span><img class="intro-logo" src="'+prefix+'assets/logo.png" alt="SwiftSupply logo"></div><div class="intro-greeting">Hey there!</div><div class="intro-name">Swift<span>Supply</span></div><div class="intro-tagline">Getting SwiftSupply ready...</div><div class="intro-loader"><span></span></div><div class="intro-subline">Direct Ordering · Vending · Power Washing.</div></div>';
    document.body.prepend(intro);document.body.classList.add("intro-active");
    const messages=["Getting SwiftSupply ready...","Loading everything...","Almost there..."];const tagline=intro.querySelector(".intro-tagline");let index=0;
    const timer=setInterval(()=>{index=(index+1)%messages.length;tagline.classList.add("intro-message-change");setTimeout(()=>{tagline.textContent=messages[index];tagline.classList.remove("intro-message-change")},140)},430);
    setTimeout(()=>{clearInterval(timer);intro.classList.add("intro-hide");document.body.classList.remove("intro-active");sessionStorage.setItem("swiftsupplyIntroSeen","1");setTimeout(()=>intro.remove(),500)},1200)
  }
});