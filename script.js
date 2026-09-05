(() => {
  "use strict";

  /* =========================================================
     THE JOURNEY — Teacher's Day Website
     Nishtha Saraf
     ========================================================= */

  /* ---------- Helpers ---------- */

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isMobile = () =>
    window.matchMedia &&
    (window.matchMedia("(max-width: 980px)").matches ||
      "ontouchstart" in window);

  const lerp = (a, b, n) => a + (b - a) * n;

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  /* ---------- Letter wrapping ---------- */

  function wrapLetters(el) {
    if (!el || el.dataset.wrapped) return;

    const text = el.textContent;

    el.dataset.wrapped = "1";
    el.innerHTML = "";

    [...text].forEach((char) => {
      const span = document.createElement("span");

      span.textContent =
        char === " " ? "\u00A0" : char;

      el.appendChild(span);
    });
  }

  $$(".letters").forEach(wrapLetters);

  /* ---------- Image fallbacks ---------- */

  function fallbackPortrait(kind) {
    const box = document.createElement("div");
    box.className = "fallback-portrait";
    box.textContent = kind === "nishtha" ? "NS" : "SIR";
    return box;
  }

  $$("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.failed) return;
      img.dataset.failed = "1";
      img.replaceWith(fallbackPortrait(img.dataset.fallback));
    });
  });

  /* ---------- Loader ---------- */

  const loader = $("#loader");
  const bar = $(".loader-bar");
  const done = $(".loader-done");

  function hideLoader() {
    if (!loader) return;

    if (window.gsap && done) {
      gsap.to(done, {
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      });

      gsap.to(loader, {
        opacity: 0,
        duration: 0.45,
        delay: 0.35,
        onComplete: () => loader.remove(),
      });
    } else {
      loader.style.opacity = "0";
      setTimeout(() => loader.remove(), 500);
    }
  }

  if (window.gsap && bar) {
    gsap.to(bar, {
      width: "100%",
      duration: reduce ? 0.2 : 0.72,
      ease: "power1.inOut",
      onComplete: hideLoader,
    });
  } else {
    if (bar) bar.style.width = "100%";
    setTimeout(hideLoader, 400);
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */

  const cursor = $(".cursor");
  const ring = $(".cursor-ring");
  const dot = $(".cursor-dot");
  const label = $(".cursor-label");

  const mouse = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  };

  const ringPos = {
    x: mouse.x,
    y: mouse.y,
  };

  if (
    !isMobile() &&
    cursor &&
    ring &&
    dot &&
    label &&
    window.gsap
  ) {
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      gsap.set(dot, {
        x: e.clientX,
        y: e.clientY,
      });
    });

    gsap.ticker.add(() => {
      ringPos.x = lerp(
        ringPos.x,
        mouse.x,
        0.18
      );

      ringPos.y = lerp(
        ringPos.y,
        mouse.y,
        0.18
      );

      gsap.set(ring, {
        x: ringPos.x,
        y: ringPos.y,
      });

      gsap.set(label, {
        x: ringPos.x,
        y: ringPos.y,
      });
    });

    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        label.textContent =
          (el.dataset.cursor || "view").toUpperCase();

        gsap.to(ring, {
          width: 72,
          height: 72,
          duration: 0.35,
          ease: "power3.out",
        });

        gsap.to(label, {
          opacity: 1,
          duration: 0.2,
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(ring, {
          width: 38,
          height: 38,
          duration: 0.35,
          ease: "power3.out",
        });

        gsap.to(label, {
          opacity: 0,
          duration: 0.2,
        });
      });
    });
  } else if (cursor) {
    cursor.style.display = "none";
    document.body.style.cursor = "auto";
  }

  /* =========================================================
     LIGHT TRAILS
     ========================================================= */

  const trailCanvas = $("#trails");
  const trailPts = [];

  if (trailCanvas) {
    const ctx = trailCanvas.getContext("2d");

    if (ctx) {
      const resizeTrail = () => {
        trailCanvas.width = window.innerWidth;
        trailCanvas.height = window.innerHeight;
      };

      resizeTrail();

      window.addEventListener(
        "resize",
        resizeTrail
      );

      window.addEventListener(
        "mousemove",
        (e) => {
          if (isMobile() || reduce) return;

          trailPts.push({
            x: e.clientX,
            y: e.clientY,
            a: 0.28,
          });

          if (trailPts.length > 18) {
            trailPts.shift();
          }
        }
      );

      const drawTrails = () => {
        ctx.clearRect(
          0,
          0,
          trailCanvas.width,
          trailCanvas.height
        );

        for (let i = 0; i < trailPts.length; i++) {
          const p = trailPts[i];

          p.a *= 0.92;

          ctx.beginPath();

          ctx.fillStyle =
            `rgba(232,180,184,${p.a})`;

          ctx.arc(
            p.x,
            p.y,
            2.2,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }

        requestAnimationFrame(drawTrails);
      };

      drawTrails();
    }
  }

  /* =========================================================
     MUSIC
     ========================================================= */

  const musicBtn = $("#musicBtn");

  let audio = null;
  let musicOk = false;

  try {
    audio = new Audio("assets/music.mp3");

    audio.loop = true;
    audio.preload = "auto";

    audio.addEventListener(
      "canplaythrough",
      () => {
        musicOk = true;

        if (musicBtn) {
          musicBtn.hidden = false;
        }
      },
      { once: true }
    );

    audio.addEventListener("error", () => {
      musicOk = false;

      if (musicBtn) {
        musicBtn.hidden = true;
      }
    });
  } catch (error) {
    musicOk = false;

    if (musicBtn) {
      musicBtn.hidden = true;
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener(
      "click",
      async () => {
        if (!audio || !musicOk) return;

        if (audio.paused) {
          try {
            await audio.play();

            musicBtn.classList.add("on");
          } catch (error) {
            musicBtn.hidden = true;
          }
        } else {
          audio.pause();

          musicBtn.classList.remove("on");
        }
      }
    );
  }

  /* =========================================================
     LENIS + SCROLLTRIGGER
     ========================================================= */

  let lenis = null;

  if (
    window.Lenis &&
    window.gsap &&
    window.ScrollTrigger
  ) {
    gsap.registerPlugin(ScrollTrigger);

    lenis = new Lenis({
      duration: reduce ? 0.6 : 1.12,
      smoothWheel: !reduce,
      wheelMultiplier: 0.92,
    });

    lenis.on(
      "scroll",
      ScrollTrigger.update
    );

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  /* =========================================================
     THREE.JS UNIVERSE
     ========================================================= */

  const world = {
    renderer: null,
    scene: null,
    camera: null,
    stars: null,
    dust: null,
    galaxy: null,
    planets: [],
    lights: {},
    stretch: 1,
    camZ: 6.2,
  };

  function createPalettePlanetTexture(type = "earth") {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const palettes = {
      earth: {
        ocean: "#164a70",
        oceanLight: "#287ca3",
        land: "#527b3d",
        landLight: "#8fa85b",
        landDark: "#304f2e",
      },
      mars: {
        base: "#9b4f35",
        light: "#c47756",
        dark: "#5b2d25",
      },
      gas: {
        base: "#d6a87c",
        light: "#f0d0a5",
        dark: "#8e6548",
      },
      moon: {
        base: "#858585",
        light: "#b5b5b5",
        dark: "#4d4d4d",
      },
    };

    const palette = palettes[type] || palettes.earth;

    if (type === "earth") {
      const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      oceanGradient.addColorStop(0, palette.oceanLight);
      oceanGradient.addColorStop(0.5, palette.ocean);
      oceanGradient.addColorStop(1, "#0b2945");
      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 35; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const width = 30 + Math.random() * 160;
        const height = 20 + Math.random() * 90;

        ctx.beginPath();
        for (let j = 0; j < 14; j++) {
          const angle = (j / 14) * Math.PI * 2;
          const px = x + Math.cos(angle) * width * (0.45 + Math.random() * 0.55);
          const py = y + Math.sin(angle) * height * (0.45 + Math.random() * 0.55);
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        const landGradient = ctx.createLinearGradient(
          x - width,
          y - height,
          x + width,
          y + height
        );
        landGradient.addColorStop(0, palette.landLight);
        landGradient.addColorStop(0.5, palette.land);
        landGradient.addColorStop(1, palette.landDark);
        ctx.fillStyle = landGradient;
        ctx.fill();
      }

      for (let i = 0; i < 45; i++) {
        ctx.beginPath();
        ctx.ellipse(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          20 + Math.random() * 80,
          4 + Math.random() * 15,
          Math.random() * Math.PI,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(255,255,255,0.20)";
        ctx.fill();
      }

      const iceGradient = ctx.createLinearGradient(0, 0, 0, 100);
      iceGradient.addColorStop(0, "rgba(255,255,255,0.95)");
      iceGradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = iceGradient;
      ctx.fillRect(0, 0, canvas.width, 90);
      ctx.save();
      ctx.translate(0, canvas.height);
      ctx.rotate(Math.PI);
      ctx.fillRect(0, 0, canvas.width, 90);
      ctx.restore();
    }

    if (type === "mars") {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, palette.light);
      gradient.addColorStop(0.45, palette.base);
      gradient.addColorStop(1, palette.dark);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 80; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 2 + Math.random() * 16;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5
          ? "rgba(50,25,20,0.30)"
          : "rgba(240,160,120,0.18)";
        ctx.fill();
      }

      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.ellipse(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          30 + Math.random() * 120,
          10 + Math.random() * 40,
          Math.random() * Math.PI,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "rgba(55,25,20,0.12)";
        ctx.fill();
      }
    }

    if (type === "gas") {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#b9865e");
      gradient.addColorStop(0.2, "#ead0a9");
      gradient.addColorStop(0.4, "#9c7354");
      gradient.addColorStop(0.55, "#e6c49b");
      gradient.addColorStop(0.75, "#806047");
      gradient.addColorStop(1, "#3f3028");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 35; i++) {
        ctx.fillStyle = i % 3 === 0
          ? "rgba(255,245,220,0.13)"
          : "rgba(50,30,20,0.08)";
        ctx.fillRect(0, (i / 35) * canvas.height, canvas.width, 6 + Math.random() * 18);
      }

      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.68, canvas.height * 0.58, 80, 35, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(125,55,35,0.48)";
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.68, canvas.height * 0.58, 50, 20, -0.1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(245,210,170,0.35)";
      ctx.fill();
    }

    if (type === "moon") {
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.35,
        canvas.height * 0.35,
        10,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.7
      );
      gradient.addColorStop(0, "#d2d2d2");
      gradient.addColorStop(0.55, palette.base);
      gradient.addColorStop(1, "#333333");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 110; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 2 + Math.random() * 14;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(30,30,30,0.25)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - radius * 0.25, y - radius * 0.25, radius * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(220,220,220,0.12)";
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }

  function createLegacyRealisticPlanetTexture(type) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const image = ctx.createImageData(canvas.width, canvas.height);
    const noise = (x, y, scale = 1) => (
      Math.sin(x * 12.9898 * scale + y * 78.233) *
      Math.cos(y * 4.1414 * scale + x * 37.719)
    );

    for (let y = 0; y < canvas.height; y++) {
      const v = y / canvas.height;

      for (let x = 0; x < canvas.width; x++) {
        const u = x / canvas.width;
        let r = 0;
        let g = 0;
        let b = 0;

        if (type === "earth") {
          const n1 = noise(u, v, 1);
          const n2 = noise(u, v, 3);
          const n3 = noise(u, v, 7);
          const land = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

          if (land > 0.12) {
            r = 45 + land * 80;
            g = 85 + land * 95;
            b = 35 + land * 45;
          } else {
            r = 15;
            g = 65 + land * 25;
            b = 120 + land * 65;
          }

          if (v < 0.08 || v > 0.92) {
            r = 220;
            g = 235;
            b = 245;
          }

          const clouds = Math.sin(u * 55 + v * 9) * Math.sin(u * 17 - v * 31);
          if (clouds > 0.48) {
            r = 225;
            g = 235;
            b = 240;
          }
        } else if (type === "mars") {
          const n = noise(u, v, 2) * 0.5 + noise(u, v, 8) * 0.5;
          r = 145 + n * 65;
          g = 48 + n * 30;
          b = 30 + n * 20;
          if (n < -0.25) {
            r *= 0.65;
            g *= 0.65;
            b *= 0.65;
          }
        } else if (type === "jupiter") {
          const band = Math.sin(v * Math.PI * 22);
          const turbulence = noise(u, v, 5) * 25;

          if (band > 0.25) {
            r = 205 + turbulence;
            g = 180 + turbulence;
            b = 145 + turbulence;
          } else if (band < -0.25) {
            r = 155 + turbulence;
            g = 120 + turbulence;
            b = 90 + turbulence;
          } else {
            r = 190 + turbulence;
            g = 160 + turbulence;
            b = 125 + turbulence;
          }

          const dx = u - 0.68;
          const dy = v - 0.57;
          const spot = dx * dx * 8 + dy * dy * 35;
          if (spot < 0.055) {
            r = 180;
            g = 75;
            b = 50;
          }
        } else if (type === "saturn") {
          const band = Math.sin(v * Math.PI * 18);
          r = band > 0 ? 210 : 175;
          g = band > 0 ? 190 : 145;
          b = band > 0 ? 135 : 105;
          const detail = noise(u, v, 6) * 15;
          r += detail;
          g += detail;
          b += detail;
        } else if (type === "venus") {
          const clouds = Math.sin(u * 30 + v * 15) * Math.sin(u * 12 - v * 25);
          r = 210 + clouds * 25;
          g = 175 + clouds * 22;
          b = 95 + clouds * 18;
        } else if (type === "mercury") {
          const n = noise(u, v, 5) * 0.5 + noise(u, v, 12) * 0.5;
          r = 105 + n * 55;
          g = 105 + n * 55;
          b = 100 + n * 50;
          const crater = Math.sin(u * 75) * Math.sin(v * 42);
          if (crater > 0.82) {
            r *= 0.65;
            g *= 0.65;
            b *= 0.65;
          }
        }

        const index = (y * canvas.width + x) * 4;
        image.data[index] = Math.max(0, Math.min(255, r));
        image.data[index + 1] = Math.max(0, Math.min(255, g));
        image.data[index + 2] = Math.max(0, Math.min(255, b));
        image.data[index + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }

  function createLegacyPlanetTexture(type = "earth") {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const texture = ctx.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const nx = x / canvas.width;
        const ny = y / canvas.height;
        let r = 0;
        let g = 0;
        let b = 0;

        if (type === "earth") {
          const noise = Math.sin(nx * 18) * Math.cos(ny * 13) + Math.sin(nx * 45 + ny * 17) * 0.35;
          const land = Math.sin(nx * 15 + noise) * Math.cos(ny * 10);

          if (land > 0.15) {
            r = 55;
            g = 120;
            b = 65;
          } else {
            r = 25;
            g = 90;
            b = 170;
          }

          const clouds = Math.sin(nx * 35 + ny * 12) * Math.cos(nx * 17 - ny * 23);
          if (clouds > 0.45) {
            r += 90;
            g += 90;
            b += 90;
          }
        } else if (type === "mars") {
          const terrain = Math.sin(nx * 32) * Math.cos(ny * 19) + Math.sin(nx * 70 + ny * 21) * 0.4;
          r = 145 + terrain * 35;
          g = 55 + terrain * 18;
          b = 35 + terrain * 12;
        } else if (type === "gas") {
          const bands = Math.sin(ny * 35) * 0.5 + 0.5;
          r = 190 + bands * 50;
          g = 130 + bands * 45;
          b = 75 + bands * 35;
          const storm = Math.sin(nx * 20) * Math.cos(ny * 15);
          if (storm > 0.55) {
            r += 35;
            g += 10;
          }
        } else if (type === "ice") {
          const ice = Math.sin(nx * 30) * Math.cos(ny * 16);
          r = 155 + ice * 35;
          g = 205 + ice * 30;
          b = 230 + ice * 25;
        }

        const index = (y * canvas.width + x) * 4;
        texture.data[index] = Math.max(0, Math.min(255, r));
        texture.data[index + 1] = Math.max(0, Math.min(255, g));
        texture.data[index + 2] = Math.max(0, Math.min(255, b));
        texture.data[index + 3] = 255;
      }
    }

    ctx.putImageData(texture, 0, 0);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    return map;
  }

  function createPlanetTexture(type = "earth") {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const image = ctx.createImageData(canvas.width, canvas.height);
    const noise = (x, y) => (
      Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
    ) % 1;
    const smoothNoise = (x, y) => (
      Math.sin(x * 8.2 + Math.cos(y * 4.7)) +
      Math.sin(y * 13.4 + Math.sin(x * 5.1)) +
      Math.sin((x + y) * 18.3)
    ) / 3;

    for (let y = 0; y < canvas.height; y++) {
      const latitude = y / canvas.height;

      for (let x = 0; x < canvas.width; x++) {
        const longitude = x / canvas.width;
        let r;
        let g;
        let b;
        const n = smoothNoise(longitude * 4, latitude * 4);
        const n2 = smoothNoise(longitude * 12, latitude * 12);

        if (type === "earth") {
          const continent = Math.sin(longitude * 17 + n * 2.5) * Math.cos(latitude * 11 + n2);
          const continent2 = Math.sin(longitude * 39 - latitude * 14) * 0.35;
          const land = continent + continent2;

          if (land > 0.18) {
            r = 35 + n2 * 18;
            g = 105 + n * 45;
            b = 45 + n2 * 20;
            if (land > 0.48) {
              r += 70;
              g += 45;
              b += 25;
            }
          } else {
            r = 8 + n2 * 10;
            g = 45 + n * 30;
            b = 125 + n2 * 45;
            if (land > -0.05) {
              r += 5;
              g += 25;
              b += 15;
            }
          }

          if (latitude < 0.08 || latitude > 0.92) {
            r = 225;
            g = 238;
            b = 245;
          }
        } else if (type === "mars") {
          const terrain = smoothNoise(longitude * 8, latitude * 6);
          const darkTerrain = Math.sin(longitude * 32) * Math.cos(latitude * 18);
          r = 135 + terrain * 45 + darkTerrain * 18;
          g = 48 + terrain * 20 + darkTerrain * 10;
          b = 28 + terrain * 12;

          if (latitude < 0.11 || latitude > 0.89) {
            r = 215;
            g = 210;
            b = 195;
          }
        } else if (type === "gas") {
          const bands = Math.sin(latitude * Math.PI * 32);
          const bands2 = Math.sin(latitude * Math.PI * 75) * 0.25;
          r = 175 + bands * 35 + bands2 * 20;
          g = 115 + bands * 25 + bands2 * 15;
          b = 65 + bands * 20;
          const storm = Math.sin(longitude * 22) * Math.cos(latitude * 15);
          if (storm > 0.65) {
            r += 45;
            g += 20;
            b += 5;
          }
        } else if (type === "ice") {
          const iceNoise = smoothNoise(longitude * 10, latitude * 8);
          const cracks = Math.sin(longitude * 70) * Math.cos(latitude * 28);
          r = 150 + iceNoise * 30;
          g = 195 + iceNoise * 35;
          b = 225 + iceNoise * 25;
          if (cracks > 0.72) {
            r -= 35;
            g -= 30;
            b -= 15;
          }
        } else {
          const fallback = noise(longitude, latitude) * 5;
          r = 120 + fallback;
          g = 120 + fallback;
          b = 120 + fallback;
        }

        const variation = (Math.random() - 0.5) * 5;
        r += variation;
        g += variation;
        b += variation;

        const index = (y * canvas.width + x) * 4;
        image.data[index] = Math.max(0, Math.min(255, r));
        image.data[index + 1] = Math.max(0, Math.min(255, g));
        image.data[index + 2] = Math.max(0, Math.min(255, b));
        image.data[index + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  function createPlanet({
    radius = 0.5,
    position = [0, 0, -8],
    type = "earth",
    ring = false,
    ringColor = 0xc9b58a,
  }) {
    const group = new THREE.Group();
    const isLow = isMobile() || reduce;
    const segments = isLow ? 40 : 80;

    const geometry = new THREE.SphereGeometry(
      radius,
      segments,
      segments
    );

    const canvas = document.createElement("canvas");
    canvas.width = isLow ? 512 : 1024;
    canvas.height = isLow ? 256 : 512;
    const context = canvas.getContext("2d");
    if (!context) return group;

    const image = context.createImageData(canvas.width, canvas.height);
    const palettes = {
      earth: { base: [35, 75, 125], land: [65, 105, 55], landDark: [35, 70, 38], desert: [145, 115, 65], ice: [225, 238, 245], cloud: [255, 255, 255] },
      mars: { base: [125, 55, 38], land: [170, 75, 42], landDark: [82, 35, 28], desert: [190, 105, 60], ice: [235, 220, 200], cloud: [210, 190, 170] },
      jupiter: { base: [190, 150, 105], land: [210, 175, 130], landDark: [120, 90, 70], desert: [225, 190, 145], ice: [235, 215, 180], cloud: [245, 230, 205] },
      saturn: { base: [190, 165, 115], land: [215, 190, 145], landDark: [135, 110, 80], desert: [225, 205, 160], ice: [240, 225, 190], cloud: [250, 240, 215] },
      neptune: { base: [40, 75, 155], land: [45, 90, 180], landDark: [20, 45, 110], desert: [60, 100, 185], ice: [180, 210, 245], cloud: [225, 240, 255] },
      uranus: { base: [105, 175, 190], land: [120, 190, 200], landDark: [75, 140, 165], desert: [140, 200, 205], ice: [205, 235, 240], cloud: [240, 250, 250] },
    };
    const palette = palettes[type] || palettes.earth;
    const smoothNoise = (x, y) => (
      Math.sin(x * 8.2 + Math.cos(y * 4.7)) +
      Math.sin(y * 13.4 + Math.sin(x * 5.1)) +
      Math.sin((x + y) * 18.3)
    ) / 3;

    for (let y = 0; y < canvas.height; y++) {
      const latitude = y / canvas.height;
      for (let x = 0; x < canvas.width; x++) {
        const longitude = x / canvas.width;
        const n1 = Math.sin(longitude * 18 + latitude * 9) * 0.5 + 0.5;
        const n2 = Math.sin(longitude * 42 - latitude * 21) * 0.5 + 0.5;
        const n3 = Math.sin(longitude * 95 + latitude * 55) * 0.5 + 0.5;
        const n4 = Math.sin(longitude * 160 - latitude * 90) * 0.5 + 0.5;
        const terrain = n1 * 0.42 + n2 * 0.28 + n3 * 0.2 + n4 * 0.1;
        let r = palette.base[0];
        let g = palette.base[1];
        let b = palette.base[2];

        if (type === "earth") {
          const land = Math.sin(longitude * 17 + smoothNoise(longitude * 4, latitude * 4) * 2.5) * Math.cos(latitude * 11);
          if (land > 0.18) {
            [r, g, b] = palette.land;
            if (land > 0.48) [r, g, b] = palette.landDark;
            if (land > 0.82) [r, g, b] = palette.desert;
          }
          if (latitude < 0.09 || latitude > 0.91) [r, g, b] = palette.ice;
        } else if (type === "mars") {
          const terrainNoise = smoothNoise(longitude * 8, latitude * 6);
          const dark = Math.sin(longitude * 32) * Math.cos(latitude * 18);
          r = 135 + terrainNoise * 45 + dark * 18;
          g = 48 + terrainNoise * 20 + dark * 10;
          b = 28 + terrainNoise * 12;
          if (latitude < 0.11 || latitude > 0.89) [r, g, b] = palette.ice;
        } else if (type === "jupiter" || type === "saturn") {
          const bands = Math.sin(latitude * 90 + n1 * 5);
          if (bands > 0.35) [r, g, b] = palette.cloud;
          if (bands < -0.35) [r, g, b] = palette.landDark;
          if (type === "jupiter" && Math.abs(longitude - 0.73) < 0.07 && Math.abs(latitude - 0.58) < 0.045) [r, g, b] = [170, 75, 48];
          if (type === "saturn") { r *= 0.96; g *= 0.94; b *= 0.86; }
        } else if (type === "neptune") {
          if (Math.sin(longitude * 35 + latitude * 8) > 0.65) { r += 25; g += 25; b += 35; }
        } else if (type === "uranus") {
          const band = Math.sin(latitude * 50);
          r += band * 8; g += band * 8; b += band * 10;
        }

        const variation = 0.88 + terrain * 0.22;
        const index = (y * canvas.width + x) * 4;
        image.data[index] = Math.max(0, Math.min(255, r * variation));
        image.data[index + 1] = Math.max(0, Math.min(255, g * variation));
        image.data[index + 2] = Math.max(0, Math.min(255, b * variation));
        image.data[index + 3] = 255;
      }
    }

    context.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = world.renderer?.capabilities?.getMaxAnisotropy?.() || 4;
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: type === "jupiter" || type === "saturn" ? 0.72 : 0.86,
      metalness: 0,
      bumpMap: texture,
      bumpScale: type === "earth" ? radius * 0.045 : radius * 0.018,
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    group.add(planet);

    let clouds = null;
    if (type === "earth") {
      const cloudGeometry = new THREE.SphereGeometry(
        radius * 1.012,
        isLow ? 32 : 64,
        isLow ? 32 : 64
      );

      clouds = new THREE.Mesh(
        cloudGeometry,
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.13,
          roughness: 1,
          depthWrite: false,
        })
      );

      group.add(clouds);
      clouds.userData.isCloudLayer = true;
    }

    const atmosphereGeometry = new THREE.SphereGeometry(
      radius * 1.08,
      isLow ? 24 : 48,
      isLow ? 24 : 48
    );
    const atmosphereColors = { earth: 0x6ca8ff, mars: 0xff8b5c, jupiter: 0xf4d5a5, saturn: 0xe8d3a3, neptune: 0x4d8cff, uranus: 0x7ee6ed };

    const atmosphereMesh = new THREE.Mesh(
      atmosphereGeometry,
      new THREE.MeshBasicMaterial({
        color: atmosphereColors[type] || 0x8db7ff,
        transparent: true,
        opacity: type === "earth" ? 0.22 : 0.10,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    group.add(atmosphereMesh);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.18, isLow ? 20 : 40, isLow ? 20 : 40),
      new THREE.MeshBasicMaterial({
        color: atmosphereColors[type] || 0x8db7ff,
        transparent: true,
        opacity: 0.055,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    group.add(glow);

    if (ring) {
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(radius * 1.30, radius * 2.25, 128),
        new THREE.MeshStandardMaterial({
          color: ringColor,
          transparent: true,
          opacity: 0.72,
          roughness: 0.82,
          metalness: 0.02,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );

      ringMesh.rotation.x = Math.PI * 0.34;
      ringMesh.rotation.y = Math.PI * 0.08;
      group.add(ringMesh);

      const innerRing = new THREE.Mesh(
        new THREE.RingGeometry(radius * 1.27, radius * 1.48, 128),
        new THREE.MeshBasicMaterial({
          color: ringColor,
          transparent: true,
          opacity: 0.32,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );

      innerRing.rotation.copy(ringMesh.rotation);
      group.add(innerRing);

      const gap = new THREE.Mesh(
        new THREE.RingGeometry(radius * 1.70, radius * 1.78, 128),
        new THREE.MeshBasicMaterial({
          color: 0x161217,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      gap.rotation.copy(ringMesh.rotation);
      group.add(gap);
    }

    group.position.set(position[0], position[1], position[2]);
    group.rotation.x = THREE.MathUtils.degToRad(8 + Math.random() * 14);
    group.rotation.z = THREE.MathUtils.degToRad(-12 + Math.random() * 24);
    group.userData.type = type;
    if (clouds) group.userData.clouds = clouds;

    return group;
  }

  function createGalaxy() {
    const count = isMobile() || reduce ? 900 : 2600;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = Math.random() * 15;
      const arms = 4;
      const armAngle = (i % arms) * (Math.PI * 2 / arms);
      const spiral = radius * 0.48 + armAngle + (Math.random() - 0.5) * 0.9;
      const spread = Math.pow(Math.random(), 1.7) * 1.2;
      positions[i * 3] = Math.cos(spiral) * radius + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (1.8 - radius * 0.075);
      positions[i * 3 + 2] = Math.sin(spiral) * radius + (Math.random() - 0.5) * spread - 13;
      sizes[i] = Math.random() * (isMobile() ? 0.035 : 0.055) + 0.012;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    const galaxy = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xf2c6ca,
        size: isMobile() ? 0.035 : 0.05,
        transparent: true,
        opacity: 0.58,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    galaxy.rotation.x = 0.48;
    return galaxy;
  }

  function createNebula() {
    const count = isMobile() || reduce ? 180 : 550;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 12;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 12;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xc98a90,
        size: isMobile() ? 0.08 : 0.13,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
  }

  function initThree() {
    if (!window.THREE) return;
    const canvas = document.getElementById("world");
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile(),
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1.25 : 1.75));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.025);
    const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 160);
    camera.position.set(0, 0, 6.2);

    const ambient = new THREE.AmbientLight(0xf6f1ea, 0.18);
    const key = new THREE.PointLight(0xffe1e5, 3.8, 70);
    const rim = new THREE.PointLight(0xc98a90, 1.1, 50);
    const soft = new THREE.PointLight(0xffffff, 0.5, 40);
    key.position.set(2.4, 1.6, 4);
    rim.position.set(-4, -2, -5);
    soft.position.set(0, 4, 2);
    scene.add(ambient, key, rim, soft);

    const starCount = isMobile() || reduce ? 260 : 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 100;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 65;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 90 - 10;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xf7f2ea,
        size: isMobile() ? 0.035 : 0.045,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      })
    );
    scene.add(stars);

    const dustCount = isMobile() || reduce ? 140 : 520;
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 22;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: 0xe8b4b8,
        size: 0.055,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(dust);

    const galaxy = createGalaxy();
    const nebula = createNebula();
    scene.add(galaxy, nebula);

    const planet1 = createPlanet({
      radius: 0.78,
      position: [-5.4, 2.1, -13],
      type: "earth",
      atmosphere: 0x6eb6ff,
    });

    const planet2 = createPlanet({
      radius: 0.42,
      position: [5.3, -1.5, -9],
      type: "mars",
      atmosphere: 0xff7043,
    });

    const planet3 = createPlanet({
      radius: 0.72,
      position: [3.8, 3.0, -17],
      type: "jupiter",
      atmosphere: 0xffd8a8,
    });

    const planet4 = createPlanet({
      radius: 0.58,
      position: [-3.7, -2.7, -7],
      type: "saturn",
      atmosphere: 0xffdca8,
      ring: true,
      ringColor: 0xcbb58a,
    });

    scene.add(
      planet1,
      planet2,
      planet3,
      planet4
    );

    world.renderer = renderer;
    world.scene = scene;
    world.camera = camera;
    world.stars = stars;
    world.dust = dust;
    world.galaxy = galaxy;
    world.planets = [planet1, planet2, planet3, planet4];
    world.lights = { key, rim, soft };

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      stars.rotation.y = t * 0.008;
      stars.rotation.x = Math.sin(t * 0.08) * 0.015;
      stars.position.z = (world.camZ - 6.2) * 0.35;
      dust.rotation.y = t * 0.025;
      dust.rotation.x = Math.sin(t * 0.12) * 0.04;
      dust.scale.set(1, world.stretch, 1);
      galaxy.rotation.z = t * 0.012;
      galaxy.rotation.y = t * 0.006;
      galaxy.position.x = Math.sin(t * 0.12) * 0.25;
      galaxy.position.y = Math.cos(t * 0.1) * 0.15;
      nebula.rotation.y = -t * 0.004;
      nebula.rotation.z = Math.sin(t * 0.08) * 0.04;
      planet1.rotation.y = t * 0.12;
      planet2.rotation.y = -t * 0.18;
      planet3.rotation.y = t * 0.07;
      planet4.rotation.y = t * 0.22;
      planet1.rotation.x = Math.sin(t * 0.18) * 0.025;
      planet2.rotation.x = Math.sin(t * 0.21) * 0.018;
      planet3.rotation.z = Math.sin(t * 0.12) * 0.018;
      planet4.rotation.z = Math.sin(t * 0.14) * 0.025;
      planet1.position.y = 2.1 + Math.sin(t * 0.35) * 0.18;
      planet2.position.y = -1.5 + Math.sin(t * 0.5 + 2) * 0.15;
      planet3.position.x = 3.8 + Math.sin(t * 0.22) * 0.2;
      planet4.position.y = -2.7 + Math.sin(t * 0.65) * 0.12;
      planet1.position.z = -13 + Math.sin(t * 0.25) * 0.15;
      planet2.position.x = 5.3 + Math.sin(t * 0.35) * 0.12;
      planet3.position.y = 3.0 + Math.sin(t * 0.18) * 0.2;
      planet4.position.x = -3.7 + Math.sin(t * 0.45) * 0.1;

      const mx = (mouse.x / innerWidth) * 2 - 1;
      const my = (mouse.y / innerHeight) * 2 - 1;
      key.position.x = lerp(key.position.x, 2.4 + mx * 2.2, 0.04);
      key.position.y = lerp(key.position.y, 1.6 - my * 1.6, 0.04);
      camera.position.z = lerp(camera.position.z, world.camZ, 0.06);
      if (!reduce) {
        camera.position.x = lerp(camera.position.x, mx * 0.42, 0.025);
        camera.position.y = lerp(camera.position.y, -my * 0.25, 0.025);
        galaxy.rotation.x = lerp(galaxy.rotation.x, 0.48 + my * 0.08, 0.025);
        galaxy.rotation.y = lerp(galaxy.rotation.y, mx * 0.15, 0.025);
      }
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1.25 : 1.75));
    });
  }

  try {
    initThree();
  } catch (_) {
    /* content still works without WebGL */
  }

  /* =========================================================
     HERO 3D TILT
     ========================================================= */

  function bindTilt(
    rig,
    intensity = 1
  ) {
    if (!rig) return;

    const parent =
      rig.closest(".portrait-scene") ||
      rig;

    const target = {
      rx: 0,
      ry: 0,
      z: 0,
    };

    const current = {
      rx: 0,
      ry: 0,
      z: 0,
    };

    const shine =
      rig.querySelector(".p-shine");

    parent.addEventListener(
      "mousemove",
      (e) => {
        if (isMobile() || reduce) return;

        const rect =
          parent.getBoundingClientRect();

        if (!rect.width || !rect.height)
          return;

        const x =
          (e.clientX - rect.left) /
            rect.width -
          0.5;

        const y =
          (e.clientY - rect.top) /
            rect.height -
          0.5;

        target.ry =
          x * 8 * intensity;

        target.rx =
          -y * 6 * intensity;

        target.z = 18;

        if (shine) {
          shine.style.background =
            `linear-gradient(
              ${115 + x * 40}deg,
              rgba(255,255,255,0.32) 0%,
              transparent 38%,
              transparent 60%,
              rgba(255,255,255,0.1) 100%
            )`;
        }
      }
    );

    parent.addEventListener(
      "mouseleave",
      () => {
        target.rx = 0;
        target.ry = 0;
        target.z = 0;
      }
    );

    const tick = () => {
      current.rx =
        lerp(
          current.rx,
          target.rx,
          0.08
        );

      current.ry =
        lerp(
          current.ry,
          target.ry,
          0.08
        );

      current.z =
        lerp(
          current.z,
          target.z,
          0.08
        );

      rig.style.transform =
        `rotateX(${current.rx}deg)
         rotateY(${current.ry}deg)
         translateZ(${current.z}px)`;

      requestAnimationFrame(
        tick
      );
    };

    tick();
  }

  bindTilt(
    $("#heroRig"),
    1
  );

  bindTilt(
    $("#cineRig"),
    0.7
  );

  bindTilt(
    $("#nishthaRig"),
    1
  );

  bindTilt(
    $("#finalRig"),
    0.5
  );

  $$(".together-stage .portrait-rig")
    .forEach((el) =>
      bindTilt(el, 0.6)
    );

  /* =========================================================
     FLOATING CHIPS
     ========================================================= */

  $$(".glass-chip").forEach(
    (chip, i) => {
      const z =
        Number(
          chip.dataset.z || 0
        );

      chip.style.transform =
        `translateZ(${z}px)`;

      if (
        !window.gsap ||
        reduce
      ) {
        return;
      }

      gsap.to(chip, {
        y:
          i % 2
            ? 16
            : -18,

        rotationY:
          i % 2
            ? 12
            : -10,

        duration:
          4 + (i % 3),

        yoyo: true,
        repeat: -1,

        ease: "sine.inOut",
      });
    }
  );

  /* =========================================================
     ORBIT RINGS
     ========================================================= */

  $$(".orbit-ring").forEach(
    (ringEl, i) => {
      if (
        !window.gsap ||
        reduce
      ) {
        return;
      }

      gsap.to(ringEl, {
        rotateZ:
          i % 2
            ? 360
            : -360,

        duration:
          28 + i * 10,

        repeat: -1,

        ease: "none",
      });
    }
  );

  /* =========================================================
     MAGNETIC BUTTONS
     ========================================================= */

  $$(".magnetic").forEach(
    (btn) => {
      btn.addEventListener(
        "mousemove",
        (e) => {
          if (
            isMobile() ||
            !window.gsap
          ) {
            return;
          }

          const rect =
            btn.getBoundingClientRect();

          const x =
            e.clientX -
            (rect.left +
              rect.width / 2);

          const y =
            e.clientY -
            (rect.top +
              rect.height / 2);

          gsap.to(btn, {
            x: x * 0.18,
            y: y * 0.18,
            z: 24,
            duration: 0.35,
            ease: "power3.out",
          });

          const em =
            btn.querySelector("em");

          if (em) {
            gsap.to(em, {
              x: 8,
              duration: 0.3,
            });
          }
        }
      );

      btn.addEventListener(
        "mouseleave",
        () => {
          if (!window.gsap) return;

          gsap.to(btn, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.5,
            ease: "power3.out",
          });

          const em =
            btn.querySelector("em");

          if (em) {
            gsap.to(em, {
              x: 0,
              duration: 0.3,
            });
          }
        }
      );

      btn.addEventListener(
        "click",
        (e) => {
          if (!window.gsap) return;

          const ripple =
            document.createElement(
              "span"
            );

          ripple.style.cssText =
            `
            position:absolute;
            width:12px;
            height:12px;
            border-radius:50%;
            background:rgba(255,255,255,.35);
            left:${e.offsetX - 6}px;
            top:${e.offsetY - 6}px;
            pointer-events:none;
            `;

          btn.style.position =
            "relative";

          btn.style.overflow =
            "hidden";

          btn.appendChild(
            ripple
          );

          gsap.to(ripple, {
            scale: 18,
            opacity: 0,
            duration: 0.6,

            onComplete: () =>
              ripple.remove(),
          });
        }
      );
    }
  );

  /* =========================================================
     TILT CARDS
     ========================================================= */

  $$(".tilt-card").forEach(
    (card) => {
      card.addEventListener(
        "mousemove",
        (e) => {
          if (
            isMobile() ||
            reduce ||
            !window.gsap
          ) {
            return;
          }

          const rect =
            card.getBoundingClientRect();

          const x =
            (e.clientX - rect.left) /
              rect.width -
            0.5;

          const y =
            (e.clientY - rect.top) /
              rect.height -
            0.5;

          gsap.to(card, {
            rotateY: x * 14,
            rotateX: -y * 10,
            z: 28,
            duration: 0.35,
            ease: "power3.out",
            transformPerspective: 900,
          });
        }
      );

      card.addEventListener(
        "mouseleave",
        () => {
          if (!window.gsap) return;

          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            z: 0,
            duration: 0.55,
            ease: "power3.out",
          });
        }
      );
    }
  );

  /* =========================================================
     HERO LETTER INTRO
     ========================================================= */

  if (window.gsap) {
    gsap.from(
      ".hero .letters span",
      {
        y: 30,
        opacity: 0,
        stagger: 0.028,
        duration: 0.8,
        delay: 0.85,
        ease: "power3.out",
      }
    );

    gsap.from(
      ".hero-sub, .hero-by, .enter-btn, .eyebrow",
      {
        y: 18,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        delay: 1.15,
        ease: "power2.out",
      }
    );
  }

  /* =========================================================
     CINEMATIC ENTER
     ========================================================= */

  const enterBtn =
    $("#enterBtn");

  function cinematicEnter() {
    if (!window.gsap) {
      const target =
        $("#journey");

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
      }

      return;
    }

    const tl =
      gsap.timeline({
        onComplete: () => {
          const target =
            $("#journey");

          if (lenis && target) {
            lenis.scrollTo(
              target,
              {
                offset: 0,
                duration: 1.4,
              }
            );
          } else if (target) {
            target.scrollIntoView({
              behavior: "smooth",
            });
          }

          world.stretch = 1;
          world.camZ = 5.4;
        },
      });

    tl.to(
      ".portrait-scene",
      {
        z: -180,
        opacity: 0.35,
        duration: 0.9,
        ease: "power3.inOut",
      },
      0
    )
      .to(
        ".hero-copy",
        {
          opacity: 0,
          y: -30,
          duration: 0.6,
        },
        0
      )
      .to(
        ".glass-chip",
        {
          z: 220,
          opacity: 0,
          stagger: 0.03,
          duration: 0.7,
        },
        0
      );

    world.stretch = 2.4;
    world.camZ = 2.8;
  }

  if (enterBtn) {
    enterBtn.addEventListener(
      "click",
      cinematicEnter
    );
  }

  /* =========================================================
     SCROLL ANIMATIONS
     ========================================================= */

  if (
    window.gsap &&
    window.ScrollTrigger
  ) {
    gsap.registerPlugin(
      ScrollTrigger
    );

    /* ---------- Fade Up ---------- */

    const fadeUp = (
      selector,
      trigger
    ) => {
      const elements =
        $$(selector);

      if (!elements.length)
        return;

      gsap.from(elements, {
        y: 40,
        opacity: 0,
        filter: reduce
          ? "none"
          : "blur(8px)",
        duration: 1.1,
        stagger: 0.12,
        ease: "power2.out",

        scrollTrigger: {
          trigger:
            trigger || selector,
          start: "top 78%",
        },
      });
    };

    fadeUp(
      ".scene-journey .story, .scene-journey h2",
      ".scene-journey"
    );

    fadeUp(
      ".path-node",
      ".path-3d"
    );

    /* ---------- Journey Path ---------- */

    const path =
      $(".path-draw");

    if (path) {
      gsap.set(
        path,
        {
          strokeDashoffset:
            path.getTotalLength
              ? path.getTotalLength()
              : 0,
        }
      );

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",

        scrollTrigger: {
          trigger: ".path-3d",
          start: "top 80%",
          end: "bottom 40%",
          scrub: true,
        },
      });
    }

    /* ---------- Path Nodes ---------- */

    $$(".path-node").forEach(
      (node) => {
        ScrollTrigger.create({
          trigger: node,
          start: "top 75%",

          onEnter: () =>
            node.classList.add(
              "on"
            ),

          onEnterBack: () =>
            node.classList.add(
              "on"
            ),
        });
      }
    );

    /* ---------- Tech Objects ---------- */

    $$(".tech-obj").forEach(
      (el) => {
        const dir =
          Number(
            el.dataset.from || 1
          );

        gsap.from(el, {
          x: dir * 140,
          z: dir * 80,
          rotateY: dir * 25,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",

          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      }
    );

    /* ---------- Dark Reveal ---------- */

    gsap.from(".from-dark", {
      opacity: 0,
      y: 24,
      stagger: 0.25,
      duration: 0.9,

      scrollTrigger: {
        trigger: ".reveal-stack",
        start: "top 75%",
      },
    });

    /* ---------- Glitch ---------- */

    const glitch =
      $(".glitch");

    if (glitch) {
      ScrollTrigger.create({
        trigger: glitch,
        start: "top 70%",
        once: true,

        onEnter: () => {
          glitch.classList.add(
            "is-on"
          );

          window.setTimeout(() => {
            glitch.textContent =
              "LEARNING";

            glitch.dataset.text =
              "LEARNING";

            glitch.classList.remove(
              "is-on"
            );
          }, 420);
        },
      });
    }

    /* ---------- Virtues ---------- */

    const virtueSpans =
      $$(".virtue-row span");

    if (virtueSpans.length) {
      gsap.from(virtueSpans, {
        z: -80,
        opacity: 0,
        rotateX: 40,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",

        scrollTrigger: {
          trigger: ".virtue-row",
          start: "top 80%",
        },
      });
    }

    /* ---------- Cinematic Portrait ---------- */

    if ($(".cine-rig")) {
      gsap.fromTo(
        ".cine-rig",
        {
          z: -220,
          rotateY: -8,
          opacity: 0.75,
        },
        {
          z: 80,
          rotateY: 4,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".cine-portrait",
            start: "top 80%",
            end: "bottom 20%",
            scrub: true
          },
        }
      );

      gsap.fromTo(
        ".cine-rig",
        {
          z: 80,
        },
        {
          z: -40,
          ease: "none",

          scrollTrigger: {
            trigger:
              ".scene-nishtha",
            start: "top 90%",
            end: "top 40%",
            scrub: true,
          },
        }
      );
    }

    /* ---------- Nishtha Portrait ---------- */

    if ($("#nishthaRig")) {
      gsap.from(
        "#nishthaRig",
        {
          z: -160,
          rotateY: 10,
          opacity: 0.4,
          duration: 1.4,
          ease: "power2.out",

          scrollTrigger: {
            trigger:
              ".student-portrait",
            start: "top 80%",

            onEnter: () => {
              const portrait =
                $(".student-portrait");

              if (portrait) {
                portrait.classList.add(
                  "is-sharp"
                );
              }
            },
          },
        }
      );
    }

    /* ---------- Bond ---------- */

    if ($(".bond-line")) {
      gsap.from(
        ".bond-line",
        {
          scaleY: 0,
          duration: 1.1,
          ease: "power2.out",

          scrollTrigger: {
            trigger: ".bond",
            start: "top 80%",
          },
        }
      );
    }

    /* ---------- Low Section ---------- */

    if ($(".low-lines")) {
      gsap.from(
        ".low-lines p",
        {
          opacity: 0,
          y: 16,
          stagger: 0.18,

          scrollTrigger: {
            trigger: ".low-lines",
            start: "top 80%",
          },
        }
      );
    }

    if ($(".continued")) {
      gsap.from(
        ".continued",
        {
          opacity: 0,
          scale: 0.92,
          duration: 1.2,

          scrollTrigger: {
            trigger: ".continued",
            start: "top 82%",
          },
        }
      );
    }

    /* ---------- Cards ---------- */

    const cards =
      $$(".tilt-card");

    if (cards.length) {
      gsap.from(cards, {
        y: 40,
        rotateX: 18,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,

        scrollTrigger: {
          trigger: ".glass-grid",
          start: "top 80%",
        },
      });
    }

    /* ---------- Quote ---------- */

    const quoteSpans =
      $$(".quote-3d span");

    if (quoteSpans.length) {
      gsap.from(quoteSpans, {
        z: (i) =>
          i % 2 ? -50 : 40,

        opacity: 0,
        stagger: 0.2,
        duration: 1,

        scrollTrigger: {
          trigger: ".quote-3d",
          start: "top 80%",
        },
      });
    }

    /* ---------- Then / Now ---------- */

    if ($(".then-panel")) {
      gsap.fromTo(
        ".then-panel",
        {
          z: 70,
          opacity: 1,
        },
        {
          z: -80,
          opacity: 0.55,
          ease: "none",

          scrollTrigger: {
            trigger: ".split-stage",
            start: "top 70%",
            end: "bottom 30%",
            scrub: true,
          },
        }
      );
    }

    if ($(".now-panel")) {
      gsap.fromTo(
        ".now-panel",
        {
          z: -90,
          opacity: 0.45,
        },
        {
          z: 40,
          opacity: 1,
          ease: "none",

          scrollTrigger: {
            trigger: ".split-stage",
            start: "top 70%",
            end: "bottom 30%",
            scrub: true,
          },
        }
      );
    }

    /* ---------- Letter ---------- */

    if ($(".letter")) {
      gsap.from(
        ".letter",
        {
          rotateX: 18,
          y: 80,
          opacity: 0.35,
          duration: 1.2,
          ease: "power2.out",

          scrollTrigger: {
            trigger: ".letter",
            start: "top 85%",

            onEnter: () => {
              $(".letter")?.classList.add(
                "is-readable"
              );
            },
          },
        }
      );
    }

    /*
      IMPORTANT:
      The original script animated .letter-p twice.
      This corrected version keeps only ONE animation.
    */

    const letterParagraphs =
      $$(".letter-p");

    if (letterParagraphs.length) {
      gsap.from(
        letterParagraphs,
        {
          opacity: 0,
          y: 22,
          rotateX: 8,
          stagger: 0.1,
          duration: 0.75,
          ease: "power2.out",

          scrollTrigger: {
            trigger: ".letter",
            start: "top 72%",
          },
        }
      );
    }

    /* ---------- Future ---------- */

    const voidLines =
      $$(".void-line");

    if (voidLines.length) {
      gsap.from(voidLines, {
        opacity: 0,
        y: 30,
        stagger: 0.25,
        duration: 1,

        scrollTrigger: {
          trigger: ".scene-future",
          start: "top 70%",
        },
      });
    }

    /* ---------- Together Section ---------- */

    if ($(".together-sir")) {
      gsap.from(
        ".together-sir",
        {
          x: -40,
          z: -40,
          duration: 1.2,

          scrollTrigger: {
            trigger:
              ".together-stage",
            start: "top 75%",
          },
        }
      );
    }

    if ($(".together-student")) {
      gsap.from(
        ".together-student",
        {
          x: 40,
          z: -60,
          duration: 1.2,

          scrollTrigger: {
            trigger:
              ".together-stage",
            start: "top 75%",
          },
        }
      );
    }

    /* ---------- Final Section ---------- */

    const finalElements =
      $$(".final-beat, .thank-you, .happy, .closer");

    if (finalElements.length) {
      gsap.from(
        finalElements,
        {
          opacity: 0,
          y: 20,
          stagger: 0.35,
          duration: 0.9,

          scrollTrigger: {
            trigger: ".scene-final",
            start: "top 60%",
          },
        }
      );
    }

    if ($(".final-sir")) {
      gsap.to(
        ".final-sir",
        {
          z: 50,
          rotateY: 6,
          ease: "none",

          scrollTrigger: {
            trigger: ".scene-final",
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    }

    /* =====================================================
       GLOBAL PAGE PROGRESS
       ===================================================== */

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",

      onUpdate: (self) => {
        world.camZ =
          6.2 -
          self.progress * 2.6;

        const fill =
          $(".progress-fill");

        if (fill) {
          fill.style.height =
            `${self.progress * 100}%`;
        }
      },
    });

    /* =====================================================
       CHAPTER NAVIGATION
       ===================================================== */

    const chapters =
      $$("[data-chapter]");

    chapters.forEach(
      (section) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",

          onEnter: () =>
            setActive(
              section.dataset.chapter
            ),

          onEnterBack: () =>
            setActive(
              section.dataset.chapter
            ),
        });
      }
    );
  }

  /* =========================================================
     ACTIVE NAVIGATION
     ========================================================= */

  function setActive(id) {
    const navMap = {
      journey: "journey",
      unknown: "unknown",
      sir: "sir",
      growth: "growth",
      low: "unknown",
      letter: "letter",
      future: "growth",
      thanks: "letter",
    };

    const stepMap = {
      journey: "journey",
      unknown: "unknown",
      sir: "sir",
      growth: "growth",
      low: "low",
      letter: "future",
      future: "future",
      thanks: "thanks",
    };

    $$(".glass-nav a").forEach(
      (a) => {
        a.classList.toggle(
          "active",
          a.dataset.nav ===
            navMap[id]
        );
      }
    );

    $$(".progress li").forEach(
      (li) => {
        li.classList.toggle(
          "active",
          li.dataset.step ===
            stepMap[id]
        );
      }
    );
  }

  /* =========================================================
     NAV CLICK
     ========================================================= */

  $$(".glass-nav a").forEach(
    (a) => {
      a.addEventListener(
        "click",
        (e) => {
          e.preventDefault();

          const id =
            a.getAttribute("href");

          const el = $(id);

          if (!el) return;

          if (lenis) {
            lenis.scrollTo(el, {
              offset: -20,
              duration: 1.1,
            });
          } else {
            el.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }
      );
    }
  );

  /* =========================================================
     REFRESH SCROLLTRIGGER
     ========================================================= */

  if (window.ScrollTrigger) {
    window.addEventListener(
      "load",
      () => {
        ScrollTrigger.refresh();
      }
    );

    window.addEventListener(
      "resize",
      () => {
        ScrollTrigger.refresh();
      }
    );
  }

  /* =========================================================
     INITIAL STATE
     ========================================================= */

  setActive("journey");

})();
/* =========================================
   PINK HEARTS FOLLOW MOUSE HOVER
   ========================================= */

