(function () {
  console.log("David Silva | SY009 variation 1");

  // Stops the code running twice if the tool injects it again
  if (window.sy009v1) return;
  window.sy009v1 = true;

  const MIN_ORDER_VALUE = 150;
  const HEADER_PRICE_SELECTOR = "cx-mini-cart .mini-cart-price";
  const PROMPT_ID = "sy009-mov";
  const CHAT_HOST_ID = "talkative-engage";
  const CHAT_STYLE_ID = "sy009-chat-style";
  const CHAT_BUTTON_SELECTOR = 'button[title="Open Talkative Widget"]';
  const CLOSED_STORAGE_KEY = "sy009MovClosed";
  const ENTRANCE_STORAGE_KEY = "sy009MovEntrancePlayed";
  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  const ENTERING_CLASS = "sy009-mov--entering";
  const CLOSING_CLASS = "sy009-mov--closing";
  const EXCLUDED_PATHS = ["/cart", "/checkout"];
  const VIEW_TRACKED_STORAGE_KEY = "sy009MovViewTracked";
  const REACHED_TRACKED_STORAGE_KEY = "sy009MovReachedTracked";

  // Mobile only: lift the Live Chat bubble above our bar, falling back to Talkative's own position
  const CHAT_STYLE = `
    @media (max-width: 767px) {
      .fixed:has(${CHAT_BUTTON_SELECTOR}) {
        bottom: var(--sy009-chat-bottom, calc(env(safe-area-inset-bottom) + 32px)) !important;
      }
    }
  `;

  const TICK_ICON = `
    <svg class="sy009-mov__tick" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#7c9f19"></circle>
      <path d="M5.5 10.5l3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2"></path>
    </svg>
  `;

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

  // Talkative lives in an open shadow DOM, so our v1.css can't reach it
  function setUpChat() {
    const chatHost = document.getElementById(CHAT_HOST_ID);

    if (
      !chatHost ||
      !chatHost.shadowRoot ||
      chatHost.shadowRoot.getElementById(CHAT_STYLE_ID)
    ) {
      return;
    }

    const style = document.createElement("style");
    style.id = CHAT_STYLE_ID;
    style.textContent = CHAT_STYLE;
    chatHost.shadowRoot.appendChild(style);
  }

  // CSS variables pass into the shadow DOM, so setting it on body reaches the chat style
  function updateChatOffset() {
    const prompt = document.getElementById(PROMPT_ID);

    if (prompt.hidden) {
      document.body.style.removeProperty("--sy009-chat-bottom");
    } else {
      document.body.style.setProperty(
        "--sy009-chat-bottom",
        `${prompt.offsetHeight + 12}px`,
      );
    }
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

  function isPromptClosed() {
    return getSessionFlag(CLOSED_STORAGE_KEY);
  }

  // Entrance animation only plays the first time the prompt appears in a session
  function playEntrance(prompt) {
    if (getSessionFlag(ENTRANCE_STORAGE_KEY)) {
      return;
    }

    setSessionFlag(ENTRANCE_STORAGE_KEY);
    prompt.classList.add(ENTERING_CLASS);
  }

  function closePrompt() {
    const prompt = document.getElementById(PROMPT_ID);

    // Saved straight away, so a page change during the animation doesn't bring it back
    setSessionFlag(CLOSED_STORAGE_KEY);

    // 2. Min Order Prompt Close Click
    console.log(
      `SY009 | Event: Close Click | basket_value: ${lastBasketValue}`,
    );

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        event_category: "Conversio CRO",
        event_action: "SY009 | Event Tracking",
        event_label: "SY009 | (Variation 1) | Min Order Prompt Close Click",
        event_segment: "SY009EV1G",
      },
    });

    // No animation runs with reduced motion, so animationend would never fire
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
      prompt.hidden = true;
      return;
    }

    prompt.classList.remove(ENTERING_CLASS);
    prompt.classList.add(CLOSING_CLASS);
  }

  // Tidies up after the entrance, and only hides the prompt once the exit animation has finished
  function handleAnimationEnd(event) {
    const prompt = event.currentTarget;

    if (event.target !== prompt) {
      return;
    }

    prompt.classList.remove(ENTERING_CLASS);

    if (prompt.classList.contains(CLOSING_CLASS)) {
      prompt.classList.remove(CLOSING_CLASS);
      prompt.hidden = true;
    }
  }

  function createPrompt() {
    const prompt = document.createElement("div");
    prompt.id = PROMPT_ID;
    prompt.className = "sy009-mov";
    prompt.hidden = true;

    prompt.innerHTML = `
      <button type="button" class="sy009-mov__close" aria-label="Close">&times;</button>
      <p class="sy009-mov__message"></p>
      <div class="sy009-mov__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100">
        <div class="sy009-mov__fill"></div>
      </div>
      <div class="sy009-mov__labels">
        <span class="sy009-mov__in-basket"></span>
        <span>Minimum Order: ${formatPrice(MIN_ORDER_VALUE).replace(".00", "")}</span>
      </div>
    `;

    prompt
      .querySelector(".sy009-mov__close")
      .addEventListener("click", closePrompt);
    prompt.addEventListener("animationend", handleAnimationEnd);

    // Runs whenever the prompt is shown, hidden or its text wraps onto another line
    new ResizeObserver(updateChatOffset).observe(prompt);

    // Added to body (outside Angular's cx-storefront) so the site doesn't remove it on page changes
    document.body.appendChild(prompt);
    return prompt;
  }

  function getMessageHtml(progress) {
    if (progress.isReached) {
      return `${TICK_ICON}<span>You’ve reached the minimum spend</span>`;
    }

    const remaining = `<strong>${formatPrice(progress.remaining)}</strong>`;

    return `
      <span class="sy009-mov__desktop-only">Spend ${remaining} more to reach the minimum order</span>
      <span class="sy009-mov__mobile-only">${remaining} to reach the £${MIN_ORDER_VALUE} minimum</span>
    `;
  }

  function renderPrompt(basketValue) {
    const prompt = document.getElementById(PROMPT_ID) || createPrompt();

    if (
      isExcludedPage() ||
      isPromptClosed() ||
      basketValue === null ||
      basketValue === 0
    ) {
      // console.log(`SY009 | Prompt hidden on ${window.location.pathname}`);
      prompt.classList.remove(ENTERING_CLASS, CLOSING_CLASS);
      prompt.hidden = true;
      return;
    }

    const wasHidden = prompt.hidden;

    const progress = getMinOrderProgress(basketValue);

    // console.log(
    //   `SY009 | Basket ${formatPrice(progress.basketValue)} | ${formatPrice(progress.remaining)} to go` +
    //     ` | ${Math.round(progress.percent)}% | reached: ${progress.isReached} | page: ${window.location.pathname}`
    // );

    prompt.querySelector(".sy009-mov__message").innerHTML =
      getMessageHtml(progress);
    prompt.querySelector(".sy009-mov__fill").style.width =
      `${progress.percent}%`;
    prompt
      .querySelector(".sy009-mov__bar")
      .setAttribute("aria-valuenow", Math.round(progress.percent));
    prompt.querySelector(".sy009-mov__in-basket").textContent =
      `${formatPrice(progress.basketValue)} in basket`;
    prompt.hidden = false;

    if (wasHidden) {
      playEntrance(prompt);
    }
  }

  // Depends only on the basket and the page (not on the prompt), so control.js can reuse it
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

      window.dataLayer.push({
        event: "conversio_experience",
        conversio: {
          experience_category: "Conversio Experience",
          experience_action: "SY009 | Minimum Order Value Prompt (Sitewide)",
          experience_label: "SY009 | Variation 1",
          experience_segment: "SY009.XV1",
        },
      });

      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY009 | Event Tracking",
          event_label:
            "SY009 | (Variation 1) | Min Order Prompt View (trigger)",
          event_segment: "SY009EV1Q",
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
          event_label: "SY009 | (Variation 1) | Min Order Reached",
          event_segment: "SY009EV1H",
        },
      });
    }

    previousBasketValue = basketValue;
  }

  function handlePageChange() {
    setUpChat();

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
    renderPrompt(basketValue);
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
