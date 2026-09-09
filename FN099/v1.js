// console.log("David Silva | FN099 variation 1");

(function () {
  var TITLE_WRAPPER_CLASS = "cro-fn099-plp-title-wrapper";
  var DESCRIPTION_CLASS = "cro-fn099-plp-description";
  var HUB_LINK_CLASS = "cro-fn099-plp-hub-link";
  var HUB_LINK_CAROUSEL_CLASS = "cro-fn099-plp-hub-link-carousel";
  var HUB_LINK_GRID_CLASS = "cro-fn099-plp-hub-link-grid";
  var HUB_ROW_CLASS = "cro-fn099-plp-hub-row";
  var HUB_CAROUSEL_WRAPPER_CLASS = "cro-fn099-plp-hub-carousel-wrapper";
  var lastH1 = null;

  function isPlpPage() {
    // Assumes standard Shopify collection URL structure: /collections/xxx
    // Adjust this pattern if PLP URLs differ on this site.
    return /\/collections\//.test(location.pathname);
  }

  function applyTitleStyle() {
    var h1 = document.querySelector("h1");
    if (!h1 || h1 === lastH1) return;

    lastH1 = h1;
    if (h1.parentElement) {
      h1.parentElement.classList.add(TITLE_WRAPPER_CLASS);
    }
  }

  function applyDescriptionStyle() {
    var paragraphs = document.querySelectorAll("read-more p");
    for (var i = 0; i < paragraphs.length; i++) {
      paragraphs[i].classList.add(DESCRIPTION_CLASS);
    }
  }

  function findHubSection() {
    // ".page-margin-slider" is unique to this collections-hub component,
    // used to scope down from the page-wide "a.button" pattern so unrelated
    // buttons elsewhere (e.g. promo banners) never match.
    var slider = document.querySelector(".page-margin-slider");
    return slider ? slider.closest(".shopify-section") : null;
  }

  function applyHubLinksStyle() {
    var hubSection = findHubSection();
    if (!hubSection) return;

    var links = hubSection.querySelectorAll('a.button[href^="/collections/"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      link.classList.add(HUB_LINK_CLASS);
      if (link.closest(".swiper-collections-hub")) {
        link.classList.add(HUB_LINK_CAROUSEL_CLASS);
      } else {
        link.classList.add(HUB_LINK_GRID_CLASS);
      }
    }

    var rows = hubSection.querySelectorAll(".flex.flex-row.flex-wrap.gap-8");
    for (var j = 0; j < rows.length; j++) {
      rows[j].classList.add(HUB_ROW_CLASS);
    }

    var slider = hubSection.querySelector(".page-margin-slider");
    var carouselWrapper = slider ? slider.parentElement : null;
    if (carouselWrapper) {
      carouselWrapper.classList.add(HUB_CAROUSEL_WRAPPER_CLASS);
    }

    updateCollectionsHubSwiper(hubSection);
  }

  function updateCollectionsHubSwiper(hubSection) {
    var swiperEl = hubSection.querySelector(".swiper-collections-hub");
    // Our CSS resizes .swiper-slide directly, but Swiper caches slide widths
    // internally for its swipe/snap math - update() re-measures the DOM so
    // that internal state matches what's now on screen.
    if (
      swiperEl &&
      swiperEl.swiper &&
      typeof swiperEl.swiper.update === "function"
    ) {
      swiperEl.swiper.update();
    }
  }

  var HUB_LINK_EXACT_LABELS = {
    "view all": "All",
    "men's long sleeved shirts": "Long Sleeved",
    "men's checked shirts": "Checked",
    "men's overshirts": "Overshirts",
  };

  function stripWord(text, word) {
    var pattern = new RegExp("\\s*" + word + "\\s*", "gi");
    return text.replace(pattern, " ").replace(/\s+/g, " ").trim();
  }

  function applyHubLinkCopy(el) {
    var text = el.textContent.replace(/’/g, "'").trim();
    var lower = text.toLowerCase();

    if (Object.prototype.hasOwnProperty.call(HUB_LINK_EXACT_LABELS, lower)) {
      el.textContent = HUB_LINK_EXACT_LABELS[lower];
      return;
    }

    if (lower.indexOf("women's") !== -1) {
      el.textContent = stripWord(text, "women's");
      return;
    }

    if (lower.indexOf("men's") !== -1) {
      el.textContent = stripWord(text, "men's");
    }
  }

  function applyHubLinksCopy() {
    var links = document.querySelectorAll("." + HUB_LINK_CLASS);
    for (var i = 0; i < links.length; i++) {
      applyHubLinkCopy(links[i]);
    }
  }

  var HUB_ROW_ANCHOR_ATTR = "data-cro-fn099-hub-row-anchor";

  function isDesktopViewport() {
    return window.matchMedia("(min-width: 1024px)").matches;
  }

  function moveHubLinksGridRow() {
    var sample = document.querySelector("." + HUB_LINK_GRID_CLASS);
    if (!sample) return;

    var hubRow = sample.closest(".flex.flex-row.flex-wrap.gap-8");
    if (!hubRow) return;

    // Remember where this row originally lived, so it can be moved back
    // when the viewport drops below desktop.
    if (!hubRow.__croAnchor) {
      var originalWrapper = hubRow.closest('[class*="pdpDesktop:block"]');
      if (originalWrapper) {
        var anchor = document.createElement("span");
        anchor.setAttribute(HUB_ROW_ANCHOR_ATTR, "true");
        anchor.style.display = "none";
        hubRow.parentNode.insertBefore(anchor, hubRow);
        hubRow.__croAnchor = anchor;
        hubRow.__croWrapper = originalWrapper;
      }
    }

    var anchor = hubRow.__croAnchor;
    var originalWrapper = hubRow.__croWrapper;

    if (isDesktopViewport()) {
      var filtersTrigger = document.querySelector("filters-trigger");
      if (!filtersTrigger || !filtersTrigger.parentNode) return;

      if (filtersTrigger.nextElementSibling !== hubRow) {
        filtersTrigger.parentNode.insertBefore(
          hubRow,
          filtersTrigger.nextSibling,
        );
      }
      if (originalWrapper) {
        originalWrapper.style.display = "none";
      }
    } else if (anchor && anchor.parentNode) {
      if (anchor.nextSibling !== hubRow) {
        anchor.parentNode.insertBefore(hubRow, anchor.nextSibling);
      }
      if (originalWrapper) {
        originalWrapper.style.display = "";
      }
    }
  }

  function applyPlpStyles() {
    if (!isPlpPage()) return;
    applyTitleStyle();
    applyDescriptionStyle();
    applyHubLinksStyle();
    applyHubLinksCopy();
    moveHubLinksGridRow();
  }

  var debounceTimer;
  var observer = new MutationObserver(function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyPlpStyles, 300);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  applyPlpStyles();

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyPlpStyles, 300);
  });
})();

