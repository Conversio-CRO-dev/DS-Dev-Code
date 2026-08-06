console.log("David Silva | FN091 variation 2");

function stickRecommendationsSimple() {
  let container = null;

  container = document.getElementById(
    "shopify-section-template--14576136355917__ometria_recs_f4V6GL",
  );

  if (!container) {
    container = document.querySelector(
      '[data-rec-title="You Might Also Like"]',
    );
    if (container) {
      container = container.closest(".shopify-section") || container;
    }
  }

  if (!container) {
    const allElements = document.querySelectorAll('[id*="ometria"]');
    for (const el of allElements) {
      if (el.id.includes("ometria_recs")) {
        container = el;
        break;
      }
    }
  }

  if (!container) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (
            node.textContent &&
            node.textContent.toLowerCase().trim() === "you might also like"
          ) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        },
      },
    );

    const textNode = walker.nextNode();
    if (textNode) {
      container =
        textNode.parentElement.closest(".shopify-section") ||
        textNode.parentElement.closest('[id*="ometria"]') ||
        textNode.parentElement;
    }
  }

  if (!container) {
    return;
  }

  addTitleTabs(container);

  const hasProducts =
    container.querySelector(".swiper-slide") ||
    container.querySelector("[data-product-id]") ||
    container.querySelector(".product-item");

  if (!hasProducts) {
    const productObserver = new MutationObserver(() => {
      const products =
        container.querySelector(".swiper-slide") ||
        container.querySelector("[data-product-id]");
      if (products) {
        productObserver.disconnect();
        applySticky(container);
      }
    });

    productObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      const products =
        container.querySelector(".swiper-slide") ||
        container.querySelector("[data-product-id]");
      productObserver.disconnect();
      applySticky(container);
    }, 3000);

    return;
  }

  applySticky(container);
}

const ARROW_ICON_OPEN =
  '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="12" viewBox="0 0 21 12" fill="none"><path d="M0.353516 0.353516L10.3535 10.3535L20.3535 0.353516" stroke="black"/></svg>';
const ARROW_ICON_CLOSED =
  '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="12" viewBox="0 0 21 12" fill="none"><path d="M0.353516 10.707L10.3535 0.707031L20.3535 10.707" stroke="black"/></svg>';

const CATEGORY_COLLECTION_URLS = {
  mens: "https://finisterre.com/collections/mens",
  womens: "https://finisterre.com/collections/womens",
  accessories: "https://finisterre.com/collections/accessories",
};

