// console.log("David Silva | WN009 control");

function waitForDataLayer(callback) {
  let checkInterval = setInterval(() => {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      clearInterval(checkInterval);
      callback();
    }
  }, 100);
}

(function () {
  "use strict";

  var dl = (window.dataLayer = window.dataLayer || []);

  function isConsentUpdate(args) {
    return (
      args &&
      args.length >= 3 &&
      args[0] === "consent" &&
      args[1] === "update" &&
      args[2] &&
      args[2].analytics_storage === "granted"
    );
  }

  function handleConsentUpdate(obj) {
    waitForDataLayer(() => {
      window.dataLayer.push({
        event: "conversioExperience",
        conversio: {
          experience_category: "Conversio Experience",
          experience_action: "WN009 | Break Card CTA Copy",
          experience_label: "WN009 | Control Original",
          experience_segment: "WN009.XCO",
        },
      });
    });
  }

  // 1. Check historical pushes
  for (var i = 0; i < dl.length; i++) {
    if (isConsentUpdate(dl[i])) {
      handleConsentUpdate(dl[i][2]);
      return;
    }
  }

  // 2. Listen for future pushes
  var originalPush = dl.push;

  dl.push = function () {
    var args = Array.prototype.slice.call(arguments);

    for (var j = 0; j < args.length; j++) {
      if (isConsentUpdate(args[j])) {
        handleConsentUpdate(args[j][2]);
      }
    }

    return originalPush.apply(dl, arguments);
  };
})();

(function () {
  function isTargetPage() {
    const path = window.location.pathname;
    return path.indexOf("/hotels/") === 0 || path.indexOf("/breaks/") === 0;
  }

  function debounce(fn, wait) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  const observedCards = new WeakSet();

  const impressionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // 2 Break Card Impression
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN009 | Event Tracking",
              event_label: "WN009 | (Control Original) | Break Card Impression",
              event_segment: "WN009ECOH",
            },
          });
          //   debugShow("Break Card Impression");
          impressionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0 },
  );

  function observeCardImpressions() {
    if (!isTargetPage()) return;
    document.querySelectorAll(".breakDetailItem").forEach(function (card) {
      if (observedCards.has(card)) return;
      observedCards.add(card);
      impressionObserver.observe(card);
    });
  }

  const debouncedUpdate = debounce(function () {
    observeCardImpressions();
  }, 300);

  observeCardImpressions();

  const observer = new MutationObserver(function (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length) {
        debouncedUpdate();
        return;
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function debugShow(label) {
    var div = document.createElement("div");
    div.style.cssText =
      "position:fixed;top:0;left:0;background:red;color:white;padding:20px;z-index:99999;font-size:16px;";
    div.textContent = label + " | FIRED!";
    document.body.appendChild(div);
    setTimeout(function () {
      div.remove();
    }, 2000);
  }

  let lastHubPath = null;
  let lastBreaksPath = null;

  function checkHubLanding(path) {
    if (path.indexOf("/hotels/") === 0 && path !== lastHubPath) {
      lastHubPath = path;
      // 5 User lands on a Hotel Location Hub Page
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN009 | Event Tracking",
          event_label:
            "WN009 | (Control Original) | User lands on a Hotel Location Hub Page",
          event_segment: "WN009ECOK",
        },
      });
      //   debugShow("User lands on a Hotel Location Hub Page");
    }
  }

  function checkBreaksLanding(path) {
    if (path.indexOf("/breaks/") === 0 && path !== lastBreaksPath) {
      lastBreaksPath = path;
      // 6 User lands on a Hotel Breaks Card Page
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN009 | Event Tracking",
          event_label:
            "WN009 | (Control Original) | User lands on a Hotel Breaks Card Page",
          event_segment: "WN009ECOL",
        },
      });
      //   debugShow("User lands on a Hotel Breaks Card Page");
    }
  }

  function interceptHistoryMethod(method) {
    const original = history[method];
    history[method] = function (state, title, url) {
      if (url) {
        const path = new URL(url, window.location.origin).pathname;
        checkHubLanding(path);
        checkBreaksLanding(path);
      }
      return original.apply(this, arguments);
    };
  }

  function trackEvents() {
    if (!document.querySelector("body").classList.contains("WN009")) {
      document.querySelector("body").classList.add("WN009");

      document.addEventListener("click", (e) => {
        if (!isTargetPage()) return;

        if (e.target.closest(".breakDetailItemCta")) {
          // 1 Break Card CTA Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN009 | Event Tracking",
              event_label: "WN009 | (Control Original) | Break Card CTA Click",
              event_segment: "WN009ECOG",
            },
          });
          //   debugShow("Break Card CTA Click");
        }

        if (e.target.closest(".pageHeaderCta--book")) {
          // 3 Header BOOK CTA Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN009 | Event Tracking",
              event_label: "WN009 | (Control Original) | Header BOOK CTA Click",
              event_segment: "WN009ECOI",
            },
          });
          //   debugShow("Header BOOK CTA Click");
        }

        if (e.target.closest(".carouselButton")) {
          // 4 Break Image Carousel Arrow Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN009 | Event Tracking",
              event_label:
                "WN009 | (Control Original) | Break Image Carousel Arrow Click",
              event_segment: "WN009ECOJ",
            },
          });
          //   debugShow("Break Image Carousel Arrow Click");
        }
      });

      interceptHistoryMethod("pushState");
      interceptHistoryMethod("replaceState");
      window.addEventListener("popstate", function () {
        checkHubLanding(window.location.pathname);
        checkBreaksLanding(window.location.pathname);
      });

      checkHubLanding(window.location.pathname);
      checkBreaksLanding(window.location.pathname);
    }
  }

  trackEvents();
})();
