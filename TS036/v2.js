// console.log("David Silva | TS036 variation 2");

function findRookieRaceExperienceLive() {
  const TARGET = "rookie race experience | starter track";
  let lastSnapshot = "";
  let stableCount = 0;
  let intervalId = null;
  const observedRoots = new WeakSet();

  function extractMatch(str) {
    if (typeof str !== "string") return null;
    const idx = str.toLowerCase().indexOf(TARGET);
    return idx === -1 ? null : str.substring(idx, idx + TARGET.length);
  }

  function getDirectTextMatch(el) {
    for (const child of el.childNodes) {
      if (child.nodeType !== Node.TEXT_NODE) continue;
      const hit = extractMatch(child.textContent);
      if (hit) return hit;
    }
    return null;
  }

  function scanRoot(root, hits) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const nodes = root instanceof Element ? [root] : [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);

    for (const el of nodes) {
      const match = getDirectTextMatch(el);
      if (match) hits.push({ tag: el.tagName.toLowerCase(), display: match });

      if (el.shadowRoot && !observedRoots.has(el.shadowRoot)) {
        observeRoot(el.shadowRoot);
        scanRoot(el.shadowRoot, hits);
      }
    }
  }

  function runSearch(reason) {
    const hits = [];
    scanRoot(document.body, hits);

    const snapshot = JSON.stringify(hits.map((h) => h.tag + h.display));
    if (snapshot === lastSnapshot) return;
    lastSnapshot = snapshot;

    // console.group(`"Rookie Race Experience" — results updated (${reason})`);
    if (!hits.length) {
      // console.log("No elements found yet.");
    } else {
      hits.forEach((h, i) => {
        // console.log(`${i + 1}: ${h.tag}  —  content: "${h.display}"`);
      });
    }
    console.groupEnd();
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function observeRoot(root) {
    if (observedRoots.has(root)) return;
    observedRoots.add(root);
    const mo = new MutationObserver(debounce(() => runSearch("mutation"), 250));
    mo.observe(root, { childList: true, subtree: true, characterData: true });
  }

  function startInterval() {
    stableCount = 0;
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      const before = lastSnapshot;
      runSearch("interval");
      if (lastSnapshot === before) stableCount++;
      if (stableCount >= 6) {
        // 30s of no new content → pause
        clearInterval(intervalId);
        intervalId = null;
        // console.log('"Rookie Race Experience" watcher: page stable, interval paused.');
      }
    }, 5000);
  }

  // Reset and restart whenever the page navigates
  function onNavigate(reason) {
    lastSnapshot = ""; // force re-log on next scan
    runSearch(reason);
    startInterval(); // restart the 30s stability window
  }

  // Intercept SPA history methods
  const _push = history.pushState.bind(history);
  const _replace = history.replaceState.bind(history);
  history.pushState = function (...args) {
    _push(...args);
    onNavigate("pushState");
  };
  history.replaceState = function (...args) {
    _replace(...args);
    onNavigate("replaceState");
  };
  window.addEventListener("popstate", () => onNavigate("popstate"));
  window.addEventListener("hashchange", () => onNavigate("hashchange"));

  // Initial boot
  runSearch("initial");
  observeRoot(document.body);
  startInterval();

  return {
    stop() {
      clearInterval(intervalId);
      history.pushState = _push;
      history.replaceState = _replace;
      window.removeEventListener("popstate", () => onNavigate("popstate"));
      window.removeEventListener("hashchange", () => onNavigate("hashchange"));
      // console.log('"Rookie Race Experience" watcher stopped.');
    },
  };
}

// ---------------------------------------------------------------------------