(function () {
  let lastHeartTime = 0;

  const heartSymbols = ["♥", "♡", "♥", "♥"];
  const heartColors = ["#f4a6b0", "#ffb6c1", "#e8b4b8", "#ffd1d6"];

  document.addEventListener("mousemove", function (event) {
    const now = Date.now();

    // Create hearts at a controlled rate
    if (now - lastHeartTime < 100) return;
    lastHeartTime = now;

    createMouseHeart(event.clientX, event.clientY);
  });

  function createMouseHeart(x, y) {
    const heart = document.createElement("span");

    heart.className = "mouse-heart";
    heart.textContent =
      heartSymbols[Math.floor(Math.random() * heartSymbols.length)];

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    heart.style.color =
      heartColors[Math.floor(Math.random() * heartColors.length)];

    // Random sideways movement
    const randomX = Math.floor(Math.random() * 80) - 40;

    // Random rotation
    const randomRotation = Math.floor(Math.random() * 50) - 25;

    heart.style.setProperty("--heart-x", `${randomX}px`);
    heart.style.setProperty(
      "--heart-rotate",
      `${randomRotation}deg`
    );

    // Slight random size
    const size = Math.random() * 10 + 12;
    heart.style.fontSize = `${size}px`;

    document.body.appendChild(heart);

    // Remove after animation
    setTimeout(() => {
      heart.remove();
    }, 1500);
  }
})();