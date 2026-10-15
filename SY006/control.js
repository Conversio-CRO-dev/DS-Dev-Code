// console.log("David Silva | SY006 control");

(function () {
  // Only cards in the PLP / search results grid. Homepage and other carousels reuse the same card
  const PLP_CARD = "#product-results-list cx-product-grid-item .product-item";

  window.dataLayer = window.dataLayer || [];

  // Stops the code running twice if the tool fires it again on SPA navigation
  if (window.sy006ControlReady) return;
  window.sy006ControlReady = true;

  // Capture phase (true) so we still hear clicks the site stops from bubbling up
  document.addEventListener(
    "click",
    function (event) {
      // Ignore clicks made by code, only count the customer's
      if (!event.isTrusted) return;

      const target = event.target;
      if (!(target instanceof Element) || !target.closest(PLP_CARD)) return;

      const submitButton = target.closest(
        "cx-add-to-cart button[type='submit']",
      );

      if (target.closest(".item-control-add")) {
        // 2. Increases quantity
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Control Original) | Increases quantity",
            event_segment: "SY006ECOH",
          },
        });
        // console.log("SY006 | Control | Increases quantity");
      } else if (target.closest(".item-control-remove")) {
        // 3. Decreases quantity
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Control Original) | Decreases quantity",
            event_segment: "SY006ECOI",
          },
        });
        // console.log("SY006 | Control | Decreases quantity");
      } else if (submitButton) {
        // Enter in the quantity box also "clicks" this button, which is a manual change, not a CTA click
        if (
          document.activeElement &&
          document.activeElement.matches("cx-item-counter input")
        )
          return;

        // Same button for both, only the label changes. Read before the site updates it
        const label = submitButton.textContent.trim();
        if (label === "Add") {
          // 1. Add CTA Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "SY006 | Event Tracking",
              event_label: "SY006 | (Control Original) | Add CTA Click",
              event_segment: "SY006ECOG",
            },
          });
          // console.log("SY006 | Control | Add CTA Click");
        }
        if (label === "Update") {
          // 4. Update CTA Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "SY006 | Event Tracking",
              event_label: "SY006 | (Control Original) | Update CTA Click",
              event_segment: "SY006ECOJ",
            },
          });
          // console.log("SY006 | Control | Update CTA Click");
        }
      } else if (target.closest("cx-add-to-wishlist button")) {
        // 6. Favourites product
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Control Original) | Favourites product",
            event_segment: "SY006ECOL",
          },
        });
        // console.log("SY006 | Control | Favourites product");
      } else if (target.closest(".product-item__offer-btn--promo-swap")) {
        // 7. Swap & Save Click
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Control Original) | Swap & Save Click",
            event_segment: "SY006ECOM",
          },
        });
        // console.log("SY006 | Control | Swap & Save Click");
      } else if (target.closest(".product-item__offer-btn--promo-alt")) {
        // 8. View Similar Items Click
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label:
              "SY006 | (Control Original) | View Similar Items Click",
            event_segment: "SY006ECON",
          },
        });
        // console.log("SY006 | Control | View Similar Items Click");
      } else if (
        target.closest(
          "a.cx-product-image-container, a.product-item__code, a.product-item__name",
        )
      ) {
        // 9. PLP > PDP click through
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Control Original) | PLP > PDP click through",
            event_segment: "SY006ECOO",
          },
        });
        // console.log("SY006 | Control | PLP > PDP click through");
      }
    },
    true,
  );

  function getQtyInput(event) {
    const target = event.target;
    if (
      !(target instanceof Element) ||
      !target.matches("cx-item-counter input")
    )
      return null;
    if (!target.closest(PLP_CARD)) return null;
    return target;
  }

  // Remembers the last tracked value so Enter followed by a click away only counts once
  function trackManualChange(qtyInput) {
    if (qtyInput.value === qtyInput.getAttribute("data-sy006-tracked")) return;
    qtyInput.setAttribute("data-sy006-tracked", qtyInput.value);
    // 5. Manually changes quantity
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        event_category: "Conversio CRO",
        event_action: "SY006 | Event Tracking",
        event_label: "SY006 | (Control Original) | Manually changes quantity",
        event_segment: "SY006ECOK",
      },
    });
    // console.log("SY006 | Control | Manually changes quantity");
  }

  // Starting value when the customer enters the box, so an unchanged Enter doesn't count
  document.addEventListener(
    "focusin",
    function (event) {
      const qtyInput = getQtyInput(event);
      if (qtyInput) qtyInput.setAttribute("data-sy006-tracked", qtyInput.value);
    },
    true,
  );

  // The browser doesn't fire "change" on Enter in this box, so listen for Enter too
  document.addEventListener(
    "keydown",
    function (event) {
      const qtyInput = getQtyInput(event);
      if (qtyInput && event.key === "Enter") trackManualChange(qtyInput);
    },
    true,
  );

  // "change" fires when the customer clicks away after typing
  document.addEventListener(
    "change",
    function (event) {
      const qtyInput = getQtyInput(event);
      if (qtyInput) trackManualChange(qtyInput);
    },
    true,
  );
})();