function keepElementUpdated(selector, newText, onSuccess) {
  let currentEl = null;
  let elObserver = null;
  let applying = false;

  function debounce(fn, ms) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  // Write the new text; guard against re-entrant calls triggered by our own change
  function writeText(el) {
    if (applying) return;
    applying = true;
    el.textContent = newText;
    applying = false;
    // console.log(`1: ${el.tagName.toLowerCase()}  —  updated content: "${newText}");
    if (typeof onSuccess === "function") onSuccess(el);
  }

  // Watch the specific element so we catch React overwriting it immediately (no debounce)
  function attachElObserver(el) {
    if (elObserver) elObserver.disconnect();
    elObserver = new MutationObserver(() => {
      if (!applying && el.textContent !== newText) writeText(el);
    });
    elObserver.observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  // Try to find the element; if found, apply and attach a dedicated observer
  function tryApply() {
    const el = document.querySelector(selector);
    if (!el) {
      // console.log("keepElementUpdated: element not in DOM yet — waiting…");
      return;
    }
    // New element reference (first find or after React unmount/remount)
    if (el !== currentEl) {
      currentEl = el;
      attachElObserver(el);
    }
    if (el.textContent !== newText) writeText(el);
  }

  // Body observer: detects when the element appears or React remounts it
  const bodyObserver = new MutationObserver(debounce(tryApply, 100));
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  const _push = history.pushState.bind(history);
  const _replace = history.replaceState.bind(history);
  history.pushState = function (...args) {
    _push(...args);
    tryApply();
  };
  history.replaceState = function (...args) {
    _replace(...args);
    tryApply();
  };
  window.addEventListener("popstate", tryApply);
  window.addEventListener("hashchange", tryApply);

  tryApply();

  return {
    stop() {
      bodyObserver.disconnect();
      if (elObserver) elObserver.disconnect();
      history.pushState = _push;
      history.replaceState = _replace;
      window.removeEventListener("popstate", tryApply);
      window.removeEventListener("hashchange", tryApply);
      // console.log("keepElementUpdated: stopped.");
    },
  };
}

// ---------------------------------------------------------------------------

function keepImageUpdated(selector, newSrc, onSuccess) {
  let currentEl = null;
  let elObserver = null;
  let applying = false;
  let activated = false; // only applies after keepElementUpdated signals success

  function debounce(fn, ms) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function writeAttr(el) {
    if (applying) return;
    applying = true;
    el.setAttribute("src", newSrc);
    applying = false;
    // console.log(`1: ${el.tagName.toLowerCase()}  —  image updated successfully: "${newSrc}"`);
    if (typeof onSuccess === "function") onSuccess(el);
  }

  function attachElObserver(el) {
    if (elObserver) elObserver.disconnect();
    elObserver = new MutationObserver(() => {
      if (!applying && el.getAttribute("src") !== newSrc) writeAttr(el);
    });
    elObserver.observe(el, { attributes: true, attributeFilter: ["src"] });
  }

  function tryApply() {
    if (!activated) return; // wait until keepElementUpdated signals success
    const el = document.querySelector(selector);
    if (!el) {
      // console.log("keepImageUpdated: element not in DOM yet — waiting…");
      return;
    }
    if (el !== currentEl) {
      currentEl = el;
      attachElObserver(el);
    }
    if (el.getAttribute("src") !== newSrc) writeAttr(el);
  }

  function resetState() {
    activated = false;
    currentEl = null;
  }

  const bodyObserver = new MutationObserver(debounce(tryApply, 100));
  bodyObserver.observe(document.body, { childList: true, subtree: true });

  const _push = history.pushState.bind(history);
  const _replace = history.replaceState.bind(history);
  history.pushState = function (...args) {
    _push(...args);
    resetState();
  };
  history.replaceState = function (...args) {
    _replace(...args);
    resetState();
  };
  window.addEventListener("popstate", resetState);
  window.addEventListener("hashchange", resetState);

  // No auto-start — waits for apply() to be called by keepElementUpdated's onSuccess

  return {
    apply() {
      activated = true;
      tryApply();
    },
    stop() {
      bodyObserver.disconnect();
      if (elObserver) elObserver.disconnect();
      history.pushState = _push;
      history.replaceState = _replace;
      window.removeEventListener("popstate", resetState);
      window.removeEventListener("hashchange", resetState);
      // console.log("keepImageUpdated: stopped.");
    },
  };
}

// ---------------------------------------------------------------------------
// Handles all product text + image renames on the team-sport.co.uk search results page.
// Uses querySelectorAll + text-content matching so multiple products coexist without
// conflict — keepElementUpdated uses querySelector (first match only), which breaks when
// two products share the same h3 CSS classes and both appear on the page simultaneously.
function keepSearchResultProductsUpdated(onSuccess) {
  const H3_SELECTOR =
    "li h3.text-3xl.md\\:text-4xl.font-display.pb-3.lg\\:flex-1.lg\\:pb-0";
  const IMG_SELECTOR =
    "img.block.mx-auto.w-full.object-cover.object-center.lg\\:top-4.lg\\:left-4.lg\\:right-4";
  const NEW_IMG_SRC =
    "https://images.prismic.io/teamsport/Zwzfr4F3NbkBXY0g_TeamsportE-KartingGermany-19th%2620thAugust2022-294.png";
  const PRODUCTS = [
    {
      match: "rookie race experience | starter track",
      newText: "Kids and Family Fun Experience",
    },
    {
      match: "rookie racer 342 | starter track",
      newText: "Kids and Family Fun 342",
    },
  ];
  let applying = false;

  function debounce(fn, ms) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function tryApply() {
    if (applying) return;
    applying = true;
    let changed = false;
    const h3s = document.querySelectorAll(H3_SELECTOR);
    for (const h3 of h3s) {
      const text = h3.textContent.trim().toLowerCase();
      for (const { match, newText } of PRODUCTS) {
        if (!text.includes(match)) continue;
        if (h3.textContent.trim() !== newText) {
          h3.textContent = newText;
          changed = true;
        }
        const li = h3.closest("li");
        if (li) {
          const img = li.querySelector(IMG_SELECTOR);
          if (img && img.getAttribute("src") !== NEW_IMG_SRC) {
            img.setAttribute("src", NEW_IMG_SRC);
            changed = true;
          }
        }
        break;
      }
    }
    applying = false;
    if (changed && typeof onSuccess === "function") onSuccess();
  }

  const mo = new MutationObserver(debounce(tryApply, 100));
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  const _push = history.pushState.bind(history);
  const _replace = history.replaceState.bind(history);
  history.pushState = function (...args) {
    _push(...args);
    tryApply();
  };
  history.replaceState = function (...args) {
    _replace(...args);
    tryApply();
  };
  window.addEventListener("popstate", tryApply);
  window.addEventListener("hashchange", tryApply);

  tryApply();

  return {
    stop() {
      mo.disconnect();
      history.pushState = _push;
      history.replaceState = _replace;
      window.removeEventListener("popstate", tryApply);
      window.removeEventListener("hashchange", tryApply);
    },
  };
}

// ---------------------------------------------------------------------------

function keepBookingPageUpdated() {
  const TARGET_NAME = "rookie race experience | starter track";
  const NEW_TEXT_NAME = "Kids and Family Fun Experience";
  const NEW_SRC =
    "https://images.prismic.io/teamsport/Zwzfr4F3NbkBXY0g_TeamsportE-KartingGermany-19th%2620thAugust2022-294.png";
  const TARGET_BLOCK = "rookie racer experience";
  const NEW_TEXT_BLOCK = "Kids and Family Fun Experience";
  const TARGET_NAME_342 = "rookie racer 342 | starter track";
  const TARGET_NAME_342_CART = "rookie race 342 | starter track";
  const NEW_TEXT_NAME_342 = "Kids and Family Fun 342";
  const TARGET_BLOCK_342 = "rookie racer 342";
  const NEW_TEXT_BLOCK_342 = "Kids and Family Fun 342";
  let applying = false;

  const observedRoots = new WeakSet();
  const shadowObservers = [];

  function debounce(fn, ms) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function observeRoot(root) {
    if (observedRoots.has(root)) return;
    observedRoots.add(root);
    const shadowMo = new MutationObserver(debounce(tryApply, 150));
    shadowMo.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    shadowObservers.push(shadowMo);
  }

  // Recursively collect elements matching selector through all shadow roots
  function collectEls(root, selector, results) {
    root.querySelectorAll(selector).forEach((el) => results.push(el));
    root.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) {
        observeRoot(el.shadowRoot);
        collectEls(el.shadowRoot, selector, results);
      }
    });
  }

  function tryApply() {
    if (applying) return;
    applying = true;

    // Full replacement on .product-name (h2 or h3) — only one element per product matches
    const nameEls = [];
    collectEls(document.body, ".product-name", nameEls);
    for (const el of nameEls) {
      if (!el.textContent.trim().toLowerCase().includes(TARGET_NAME)) continue;
      if (el.textContent.trim() !== NEW_TEXT_NAME) {
        el.textContent = NEW_TEXT_NAME;
        // console.log(`1: ${el.tagName.toLowerCase()}  —  updated content: "${NEW_TEXT_NAME}"`);
      }
      break;
    }
    for (const el of nameEls) {
      if (!el.textContent.trim().toLowerCase().includes(TARGET_NAME_342))
        continue;
      if (el.textContent.trim() !== NEW_TEXT_NAME_342) {
        el.textContent = NEW_TEXT_NAME_342;
      }
      break;
    }

    // Partial replacement on div.blocks — preserves the time suffix (e.g. "- 09:30")
    const blockEls = [];
    collectEls(document.body, "div.blocks", blockEls);
    for (const el of blockEls) {
      if (!el.textContent.toLowerCase().includes(TARGET_BLOCK)) continue;
      const updated = el.textContent.replace(
        /Rookie Racer Experience/gi,
        NEW_TEXT_BLOCK,
      );
      if (el.textContent !== updated) {
        el.textContent = updated;
        // console.log(`1: div.blocks  —  updated content: "${el.textContent.trim()}"`);
      }
    }
    for (const el of blockEls) {
      if (!el.textContent.toLowerCase().includes(TARGET_BLOCK_342)) continue;
      const updated = el.textContent.replace(
        /Rookie Racer 342/gi,
        NEW_TEXT_BLOCK_342,
      );
      if (el.textContent !== updated) {
        el.textContent = updated;
      }
    }

    // Full replacement on h3.description-name (supplement booker — "Added to cart" view)
    const descEls = [];
    collectEls(document.body, "h3.description-name", descEls);
    for (const el of descEls) {
      if (!el.textContent.trim().toLowerCase().includes(TARGET_NAME)) continue;
      if (el.textContent.trim() !== NEW_TEXT_NAME) {
        el.textContent = NEW_TEXT_NAME;
        // console.log(`1: h3.description-name  —  updated content: "${NEW_TEXT_NAME}"`);
      }
      break;
    }
    for (const el of descEls) {
      if (!el.textContent.trim().toLowerCase().includes(TARGET_NAME_342))
        continue;
      if (el.textContent.trim() !== NEW_TEXT_NAME_342) {
        el.textContent = NEW_TEXT_NAME_342;
      }
      break;
    }

    // Image update — identifies the product image by its alt attribute matching the old name
    const productImgs = [];
    collectEls(document.body, "img[aria-label='Product picture']", productImgs);
    for (const img of productImgs) {
      const alt = (img.getAttribute("alt") || "").trim().toLowerCase();
      if (!alt.includes(TARGET_NAME)) continue;
      if (img.getAttribute("src") !== NEW_SRC) {
        img.setAttribute("src", NEW_SRC);
        // console.log(`1: img  —  image updated successfully: "${NEW_SRC}"`);
      }
    }
    for (const img of productImgs) {
      const alt = (img.getAttribute("alt") || "").trim().toLowerCase();
      if (!alt.includes(TARGET_NAME_342) && !alt.includes(TARGET_NAME_342_CART))
        continue;
      if (img.getAttribute("src") !== NEW_SRC) {
        img.setAttribute("src", NEW_SRC);
      }
    }

    // Cart view: h2[data-testid="cart-item-name"] + paired image (multiple items possible)
    const cartNameEls = [];
    collectEls(document.body, "h2[data-testid='cart-item-name']", cartNameEls);
    for (const el of cartNameEls) {
      if (!el.textContent.trim().toLowerCase().includes(TARGET_NAME)) continue;
      if (el.textContent.trim() !== NEW_TEXT_NAME) {
        el.textContent = NEW_TEXT_NAME;
        // console.log(`1: h2[cart-item-name]  —  updated content: "${NEW_TEXT_NAME}"`);
      }
      const cartItem = el.closest("sms-sales-cart-item");
      if (cartItem) {
        const img = cartItem.querySelector("img[aria-label='Product picture']");
        if (img && img.getAttribute("src") !== NEW_SRC) {
          img.setAttribute("src", NEW_SRC);
          // console.log(`1: img[cart]  —  image updated successfully: "${NEW_SRC}"`);
        }
      }
    }
    for (const el of cartNameEls) {
      const t = el.textContent.trim().toLowerCase();
      if (!t.includes(TARGET_NAME_342) && !t.includes(TARGET_NAME_342_CART))
        continue;
      if (el.textContent.trim() !== NEW_TEXT_NAME_342) {
        el.textContent = NEW_TEXT_NAME_342;
      }
      const cartItem = el.closest("sms-sales-cart-item");
      if (cartItem) {
        const img = cartItem.querySelector("img[aria-label='Product picture']");
        if (img && img.getAttribute("src") !== NEW_SRC) {
          img.setAttribute("src", NEW_SRC);
        }
      }
    }

    // p.schedule-name inside sms-supplement-booker — replaces "Rookie Race" with the
    // product-specific short name. Text-node surgery preserves Angular's comment markers
    // (<!--->) that structural directives use; setting textContent directly would wipe them.
    const bookerEls = [];
    collectEls(document.body, "sms-supplement-booker", bookerEls);
    for (const booker of bookerEls) {
      const nameEl = booker.querySelector("h3.description-name");
      if (!nameEl) continue;
      const nameText = nameEl.textContent.trim().toLowerCase();

      if (!nameText.includes("kids and family fun")) continue;

      const scheduleNameEls = [];
      collectEls(booker, "p.schedule-name", scheduleNameEls);
      for (const p of scheduleNameEls) {
        for (const child of p.childNodes) {
          if (child.nodeType !== Node.TEXT_NODE) continue;
          if (
            !/kids and family fun (experience|342)|rookie race/i.test(
              child.textContent,
            )
          )
            continue;
          child.textContent = child.textContent
            .replace(/Kids and Family Fun Experience/gi, "Kids and Family Fun")
            .replace(/Kids and Family Fun 342/gi, "Kids and Family Fun")
            .replace(/Rookie Race/gi, "Kids and Family Fun");
        }
      }
    }

    // p.product-extra inside sms-sales-cart-item (shopping cart page) — same text-node
    // surgery approach as p.schedule-name. The cart uses "Rookie Race 342" (no 'r') while
    // the booking modal uses "Rookie Racer 342" — both forms are checked here.
    const cartItemEls = [];
    collectEls(document.body, "sms-sales-cart-item", cartItemEls);
    for (const cartItem of cartItemEls) {
      const nameEl = cartItem.querySelector("h2[data-testid='cart-item-name']");
      if (!nameEl) continue;
      const nameText = nameEl.textContent.trim().toLowerCase();
      if (
        !nameText.includes("rookie race experience") &&
        !nameText.includes("rookie race 342") &&
        !nameText.includes("kids and family fun")
      )
        continue;

      const productExtraEls = [];
      collectEls(cartItem, "p.product-extra", productExtraEls);
      for (const p of productExtraEls) {
        for (const child of p.childNodes) {
          if (child.nodeType !== Node.TEXT_NODE) continue;
          if (!/rookie race/i.test(child.textContent)) continue;
          child.textContent = child.textContent.replace(
            /Rookie Race/gi,
            "Kids and Family Fun",
          );
        }
      }
    }

    applying = false;
  }

  const mo = new MutationObserver(debounce(tryApply, 150));
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Fallback interval: catches elements that appear inside shadow roots Angular creates
  // after the modal opens, which the body observer cannot see
  const intervalId = setInterval(tryApply, 1500);

  tryApply();

  return {
    stop() {
      mo.disconnect();
      shadowObservers.forEach((o) => o.disconnect());
      clearInterval(intervalId);
      // console.log("keepBookingPageUpdated: stopped.");
    },
  };
}

