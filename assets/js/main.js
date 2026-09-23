/* =========================================================
   Ella / baflekcz — interakce webu
   Bez knihoven, aby web zůstal rychlý.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Mobilní menu ---------- */
  var burger = document.getElementById("burger");
  var mobileNav = document.getElementById("mobile-nav");

  function closeMenu() {
    if (!burger || !mobileNav) return;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Otevřít menu");
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  }

  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.setAttribute("aria-label", open ? "Otevřít menu" : "Zavřít menu");
      mobileNav.classList.toggle("is-open", !open);
      document.body.classList.toggle("no-scroll", !open);
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- 2. Stín hlavičky při scrollu ---------- */
  var header = document.getElementById("header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 3. Odkrývání obsahu při scrollu ---------- */
  var revealables = document.querySelectorAll(".reveal");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reducedMotion) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- 4. Videa: načtou se až po kliknutí ----------
     Dokud návštěvník neklikne, nenačítá se žádný skript
     TikToku ani YouTube — web je rychlejší a čistší z pohledu
     souhlasů se soubory cookie.
  --------------------------------------------------------- */
  document.querySelectorAll(".video-card__frame").forEach(function (frame) {
    frame.addEventListener("click", function () {
      var src = frame.getAttribute("data-embed");
      if (!src || frame.querySelector("iframe")) return;

      if (src.indexOf("ZDE_VLOZ_ID") !== -1) {
        console.warn("Video zatím nemá vyplněné ID – uprav data-embed v index.html.");
        return;
      }

      var iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.title = frame.getAttribute("aria-label") || "Video";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

      frame.innerHTML = "";
      frame.appendChild(iframe);
    });
  });

  /* ---------- 5. Zvýraznění aktivní položky v menu ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav__link");

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute("id");
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- 6. Plovoucí CTA na konzultaci ----------
     Objeví se, až návštěvník sroluje pod hero, a zase zmizí,
     když je sekce s konzultací sama na obrazovce.
  --------------------------------------------------------- */
  var ctaFloat = document.getElementById("cta-float");
  var heroEl = document.getElementById("domu");
  var konzultaceEl = document.getElementById("konzultace");

  if (ctaFloat && heroEl) {
    if ("IntersectionObserver" in window) {
      var zaHero = false;
      var uKonzultace = false;

      var prekresli = function () {
        ctaFloat.classList.toggle("is-visible", zaHero && !uKonzultace);
      };

      new IntersectionObserver(function (entries) {
        zaHero = !entries[0].isIntersecting;
        prekresli();
      }, { threshold: 0 }).observe(heroEl);

      if (konzultaceEl) {
        new IntersectionObserver(function (entries) {
          uKonzultace = entries[0].isIntersecting;
          prekresli();
        }, { threshold: 0.2 }).observe(konzultaceEl);
      }
    } else {
      ctaFloat.classList.add("is-visible");
    }

    ctaFloat.addEventListener("click", closeMenu);
  }

  /* ---------- 7. Rok v patičce ---------- */
  var rok = document.getElementById("rok");
  if (rok) rok.textContent = String(new Date().getFullYear());
})();