function getProductCategory() {
  const match = window.location.pathname.match(/\/products\/([^/?#]+)/);
  const handle = match ? match[1] : "";
  if (/^mens?-/.test(handle)) {
    return "mens";
  }
  if (/^womens?-/.test(handle)) {
    return "womens";
  }
  return "accessories";
}

function matchRecsCardStyle(slider) {
  // Reuse the theme's existing utility classes so these cards end up
  // styled like the recs cards, rather than guessing custom CSS.
  slider.querySelectorAll(".swiper-slide").forEach((slide) => {
    const img = slide.querySelector("img");
    if (img) {
      img.classList.add("w-full");
      const imgWrapper = img.closest("div");
      if (imgWrapper) {
        imgWrapper.classList.add("mb-4");

        // Same "Just In" badge the recs cards show, just with "Shop".
        const badge = document.createElement("div");
        badge.className = "relative";
        badge.innerHTML =
          '<div class="flex items-start flex-wrap"><div style="background-color: rgb(231, 221, 187);"><span class="flex justify-center product-tag min-w-25" style="color: rgb(0, 0, 0);">Shop</span></div></div>';
        imgWrapper.appendChild(badge);
      }
    }

    const shopLabel = slide.querySelector("p");
    if (shopLabel) {
      shopLabel.remove();
    }

    const titleHeading = slide.querySelector("h3");
    if (titleHeading) {
      titleHeading.classList.add("mb-2", "ellipsis-2-line");
    }

    const titleLink = slide.querySelector("h3 a");
    if (titleLink) {
      titleLink.classList.remove("link");
    }
  });
}

function fitExploreToRecsHeight(container, explorePanel) {
  // Runs once; both elements must be visible/laid out to measure, so
  // this is a no-op (retried later) if either isn't rendered yet.
  if (explorePanel.dataset.heightFitted === "true") {
    return;
  }

  const recsSlider = container.querySelector(
    ".sticky-recs-content-stack > .page-margin-slider",
  );
  const exploreSlider = explorePanel.querySelector(".page-margin-slider");
  if (!recsSlider || !exploreSlider) {
    return;
  }

  const contentStack = recsSlider.parentElement;

  const recsImg = recsSlider.querySelector(".swiper-slide img");
  const images = exploreSlider.querySelectorAll(".swiper-slide img");
  if (!recsImg || !images.length) {
    return;
  }

  // Match the recs image's rendered height directly (not derived from
  // leftover space after the text), so images are always the same size.
  const targetImageHeight = recsImg.getBoundingClientRect().height;
  const targetHeight = recsSlider.getBoundingClientRect().height;

  if (!targetImageHeight || !targetHeight) {
    return;
  }

  images.forEach((image) => {
    image.style.height = targetImageHeight + "px";
    image.style.width = "100%";
    image.style.objectFit = "cover";
  });

  // Cap the swiper, the panel, and the stack (which now needs its own
  // explicit height, since both panels are absolutely positioned for
  // the cross-fade and no longer size it on their own) all to the same
  // height, so nothing in between can sneak in extra pixels.
  const swiperEl = exploreSlider.querySelector(".swiper");
  if (swiperEl) {
    swiperEl.style.height = targetHeight + "px";
    swiperEl.style.overflow = "hidden";
  }

  explorePanel.style.height = targetHeight + "px";
  explorePanel.style.overflow = "hidden";

  if (contentStack) {
    contentStack.style.height = targetHeight + "px";
  }

  // h3 carries the theme's own heading styles; match the recs title's
  // actual computed font styling directly instead.
  const recsTitle = recsSlider.querySelector(".swiper-slide .ellipsis-2-line");
  const titles = exploreSlider.querySelectorAll(".swiper-slide h3");
  if (recsTitle && titles.length) {
    const recsTitleStyle = window.getComputedStyle(recsTitle);
    titles.forEach((title) => {
      title.style.fontFamily = recsTitleStyle.fontFamily;
      title.style.fontSize = recsTitleStyle.fontSize;
      title.style.fontWeight = recsTitleStyle.fontWeight;
      title.style.lineHeight = recsTitleStyle.lineHeight;
      title.style.color = recsTitleStyle.color;
      title.style.margin = "0 0 8px 0";
    });
  }

  explorePanel.dataset.heightFitted = "true";
}

function loadExploreContent(explorePanel, container) {
  const url = CATEGORY_COLLECTION_URLS[getProductCategory()];

  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");

      const heading = Array.from(doc.querySelectorAll("h2")).find(
        (h2) => h2.textContent.trim().toLowerCase() === "our collections",
      );
      const section =
        doc.querySelector('[id$="__carousel-collection"]') ||
        (heading && heading.closest(".shopify-section"));

      if (!section) {
        return;
      }

      const slider = section.querySelector(".page-margin-slider");
      if (!slider) {
        return;
      }

      matchRecsCardStyle(slider);

      // The source page's slider wrapper carries its own bottom margin
      // (mb-5) that the recs slider's equivalent wrapper doesn't have.
      const swiperWrapper = slider.querySelector(".swiper")?.parentElement;
      if (swiperWrapper) {
        swiperWrapper.style.marginBottom = "0";
      }

      explorePanel.innerHTML = "";
      explorePanel.appendChild(slider);

      // The fetched copy's Swiper instance doesn't travel with it, so it
      // needs a fresh one. window.Swiper often isn't a global, so fall
      // back to the constructor off the already-initialized recs
      // carousel (Swiper attaches the instance to the DOM node as
      // `.swiper`). Reuse its sizing params too, for identical widths.
      const recsSwiperEl = container.querySelector(
        ".swiper.swiper-initialized",
      );
      const recsParams =
        recsSwiperEl && recsSwiperEl.swiper && recsSwiperEl.swiper.params;

      const swiperEl = slider.querySelector(".swiper");
      const SwiperConstructor =
        window.Swiper ||
        (recsSwiperEl &&
          recsSwiperEl.swiper &&
          recsSwiperEl.swiper.constructor);

      if (swiperEl && SwiperConstructor) {
        swiperEl.classList.remove("swiper-initialized");
        new SwiperConstructor(swiperEl, {
          slidesPerView: (recsParams && recsParams.slidesPerView) || "auto",
          spaceBetween: (recsParams && recsParams.spaceBetween) || 10,
          freeMode: true,
        });
      }

      fitExploreToRecsHeight(container, explorePanel);
    })
    .catch(() => {
      // Leave the Explore panel empty rather than breaking the module.
    });
}

function resetActiveTabToRecs(container) {
  const recsTab = container.querySelector('.sticky-recs-tab[data-tab="recs"]');
  const exploreTab = container.querySelector(
    '.sticky-recs-tab[data-tab="explore"]',
  );
  container.dataset.activeTab = "recs";
  if (recsTab) recsTab.classList.add("active");
  if (exploreTab) exploreTab.classList.remove("active");
}

function toggleCollapse(container, icon) {
  const willCollapse = !container.classList.contains("collapsed");
  const startHeight = container.getBoundingClientRect().height;

  // Only enable the transition for this manual click-driven toggle, so
  // scroll-driven stick/unstick and the initial page-load state never
  // animate.
  container.classList.add("animate-toggle");

  if (willCollapse) {
    resetActiveTabToRecs(container);
    container.style.height = startHeight + "px";
    void container.offsetHeight; // force reflow so the browser registers the start height
    container.classList.add("collapsed");
    container.style.height = "35px";
  } else {
    container.classList.remove("collapsed");
    const endHeight = container.getBoundingClientRect().height;
    container.classList.add("collapsed");
    container.style.height = startHeight + "px";
    void container.offsetHeight; // force reflow so the browser registers the start height
    container.classList.remove("collapsed");
    container.style.height = endHeight + "px";
  }

  container.addEventListener("transitionend", function onTransitionEnd(event) {
    if (event.target !== container || event.propertyName !== "height") {
      return;
    }
    container.style.height = "";
    container.classList.remove("animate-toggle");
    container.removeEventListener("transitionend", onTransitionEnd);
  });

  icon.innerHTML = willCollapse ? ARROW_ICON_CLOSED : ARROW_ICON_OPEN;
}

function addTitleTabs(container) {
  const heading = container.querySelector(".h2");
  if (!heading || !heading.parentNode) {
    return;
  }

  const titleRow = heading.parentNode;
  if (titleRow.querySelector(".sticky-recs-tabs")) {
    return;
  }

  const recsLabel = heading.textContent.trim() || "You Might Also Like";

  const icon = document.createElement("span");
  icon.className = "sticky-recs-arrow";
  icon.innerHTML = ARROW_ICON_OPEN;

  icon.addEventListener("click", function () {
    toggleCollapse(container, icon);
  });

  const tabs = document.createElement("div");
  tabs.className = "sticky-recs-tabs";

  const recsTab = document.createElement("button");
  recsTab.type = "button";
  recsTab.className = "sticky-recs-tab";
  recsTab.dataset.tab = "recs";
  recsTab.textContent = recsLabel;

  const exploreTab = document.createElement("button");
  exploreTab.type = "button";
  exploreTab.className = "sticky-recs-tab";
  exploreTab.dataset.tab = "explore";
  exploreTab.textContent = "Explore";

  tabs.appendChild(recsTab);
  tabs.appendChild(exploreTab);

  // Both panels stack inside .sticky-recs-content-stack for the
  // cross-fade; Explore's content is pre-loaded in the background so
  // it's ready by the time the user taps the tab.
  const slider = container.querySelector(".page-margin-slider");
  const contentStack = document.createElement("div");
  contentStack.className = "sticky-recs-content-stack";

  const explorePanel = document.createElement("div");
  explorePanel.className = "sticky-recs-explore-panel";

  if (slider && slider.parentNode) {
    slider.parentNode.insertBefore(contentStack, slider);
    contentStack.appendChild(slider);
    contentStack.appendChild(explorePanel);
  }
  loadExploreContent(explorePanel, container);

  function setActiveTab(tabName) {
    container.dataset.activeTab = tabName;
    recsTab.classList.toggle("active", tabName === "recs");
    exploreTab.classList.toggle("active", tabName === "explore");
  }

  recsTab.addEventListener("click", function () {
    setActiveTab("recs");
  });
  exploreTab.addEventListener("click", function () {
    setActiveTab("explore");
    fitExploreToRecsHeight(container, explorePanel);
  });

  setActiveTab("recs");

  // The original heading stays in the DOM untouched, hidden via CSS
  // only while stuck, so the native in-page rendering never changes.
  titleRow.classList.add("sticky-recs-title-row");
  titleRow.insertBefore(icon, heading);
  titleRow.insertBefore(tabs, heading);
}

function applySticky(container) {
  const isMobile = window.innerWidth < 768;

  if (!isMobile) {
    return;
  }

  // Reserves the container's natural slot and is the stable target we
  // watch for visibility (flow-root avoids margin-collapse issues).
  const anchor = document.createElement("div");
  anchor.className = "sticky-recs-anchor";

  container.parentNode.insertBefore(anchor, container);
  anchor.appendChild(container);

  function stick() {
    anchor.style.height = anchor.offsetHeight + "px";
    container.classList.add("sticky-recs-container", "collapsed");
    container.classList.remove("unstuck");
    resetActiveTabToRecs(container);

    const icon = container.querySelector(".sticky-recs-arrow");
    if (icon) {
      icon.innerHTML = ARROW_ICON_CLOSED;
    }
  }

  function unstick() {
    anchor.style.height = "";
    container.classList.remove("sticky-recs-container");
    container.classList.add("unstuck");
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        unstick();
      } else {
        stick();
      }
    },
    { threshold: 0 },
  );

  observer.observe(anchor);

  // Auto-open after 10s idle, once per page visit; deferred (without
  // consuming that one-time budget) while the size selector or cart
  // drawer is open, so it never interrupts mid-conversion.
  let idleTimer = null;

  function isSizeSelectorOpen() {
    const dropdowns = document.querySelectorAll(
      '[data-dropdown-content="Size"]',
    );
    return Array.from(dropdowns).some(
      (dropdown) => !dropdown.classList.contains("hidden"),
    );
  }

  function isCartDrawerOpen() {
    const drawer = document.querySelector(".menu-drawer.right");
    return !!drawer && drawer.classList.contains("drawer-open-right");
  }

  function stopAutoOpen() {
    clearTimeout(idleTimer);
    window.removeEventListener("scroll", scheduleAutoOpen);
    window.removeEventListener("touchmove", scheduleAutoOpen);
    window.removeEventListener("click", scheduleAutoOpen);
  }

  function scheduleAutoOpen() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (isSizeSelectorOpen() || isCartDrawerOpen()) {
        // Frozen: don't fire and don't consume the one-time budget, just
        // check again after another idle period.
        scheduleAutoOpen();
        return;
      }

      const icon = container.querySelector(".sticky-recs-arrow");
      if (
        icon &&
        container.classList.contains("sticky-recs-container") &&
        container.classList.contains("collapsed")
      ) {
        toggleCollapse(container, icon);
      }
      stopAutoOpen();
    }, 10000);
  }

  window.addEventListener("scroll", scheduleAutoOpen, { passive: true });
  window.addEventListener("touchmove", scheduleAutoOpen, { passive: true });
  window.addEventListener("click", scheduleAutoOpen);

  scheduleAutoOpen();
}

function initStickyRecommendations() {
  stickRecommendationsSimple();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStickyRecommendations);
} else {
  initStickyRecommendations();
}
