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

  function getOptionTimeSpan(option) {
    return (
      option.querySelector("span.block.truncate") ||
      option.querySelector("span")
    );
  }

  function getDropdownListForButton(button) {
    if (!button) return null;

    var controlledId = button.getAttribute("aria-controls");
    if (controlledId) {
      var list = document.getElementById(controlledId);
      if (list) return list;
    }

    var labelledBy = button.getAttribute("aria-labelledby");
    if (labelledBy) {
      var possibleIds = labelledBy.split(/\s+/);
      for (var i = 0; i < possibleIds.length; i += 1) {
        var possibleList = document.querySelector(
          'ul[role="listbox"][aria-labelledby*="' + possibleIds[i] + '"]',
        );
        if (possibleList) return possibleList;
      }
    }

    var wrap = button.closest(".relative");
    if (!wrap) return null;

    return wrap.querySelector('ul[role="listbox"]');
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

  function checkCardSellingFast(card) {
    if (!card || !document.body.contains(card)) return;

    var chosenTimes = getCardSellingFastTimes(card);

    if (chosenTimes.length) {
      if (!TRACKING_FLAGS.urgencyPageFired) {
        TRACKING_FLAGS.urgencyPageFired = true;

        // 1. Search Pages with Selling Fast Badge
        pushEvent(
          "TS028.2 | (Control Original) | Search Pages with Selling Fast Badge",
          "TS028.2ECOQ",
        );
      }
    }
  }

  function checkAllSellingFast() {
    var cards = getTargetCards();
    cards.forEach(function (card) {
      initCard(card);
      checkCardSellingFast(card);
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

        checkAllSellingFast();
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

        checkAllSellingFast();
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

  function bindMobileDropdown(card) {
    var button = getMobileDropdownButton(card);
    if (!button) return;
    if (button.dataset[DROPDOWN_BOUND_FLAG] === "true") return;

    button.dataset[DROPDOWN_BOUND_FLAG] = "true";

    button.addEventListener("click", function () {
      if (window.innerWidth <= 1024) {
        // 2. Time Slot Drop Down Opened
        pushEvent(
          "TS028.2 | (Control Original) | Time Slot Drop Down Opened",
          "TS028.2ECOG",
        );
      }
    });
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
          "TS028.2 | (Control Original) | Any Experience BOOK NOW Click",
          "TS028.2ECOM",
        );

        if (getCardSellingFastTimes(card).length) {
          // 4. Selling Fast Experience BOOK NOW Click
          pushEvent(
            "TS028.2 | (Control Original) | Selling Fast Experience BOOK NOW Click",
            "TS028.2ECOI",
          );
        } else {
          // 6. Non Selling Fast Experience BOOK NOW Click
          pushEvent(
            "TS028.2 | (Control Original) | Non Selling Fast Experience BOOK NOW Click",
            "TS028.2ECOK",
          );
        }

        return;
      }

      var chosenTimes = getCardSellingFastTimes(card);

      // Desktop time slot buttons
      var btn = e.target.closest("button");
      if (
        btn &&
        card.contains(btn) &&
        btn.getAttribute("aria-haspopup") !== "listbox"
      ) {
        var btnText = btn.textContent.replace(/\s+/g, " ").trim();
        if (isTimeText(btnText)) {
          // 7. Any Slot Click
          pushEvent(
            "TS028.2 | (Control Original) | Any Slot Click",
            "TS028.2ECOL",
          );
          if (chosenTimes.indexOf(btnText) > -1) {
            //  3. Selling Fast Experience Slot Click
            pushEvent(
              "TS028.2 | (Control Original) | Selling Fast Experience Slot Click",
              "TS028.2ECOH",
            );
          } else {
            // 5. Non Selling Fast Experience Slot Click
            pushEvent(
              "TS028.2 | (Control Original) | Non Selling Fast Experience Slot Click",
              "TS028.2ECOJ",
            );
          }
          return;
        }
      }

      // Mobile dropdown options
      var option = e.target.closest('li[role="option"]');
      if (option && card.contains(option)) {
        var timeSpan = getOptionTimeSpan(option);
        if (timeSpan && /\b\d{2}:\d{2}\b/.test(timeSpan.textContent)) {
          var optionTimeMatch = timeSpan.textContent.match(/\b\d{2}:\d{2}\b/);
          var optionTime = optionTimeMatch ? optionTimeMatch[0] : "";
          // 7. Any Slot Click
          pushEvent(
            "TS028.2 | (Control Original) | Any Slot Click",
            "TS028.2ECOL",
          );
          if (optionTime && chosenTimes.indexOf(optionTime) > -1) {
            // 3. Selling Fast Experience Slot Click
            pushEvent(
              "TS028.2 | (Control Original) | Selling Fast Experience Slot Click",
              "TS028.2ECOH",
            );
          } else {
            // 5. Non Selling Fast Experience Slot Click
            pushEvent(
              "TS028.2 | (Control Original) | Non Selling Fast Experience Slot Click",
              "TS028.2ECOJ",
            );
          }
        }
      }
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
        checkCardSellingFast(card);
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

        checkAllSellingFast();
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

  function initCard(card) {
    if (!card) return;

    bindMobileDropdown(card);
    bindCardObserver(card);
    bindCardClickTracking(card);
  }

  function tryInit() {
    bindDateChange();
    bindDateWatcher();
    bindSearchButton();
    bindPageObserver();
    checkAllSellingFast();
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