// ---------------------------------------------------------------------------
// Domain-aware initialisation — each domain runs only its relevant code

if (window.location.hostname.includes("booking.sms-timing.com")) {
  // Booking page (Angular SPA on a separate domain)
  const bookingUpdater = keepBookingPageUpdated();
  const slotSelectorTracker = trackTimeSlotSelectorAppears();
  const addedToCartTracker = trackAddedToCartOverlayAppears();
  // call bookingUpdater.stop() / slotSelectorTracker.stop() / addedToCartTracker.stop() to cancel
} else {
  // team-sport.co.uk booking results page
  const searchResultTracker = trackSearchResultViewed();
  const rreWatcher = findRookieRaceExperienceLive();
  // call rreWatcher.stop() to kill it manually

  // productUpdater handles all product renames + image swaps on the search results page.
  // Replaces the former h3Updater/imgUpdater pair — both target products share the same
  // h3 CSS selector, so a querySelectorAll + text-match pass is needed to avoid conflicts.
  const productUpdater = keepSearchResultProductsUpdated();
  // call productUpdater.stop() to cancel it
}

// 1 Search Results Page With Rookie Race/ Kids & Family Experience Viewed
// Rising-edge: fires each time the Kids and Family Fun Experience card appears on
// the team-sport.co.uk search results page. The body MutationObserver catches React
// re-renders on SPA navigation, so no pushState interception is needed.
function trackSearchResultViewed() {
  let present = false;

  function debounce(fn, ms) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function check() {
    const h3s = Array.from(document.querySelectorAll("li h3"));
    const experiencePresent = h3s.some((h3) =>
      h3.textContent
        .trim()
        .toLowerCase()
        .includes("kids and family fun experience"),
    );
    const the342Present = h3s.some((h3) =>
      h3.textContent.trim().toLowerCase().includes("kids and family fun 342"),
    );
    const nowPresent = experiencePresent || the342Present;
    if (nowPresent && !present) {
      /* Event snippet — segment: TS036EV2G */
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "TS036 | Event Tracking",
          eventLabel:
            "TS036 | (Variation 2) | Search Results Page With Rookie Race/ Kids & Family Experience Viewed",
          eventSegment: "TS036EV2G",
        },
      });

      // if (experiencePresent) console.log("Kids and Family Fun Experience Viewed");
      // if (the342Present) console.log("Kids and Family Fun 342 Viewed");
    }
    present = nowPresent;
  }

  const mo = new MutationObserver(debounce(check, 150));
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  check();

  return {
    stop() {
      mo.disconnect();
    },
  };
}

