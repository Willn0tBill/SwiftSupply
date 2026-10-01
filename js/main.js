document.addEventListener("DOMContentLoaded", () => {
  const isAdmin=location.pathname.includes("/admin/");
  const prefix=isAdmin?"../":"";
  ["css/decor.css","css/mobile.css","css/store-upgrade.css","css/dark-theme.css","css/professional.css"].forEach(file=>{const link=document.createElement("link");link.rel="stylesheet";link.href=prefix+file;document.head.appendChild(link)});
  if(!isAdmin&&!document.querySelector('link[href$="css/pro.css"]')){const link=document.createElement('link');link.rel='stylesheet';link.href=prefix+'css/pro.css';document.head.appendChild(link)}
  const menuButton=document.querySelector(".menu-button"),navLinks=document.querySelector(".nav-links");

  if(navLinks&&!isAdmin&&!navLinks.querySelector('.power-washing-link')){
    const li=document.createElement('li');
    li.innerHTML=`<a class="nav-link power-washing-link" href="${prefix}power-washing.html">Power Washing</a>`;
    const adminItem=navLinks.querySelector('.admin-link')?.closest('li');
    if(adminItem)navLinks.insertBefore(li,adminItem);else navLinks.appendChild(li);
  }
  if(navLinks&&!isAdmin&&!navLinks.querySelector('.admin-link')){const li=document.createElement('li');li.innerHTML=`<a class="nav-link admin-link" href="${prefix}admin/">Admin</a>`;navLinks.appendChild(li)}
  if(navLinks&&!navLinks.querySelector('.cart-link')){const li=document.createElement('li');li.innerHTML=`<a class="nav-link cart-link" href="${prefix}checkout.html">Cart <span data-cart-count hidden>0</span></a>`;navLinks.appendChild(li)}

  if(menuButton&&navLinks){menuButton.addEventListener("click",()=>{const open=navLinks.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open))});navLinks.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{navLinks.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}))}

  if(isAdmin&&!document.querySelector('script[data-admin-powerwashing]')){
    const script=document.createElement('script');
    script.src=prefix+'js/admin-powerwashing.js';
    script.dataset.adminPowerwashing='true';
    document.body.appendChild(script);
  }

  function updateCartBadge(){let count=0;try{count=JSON.parse(localStorage.getItem('swiftsupplyCartV1')||'[]').reduce((n,i)=>n+Number(i.quantity||0),0)}catch{}document.querySelectorAll('[data-cart-count]').forEach(el=>{el.textContent=count;el.hidden=count===0})}updateCartBadge();window.addEventListener('cart-updated',updateCartBadge);window.addEventListener('storage',updateCartBadge);
  const revealElements=document.querySelectorAll(".reveal,.reveal-left,.reveal-right");if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)requestAnimationFrame(()=>entry.target.classList.add("visible"));else entry.target.classList.remove("visible")}),{threshold:.12,rootMargin:"0px 0px -45px 0px"});revealElements.forEach(element=>observer.observe(element))}else revealElements.forEach(element=>element.classList.add("visible"));
  const page=location.pathname.split("/").pop()||"index.html";document.querySelectorAll(".nav-link").forEach(link=>{if(link.getAttribute("href")===page)link.classList.add("active")});const year=document.querySelector("[data-year]");if(year)year.textContent=new Date().getFullYear();

  const hasProIntro=!!document.getElementById('intro');
  const isIntroPage=location.pathname.endsWith("/")||location.pathname.endsWith("/index.html");const reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(!hasProIntro&&isIntroPage&&!reduceMotion&&!sessionStorage.getItem("swiftsupplyIntroSeen")){const css=document.createElement("link");css.rel="stylesheet";css.href=prefix+"css/intro.css";document.head.appendChild(css);const intro=document.createElement("div");intro.id="siteIntro";intro.innerHTML='<div class="intro-orbs"><i class="intro-orb orb-1"></i><i class="intro-orb orb-2"></i><i class="intro-orb orb-3"></i><i class="intro-orb orb-4"></i><i class="intro-orb orb-5"></i><i class="intro-orb orb-6"></i></div><div class="intro-content"><div class="intro-logo-wrap"><span class="intro-ring"></span><img class="intro-logo" src="'+prefix+'assets/logo.png" alt="SwiftSupply logo"></div><div class="intro-greeting">Hey there!</div><div class="intro-name">Swift<span>Supply</span></div><div class="intro-tagline">Getting everything ready...</div><div class="intro-loader"><span></span></div><div class="intro-subline">Snacks. Drinks. Convenience.</div></div>';document.body.prepend(intro);document.body.classList.add("intro-active");const messages=["Getting everything ready...","Finding the good stuff...","Almost there..."];const tagline=intro.querySelector(".intro-tagline");let index=0;const timer=setInterval(()=>{index=(index+1)%messages.length;tagline.classList.add("intro-message-change");setTimeout(()=>{tagline.textContent=messages[index];tagline.classList.remove("intro-message-change")},140)},430);setTimeout(()=>{clearInterval(timer);intro.classList.add("intro-hide");document.body.classList.remove("intro-active");sessionStorage.setItem("swiftsupplyIntroSeen","1");setTimeout(()=>intro.remove(),500)},1200)}

  if(!isAdmin&&!document.querySelector('script[src$="js/pro-fx.js"]')){const script=document.createElement('script');script.src=prefix+'js/pro-fx.js';script.defer=true;document.body.appendChild(script)}
});
