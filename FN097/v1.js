console.log("David Silva | FN097 variation 1");

window.dataLayer = window.dataLayer || [];

(function () {
  const mq = window.matchMedia(
    "(min-width: 360px) and (max-width: 765px) and (max-height: 956px)",
  );
  const desktopMq = window.matchMedia("(min-width: 768px)");
  let observer;

  function getSizeFields() {
    return document.querySelectorAll('[data-dropdown-name="Size"]');
  }

  function syncLabel() {
    getSizeFields().forEach(function (field) {
      const label = field.querySelector("[data-dropdown-btn-text]");
      if (!label) return;
      if (label.textContent.trim() === "Size:") {
        label.textContent = "Select size";
      }
    });
  }

  function syncMobileSelectLabel() {
    const option = document.querySelector(
      'select[data-mobile-select="Size"] option[value="#"]',
    );
    if (!option) return;
    if (option.textContent.trim() === "Size:") {
      option.textContent = "Select size";
    }
  }

  function syncWornBy() {
    const block = document.querySelector(
      ".max-w-screen-2xl.mx-auto.mb-10.md\\:hidden",
    );
    if (!block) return;
    block.style.display = mq.matches ? "none" : "";
  }

  function syncShippingIcon() {
    const p = document.querySelector("[data-pdp-shipping-message] > p");
    const icon = document.querySelector(
      '[data-reveal-trigger][data-type="secondary"] > img.plus',
    );
    if (!p || !icon) return;
    const qualifies =
      p.textContent.trim() ===
      "Your basket qualifies for Free Standard Shipping";
    icon.style.display = qualifies ? "none" : "";
  }

  function syncAccordionIcons() {
    document
      .querySelectorAll("[data-reveal-trigger]")
      .forEach(function (trigger) {
        const content = trigger.nextElementSibling;
        if (!content || !content.hasAttribute("data-reveal-content")) return;
        const inlineHeight = content.style.height;
        let isOpen;
        if (inlineHeight === "0px") {
          isOpen = false;
        } else if (inlineHeight) {
          isOpen = true;
        } else {
          isOpen = content.offsetHeight > 0;
          if (isOpen && desktopMq.matches) {
            content.style.height = content.offsetHeight + "px";
            content.dataset.heightWarmed = "true";
          }
        }
        if (!desktopMq.matches && content.dataset.heightWarmed === "true") {
          content.style.height = "";
          delete content.dataset.heightWarmed;
        }
        if (isOpen) {
          trigger.setAttribute("data-icon-state", "open");
        } else {
          trigger.removeAttribute("data-icon-state");
        }
      });
  }

  function sync() {
    syncLabel();
    syncMobileSelectLabel();
    syncWornBy();
    syncShippingIcon();
    syncAccordionIcons();
  }

  function watchLabel() {
    if (observer) return;
    observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  function init() {
    sync();
    watchLabel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  mq.addEventListener("change", sync);
})();

function trackEvents() {
  if (!document.querySelector("body").classList.contains("FN097")) {
    document.querySelector("body").classList.add("FN097");
    document.addEventListener(
      "click",
      (e) => {
        // 1. Selects colour
        if (e.target.closest(".boxes a")) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN097 | Event Tracking",
              eventLabel: "FN097 | (Variation 1) | Selects colour",
              eventSegment: "FN097EV1G",
            },
          });

          console.log("Selects colour click");
        }

        // 2. Clicks find your size
        if (e.target.closest("[data-size-guide-trigger]")) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN097 | Event Tracking",
              eventLabel: "FN097 | (Variation 1) | Clicks find your size",
              eventSegment: "FN097EV1H",
            },
          });

          console.log("Find your size click");
        }

        // 3. Opens size selector dropdown
        if (
          e.target.closest('[data-dropdown-name="Size"] [data-dropdown-btn]')
        ) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN097 | Event Tracking",
              eventLabel:
                "FN097 | (Variation 1) | Opens size selector dropdown",
              eventSegment: "FN097EV1I",
            },
          });

          console.log("Opens size selector dropdown");
        }

        // 4. Selects size from dropdown
        if (
          e.target.closest(
            '[data-dropdown-content="Size"] [data-dropdown-value]',
          )
        ) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN097 | Event Tracking",
              eventLabel: "FN097 | (Variation 1) | Selects size from dropdown",
              eventSegment: "FN097EV1J",
            },
          });

          console.log("Selects size from dropdown");
        }

        // 5. Clicks Reviews Summary
        if (
          e.target.closest(
            '.pdp-main-okendo-rating a[href="#okendo-reviews-widget"]',
          )
        ) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN097 | Event Tracking",
              eventLabel: "FN097 | (Variation 1) | Clicks Reviews Summary",
              eventSegment: "FN097EV1K",
            },
          });

          console.log("Clicks Reviews Summary");
        }

        // 6. Opens product info dropdown
        const infoTrigger = e.target.closest(
          '[data-reveal-trigger][data-type="primary"]',
        );
        if (
          infoTrigger &&
          infoTrigger.getAttribute("data-icon-state") !== "open"
        ) {
          const title = infoTrigger.querySelector("p.font-bold");
          const titleText = title ? title.textContent.trim() : "";

          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN097 | Event Tracking",
              eventLabel:
                "FN097 | (Variation 1) | Opens product info dropdown | " +
                titleText,
              eventSegment: "FN097EV1L",
            },
          });

          console.log("Opens product info dropdown: " + titleText);
        }
      },
      true,
    );
  }
}

trackEvents();
