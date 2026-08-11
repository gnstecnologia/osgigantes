(() => {
  const WA = "5521995472334";

  /* Mobile menu */
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#main-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Hero carousel */
  const slides = [...document.querySelectorAll("[data-hero-slide]")];
  const dotsWrap = document.querySelector("[data-hero-dots]");
  let heroIndex = 0;
  let heroTimer;

  if (slides.length && dotsWrap) {
    slides.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Ir para banner ${i + 1}`);
      if (i === 0) btn.classList.add("is-active");
      btn.addEventListener("click", () => goHero(i));
      dotsWrap.appendChild(btn);
    });

    const dots = [...dotsWrap.children];

    function goHero(i) {
      slides[heroIndex].classList.remove("is-active");
      dots[heroIndex].classList.remove("is-active");
      heroIndex = (i + slides.length) % slides.length;
      slides[heroIndex].classList.add("is-active");
      dots[heroIndex].classList.add("is-active");
      restartHero();
    }

    function restartHero() {
      clearInterval(heroTimer);
      heroTimer = setInterval(() => goHero(heroIndex + 1), 6000);
    }

    document.querySelector("[data-hero-prev]")?.addEventListener("click", () => goHero(heroIndex - 1));
    document.querySelector("[data-hero-next]")?.addEventListener("click", () => goHero(heroIndex + 1));
    restartHero();
  }

  /* Infinite department marquee */
  function initMarquee(root) {
    const track = root.querySelector("[data-marquee-track]");
    if (!track) return;

    const originals = [...track.querySelectorAll("[data-marquee-item]")];
    if (!originals.length) return;

    // duplicate set for seamless loop
    originals.forEach((el) => track.appendChild(el.cloneNode(true)));

    let offset = 0;
    let paused = false;
    let last = performance.now();
    const speed = 40; // px/s

    function halfWidth() {
      return track.scrollWidth / 2;
    }

    function frame(now) {
      const dt = Math.min(40, now - last) / 1000;
      last = now;
      if (!paused) {
        offset += speed * dt;
        const half = halfWidth();
        if (half > 0 && offset >= half) offset -= half;
        track.style.transform = `translate3d(${-offset}px,0,0)`;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    const step = () => {
      const card = track.querySelector("[data-marquee-item]");
      return card ? card.getBoundingClientRect().width + 16 : 260;
    };

    root.querySelector("[data-marquee-prev]")?.addEventListener("click", () => {
      offset = Math.max(0, offset - step());
    });
    root.querySelector("[data-marquee-next]")?.addEventListener("click", () => {
      offset += step();
      const half = halfWidth();
      if (half > 0 && offset >= half) offset -= half;
    });

    root.addEventListener("mouseenter", () => { paused = true; });
    root.addEventListener("mouseleave", () => { paused = false; });
    root.addEventListener("focusin", () => { paused = true; });
    root.addEventListener("focusout", () => { paused = false; });
  }

  document.querySelectorAll("[data-marquee]").forEach(initMarquee);

  /* Offers carousel (infinite-ish) */
  function initOffers(root) {
    const track = root.querySelector("[data-offers-track]");
    if (!track) return;

    const items = [...track.querySelectorAll("[data-offers-item]")];
    if (!items.length) return;

    // clone for loop feel
    items.forEach((el) => track.appendChild(el.cloneNode(true)));

    let index = 0;
    let offset = 0;

    function cardStep() {
      const card = track.querySelector("[data-offers-item]");
      if (!card) return 276;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.gap) || 16;
      return card.getBoundingClientRect().width + gap;
    }

    function render(animate = true) {
      const step = cardStep();
      const total = items.length;
      if (index < 0) {
        index = total - 1;
        offset = index * step;
        track.style.transition = "none";
        track.style.transform = `translate3d(${-offset}px,0,0)`;
        // force reflow then continue
        void track.offsetWidth;
      }
      if (index >= total) {
        index = 0;
        offset = total * step;
        track.style.transition = "none";
        track.style.transform = `translate3d(${-offset}px,0,0)`;
        void track.offsetWidth;
        offset = 0;
      } else {
        offset = index * step;
      }
      track.style.transition = animate ? "transform .45s ease" : "none";
      track.style.transform = `translate3d(${-offset}px,0,0)`;
    }

    root.querySelector("[data-offers-prev]")?.addEventListener("click", () => {
      index -= 1;
      render(true);
    });
    root.querySelector("[data-offers-next]")?.addEventListener("click", () => {
      index += 1;
      render(true);
    });

    let auto = setInterval(() => {
      index += 1;
      render(true);
    }, 4500);

    root.addEventListener("mouseenter", () => clearInterval(auto));
    root.addEventListener("mouseleave", () => {
      auto = setInterval(() => {
        index += 1;
        render(true);
      }, 4500);
    });

    window.addEventListener("resize", () => render(false));
    render(false);
  }

  document.querySelectorAll("[data-offers]").forEach(initOffers);

  /* Orçamento → WhatsApp */
  const form = document.querySelector("[data-orcamento-form]");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const telefone = String(data.get("telefone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const lista = String(data.get("lista") || "").trim();
    const msg = [
      "Olá! Gostaria de solicitar um orçamento pelo site dos Gigantes.",
      `Nome: ${nome}`,
      `Telefone: ${telefone}`,
      email ? `E-mail: ${email}` : null,
      `Lista: ${lista}`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });

  /* FAQ: only one open */
  const faq = document.querySelector("[data-faq]");
  faq?.querySelectorAll("details").forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      faq.querySelectorAll("details").forEach((other) => {
        if (other !== d) other.open = false;
      });
    });
  });
})();