// 4 BMI Rookie Race/Kids & Family Time Slot Selector Appears
// Fires once when the time slot list appears inside the visible booking modal
function trackTimeSlotSelectorAppears() {
  let tracked = false;

  function debounce(fn, ms) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function collectEls(root, selector, results) {
    root.querySelectorAll(selector).forEach((el) => results.push(el));
    root.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) collectEls(el.shadowRoot, selector, results);
    });
  }

  function check() {
    if (tracked) return;
    const lists = [];
    collectEls(document.body, "ul.proposal-list", lists);
    for (const list of lists) {
      const ionModal = list.closest("ion-modal");
      if (!ionModal || !ionModal.classList.contains("show-modal")) continue;
      const firstBlock = list.querySelector("div.blocks");
      if (
        firstBlock &&
        (firstBlock.textContent
          .toLowerCase()
          .includes("kids and family fun experience") ||
          firstBlock.textContent
            .toLowerCase()
            .includes("kids and family fun 342"))
      ) {
        tracked = true;
        /* Event snippet — segment: TS036EV2J */
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "TS036 | Event Tracking",
            eventLabel:
              "TS036 | (Variation 2) | BMI Rookie Race/Kids & Family Time Slot Selector Appears",
            eventSegment: "TS036EV2J",
          },
        });

        // console.log("Time Slot Selector Appears");
        break;
      }
    }
  }

  const mo = new MutationObserver(debounce(check, 150));
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  const intervalId = setInterval(check, 1500);
  check();

  return {
    stop() {
      mo.disconnect();
      clearInterval(intervalId);
    },
  };
}

