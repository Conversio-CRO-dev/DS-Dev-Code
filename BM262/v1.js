// console.log("David Silva | BM262 variation 1");

// BM262 | V1 | Mobile (<= 833px): selecting a cabin skips the "Confirm Cabin" / "Confirm Table" step.
(function () {
  "use strict";

  const TEST_ID = "BM262";
  const WAIT_TIMEOUT_MS = 5000;
  const MOBILE_MEDIA_QUERY = "(max-width: 833px)";
  // Cabin trains say "Confirm Cabin", British Pullman says "Confirm Table".
  const CONFIRM_TEXTS = ["Confirm Cabin", "Confirm Table"];

  // Prevent double injection.
  if (window.BM262_V1_LOADED) {
    return;
  }
  window.BM262_V1_LOADED = true;

  function log(...args) {
    // console.log("[" + TEST_ID + "]", ...args);
  }

  // Console log + dataLayer push for every event.
  function trackEvent(eventName, eventSegment, cabinType) {
    const eventData = {
      eventCategory: "Conversio CRO",
      eventAction: TEST_ID + " | Event Tracking",
      eventLabel: TEST_ID + " | (Variation 1) | " + eventName,
      eventSegment: eventSegment,
    };

    if (cabinType) {
      eventData.cabinType = cabinType; // field name to be confirmed
    }

    log("EVENT:", eventData);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: eventData,
    });
  }

  function getCleanText(element) {
    return (element.textContent || "").replace(/\s+/g, " ").trim();
  }

  function isMobileScreen() {
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
  }

  function isCabinSelectionPage() {
    return window.location.pathname.indexOf("/booking/select-cabin") !== -1;
  }

  // Walk up to the cabin card. Capped so we never reach another card's <h3>.
  function findCabinHeading(button) {
    const MAX_LEVELS = 6;
    let parent = button.parentElement;

    for (let i = 0; i < MAX_LEVELS && parent; i++) {
      const heading = parent.querySelector("h3");
      if (heading) {
        return heading;
      }
      parent = parent.parentElement;
    }

    return null;
  }

  // Button text must be exactly "Select " + its own card's cabin name.
  function getSelectedCabinName(button) {
    const heading = findCabinHeading(button);
    if (!heading) {
      return null;
    }

    const cabinName = getCleanText(heading);
    const buttonText = getCleanText(button);

    if (buttonText !== "Select " + cabinName) {
      return null;
    }

    return cabinName;
  }

  // "Continue to Passenger Details" shares the same classes but is not in the fixed bar.
  function findConfirmButton() {
    const buttons = document.querySelectorAll("button");

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const isConfirmText = CONFIRM_TEXTS.indexOf(getCleanText(button)) !== -1;
      const isInBottomBar =
        button.parentElement &&
        button.parentElement.classList.contains("max-lg:fixed");

      if (isConfirmText && isInBottomBar) {
        return button;
      }
    }

    return null;
  }

  // Journey Details CTAs: "Continue to Passenger Details" or "Proceed to choose Cabin 2" (3, ...).
  function findJourneyDetailsButton() {
    const buttons = document.querySelectorAll("button");

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = getCleanText(button);
      const isJourneyDetailsText =
        text === "Continue to Passenger Details" ||
        text.indexOf("Proceed to choose Cabin ") === 0;
      const isInSummary =
        button.parentElement &&
        button.parentElement.classList.contains("order-last");

      if (isJourneyDetailsText && isInSummary) {
        return button;
      }
    }

    return null;
  }

  function isContinueButton(button) {
    return (
      getCleanText(button) === "Continue to Passenger Details" &&
      button.parentElement &&
      button.parentElement.classList.contains("order-last")
    );
  }

  function isCabinMarkedSelected(cabinName) {
    const buttons = document.querySelectorAll("button");

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      if (getCleanText(button) !== "Selected") {
        continue;
      }

      const heading = findCabinHeading(button);
      if (heading && getCleanText(heading) === cabinName) {
        return true;
      }
    }

    return false;
  }

  const HIDE_CLASS = "bm262-auto-confirming";
  const STYLE_ID = "bm262-styles";

  // "\\:" escapes the colon in the Tailwind class "max-lg:fixed".
  const STYLES =
    "html." +
    HIDE_CLASS +
    " .max-lg\\:fixed:has(> .btn-main-cta) {" +
    "  display: none !important;" +
    "}";

  function addStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function hideConfirmBar() {
    document.documentElement.classList.add(HIDE_CLASS);
  }

  function showConfirmBar() {
    document.documentElement.classList.remove(HIDE_CLASS);
  }

  let activeWait = null;

  function stopWaiting() {
    if (!activeWait) {
      return;
    }

    activeWait.observer.disconnect();
    clearTimeout(activeWait.timeoutId);
    activeWait = null;
  }

  // Calls onReady() once isReady() is true, or onTimeout() after WAIT_TIMEOUT_MS.
  function waitFor(isReady, onReady, onTimeout) {
    stopWaiting();

    if (isReady()) {
      onReady();
      return;
    }

    const observer = new MutationObserver(function () {
      if (isReady()) {
        // Stop first: onReady() changes the DOM and would re-trigger the observer.
        stopWaiting();
        onReady();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const timeoutId = setTimeout(function () {
      stopWaiting();
      onTimeout();
    }, WAIT_TIMEOUT_MS);

    activeWait = { observer: observer, timeoutId: timeoutId };
  }

  function isConfirmReady(cabinName) {
    const confirmButton = findConfirmButton();
    if (!confirmButton || confirmButton.disabled) {
      return false;
    }
    return isCabinMarkedSelected(cabinName);
  }

  function autoConfirm(cabinName) {
    waitFor(
      function () {
        return isConfirmReady(cabinName);
      },
      function () {
        clickConfirm(cabinName);
      },
      function () {
        showConfirmBar();
        console.warn("[" + TEST_ID + "] Timed out waiting for Confirm button", {
          cabinName: cabinName,
          confirmButtonFound: Boolean(findConfirmButton()),
          cabinMarkedSelected: isCabinMarkedSelected(cabinName),
        });
      },
    );
  }

  function clickConfirm(cabinName) {
    // Screen may have been resized or rotated since the tap.
    if (!isMobileScreen()) {
      showConfirmBar();
      log("Screen is wider than 833px, not clicking Confirm");
      return;
    }

    findConfirmButton().click();
    log("Confirm clicked automatically for:", cabinName);

    // Keep the bar hidden until the site has moved on to Journey Details.
    waitFor(
      function () {
        return !findConfirmButton();
      },
      function () {
        showConfirmBar();
        log("Journey Details shown");
      },
      function () {
        showConfirmBar();
        console.warn(
          "[" + TEST_ID + "] Confirm button still on page after click",
        );
      },
    );
  }

  let isJourneyDetailsShowing = false;

  // Fires only when Journey Details goes from hidden to showing (once per appearance).
  function checkJourneyDetails() {
    const isShowingNow =
      isMobileScreen() &&
      isCabinSelectionPage() &&
      Boolean(findJourneyDetailsButton());

    if (isShowingNow && !isJourneyDetailsShowing) {
      // 3. Customer Reaches "Journey Details" Step
      trackEvent("Customer Reaches 'Journey Details' Step", "BM262EV1I");
    }

    isJourneyDetailsShowing = isShowingNow;
  }

  // Separate from waitFor(), which only runs one wait at a time.
  function watchJourneyDetails() {
    checkJourneyDetails();

    const observer = new MutationObserver(checkJourneyDetails);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function handleClick(event) {
    if (!isMobileScreen() || !isCabinSelectionPage()) {
      return;
    }

    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    if (isContinueButton(button)) {
      // 4. Customer Clicks "Continue to Passenger Details"
      trackEvent(
        "Customer Clicks 'Continue to Passenger Details'",
        "BM262EV1J",
      );
      return;
    }

    const cabinName = getSelectedCabinName(button);
    if (!cabinName) {
      return;
    }

    log("Cabin selected:", cabinName);
    // 1. Customer Selects a Cabin
    trackEvent("Customer Selects a Cabin", "BM262EV1G", cabinName);

    // Hide before the site renders the bar, so it never flashes.
    hideConfirmBar();

    // We run in the capture phase (before the site), so let the site handle the tap first.
    setTimeout(function () {
      autoConfirm(cabinName);
    }, 0);
  }

  addStyles();

  // Delegated + capture phase: survives Vue re-renders and runs before site handlers.
  document.addEventListener("click", handleClick, true);

  if (document.body) {
    watchJourneyDetails();
  } else {
    document.addEventListener("DOMContentLoaded", watchJourneyDetails);
  }

  log("Variant 1 loaded");
})();
