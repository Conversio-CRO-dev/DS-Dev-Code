console.log("David Silva | TS028.2 variation 1");

(function () {
  var DROPDOWN_BOUND_FLAG = "sellingFastDropdownBound";
  var DATE_BOUND_FLAG = "sellingFastDateBound";
  var DATE_WATCHER_FLAG = "sellingFastDateWatcherBound";
  var CARD_OBSERVER_FLAG = "sellingFastCardObserverBound";
  var PAGE_OBSERVER_FLAG = "sellingFastPageObserverBound";
  var SEARCH_BUTTON_FLAG = "sellingFastSearchButtonBound";

  function pushEvent(label, segment) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "TS028.2 | Event Tracking",
        eventLabel: label,
        eventSegment: segment,
      },
    });
  }

  var TRACKING_FLAGS = {
    urgencyPageFired: false,
  };

  var SEARCH_STATE = {
    pending: false,
    polling: false,
    lastSignature: "",
    resultsContainer: null,
    resultsObserver: null,
    pendingDate: null,
    committedDate: null,
  };

  function clockIcon() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
        <image
          width="96"
          height="96"
          preserveAspectRatio="none"
          href="data:image/png;base64,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"
        />
      </svg>
    `;
  }

  function createSellingFastPill() {
    var pill = document.createElement("span");
    pill.className = "selling-fast-pill-sa";
    pill.innerHTML = "SELLING FAST " + clockIcon();
    return pill;
  }

  function isTimeText(text) {
    return /^\d{2}:\d{2}$/.test((text || "").trim());
  }

  function parseTimeToMinutes(text) {
    var value = (text || "").trim();
    if (!isTimeText(value)) return null;

    var parts = value.split(":");
    var hours = parseInt(parts[0], 10);
    var mins = parseInt(parts[1], 10);

    if (isNaN(hours) || isNaN(mins)) return null;
    return hours * 60 + mins;
  }

  function parseAriaLabelDate(label) {
    if (!label) return null;
    var parsed = new Date(label);
    if (isNaN(parsed.getTime())) return null;
    return parsed;
  }

  function getLiveSelectedDate() {
    var selectedDay = document.querySelector(".flatpickr-day.selected");
    if (selectedDay) {
      var ariaDate = parseAriaLabelDate(selectedDay.getAttribute("aria-label"));
      if (ariaDate) return ariaDate;
    }

    var input =
      document.querySelector('input[name="searchdate"]') ||
      document.querySelector('input[aria-label="searchdate"]') ||
      document.querySelector(".flatpickr-input");

    if (!input || !input.value) return null;

    var parsed = new Date(input.value);
    if (!isNaN(parsed.getTime())) return parsed;

    var match = input.value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (match) {
      var day = parseInt(match[1], 10);
      var month = parseInt(match[2], 10) - 1;
      var year = parseInt(match[3], 10);
      if (year < 100) year += 2000;
      var manual = new Date(year, month, day);
      if (!isNaN(manual.getTime())) return manual;
    }

    return null;
  }

  function getSelectedDate() {
    if (SEARCH_STATE.pending && SEARCH_STATE.committedDate) {
      return SEARCH_STATE.committedDate;
    }

    if (SEARCH_STATE.committedDate) {
      return SEARCH_STATE.committedDate;
    }

    var live = getLiveSelectedDate();
    if (live) {
      SEARCH_STATE.committedDate = live;
    }

    return live;
  }

  function isWeekendDate(date) {
    if (!date) return false;
    var day = date.getDay();
    return day === 0 || day === 6;
  }

  function chooseSellingFastTimes(timeTexts) {
    if (!timeTexts || !timeTexts.length) return [];

    var date = getSelectedDate();
    var weekend = isWeekendDate(date);

    var parsed = timeTexts
      .map(function (timeText) {
        return {
          raw: timeText,
          minutes: parseTimeToMinutes(timeText),
        };
      })
      .filter(function (item) {
        return item.minutes !== null;
      })
      .sort(function (a, b) {
        return a.minutes - b.minutes;
      });

    if (!parsed.length) return [];

    if (!weekend) {
      var weekdayMatches = parsed.filter(function (item) {
        return item.minutes >= 18 * 60;
      });

      return weekdayMatches.length ? [weekdayMatches[0].raw] : [];
    }

    var weekendPrimary = parsed.filter(function (item) {
      return item.minutes >= 14 * 60 && item.minutes <= 16 * 60;
    });

    if (weekendPrimary.length) {
      return [weekendPrimary[0].raw];
    }

    var weekendFallback = parsed.filter(function (item) {
      return item.minutes >= 12 * 60 && item.minutes <= 14 * 60;
    });

    return weekendFallback.length ? [weekendFallback[0].raw] : [];
  }

  function getDesktopTimeButtons(card) {
    return Array.from(card.querySelectorAll("button")).filter(function (btn) {
      if (btn.getAttribute("aria-haspopup") === "listbox") return false;
      var text = btn.textContent.replace(/\s+/g, " ").trim();
      return isTimeText(text);
    });
  }

  function getMobileDropdownButton(card) {
    return Array.from(
      card.querySelectorAll('button[aria-haspopup="listbox"]'),
    ).find(function (btn) {
      var text = btn.textContent.replace(/\s+/g, " ").trim().toLowerCase();

      return (
        text.indexOf("available times") > -1 ||
        isTimeText(text) ||
        !!btn.querySelector('use[href*="#Clock"], use[xlink\\:href*="#Clock"]')
      );
    });
  }

  function hasExposedMobileTimesStructure(card) {
    return !!(
      card.querySelector(".lg\\:hidden .swiper .swiper-slide button[value]") ||
      card.querySelector(
        ".lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2 button[aria-haspopup='listbox']",
      ) ||
      card.querySelector(".lg\\:hidden button[aria-haspopup='listbox']")
    );
  }

  function getOptionTimeSpan(option) {
    return (
      option.querySelector("span.block.truncate") ||
      option.querySelector("span")
    );
  }

  function getTargetCards() {
    return Array.from(document.querySelectorAll("li.flex.flex-col")).filter(
      function (card) {
        var heading = Array.from(card.querySelectorAll("h2")).find(
          function (el) {
            return (
              el.textContent
                .trim()
                .toLowerCase()
                .indexOf("available experience times") > -1
            );
          },
        );

        var desktopButtons = getDesktopTimeButtons(card);
        var mobileButton = getMobileDropdownButton(card);
        var mobileGroupedTimes = card.querySelector(
          ".lg\\:hidden.flex.flex-col",
        );

        return (
          !!heading ||
          !!desktopButtons.length ||
          !!mobileButton ||
          !!mobileGroupedTimes
        );
      },
    );
  }

  function getResultsContainer() {
    var cards = getTargetCards();
    if (cards.length && cards[0].parentElement) {
      return cards[0].parentElement;
    }

    var searchHeading = Array.from(document.querySelectorAll("h1,h2")).find(
      function (el) {
        return (
          el.textContent.replace(/\s+/g, " ").trim().toLowerCase() ===
          "race search results"
        );
      },
    );

    if (searchHeading) {
      var next = searchHeading.parentElement;
      if (next) return next.parentElement || next;
    }

    return document.body;
  }

  function getCardSignature(card) {
    if (!card) return "";

    var title = "";
    var heading = card.querySelector("h3");
    if (heading) {
      title = heading.textContent.replace(/\s+/g, " ").trim();
    }

    var buttons = getDesktopTimeButtons(card)
      .map(function (button) {
        return button.textContent.replace(/\s+/g, " ").trim();
      })
      .join(",");

    var mobileButton = getMobileDropdownButton(card);
    var mobileText = mobileButton
      ? mobileButton.textContent.replace(/\s+/g, " ").trim()
      : "";

    return title + "::" + buttons + "::" + mobileText;
  }

  function getResultsSignature() {
    return getTargetCards()
      .map(function (card) {
        return getCardSignature(card);
      })
      .join("|||");
  }

  function removeDesktopPill(card) {
    Array.from(card.querySelectorAll(".selling-fast-times-header-sa")).forEach(
      function (row) {
        var heading = row.querySelector("h2");
        if (heading && row.parentNode) {
          row.parentNode.insertBefore(heading, row);
        }
        row.remove();
      },
    );
  }

  function ensureDesktopPill(card) {
    var heading = Array.from(card.querySelectorAll("h2")).find(function (el) {
      return (
        el.textContent
          .trim()
          .toLowerCase()
          .indexOf("available experience times") > -1
      );
    });

    if (!heading) return;
    if (
      heading.parentElement &&
      heading.parentElement.classList.contains("selling-fast-times-header-sa")
    ) {
      return;
    }

    var row = document.createElement("div");
    row.className = "selling-fast-times-header-sa";
    heading.parentNode.insertBefore(row, heading);
    row.appendChild(heading);
    row.appendChild(createSellingFastPill());
  }

  function removeMobileHeaderPill(card) {
    Array.from(
      card.querySelectorAll(".selling-fast-mobile-header-pill-sa"),
    ).forEach(function (el) {
      el.remove();
    });
  }

  function ensureMobileHeaderPill(card) {
    if (!hasExposedMobileTimesStructure(card)) {
      removeMobileHeaderPill(card);
      return;
    }

    var mobileBestSellerWrap = Array.from(
      card.querySelectorAll(".flex.flex-row.justify-between.items-center"),
    ).find(function (row) {
      return (
        row.querySelector(".lg\\:hidden") &&
        row.textContent
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .indexOf("best seller") > -1
      );
    });

    if (!mobileBestSellerWrap) return;
    if (
      mobileBestSellerWrap.querySelector(".selling-fast-mobile-header-pill-sa")
    )
      return;

    var bestSellerHolder = mobileBestSellerWrap.querySelector(".lg\\:hidden");
    if (!bestSellerHolder) return;

    var holder = document.createElement("span");
    holder.className = "selling-fast-mobile-header-pill-sa";
    holder.appendChild(createSellingFastPill());

    mobileBestSellerWrap.insertBefore(holder, bestSellerHolder.nextSibling);
  }

  function removeMobilePill(card) {
    removeMobileHeaderPill(card);
    Array.from(
      card.querySelectorAll(".selling-fast-mobile-pill-wrap-sa"),
    ).forEach(function (el) {
      el.remove();
    });
  }

  function ensureMobilePill(card) {
    ensureMobileHeaderPill(card);

    if (card.querySelector(".selling-fast-mobile-header-pill-sa")) {
      Array.from(
        card.querySelectorAll(".selling-fast-mobile-pill-wrap-sa"),
      ).forEach(function (el) {
        el.remove();
      });
      return;
    }

    var button = getMobileDropdownButton(card);
    if (!button) {
      Array.from(
        card.querySelectorAll(".selling-fast-mobile-pill-wrap-sa"),
      ).forEach(function (el) {
        el.remove();
      });
      return;
    }

    var mobileRow = button.closest(
      ".lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2",
    );
    if (!mobileRow) return;

    var parent = mobileRow.parentElement;
    if (!parent) return;
    if (parent.querySelector(".selling-fast-mobile-pill-wrap-sa")) return;

    var wrap = document.createElement("div");
    wrap.className = "selling-fast-mobile-pill-wrap-sa";
    wrap.appendChild(createSellingFastPill());

    parent.insertBefore(wrap, mobileRow);
  }

  function ensureMobileRowLayout(card) {
    var mobileRow = card.querySelector(
      ".lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2",
    );
    if (!mobileRow) return;

    var children = Array.from(mobileRow.children);
    var dropdownButton = mobileRow.querySelector(
      'button[aria-haspopup="listbox"]',
    );
    var bookingLink = mobileRow.querySelector('a[href*="booking"]');

    var dropdownContainer = dropdownButton
      ? dropdownButton.closest(".flex-1")
      : null;
    var bookButtonContainer = bookingLink
      ? bookingLink.closest(".min-w-max")
      : null;

    if (
      dropdownContainer &&
      bookButtonContainer &&
      children.indexOf(dropdownContainer) >
        children.indexOf(bookButtonContainer)
    ) {
      mobileRow.insertBefore(dropdownContainer, bookButtonContainer);
    }

    if (dropdownContainer) {
      dropdownContainer.classList.add("mobile-dropdown-container");
      dropdownContainer.style.flex = "7 1 0%";
      dropdownContainer.style.width = "100%";
      dropdownContainer.style.minWidth = "0";

      var dropdownBtn = dropdownContainer.querySelector("button");
      if (dropdownBtn) {
        dropdownBtn.style.width = "100%";
        dropdownBtn.style.height = "100%";
        dropdownBtn.style.display = "flex";
        dropdownBtn.style.alignItems = "center";
        dropdownBtn.style.justifyContent = "start";

        var relativeWrapper = dropdownBtn.closest(".relative");
        if (relativeWrapper && dropdownContainer.contains(relativeWrapper)) {
          relativeWrapper.style.width = "100%";
          relativeWrapper.style.display = "flex";
        }
      }
    }

    if (bookButtonContainer) {
      bookButtonContainer.classList.add("mobile-book-container");
      bookButtonContainer.style.flex = "3 1 0%";
      bookButtonContainer.style.width = "100%";
      bookButtonContainer.style.minWidth = "0";

      var bookButton = bookButtonContainer.querySelector("a");
      if (bookButton) {
        bookButton.style.width = "100%";
        bookButton.style.height = "100%";
        bookButton.style.display = "flex";
        bookButton.style.alignItems = "center";
        bookButton.style.justifyContent = "center";
        bookButton.style.textAlign = "center";
      }
    }

    mobileRow.classList.add("mobile-row-layout-active");
  }

  function getCardSellingFastTimes(card) {
    var buttons = getDesktopTimeButtons(card);

    var timeTexts = buttons.map(function (button) {
      return button.textContent.replace(/\s+/g, " ").trim();
    });

    if (!timeTexts.length) {
      var mobileButton = getMobileDropdownButton(card);
      if (mobileButton) {
        var mobileText = mobileButton.textContent.replace(/\s+/g, " ").trim();
        var timeMatch = mobileText.match(/\b\d{2}:\d{2}\b/);
        if (timeMatch) {
          timeTexts.push(timeMatch[0]);
        }
      }
    }

    if (!timeTexts.length) return [];

    return chooseSellingFastTimes(timeTexts);
  }

  function cardHasSellingFastSlot(card) {
    var buttons = getDesktopTimeButtons(card);
    if (!buttons.length) return false;

    var chosenTimes = getCardSellingFastTimes(card);
    if (!chosenTimes.length) return false;

    return buttons.some(function (button) {
      var buttonTime = button.textContent.replace(/\s+/g, " ").trim();
      return chosenTimes.indexOf(buttonTime) > -1;
    });
  }

  function bindMobileDropdown(card) {
    var button = getMobileDropdownButton(card);
    if (!button) return;
    if (button.dataset[DROPDOWN_BOUND_FLAG] === "true") return;

    button.dataset[DROPDOWN_BOUND_FLAG] = "true";

    button.addEventListener("click", function () {
      if (window.innerWidth <= 1024) {
        // 2. Time Slot Drop Down Opened
        pushEvent(
          "TS028.2 | (Variation 1) | Time Slot Drop Down Opened",
          "TS028.2EV1G",
        );
      }
    });
  }

  function refreshSellingFast(card) {
    if (!card || !document.body.contains(card)) return;

    var hasSellingFastSlot = cardHasSellingFastSlot(card);

    if (hasSellingFastSlot) {
      ensureDesktopPill(card);
      ensureMobilePill(card);

      if (!TRACKING_FLAGS.urgencyPageFired) {
        TRACKING_FLAGS.urgencyPageFired = true;

        // 1. Search Pages with Selling Fast Badge
        pushEvent(
          "TS028.2 | (Variation 1) | Search Pages with Selling Fast Badge",
          "TS028.2EV1Q",
        );
      }
    } else {
      removeDesktopPill(card);
      removeMobilePill(card);
    }

    ensureMobileRowLayout(card);
  }

  function refreshAllSellingFast() {
    var cards = getTargetCards();
    cards.forEach(function (card) {
      initCard(card);
      refreshSellingFast(card);
    });
  }

  function queueRefreshAfterSearch() {
    SEARCH_STATE.pending = true;
    SEARCH_STATE.pendingDate = getLiveSelectedDate();
  }

  function beginSearchRefreshWatch() {
    if (SEARCH_STATE.polling) return;

    SEARCH_STATE.polling = true;
    var attempts = 0;
    var maxAttempts = 100;
    var baseline = SEARCH_STATE.lastSignature;

    var timer = setInterval(function () {
      attempts += 1;

      var currentSignature = getResultsSignature();
      var cards = getTargetCards();

      if (cards.length && currentSignature && currentSignature !== baseline) {
        clearInterval(timer);
        SEARCH_STATE.polling = false;
        SEARCH_STATE.pending = false;
        SEARCH_STATE.lastSignature = currentSignature;

        if (SEARCH_STATE.pendingDate) {
          SEARCH_STATE.committedDate = SEARCH_STATE.pendingDate;
          SEARCH_STATE.pendingDate = null;
        } else {
          SEARCH_STATE.committedDate = getLiveSelectedDate();
        }

        refreshAllSellingFast();
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
        SEARCH_STATE.polling = false;
        SEARCH_STATE.pending = false;
        SEARCH_STATE.lastSignature = currentSignature;

        if (SEARCH_STATE.pendingDate) {
          SEARCH_STATE.committedDate = SEARCH_STATE.pendingDate;
          SEARCH_STATE.pendingDate = null;
        } else {
          SEARCH_STATE.committedDate = getLiveSelectedDate();
        }

        refreshAllSellingFast();
      }
    }, 200);
  }

  function bindDateChange() {
    var input =
      document.querySelector('input[name="searchdate"]') ||
      document.querySelector('input[aria-label="searchdate"]') ||
      document.querySelector(".flatpickr-input");

    if (!input) return;
    if (input.dataset[DATE_BOUND_FLAG] === "true") return;

    input.dataset[DATE_BOUND_FLAG] = "true";

    input.addEventListener("change", function () {
      queueRefreshAfterSearch();
    });

    input.addEventListener("input", function () {
      queueRefreshAfterSearch();
    });

    document.addEventListener("click", function (e) {
      var day = e.target.closest(".flatpickr-day");
      if (!day || day.classList.contains("flatpickr-disabled")) return;
      queueRefreshAfterSearch();
    });
  }

  function bindDateWatcher() {
    var input =
      document.querySelector('input[name="searchdate"]') ||
      document.querySelector('input[aria-label="searchdate"]') ||
      document.querySelector(".flatpickr-input");

    if (!input) return;
    if (input.dataset[DATE_WATCHER_FLAG] === "true") return;

    input.dataset[DATE_WATCHER_FLAG] = "true";

    var lastValue = input.value;
    var lastSelectedAria = "";
    var selectedDay = document.querySelector(".flatpickr-day.selected");
    if (selectedDay) {
      lastSelectedAria = selectedDay.getAttribute("aria-label") || "";
    }

    setInterval(function () {
      var currentSelectedDay = document.querySelector(
        ".flatpickr-day.selected",
      );
      var currentSelectedAria = currentSelectedDay
        ? currentSelectedDay.getAttribute("aria-label") || ""
        : "";

      if (
        input.value !== lastValue ||
        currentSelectedAria !== lastSelectedAria
      ) {
        lastValue = input.value;
        lastSelectedAria = currentSelectedAria;
        queueRefreshAfterSearch();
      }
    }, 300);
  }

  function bindSearchButton() {
    var searchButton = Array.from(document.querySelectorAll("button, a")).find(
      function (el) {
        return (
          el.textContent.replace(/\s+/g, " ").trim().toLowerCase() === "search"
        );
      },
    );

    if (!searchButton) return;
    if (searchButton.dataset[SEARCH_BUTTON_FLAG] === "true") return;

    searchButton.dataset[SEARCH_BUTTON_FLAG] = "true";

    searchButton.addEventListener("click", function () {
      SEARCH_STATE.lastSignature = getResultsSignature();
      SEARCH_STATE.pending = true;
      SEARCH_STATE.pendingDate = getLiveSelectedDate();

      setTimeout(function () {
        beginSearchRefreshWatch();
      }, 50);
    });
  }

  function bindCardObserver(card) {
    if (!card) return;
    if (card.dataset[CARD_OBSERVER_FLAG] === "true") return;

    card.dataset[CARD_OBSERVER_FLAG] = "true";

    var debounceTimer = null;

    var observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (!document.body.contains(card)) return;
        if (SEARCH_STATE.pending) return;
        refreshSellingFast(card);
      }, 120);
    });

    observer.observe(card, {
      childList: true,
      subtree: true,
    });
  }

  function bindPageObserver() {
    var container = getResultsContainer();
    if (!container) return;

    if (
      SEARCH_STATE.resultsContainer === container &&
      SEARCH_STATE.resultsObserver
    ) {
      return;
    }

    if (SEARCH_STATE.resultsObserver) {
      SEARCH_STATE.resultsObserver.disconnect();
    }

    SEARCH_STATE.resultsContainer = container;

    var debounceTimer = null;
    var observer = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (SEARCH_STATE.pending) {
          beginSearchRefreshWatch();
          return;
        }

        refreshAllSellingFast();
      }, 150);
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    SEARCH_STATE.resultsObserver = observer;

    if (document.documentElement.dataset[PAGE_OBSERVER_FLAG] !== "true") {
      document.documentElement.dataset[PAGE_OBSERVER_FLAG] = "true";
    }
  }

  function bindCardClickTracking(card) {
    if (card.dataset.ts028ClicksBound === "true") return;
    card.dataset.ts028ClicksBound = "true";

    card.addEventListener("click", function (e) {
      // EV1K: Book Now
      var bookLink = e.target.closest('a[href*="booking"]');
      if (bookLink && card.contains(bookLink)) {
        // 8. Any Experience BOOK NOW Click
        pushEvent(
          "TS028.2 | (Variation 1) | Any Experience BOOK NOW Click",
          "TS028.2EV1M",
        );

        if (cardHasSellingFastSlot(card)) {
          // 4. Selling Fast Experience BOOK NOW Click
          pushEvent(
            "TS028.2 | (Variation 1) | Selling Fast Experience BOOK NOW Click",
            "TS028.2EV1I",
          );
        } else {
          // 6. Non Selling Fast Experience BOOK NOW Click
          pushEvent(
            "TS028.2 | (Variation 1) | Non Selling Fast Experience BOOK NOW Click",
            "TS028.2EV1K",
          );
        }

        return;
      }

      // Desktop time slot buttons (EV1J / EV1L / EV1M)
      var btn = e.target.closest("button");
      if (
        btn &&
        card.contains(btn) &&
        btn.getAttribute("aria-haspopup") !== "listbox"
      ) {
        var btnText = btn.textContent.replace(/\s+/g, " ").trim();
        if (isTimeText(btnText)) {
          // 7. Any Slot Click
          pushEvent("TS028.2 | (Variation 1) | Any Slot Click", "TS028.2EV1L");
          if (getCardSellingFastTimes(card).indexOf(btnText) > -1) {
            // 3. Selling Fast Experience Slot Click
            pushEvent(
              "TS028.2 | (Variation 1) | Selling Fast Experience Slot Click",
              "TS028.2EV1H",
            );
          } else {
            // 5. Non Selling Fast Experience Slot Click
            pushEvent(
              "TS028.2 | (Variation 1) | Non Selling Fast Experience Slot Click",
              "TS028.2EV1J",
            );
          }
          return;
        }
      }

      // Mobile dropdown options (EV1J / EV1L / EV1M)
      var option = e.target.closest('li[role="option"]');
      if (option && card.contains(option)) {
        var timeSpan = getOptionTimeSpan(option);
        if (timeSpan && /\b\d{2}:\d{2}\b/.test(timeSpan.textContent)) {
          // 7. Any Slot Click
          pushEvent("TS028.2 | (Variation 1) | Any Slot Click", "TS028.2EV1L");
          var optionMatch = timeSpan.textContent
            .replace(/\s+/g, " ")
            .trim()
            .match(/\b\d{2}:\d{2}\b/);
          var optionTime = optionMatch ? optionMatch[0] : "";
          if (getCardSellingFastTimes(card).indexOf(optionTime) > -1) {
            // 3. Selling Fast Experience Slot Click
            pushEvent(
              "TS028.2 | (Variation 1) | Selling Fast Experience Slot Click",
              "TS028.2EV1H",
            );
          } else {
            //  5. Non Selling Fast Experience Slot Click
            pushEvent(
              "TS028.2 | (Variation 1) | Non Selling Fast Experience Slot Click",
              "TS028.2EV1J",
            );
          }
        }
      }
    });
  }

  function initCard(card) {
    if (!card) return;

    ensureMobileRowLayout(card);
    bindMobileDropdown(card);
    bindCardObserver(card);
    bindCardClickTracking(card);
  }

  function tryInit() {
    bindDateChange();
    bindDateWatcher();
    bindSearchButton();
    bindPageObserver();
    refreshAllSellingFast();
    SEARCH_STATE.lastSignature = getResultsSignature();

    if (!SEARCH_STATE.committedDate) {
      SEARCH_STATE.committedDate = getLiveSelectedDate();
    }

    return getTargetCards().length > 0;
  }

  if (!tryInit()) {
    var observer = new MutationObserver(function () {
      bindSearchButton();
      bindPageObserver();

      if (tryInit()) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    setTimeout(function () {
      observer.disconnect();
    }, 10000);
  }
})();