// 5 BMI Rookie Race/Kids & Family Added to cart overlay appears
// Rising-edge: fires each time sms-supplement-booker transitions from absent to present
function trackAddedToCartOverlayAppears() {
  let present = false;

  function debounce(fn, ms) {
    let t;
    return () => {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function collectEls(root, selector, results) {
    root.querySelectorAll(selector).forEach((el) => results.push(el));
    root.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) collectEls(el.shadowRoot, selector, results);
    });
  }

  function check() {
    const bookers = [];
    collectEls(document.body, "sms-supplement-booker", bookers);
    const nowPresent = bookers.some((booker) => {
      const nameEl = booker.querySelector("h3.description-name");
      return (
        nameEl &&
        (nameEl.textContent
          .toLowerCase()
          .includes("kids and family fun experience") ||
          nameEl.textContent.toLowerCase().includes("kids and family fun 342"))
      );
    });
    if (nowPresent && !present) {
      /* Event snippet — segment: TS036EV2K */
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "TS036 | Event Tracking",
          eventLabel:
            "TS036 | (Variation 2) | BMI Rookie Race/Kids & Family Added to cart overlay appears",
          eventSegment: "TS036EV2K",
        },
      });

      // console.log("Added to cart overlay appears");
    }
    present = nowPresent;
  }

  const mo = new MutationObserver(debounce(check, 150));
  mo.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  const intervalId = setInterval(check, 1500);
  check();

  return {
    stop() {
      mo.disconnect();
      clearInterval(intervalId);
    },
  };
}

