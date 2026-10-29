// console.log("David Silva | FN091 control");

window.dataLayer = window.dataLayer || [];

const LANDING_SESSION_KEY = "fn091_control_landing_checked";

// Only counts a genuine session landing (external/empty referrer), decided
// once per session via sessionStorage, so a later PDP view never re-triggers
// it even if that later view also happens to have an external referrer.
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

function isProductPage() {
  return /\/products\//.test(window.location.pathname);
}

// Same container-detection fallback as stickRecommendationsSimple() in
// v1/v2, minus the anchor/sticky wrapping, since control only needs to
// find the native section to observe it, not modify it.
function findRecsContainer() {
  let container = document.getElementById(
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

  return container;
}

// Fires every time the native section scrolls into view, however many
// times that happens in the session (same as v1/v2's "Existing reccs in
// viewport" behavior).
function trackExistingRecsInViewport(container) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        // 10 Existing reccs in viewport
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN091 | Event Tracking",
            eventLabel:
              "FN091 | (Control Original) | Existing reccs in viewport",
            eventSegment: "FN091ECOR",
          },
        });

        // console.log("Existing reccs in viewport");
      }
    },
    { threshold: 0 },
  );

  observer.observe(container);
}

// Structurally independent from the recs container, so no exclusivity
// concerns with the events above.
function trackStaticATB() {
  document.addEventListener("click", (e) => {
    if (e.target.closest('product-form button[name="add"]')) {
      // 14 Static ATB
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "FN091 | Event Tracking",
          eventLabel: "FN091 | (Control Original) | Static ATB",
          eventSegment: "FN091ECOV",
        },
      });

      // console.log("Static ATB");
    }
  });
}

// The theme's native mobile sticky ATB bar (<variants-mobile-sticky>),
// hidden via CSS in v1/v2 since they replace it, but left untouched (and
// therefore visible/functional) in control.
function trackStickyATB() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("#add-btn-mobile")) {
      // 13 Sticky ATB
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "FN091 | Event Tracking",
          eventLabel: "FN091 | (Control Original) | Sticky ATB",
          eventSegment: "FN091ECOU",
        },
      });

      // console.log("Sticky ATB");
    }
  });
}

// Quick-buy is checked first (with an early return) since it's nested
// inside the same <a href>, keeping the two events mutually exclusive.
function trackRecsClicks(container) {
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      return;
    }

    if (e.target.closest("[data-open-quickbuy]")) {
      // 12 Existing reccs ATB
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "FN091 | Event Tracking",
          eventLabel: "FN091 | (Control Original) | Existing reccs ATB",
          eventSegment: "FN091ECOT",
        },
      });

      // console.log("Existing reccs ATB");
      return;
    }

    if (e.target.closest("a[href]")) {
      // 11 Existing reccs click through
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "FN091 | Event Tracking",
          eventLabel:
            "FN091 | (Control Original) | Existing reccs click through",
          eventSegment: "FN091ECOS",
        },
      });

      // console.log("Existing reccs click through");
    }
  });
}

// Control never renders the recs/Explore module, so there's no element to
// detect for landing. Fire based on the same conditions that would have
// shown it in the variations: the visitor is on a PDP on their first PDP
// landing this session.
function init() {
  if (!isProductPage()) {
    return;
  }
  if (!isFirstPdpLandingThisSession()) {
    return;
  }

  // 1 Discovery section is present on PDPs
  window.dataLayer.push({
    event: "conversioEvent",
    conversio: {
      eventCategory: "Conversio CRO",
      eventAction: "FN091 | Event Tracking",
      eventLabel:
        "FN091 | (Control Original) | Discovery section is present on PDPs",
      eventSegment: "FN091ECOG",
    },
  });

  // console.log("Discovery section is present on PDPs");

  trackStaticATB();
  trackStickyATB();

  const container = findRecsContainer();
  if (!container) {
    return;
  }

  trackExistingRecsInViewport(container);
  trackRecsClicks(container);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
