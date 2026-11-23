/* =========================================
   ATEC INTERACTIVE BOOTH
   VERSION 8
   ========================================= */

const $ = id => document.getElementById(id);


/* =========================================
   PRODUCT & SOLUTION CONFIGURATION
   ========================================= */

const boothItems = [
  {
    id: "product1",
    name: "제품 1",
    category: "Product",
    x: 15,
    y: 35,
    description: "제품 1에 대한 설명을 입력해주세요.",
    features: [],
    specifications: [],
    image: "",
    brochure: ""
  },
  {
    id: "product2",
    name: "제품 2",
    category: "Product",
    x: 30,
    y: 55,
    description: "제품 2에 대한 설명을 입력해주세요.",
    features: [],
    specifications: [],
    image: "",
    brochure: ""
  },
  {
    id: "product3",
    name: "제품 3",
    category: "Product",
    x: 45,
    y: 35,
    description: "제품 3에 대한 설명을 입력해주세요.",
    features: [],
    specifications: [],
    image: "",
    brochure: ""
  },
  {
    id: "product4",
    name: "제품 4",
    category: "Product",
    x: 60,
    y: 55,
    description: "제품 4에 대한 설명을 입력해주세요.",
    features: [],
    specifications: [],
    image: "",
    brochure: ""
  },
  {
    id: "product5",
    name: "제품 5",
    category: "Product",
    x: 75,
    y: 35,
    description: "제품 5에 대한 설명을 입력해주세요.",
    features: [],
    specifications: [],
    image: "",
    brochure: ""
  },
  {
    id: "solution1",
    name: "솔루션 1",
    category: "Solution",
    x: 90,
    y: 55,
    description: "솔루션 1에 대한 설명을 입력해주세요.",
    features: [],
    specifications: [],
    image: "",
    brochure: ""
  }
];


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
    if (placeholder) placeholder.hidden = false;
    return;
  }

  el.onload = () => {
    el.hidden = false;

    if (placeholder) placeholder.hidden = true;

    if (el.id === "boothImage") {
      resizeBooth();
      centerBoothOnFirstLoad();
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
   MOBILE BOOTH RESIZE
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

  if (img.naturalWidth <= 0 || img.naturalHeight <= 0) {
    updateArrows();
    return;
  }

  const ratio = img.naturalWidth / img.naturalHeight;

  const imageWidth = Math.max(
    frame.clientWidth,
    Math.round(frame.clientHeight * ratio)
  );

  canvas.style.width = imageWidth + "px";
  canvas.style.minWidth = imageWidth + "px";

  updateArrows();
}


/* =========================================
   INITIAL CENTER ALIGNMENT
   ========================================= */

let initialBoothCentered = false;

function centerBoothOnFirstLoad() {
  if (initialBoothCentered) return;

  const frame = $("boothFrame");
  const img = $("boothImage");

  if (!frame || !img) return;

  if (img.naturalWidth <= 0) return;

  resizeBooth();

  requestAnimationFrame(() => {
    const maxScroll =
      frame.scrollWidth - frame.clientWidth;

    if (maxScroll <= 0) return;

    frame.scrollLeft = maxScroll / 2;

    initialBoothCentered = true;

    updateArrows();
  });
}


/* =========================================
   SCROLL ARROWS
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

  left.hidden = frame.scrollLeft <= 2;
  right.hidden = frame.scrollLeft >= maxScroll - 2;
}

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
    behavior: reduceMotion ? "auto" : "smooth"
  });
}


/* =========================================
   PRODUCT POPUP
   ========================================= */

function openProduct(p) {
  $("productTitle").textContent = p.name || p.id || "";
  $("productCategory").textContent = p.category || "";
  $("productDescription").textContent = p.description || "";

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

    dt.textContent = spec.name || "";
    dd.textContent = spec.value || "";

    $("specs").append(dt, dd);
  }

  const brochure = $("brochure");
  const path = safePath(p.brochure);

  brochure.hidden = !path;

  if (path) {
    brochure.href = path;
  } else {
    brochure.removeAttribute("href");
  }

  $("productDialog").showModal();
}


/* =========================================
   CREATE SIX HOTSPOTS
   ========================================= */

function createBoothHotspots() {
  const container = $("hotspots");

  container.replaceChildren();

  for (const item of boothItems) {
    const btn = document.createElement("button");

    btn.type = "button";
    btn.className = "hotspot";
    btn.textContent = item.name;

    const x = Math.max(
      0,
      Math.min(100, Number(item.x) || 0)
    );

    const y = Math.max(
      0,
      Math.min(100, Number(item.y) || 0)
    );

    btn.style.left = x + "%";
    btn.style.top = y + "%";

    btn.setAttribute(
      "aria-label",
      "Explore " + item.name
    );

    btn.addEventListener("click", () => {
      openProduct(item);
    });

    container.append(btn);
  }
}


/* =========================================
   LOAD WEBSITE DATA
   ========================================= */

async function init() {
  createBoothHotspots();

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

    const logo = $("logo");

    logo.addEventListener("load", () => {
      $("brandFallback").hidden = true;
    });

    setImage(logo, settings.logo_image);

    setImage(
      $("boothImage"),
      settings.booth_image,
      $("boothPlaceholder")
    );

    $("downloads").replaceChildren();

    let count = 0;

    for (const d of data.downloads || []) {
      const path = safePath(d.path);

      if (!d.visible || !path) continue;

      const a = document.createElement("a");

      a.href = path;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = (d.label || "Download") + " ↗";

      $("downloads").append(a);
      count++;
    }

    if (!count) {
      const p = document.createElement("p");

      p.className = "muted";
      p.textContent = "Resources will be available soon.";

      $("downloads").append(p);
    }

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

    resizeBooth();
    centerBoothOnFirstLoad();

  } catch (error) {
    console.error(error);

    $("subtitle").textContent =
      "Unable to load website content.";
  }
}


/* =========================================
   EVENT LISTENERS
   ========================================= */

$("closeDialog").addEventListener("click", () => {
  $("productDialog").close();
});

$("productDialog").addEventListener("click", event => {
  if (event.target === $("productDialog")) {
    $("productDialog").close();
  }
});

$("boothArrowLeft").addEventListener("click", () => {
  scrollBooth(-1);
});

$("boothArrowRight").addEventListener("click", () => {
  scrollBooth(1);
});

$("boothFrame").addEventListener(
  "scroll",
  updateArrows,
  { passive: true }
);

window.addEventListener("resize", () => {
  resizeBooth();
  updateArrows();
});

window.addEventListener("pageshow", () => {
  resizeBooth();
  centerBoothOnFirstLoad();
  updateArrows();
});

$("boothImage").addEventListener("load", () => {
  resizeBooth();
  centerBoothOnFirstLoad();
});

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
