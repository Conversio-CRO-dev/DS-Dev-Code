// console.log("David Silva | TS044 variation 1");

(function () {
  if (window.ts044Loaded) return;
  window.ts044Loaded = true;

  const PREFIX = "ts044";
  const NOTE_TEXT = "View and select available times at the next step";

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

  function getBookLinks(card) {
    const links = Array.from(
      card.querySelectorAll('a[href*="/book/product-list"]'),
    );
    return {
      // The mobile Book Now link sits inside a ".lg:hidden" block, the desktop one doesn't
      desktop: links.find((link) => !link.closest(".lg\\:hidden")),
      mobile: links.find((link) => link.closest(".lg\\:hidden")),
    };
  }

  function addPartClass(element, name) {
    if (element) element.classList.add(PREFIX + "-" + name);
  }

  function getTimeButtons(container) {
    return Array.from(container.querySelectorAll("button")).filter((button) =>
      /^\d{1,2}:\d{2}$/.test(button.textContent.trim()),
    );
  }

  // Our own copy, so React can't overwrite it when it redraws its text
  function addNote(parent, type) {
    if (!parent || parent.querySelector(":scope > ." + PREFIX + "-note"))
      return;

    const note = document.createElement("p");
    note.className = PREFIX + "-note " + PREFIX + "-note--" + type;
    note.textContent = NOTE_TEXT;
    parent.appendChild(note);
  }

  // Price wrapper > row > [code column, price column]
  function markPrice(desktopWrap) {
    const bigPrice = desktopWrap.querySelector(".text-5xl");
    const wrapper = bigPrice ? bigPrice.closest(".w-full") : null;
    if (
      !wrapper ||
      !desktopWrap.contains(wrapper) ||
      !wrapper.firstElementChild
    )
      return;

    const row = wrapper.firstElementChild;
    addPartClass(wrapper, "price");
    addPartClass(row, "price-row");

    Array.from(row.children).forEach((column) => {
      if (column.contains(bigPrice)) {
        addPartClass(column, "amount");
        setSavePercent(column);
      } else if (column.querySelector(".bg-cloudGrey")) {
        addPartClass(column, "code");
      }
    });
  }

  // "10% OFF" / "20% OFF" (GET20 in Scotland) feeds the CSS "Save X% Online" text
  function setSavePercent(amount) {
    const offText = amount.querySelector(".text-primary");
    const match = offText ? offText.textContent.match(/\d+%/) : null;
    // Only write when it changes, otherwise the observer would loop forever
    if (match && amount.getAttribute("data-ts044-save") !== match[0]) {
      amount.setAttribute("data-ts044-save", match[0]);
    }
  }

  // Smallest element holding every time (and the session headers on combo products)
  function findTimesBlock(desktopWrap) {
    const buttons = getTimeButtons(desktopWrap);
    if (!buttons.length) return null;

    const lastButton = buttons[buttons.length - 1];
    const firstItem = desktopWrap.querySelector("h6") || buttons[0];

    let block = firstItem.parentElement;
    while (!block.contains(lastButton)) block = block.parentElement;

    // Never hide the price or Book Now
    return block.querySelector(".text-5xl, a") ? null : block;
  }

  function markDesktop(bookLink) {
    if (!bookLink) return;

    // Book Now wrapper > desktop wrapper > grey booking panel
    const bookWrap = bookLink.parentElement;
    const desktopWrap = bookWrap.parentElement;
    const heading = desktopWrap.querySelector("h2");

    // Heading + "arrive 40 minutes" text share one wrapper
    if (heading) addPartClass(heading.parentElement, "intro");

    addPartClass(findTimesBlock(desktopWrap), "times");

    markPrice(desktopWrap);
    addPartClass(desktopWrap.parentElement, "panel");
    addPartClass(desktopWrap, "desktop");
    addPartClass(bookWrap, "book");
    addNote(desktopWrap, "desktop");
  }

  function markMobile(card, bookLink) {
    if (!bookLink) return;

    // Book Now column > row that also holds the "Available times" dropdown column
    const bookColumn = bookLink.parentElement;
    const row = bookColumn.parentElement;

    Array.from(row.children).forEach((column) => {
      if (column !== bookColumn) addPartClass(column, "mobile-times");
    });
    addPartClass(row, "mobile-row");
    addPartClass(bookColumn, "mobile-book");

    const arrive = Array.from(card.children).find(
      // 40 minutes for karting, 15 for laser, so match any number
      (child) =>
        /arrive \d+ minutes/i.test(child.textContent) &&
        !child.contains(bookLink),
    );
    addPartClass(arrive, "mobile-arrive");
    addNote(card, "mobile");
  }

  // Image box, middle column (title, USPs, More details) and the description inside it
  function markLayout(card) {
    const image = card.querySelector("img");
    const title = card.querySelector("h3");
    const description = card.querySelector('[id^="description_"]');
    if (!image || !title) return;

    addPartClass(image.parentElement, "image");
    addPartClass(title.parentElement, "title-row");
    addPartClass(title.parentElement.parentElement, "content");
    addPartClass(description, "description");
    if (description) addPartClass(description.parentElement, "details");
  }

  function setUpCards() {
    if (!location.pathname.includes("/booking")) return;

    const cards = getCards();
    if (!cards.length) return;

    document.body.classList.add(PREFIX);

    cards.forEach((card) => {
      const links = getBookLinks(card);
      // Re-mark every time in case React redrew part of the card
      markLayout(card);
      markDesktop(links.desktop);
      markMobile(card, links.mobile);
      card.classList.add(PREFIX + "-card");
    });
  }

  function getExperienceName(card) {
    const title = card.querySelector("h3");
    return title ? title.textContent.replace(/\s+/g, " ").trim() : "";
  }

  // One listener for every card (desktop and mobile), so it still works after React redraws them
  function trackClick(event) {
    const card = event.target.closest("." + PREFIX + "-card");
    if (!card) return;

    window.dataLayer = window.dataLayer || [];

    if (event.target.closest('a[href*="/book/product-list"]')) {
      // 1. Book Now CTA Click
      // console.log("Book Now CTA Click", getExperienceName(card));
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "TS044 | Event Tracking",
          eventLabel: "TS044 | (Variation 1) | Book Now CTA Click",
          eventSegment: "TS044EV1G",
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
          eventLabel: "TS044 | (Variation 1) | More Details Click",
          eventSegment: "TS044EV1I",
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
          eventLabel: "TS044 | (Variation 1) | Promo Code Copy Click",
          eventSegment: "TS044EV1J",
        },
      });
    }
  }

  setUpCards();

  // Capture phase, so a React handler stopping the click can't hide it from us
  document.addEventListener("click", trackClick, true);

  // React redraws the results (e.g. new search), so re-run when elements change
  let debounceTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(setUpCards, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
