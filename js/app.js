/* =========================================
   ATEC INTERACTIVE BOOTH
   VERSION 6
   ========================================= */


/* ELEMENT HELPER */

const $ = id => document.getElementById(id);


/* =========================================
   SAFE ASSET PATH
   ========================================= */

function safePath(path) {

  if (
    typeof path === "string" &&
    /^assets\/[a-zA-Z0-9_./-]+$/.test(path) &&
    !path.includes("..")
  ) {
    return path;
  }

  return null;
}


/* =========================================
   IMAGE LOADING
   ========================================= */

function setImage(el, path, placeholder = null) {

  const src = safePath(path);

  if (!src) {

    el.hidden = true;

    if (placeholder) {
      placeholder.hidden = false;
    }

    return;
  }

  el.onload = () => {

    el.hidden = false;

    if (placeholder) {
      placeholder.hidden = true;
    }

    if (el.id === "boothImage") {
      resizeBooth();
    }
  };

  el.onerror = () => {

    el.hidden = true;

    if (placeholder) {
      placeholder.hidden = false;
      placeholder.innerHTML =
        "<span>BOOTH IMAGE UNAVAILABLE</span>" +
        "<p>Please check the image file.</p>";
    }
  };

  el.src = src;

  if (el.complete && el.naturalWidth > 0) {
    el.onload();
  }
}


/* =========================================
   MOBILE BOOTH IMAGE RESIZE
   ========================================= */

function resizeBooth() {

  const img = $("boothImage");
  const canvas = $("boothCanvas");
  const frame = $("boothFrame");

  if (!img || !canvas || !frame) return;

  const isMobile = window.matchMedia(
    "(max-width: 640px)"
  ).matches;

  if (!isMobile) {

    canvas.style.width = "";
    canvas.style.minWidth = "";

    updateArrows();

    return;
  }

  if (
    img.naturalWidth <= 0 ||
    img.naturalHeight <= 0
  ) {
    updateArrows();
    return;
  }

  const ratio =
    img.naturalWidth / img.naturalHeight;

  const frameHeight = frame.clientHeight;
  const frameWidth = frame.clientWidth;

  if (!frameHeight || !frameWidth) return;

  const imageWidth = Math.max(
    frameWidth,
    Math.round(frameHeight * ratio)
  );

  canvas.style.width = imageWidth + "px";
  canvas.style.minWidth = imageWidth + "px";

  updateArrows();
}


/* =========================================
   SCROLL ARROW CONTROL
   ========================================= */

function updateArrows() {

  const frame = $("boothFrame");
  const left = $("boothArrowLeft");
  const right = $("boothArrowRight");

  if (!frame || !left || !right) return;

  const isMobile = window.matchMedia(
    "(max-width: 640px)"
  ).matches;

  const maxScroll = Math.max(
    0,
    frame.scrollWidth - frame.clientWidth
  );

  if (!isMobile || maxScroll <= 2) {

    left.hidden = true;
    right.hidden = true;

    return;
  }

  const currentScroll = frame.scrollLeft;

  left.hidden = currentScroll <= 2;

  right.hidden =
    currentScroll >= maxScroll - 2;
}


/* =========================================
   SCROLL BOOTH
   ========================================= */

function scrollBooth(direction) {

  const frame = $("boothFrame");

  if (!frame) return;

  const distance = Math.max(
    180,
    Math.round(frame.clientWidth * 0.7)
  );

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  frame.scrollBy({

    left: distance * direction,

    behavior: reduceMotion
      ? "auto"
      : "smooth"

  });
}


/* =========================================
   PRODUCT POPUP
   ========================================= */

function openProduct(p) {

  $("productTitle").textContent =
    p.name || p.id || "";

  $("productCategory").textContent =
    p.category || "";

  $("productDescription").textContent =
    p.description || "";

  /* PRODUCT IMAGE */

  const img = $("productImage");

  img.hidden = true;
  img.removeAttribute("src");

  setImage(img, p.image);

  /* FEATURES */

  $("features").replaceChildren();

  for (const feature of p.features || []) {

    if (!feature) continue;

    const li = document.createElement("li");

    li.textContent = feature;

    $("features").append(li);
  }

  /* SPECIFICATIONS */

  $("specs").replaceChildren();

  for (const spec of p.specifications || []) {

    const dt = document.createElement("dt");
    const dd = document.createElement("dd");

    dt.textContent = spec.name || "";
    dd.textContent = spec.value || "";

    $("specs").append(dt, dd);
  }

  /* BROCHURE */

  const brochure = $("brochure");

  const path = safePath(p.brochure);

  brochure.hidden = !path;

  if (path) {
    brochure.href = path;
  } else {
    brochure.removeAttribute("href");
  }

  /* OPEN POPUP */

  $("productDialog").showModal();
}


