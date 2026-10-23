// console.log("David Silva | TS043 variation 1");

(function () {
  if (window.ts043Loaded) return;
  window.ts043Loaded = true;

  const PREFIX = "ts043";
  const TWO_COLUMNS_FROM = "1024px";
  const THREE_COLUMNS_FROM = "1100px";
  const PANEL_GAP = 5;
  const IMAGE_RATIO = "5 / 4";

  function trackEvent(name, letter) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "TS043 | Event Tracking",
        eventLabel: "TS043 | (Variation 1) | " + name,
        eventSegment: "TS043EV1" + letter,
      },
    });
  }

  function addStyles() {
    const grid = "." + PREFIX + "-grid";
    const card = grid + " > ." + PREFIX + "-card";
    const part = grid + " ." + PREFIX + "-";

    const css = [
      // The booking panel also shows on mobile, so the trigger is desktop only
      "." + PREFIX + "-trigger { display: none; }",

      "@media (min-width: " + TWO_COLUMNS_FROM + ") {",
      // Row gap is 0 because the cards share these rows; the space between cards is a margin instead
      grid +
        " { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 24px; row-gap: 0; }",
      // Each card takes 4 shared rows (image, title, middle, grey panel), so sections line up across a row
      card +
        " { display: grid; grid-row: span 4; grid-template-rows: subgrid; row-gap: 0; margin-bottom: 24px; border: 1px solid #938C85; box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25); }",

      part + "image { max-width: none; }",
      // Same shape for every image; "cover" trims tiny differences instead of stretching the photo
      part +
        "image img { width: 100%; height: auto; aspect-ratio: " +
        IMAGE_RATIO +
        "; object-fit: cover; object-position: center; }",
      part + "content { display: contents; }",
      part +
        "title-row { display: flex; flex-direction: row; align-items: flex-start; justify-content: space-between; gap: 16px; margin: 16px 24px 0; }",
      // Hugs the grey panel with a fixed gap; any extra row height goes above it instead
      part + "middle { align-self: end; margin: 0 24px 12px; }",
      // While any More details is open, neighbours keep their USPs under the title and the space goes below
      grid +
        ':has(button[aria-controls^="description_"][aria-expanded="true"]) .' +
        PREFIX +
        "-middle { align-self: start; }",

      part + "booking {",
      "  display: grid;",
      "  grid-template-columns: repeat(2, minmax(0, 1fr));",
      '  grid-template-areas: "price price" "times book" "arrive arrive";',
      "  gap: 16px 12px;",
      // Content sits at the bottom, so extra row height shows as space at the top of the grey panel
      "  align-content: end;",
      "  padding: 16px 24px 20px;",
      "  background: #FBFAFA;",
      "  position: relative;",
      "}",
      part + "unwrap { display: contents; }",
      part + "times-heading { display: none; }",
      // The site's own times block becomes the dropdown panel. "top" is set in JS (positionPanel)
      part + "times {",
      "  display: none;",
      "  position: absolute;",
      // Same as the booking panel's side padding, so the edges line up with the buttons
      "  left: 24px;",
      "  right: 24px;",
      "  max-height: 260px;",
      "  overflow-y: auto;",
      "  padding: 8px;",
      "  background: #fff;",
      "  border: 2px solid #101820;",
      "  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);",
      "}",
      // Just enough to sit above the other cards, but stay below the sticky header
      card + "." + PREFIX + "-open { position: relative; z-index: 1; }",
      card + "." + PREFIX + "-open ." + PREFIX + "-times { display: grid; }",
      card +
        "." +
        PREFIX +
        "-open ." +
        PREFIX +
        "-trigger svg:last-child { transform: rotate(180deg); }",
      part +
        "time-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }",
      part +
        "time-grid button { justify-content: center; min-width: 0; padding: 8px 6px; font-size: 16px; }",
      part + "time-grid button > span { margin-right: 6px; }",
      part + "price { grid-area: price; margin-bottom: 0; }",
      part + "price > div { padding-bottom: 0; border-bottom: 0; }",
      part + "book { grid-area: book; }",
      part +
        "book a { display: flex; align-items: center; justify-content: center; height: 56px; padding-top: 0; padding-bottom: 0; }",
      part +
        "trigger { grid-area: times; display: flex; align-items: center; gap: 8px; min-width: 0; height: 56px; padding: 0 12px; border: 2px solid #101820; background: #fff; color: #101820; cursor: pointer; }",
      part + "trigger svg { flex-shrink: 0; }",
      part +
        "trigger-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; text-transform: uppercase; font-size: 18px; }",
      part + "arrive { grid-area: arrive; margin: 0; text-align: center; }",
      "}",

      "@media (min-width: " + THREE_COLUMNS_FROM + ") {",
      grid + " { grid-template-columns: repeat(3, minmax(0, 1fr)); }",
      "}",
    ].join("\n");

    const style = document.createElement("style");
    style.id = PREFIX + "-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Each card has 2 Book Now links (desktop + mobile), so remove duplicates
  function getCards() {
    const bookLinks = document.querySelectorAll(
      'a[href*="/book/product-list"]',
    );
    const cards = [];

    bookLinks.forEach((link) => {
      const card = link.closest("li");
      if (card && !cards.includes(card)) cards.push(card);
    });

    return cards;
  }

  // The mobile Book Now link sits inside a ".lg:hidden" block, the desktop one doesn't
  function getDesktopBookLink(card) {
    const links = Array.from(
      card.querySelectorAll('a[href*="/book/product-list"]'),
    );
    return links.find((link) => !link.closest(".lg\\:hidden"));
  }

  function addPartClass(element, name) {
    if (element) element.classList.add(PREFIX + "-" + name);
  }

  function getTimeButtons(container) {
    return Array.from(container.querySelectorAll("button")).filter((button) =>
      /^\d{1,2}:\d{2}$/.test(button.textContent.trim()),
    );
  }

  // Smallest element holding every time (and the session headings on combo products)
  function findTimesBlock(desktopWrap) {
    const buttons = getTimeButtons(desktopWrap);
    if (!buttons.length) return null;

    const lastButton = buttons[buttons.length - 1];
    const firstItem = desktopWrap.querySelector("h6") || buttons[0];

    let block = firstItem.parentElement;
    while (!block.contains(lastButton)) block = block.parentElement;
    return block;
  }

  function findPriceRow(desktopWrap) {
    const bigPrice = desktopWrap.querySelector(".text-5xl");
    const row = bigPrice ? bigPrice.closest(".w-full") : null;
    return row && desktopWrap.contains(row) ? row : null;
  }

  // Flatten every wrapper between a part and the booking panel so it becomes a grid item
  function unwrapUpTo(element, booking) {
    if (!element) return;

    let wrapper = element.parentElement;
    while (wrapper && wrapper !== booking) {
      addPartClass(wrapper, "unwrap");
      wrapper = wrapper.parentElement;
    }
  }

  function createIcon(name) {
    return (
      '<svg aria-hidden="true" focusable="false" class="fill-current" width="24" height="24" viewBox="0 0 24 24">' +
      '<use href="/assets/icons/icons.svg#' +
      name +
      '"></use>' +
      "</svg>"
    );
  }

  function getSelectedTime(times) {
    const selected = getTimeButtons(times).find((button) =>
      button.classList.contains("bg-book-time"),
    );
    return selected ? selected.textContent.trim() : "";
  }

  function addTrigger(booking, times) {
    if (!times || booking.querySelector("." + PREFIX + "-trigger")) return;

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = PREFIX + "-trigger";
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML =
      createIcon("Clock") +
      '<span class="' +
      PREFIX +
      '-trigger-label font-booking-bar-title"></span>' +
      createIcon("ArrowDown");

    booking.appendChild(trigger);
  }

  // Only write when the text changes, otherwise the observer would loop forever
  function updateTriggerLabel(card) {
    const label = card.querySelector("." + PREFIX + "-trigger-label");
    const times = card.querySelector("." + PREFIX + "-times");
    if (!label || !times) return;

    const text = getSelectedTime(times) || "Available times";
    if (label.textContent !== text) label.textContent = text;
  }

  function markParts(card) {
    const title = card.querySelector("h3");
    const bookLink = getDesktopBookLink(card);
    if (!title || !bookLink) return;

    // Book Now wrapper > desktop wrapper > grey booking panel
    const bookWrap = bookLink.parentElement;
    const desktopWrap = bookWrap.parentElement;
    const booking = desktopWrap.parentElement;

    const heading = desktopWrap.querySelector("h2");
    const arrive = desktopWrap.querySelector("p");
    const times = findTimesBlock(desktopWrap);
    const price = findPriceRow(desktopWrap);

    addPartClass(card.children[0], "image");
    addPartClass(card.children[1], "content");
    addPartClass(title.parentElement, "title-row");
    // USPs + More details, the block right after the title row
    addPartClass(title.parentElement.nextElementSibling, "middle");

    addPartClass(booking, "booking");
    addPartClass(heading, "times-heading");
    addPartClass(arrive, "arrive");
    addPartClass(times, "times");
    addPartClass(price, "price");
    addPartClass(bookWrap, "book");

    // Combo products have one grid per session, so mark each one
    if (times)
      getTimeButtons(times).forEach((button) =>
        addPartClass(button.parentElement, "time-grid"),
      );

    [heading, arrive, times, price, bookWrap].forEach((part) =>
      unwrapUpTo(part, booking),
    );

    addTrigger(booking, times);
    updateTriggerLabel(card);
  }

  function setUpCards() {
    if (!location.pathname.includes("/booking")) return;

    const cards = getCards();
    if (!cards.length) return;

    document.body.classList.add(PREFIX);
    cards[0].parentElement.classList.add(PREFIX + "-grid");

    cards.forEach((card) => {
      // Re-mark every time in case React redrew part of the card
      markParts(card);
      card.classList.add(PREFIX + "-card");
    });
  }

  function closeAllPanels() {
    document.querySelectorAll("." + PREFIX + "-open").forEach((card) => {
      card.classList.remove(PREFIX + "-open");
      const trigger = card.querySelector("." + PREFIX + "-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  // The grey booking panel is position: relative, so offsetTop is measured from its top edge
  function positionPanel(card) {
    const trigger = card.querySelector("." + PREFIX + "-trigger");
    const times = card.querySelector("." + PREFIX + "-times");
    if (!trigger || !times) return;

    times.style.top =
      trigger.offsetTop + trigger.offsetHeight + PANEL_GAP + "px";
  }

  function togglePanel(card) {
    const wasOpen = card.classList.contains(PREFIX + "-open");
    closeAllPanels();
    if (wasOpen) return;

    card.classList.add(PREFIX + "-open");
    card
      .querySelector("." + PREFIX + "-trigger")
      .setAttribute("aria-expanded", "true");
    positionPanel(card);
  }

  // One listener for every card, so it still works after React redraws them
  function handleClick(event) {
    // React's own handler selects the time; we just close the panel and show the choice
    const timeButton = event.target.closest("." + PREFIX + "-time-grid button");
    if (timeButton) {
      const card = timeButton.closest("." + PREFIX + "-card");
      closeAllPanels();
      // Wait for React to finish updating so we read the new selection, not the old one
      setTimeout(() => updateTriggerLabel(card), 0);
      return;
    }

    const trigger = event.target.closest("." + PREFIX + "-trigger");
    if (trigger) {
      togglePanel(trigger.closest("." + PREFIX + "-card"));
      return;
    }

    if (event.target.closest("." + PREFIX + "-times")) return;
    closeAllPanels();
  }

  // Runs after handleClick (added second), so a just-opened panel already has the open class
  function trackClick(event) {
    const card = event.target.closest("." + PREFIX + "-card");
    if (!card) return;

    if (event.target.closest("." + PREFIX + "-trigger")) {
      // 1. Time Dropdown Click
      if (card.classList.contains(PREFIX + "-open")) {
        trackEvent("Time Dropdown Click", "G");
        // console.log("Time Dropdown Click");
      }
    } else if (event.target.closest("." + PREFIX + "-time-grid button")) {
      // 2. Time Slot Click
      trackEvent("Time Slot Click", "H");
      // console.log("Time Slot Click");
    } else if (event.target.closest("." + PREFIX + "-book a")) {
      // 3. Book Now Click
      trackEvent("Book Now Click", "I");
      // console.log("Book Now Click");
    } else if (event.target.closest('button[aria-controls^="description_"]')) {
      // 4. More Details Click
      trackEvent("More Details Click", "J");
      // console.log("More Details Click");
    } else if (event.target.closest("." + PREFIX + "-price button")) {
      // 5. Discount Code Copy Click
      trackEvent("Discount Code Copy Click", "K");
      // console.log("Discount Code Copy Click");
    }
  }

  addStyles();
  setUpCards();

  document.addEventListener("click", handleClick);
  document.addEventListener("click", trackClick);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllPanels();
  });

  // The price row can wrap at a new width, which moves the trigger down
  window.addEventListener("resize", () => {
    const openCard = document.querySelector("." + PREFIX + "-open");
    if (openCard) positionPanel(openCard);
  });

  // React redraws the results (e.g. new search), so re-run when elements change
  let debounceTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(setUpCards, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
