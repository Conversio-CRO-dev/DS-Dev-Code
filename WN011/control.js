console.log("David Silva | WN011 control");

(function () {
  // AB Tasty can inject the script more than once
  if (window.__wn011ControlInit) return;
  window.__wn011ControlInit = true;

  window.dataLayer = window.dataLayer || [];

  // Same links WN008 matched: desktop hotel nav + mobile burger submenu
  const NAV_LINK_SELECTOR =
    "li.hotelNavItem a.hotelNavLink, li.burgerNavSubmenuItem a.burgerNavSubmenuLink";

  // Header BOOK + the burger menu BOOK links (same as v1.js)
  const BOOK_CTA_SELECTOR = ".pageHeaderCta--book, .burgerNavPromoLink";

  // The bar's field buttons that open the search widget
  const SEARCH_FIELD_SELECTOR =
    '.searchButton[data-button="mobile"], .searchButton[data-button="where"], ' +
    '.searchButton[data-button="when"], .searchButton[data-button="who"], ' +
    '.searchButton[data-button="type"]';

  // The bar's Search button (closed or open widget) + the mobile panel's
  // See Breaks
  const SEARCH_SUBMIT_SELECTOR =
    ".searchCtaWrapper .searchCta, .searchCtaMobile";

  // The site writes the chosen date into the When field; "Any time" means
  // nothing was picked
  function hasDateSelected() {
    const subtitle = document.querySelector(
      '[data-button="when"] .searchButtonSubtitle',
    );
    if (!subtitle) return true;

    const text = subtitle.textContent.trim();
    return !(text === "" || text === "Any time" || text === "Select dates");
  }

  // Which tab a When panel Apply button belongs to: "week", "month", or null
  // when it isn't the When panel's (Where / Who have their own Apply). The
  // button sits inside the content panel of the tab that is showing, whose
  // id ends in "content-specific-date" (week) or "content-flexible" (month)
  function getAppliedTab(applyButton) {
    const whenPanel = applyButton.closest(".searchBarPanel.whenPanel");
    if (!whenPanel) return null;

    const tabPanel = applyButton.closest('[role="tabpanel"]');
    if (tabPanel && tabPanel.id.endsWith("content-specific-date"))
      return "week";
    if (tabPanel && tabPanel.id.endsWith("content-flexible")) return "month";

    // Fallback: the tab buttons
    return whenPanel.querySelector('.tabsSpecific[aria-selected="true"]')
      ? "week"
      : "month";
  }

  // Same checks WN003 and v1.js use
  function isSearchWidgetOpen() {
    const container = document.querySelector(".searchBarBlockContainer");
    return !!(
      (container && container.classList.contains("openSearchBlock")) ||
      document.querySelector("#searchApp .searchBarPanel") ||
      document.querySelector('.searchButton[data-open="true"]')
    );
  }

  document.addEventListener(
    "click",
    (e) => {
      // 1. Breaks Nav Link Click
      const navLink = e.target.closest(NAV_LINK_SELECTOR);
      if (navLink && navLink.textContent.trim().toLowerCase() === "breaks") {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label: "WN011 | (Control Original) | Breaks Nav Link Click",
            event_segment: "WN011ECOG",
          },
        });
        console.log("Breaks Nav Link Click");
      }

      // 2. Header Book CTA Click
      if (e.target.closest(BOOK_CTA_SELECTOR)) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label: "WN011 | (Control Original) | Header Book CTA Click",
            event_segment: "WN011ECOH",
          },
        });
        console.log("Header Book CTA Click");
      }

      // 4. Search Opened (only when the widget is closed at the moment of
      // the click; this runs before the site opens it)
      if (e.target.closest(SEARCH_FIELD_SELECTOR) && !isSearchWidgetOpen()) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label: "WN011 | (Control Original) | Search Opened",
            event_segment: "WN011ECOJ",
          },
        });
        console.log("Search Opened");
      }

      // 5. Search occurred without When Selection
      if (e.target.closest(SEARCH_SUBMIT_SELECTOR) && !hasDateSelected()) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label:
              "WN011 | (Control Original) | Search without When selection",
            event_segment: "WN011ECOK",
          },
        });
        console.log("Search occurred without When Selection");
      }

      // 9. Specific dates applied in search
      const applyButton = e.target.closest(".applyButton");
      const appliedTab = applyButton ? getAppliedTab(applyButton) : null;
      if (appliedTab === "week") {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label: "WN011 | (Control Original) | Specific dates applied",
            event_segment: "WN011ECOO",
          },
        });
        console.log("Specific dates applied in search");
      }

      // 10. Month applied in search
      if (appliedTab === "month") {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label: "WN011 | (Control Original) | Month applied",
            event_segment: "WN011ECOP",
          },
        });
        console.log("Month applied in search");
      }

      // 11. Successful Search Occurred (Control never blocks a search)
      if (e.target.closest(SEARCH_SUBMIT_SELECTOR)) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label: "WN011 | (Control Original) | Successful Search",
            event_segment: "WN011ECOR",
          },
        });
        console.log("Successful Search Occurred");
      }

      // 14. Breaks Card Continue To Rooms Click
      if (e.target.closest(".breakDetailItem .breakDetailItemCta")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label:
              "WN011 | (Control Original) | Breaks Card Continue To Rooms click",
            event_segment: "WN011ECOU",
          },
        });
        console.log("Breaks Card Continue To Rooms Click");
      }
    },
    true,
  );

  // The results filters write length of stay into the url (lengthofstay=3,2)
  // without reloading the page
  function getLengthOfStay() {
    return (
      new URLSearchParams(window.location.search).get("lengthofstay") || ""
    );
  }

  let lastLengthOfStay = getLengthOfStay();

  function checkLengthOfStayFilter() {
    const current = getLengthOfStay();
    if (current === lastLengthOfStay) return;
    lastLengthOfStay = current;

    // 15. Length of stay filter applied (clearing the filter doesn't count)
    if (current) {
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN011 | Event Tracking",
          event_label:
            "WN011 | (Control Original) | Length of stay filter applied",
          event_segment: "WN011ECOV",
        },
      });
      console.log("Length of stay filter applied");
    }
  }

  // pushState / replaceState fire no event; the original runs first so we
  // read the new url
  ["pushState", "replaceState"].forEach((method) => {
    const original = history[method];
    history[method] = function () {
      const result = original.apply(this, arguments);
      checkLengthOfStayFilter();
      return result;
    };
  });

  // Back / Forward: keep the value in step without counting it as a filter
  window.addEventListener("popstate", () => {
    lastLengthOfStay = getLengthOfStay();
  });

  // Cards already being watched, so none is watched twice
  const watchedCards = new WeakSet();

  // Fires when a card enters the screen: by scrolling, a search or the
  // Breaks link. Each card counts once per page view, then stops being watched
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      cardObserver.unobserve(entry.target);

      // 12. Breaks Card Impression
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN011 | Event Tracking",
          event_label: "WN011 | (Control Original) | Breaks Card Impression",
          event_segment: "WN011ECOS",
        },
      });
      console.log("Breaks Card Impression");
    });
  });

  function watchCards() {
    document.querySelectorAll(".breakDetailItem").forEach((card) => {
      if (watchedCards.has(card)) return;
      watchedCards.add(card);
      cardObserver.observe(card);
    });
  }

  // Whether the "No results found" message was showing at the last check
  let noResultsShown = false;

  function checkNoResults() {
    const shown = !!document.querySelector(
      "#searchPageArea .noResultsFoundContainer",
    );

    // 13. Null Results On Breaks Cards (once each time the message appears)
    if (shown && !noResultsShown) {
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN011 | Event Tracking",
          event_label: "WN011 | (Control Original) | Null Results",
          event_segment: "WN011ECOT",
        },
      });
      console.log("Null Results On Breaks Cards");
    }
    noResultsShown = shown;
  }

  function checkPage() {
    watchCards();
    checkNoResults();
  }

  // Cards and the no results message are built after load and change with
  // filters, so keep checking. Grouped to once per frame, as the page can
  // change many times in a row
  let pageCheckQueued = false;
  new MutationObserver(() => {
    if (pageCheckQueued) return;
    pageCheckQueued = true;
    requestAnimationFrame(() => {
      pageCheckQueued = false;
      checkPage();
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  checkPage();

  // The month / week tabs switch on press, and the switch moves them before
  // the release, so "click" lands on a parent. pointerdown is on the button
  document.addEventListener(
    "pointerdown",
    (e) => {
      // 7. Search By Week Toggle Click
      if (e.target.closest(".tabsSpecific")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label:
              "WN011 | (Control Original) | Search By Week toggle click",
            event_segment: "WN011ECOM",
          },
        });
        console.log("Search By Week Toggle Click");
      }

      // 8. Search by Month Toggle Click
      if (e.target.closest(".tabsFlexible")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label:
              "WN011 | (Control Original) | Search by Month toggle click",
            event_segment: "WN011ECON",
          },
        });
        console.log("Search by Month Toggle Click");
      }
    },
    true,
  );
})();
