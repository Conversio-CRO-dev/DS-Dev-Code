// console.log("David Silva | TS044 control");

(function () {
  if (window.ts044ControlLoaded) return;
  window.ts044ControlLoaded = true;

  const TIME_PATTERN = /^\d{1,2}:\d{2}/;

  // A results card is an <li> that holds a Book Now link
  function getCard(element) {
    const card = element.closest("li");
    return card && card.querySelector('a[href*="/book/product-list"]')
      ? card
      : null;
  }

  function getExperienceName(card) {
    const title = card.querySelector("h3");
    return title ? title.textContent.replace(/\s+/g, " ").trim() : "";
  }

  // Desktop grid + combo swiper = buttons in the card. The mobile dropdown options
  // (role="option") can open outside the card, so they're checked anywhere on the page
  function isTimeSlot(target) {
    const option = target.closest('[role="option"]');
    if (option) return TIME_PATTERN.test(option.textContent.trim());

    const button = target.closest("button");
    return (
      !!button &&
      !!getCard(button) &&
      TIME_PATTERN.test(button.textContent.trim())
    );
  }

  // One listener for every card (desktop and mobile), so it still works after React redraws them
  function trackClick(event) {
    if (!location.pathname.includes("/booking")) return;

    window.dataLayer = window.dataLayer || [];

    if (isTimeSlot(event.target)) {
      // 2. Time Slot Click
      // console.log("Time Slot Click");
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "TS044 | Event Tracking",
          eventLabel: "TS044 | (Control Original) | Time Slot Click",
          eventSegment: "TS044ECOH",
        },
      });
      return;
    }

    const card = getCard(event.target);
    if (!card) return;

    if (event.target.closest('a[href*="/book/product-list"]')) {
      // 1. Book Now CTA Click
      // console.log("Book Now CTA Click", getExperienceName(card));
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "TS044 | Event Tracking",
          eventLabel: "TS044 | (Control Original) | Book Now CTA Click",
          eventSegment: "TS044ECOG",
          experienceName: getExperienceName(card),
        },
      });
    } else if (event.target.closest('button[aria-controls^="description_"]')) {
      // 3. More Details Click
      // console.log("More Details Click");
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "TS044 | Event Tracking",
          eventLabel: "TS044 | (Control Original) | More Details Click",
          eventSegment: "TS044ECOI",
        },
      });
    } else if (event.target.closest("button.bg-cloudGrey")) {
      // 4. Promo Code Copy Click
      // console.log("Promo Code Copy Click");
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "TS044 | Event Tracking",
          eventLabel: "TS044 | (Control Original) | Promo Code Copy Click",
          eventSegment: "TS044ECOJ",
        },
      });
    }
  }

  // Capture phase, so a React handler stopping the click can't hide it from us
  document.addEventListener("click", trackClick, true);
})();
