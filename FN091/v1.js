// console.log("David Silva | FN091 variation 1");

window.dataLayer = window.dataLayer || [];

function stickRecommendationsSimple() {
  // Try multiple ways to find the container
  let container = null;

  // Method 1: By ID
  container = document.getElementById(
    "shopify-section-template--14576136355917__ometria_recs_f4V6GL",
  );

  // Method 2: By data attribute
  if (!container) {
    container = document.querySelector(
      '[data-rec-title="You Might Also Like"]',
    );
    if (container) {
      container = container.closest(".shopify-section") || container;
    }
  }

  // Method 3: By partial ID match
  if (!container) {
    const allElements = document.querySelectorAll('[id*="ometria"]');
    for (const el of allElements) {
      if (el.id.includes("ometria_recs")) {
        container = el;
        break;
      }
    }
  }

  // Method 4: Check if there's any element with "You Might Also Like" text
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

  addTitleIcon(container);

  // Check if the container has the recommendations content
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

function toggleCollapse(container, icon) {
  const willCollapse = !container.classList.contains("collapsed");
  const startHeight = container.getBoundingClientRect().height;

  // Only enable the transition for this manual click-driven toggle, so
  // scroll-driven stick/unstick and the initial page-load state never
  // animate.
  container.classList.add("animate-toggle");

  if (willCollapse) {
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

function addTitleIcon(container) {
  const heading = container.querySelector(".h2");
  if (!heading || !heading.parentNode) {
    return;
  }

  const titleRow = heading.parentNode;
  if (titleRow.querySelector(".sticky-recs-arrow")) {
    return;
  }

  const icon = document.createElement("span");
  icon.className = "sticky-recs-arrow";
  icon.innerHTML = ARROW_ICON_OPEN;

  icon.addEventListener("click", function () {
    toggleCollapse(container, icon);

    if (container.classList.contains("collapsed")) {
      // 8 Collapses upsell section
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "FN091 | Event Tracking",
          eventLabel: "FN091 | (Variation 1) | Collapses upsell section",
          eventSegment: "FN091EV1N",
        },
      });

      // console.log("Collapses upsell section");
    } else {
      // 9 Manually opens upsell section
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "FN091 | Event Tracking",
          eventLabel: "FN091 | (Variation 1) | Manually opens upsell section",
          eventSegment: "FN091EV1O",
        },
      });

      // console.log("Manually opens upsell section");
    }
  });

  titleRow.classList.add("sticky-recs-title-row");
  titleRow.insertBefore(icon, heading);
}

function applySticky(container) {
  // Check if mobile
  const isMobile = window.innerWidth < 768;

  if (!isMobile) {
    return;
  }

  // Anchor reserves the container's natural slot in the page and is the
  // stable target we watch for visibility. It establishes its own block
  // formatting context (flow-root) so the container's trailing margin is
  // always correctly accounted for instead of collapsing away or
  // overflowing past it.
  const anchor = document.createElement("div");
  anchor.className = "sticky-recs-anchor";

  container.parentNode.insertBefore(anchor, container);
  anchor.appendChild(container);

  function stick() {
    // Lock in the anchor's current natural height (content + margin)
    // before removing the container from flow, so the page doesn't jump.
    anchor.style.height = anchor.offsetHeight + "px";
    container.classList.add("sticky-recs-container", "collapsed");
    container.classList.remove("unstuck");

    const icon = container.querySelector(".sticky-recs-arrow");
    if (icon) {
      icon.innerHTML = ARROW_ICON_CLOSED;
    }
  }

  function unstick() {
    // Let the anchor size itself naturally again, always accurate.
    anchor.style.height = "";
    container.classList.remove("sticky-recs-container");
    container.classList.add("unstuck");

    // 11 Existing reccs in viewport
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "FN091 | Event Tracking",
        eventLabel: "FN091 | (Variation 1) | Existing reccs in viewport",
        eventSegment: "FN091EV1R",
      },
    });

    // console.log("Existing reccs in viewport");
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

  // Auto-open after 10s of no user interaction, any interaction resets
  // the timer. Only opens if it's currently stuck and collapsed, and only
  // ever fires once per page visit. Frozen (deferred, without consuming
  // the one-time budget) while the size selector or cart drawer is open,
  // so we never interrupt someone mid-conversion.
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

        // 2 Discover element is expanded automatically
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN091 | Event Tracking",
            eventLabel:
              "FN091 | (Variation 1) | Discover element is expanded automatically",
            eventSegment: "FN091EV1H",
          },
        });

        // console.log("Discover element is expanded automatically");
      }
      stopAutoOpen();
    }, 10000);
  }

  window.addEventListener("scroll", scheduleAutoOpen, { passive: true });
  window.addEventListener("touchmove", scheduleAutoOpen, { passive: true });
  window.addEventListener("click", scheduleAutoOpen);

  scheduleAutoOpen();
}