function trackEvents() {
  if (!document.querySelector("body").classList.contains("TS036")) {
    document.querySelector("body").classList.add("TS036");

    document.addEventListener("click", (e) => {
      // 2 Rookie Race/Kids & Family Time Slot Click
      const timeSlotBtn = e.target.closest("button");
      if (timeSlotBtn) {
        const timeText = timeSlotBtn.textContent.trim();
        const li = timeSlotBtn.closest("li");
        const h3 = li && li.querySelector("h3");
        const h3Text = h3 && h3.textContent.trim().toLowerCase();
        if (
          /^\d{2}:\d{2}$/.test(timeText) &&
          timeSlotBtn.classList.contains("bg-book-time") &&
          h3Text &&
          (h3Text.includes("kids and family fun experience") ||
            h3Text.includes("kids and family fun 342"))
        ) {
          /* Event snippet — segment: TS036EV2H */
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "TS036 | Event Tracking",
              eventLabel:
                "TS036 | (Variation 2) | Rookie Race/Kids & Family Time Slot Click",
              eventSegment: "TS036EV2H",
            },
          });

          // console.log("Time Slot Click");
        }
      }

      // 3 Rookie Race/Kids & Family BOOK NOW Click
      const bookNowLink = e.target.closest("a");
      if (
        bookNowLink &&
        bookNowLink.textContent.trim().toLowerCase() === "book now"
      ) {
        const li = bookNowLink.closest("li");
        const h3 = li && li.querySelector("h3");
        const bookNowH3Text = h3 && h3.textContent.trim().toLowerCase();
        if (
          bookNowH3Text &&
          (bookNowH3Text.includes("kids and family fun experience") ||
            bookNowH3Text.includes("kids and family fun 342"))
        ) {
          /* Event snippet — segment: TS036EV2I */
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "TS036 | Event Tracking",
              eventLabel:
                "TS036 | (Variation 2) | Rookie Race/Kids & Family BOOK NOW Click",
              eventSegment: "TS036EV2I",
            },
          });

          // console.log("BOOK NOW Click");
        }
      }

      // 6 BMI Rookie Race/Kids & Family Time Slot Window BOOK NOW Click (booking.sms-timing.com)
      // ion-button[data-testid="proposal-book-now"] uses shadow DOM internally —
      // composedPath() is required to find it and its popup ancestor across shadow boundaries
      if (window.location.hostname.includes("booking.sms-timing.com")) {
        const path = e.composedPath();
        const bookNowIonBtn = path.find(
          (el) => el.dataset && el.dataset.testid === "proposal-book-now",
        );
        if (bookNowIonBtn) {
          const popup = path.find(
            (el) =>
              el.tagName &&
              el.tagName.toLowerCase() === "sms-product-booker-popup",
          );
          if (
            popup &&
            (popup.textContent
              .toLowerCase()
              .includes("kids and family fun experience") ||
              popup.textContent
                .toLowerCase()
                .includes("kids and family fun 342"))
          ) {
            /* Event snippet — segment: TS036EV2L */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                eventCategory: "Conversio CRO",
                eventAction: "TS036 | Event Tracking",
                eventLabel:
                  "TS036 | (Variation 2) | BMI Rookie Race/Kids & Family Time Slot Window BOOK NOW Click",
                eventSegment: "TS036EV2L",
              },
            });

            // console.log("Time Slot Window BOOK NOW Click");
          }
        }
      }

      // 7 BMI Rookie Race/Kids & Family PROCEED TO CHECKOUT Click (booking.sms-timing.com)
      // Same shadow DOM pattern as event 6 — composedPath() to find the ion-button
      // by data-testid, then sms-supplement-booker to confirm the right product context
      if (window.location.hostname.includes("booking.sms-timing.com")) {
        const path = e.composedPath();
        const checkoutBtn = path.find(
          (el) =>
            el.dataset &&
            el.dataset.testid === "supplement-proceed-to-checkout",
        );
        if (checkoutBtn) {
          const booker = path.find(
            (el) =>
              el.tagName &&
              el.tagName.toLowerCase() === "sms-supplement-booker",
          );
          if (
            booker &&
            (booker.textContent
              .toLowerCase()
              .includes("kids and family fun experience") ||
              booker.textContent
                .toLowerCase()
                .includes("kids and family fun 342"))
          ) {
            /* Event snippet — segment: TS036EV2M */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                eventCategory: "Conversio CRO",
                eventAction: "TS036 | Event Tracking",
                eventLabel:
                  "TS036 | (Variation 2) | BMI Rookie Race/Kids & Family PROCEED TO CHECKOUT Click",
                eventSegment: "TS036EV2M",
              },
            });

            // console.log("PROCEED TO CHECKOUT Click");
          }
        }
      }

      // 8 BMI Rookie Race/Kids & Family CONTINUE SHOPPING Click (booking.sms-timing.com)
      if (window.location.hostname.includes("booking.sms-timing.com")) {
        const path = e.composedPath();
        const continueBtn = path.find(
          (el) =>
            el.dataset && el.dataset.testid === "supplement-continue-shopping",
        );
        if (continueBtn) {
          const booker = path.find(
            (el) =>
              el.tagName &&
              el.tagName.toLowerCase() === "sms-supplement-booker",
          );
          if (
            booker &&
            (booker.textContent
              .toLowerCase()
              .includes("kids and family fun experience") ||
              booker.textContent
                .toLowerCase()
                .includes("kids and family fun 342"))
          ) {
            /* Event snippet — segment: TS036EV2N */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                eventCategory: "Conversio CRO",
                eventAction: "TS036 | Event Tracking",
                eventLabel:
                  "TS036 | (Variation 2) | BMI Rookie Race/Kids & Family CONTINUE SHOPPING Click",
                eventSegment: "TS036EV2N",
              },
            });

            // console.log("CONTINUE SHOPPING Click");
          }
        }
      }
    });
  }
}

trackEvents();
