(function () {
  console.log("David Silva | SY010 variation 1");

  // Stops the code running twice if the tool injects it again
  if (window.sy010v1) return;
  window.sy010v1 = true;

  const MIN_ORDER_VALUE = 150;
  const CART_PATH = "/cart";
  const HEADER_PRICE_SELECTOR = "cx-mini-cart .mini-cart-price";
  // Switch Baskets + New basket block in the cart's right column
  const SAVED_CART_SELECTOR =
    "cx-page-slot.CenterRightContentSlot brakes-saved-cart";
  const DESKTOP_QUERY = window.matchMedia("(min-width: 768px)");
  const VIEW_TRACKED_STORAGE_KEY = "sy010MovViewTracked";
  const REACHED_TRACKED_STORAGE_KEY = "sy010MovReachedTracked";

  const TICK_ICON = `
    <svg class="sy010-mov__tick" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#7c9f19"></circle>
      <path d="M5.5 10.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2"></path>
    </svg>
  `;

  let lastBasketValue = null;
  let lastPathname = null;
  // Last basket value seen on the cart page, so we can tell when it crosses £150 there
  let previousBasketValue = null;
  const prompt = createPrompt();

  // Header text can be "£1,163.62" or "0.00" (no £), so keep only digits and the dot
  function getBasketValue() {
    const priceElement = document.querySelector(HEADER_PRICE_SELECTOR);

    if (!priceElement) {
      return null;
    }

    const value = parseFloat(priceElement.textContent.replace(/[^0-9.]/g, ""));
    return isNaN(value) ? null : value;
  }

  function getMinOrderProgress(basketValue) {
    return {
      basketValue: basketValue,
      remaining: Math.max(MIN_ORDER_VALUE - basketValue, 0),
      percent: Math.min((basketValue / MIN_ORDER_VALUE) * 100, 100),
      isReached: basketValue >= MIN_ORDER_VALUE,
    };
  }

  function formatPrice(value) {
    return value.toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    });
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

  // pb-6 and px-md-6 are the site's own spacing classes, so we match the Switch Baskets / New basket gaps
  function createPrompt() {
    const element = document.createElement("div");
    element.className = "sy010-mov pb-6 px-md-6";
    element.hidden = true;

    element.innerHTML = `
      <p class="sy010-mov__message" aria-live="polite"></p>
      <div class="sy010-mov__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div class="sy010-mov__fill"></div>
      </div>
    `;

    return element;
  }

  // Desktop: below New basket. Mobile: above Switch Baskets (the right column sits under the search there)
  function placePrompt() {
    const savedCart = document.querySelector(SAVED_CART_SELECTOR);

    if (!savedCart) {
      return;
    }

    // Only move it when it's in the wrong place, otherwise our own move would trigger the watcher forever
    if (DESKTOP_QUERY.matches) {
      if (savedCart.nextElementSibling !== prompt) {
        savedCart.after(prompt);
      }
    } else if (savedCart.previousElementSibling !== prompt) {
      savedCart.before(prompt);
    }
  }

  function getMessageHtml(progress) {
    if (progress.isReached) {
      return `${TICK_ICON}<strong>You’ve reached the minimum spend</strong>`;
    }

    return `<span><strong>${formatPrice(progress.remaining)}</strong> to reach the minimum order</span>`;
  }

  function renderPrompt(basketValue) {
    if (!isCartPage() || basketValue === null || basketValue === 0) {
      // console.log(`SY010 | Prompt hidden (page: ${window.location.pathname}, basket: ${basketValue})`);
      prompt.hidden = true;
      return;
    }

    const progress = getMinOrderProgress(basketValue);

    // console.log(`SY010 | Basket ${formatPrice(progress.basketValue)} | ${formatPrice(progress.remaining)} to go` + ` | ${Math.round(progress.percent)}% | reached: ${progress.isReached}`);

    prompt.querySelector(".sy010-mov__message").innerHTML =
      getMessageHtml(progress);
    prompt.querySelector(".sy010-mov__fill").style.width =
      `${progress.percent}%`;
    prompt
      .querySelector(".sy010-mov__bar")
      .setAttribute("aria-valuenow", Math.round(progress.percent));
    prompt.hidden = false;
  }

  // Depends only on the basket and the page (not on the prompt), so control.js can reuse it
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
      // console.log(`SY010 | Event: Min Order Prompt View (trigger) | basket_value: ${basketValue}`);

      window.dataLayer.push({
        event: "conversio_experience",
        conversio: {
          experience_category: "Conversio Experience",
          experience_action: "SY010 | Minimum Order Value Prompt In Basket",
          experience_label: "SY010 | Variation 1",
          experience_segment: "SY010.XV1",
        },
      });

      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY010 | Event Tracking",
          event_label:
            "SY010 | (Variation 1) | Min Order Prompt View (trigger)",
          event_segment: "SY010EV1Q",
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
      // console.log(`SY010 | Event: Min Order Reached | basket_value: ${basketValue}`);

      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY010 | Event Tracking",
          event_label: "SY010 | (Variation 1) | Min Order Reached",
          event_segment: "SY010EV1G",
        },
      });
    }

    previousBasketValue = basketValue;
  }

  function handlePageChange() {
    // Runs on every change, so the prompt goes back in if Angular redraws the right column
    if (isCartPage()) {
      placePrompt();
    }

    const pathname = window.location.pathname;
    const basketValue = getBasketValue();

    // Only update the text when the basket or the page actually changed
    if (basketValue === lastBasketValue && pathname === lastPathname) {
      return;
    }

    lastBasketValue = basketValue;
    lastPathname = pathname;
    trackEvents(basketValue);
    renderPrompt(basketValue);
  }

  // Watch the whole body because Angular can replace the header elements, not just edit them
  const pageWatcher = new MutationObserver(handlePageChange);
  pageWatcher.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Resizing across the breakpoint doesn't change the page, so the watcher wouldn't catch it
  DESKTOP_QUERY.addEventListener("change", placePrompt);

  handlePageChange();
})();
