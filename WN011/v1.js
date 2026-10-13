console.log("David Silva | WN011 variation 1");

(function () {
  // AB Tasty can inject the script more than once
  if (window.__wn011Init) return;
  window.__wn011Init = true;

  window.dataLayer = window.dataLayer || [];

  const HUB_PAGE_PATTERN = /^\/hotels\/[^/]+\/?$/;

  // Hub page and its sub-pages (sub-pages confirmed by Marisa)
  const HOTEL_PAGE_PATTERN = /^\/hotels\/[^/]+(\/|$)/;

  const HUB_PAGE_CLASS = "wn011-hub-page";
  const HOTEL_PAGE_CLASS = "wn011-hotel-page";
  const HIDE_BREAKS_CLASS = "wn011-hide-breaks";
  const BREAKS_LINK_ATTR = "data-wn011-breaks-link";

  const NAV_LINK_SELECTOR =
    "li.hotelNavItem a.hotelNavLink, li.burgerNavSubmenuItem a.burgerNavSubmenuLink";

  const STATIC_WHERE_ATTR = "data-wn011-static";
  const WHERE_TITLE = "Hotel";
  const SEARCH_CTA_LABEL = "Find your break";

  const WHEN_SUBTITLE_SELECTOR =
    '[data-button="when"] .searchButtonSubtitle, ' +
    '[data-button="mobile"] .searchButtonSubtitle, ' +
    ".defaultPanelButtonSubtitle[data-bind-from]";

  const WHEN_ERROR_SELECTOR =
    '[data-button="when"] .searchButtonSubtitle, ' +
    ".defaultPanelButtonSubtitle[data-bind-from]";

  const SHOW_DATE_ERROR_CLASS = "wn011-show-date-error";

  const SCROLL_CLEAR_THRESHOLD = 30;

  const DATE_MESSAGE_VISIBLE_CLASS = "wn011-date-message-visible";
  const DATE_MESSAGE_DURATION = 4000; // milliseconds
  const MOBILE_DATE_ERROR_CLASS = "wn011-mobile-date-error";

  let hideDateMessageTimer = null;
  let dateErrorScrollY = 0;

  const SEARCH_SUBMIT_SELECTOR =
    ".searchCtaWrapper .searchCta, .searchCtaMobile";

  const NO_DATE_TEXT = "Any time";
  const SELECT_DATES_TEXT = "Select dates";
  const DATE_ERROR_TEXT = "Please select dates of your break";
  const DATE_ERROR_HTML =
    '<span class="wn011-when-error-icon">&#9432;</span> ' + DATE_ERROR_TEXT;
  const DATE_ERROR_CLASS = "wn011-when-error";

  const HIDDEN_ATTR = "data-wn011-hidden";

  const NO_RESULTS_LOS_TIP_HTML =
    "Choose <b>Any</b> length of stay, or <b>add more nights</b>";

  const CHANGE_SEARCH_CLASS = "wn011-change-search";
  const CHANGE_SEARCH_TEXT = "Change your search";

  const WHEN_APPLY_TEXT = "Apply";
  const WHEN_CONTINUE_TEXT = "Continue";

  const LOS_NIGHTS = [1, 2, 3, 4, 5, 7];
  const LOS_PARAM = "lengthofstay";
  const LOS_WRAPPER_CLASS = "wn011-los";
  const LOS_CHIP_CLASS = "wn011-los-chip";

  // Empty means "Any". Every search reloads the page, so start from the url
  const selectedNights = new Set(readNightsFromUrl());

  let lastUrlNights =
    new URLSearchParams(window.location.search).get(LOS_PARAM) || "";

  let losLabelCount = 0;

  const SEARCH_DOCKED_CLASS = "wn011-search-docked";
  const SEARCH_PLACEHOLDER_CLASS = "wn011-search-placeholder";

  const RESULTS_GAP_DESKTOP = 10; // tablets and desktop
  const RESULTS_GAP_MOBILE = 5;
  const MOBILE_QUERY = window.matchMedia("(max-width: 767px)");

  let searchPlaceholder = null;
  let searchDockQueued = false;

  // Event 3 fires once per page view
  let stickyTriggered = false;

  // The site shifts .searchBarBlock up to overlap the hero
  let dockBoxBottomOffset = 0;

  let alignResults = window.location.hash === "#searchPageArea";
  let alignCorrections = 0;
  const MAX_ALIGN_CORRECTIONS = 3;

  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

  const DESKTOP_QUERY = window.matchMedia("(min-width: 1024px)");
  const APPLY_WAIT_FRAMES = 60; // about 1 second

  const APPLYING_DATES_CLASS = "wn011-applying-dates";

  let whenTextBeforePreview = null;

  let scrolledHeaderBottom = null;

  let glideCorrectionPending = false;

  // AB Tasty widget from another campaign; its id ends in a generated code
  const BACK_TO_TOP_SELECTOR = '[id^="ab_widget_container_action-button"]';
  const BACK_TO_TOP_GAP = 12; // px between the arrow and the docked bar

  let scrollBeforeSearchOpen = null;
  let wasSearchOpen = false;

  let skipScrollRestore = false;

  const BOOK_CTA_SELECTOR = ".pageHeaderCta--book, .burgerNavPromoLink";

  function isHubPage() {
    return HUB_PAGE_PATTERN.test(window.location.pathname);
  }

  function isHotelPage() {
    return HOTEL_PAGE_PATTERN.test(window.location.pathname);
  }

  function readNightsFromUrl() {
    const value = new URLSearchParams(window.location.search).get(LOS_PARAM);
    if (!value) return [];

    return value
      .split(",")
      .map(Number)
      .filter((nights) => Number.isInteger(nights) && nights > 0);
  }

  function hasSearch() {
    return new URLSearchParams(window.location.search).has("from");
  }

  function updateBreakCardsVisibility() {
    const shouldHide = isHubPage() && !hasSearch();
    document.documentElement.classList.toggle(HIDE_BREAKS_CLASS, shouldHide);
  }

  // Mark rather than remove: React can error or re-add removed nodes
  function markBreaksLinks() {
    document.querySelectorAll(NAV_LINK_SELECTOR).forEach((link) => {
      if (link.textContent.trim().toLowerCase() !== "breaks") return;
      const item = link.closest("li");
      if (item) item.setAttribute(BREAKS_LINK_ATTR, "");
    });
  }

  function makeWhereStatic(titleEl) {
    // Guarded: this runs in the MutationObserver and would trigger itself
    if (titleEl.textContent.trim() !== WHERE_TITLE) {
      titleEl.textContent = WHERE_TITLE;
    }

    const button = titleEl.closest("button");
    if (button && !button.disabled) {
      button.disabled = true;
      button.setAttribute(STATIC_WHERE_ATTR, "");
    }
  }

  // The label is a bare text node next to the icon; textContent would delete the icon
  function updateSearchCtaLabel() {
    const cta = document.querySelector(".searchCtaWrapper .searchCta");
    if (!cta) return;

    const labelNode = Array.from(cta.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "",
    );
    if (labelNode && labelNode.nodeValue.trim() !== SEARCH_CTA_LABEL) {
      labelNode.nodeValue = SEARCH_CTA_LABEL;
    }
  }

  function updateSearchWidget() {
    if (!isHotelPage()) return;

    const desktopWhereTitle = document.querySelector(
      '.searchButton[data-button="where"] .searchButtonTitle',
    );
    if (desktopWhereTitle) makeWhereStatic(desktopWhereTitle);

    document.querySelectorAll(".defaultPanelButtonTitle").forEach((title) => {
      if (title.textContent.trim() === "Where") makeWhereStatic(title);
    });

    updateSearchCtaLabel();
    updateWhenSubtitles();
    addMobileDateError();
    updateWhenPanel();
    updateNoResultsTips();
    addChangeSearchButton();
  }

  function addChangeSearchButton() {
    const container = document.querySelector(
      "#searchPageArea .noResultsFoundContainer",
    );
    if (!container || container.querySelector("." + CHANGE_SEARCH_CLASS))
      return;

    const tipsList = container.querySelector("ul");
    const tipsBlock = tipsList
      ? tipsList.closest(".noResultsFoundBlock")
      : null;
    if (!tipsBlock) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "cta " + CHANGE_SEARCH_CLASS;
    button.textContent = CHANGE_SEARCH_TEXT;
    tipsBlock.after(button);
  }

  function handleChangeSearchClick(e) {
    if (!e.target.closest("." + CHANGE_SEARCH_CLASS)) return;
    openSearchWidget();
  }

  function updateNoResultsTips() {
    document
      .querySelectorAll("#searchPageArea .noResultsFoundContainer li")
      .forEach((tip) => {
        const text = tip.textContent;

        if (text.includes("more locations")) {
          tip.innerHTML = NO_RESULTS_LOS_TIP_HTML;
        } else if (text.includes("type of break")) {
          tip.setAttribute(HIDDEN_ATTR, "");
        }
      });
  }

  function updateWhenPanel() {
    document
      .querySelectorAll(".whenPanel .whenPanelSubheader")
      .forEach((paragraph) => {
        if (paragraph.textContent.trim().startsWith("We have")) {
          paragraph.setAttribute(HIDDEN_ATTR, "");
        }
      });

    addLosChips();

    if (!isMobileSearch()) return;
    document.querySelectorAll(".whenPanel .applyButton").forEach((button) => {
      if (button.textContent.trim() === WHEN_APPLY_TEXT) {
        button.textContent = WHEN_CONTINUE_TEXT;
      }
    });
  }

  // Outside #searchApp, so React never touches it
  function addMobileDateError() {
    const barRow = document.querySelector(".searchBarBlockTopContainer");
    if (!barRow) return;

    const next = barRow.nextElementSibling;
    if (next && next.classList.contains(MOBILE_DATE_ERROR_CLASS)) return;

    const message = document.createElement("p");
    message.className = MOBILE_DATE_ERROR_CLASS;
    message.setAttribute("role", "alert");
    barRow.after(message);
  }

  function showMobileDateMessage() {
    const message = document.querySelector("." + MOBILE_DATE_ERROR_CLASS);
    if (message) {
      // Empty then refill, so a repeated alert is announced again
      message.textContent = "";
      requestAnimationFrame(() => {
        message.innerHTML = DATE_ERROR_HTML;
      });
    }

    document.documentElement.classList.add(DATE_MESSAGE_VISIBLE_CLASS);

    clearTimeout(hideDateMessageTimer);
    hideDateMessageTimer = setTimeout(
      hideMobileDateMessage,
      DATE_MESSAGE_DURATION,
    );
  }

  function hideMobileDateMessage() {
    clearTimeout(hideDateMessageTimer);
    document.documentElement.classList.remove(DATE_MESSAGE_VISIBLE_CLASS);
  }

  // The site writes the chosen date into the When subtitle
  function hasDateSelected() {
    const subtitle = document.querySelector(
      '[data-button="when"] .searchButtonSubtitle',
    );
    if (!subtitle) return true;

    const text = subtitle.textContent.trim();
    return !(
      text === "" ||
      text === NO_DATE_TEXT ||
      text === SELECT_DATES_TEXT ||
      text.includes(DATE_ERROR_TEXT)
    );
  }

  function updateWhenSubtitles() {
    document.querySelectorAll(WHEN_SUBTITLE_SELECTOR).forEach((subtitle) => {
      const text = subtitle.textContent.trim();

      if (text === NO_DATE_TEXT) {
        subtitle.textContent = SELECT_DATES_TEXT;
        subtitle.classList.remove(DATE_ERROR_CLASS);
        return;
      }

      if (
        subtitle.classList.contains(DATE_ERROR_CLASS) &&
        !text.includes(DATE_ERROR_TEXT)
      ) {
        subtitle.classList.remove(DATE_ERROR_CLASS);
      }
    });

    if (hasDateSelected()) {
      document.documentElement.classList.remove(SHOW_DATE_ERROR_CLASS);
      hideMobileDateMessage();
    }
  }

  function showDateError() {
    document.querySelectorAll(WHEN_ERROR_SELECTOR).forEach((subtitle) => {
      subtitle.innerHTML = DATE_ERROR_HTML;
      subtitle.classList.add(DATE_ERROR_CLASS);
    });

    document.documentElement.classList.add(SHOW_DATE_ERROR_CLASS);
    dateErrorScrollY = window.scrollY;
    showMobileDateMessage();
  }

  function clearMobileDateError() {
    if (!document.documentElement.classList.contains(SHOW_DATE_ERROR_CLASS))
      return;

    document.documentElement.classList.remove(SHOW_DATE_ERROR_CLASS);
    hideMobileDateMessage();
  }

  function handleClickElsewhere(e) {
    if (e.target.closest(SEARCH_SUBMIT_SELECTOR)) return;
    clearMobileDateError();
  }

  function handleScroll() {
    if (Math.abs(window.scrollY - dateErrorScrollY) < SCROLL_CLEAR_THRESHOLD)
      return;
    clearMobileDateError();
  }

  function handleSearchSubmit(e) {
    if (!isHotelPage()) return;

    const searchLink = e.target.closest(SEARCH_SUBMIT_SELECTOR);
    if (!searchLink) return;

    // Dates picked but not applied: apply, then click again to search
    const pendingApply = getPendingApplyButton();
    if (pendingApply) {
      e.preventDefault();
      e.stopImmediatePropagation();
      applyDates(pendingApply, () => {
        if (datesSavedFor(searchLink)) {
          searchLink.click();
        } else {
          document.documentElement.classList.remove(APPLYING_DATES_CLASS);
        }
      });
      return;
    }

    if (hasDateSelected()) {
      // 11. Successful Search Occurred (a new search, or a glide to the
      // breaks for the same search; the Amend 3 apply-then-search arrives
      // here on its second click, so it counts once)
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN011 | Event Tracking",
          event_label: "WN011 | (Variation 1) | Successful Search",
          event_segment: "WN011EV1R",
        },
      });
      console.log("Successful Search Occurred");

      skipScrollRestore = true;
      addNightsToSearchLink(searchLink);

      // Same search: scroll to the results (a reload lands at the top under AB Tasty)
      if (isCurrentPage(searchLink)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        closeSearchWidget();
        scrollToResults();
      }
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
    showDateError();

    // 5. Search occurred without When Selection (when the date error fires)
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        event_category: "Conversio CRO",
        event_action: "WN011 | Event Tracking",
        event_label: "WN011 | (Variation 1) | Search without When selection",
        event_segment: "WN011EV1K",
      },
    });
    console.log("Search occurred without When Selection");
  }

  // Desktop: picked months shown straight away; the real Apply happens on search, Who, Close or Escape
  function updateWhenPreview() {
    if (!DESKTOP_QUERY.matches) return;

    const panel = getVisibleWhenPanel();
    const subtitle = document.querySelector(
      '[data-button="when"] .searchButtonSubtitle',
    );
    if (!panel || !subtitle) return;

    const picked = Array.from(
      panel.querySelectorAll('.dateRangeSelectorItem[aria-pressed="true"]'),
    ).filter((month) => month.getClientRects().length > 0);

    const text = picked.length ? formatPickedMonths(picked) : SELECT_DATES_TEXT;
    if (subtitle.textContent.trim() === text) return;

    if (whenTextBeforePreview === null) {
      whenTextBeforePreview = subtitle.textContent.trim();
    }
    subtitle.textContent = text;
    subtitle.classList.remove(DATE_ERROR_CLASS);
  }

  function undoWhenPreview() {
    if (whenTextBeforePreview === null) return;

    const subtitle = document.querySelector(
      '[data-button="when"] .searchButtonSubtitle',
    );
    if (subtitle) subtitle.textContent = whenTextBeforePreview;
    whenTextBeforePreview = null;
  }

  function formatPickedMonths(months) {
    const name = (month) =>
      month.querySelector(".dateRangeSelectorItemMonth").textContent.trim();
    const year = (month) =>
      month.querySelector(".dateRangeSelectorItemYear").textContent.trim();

    const first = months[0];
    const last = months[months.length - 1];

    if (months.length === 1) return `${name(first)} ${year(first)}`;
    if (year(first) === year(last)) {
      return `${name(first)} - ${name(last)} ${year(last)}`;
    }
    return `${name(first)} ${year(first)} - ${name(last)} ${year(last)}`;
  }

  function handleMonthClick(e) {
    if (!isHotelPage()) return;

    if (e.target.closest(".whenPanel .applyButton")) {
      whenTextBeforePreview = null;
      return;
    }

    if (!e.target.closest(".dateRangeSelectorItem")) return;
    requestAnimationFrame(updateWhenPreview);
  }

  function handleWhoClick(e) {
    if (
      !isHotelPage() ||
      !e.target.closest('.searchButton[data-button="who"]')
    ) {
      return;
    }

    const pendingApply = getPendingApplyButton();
    if (!pendingApply) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    whenTextBeforePreview = null;
    pendingApply.click();
  }

  function handleCloseClick(e) {
    if (!isHotelPage()) return;

    const closeButton = e.target.closest(".cancelSearchButton");
    if (!closeButton) return;

    const pendingApply = getPendingApplyButton();
    if (!pendingApply) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    applyDates(pendingApply, () => closeButton.click());
  }

  function handleEscapeKey(e) {
    if (!isHotelPage() || e.key !== "Escape") return;

    const pendingApply = getPendingApplyButton();
    if (!pendingApply) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    applyDates(pendingApply, () => {
      const closeButton = document.querySelector(
        ".openSearchBlock .cancelSearchButton",
      );
      if (closeButton) closeButton.click();
    });
  }

  function getVisibleWhenPanel() {
    return (
      Array.from(document.querySelectorAll(".searchBarPanel.whenPanel")).find(
        (panel) => panel.getClientRects().length > 0,
      ) || null
    );
  }

  // Desktop APPLY DATES is hidden; it is enabled only once a valid choice is made
  function getPendingApplyButton() {
    if (!DESKTOP_QUERY.matches) return null;

    const panel = getVisibleWhenPanel();
    const apply = panel ? panel.querySelector(".applyButton") : null;
    return apply && !apply.disabled ? apply : null;
  }

  // Which tab a When panel Apply belongs to: "week", "month", or null (Where /
  // Who have their own Apply). It sits inside the showing tab's content panel
  function getAppliedTab(applyButton) {
    const whenPanel = applyButton.closest(".searchBarPanel.whenPanel");
    if (!whenPanel) return null;

    const tabPanel = applyButton.closest('[role="tabpanel"]');
    if (tabPanel && tabPanel.id.endsWith("content-specific-date"))
      return "week";
    if (tabPanel && tabPanel.id.endsWith("content-flexible")) return "month";

    return whenPanel.querySelector('.tabsSpecific[aria-selected="true"]')
      ? "week"
      : "month";
  }

  function datesSavedFor(link) {
    return (
      !getVisibleWhenPanel() &&
      hasDateSelected() &&
      new URL(link.href).searchParams.has("from")
    );
  }

  function applyDates(applyButton, callback) {
    document.documentElement.classList.add(APPLYING_DATES_CLASS);
    whenTextBeforePreview = null;
    applyButton.click();

    let frames = 0;
    const check = () => {
      frames += 1;
      if (!getVisibleWhenPanel() && hasDateSelected()) {
        callback();
      } else if (frames < APPLY_WAIT_FRAMES) {
        requestAnimationFrame(check);
      } else {
        document.documentElement.classList.remove(APPLYING_DATES_CLASS);
      }
    };
    requestAnimationFrame(check);
  }

  function buildLosChip(nights, label) {
    return (
      `<button type="button" class="${LOS_CHIP_CLASS}" ` +
      `data-nights="${nights}" aria-pressed="false">${label}</button>`
    );
  }

  function buildLosChips() {
    losLabelCount += 1;
    const labelId = "wn011-los-label-" + losLabelCount;

    const nightChips = LOS_NIGHTS.map((nights) =>
      buildLosChip(nights, nights === 1 ? "1 night" : nights + " nights"),
    ).join("");

    const wrapper = document.createElement("div");
    wrapper.className = LOS_WRAPPER_CLASS;
    wrapper.innerHTML =
      `<p class="wn011-los-label" id="${labelId}">Length of Stay ` +
      `<span class="wn011-los-optional">(optional)</span></p>` +
      `<div class="wn011-los-chips" role="group" aria-labelledby="${labelId}">` +
      buildLosChip("", "Any") +
      nightChips +
      `</div>`;
    return wrapper;
  }

  function addLosChips() {
    document.querySelectorAll(".whenPanel .tabs").forEach((tabs) => {
      const previous = tabs.previousElementSibling;
      if (previous && previous.classList.contains(LOS_WRAPPER_CLASS)) return;
      tabs.before(buildLosChips());
    });

    renderLosChips();
  }

  function renderLosChips() {
    document.querySelectorAll("." + LOS_CHIP_CLASS).forEach((chip) => {
      const nights = chip.dataset.nights;
      const isPressed =
        nights === ""
          ? selectedNights.size === 0
          : selectedNights.has(Number(nights));

      const value = String(isPressed);
      if (chip.getAttribute("aria-pressed") !== value) {
        chip.setAttribute("aria-pressed", value);
      }
    });
  }

  // "Any" is on whenever the set is empty
  function handleLosChipClick(e) {
    const chip = e.target.closest("." + LOS_CHIP_CLASS);
    if (!chip) return;

    const nights = chip.dataset.nights;

    if (nights === "") {
      selectedNights.clear();
    } else if (selectedNights.has(Number(nights))) {
      selectedNights.delete(Number(nights));
    } else {
      selectedNights.add(Number(nights));

      // 6. Length of Stay Chip selected that isn't Any
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN011 | Event Tracking",
          event_label:
            "WN011 | (Variation 1) | Length of Stay chip that isn't Any",
          event_segment: "WN011EV1L",
        },
      });
      console.log("Length of Stay Chip selected that isn't Any");
    }

    renderLosChips();
  }

  // Only reset when lengthofstay itself changed (the site also calls replaceState)
  function syncNightsFromUrl(isBackForward) {
    const current =
      new URLSearchParams(window.location.search).get(LOS_PARAM) || "";
    if (current === lastUrlNights) return;
    lastUrlNights = current;

    // 15. Length of stay filter applied: an in-page change from the results
    // filter. Our chips reload the page (that's a search), clearing doesn't
    // count, and nor do the Back / Forward buttons
    if (current && !isBackForward) {
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN011 | Event Tracking",
          event_label: "WN011 | (Variation 1) | Length of stay filter applied",
          event_segment: "WN011EV1V",
        },
      });
      console.log("Length of stay filter applied");
    }

    selectedNights.clear();
    readNightsFromUrl().forEach((nights) => selectedNights.add(nights));
    renderLosChips();
  }

  function addNightsToSearchLink(link) {
    const url = new URL(link.href);

    // Rebuilding the link re-encodes guests[0] as guests%5B0%5D, which broke repeat searches
    if (selectedNights.size === 0 && !url.searchParams.has(LOS_PARAM)) return;

    if (selectedNights.size === 0) {
      url.searchParams.delete(LOS_PARAM);
    } else {
      const nights = Array.from(selectedNights).sort((a, b) => a - b);
      url.searchParams.set(LOS_PARAM, nights.join(","));
    }

    link.href = url.toString();
  }

  function isCurrentPage(link) {
    const target = new URL(link.href);
    const current = new URL(window.location.href);
    if (target.pathname !== current.pathname) return false;

    const targetParams = new URLSearchParams(target.search);
    const currentParams = new URLSearchParams(current.search);
    targetParams.sort();
    currentParams.sort();
    return targetParams.toString() === currentParams.toString();
  }

  function closeSearchWidget() {
    if (!isSearchWidgetOpen()) return;

    const closeButton =
      document.querySelector(".openSearchBlock .cancelSearchButton") ||
      document.querySelector(".defaultPanelMobile .panelClose");
    if (closeButton) closeButton.click();
  }

  // One smooth scroll: corrections made the header expand and shrink, so the page flickered
  function scrollToResults() {
    requestAnimationFrame(() => {
      if (!glideToResults()) return;

      glideCorrectionPending = true;
      whenScrollEnds(() => {
        if (!glideCorrectionPending) return;
        glideCorrectionPending = false;
        glideToResults(2);
      });
    });
  }

  function glideToResults(tolerance = 0) {
    const target = getResultsTarget();
    if (!target) return false;

    const gap = MOBILE_QUERY.matches ? RESULTS_GAP_MOBILE : RESULTS_GAP_DESKTOP;
    const headerBottom = isHeaderScrolledState()
      ? getSiteHeaderBottom()
      : (scrolledHeaderBottom ?? getSiteHeaderBottom());

    const offset = target.getBoundingClientRect().top - (headerBottom + gap);
    if (Math.abs(offset) <= tolerance) return false;

    window.scrollTo({
      top: window.scrollY + offset,
      behavior: REDUCED_MOTION.matches ? "auto" : "smooth",
    });
    return true;
  }

  function isHeaderScrolledState() {
    const header = document.querySelector("[data-new-header].is-stuck");
    return !!header && !header.classList.contains("is-expanded");
  }

  function whenScrollEnds(callback) {
    if ("onscrollend" in window) {
      window.addEventListener("scrollend", callback, { once: true });
      return;
    }

    let timer;
    const finish = () => {
      window.removeEventListener("scroll", onScroll);
      callback();
    };
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(finish, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    timer = setTimeout(finish, 150);
  }

  function getSiteHeaderBottom() {
    let bottom = 0;

    document.querySelectorAll("[data-new-header]").forEach((header) => {
      if (header.getClientRects().length === 0) return;
      bottom = Math.max(bottom, header.getBoundingClientRect().bottom);
    });

    return bottom;
  }

  function getSearchPlaceholder(bar) {
    if (searchPlaceholder && searchPlaceholder.nextElementSibling === bar) {
      return searchPlaceholder;
    }

    if (searchPlaceholder) searchPlaceholder.remove();

    searchPlaceholder = document.createElement("div");
    searchPlaceholder.className = "col-12 " + SEARCH_PLACEHOLDER_CLASS;
    bar.before(searchPlaceholder);
    return searchPlaceholder;
  }

  function updateSearchDock() {
    const html = document.documentElement;
    const bar = document.querySelector(".searchBarBlockContainer");

    if (!isHotelPage() || !bar) {
      html.classList.remove(SEARCH_DOCKED_CLASS);
      return;
    }

    const placeholder = getSearchPlaceholder(bar);
    const headerBottom = getSiteHeaderBottom();

    if (isHeaderScrolledState()) scrolledHeaderBottom = headerBottom;

    // Track the visible box, not its container
    const box = bar.querySelector(".searchBarBlock") || bar;

    const isDocked = html.classList.contains(SEARCH_DOCKED_CLASS);

    // Not laid out yet (as the page loads): its edges read as 0, which
    // would look "out of view" for a frame. Wait until it has a size
    if (!isDocked && box.getBoundingClientRect().height === 0) return;

    // Open search: on desktop the box becomes the full-screen overlay at the
    // top, which isn't the bar scrolling away. Keep the docked state as it is
    if (isSearchWidgetOpen()) return;

    const originalBottom = isDocked
      ? placeholder.getBoundingClientRect().top + dockBoxBottomOffset
      : box.getBoundingClientRect().bottom;
    const shouldDock = originalBottom <= headerBottom;

    if (shouldDock && !isDocked) {
      placeholder.style.height = bar.offsetHeight + "px";
      dockBoxBottomOffset =
        box.getBoundingClientRect().bottom - bar.getBoundingClientRect().top;

      // 3. Search Widget Sticky Triggered
      if (!stickyTriggered) {
        stickyTriggered = true;
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label:
              "WN011 | (Variation 1) | Search Widget Sticky Triggered",
            event_segment: "WN011EV1I",
          },
        });
        console.log("Search Widget Sticky Triggered");
      }
    }

    html.classList.toggle(SEARCH_DOCKED_CLASS, shouldDock);

    if (shouldDock) {
      html.style.setProperty("--wn011-dock-height", bar.offsetHeight + "px");
    }

    watchSearchBar(bar);
    updateBackToTop(shouldDock, bar);

    const gap = MOBILE_QUERY.matches ? RESULTS_GAP_MOBILE : RESULTS_GAP_DESKTOP;
    alignResultsArea(headerBottom, gap);
  }

  function getMobileResultsMessage() {
    if (!MOBILE_QUERY.matches) return null;

    const message = document.querySelector("#searchPageArea .searchPageMsg");
    return message && message.getClientRects().length > 0 ? message : null;
  }

  function updateBackToTop(isDocked, bar) {
    const widget = document.querySelector(BACK_TO_TOP_SELECTOR);
    if (!widget) return;

    let lift = 0;

    if (isDocked) {
      const arrow = widget.querySelector("img") || widget;
      // Natural position, without our lift (translate is read live)
      const naturalBottom =
        arrow.getBoundingClientRect().bottom - getTranslateY(widget);
      const limit = bar.getBoundingClientRect().top - BACK_TO_TOP_GAP;
      lift = Math.max(0, naturalBottom - limit);
    }

    document.documentElement.style.setProperty(
      "--wn011-back-to-top-lift",
      lift + "px",
    );
  }

  function getTranslateY(element) {
    const parts = getComputedStyle(element).translate.split(" ");
    return parts.length > 1 ? parseFloat(parts[1]) || 0 : 0;
  }

  function watchSearchBar(bar) {
    if (bar.hasAttribute("data-wn011-watched")) return;

    bar.setAttribute("data-wn011-watched", "");
    new ResizeObserver(queueSearchDock).observe(bar);
    bar.addEventListener("animationend", queueSearchDock);
  }

  function getResultsTarget() {
    return (
      document.querySelector("#searchPageArea .noResultsFoundContainer") ||
      getMobileResultsMessage() ||
      document.querySelector("#searchPageArea")
    );
  }

  function alignResultsArea(headerBottom, gap) {
    if (!alignResults) return;

    const target = getResultsTarget();
    if (!target) return;

    const offset = target.getBoundingClientRect().top - (headerBottom + gap);
    if (Math.abs(offset) <= 1) return;

    if (alignCorrections >= MAX_ALIGN_CORRECTIONS) {
      alignResults = false;
      return;
    }

    alignCorrections += 1;
    window.scrollBy(0, offset);
  }

  function stopAligningResults() {
    alignResults = false;
    glideCorrectionPending = false;
  }

  function queueSearchDock() {
    if (searchDockQueued) return;
    searchDockQueued = true;

    requestAnimationFrame(() => {
      searchDockQueued = false;
      updateSearchDock();
    });
  }

  function watchSiteHeader() {
    document.querySelectorAll("[data-new-header]").forEach((header) => {
      if (header.hasAttribute("data-wn011-watched")) return;

      header.setAttribute("data-wn011-watched", "");
      new ResizeObserver(queueSearchDock).observe(header);
      header.addEventListener("transitionend", queueSearchDock);
    });
  }

  function rememberScrollBeforeOpen() {
    if (!isHotelPage() || isSearchWidgetOpen()) return;
    scrollBeforeSearchOpen = window.scrollY;
  }

  function restoreScrollAfterClose() {
    const isOpen = isSearchWidgetOpen();

    // A search from the closed bar never closes the widget, so reset on every open
    if (!wasSearchOpen && isOpen) {
      skipScrollRestore = false;

      // 4. Search Opened (once per opening, however it was opened)
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "WN011 | Event Tracking",
          event_label: "WN011 | (Variation 1) | Search Opened",
          event_segment: "WN011EV1J",
        },
      });
      console.log("Search Opened");
    }

    if (wasSearchOpen && !isOpen) {
      document.documentElement.classList.remove(APPLYING_DATES_CLASS);

      undoWhenPreview();

      if (!skipScrollRestore && scrollBeforeSearchOpen !== null) {
        const y = scrollBeforeSearchOpen;
        requestAnimationFrame(() => window.scrollTo(0, y));
      }
      skipScrollRestore = false;
    }

    wasSearchOpen = isOpen;
  }

  // Cards already being watched, so none is watched twice
  const watchedCards = new WeakSet();

  // Fires when a card enters the screen; each card counts once per page view.
  // Cards hidden before a search can't enter the screen, so they don't count
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
          event_label: "WN011 | (Variation 1) | Breaks Card Impression",
          event_segment: "WN011EV1S",
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
          event_label: "WN011 | (Variation 1) | Null Results",
          event_segment: "WN011EV1T",
        },
      });
      console.log("Null Results On Breaks Cards");
    }
    noResultsShown = shown;
  }

  function applyDomChanges() {
    markBreaksLinks();
    updateSearchWidget();
    watchSiteHeader();
    watchCards();
    checkNoResults();
    queueSearchDock();
    if (isHotelPage()) restoreScrollAfterClose();
  }

  function isMobileSearch() {
    const mobileItem = document.querySelector(".searchButtonItem.mobileOnly");
    return !!mobileItem && mobileItem.offsetParent !== null;
  }

  function isSearchWidgetOpen() {
    const container = document.querySelector(".searchBarBlockContainer");
    return !!(
      (container && container.classList.contains("openSearchBlock")) ||
      document.querySelector("#searchApp .searchBarPanel") ||
      document.querySelector('.searchButton[data-open="true"]')
    );
  }

  function openSearchWidget() {
    if (isSearchWidgetOpen()) return true;

    const button = document.querySelector(
      isMobileSearch()
        ? '.searchButton[data-button="mobile"]'
        : '.searchButton[data-button="when"]',
    );
    if (!button) return false;

    button.click();
    return true;
  }

  function closeBurgerNav() {
    const closeButton = document.querySelector(
      "#burgerNav.is-open .burgerNavClose",
    );
    if (closeButton) closeButton.click();
  }

  function handleBookClick(e) {
    if (!isHotelPage()) return;

    const bookCta = e.target.closest(BOOK_CTA_SELECTOR);
    if (!bookCta) return;

    if (bookCta.closest("#burgerNav")) closeBurgerNav();

    if (openSearchWidget()) e.preventDefault();
  }

  function onRouteChange(isBackForward = false) {
    document.documentElement.classList.toggle(HUB_PAGE_CLASS, isHubPage());
    document.documentElement.classList.toggle(HOTEL_PAGE_CLASS, isHotelPage());
    updateBreakCardsVisibility();
    syncNightsFromUrl(isBackForward);
  }

  // pushState / replaceState fire no event; the original runs first so we read the new url
  function interceptHistoryMethod(method) {
    const original = history[method];
    history[method] = function () {
      const result = original.apply(this, arguments);
      onRouteChange();
      return result;
    };
  }

  interceptHistoryMethod("pushState");
  interceptHistoryMethod("replaceState");
  window.addEventListener("popstate", () => onRouteChange(true));

  onRouteChange();

  applyDomChanges();
  new MutationObserver(applyDomChanges).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Events: registered first, so they see clicks that later handlers stop
  document.addEventListener(
    "click",
    (e) => {
      // 2. Header Book CTA Click
      if (e.target.closest(BOOK_CTA_SELECTOR)) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label: "WN011 | (Variation 1) | Header Book CTA Click",
            event_segment: "WN011EV1H",
          },
        });
        console.log("Header Book CTA Click");
      }

      // Pressed by the customer, or by our code on desktop (APPLY DATES is
      // hidden there): .click() sends a normal click, so both count
      const applyButton = e.target.closest(".applyButton");
      const appliedTab = applyButton ? getAppliedTab(applyButton) : null;

      // 9. Specific dates applied in search
      if (appliedTab === "week") {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label: "WN011 | (Variation 1) | Specific dates applied",
            event_segment: "WN011EV1O",
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
            event_label: "WN011 | (Variation 1) | Month applied",
            event_segment: "WN011EV1P",
          },
        });
        console.log("Month applied in search");
      }

      // 14. Breaks Card Continue To Rooms Click
      if (e.target.closest(".breakDetailItem .breakDetailItemCta")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN011 | Event Tracking",
            event_label:
              "WN011 | (Variation 1) | Breaks Card Continue To Rooms click",
            event_segment: "WN011EV1U",
          },
        });
        console.log("Breaks Card Continue To Rooms Click");
      }
    },
    true,
  );

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
            event_label: "WN011 | (Variation 1) | Search By Week toggle click",
            event_segment: "WN011EV1M",
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
            event_label: "WN011 | (Variation 1) | Search by Month toggle click",
            event_segment: "WN011EV1N",
          },
        });
        console.log("Search by Month Toggle Click");
      }
    },
    true,
  );

  // Capture phase: runs before the site's own click code
  document.addEventListener("click", rememberScrollBeforeOpen, true);
  document.addEventListener("click", handleBookClick, true);
  document.addEventListener("click", handleSearchSubmit, true);
  document.addEventListener("click", handleLosChipClick, true);
  document.addEventListener("click", handleMonthClick, true);
  document.addEventListener("click", handleWhoClick, true);
  document.addEventListener("click", handleCloseClick, true);
  window.addEventListener("keydown", handleEscapeKey, true);
  document.addEventListener("click", handleChangeSearchClick, true);
  // After handleSearchSubmit, so a blocked search doesn't reach it
  document.addEventListener("click", handleClickElsewhere, true);

  // The customer takes over. Not "once": a repeat search re-enables aligning
  ["wheel", "touchstart", "mousedown", "keydown"].forEach((type) => {
    window.addEventListener(type, stopAligningResults, { passive: true });
  });

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("scroll", queueSearchDock, { passive: true });
  window.addEventListener("resize", queueSearchDock);
})();