const LANDING_SESSION_KEY = "fn091_v1_landing_checked";

// Only run for users whose current PDP view is itself the entry point
// to the site this session (external/empty referrer), not those who
// clicked into it from elsewhere on the site. Decided once per session,
// via sessionStorage, so a later PDP view never re-triggers it even if
// that later view also happens to have an external referrer.
function isFirstPdpLandingThisSession() {
  if (sessionStorage.getItem(LANDING_SESSION_KEY)) {
    return false;
  }
  sessionStorage.setItem(LANDING_SESSION_KEY, "true");

  const referrer = document.referrer;
  if (!referrer) {
    return true;
  }

  try {
    const normalize = (host) => host.replace(/^www\./, "");
    return (
      normalize(new URL(referrer).hostname) !==
      normalize(window.location.hostname)
    );
  } catch (e) {
    return true;
  }
}

function initStickyRecommendations() {
  if (!isFirstPdpLandingThisSession()) {
    return;
  }
  stickRecommendationsSimple();
}

// Run the script
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initStickyRecommendations);
} else {
  initStickyRecommendations();
}

(function trackDiscoverySectionPresence() {
  function checkAndLog() {
    if (!document.querySelector(".sticky-recs-anchor")) {
      return false;
    }
    // 1 Discovery section is present on PDPs
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "FN091 | Event Tracking",
        eventLabel:
          "FN091 | (Variation 1) | Discovery section is present on PDPs",
        eventSegment: "FN091EV1G",
      },
    });

    // console.log("Discovery section is present on PDPs");
    return true;
  }

  function start() {
    if (checkAndLog()) {
      return;
    }
    const observer = new MutationObserver(() => {
      if (checkAndLog()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

// Clicking track events
function trackEvents() {
  if (
    !document.querySelector("body").classList.contains("fn091-events-tracked")
  ) {
    document.querySelector("body").classList.add("fn091-events-tracked");
    document.addEventListener("click", (e) => {
      if (e.target.closest(".sticky-recs-anchor [data-open-quickbuy]")) {
        if (e.target.closest(".sticky-recs-container")) {
          // 4 New reccs product ATB
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN091 | Event Tracking",
              eventLabel: "FN091 | (Variation 1) | New reccs product ATB",
              eventSegment: "FN091EV1J",
            },
          });

          // console.log("New reccs product ATB");
        } else if (e.target.closest(".sticky-recs-anchor .unstuck")) {
          // 13 Existing reccs ATB
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN091 | Event Tracking",
              eventLabel: "FN091 | (Variation 1) | Existing reccs ATB",
              eventSegment: "FN091EV1T",
            },
          });

          // console.log("Existing reccs ATB");
        }
        return;
      }

      if (e.target.closest(".sticky-recs-container a[href]")) {
        // 3 New reccs product click through
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN091 | Event Tracking",
            eventLabel:
              "FN091 | (Variation 1) | New reccs product click through",
            eventSegment: "FN091EV1I",
          },
        });

        // console.log("New reccs product click through");
      } else if (e.target.closest(".sticky-recs-anchor .unstuck a[href]")) {
        // 12 Existing reccs click through
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN091 | Event Tracking",
            eventLabel: "FN091 | (Variation 1) | Existing reccs click through",
            eventSegment: "FN091EV1S",
          },
        });

        // console.log("Existing reccs click through");
      }

      if (e.target.closest('product-form button[name="add"]')) {
        // 15 Static ATB click
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN091 | Event Tracking",
            eventLabel: "FN091 | (Variation 1) | Static ATB",
            eventSegment: "FN091EV1V",
          },
        });

        // console.log("Static ATB click");
      }
    });
  }
}

trackEvents();
