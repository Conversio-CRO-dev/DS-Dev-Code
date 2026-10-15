// console.log("David Silva | SY006 variation 1");

(function () {
  const TEST_CLASS = "sy006-v1";
  const STYLE_ID = "sy006-v1-styles";

  // Stops the code running twice if the tool fires it again on SPA navigation
  if (document.getElementById(STYLE_ID)) return;

  // Only cards in the PLP / search results grid. Homepage and other carousels reuse the same card
  const PLP_CARD = "#product-results-list cx-product-grid-item .product-item";

  // A card is "in basket" when the site renders the "X in basket" overlay inside it
  const card = "." + TEST_CLASS + " " + PLP_CARD;
  const notInBasket = card + ":not(:has(.product-item__qty-overlay))";
  const inBasket = card + ":has(.product-item__qty-overlay)";

  const css = [
    card + " cx-add-to-cart,",
    card + " cx-add-to-cart form {",
    "  width: 100% !important;",
    "}",

    // Before ATB: hide the quantity selector, Add goes full width
    notInBasket + " .cx-counter-stock {",
    "  display: none !important;",
    "}",
    notInBasket + " cx-add-to-cart button[type='submit'] {",
    "  flex: 1 1 100%;",
    "  width: 100%;",
    "  max-width: 100%;",
    "  margin-left: 0;",
    "}",

    // After ATB: hide Update, quantity selector goes full width
    inBasket + " cx-add-to-cart button[type='submit'] {",
    "  display: none !important;",
    "}",
    // !important because the site's own fixed widths on the selector otherwise win
    inBasket + " .cx-counter-stock,",
    inBasket + " cx-item-counter {",
    "  display: flex !important;",
    "  flex: 1 1 100% !important;",
    "  width: 100% !important;",
    "  max-width: none !important;",
    "}",
    // Equal thirds for -, the number box and +
    inBasket + " cx-item-counter > * {",
    "  flex: 1 1 0 !important;",
    "  width: auto !important;",
    "  max-width: none !important;",
    "  min-width: 0 !important;",
    "}",
    inBasket + " cx-item-counter .item-control {",
    "  display: flex !important;",
    "  align-items: center;",
    "  justify-content: center;",
    "}",
    inBasket + " cx-item-counter input {",
    "  text-align: center;",
    "}",
  ].join("\n");

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);

  document.body.classList.add(TEST_CLASS);

  // Wait this long after the last +/- click so rapid clicks send one update
  const UPDATE_DELAY = 600;
  const updateTimers = {};

  function clickHiddenUpdate(productCard) {
    // The card may have been removed (e.g. filters changed) while we waited
    if (!document.contains(productCard)) return;

    const updateButton = productCard.querySelector(
      "cx-add-to-cart button[type='submit']",
    );

    // The site disables Update when the quantity already matches the basket
    if (!updateButton || updateButton.disabled) return;

    // Update can still be enabled with an unchanged quantity, so compare with the overlay too
    const overlay = productCard.querySelector(".product-item__qty-overlay");
    const qtyInput = productCard.querySelector("cx-item-counter input");
    if (
      overlay &&
      qtyInput &&
      parseInt(overlay.textContent, 10) === Number(qtyInput.value)
    )
      return;

    updateButton.click();
  }

  // Returns the product card only if that product is already in the basket
  function getBasketCard(element) {
    const productCard = element.closest(PLP_CARD);
    if (
      !productCard ||
      !productCard.querySelector(".product-item__qty-overlay")
    )
      return null;
    return productCard;
  }

  document.addEventListener("click", function (event) {
    const qtyButton = event.target.closest(
      ".item-control-add, .item-control-remove",
    );
    if (!qtyButton) return;

    const productCard = getBasketCard(qtyButton);
    if (!productCard) return;

    const productId = productCard.getAttribute("data-id");
    clearTimeout(updateTimers[productId]);
    updateTimers[productId] = setTimeout(function () {
      clickHiddenUpdate(productCard);
    }, UPDATE_DELAY);
  });

  // An empty box leaves the site's spinner stuck, so treat it as 0 to show the Delete prompt instead
  function emptyToZero(qtyInput) {
    if (qtyInput.value !== "") return;
    qtyInput.value = "0";
    // Angular only reads the new value when it hears an input event
    qtyInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Enter already saves via the site's form, so remember that value to avoid saving it again on blur.
  // Capture phase (true) so this runs before the site submits the form.
  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key !== "Enter") return;
      const qtyInput = event.target.closest("cx-item-counter input");
      if (!qtyInput || !getBasketCard(qtyInput)) return;

      emptyToZero(qtyInput);
      qtyInput.setAttribute("data-sy006-saved", qtyInput.value);
    },
    true,
  );

  document.addEventListener("input", function (event) {
    const qtyInput = event.target.closest("cx-item-counter input");
    if (!qtyInput) return;
    qtyInput.removeAttribute("data-sy006-saved");
  });

  // Save when the customer clicks away from the quantity box.
  // Capture phase (true) so this runs before the site's own blur code puts the old number back.
  document.addEventListener(
    "blur",
    function (event) {
      // blur also fires on the window itself, which has no closest()
      if (!(event.target instanceof Element)) return;
      const qtyInput = event.target.closest("cx-item-counter input");
      if (!qtyInput) return;

      // Focus moving to this card's +/- is handled by the click listener instead
      const counter = qtyInput.closest("cx-item-counter");
      if (event.relatedTarget && counter.contains(event.relatedTarget)) return;

      const productCard = getBasketCard(qtyInput);
      if (!productCard) return;

      emptyToZero(qtyInput);
      if (qtyInput.value === qtyInput.getAttribute("data-sy006-saved")) return;

      clearTimeout(updateTimers[productCard.getAttribute("data-id")]);
      clickHiddenUpdate(productCard);
    },
    true,
  );

  // ---------- Events ----------
  window.dataLayer = window.dataLayer || [];

  // Capture phase (true) so we still hear clicks the site stops from bubbling up
  document.addEventListener(
    "click",
    function (event) {
      // Ignore clicks made by code (our hidden Update click), only count the customer's
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
            event_label: "SY006 | (Variation 1) | Increases quantity",
            event_segment: "SY006EV1H",
          },
        });
        // console.log("SY006 | V1 | Increases quantity");
      } else if (target.closest(".item-control-remove")) {
        // 3. Decreases quantity
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Variation 1) | Decreases quantity",
            event_segment: "SY006EV1I",
          },
        });
        // console.log("SY006 | V1 | Decreases quantity");
      } else if (submitButton) {
        // Enter in the quantity box also "clicks" this button, which is a manual change, not a CTA click
        if (
          document.activeElement &&
          document.activeElement.matches("cx-item-counter input")
        )
          return;

        // Only Add is visible in this variant. Read the label before the site updates it
        const label = submitButton.textContent.trim();
        if (label === "Add") {
          // 1. Add CTA Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "SY006 | Event Tracking",
              event_label: "SY006 | (Variation 1) | Add CTA Click",
              event_segment: "SY006EV1G",
            },
          });
          // console.log("SY006 | V1 | Add CTA Click");
        }
      } else if (target.closest("cx-add-to-wishlist button")) {
        // 6. Favourites product
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Variation 1) | Favourites product",
            event_segment: "SY006EV1L",
          },
        });
        // console.log("SY006 | V1 | Favourites product");
      } else if (target.closest(".product-item__offer-btn--promo-swap")) {
        // 7. Swap & Save Click
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Variation 1) | Swap & Save Click",
            event_segment: "SY006EV1M",
          },
        });
        // console.log("SY006 | V1 | Swap & Save Click");
      } else if (target.closest(".product-item__offer-btn--promo-alt")) {
        // 8. View Similar Items Click
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "SY006 | Event Tracking",
            event_label: "SY006 | (Variation 1) | View Similar Items Click",
            event_segment: "SY006EV1N",
          },
        });
        // console.log("SY006 | V1 | View Similar Items Click");
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
            event_label: "SY006 | (Variation 1) | PLP > PDP click through",
            event_segment: "SY006EV1O",
          },
        });
        // console.log("SY006 | V1 | PLP > PDP click through");
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
        event_label: "SY006 | (Variation 1) | Manually changes quantity",
        event_segment: "SY006EV1K",
      },
    });
    // console.log("SY006 | V1 | Manually changes quantity");
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
