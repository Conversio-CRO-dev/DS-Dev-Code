console.log("David Silva | LT112.6 variation 1");

(function () {
  "use strict";

  var CONFIG = {
    rootSelector: '.summary-container[data-cy="cyBilling"]',
    styleId: "ab-upsell-v1-styles",
    builtAttr: "data-ab-upsell-v1-built",
  };

  function subscriptionAlreadyInSummary() {
    var text = document.body ? document.body.textContent : "";

    return (
      text.indexOf("Price-Locked Bestsellers") > -1 &&
      text.indexOf("Mixed Subscription") > -1
    );
  }

  function removeUpsell(container) {
    if (container) {
      container.remove();
    }
  }

  function injectStyles() {
    if (document.getElementById(CONFIG.styleId)) return;

    var css =
      "" +
      ".ab-upsell-v1-content{margin-top:8px;}" +
      CONFIG.rootSelector +
      "[" +
      CONFIG.builtAttr +
      '="true"]{' +
      "position:relative;background:#fff;border:1px solid #d9d9d9;border-radius:6px;padding:26px 24px 22px;box-sizing:border-box;max-width:760px;margin:0 auto;margin-bottom: 20px;" +
      "}" +
      CONFIG.rootSelector +
      " .upsellHeadingcontainer{display:block !important;text-align:center;margin:0 0 8px;}" +
      CONFIG.rootSelector +
      " .upsellHeading{display:block !important;font-size:28px;line-height:1.1;font-weight:800;margin:0;color:#d1005c;text-transform:uppercase;}" +
      CONFIG.rootSelector +
      " .upsellSubHeadingcontainer{display:block !important;text-align:center;margin:0 0 24px;}" +
      CONFIG.rootSelector +
      " .upsellSubHeadingcontainer span{display:block;font-size:16px;line-height:1.25;font-weight:700;color:#222;}" +
      ".ab-upsell-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border:0;background:transparent;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;}" +
      ".ab-upsell-close svg{width:22px;height:22px;}" +
      ".ab-upsell-list{margin:0 0 24px;padding:0;}" +
      ".ab-upsell-row{display:flex;align-items:center;gap:18px;margin:0 0 24px;}" +
      ".ab-upsell-row:last-child{margin-bottom:0;}" +
      ".ab-upsell-icon{width:32px;flex:0 0 32px;display:flex;justify-content:center;align-items:center;}" +
      ".ab-upsell-copy strong{font-size:18px;line-height:1.3;font-weight:800;color:#222;}" +
      ".ab-upsell-cta-wrap{margin:30px 0 18px;}" +
      ".ab-upsell-cta{width:100%;min-height:62px;border:0;background:#117B53;color:#fff;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 4px 8px rgba(0,0,0,.18);}" +
      ".ab-upsell-footer{display:flex;justify-content:space-between;align-items:center;font-size:14px;line-height:1.4;}" +
      ".ab-upsell-footer a{color:#222;text-decoration:underline;}" +
      CONFIG.rootSelector +
      " .upsellWpInfo," +
      CONFIG.rootSelector +
      " .upsellWpAction," +
      CONFIG.rootSelector +
      " .upsellTermsContainer{display:none !important;}" +
      "@media(max-width:767px){" +
      CONFIG.rootSelector +
      "[" +
      CONFIG.builtAttr +
      '="true"]{padding:22px 16px 18px;}' +
      CONFIG.rootSelector +
      " .upsellHeading{font-size:22px;}" +
      CONFIG.rootSelector +
      " .upsellSubHeadingcontainer span{font-size:14px;margin-top:8px;}" +
      ".ab-upsell-copy strong{font-size:15px;}" +
      "}";

    var style = document.createElement("style");
    style.id = CONFIG.styleId;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function getCloseSvg() {
    return '<svg viewBox="0 0 24 24"><path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"></path></svg>';
  }

  function getBottleSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="9" height="30" viewBox="0 0 9 30"><path d="M1.5 30C1.10218 30 .720645 29.842 .43934 29.5607C.158036 29.2794 0 28.8978 0 28.5V13.5C0 10.5 1.5 7.875 3 7.5V.75C3 .551088 3.07902 .360322 3.21967 .21967C3.36032 .0790178 3.55109 0 3.75 0H5.25C5.44891 0 5.63968 .0790178 5.78033 .21967C5.92098 .360322 6 .551088 6 .75V7.5C7.5 7.875 9 10.5 9 13.5V28.5C9 28.8978 8.84196 29.2794 8.56066 29.5607C8.27936 29.842 7.89782 30 7.5 30H1.5Z" fill="#CF004F"></path></svg>';
  }

  function getTagSvg() {
    return '<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12.79 21L3 11.21V13.21C3 13.74 3.21 14.25 3.59 14.62L11.38 22.41C12.16 23.19 13.43 23.19 14.21 22.41L20.42 16.2C21.2 15.42 21.2 14.15 20.42 13.37L12.79 21Z" fill="#CF004F"></path><path d="M11.38 17.41C12.16 18.19 13.43 18.19 14.21 17.41L20.42 11.2C21.2 10.42 21.2 9.15 20.42 8.37L12.63 .58C12.2501 .209302 11.7408 .00124533 11.21 0L5 0C3.9 0 3 .9 3 2V8.21C3 8.74 3.21 9.25 3.59 9.62L11.38 17.41Z" fill="#CF004F"></path></svg>';
  }

  function getCancelSvg() {
    return '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.63604 16.364C2.80031 15.5282 2.13738 14.5361 1.68508 13.4442C1.23279 12.3522 1 11.1819 1 10C1 8.8181 1.23279 7.64778 1.68508 6.55585C2.13738 5.46392 2.80031 4.47177 3.63604 3.63604C4.47177 2.80031 5.46392 2.13738 6.55585 1.68508C7.64778 1.23279 8.8181 1 10 1C11.1819 1 12.3522 1.23279 13.4442 1.68508C14.5361 2.13738 15.5282 2.80031 16.364 3.63604M3.63604 16.364C4.47177 17.1997 5.46392 17.8626 6.55585 18.3149C7.64778 18.7672 8.8181 19 10 19C11.1819 19 12.3522 18.7672 13.4442 18.3149C14.5361 17.8626 15.5282 17.1997 16.364 16.364C17.1997 15.5282 17.8626 14.5361 18.3149 13.4442C18.7672 12.3522 19 11.1819 19 10C19 8.8181 18.7672 7.64778 18.3149 6.55585C17.8626 5.46392 17.1997 4.47177 16.364 3.63604M3.63604 16.364L16.364 3.63604" stroke="#CF004F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  }

  function getShieldSvg() {
    return '<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.298 0.126819C8.69262 -0.0208285 9.12379 -0.040077 9.53 0.0718194L9.702 0.126819L16.702 2.75182C17.0569 2.88491 17.3667 3.11612 17.5953 3.41852C17.8239 3.72092 17.9618 4.08205 17.993 4.45982L18 4.62482V9.98782C18 11.6082 17.5624 13.1986 16.7336 14.591C15.9048 15.9834 14.7154 17.1262 13.291 17.8988L13.025 18.0378L9.671 19.7148C9.48632 19.807 9.28461 19.8601 9.07847 19.8708C8.87233 19.8815 8.66621 19.8495 8.473 19.7768L8.329 19.7148L4.975 18.0378C3.52561 17.3131 2.29878 16.2105 1.424 14.8464C0.549233 13.4824 0.0589805 11.9074 0.00500011 10.2878L0 9.98782V4.62482C5.81505e-06 4.24595 0.107627 3.87487 0.310334 3.55479C0.513041 3.23471 0.802495 2.97879 1.145 2.81682L1.298 2.75182L8.298 0.126819ZM9 1.99982L2 4.62482V9.98782C2.00003 11.2428 2.33745 12.4747 2.97696 13.5546C3.61646 14.6345 4.53451 15.5225 5.635 16.1258L5.87 16.2488L9 17.8138L12.13 16.2488C13.2527 15.6876 14.2039 14.8347 14.8839 13.7797C15.5638 12.7246 15.9476 11.5061 15.995 10.2518L16 9.98782V4.62482L9 1.99982ZM12.433 6.56082C12.613 6.38147 12.8544 6.27735 13.1084 6.26959C13.3623 6.26184 13.6097 6.35103 13.8003 6.51907C13.9908 6.6871 14.1103 6.92137 14.1344 7.17429C14.1585 7.42722 14.0854 7.67983 13.93 7.88082L13.847 7.97482L8.613 13.2098C8.42235 13.4004 8.16832 13.5144 7.89917 13.5301C7.63002 13.5458 7.36449 13.462 7.153 13.2948L7.057 13.2098L4.653 10.8058C4.47175 10.6263 4.36597 10.3842 4.35732 10.1293C4.34867 9.87429 4.4378 9.62565 4.60647 9.43424C4.77513 9.24282 5.01058 9.12312 5.26462 9.09962C5.51866 9.07611 5.77208 9.1506 5.973 9.30782L6.067 9.39082L7.835 11.1588L12.433 6.56082Z" fill="#CF004F"></path></svg>';
  }

  function buildInnerMarkup() {
    return (
      "" +
      '<button type="button" class="ab-upsell-close" aria-label="Close">' +
      getCloseSvg() +
      "</button>" +
      '<div class="ab-upsell-list">' +
      '<div class="ab-upsell-row"><div class="ab-upsell-icon">' +
      getBottleSvg() +
      '</div><div class="ab-upsell-copy"><strong>12 Superb bestsellers</strong></div></div>' +
      '<div class="ab-upsell-row"><div class="ab-upsell-icon">' +
      getTagSvg() +
      '</div><div class="ab-upsell-copy"><strong>Ongoing savings of at least 20%</strong></div></div>' +
      '<div class="ab-upsell-row"><div class="ab-upsell-icon">' +
      getCancelSvg() +
      '</div><div class="ab-upsell-copy"><strong>Change frequency and cancel anytime</strong></div></div>' +
      '<div class="ab-upsell-row"><div class="ab-upsell-icon">' +
      getShieldSvg() +
      '</div><div class="ab-upsell-copy"><strong>100% Money-back guarantee</strong></div></div>' +
      "</div>" +
      '<div class="ab-upsell-cta-wrap"><button type="button" class="ab-upsell-cta">YES PLEASE - Take 20% off my order today</button></div>' +
      '<div class="ab-upsell-footer"><span>12 bottles every 8 weeks for £119.88, Free delivery.</span><a  target="_blank" href="/customer-services/customer-terms-and-conditions-of-sale-and-use/terms-and-conditions">T&amp;Cs</a></div>'
    );
  }

  function triggerOriginalAccept(container) {
    var btn =
      container.querySelector(".wpUpsellAcceptBtn") ||
      document.querySelector(".wpUpsellAcceptBtn");

    if (btn) {
      btn.click();
    }
  }

  function buildVersion(container) {
    if (!container) return;

    if (
      !container.querySelector(".upsellHeadingcontainer") &&
      !container.querySelector(".wpUpsellAcceptBtn")
    ) {
      return;
    }

    if (subscriptionAlreadyInSummary()) {
      removeUpsell(container);
      return;
    }

    if (container.getAttribute(CONFIG.builtAttr) === "true") return;

    injectStyles();

    var sub = container.querySelector(".upsellSubHeadingcontainer span");
    if (sub) {
      sub.textContent = "When you start a wine subscription";
    }

    var holder = document.createElement("div");
    holder.className = "ab-upsell-v1-content";
    holder.innerHTML = buildInnerMarkup();

    var subWrap = container.querySelector(".upsellSubHeadingcontainer");

    if (subWrap) {
      subWrap.insertAdjacentElement("afterend", holder);
    } else {
      container.appendChild(holder);
    }

    container.setAttribute(CONFIG.builtAttr, "true");

    var closeBtn = holder.querySelector(".ab-upsell-close");
    var ctaBtn = holder.querySelector(".ab-upsell-cta");

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        removeUpsell(container);
      });
    }

    if (ctaBtn) {
      ctaBtn.addEventListener("click", function () {
        triggerOriginalAccept(container);

        setTimeout(function () {
          if (subscriptionAlreadyInSummary()) {
            removeUpsell(container);
          }
        }, 500);
      });
    }
  }

  function init() {
    var containers = document.querySelectorAll(CONFIG.rootSelector);

    for (var i = 0; i < containers.length; i++) {
      if (
        containers[i].querySelector(".upsellHeadingcontainer") ||
        containers[i].querySelector(".wpUpsellAcceptBtn")
      ) {
        buildVersion(containers[i]);
      }
    }
  }

  injectStyles();
  init();

  var observerTimeout = null;

  var observer = new MutationObserver(function () {
    if (observerTimeout) return;

    observerTimeout = setTimeout(function () {
      observerTimeout = null;
      init();
    }, 250);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();

// EVENTS

function elementReady(selector) {
  return new Promise(function (resolve) {
    var el = document.querySelector(selector);

    if (el) {
      resolve(el);
      return;
    }

    var observer = new MutationObserver(function () {
      var found = document.querySelector(selector);

      if (found) {
        resolve(found);
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function pushAdobeEvent(clickText) {
  window.adobeDataLayer = window.adobeDataLayer || [];

  window.adobeDataLayer.push({
    event: "targetClickEvent",
    eventData: {
      click: {
        clickLocation: "Conversio CRO",
        clickAction: "LT112.6 | Event Tracking",
        clickText: clickText,
      },
    },
  });
}

elementReady(".upsellSubHeadingcontainer").then(function () {
  pushAdobeEvent(
    "LT112.6 (Variation 1) | Subscribe and Save upsell is present in checkout (trigger event)",
  );
});

elementReady("body").then(function (main) {
  if (main.classList.contains("lt-112")) return;

  main.addEventListener("click", function (e) {
    if (
      e.target.closest('[data-cy="payCard"]') &&
      e.target.closest('[type="submit"]')
    ) {
      pushAdobeEvent("LT112.6 (Variation 1) | Clicks pay now CTA");
    }

    if (e.target.closest(".ab-upsell-close")) {
      pushAdobeEvent("LT112.6 (Variation 1) | Closes upsell block");
    }

    if (e.target.closest(".ab-upsell-cta")) {
      pushAdobeEvent("LT112.6 (Variation 1) | Adds subscription in checkout");
    }
  });

  main.classList.add("lt-112");
});

var snsInViewportEvent = false;

async function snsInViewport() {
  var sns = await elementReady(".upsellSubHeadingcontainer");

  var observer = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting === true && snsInViewportEvent === false) {
        pushAdobeEvent(
          "LT112.6 (Variation 1) | Checkout subscription visible in viewport",
        );
        snsInViewportEvent = true;
      }
    },
    {
      threshold: [1],
    },
  );

  observer.observe(sns);
}

snsInViewport();

var paymentViewportEvent = false;

async function paymentInViewport() {
  var payment = await elementReady("#payment-options");

  var observer = new IntersectionObserver(
    function (entries) {
      if (
        entries[0].isIntersecting === true &&
        paymentViewportEvent === false
      ) {
        pushAdobeEvent(
          "LT112.6 (Variation 1) | Payment details visible in viewport",
        );
        paymentViewportEvent = true;
      }
    },
    {
      threshold: [1],
    },
  );

  observer.observe(payment);
}

paymentInViewport();
