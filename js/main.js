document.addEventListener("DOMContentLoaded", () => {
  const prefix = location.pathname.includes("/admin/") ? "../" : "";

  const decor = document.createElement("link");
  decor.rel = "stylesheet";
  decor.href = prefix + "css/decor.css";
  document.head.appendChild(decor);

  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.querySelector(".nav-links");
  if (menuButton && navLinks) {
    menuButton.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => entry.target.classList.add("visible"));
        } else {
          entry.target.classList.remove("visible");
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -45px 0px" });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.getAttribute("href") === page) link.classList.add("active");
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  const isIntroPage = location.pathname.endsWith("/") || location.pathname.endsWith("/index.html");
  if (isIntroPage && !sessionStorage.getItem("swiftsupplyIntroSeen")) {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = prefix + "css/intro.css";
    document.head.appendChild(css);

    const intro = document.createElement("div");
    intro.id = "siteIntro";
    intro.innerHTML = '<div class="intro-orbs"><i class="intro-orb orb-1"></i><i class="intro-orb orb-2"></i><i class="intro-orb orb-3"></i><i class="intro-orb orb-4"></i><i class="intro-orb orb-5"></i><i class="intro-orb orb-6"></i></div><div class="intro-content"><div class="intro-logo-wrap"><span class="intro-ring"></span><img class="intro-logo" src="' + prefix + 'assets/logo.png" alt="SwiftSupply logo"></div><div class="intro-greeting">Hey there!</div><div class="intro-name">Swift<span>Supply</span></div><div class="intro-tagline">Getting everything ready...</div><div class="intro-loader"><span></span></div><div class="intro-subline">Snacks. Drinks. Convenience.</div></div>';
    document.body.prepend(intro);
    document.body.classList.add("intro-active");

    const messages = ["Getting everything ready...", "Finding the good stuff...", "Almost there..."];
    const tagline = intro.querySelector(".intro-tagline");
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % messages.length;
      tagline.classList.add("intro-message-change");
      setTimeout(() => {
        tagline.textContent = messages[index];
        tagline.classList.remove("intro-message-change");
      }, 170);
    }, 520);

    setTimeout(() => {
      clearInterval(timer);
      intro.classList.add("intro-hide");
      document.body.classList.remove("intro-active");
      sessionStorage.setItem("swiftsupplyIntroSeen", "1");
      setTimeout(() => intro.remove(), 700);
    }, 1700);
  }
});