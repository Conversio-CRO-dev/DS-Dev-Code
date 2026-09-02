console.log("David Silva | FN097 control");

window.dataLayer = window.dataLayer || [];

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
              eventLabel: "FN097 | (Control Original) | Selects colour",
              eventSegment: "FN097ECOG",
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
              eventLabel: "FN097 | (Control Original) | Clicks find your size",
              eventSegment: "FN097ECOH",
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
                "FN097 | (Control Original) | Opens size selector dropdown",
              eventSegment: "FN097ECOI",
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
              eventLabel:
                "FN097 | (Control Original) | Selects size from dropdown",
              eventSegment: "FN097ECOJ",
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
              eventLabel: "FN097 | (Control Original) | Clicks Reviews Summary",
              eventSegment: "FN097ECOK",
            },
          });

          console.log("Clicks Reviews Summary");
        }

        // 6. Opens product info dropdown
        const infoTrigger = e.target.closest(
          '[data-reveal-trigger][data-type="primary"]',
        );
        const infoContent = infoTrigger && infoTrigger.nextElementSibling;
        const infoIsOpen =
          infoContent &&
          infoContent.hasAttribute("data-reveal-content") &&
          (infoContent.style.height === "0px"
            ? false
            : infoContent.style.height
              ? true
              : infoContent.offsetHeight > 0);

        if (infoTrigger && !infoIsOpen) {
          const title = infoTrigger.querySelector("p.font-bold");
          const titleText = title ? title.textContent.trim() : "";

          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN097 | Event Tracking",
              eventLabel:
                "FN097 | (Control Original) | Opens product info dropdown | " +
                titleText,
              eventSegment: "FN097ECOL",
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
