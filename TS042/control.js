// console.log("David Silva | TS042 control");

(function () {
  "use strict";

  const TARGET_MATCH = /balaclava/i;

  window.dataLayer = window.dataLayer || [];

  function isBalaclavaOption(productOption) {
    const thumb = productOption.querySelector(".product img[alt]");
    return !!(thumb && TARGET_MATCH.test(thumb.getAttribute("alt") || ""));
  }

  function findBalaclavaOption(supplementList) {
    const options = supplementList.querySelectorAll("sms-product-option");
    for (let i = 0; i < options.length; i++) {
      if (isBalaclavaOption(options[i])) return options[i];
    }
    return null;
  }

  function trackPostAtbModalDisplayed(balaclava) {
    // Already tracked: bail out so this fires once per modal appearance,
    // independent of the other tracking guard below.
    if (balaclava.dataset.ts042Tracked) return;

    balaclava.dataset.ts042Tracked = "true";
    // 1. Post ATB Modal Displayed (trigger)
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "TS042 | Event Tracking",
        eventLabel:
          "TS042 | (Control Original) | Post ATB Modal Displayed (trigger)",
        eventSegment: "TS042ECOQ",
      },
    });

    // console.log("Post ATB Modal Displayed (trigger)");
  }

  function trackBalaclavaProductDisplayed(balaclava) {
    // Already tracked: bail out so this fires once per modal appearance,
    // independent of the other tracking guard above.
    if (balaclava.dataset.ts042DisplayTracked) return;

    balaclava.dataset.ts042DisplayTracked = "true";
    // 2. Balaclava Product Displayed
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "TS042 | Event Tracking",
        eventLabel: "TS042 | (Control Original) | Balaclava Product Displayed",
        eventSegment: "TS042ECOG",
      },
    });

    // console.log("Balaclava Product Displayed");
  }

  function checkBalaclavaDisplayed(supplementList) {
    const balaclava = findBalaclavaOption(supplementList);
    if (!balaclava) return;

    trackPostAtbModalDisplayed(balaclava);
    trackBalaclavaProductDisplayed(balaclava);
  }

  function handleMutations() {
    const supplementList = document.querySelector(
      "sms-supplement-booker .supplement-list",
    );
    if (supplementList) checkBalaclavaDisplayed(supplementList);
  }

  function trackEvents() {
    if (!document.querySelector("body").classList.contains("TS042")) {
      document.querySelector("body").classList.add("TS042");
      document.addEventListener("click", (e) => {
        const qtyButton = e.target.closest(
          '[data-label="qty-plus"], [data-label="qty-minus"]',
        );
        if (qtyButton) {
          const productOption = qtyButton.closest("sms-product-option");
          const isBalaclava = productOption && isBalaclavaOption(productOption);

          if (isBalaclava) {
            if (qtyButton.dataset.label === "qty-plus") {
              // 3. Balaclava Quantity Increased
              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  eventCategory: "Conversio CRO",
                  eventAction: "TS042 | Event Tracking",
                  eventLabel:
                    "TS042 | (Control Original) | Balaclava Quantity Increased",
                  eventSegment: "TS042ECOH",
                },
              });

              // console.log("Balaclava Quantity Increased");
            } else {
              // 4. Balaclava Quantity Decreased
              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  eventCategory: "Conversio CRO",
                  eventAction: "TS042 | Event Tracking",
                  eventLabel:
                    "TS042 | (Control Original) | Balaclava Quantity Decreased",
                  eventSegment: "TS042ECOI",
                },
              });

              // console.log("Balaclava Quantity Decreased");
            }
          }
          return;
        }

        const checkoutButton = e.target.closest(
          '[data-testid="supplement-proceed-to-checkout"]',
        );
        if (checkoutButton) {
          // 5. Proceed to Checkout Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "TS042 | Event Tracking",
              eventLabel:
                "TS042 | (Control Original) | Proceed to Checkout Click",
              eventSegment: "TS042ECOJ",
            },
          });

          // console.log("Proceed to Checkout Click");
          return;
        }

        const continueShoppingButton = e.target.closest(
          '[data-testid="supplement-continue-shopping"]',
        );
        if (continueShoppingButton) {
          // 6. Continue Shopping Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "TS042 | Event Tracking",
              eventLabel:
                "TS042 | (Control Original) | Continue Shopping Click",
              eventSegment: "TS042ECOK",
            },
          });

          // console.log("Continue Shopping Click");
        }
      });
    }
  }

  trackEvents();

  const observer = new MutationObserver(handleMutations);
  observer.observe(document.body, { childList: true, subtree: true });
})();
