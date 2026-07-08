// console.log("David Silva | FN093 variation 1");

(function () {
  "use strict";

  var CART_URL = "https://finisterre.com/cart";

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

  /* ---------------------------------------------------------------------
   * Custom popup
   * ------------------------------------------------------------------- */
  var popupEl = null;
  var backdropEl = null;
  var autoCloseTimer = null;
  var openedAt = 0;

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
        "FN093 | (Variation 1) | Post ATB Overlay Closed",
        "FN093EV1K",
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
      '">View Basket</a>';

    el.querySelector(".fn092-atc-popup__close").addEventListener(
      "click",
      function () {
        closePopup("close-button");
      },
    );
    el.querySelector(".fn092-atc-popup__cta").addEventListener(
      "click",
      function () {
        pushConversioEvent(
          "FN093 | (Variation 1) | Post ATB Overlay: View Basket Click",
          "FN093EV1H",
        );
      },
    );

    openedAt = Date.now();
    el.classList.add("is-visible");
    if (backdropEl) backdropEl.classList.add("is-visible");
    document.body.classList.add("fn092-atc-lock");
    pushConversioEvent(
      "FN093 | (Variation 1) | Post ATB Triggered: Mini Basket/Overlay triggered",
      "FN093EV1G",
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
        if (!openPanel) return;

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
   * Basket icon -> cart page
   * ------------------------------------------------------------------- */
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
          "FN093 | (Variation 1) | Header Basket Icon Click",
          "FN093EV1J",
        );
        window.location.href = CART_URL;
      },
      true,
    );
  }

  /* ---------------------------------------------------------------------
   * Cart page — checkout click
   * ------------------------------------------------------------------- */
  function bindCheckoutTracking() {
    document.addEventListener(
      "click",
      function (event) {
        var checkout = event.target.closest(
          'checkout-btn a, a[href="/checkout"]',
        );
        if (!checkout) return;
        pushConversioEvent(
          "FN093 | (Variation 1) | Mini Basket Checkout Click",
          "FN093EV1L",
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
