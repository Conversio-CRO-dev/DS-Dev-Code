// console.log("David Silva | WN010 control");

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
          experience_action:
            "WN010 | Support Hotel Exploration at Room Selection Step",
          experience_label: "WN010 | Control Original",
          experience_segment: "WN010.XCO",
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
  const BACK_COOKIE_NAME = "cro_back_url";
  const FOUR_HOURS_IN_SECONDS = 60 * 60 * 4;
  const TRACKING_PARAM_PATTERN =
    /^(utm_|_ga|_gl|_gcl|gclid$|gclsrc$|dclid$|fbclid$|msclkid$|ttclid$|twclid$|mc_(cid|eid)$)/i;

  function getCookie(name) {
    const match = document.cookie.match("(?:^|; )" + name + "=([^;]*)");
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setBackCookie(url) {
    document.cookie =
      BACK_COOKIE_NAME +
      "=" +
      encodeURIComponent(url) +
      "; domain=.warnerhotels.co.uk; path=/; max-age=" +
      FOUR_HOURS_IN_SECONDS +
      "; secure; samesite=lax";
  }

  function buildCleanUrl() {
    const params = new URLSearchParams(window.location.search);
    Array.from(params.keys()).forEach(function (key) {
      if (TRACKING_PARAM_PATTERN.test(key)) params.delete(key);
    });
    const query = params.toString();
    return (
      window.location.origin +
      window.location.pathname +
      (query ? "?" + query : "") +
      window.location.hash
    );
  }

  function initEntryCapture() {
    document.addEventListener(
      "click",
      function (event) {
        const link =
          event.target.closest &&
          event.target.closest('a[href*="book.warnerhotels.co.uk"]');
        if (!link) return;
        setBackCookie(buildCleanUrl());
      },
      true,
    );
  }

  function debugShow(label) {
    const div = document.createElement("div");
    div.style.cssText =
      "position:fixed;top:0;left:0;background:red;color:white;padding:20px;z-index:99999;font-size:16px;";
    div.textContent = label + " | FIRED!";
    document.body.appendChild(div);
    setTimeout(function () {
      div.remove();
    }, 2000);
  }

  function trackEvents() {
    if (document.body.classList.contains("WN010")) return;
    document.body.classList.add("WN010");

    document.addEventListener(
      "click",
      function (event) {
        const breakCta = event.target.closest(".breakDetailItemCta");
        if (breakCta) {
          // 1. User Lands In Choose Room from Breaks or Hotel Page
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN010 | Event Tracking",
              event_label:
                "WN010 | (Control Original) | User Lands In Choose Room from Breaks or Hotel Page",
              event_segment: "WN010ECOQ",
            },
          });
          //   debugShow("User Lands In Choose Room from Breaks or Hotel Page");
          return;
        }

        const selectButton = event.target.closest(".product__book");
        if (selectButton && getActiveStepLabel() === "Choose room") {
          // 6. Choose Room Card Select CTA Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN010 | Event Tracking",
              event_label:
                "WN010 | (Control Original) | Choose Room Card Select CTA Click",
              event_segment: "WN010ECOK",
            },
          });

          //   debugShow("Choose Room Card Select CTA Click");
          return;
        }

        const includedLink = event.target.closest(
          'a.l-link[title*="included in the room"]',
        );
        if (
          includedLink &&
          includedLink.closest(".product__content") &&
          getActiveStepLabel() === "Choose room"
        ) {
          // 7. What's included in the room Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN010 | Event Tracking",
              event_label:
                "WN010 | (Control Original) | Whats included in the room Click",
              event_segment: "WN010ECOL",
            },
          });

          //   debugShow("What's included in the room Click");
        }

        const itineraryButton = event.target.closest("button.l-link");
        if (
          itineraryButton &&
          itineraryButton.textContent.trim() === "Break Itinerary" &&
          itineraryButton.closest("#summaryPanel")
        ) {
          // 8. Break Itinerary Click
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN010 | Event Tracking",
              event_label: "WN010 | (Control Original) | Break Itinerary Click",
              event_segment: "WN010ECOM",
            },
          });

          //   debugShow("Break Itinerary Click");
        }
      },
      true,
    );
  }

  function getActiveStepLabel() {
    const activeStep = document.querySelector(".reservations__step.is-active");
    const span = activeStep && activeStep.querySelector("span");
    return span ? span.textContent.trim() : null;
  }

  function initProgressionStepTracking() {
    let currentStep = getActiveStepLabel();

    new MutationObserver(function () {
      const activeStep = getActiveStepLabel();
      if (!activeStep || activeStep === currentStep) return;
      currentStep = activeStep;
      // 4. Booking funnel Progression Step Click (any)
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN010 | Event Tracking",
          event_label:
            "WN010 | (Control Original) | Booking funnel Progression Step Click (any)",
          event_segment: "WN010ECOI",
        },
      });
      //   debugShow("Booking funnel Progression Step Click");

      // 5. Booking Funnel Progression Step Click (name dynamic)
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN010 | Event Tracking",
          event_label:
            "WN010 | (Control Original) | Booking Funnel Progression Step Click " +
            activeStep,
          event_segment: "WN010ECOJ",
        },
      });
      //   debugShow("Booking Funnel Progression Step Click: " + activeStep);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function initTreatYourselfPageView() {
    let hasSeenStep = false;

    function checkStep() {
      const isOnStep = getActiveStepLabel() === "Treat yourself";
      if (isOnStep && !hasSeenStep) {
        hasSeenStep = true;
        // 9. User sees Treat Your Self Step Page
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN010 | Event Tracking",
            event_label:
              "WN010 | (Control Original) | User sees Treat Your Self Step Page",
            event_segment: "WN010ECON",
          },
        });

        // debugShow("User sees Treat Your Self Step Page");
      } else if (!isOnStep) {
        hasSeenStep = false;
      }
    }

    checkStep();
    new MutationObserver(checkStep).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function initCheckoutPageView() {
    let hasSeenStep = false;

    function checkStep() {
      const isOnStep = getActiveStepLabel() === "Checkout";
      if (isOnStep && !hasSeenStep) {
        hasSeenStep = true;
        // 10. User sees Checkout Step Page
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN010 | Event Tracking",
            event_label:
              "WN010 | (Control Original) | User sees Checkout Step Page",
            event_segment: "WN010ECOO",
          },
        });

        // debugShow("User sees Checkout Step Page");
      } else if (!isOnStep) {
        hasSeenStep = false;
      }
    }

    checkStep();
    new MutationObserver(checkStep).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function fireBackNavigationEvent() {
    if (!getCookie(BACK_COOKIE_NAME)) return;
    // 3. Browser/Device Back Navigation Used
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        event_category: "Conversio CRO",
        event_action: "WN010 | Event Tracking",
        event_label:
          "WN010 | (Control Original) | Browser/Device Back Navigation Used",
        event_segment: "WN010ECOH",
      },
    });
    // debugShow("Browser/Device Back Navigation Used");
  }

  function initBackNavigationDetection() {
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry && navEntry.type === "back_forward") {
      fireBackNavigationEvent();
    }

    window.addEventListener("pageshow", function (event) {
      if (!event.persisted) return;
      fireBackNavigationEvent();
    });
  }

  if (window.location.hostname === "book.warnerhotels.co.uk") {
    trackEvents();
    initProgressionStepTracking();
    initTreatYourselfPageView();
    initCheckoutPageView();
  } else if (window.location.hostname === "www.warnerhotels.co.uk") {
    initEntryCapture();
    trackEvents();
    initBackNavigationDetection();
  }
})();
