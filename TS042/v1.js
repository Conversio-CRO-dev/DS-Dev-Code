// console.log("David Silva | TS042 variation 1");

(function () {
  "use strict";

  const TARGET_MATCH = /balaclava/i;
  const REQUIRED_LABEL_CLASS = "ts042-required-to-race";
  const REQUIRED_COPY_CLASS = "ts042-required-copy";
  const REQUIRED_COPY_TEXT =
    "Required to race. If you've already got one, you can bring it with you to use again.";
  const STYLE_ID = "ts042-styles";

  window.dataLayer = window.dataLayer || [];

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ts042-required-to-race {
        display: block;
        font-weight: 700;
        line-height: 100%;
				margin-bottom: 18px;
				margin-top: 32px;
        text-transform: uppercase;
      }
      .ts042-required-to-race + .product {
        margin-top: 0;
      }
      .ts042-required-to-race + .product .option-thumb {
        display: flex;
        flex-direction: column;
        align-items: start;
        height: 100%;
      }
      .ts042-required-copy {
        display: block;
        margin: 0;
        font-size: 1.115rem;
        color: #2f2f2f;
      }
      .supplement-list-header {
		    display: flex;
		    align-items: end;
        padding-left: 0;
        border-top: 1px solid #c2c2c2;
      }
      .supplement-list-header ion-label {
		    font-weight: 700;
				font-size: 1.5rem;
				letter-spacing: 0;
		    text-transform: uppercase;
      }
      sms-product-option[data-ts042-tracked="true"] {
        margin-bottom: 1rem;
      }
    `;
    document.head.appendChild(style);
  }

  function findBalaclavaOption(supplementList) {
    const options = supplementList.querySelectorAll("sms-product-option");
    for (let i = 0; i < options.length; i++) {
      const thumb = options[i].querySelector(".product img[alt]");
      if (thumb && TARGET_MATCH.test(thumb.getAttribute("alt") || "")) {
        return options[i];
      }
    }
    return null;
  }

  function addRequiredToRaceLabel(balaclava) {
    // Already added: bail out before touching the DOM to avoid
    // re-triggering the observer on every mutation batch.
    if (balaclava.querySelector("." + REQUIRED_LABEL_CLASS)) return;

    const label = document.createElement("ion-label");
    label.className =
      REQUIRED_LABEL_CLASS + " sc-ion-label-md-h sc-ion-label-md-s md hydrated";
    label.textContent = "Required to Race";
    balaclava.insertBefore(label, balaclava.firstElementChild);
    // console.log('"Required to Race" header added above Cotton Balaclava');
  }

  function addRequiredToRaceCopy(balaclava) {
    const optionName = balaclava.querySelector(
      ".option-description-row .option-name",
    );
    if (!optionName) return;

    // Already added: bail out before touching the DOM to avoid
    // re-triggering the observer on every mutation batch.
    if (optionName.parentElement.querySelector("." + REQUIRED_COPY_CLASS))
      return;

    const copy = document.createElement("p");
    copy.className = REQUIRED_COPY_CLASS;
    copy.textContent = REQUIRED_COPY_TEXT;
    optionName.insertAdjacentElement("afterend", copy);
    // console.log('"Required to race" copy added beneath Cotton Balaclava title');
  }

  function trackPostAtbModalDisplayed(balaclava) {
    // Already tracked: bail out so this fires once per modal appearance,
    // independent of the reposition guard below.
    if (balaclava.dataset.ts042Tracked) return;

    balaclava.dataset.ts042Tracked = "true";
    // 1. Post ATB Modal Displayed (trigger)
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "TS042 | Event Tracking",
        eventLabel:
          "TS042 | (Variation 1) | Post ATB Modal Displayed (trigger)",
        eventSegment: "TS042EV1Q",
      },
    });

    // console.log("Post ATB Modal Displayed (trigger)");
  }

  function trackBalaclavaProductDisplayed(balaclava) {
    // Already tracked: bail out so this fires once per modal appearance,
    // independent of the other tracking/reposition guards.
    if (balaclava.dataset.ts042DisplayTracked) return;

    balaclava.dataset.ts042DisplayTracked = "true";
    // 2. Balaclava Product Displayed
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "TS042 | Event Tracking",
        eventLabel: "TS042 | (Variation 1) | Balaclava Product Displayed",
        eventSegment: "TS042EV1G",
      },
    });
    // console.log("Balaclava Product Displayed");
  }

  function moveBalaclavaToTop(supplementList) {
    const balaclava = findBalaclavaOption(supplementList);
    if (!balaclava) return;

    trackPostAtbModalDisplayed(balaclava);
    trackBalaclavaProductDisplayed(balaclava);

    const header = supplementList.querySelector("ion-list-header");
    if (!header) return;

    // Already in place: bail out before touching the DOM to avoid
    // re-triggering the observer on every mutation batch.
    if (supplementList.firstElementChild !== balaclava) {
      supplementList.insertBefore(balaclava, supplementList.firstElementChild);
      // console.log('Cotton Balaclava found, moved to top of related products list');
    }

    if (balaclava.nextElementSibling !== header) {
      balaclava.insertAdjacentElement("afterend", header);
      // console.log('"Related products" header moved below Cotton Balaclava');
    }

    addRequiredToRaceLabel(balaclava);
    addRequiredToRaceCopy(balaclava);
  }

  function handleMutations() {
    const supplementList = document.querySelector(
      "sms-supplement-booker .supplement-list",
    );
    if (supplementList) moveBalaclavaToTop(supplementList);
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
          const isBalaclava =
            productOption &&
            productOption.querySelector("." + REQUIRED_LABEL_CLASS);

          if (isBalaclava) {
            if (qtyButton.dataset.label === "qty-plus") {
              // 3. Balaclava Quantity Increased
              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  eventCategory: "Conversio CRO",
                  eventAction: "TS042 | Event Tracking",
                  eventLabel:
                    "TS042 | (Variation 1) | Balaclava Quantity Increased",
                  eventSegment: "TS042EV1H",
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
                    "TS042 | (Variation 1) | Balaclava Quantity Decreased",
                  eventSegment: "TS042EV1I",
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
              eventLabel: "TS042 | (Variation 1) | Proceed to Checkout Click",
              eventSegment: "TS042EV1J",
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
              eventLabel: "TS042 | (Variation 1) | Continue Shopping Click",
              eventSegment: "TS042EV1K",
            },
          });
          // console.log("Continue Shopping Click");
        }
      });
    }
  }

  injectStyles();
  trackEvents();

  const observer = new MutationObserver(handleMutations);
  observer.observe(document.body, { childList: true, subtree: true });
})();
