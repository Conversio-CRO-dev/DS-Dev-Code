// console.log("David Silva | LT179 control");

(function () {
  // Stop the code running twice if the script is injected more than once
  if (window.LT179_control_loaded) return;
  window.LT179_control_loaded = true;

  // Make sure the tracking array exists, so a push never throws an error
  window.adobeDataLayer = window.adobeDataLayer || [];

  const NATIVE_BOX = '[data-testid="subscribe-save-offer"]';
  const NATIVE_ADD_BUTTON = NATIVE_BOX + ' [data-testid="add-to-cart-button"]';
  const HOW_IT_WORKS_LINK = NATIVE_BOX + " .subscribe-save-link";
  const MODAL_ADD_BUTTON =
    '[role="dialog"] .subscribe-add-to-cart [data-testid="add-to-cart-button"]';
  const CHECKOUT_LINK = ".order-summary .payment-checkout a";
  const CART_UPDATE_URL = "/webapi/carts/";

  let upsellSeenFired = false;
  let observedBox = null;
  let seenObserver = null;
  let basketHadSubscription = null;

  function isCartPage() {
    return window.location.pathname === "/cart";
  }

  function getSeenObserver() {
    if (!seenObserver) {
      seenObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || upsellSeenFired) return;
            upsellSeenFired = true;
            seenObserver.disconnect();
            // 1. Subscription Upsell Seen (triggering event, once per basket view)
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT179 | Event Tracking",
                  clickText:
                    "LT179 (Control Original) | Subscription Upsell Seen (trigger)",
                },
              },
            });
            // console.log("LT179 EVENT: Subscription Upsell Seen");
          });
        },
        { threshold: 0.5 },
      );
    }
    return seenObserver;
  }

  // The site adds and removes the native box as the basket changes, so start watching each new one
  function watchNativeBox() {
    if (upsellSeenFired || !isCartPage() || !("IntersectionObserver" in window))
      return;

    const box = document.querySelector(NATIVE_BOX);
    if (!box || box === observedBox) return;

    observedBox = box;
    getSeenObserver().observe(box);
  }

  function watchForRedraws() {
    let checkQueued = false;
    const observer = new MutationObserver(function () {
      if (checkQueued || upsellSeenFired) return;
      checkQueued = true;
      requestAnimationFrame(function () {
        checkQueued = false;
        watchNativeBox();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // A new page view (SPA navigation) counts as a new basket view
  function resetForNewView() {
    upsellSeenFired = false;
    observedBox = null;
    watchNativeBox();
  }

  function watchPageChanges() {
    const originalPushState = history.pushState;
    history.pushState = function () {
      const result = originalPushState.apply(this, arguments);
      resetForNewView();
      return result;
    };
    window.addEventListener("popstate", resetForNewView);
  }

  // Capture phase: runs before the site's own click code, while the modal button is still on the page
  function watchClicks() {
    document.addEventListener(
      "click",
      function (event) {
        if (!isCartPage()) return;
        const target = event.target;

        if (target.closest(NATIVE_ADD_BUTTON)) {
          // 2. Add Subscription CTA Click
          adobeDataLayer.push({
            event: "targetClickEvent",
            eventData: {
              click: {
                clickLocation: "Conversio CRO",
                clickAction: "LT179 | Event Tracking",
                clickText:
                  "LT179 (Control Original) | Add Subscription CTA Click",
              },
            },
          });
          // console.log("LT179 EVENT: Add Subscription CTA Click");
        } else if (target.closest(HOW_IT_WORKS_LINK)) {
          // 3. How It Works Click
          adobeDataLayer.push({
            event: "targetClickEvent",
            eventData: {
              click: {
                clickLocation: "Conversio CRO",
                clickAction: "LT179 | Event Tracking",
                clickText: "LT179 (Control Original) | How It Works Click",
              },
            },
          });
          // console.log("LT179 EVENT: How It Works Click");
        } else if (target.closest(MODAL_ADD_BUTTON)) {
          // 4. Add subscription from modal
          adobeDataLayer.push({
            event: "targetClickEvent",
            eventData: {
              click: {
                clickLocation: "Conversio CRO",
                clickAction: "LT179 | Event Tracking",
                clickText:
                  "LT179 (Control Original) | Add subscription from modal",
              },
            },
          });
          // console.log("LT179 EVENT: Add subscription from modal");
        } else if (target.closest(CHECKOUT_LINK)) {
          // 6. Proceed to Checkout Click
          adobeDataLayer.push({
            event: "targetClickEvent",
            eventData: {
              click: {
                clickLocation: "Conversio CRO",
                clickAction: "LT179 | Event Tracking",
                clickText:
                  "LT179 (Control Original) | Proceed to Checkout Click",
              },
            },
          });
          // console.log("LT179 EVENT: Proceed to Checkout Click");
        }
      },
      true,
    );
  }

  function cartHasSubscription(cart) {
    const items = (cart && cart.lineItems) || [];
    return items.some(function (item) {
      const upsell =
        item.classificationDetails && item.classificationDetails.upsell;
      return Boolean(upsell && upsell.type === "WINEPLAN");
    });
  }

  // Compare each new basket with the previous one, so every way of removing the subscription counts
  function checkSubscriptionRemoved(xhr) {
    let cart;
    try {
      cart =
        xhr.responseType === "json"
          ? xhr.response
          : JSON.parse(xhr.responseText);
    } catch (error) {
      return;
    }
    if (!cart || !cart.lineItems) return;

    const hasSubscription = cartHasSubscription(cart);
    if (basketHadSubscription === true && !hasSubscription) {
      // 5. Remove Subscription
      adobeDataLayer.push({
        event: "targetClickEvent",
        eventData: {
          click: {
            clickLocation: "Conversio CRO",
            clickAction: "LT179 | Event Tracking",
            clickText: "LT179 (Control Original) | Remove Subscription",
          },
        },
      });
      // console.log("LT179 EVENT: Remove Subscription");
    }
    basketHadSubscription = hasSubscription;
  }

  // Listen for the site's own basket requests finishing successfully
  function watchCartRequests() {
    const originalOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function (method, url) {
      this.addEventListener("load", function () {
        const isCartRequest = String(url).indexOf(CART_UPDATE_URL) !== -1;
        if (isCartRequest && this.status >= 200 && this.status < 300) {
          checkSubscriptionRemoved(this);
        }
      });
      return originalOpen.apply(this, arguments);
    };
  }

  watchForRedraws();
  watchPageChanges();
  watchClicks();
  watchCartRequests();
  watchNativeBox();
})();
