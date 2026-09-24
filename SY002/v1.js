(function () {
  console.log("David Silva | SY002 variation 1");
  console.log("[RP PROMPT] Script loaded on:", window.location.pathname);

  const RECENT_PURCHASES_API =
    "/occ/v2/brakes/users/current/recent-purchases/products" +
    "?fields=products(code)&pageSize=60&currentPage=0&weeksInPast=21&filterOption=UNIT&lang=en&curr=GBP";

  const RECENT_PURCHASES_CACHE_KEY = "rpPromptRecentCodes";

  const AUTH_STORAGE_KEY = "spartacus\u26BF\u26BFauth";

  function getAuthToken() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      return (parsed.token && parsed.token.access_token) || null;
    } catch (error) {
      return null;
    }
  }

  async function getRecentPurchases() {
    const cached = sessionStorage.getItem(RECENT_PURCHASES_CACHE_KEY);

    if (cached) {
      return JSON.parse(cached);
    }

    const token = getAuthToken();

    if (!token) {
      return [];
    }

    try {
      const response = await fetch(RECENT_PURCHASES_API, {
        credentials: "include",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const codes = (data.products || []).map(function (product) {
        return product.code;
      });

      sessionStorage.setItem(RECENT_PURCHASES_CACHE_KEY, JSON.stringify(codes));
      return codes;
    } catch (error) {
      return [];
    }
  }

  async function isRecentlyPurchased(code) {
    const recentCodes = await getRecentPurchases();
    return recentCodes.includes(code);
  }

  const RECENT_PURCHASES_PAGE_PATH = "/recent-purchased-products";

  function shouldShowPrompt() {
    return !window.location.pathname.includes(RECENT_PURCHASES_PAGE_PATH);
  }

  const RECENT_PURCHASES_PAGE_URL =
    "/my-account/recent-purchased-products?weeksInPast=21&filterOption=UNIT";
  const PROMPT_ID = "rp-prompt";
  const PROMPT_VISIBLE_CLASS = "rp-prompt--visible";
  const PROMPT_STYLE_ID = "rp-prompt-styles";

  const PROMPT_CSS = `
    :root {
      --rp-green: #7c9f1a;
      --rp-green-hover: #6f8e16;
      --rp-accent: #c9d302;
      --rp-border: #f1f1f1;
      --rp-white: #ffffff;
      --rp-text: #333333;
      --rp-text-secondary: #717171;
    }

    .rp-prompt {
      position: fixed;
      z-index: 9999999;
      background: var(--rp-white);
      border-top: 3px solid var(--rp-accent);
      box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
      padding: 20px;
      box-sizing: border-box;

      left: 0;
      right: 0;
      bottom: 0;
      transform: translateY(100%);
      transition: transform 0.3s ease;
    }

    .rp-prompt--visible {
      transform: translateY(0);
    }

    .rp-prompt__header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .rp-prompt__close {
      border: none;
      cursor: pointer;
      position: relative;
      padding: 0;
      top: -7.5px;
      right: -7.5px;
      color: var(--rp-text-secondary);
      background: transparent;
      transition: color 0.3s ease;
    }

    .rp-prompt__close:hover {
      color: var(--rp-text);
    }

    .rp-prompt__copy {
      margin: 0;
      font-size: var(--cx-font-size-base);
      line-height: 1.4;
      color: var(--rp-text);
    }

    .rp-prompt__cta {
      display: inline-block;
      background: var(--rp-green);
      color: var(--rp-white);
      font-family: var(--cx-font-primary-bold);
      font-size: var(--cx-font-size-h4);
      text-decoration: none;
      font-weight: bold;
      padding: 12px 15px;
      border-radius: 4px;
      transition: background 0.3s ease;
    }

    .rp-prompt__cta:hover {
      background: var(--rp-green-hover);
      color: var(--rp-white);
      text-decoration: none;
    }

    @media (min-width: 768px) {
      .rp-prompt {
        left: auto;
        bottom: 24px;
        left: 24px;
        width: 400px;
        border-top: none;
        border: 1px solid var(--rp-border);
        border-left: 3px solid var(--rp-accent);
        border-radius: 6px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

        transform: none;
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 0.3s ease,
          visibility 0.3s ease;
      }

      .rp-prompt--visible {
        opacity: 1;
        visibility: visible;
      }
    }
  `;

  function injectStyles() {
    if (document.getElementById(PROMPT_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = PROMPT_STYLE_ID;
    style.textContent = PROMPT_CSS;
    document.head.appendChild(style);
  }

  function createPromptElement() {
    const existing = document.getElementById(PROMPT_ID);

    if (existing) {
      return existing;
    }

    const prompt = document.createElement("div");
    prompt.id = PROMPT_ID;
    prompt.className = "rp-prompt";

    const header = document.createElement("div");
    header.className = "rp-prompt__header";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "rp-prompt__close icon icon-close";
    closeButton.setAttribute("aria-label", "Close");
    closeButton.addEventListener("click", hidePrompt);

    const closeIcon = document.createElement("span");
    closeIcon.setAttribute("aria-hidden", "true");
    closeButton.appendChild(closeIcon);

    const copy = document.createElement("p");
    copy.className = "rp-prompt__copy";
    copy.textContent =
      "You've recently purchased this. Would you like to see all your recent purchases?";

    header.appendChild(copy);
    header.appendChild(closeButton);

    const cta = document.createElement("a");
    cta.className = "rp-prompt__cta";
    cta.href = RECENT_PURCHASES_PAGE_URL;
    cta.textContent = "View Recent Purchases";

    prompt.appendChild(header);
    prompt.appendChild(cta);

    document.body.appendChild(prompt);

    return prompt;
  }

  function showPrompt() {
    injectStyles();
    const prompt = createPromptElement();
    prompt.classList.add(PROMPT_VISIBLE_CLASS);
  }

  function hidePrompt() {
    const prompt = document.getElementById(PROMPT_ID);

    if (prompt) {
      prompt.classList.remove(PROMPT_VISIBLE_CLASS);
    }
  }

  function isAddToCartRequest(url) {
    return (
      typeof url === "string" &&
      url.includes("/carts/") &&
      url.includes("/entries") &&
      url.includes("code=")
    );
  }

  if (!window.__rpFetchPatched) {
    window.__rpFetchPatched = true;
    console.log("[RP PROMPT] fetch patched, watching for add-to-bag requests");

    const originalFetch = window.fetch;

    window.fetch = async function (input, init) {
      const response = await originalFetch.apply(this, arguments);

      if (isAddToCartRequest(input)) {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();

        if (data.statusCode === "success") {
          const addedCode = data.entry.product.code;
          const recentlyPurchased = await isRecentlyPurchased(addedCode);
          const allowedToShow = shouldShowPrompt();

          console.log(
            "[RP PROMPT] Added:",
            addedCode,
            "| Recently purchased:",
            recentlyPurchased,
            "| Allowed to show:",
            allowedToShow,
          );

          if (recentlyPurchased && allowedToShow) {
            console.log("[RP PROMPT] Showing prompt");
            showPrompt();
          }
        }
      }

      return response;
    };
  }
})();