/* =========================================
   LOAD WEBSITE DATA
   ========================================= */

async function init() {

  try {

    const response = await fetch(
      "data/content.json",
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Content file not found");
    }

    const data = await response.json();

    const settings = data.settings || {};

    /* PAGE TITLE */

    document.title =
      settings.page_title ||
      "ATEC Interactive Booth";

    $("title").textContent =
      settings.page_title ||
      "Interactive Booth";

    $("event").textContent =
      settings.event_name || "";

    $("subtitle").textContent =
      settings.subtitle || "";

    /* LOGO */

    const logo = $("logo");

    logo.addEventListener("load", () => {
      $("brandFallback").hidden = true;
    });

    setImage(
      logo,
      settings.logo_image
    );

    /* BOOTH IMAGE */

    setImage(
      $("boothImage"),
      settings.booth_image,
      $("boothPlaceholder")
    );

    /* PRODUCT HOTSPOTS */

    $("hotspots").replaceChildren();

    for (const p of data.products || []) {

      if (!p.visible) continue;

      const btn = document.createElement("button");

      btn.type = "button";
      btn.className = "hotspot";

      btn.textContent =
        p.name || p.id || "Product";

      const x = Math.max(
        0,
        Math.min(100, Number(p.x) || 0)
      );

      const y = Math.max(
        0,
        Math.min(100, Number(p.y) || 0)
      );

      btn.style.left = x + "%";
      btn.style.top = y + "%";

      btn.setAttribute(
        "aria-label",
        "Explore " + (p.name || p.id || "product")
      );

      btn.addEventListener("click", () => {
        openProduct(p);
      });

      $("hotspots").append(btn);
    }

    /* DOWNLOADS */

    $("downloads").replaceChildren();

    let count = 0;

    for (const d of data.downloads || []) {

      const path = safePath(d.path);

      if (!d.visible || !path) continue;

      const a = document.createElement("a");

      a.href = path;
      a.target = "_blank";
      a.rel = "noopener";

      a.textContent =
        (d.label || "Download") + " ↗";

      $("downloads").append(a);

      count++;
    }

    if (!count) {

      const p = document.createElement("p");

      p.className = "muted";

      p.textContent =
        "Resources will be available soon.";

      $("downloads").append(p);
    }

    /* CONTACT */

    if (
      settings.contact_email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        settings.contact_email
      )
    ) {

      $("contact").hidden = false;

      $("contactLink").href =
        "mailto:" + settings.contact_email;

      $("contactLink").textContent =
        settings.contact_email;
    }

    /* UPDATE LAYOUT */

    resizeBooth();

  } catch (error) {

    console.error(error);

    $("subtitle").textContent =
      "Unable to load website content.";
  }
}


/* =========================================
   EVENT LISTENERS
   ========================================= */

/* CLOSE PRODUCT POPUP */

$("closeDialog").addEventListener(
  "click",
  () => {
    $("productDialog").close();
  }
);


/* CLOSE POPUP BY CLICKING BACKDROP */

$("productDialog").addEventListener(
  "click",
  event => {

    if (event.target === $("productDialog")) {
      $("productDialog").close();
    }

  }
);


/* LEFT ARROW */

$("boothArrowLeft").addEventListener(
  "click",
  () => {
    scrollBooth(-1);
  }
);


/* RIGHT ARROW */

$("boothArrowRight").addEventListener(
  "click",
  () => {
    scrollBooth(1);
  }
);


/* UPDATE ARROWS WHILE SCROLLING */

$("boothFrame").addEventListener(
  "scroll",
  updateArrows,
  { passive: true }
);


/* WINDOW RESIZE */

window.addEventListener(
  "resize",
  resizeBooth
);


/* SAFARI PAGE RESTORE */

window.addEventListener(
  "pageshow",
  () => {
    resizeBooth();
    updateArrows();
  }
);


/* IMAGE LOAD */

$("boothImage").addEventListener(
  "load",
  () => {
    resizeBooth();
  }
);


/* RESIZE OBSERVER */

if (typeof ResizeObserver !== "undefined") {

  const observer = new ResizeObserver(() => {
    updateArrows();
  });

  observer.observe($("boothFrame"));
  observer.observe($("boothCanvas"));
}


/* =========================================
   START WEBSITE
   ========================================= */

init();
