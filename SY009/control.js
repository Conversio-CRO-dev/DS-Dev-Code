(function () {
  console.log("David Silva | SY009 control");

  const MIN_ORDER_VALUE = 150;
  const HEADER_PRICE_SELECTOR = "cx-mini-cart .mini-cart-price";
  const EXCLUDED_PATHS = ["/cart", "/checkout"];
  // Same keys as v1.js, a visitor only ever sees one version
  const VIEW_TRACKED_STORAGE_KEY = "sy009MovViewTracked";
  const REACHED_TRACKED_STORAGE_KEY = "sy009MovReachedTracked";

  let lastBasketValue = null;
  let lastPathname = null;
  // Unlike lastBasketValue, never set back to null on checkout, so we can tell when the basket crosses £150
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

  // Matches /cart and /checkout plus anything under them, e.g. /checkout/step-one
  function isExcludedPage() {
    const pathname = window.location.pathname;

    return EXCLUDED_PATHS.some(function (path) {
      return pathname === path || pathname.startsWith(`${path}/`);
    });
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

  // Same logic as v1.js, so both versions fire at the same moment
  function trackEvents(basketValue) {
    // Checkout has no mini cart, so there's nothing to track there
    if (basketValue === null) {
      return;
    }

    window.dataLayer = window.dataLayer || [];

    // 1. Min Order Prompt View
    if (
      basketValue > 0 &&
      !isExcludedPage() &&
      !getSessionFlag(VIEW_TRACKED_STORAGE_KEY)
    ) {
      setSessionFlag(VIEW_TRACKED_STORAGE_KEY);
      console.log(
        `SY009 | Event: Min Order Prompt View | basket_value: ${basketValue}`,
      );

      // Experience: the visitor counts as in the test from the moment the prompt shows (or would show, in control)
      window.dataLayer.push({
        event: "conversio_experience",
        conversio: {
          experience_category: "Conversio Experience",
          experience_action: "SY009 | Minimum Order Value Prompt (Sitewide)",
          experience_label: "SY009 | Control Original",
          experience_segment: "SY009.XCO",
        },
      });

      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY009 | Event Tracking",
          event_label:
            "SY009 | (Control Original) | Min Order Prompt View (trigger)",
          event_segment: "SY009ECOQ",
        },
      });
    }

    // Only a move from below £150 to £150+ counts, not a basket that was already over £150 on arrival
    const hasCrossedMinimum =
      previousBasketValue !== null &&
      previousBasketValue < MIN_ORDER_VALUE &&
      basketValue >= MIN_ORDER_VALUE;

    // 3. Min Order Reached (cart page included)
    if (hasCrossedMinimum && !getSessionFlag(REACHED_TRACKED_STORAGE_KEY)) {
      setSessionFlag(REACHED_TRACKED_STORAGE_KEY);
      console.log(
        `SY009 | Event: Min Order Reached | basket_value: ${basketValue}`,
      );

      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY009 | Event Tracking",
          event_label: "SY009 | (Control Original) | Min Order Reached",
          event_segment: "SY009ECOH",
        },
      });
    }

    previousBasketValue = basketValue;
  }

  function handlePageChange() {
    const pathname = window.location.pathname;
    const basketValue = getBasketValue();

    // Header not rendered yet, so wait. Checkout has no mini cart at all, so it can't wait
    if (basketValue === null && !isExcludedPage()) {
      return;
    }

    // Only update when the basket or the page actually changed
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