function trackEvents() {
  if (!document.querySelector("body").classList.contains("FN009")) {
    document.querySelector("body").classList.add("FN009");
    document.addEventListener("click", (e) => {
      // 1. Category quicklink click
      if (e.target.closest(".cro-fn099-plp-hub-link")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN099 | Event Tracking",
            eventLabel: "FN099 | (Variation 1) | Category quicklink click",
            eventSegment: "FN099EV1G",
          },
        });

        // console.log("Category quicklink click");
      }

      // 2. Read more click
      if (e.target.closest("[data-readmore-trigger]")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN099 | Event Tracking",
            eventLabel: "FN099 | (Variation 1) | Read more clicK",
            eventSegment: "FN099EV1H",
          },
        });

        // console.log("Read more Click");
      }

      // 3. Hides filters / 4. Opens filters
      var filtersTriggerEl = e.target.closest("filters-trigger");
      if (filtersTriggerEl) {
        setTimeout(function () {
          var label = filtersTriggerEl.querySelector("[data-filter-toggle]");
          if (!label) return;

          var text = label.textContent.trim();
          if (text === "Filters & Sort") {
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                eventCategory: "Conversio CRO",
                eventAction: "FN099 | Event Tracking",
                eventLabel: "FN099 | (Variation 1) | Hides filters",
                eventSegment: "FN099EV1I",
              },
            });

            // console.log("Hides filters");
          } else if (text === "Hide Filters") {
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                eventCategory: "Conversio CRO",
                eventAction: "FN099 | Event Tracking",
                eventLabel: "FN099 | (Variation 1) | Opens filters",
                eventSegment: "FN099EV1J",
              },
            });

            // console.log("Opens filters");
          }
        }, 0);
      }

      // 3. Hides filters (mobile drawer close button)
      if (
        e.target.closest(
          'collection-filters-form[data-drawer-id="collection-filter-drawer"] .close-btn',
        )
      ) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN099 | Event Tracking",
            eventLabel: "FN099 | (Variation 1) | Hides filters",
            eventSegment: "FN099EV1I",
          },
        });

        // console.log("Hides filters");
      }

      // 4. Opens filters (mobile drawer trigger)
      if (
        e.target.closest(
          'drawer-trigger[data-drawer-id="collection-filter-drawer"]',
        )
      ) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN099 | Event Tracking",
            eventLabel: "FN099 | (Variation 1) | Opens filters",
            eventSegment: "FN099EV1J",
          },
        });

        // console.log("Opens filters");
      }

      // 5. Applies filter
      if (e.target.closest(".mobile-filter label")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN099 | Event Tracking",
            eventLabel: "FN099 | (Variation 1) | Applies filter",
            eventSegment: "FN099EV1K",
          },
        });

        // console.log("Applies filter");
      }

      // 6. PLP ATB
      if (e.target.closest("[data-quickbuy-variant]")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN099 | Event Tracking",
            eventLabel: "FN099 | (Variation 1) | PLP ATB",
            eventSegment: "FN099EV1L",
          },
        });

        // console.log("PLP ATB");
      }

      // 7. PLP > PDP Clickthrough / 8. Selects colour
      var productLink = e.target.closest('product-card a[href^="/products/"]');
      if (productLink) {
        if (productLink.hasAttribute("data-swatch")) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN099 | Event Tracking",
              eventLabel: "FN099 | (Variation 1) | Selects colour",
              eventSegment: "FN099EV1N",
            },
          });

          // console.log("Selects colour");
        } else {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN099 | Event Tracking",
              eventLabel: "FN099 | (Variation 1) | PLP > PDP Clickthrough",
              eventSegment: "FN099EV1M",
            },
          });

          // console.log("PLP > PDP Clickthrough");
        }
      }
    });
  }
}

trackEvents();
