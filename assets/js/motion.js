/* =========================================================
   Ella / baflekcz — vrstva pohybu (motion layer)

   Doplněk k main.js. Nesahá na obsah, barvy ani na odesílání
   formulářů — řídí jen to, jak se stránka hýbe.

   Pravidla, která tenhle soubor drží:
     1. Animuje se transform, opacity a clip-path. Nic jiného.
     2. Uvnitř scroll/mousemove/rAF se nikdy nepřekresluje DOM
        strukturou — jen se zapisuje do style a CSS proměnných.
     3. Každá rAF smyčka je hlídaná IntersectionObserverem.
        Co není vidět, netiká.
     4. Každý posluchač je { passive: true } a ruší se při odpojení.
     5. prefers-reduced-motion vypíná všechno pohyblivé.

   Vypnout jeden efekt = smazat jeden řádek v poli EFEKTY dole.
   ========================================================= */
(function () {
  "use strict";

  /* =======================================================
     1. TOKENY POHYBU — jediný zdroj pravdy
     Drží se v zákrytu s :root v motion.css. Když se mění
     rytmus webu, mění se tady, ne v jednotlivých efektech.
     ======================================================= */
  var DUR = {
    micro:   0.25,
    base:    0.6,
    slow:    0.9,
    curtain: 1.1
  };
  var LERP = 0.14;   /* vyhlazení kurzoru: nižší = línější */

  var reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

  function prefersReducedMotion() { return reducedQuery.matches; }

  /* =======================================================
     2. JEDINÝ ZDROJ POZICE SCROLLU
     Každý efekt čte odsud, nikdy si nesahá na window.scrollY
     sám. Jeden pasivní posluchač, sloučený do jednoho rAF —
     deset efektů tak stojí jeden přepočet za snímek, ne deset.
     ======================================================= */
  var Scroll = (function () {
    var listeners = [];
    var ticking = false;
    var y = window.scrollY || 0;

    function flush() {
      ticking = false;
      for (var i = 0; i < listeners.length; i++) listeners[i](y);
    }

    function onScroll() {
      y = window.scrollY || 0;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(flush);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return {
      get y() { return y; },
      /** vrací funkci, která posluchače zase odebere */
      on: function (fn) {
        listeners.push(fn);
        fn(y);
        return function () {
          var i = listeners.indexOf(fn);
          if (i > -1) listeners.splice(i, 1);
        };
      }
    };
  })();

  /* =======================================================
     3. PRŮBĚH PRVKU PŘI SCROLLU  (0 vstupuje → 1 odchází)
     Počítá se jen když je prvek v dohledu. Výsledek jde rovnou
     do callbacku, který zapisuje do stylu — žádná mezivrstva.
     ======================================================= */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function onProgress(el, write, opts) {
    opts = opts || {};
    var start = opts.start || 0;
    var end = typeof opts.end === "number" ? opts.end : 1;
    var raf = 0;
    var active = false;
    var last = -1;

    function frame() {
      var r = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      /* 0 = prvek se právě objevil zespodu, 1 = právě zmizel nahoře */
      var raw = 1 - (r.top + r.height) / (vh + r.height);
      var p = clamp((raw - start) / (end - start), 0, 1);
      /* zapisuje se jen při skutečné změně — šetří to style recalc */
      if (Math.abs(p - last) > 0.0005) {
        last = p;
        write(p);
      }
      if (active) raf = requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      var wasActive = active;
      active = entries[0].isIntersecting;
      if (active && !wasActive) raf = requestAnimationFrame(frame);
      if (!active) cancelAnimationFrame(raf);
    }, { rootMargin: "15% 0px" });

    io.observe(el);
    frame();   /* jeden výpočet hned, aby prvek nezačínal ve špatném stavu */

    return function () { io.disconnect(); cancelAnimationFrame(raf); };
  }

  /** Jednorázové odkrytí, když prvek vstoupí do výřezu. */
  function onEnter(el, fn, margin) {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      fn(el);
    }, { rootMargin: margin || "-12% 0px", threshold: 0.01 });
    io.observe(el);
  }

  /* =======================================================
     EFEKTY
     Každý je samostatný. Když se jeden odstraní z pole EFEKTY
     na konci souboru, zbytek běží dál beze změny.
     ======================================================= */

  /* ---- 4. Opona mezi stránkami (§5.C) ------------------
     Nahrazuje rozmazání celé stránky, které by na každý snímek
     nutilo prohlížeč překreslit celý viewport. Tohle animuje
     výšku dvou ploch a schová přitom i přeskládání nové stránky.
     ------------------------------------------------------ */
  function curtain() {
    if (prefersReducedMotion()) return;

    var el = document.createElement("div");
    el.className = "curtain is-closed";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="curtain__panel curtain__panel--top"></div>' +
      '<div class="curtain__panel curtain__panel--bottom"></div>';
    document.body.appendChild(el);

    function open() {
      requestAnimationFrame(function () {
        el.classList.remove("is-leaving");
        el.classList.remove("is-closed");
      });
    }

    /* Otevřít po načtení i po návratu tlačítkem Zpět (bfcache). */
    /* Úvodní opona je krátká schválně: hero se nesmí schovávat
       o nic déle, než trvá, než se stránka vykreslí. */
    if (document.readyState === "complete") setTimeout(open, 60);
    else window.addEventListener("load", function () { setTimeout(open, 60); });
    window.addEventListener("pageshow", function (e) { if (e.persisted) open(); });

    /* Zavřít před odchodem na jinou stránku téhož webu. */
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;
      if (a.origin !== window.location.origin) return;
      /* kotvy v rámci stránky nechávám na nativním scrollu */
      if (a.hash && a.pathname === window.location.pathname) return;
      if (a.protocol !== "http:" && a.protocol !== "https:") return;

      e.preventDefault();
      el.classList.add("is-leaving");
      el.classList.add("is-closed");
      var href = a.href;
      /* Navigace až po dojetí opony; fallback kdyby transitionend nedorazil. */
      var done = false;
      var go = function () { if (done) return; done = true; window.location.href = href; };
      el.querySelector(".curtain__panel").addEventListener("transitionend", go, { once: true });
      setTimeout(go, DUR.curtain * 1000 + 160);
    });
  }

  /* ---- 5. Kurzor v blend režimu (§5.J) -----------------
     Jen myš, nikdy dotyk. Pozice se dopočítává lerpem, takže
     kurzor drobně zaostává za ukazatelem — to je celá iluze váhy.
     ------------------------------------------------------ */
  function cursor() {
    if (prefersReducedMotion() || !pointerQuery.matches) return;

    var el = document.createElement("div");
    el.className = "cursor";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<span class="cursor__label"></span>';
    document.body.appendChild(el);
    document.documentElement.classList.add("cursor-none");

    var label = el.querySelector(".cursor__label");
    var pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var target = { x: pos.x, y: pos.y };
    var size = 14;
    var text = "";

    function setState(nextSize, nextText, visible) {
      if (nextSize !== size) {
        size = nextSize;
        el.style.width = size + "px";
        el.style.height = size + "px";
        el.classList.toggle("is-wide", size >= 48);
      }
      if (nextText !== text) {
        text = nextText;
        label.textContent = text;
      }
      el.classList.toggle("is-visible", visible);
    }

    /* Dokud myš nepohne, kurzor nesmí být vidět — jinak by po načtení
       svítil uprostřed stránky, i když s ním nikdo nehýbal. */
    var moved = false;

    document.addEventListener("mousemove", function (e) {
      if (!moved) {
        moved = true;
        pos.x = target.x = e.clientX;
        pos.y = target.y = e.clientY;
      }
      target.x = e.clientX;
      target.y = e.clientY;

      var t = e.target;
      var hit = t && t.closest ? t : null;
      if (!hit) { setState(14, "", true); return; }

      if (hit.closest('[data-cursor="view"]'))      setState(88, "Přehrát", true);
      else if (hit.closest('[data-cursor="drag"]')) setState(88, "Táhni", true);
      else if (hit.closest('[data-cursor="hide"]')) setState(0, "", false);
      else if (hit.closest("a, button, input, textarea, select, [tabindex]")) setState(44, "", true);
      else setState(14, "", true);
    }, { passive: true });

    document.addEventListener("mouseleave", function () { el.classList.remove("is-visible"); });

    var raf = requestAnimationFrame(function loop() {
      if (!moved) { raf = requestAnimationFrame(loop); return; }
      pos.x += (target.x - pos.x) * LERP;
      pos.y += (target.y - pos.y) * LERP;
      el.style.transform =
        "translate3d(" + pos.x.toFixed(2) + "px," + pos.y.toFixed(2) + "px,0) translate(-50%,-50%)";
      raf = requestAnimationFrame(loop);
    });

    /* Když si někdo vybere klávesnici, myší kurzor nemá co dělat. */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      el.classList.remove("is-visible");
    }, { passive: true });
  }

  /* ---- 6. Magnetická tlačítka (§5.D) -------------------
     Tlačítko se přitáhne dřív, než na něj ukazatel dojede.
     Posun nese obal, takže vlastní :hover tlačítka zůstává
     přesně takový, jaký byl — vizuální identita se nemění.
     ------------------------------------------------------ */
  function magnetic() {
    if (prefersReducedMotion() || !pointerQuery.matches) return;

    var nodes = document.querySelectorAll("[data-magnetic]");
    if (!nodes.length) return;

    Array.prototype.forEach.call(nodes, function (node) {
      var strength = parseFloat(node.getAttribute("data-magnetic")) || 0.22;

      /* Obal = magnetické pole. Záporný margin ruší padding,
         takže prvek v layoutu zabírá přesně to co dřív. */
      var field = document.createElement("span");
      field.className = "magnet";
      var pull = document.createElement("span");
      pull.className = "magnet__pull";

      node.parentNode.insertBefore(field, node);
      field.appendChild(pull);
      pull.appendChild(node);

      /* Vnitřek tlačítka se schválně nepřebaluje. Obalit obsah do
         dalšího prvku kvůli "hloubce" měnilo flex layout tlačítka
         (výška 51 → 49 px) — a vzhled tlačítek není co měnit.
         Magnetický tah drží obal, tlačítko zůstává, jak bylo. */

      var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, running = false;

      function loop() {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        pull.style.setProperty("--mx", cx.toFixed(2) + "px");
        pull.style.setProperty("--my", cy.toFixed(2) + "px");

        /* Doběhlo to? Smyčku zastavíme, ať netiká naprázdno. */
        if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05 && tx === 0 && ty === 0) {
          running = false;
          return;
        }
        raf = requestAnimationFrame(loop);
      }

      function start() {
        if (running) return;
        running = true;
        raf = requestAnimationFrame(loop);
      }

      field.addEventListener("mousemove", function (e) {
        var r = node.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * strength;
        ty = (e.clientY - (r.top + r.height / 2)) * strength;
        start();
      }, { passive: true });

      field.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
        start();
      }, { passive: true });

      /* Klávesnice magnet neřeší — focus musí zůstat na místě. */
      node.addEventListener("blur", function () { tx = 0; ty = 0; start(); });
    });
  }

  /* ---- 7. Nadpis po slovech (§5.E) ---------------------
     Text se rozpadne na slova, každé dostane masku. Vnořené
     značky (<em>, <span class="line">) zůstanou, protože se
     obalují jen textové uzly — ne celý nadpis.
     ------------------------------------------------------ */
  function maskedText() {
    var nodes = document.querySelectorAll("[data-masked]");
    if (!nodes.length) return;

    if (prefersReducedMotion()) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add("is-revealed"); });
      return;
    }

    Array.prototype.forEach.call(nodes, function (node) {
      var original = node.textContent.replace(/\s+/g, " ").trim();
      var index = 0;

      /* Textové uzly posbírám dopředu — během obalování se strom mění. */
      var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
      var texts = [];
      var t;
      while ((t = walker.nextNode())) if (t.nodeValue.trim()) texts.push(t);

      texts.forEach(function (textNode) {
        var frag = document.createDocumentFragment();
        /* Dělení, které si nechává mezery jako samostatné kusy. */
        textNode.nodeValue.split(/(\s+)/).forEach(function (chunk) {
          if (!chunk) return;
          if (!chunk.trim()) { frag.appendChild(document.createTextNode(chunk)); return; }

          var word = document.createElement("span");
          word.className = "mtx-word";
          var inner = document.createElement("span");
          inner.className = "mtx-inner";
          inner.style.setProperty("--i", String(index++));
          inner.textContent = chunk;
          word.appendChild(inner);
          frag.appendChild(word);
        });
        textNode.parentNode.replaceChild(frag, textNode);
      });

      /* Rozsekaný text čte odečítač špatně, proto mu dám celou větu. */
      if (original) node.setAttribute("aria-label", original);

      onEnter(node, function () { node.classList.add("is-revealed"); }, "-18% 0px");
    });
  }

  /* ---- 8. Postupné odkrývání skupin (§5.E) ------------- */
  function stagger() {
    var nodes = document.querySelectorAll("[data-stagger]");
    Array.prototype.forEach.call(nodes, function (node) {
      if (prefersReducedMotion()) { node.classList.add("is-revealed"); return; }
      onEnter(node, function () { node.classList.add("is-revealed"); });
    });
  }

  /* ---- 9. Odkrytí maskou (§5.G) ------------------------
     clip-path místo výšky: nespouští layout a nikdy nepostrčí
     sousedy. Místo pro prvek je rezervované od začátku.
     ------------------------------------------------------ */
  function clipReveal() {
    var nodes = document.querySelectorAll('[data-reveal="clip"]');
    Array.prototype.forEach.call(nodes, function (node) {
      if (prefersReducedMotion()) { node.style.setProperty("--mask-progress", "100"); return; }
      onProgress(node, function (p) {
        /* odkryto během první třetiny průchodu výřezem */
        var v = clamp(p / 0.34, 0, 1);
        node.style.setProperty("--mask-progress", (v * 100).toFixed(1));
      });
    });
  }

  /* ---- 10. Paralaxa (§5.H) -----------------------------
     Malé posuny, velký rozdíl. Na text se nesahá.
     ------------------------------------------------------ */
  function parallax() {
    if (prefersReducedMotion()) return;
    var nodes = document.querySelectorAll("[data-parallax]");

    Array.prototype.forEach.call(nodes, function (node) {
      var speed = parseFloat(node.getAttribute("data-parallax")) || 0.12;
      var inner = node.firstElementChild;
      if (!inner) return;
      onProgress(node, function (p) {
        var shift = (0.5 - p) * speed * 200;   /* v procentech výšky prvku */
        inner.style.transform = "translate3d(0," + shift.toFixed(2) + "%,0)";
      });
    });
  }

  /* ---- 11. Otevírající se rámeček videa (§5.F) ---------
     Podpisový moment stránky. Video se nikdy nezvětšuje —
     drží celou plochu a mění se jen maska kolem něj. Proto to
     čte jako otevírající se clona, ne jako zoom.
     ------------------------------------------------------ */
  function expandingMedia() {
    if (prefersReducedMotion()) return;
    var hero = document.getElementById("domu");
    var frame = hero && hero.querySelector(".hero__video");
    if (!frame) return;

    /* Tady se schválně nepoužívá onProgress: ten počítá průchod prvku
       výřezem, a hero je na začátku stránky už z poloviny "prošlé" —
       rámeček by byl otevřený hned při načtení. Postup se proto váže
       rovnou na pozici scrollu, která je nahoře nula. */
    var last = -1;
    Scroll.on(function (y) {
      var vh = window.innerHeight || 800;
      var v = clamp(y / (vh * 0.62), 0, 1);
      if (Math.abs(v - last) < 0.0015) return;
      last = v;
      frame.style.setProperty("--frame", v.toFixed(4));
    });
  }

  /* ---- 12. Spodní běžící pás v blend režimu (§5.I) -----
     mix-blend-mode: difference znamená, že je pás čitelný na
     každém podkladu — tmavý na světlém, převrácený na fotce —
     bez jediné podmínky v kódu. To je celý smysl.
     ------------------------------------------------------ */
  function blendBar() {
    if (prefersReducedMotion() || !pointerQuery.matches) return;

    var words = ["Správa sociálních sítí", "Tvorba obsahu", "Videoeditace", "Natáčení", "Konzultace"];
    var row = words.map(function (w) {
      return '<span class="blend-bar__item">' + w + '<span class="blend-bar__dash"></span></span>';
    }).join("");

    var el = document.createElement("div");
    el.className = "blend-bar";
    el.setAttribute("aria-hidden", "true");
    /* obsah musí být dvakrát — jinak by skok na -50 % nebyl plynulý */
    el.innerHTML = '<div class="blend-bar__track">' + row + row + "</div>";
    document.body.appendChild(el);

    /* Plovoucí CTA se o výšku pásu zvedne, ať se nepřekrývají.
       Nastavuje se jednou při startu, ne až se pás vysune: jinak by
       CTA v půlce stránky o 42 px poskočilo. Hodnota se kryje
       s výškou .blend-bar v motion.css. */
    document.documentElement.style.setProperty("--blend-bar-h", "42px");

    var shown = false;
    Scroll.on(function (y) {
      var next = y > window.innerHeight * 0.4;
      if (next === shown) return;
      shown = next;
      el.classList.toggle("is-visible", shown);
    });
  }

  /* ---- 13. Ukazatel průběhu čtení (§5.K) --------------- */
  function scrollProgress() {
    if (prefersReducedMotion()) return;

    var el = document.createElement("div");
    el.className = "scroll-progress";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);

    Scroll.on(function (y) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      el.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : "0");
    });
  }

  /* =======================================================
     14. REGISTR EFEKTŮ
     Jeden řádek = jeden efekt. Smazat řádek = vypnout efekt,
     aniž by se čehokoli jiného dotklo.
     ======================================================= */
  var EFEKTY = [
    curtain,         /* §5.C  opona mezi stránkami */
    cursor,          /* §5.J  kurzor v blend režimu */
    magnetic,        /* §5.D  magnetická tlačítka */
    maskedText,      /* §5.E  nadpisy po slovech */
    stagger,         /* §5.E  postupné odkrývání skupin */
    clipReveal,      /* §5.G  odkrytí maskou */
    parallax,        /* §5.H  paralaxa */
    expandingMedia,  /* §5.F  otevírající se rámeček videa */
    blendBar,        /* §5.I  spodní běžící pás */
    scrollProgress   /* §5.K  ukazatel průběhu čtení */
  ];

  function start() {
    EFEKTY.forEach(function (efekt) {
      /* Jeden spadlý efekt nesmí shodit zbytek stránky. */
      try { efekt(); } catch (err) {
        if (window.console) console.warn("Efekt selhal:", efekt.name, err);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
