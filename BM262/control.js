// console.log("David Silva | BM262 control");

// BM262 | Control | Mobile (<= 833px): event tracking only, no changes to the page.
(function () {
  "use strict";

  const TEST_ID = "BM262";
  const MOBILE_MEDIA_QUERY = "(max-width: 833px)";
  // Cabin trains say "Confirm Cabin", British Pullman says "Confirm Table".
  const CONFIRM_TEXTS = ["Confirm Cabin", "Confirm Table"];

  // Prevent double injection.
  if (window.BM262_CONTROL_LOADED) {
    return;
  }
  window.BM262_CONTROL_LOADED = true;

  function log(...args) {
    // console.log("[" + TEST_ID + "]", ...args);
  }

  // Console log + dataLayer push for every event.
  function trackEvent(eventName, eventSegment, cabinType) {
    const eventData = {
      eventCategory: "Conversio CRO",
      eventAction: TEST_ID + " | Event Tracking",
      eventLabel: TEST_ID + " | (Control Original) | " + eventName,
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
  function isConfirmButton(button) {
    return (
      CONFIRM_TEXTS.indexOf(getCleanText(button)) !== -1 &&
      button.parentElement &&
      button.parentElement.classList.contains("max-lg:fixed")
    );
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

  let isJourneyDetailsShowing = false;

  // Fires only when Journey Details goes from hidden to showing (once per appearance).
  function checkJourneyDetails() {
    const isShowingNow =
      isMobileScreen() &&
      isCabinSelectionPage() &&
      Boolean(findJourneyDetailsButton());

    if (isShowingNow && !isJourneyDetailsShowing) {
      // 3. Customer Reaches "Journey Details" Step
      trackEvent("Customer Reaches 'Journey Details' Step", "BM262ECOI");
    }

    isJourneyDetailsShowing = isShowingNow;
  }

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
        "BM262ECOJ",
      );
      return;
    }

    if (isConfirmButton(button)) {
      // 2. Customer Clicks "Confirm Cabin" (or "Confirm Table")
      trackEvent("Customer Clicks '" + getCleanText(button) + "'", "BM262ECOH");
      return;
    }

    const cabinName = getSelectedCabinName(button);
    if (!cabinName) {
      return;
    }

    // 1. Customer Selects a Cabin
    trackEvent("Customer Selects a Cabin", "BM262ECOG", cabinName);
  }

  // Delegated + capture phase: survives Vue re-renders and runs before site handlers.
  document.addEventListener("click", handleClick, true);

  if (document.body) {
    watchJourneyDetails();
  } else {
    document.addEventListener("DOMContentLoaded", watchJourneyDetails);
  }

  log("Control loaded");
})();
