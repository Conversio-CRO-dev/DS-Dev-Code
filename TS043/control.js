console.log("David Silva | TS043 control");

(function () {
  if (window.ts043ControlLoaded) return;
  window.ts043ControlLoaded = true;

  function trackEvent(name, letter) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "TS043 | Event Tracking",
        eventLabel: "TS043 | (Control Original) | " + name,
        eventSegment: "TS043ECO" + letter,
      },
    });
  }

  // A results card is an <li> that holds a Book Now link
  function getCard(element) {
    const card = element.closest("li");
    return card && card.querySelector('a[href*="/book/product-list"]')
      ? card
      : null;
  }

  function isTimeButton(button) {
    return /^\d{1,2}:\d{2}$/.test(button.textContent.trim());
  }

  // One listener for every card, so it still works after React redraws them.
  // No "Time Dropdown Click" (G): desktop Control has no dropdown, as per the brief
  function trackClick(event) {
    if (!getCard(event.target)) return;

    const button = event.target.closest("button");

    if (button && isTimeButton(button)) {
      // 2. Time Slot Click
      trackEvent("Time Slot Click", "H");
      console.log("Time Slot Click");
    } else if (event.target.closest('a[href*="/book/product-list"]')) {
      // 3. Book Now Click
      trackEvent("Book Now Click", "I");
      console.log("Book Now Click");
    } else if (event.target.closest('button[aria-controls^="description_"]')) {
      // 4. More Details Click
      trackEvent("More Details Click", "J");
      console.log("More Details Click");
    } else if (event.target.closest("button.bg-cloudGrey")) {
      // 5. Discount Code Copy Click
      trackEvent("Discount Code Copy Click", "K");
      console.log("Discount Code Copy Click");
    }
  }

  document.addEventListener("click", trackClick);
})();
