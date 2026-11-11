(function () {
  console.log("David Silva | SY010 control");

  // Stops the code running twice if the tool injects it again
  if (window.sy010control) return;
  window.sy010control = true;

  const MIN_ORDER_VALUE = 150;
  const CART_PATH = "/cart";
  const HEADER_PRICE_SELECTOR = "cx-mini-cart .mini-cart-price";
  // Same keys as v1.js, a visitor only ever sees one version
  const VIEW_TRACKED_STORAGE_KEY = "sy010MovViewTracked";
  const REACHED_TRACKED_STORAGE_KEY = "sy010MovReachedTracked";

  let lastBasketValue = null;
  let lastPathname = null;
  // Last basket value seen on the cart page, so we can tell when it crosses £150 there
  let previousBasketValue = null;

  // Header text can be "£1,163.62" or "0.00" (no £), so keep only digits and the dot
  function getBasketValue() {
    const priceElement = document.querySelector(HEADER_PRICE_SELECTOR);

    if (!priceElement) {
      return null;
    }

    const value = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ""));
    return isNaN(value) ? null : value;
  }

  function isCartPage() {
    return window.location.pathname === CART_PATH;
  }

  // sessionStorage can throw in some private modes, so treat errors as "not set"
  function getSessionFlag(key) {
    try {
      return sessionStorage.getItem(key) === "true";
    } catch (error) {
      return false;
    }
  }

  function setSessionFlag(key) {
    try {
      sessionStorage.setItem(key, "true");
    } catch (error) {}
  }

  // Same rules as v1.js, so both arms are measured the same way
  function trackEvents(basketValue) {
    // Leaving the cart forgets the last value, so arriving back already over £150 doesn't count as crossing
    if (!isCartPage()) {
      previousBasketValue = null;
      return;
    }

    // Header not loaded yet
    if (basketValue === null) {
      return;
    }

    window.dataLayer = window.dataLayer || [];

    // 1. Min Order Prompt View (trigger)
    if (basketValue > 0 && !getSessionFlag(VIEW_TRACKED_STORAGE_KEY)) {
      setSessionFlag(VIEW_TRACKED_STORAGE_KEY);
      // console.log(`SY010 | Control | Event: Min Order Prompt View (trigger) | basket_value: ${basketValue}`);

      window.dataLayer.push({
        event: "conversio_experience",
        conversio: {
          experience_category: "Conversio Experience",
          experience_action: "SY010 | Minimum Order Value Prompt In Basket",
          experience_label: "SY010 | Control Original",
          experience_segment: "SY010.XCO",
        },
      });

      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY010 | Event Tracking",
          event_label:
            "SY010 | (Control Original) | Min Order Prompt View (trigger)",
          event_segment: "SY010ECOQ",
        },
      });
    }

    // Only a move from below £150 to £150+ while on the cart counts
    const hasCrossedMinimum =
      previousBasketValue !== null &&
      previousBasketValue < MIN_ORDER_VALUE &&
      basketValue >= MIN_ORDER_VALUE;

    // 2. Min Order Reached
    if (hasCrossedMinimum && !getSessionFlag(REACHED_TRACKED_STORAGE_KEY)) {
      setSessionFlag(REACHED_TRACKED_STORAGE_KEY);
      // console.log(`SY010 | Control | Event: Min Order Reached | basket_value: ${basketValue}`);

      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY010 | Event Tracking",
          event_label: "SY010 | (Control Original) | Min Order Reached",
          event_segment: "SY010ECOG",
        },
      });
    }

    previousBasketValue = basketValue;
  }

  function handlePageChange() {
    const pathname = window.location.pathname;
    const basketValue = getBasketValue();

    // Only check events when the basket or the page actually changed
    if (basketValue === lastBasketValue && pathname === lastPathname) {
      return;
    }

    lastBasketValue = basketValue;
    lastPathname = pathname;
    trackEvents(basketValue);
  }

  // Watch the whole body because Angular can replace the header elements, not just edit them
  const pageWatcher = new MutationObserver(handlePageChange);
  pageWatcher.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  handlePageChange();
})();
