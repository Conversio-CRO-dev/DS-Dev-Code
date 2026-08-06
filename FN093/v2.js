// console.log("David Silva | FN093 variation 2");

/* =========================================================================
 * FN093 | Variation 2
 * Same as Variation 1 (custom "Item added to your cart" popup + basket-icon
 * redirect), with an added "Check Out" button in the overlay.
 * ========================================================================= */

(function () {
  "use strict";

  var CART_URL = "https://finisterre.com/cart";
  var CHECKOUT_URL = "https://finisterre.com/checkout";

  /* Selectors that should be treated as the Basket / cart-drawer trigger.
   * Adjust here if the header markup differs from what we expect. */
  var CART_TRIGGER_SELECTOR = [
    "#cart-icon-desktop",
    "#cart-icon-mobile",
    "[data-cart-drawer-toggle]",
    '[data-drawer-toggle="cart"]',
    'a[href="/cart"]',
    'a[href$="/cart"]',
    '[aria-label*="basket" i]',
    '[aria-label*="cart" i]',
  ].join(",");

  /* ---------------------------------------------------------------------
   * Tracking
   * ------------------------------------------------------------------- */
  function pushConversioEvent(eventLabel, eventSegment) {
    console.log("[FN093]", eventLabel, eventSegment || "");

    window.dataLayer = window.dataLayer || [];
    var conversio = {
      eventCategory: "Conversio CRO",
      eventAction: "FN093 | Event Tracking",
      eventLabel: eventLabel,
    };
    if (eventSegment) conversio.eventSegment = eventSegment;
    window.dataLayer.push({ event: "conversioEvent", conversio: conversio });
  }

  /* ---------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------- */
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(
      /[&<>"']/g,
      function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[char];
      },
    );
  }

  function formatMoney(cents) {
    var amount = (Number(cents) || 0) / 100;
    var value = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
    return "£" + value;
  }

  /* Show the current price, plus the original struck-through when on sale /
   * discounted. "was" = highest of compare-at and pre-discount price. */
  function buildPriceHtml(item) {
    var now = item.final_price != null ? item.final_price : item.price;
    var was = Math.max(
      Number(item.compare_at_price) || 0,
      Number(item.original_price) || 0,
    );

    var nowHtml =
      '<span class="fn092-atc-popup__price-now">' +
      formatMoney(now) +
      "</span>";

    if (was > now) {
      return (
        '<span class="fn092-atc-popup__price-was">' +
        formatMoney(was) +
        "</span>" +
        nowHtml
      );
    }

    return nowHtml;
  }

  /* Build the variant detail lines, e.g. "Raven Lofi Print" then "Size: 12". */
  function buildOptionLines(item) {
    var lines = [];
    var sizeLines = [];
    var options = item.options_with_values;

    if (options && options.length) {
      options.forEach(function (option) {
        if (!option || option.value == null || option.value === "") return;
        if (/size/i.test(option.name)) {
          sizeLines.push("Size: " + option.value);
        } else {
          lines.push(String(option.value));
        }
      });
    } else if (item.variant_title && item.variant_title !== "Default Title") {
      lines = item.variant_title.split(" / ");
    }

    return lines.concat(sizeLines);
  }

  function ready(callback) {
    if (document.body) {
      callback();
    } else if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      setTimeout(callback, 50);
    }
  }

  /* Matches the theme's md breakpoint (768px) — below it is "mobile". */
  function isMobileViewport() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 767px)").matches
    );
  }

  /* ---------------------------------------------------------------------
   * Custom popup
   * ------------------------------------------------------------------- */
  var popupEl = null;
  var backdropEl = null;
  var autoCloseTimer = null;
  var openedAt = 0;

  /* Mini-basket drawer hand-off state (mobile only — see bindBasketIcon /
   * openMiniBasket below). allowDrawerOpen tells neutralizeDrawer's observer
   * to leave a sanctioned open alone instead of auto-closing it. */
  var allowDrawerOpen = false;

  function ensurePopup() {
    if (popupEl) return popupEl;
    if (!document.body) return null;

    /* Dark backdrop (shown on mobile only — see SCSS). */
    backdropEl = document.createElement("div");
    backdropEl.className = "fn092-atc-backdrop";
    document.body.appendChild(backdropEl);

    popupEl = document.createElement("div");
    popupEl.className = "fn092-atc-popup";
    popupEl.setAttribute("role", "dialog");
    popupEl.setAttribute("aria-label", "Item added to your cart");
    document.body.appendChild(popupEl);

    return popupEl;
  }

  function onOutsideClick(event) {
    /* Ignore programmatic clicks (e.g. our own native-drawer close click that
     * fires when the theme tries to open the mini-bag); only a genuine user
     * click outside the popup should dismiss it. */
    if (!event.isTrusted) return;

    /* Ignore the opening gesture's trailing clicks (PLP quick-buy fires the
     * add + re-render clicks right as the popup appears). */
    if (Date.now() - openedAt < 500) return;

    if (popupEl && !popupEl.contains(event.target)) {
      closePopup("outside");
    }
  }

  function closePopup(reason) {
    var wasVisible = popupEl && popupEl.classList.contains("is-visible");

    if (popupEl) popupEl.classList.remove("is-visible");
    if (backdropEl) backdropEl.classList.remove("is-visible");
    document.body.classList.remove("fn092-atc-lock");
    document.removeEventListener("click", onOutsideClick, true);
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }

    /* Track user-initiated closes only (not the 10s auto-dismiss). */
    if (wasVisible && reason && reason !== "auto") {
      pushConversioEvent(
        "FN093 | (Variation 2) | Post ATB Overlay Closed",
        "FN093EV2K",
      );
    }
  }

  function showPopup(item) {
    var el = ensurePopup();
    if (!el) return;

    var image =
      item.image || (item.featured_image && item.featured_image.url) || "";
    var title = item.product_title || item.title || "";
    var priceHtml = buildPriceHtml(item);

    var optionsHtml = buildOptionLines(item)
      .map(function (line) {
        return (
          '<div class="fn092-atc-popup__option">' + escapeHtml(line) + "</div>"
        );
      })
      .join("");

    el.innerHTML =
      '<div class="fn092-atc-popup__head">' +
      '<span class="fn092-atc-popup__status">' +
      '<svg class="fn092-atc-popup__check" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="none" stroke="currentColor" stroke-width="2" d="M4 12.5l5 5L20 6.5"></path>' +
      "</svg>" +
      "Item added to your cart" +
      "</span>" +
      '<button type="button" class="fn092-atc-popup__close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="none" stroke="currentColor" stroke-width="2" d="M5 5l14 14M19 5L5 19"></path>' +
      "</svg>" +
      "</button>" +
      "</div>" +
      '<div class="fn092-atc-popup__body">' +
      (image
        ? '<img class="fn092-atc-popup__image" src="' +
          escapeHtml(image) +
          '" alt="' +
          escapeHtml(title) +
          '">'
        : "") +
      '<div class="fn092-atc-popup__details">' +
      '<div class="fn092-atc-popup__title">' +
      escapeHtml(title) +
      "</div>" +
      '<div class="fn092-atc-popup__price">' +
      priceHtml +
      "</div>" +
      optionsHtml +
      "</div>" +
      "</div>" +
      '<a class="fn092-atc-popup__cta" href="' +
      CART_URL +
      '">View Basket</a>' +
      '<a class="fn092-atc-popup__checkout" href="' +
      CHECKOUT_URL +
      '">Check Out</a>';

    el.querySelector(".fn092-atc-popup__close").addEventListener(
      "click",
      function () {
        closePopup("close-button");
      },
    );
    el.querySelector(".fn092-atc-popup__cta").addEventListener(
      "click",
      function (event) {
        pushConversioEvent(
          "FN093 | (Variation 2) | Post ATB Overlay: View Basket Click",
          "FN093EV2H",
        );

        if (isMobileViewport()) {
          /* Show the native mini-basket instead of navigating to /cart —
           * it's better optimised for mobile. */
          event.preventDefault();
          closePopup();
          openMiniBasket();
        }
      },
    );
    el.querySelector(".fn092-atc-popup__checkout").addEventListener(
      "click",
      function () {
        pushConversioEvent(
          "FN093 | (Variation 2) | Post ATB Overlay: Check Out Click",
          "FN093EV2I",
        );
      },
    );

    openedAt = Date.now();
    el.classList.add("is-visible");
    if (backdropEl) backdropEl.classList.add("is-visible");
    document.body.classList.add("fn092-atc-lock");
    pushConversioEvent(
      "FN093 | (Variation 2) | Post ATB Triggered: Mini Basket/Overlay triggered",
      "FN093EV2G",
    );

    /* Close on outside click. Defer binding so the click that triggered the
     * add doesn't immediately close the popup. */
    document.removeEventListener("click", onOutsideClick, true);
    setTimeout(function () {
      document.addEventListener("click", onOutsideClick, true);
    }, 0);

    /* Auto-dismiss after 10s (reset on each re-open). */
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(function () {
      closePopup("auto");
    }, 10000);
  }

  function handleAdd(data) {
    if (!data) return;
    var item = data.items ? data.items[data.items.length - 1] : data;
    if (!item || !item.id) return;

    /* Always show the custom overlay for a fresh add, even if the mini-basket
     * happens to be open already (e.g. user opened it, then added another
     * item from elsewhere) — close it first via its own native method. */
    if (allowDrawerOpen) {
      allowDrawerOpen = false;
      var drawer = document.getElementById("cart-drawer");
      if (drawer && typeof drawer.closeDrawer === "function") {
        drawer.closeDrawer();
      }
    }

    ready(function () {
      showPopup(item);
    });
  }

  /* ---------------------------------------------------------------------
   * Detect add-to-cart (patch fetch + XHR) — runs as early as possible
   * ------------------------------------------------------------------- */
  function isAddUrl(url) {
    return typeof url === "string" && /\/cart\/add/.test(url);
  }

  var nativeFetch = window.fetch;
  if (typeof nativeFetch === "function") {
    window.fetch = function () {
      var args = arguments;
      var input = args[0];
      var url = (input && input.url) || input || "";
      var promise = nativeFetch.apply(this, args);

      if (isAddUrl(url)) {
        promise
          .then(function (response) {
            if (!response || !response.ok) return;
            response
              .clone()
              .json()
              .then(handleAdd)
              .catch(function () {});
          })
          .catch(function () {});
      }

      return promise;
    };
  }

  var nativeOpen = XMLHttpRequest.prototype.open;
  var nativeSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.__fn092IsAdd = isAddUrl(url);
    return nativeOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    if (this.__fn092IsAdd) {
      this.addEventListener("load", function () {
        if (this.status < 200 || this.status >= 300) return;
        try {
          handleAdd(JSON.parse(this.responseText));
        } catch (error) {
          /* not JSON — ignore */
        }
      });
    }
    return nativeSend.apply(this, arguments);
  };

  /* Re-hides the drawer only after its own slide-out transition finishes —
   * re-applying display:none immediately would cut the CSS transform
   * transition short, so the panel would vanish instead of sliding out. */
  function hideDrawerAfterTransition(drawer) {
    var panel = drawer.querySelector(".menu-drawer");
    var finished = false;

    var finish = function () {
      if (finished) return;
      finished = true;
      if (panel) panel.removeEventListener("transitionend", onTransitionEnd);
      /* Bail if the drawer was reopened while we were waiting (re-reads the
       * live flag, not a stale value from when this call started). */
      if (allowDrawerOpen) return;
      drawer.classList.remove("fn093-drawer-visible");
      drawer.style.setProperty("display", "none", "important");
    };

    var onTransitionEnd = function (event) {
      if (event.target === panel) finish();
    };

    if (panel) {
      panel.addEventListener("transitionend", onTransitionEnd);
    }

    /* Fallback in case transitionend never fires (no transition defined,
     * property name mismatch, etc.) so we don't get stuck open forever. */
    setTimeout(finish, 500);
  }

  /* ---------------------------------------------------------------------
   * Neutralise the native cart drawer
   * (CSS hides it; here we reuse its own close routine so the theme
   *  tidies up scroll-locking / overlays whenever it tries to open.)
   * ------------------------------------------------------------------- */
  function neutralizeDrawer() {
    /* #cart-drawer is reused by the /cart page for its main content, so it can
     * appear more than once. Only the slide-in mini-bag holds a .menu-drawer
     * panel — leave the cart page's content untouched. */
    var drawers = document.querySelectorAll("#cart-drawer");

    drawers.forEach(function (drawer) {
      if (!drawer.querySelector(".menu-drawer")) return;

      /* Fallback hide for browsers without :has() CSS support. */
      drawer.style.setProperty("display", "none", "important");

      var closeIfOpen = function () {
        var openPanel = drawer.querySelector(".drawer-open-right");

        if (!openPanel) {
          if (allowDrawerOpen) {
            /* The manually-opened drawer was dismissed (native close button,
             * outside click, etc. — all handled natively since we opened it
             * via the real openDrawer() method). Let its slide-out play,
             * then re-arm neutralisation for the next automatic (post
             * add-to-cart) open attempt. */
            allowDrawerOpen = false;
            hideDrawerAfterTransition(drawer);
          }
          return;
        }

        if (allowDrawerOpen) {
          /* We opened this on purpose (openMiniBasket) — leave it alone.
           * No writes here: this must stay a pure read, or every internal
           * re-render of the drawer's own contents (recs carousel, quantity
           * updates, etc.) would re-trigger this observer in a loop. */
          return;
        }

        var closeBtn = drawer.querySelector(".close-btn");
        if (closeBtn) {
          closeBtn.click();
        } else {
          openPanel.classList.remove("drawer-open-right");
        }
      };

      new MutationObserver(closeIfOpen).observe(drawer, {
        attributes: true,
        attributeFilter: ["class"],
        childList: true,
        subtree: true,
      });

      closeIfOpen();
    });
  }

  /* ---------------------------------------------------------------------
   * Basket icon -> cart page (desktop) / native mini-basket (mobile)
   * ------------------------------------------------------------------- */

  /* Opens the mini-basket via the <cart-drawer> element's own openDrawer()
   * method — the same call the theme's header trigger makes. This matters:
   * the component tracks its own internal `isOpen` state, and its close
   * button / outside-click handlers only act `if (this.isOpen)`. Toggling
   * the CSS class ourselves left that state out of sync, so the close
   * button silently did nothing. Calling the method directly (rather than
   * dispatching a synthetic click, which is what caused an earlier freeze)
   * keeps this a plain, predictable function call instead of running
   * through the page's full click-handling graph. */
  function openMiniBasket() {
    var drawer = document.getElementById("cart-drawer");
    if (!drawer || typeof drawer.openDrawer !== "function") return;

    allowDrawerOpen = true;
    drawer.classList.add("fn093-drawer-visible");
    drawer.style.removeProperty("display");
    drawer.openDrawer();
  }

  function bindBasketIcon() {
    document.addEventListener(
      "click",
      function (event) {
        /* never hijack clicks inside our own popup */
        if (event.target.closest(".fn092-atc-popup")) return;

        var trigger = event.target.closest(CART_TRIGGER_SELECTOR);
        if (!trigger) return;

        /* don't catch the add-to-cart controls */
        if (
          event.target.closest(
            'form[action*="/cart/add"], product-form, product-form-plp, [data-ajax-product-card-variants]',
          )
        ) {
          return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        pushConversioEvent(
          "FN093 | (Variation 2) | Header Basket Icon Click",
          "FN093EV2J",
        );

        if (isMobileViewport()) {
          openMiniBasket();
          return;
        }

        window.location.href = CART_URL;
      },
      true,
    );
  }

  /* ---------------------------------------------------------------------
   * Cart page — checkout click
   * (Ignore the overlay's own Check Out button — that fires its own event.)
   * ------------------------------------------------------------------- */
  function bindCheckoutTracking() {
    document.addEventListener(
      "click",
      function (event) {
        if (event.target.closest(".fn092-atc-popup")) return;

        var checkout = event.target.closest(
          'checkout-btn a, a[href="/checkout"]',
        );
        if (!checkout) return;
        pushConversioEvent(
          "FN093 | (Variation 2) | Mini Basket Checkout Click",
          "FN093EV2L",
        );
      },
      true,
    );
  }

  /* ---------------------------------------------------------------------
   * Init
   * ------------------------------------------------------------------- */
  ready(function () {
    neutralizeDrawer();
    bindBasketIcon();
    bindCheckoutTracking();
  });
})();
