/* ==============================
   ATEC Interactive Booth
   ============================== */

const $ = id => document.getElementById(id);

const safePath = p => {
  if (
    typeof p === "string" &&
    /^assets\/[a-zA-Z0-9_./-]+$/.test(p) &&
    !p.includes("..")
  ) {
    return p;
  }

  return null;
};


/* IMAGE LOADING */

function setImage(el, path, placeholder = null) {

  const src = safePath(path);

  if (!src) {
    el.hidden = true;
    if (placeholder) placeholder.hidden = false;
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
    }
  };

  el.src = src;

  if (el.complete && el.naturalWidth > 0) {
    el.onload();
  }
}


/* MOBILE IMAGE RESIZE */

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

    return;
  }

  if (
    img.naturalWidth <= 0 ||
    img.naturalHeight <= 0
  ) {
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
}


/* PRODUCT POPUP */

function openProduct(p) {

  $("productTitle").textContent =
    p.name || p.id;

  $("productCategory").textContent =
    p.category || "";

  $("productDescription").textContent =
    p.description || "";

  const img = $("productImage");

  img.hidden = true;
  img.removeAttribute("src");

  setImage(img, p.image);

  $("features").replaceChildren();

  for (const feature of p.features || []) {

    if (!feature) continue;

    const li = document.createElement("li");

    li.textContent = feature;

    $("features").append(li);
  }

  $("specs").replaceChildren();

  for (const spec of p.specifications || []) {

    const dt = document.createElement("dt");
    const dd = document.createElement("dd");

    dt.textContent = spec.name;
    dd.textContent = spec.value;

    $("specs").append(dt, dd);
  }

  const brochure = $("brochure");

  const path = safePath(p.brochure);

  brochure.hidden = !path;

  if (path) {
    brochure.href = path;
  }

  $("productDialog").showModal();
}


/* LOAD WEBSITE DATA */

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

    document.title =
      settings.page_title || "ATEC Interactive Booth";

    $("title").textContent =
      settings.page_title || "Interactive Booth";

    $("event").textContent =
      settings.event_name || "";

    $("subtitle").textContent =
      settings.subtitle || "";

    /* LOGO */

    const logo = $("logo");

    setImage(logo, settings.logo_image);

    logo.addEventListener("load", () => {
      $("brandFallback").hidden = true;
    });

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

      btn.textContent = p.name || p.id;

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
        "Explore " + (p.name || p.id)
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

  } catch (error) {

    console.error(error);

    $("subtitle").textContent =
      "Unable to load website content.";
  }
}


/* EVENTS */

$("closeDialog").addEventListener("click", () => {
  $("productDialog").close();
});

$("productDialog").addEventListener(
  "click",
  event => {

    if (event.target === $("productDialog")) {
      $("productDialog").close();
    }
  }
);

window.addEventListener("resize", resizeBooth);

window.addEventListener("pageshow", () => {
  resizeBooth();
});

/* START */

init();
