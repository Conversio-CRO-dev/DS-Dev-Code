// console.log("David Silva | FN099 variation 1");

(function () {
  var TITLE_WRAPPER_CLASS = "cro-fn099-plp-title-wrapper";
  var INTRO_WRAPPER_CLASS = "cro-fn099-plp-intro-wrapper";
  var DESCRIPTION_CLASS = "cro-fn099-plp-description";
  var HUB_LINK_CLASS = "cro-fn099-plp-hub-link";
  var HUB_LINK_CAROUSEL_CLASS = "cro-fn099-plp-hub-link-carousel";
  var HUB_LINK_GRID_CLASS = "cro-fn099-plp-hub-link-grid";
  var HUB_ROW_CLASS = "cro-fn099-plp-hub-row";
  var HUB_ROW_AVATAR_CLASS = "cro-fn099-plp-hub-row-avatar";
  var HUB_ROW_AVATAR_WRAPPER_CLASS = "cro-fn099-plp-hub-row-avatar-wrapper";
  var HUB_CAROUSEL_WRAPPER_CLASS = "cro-fn099-plp-hub-carousel-wrapper";
  var HUB_CAROUSEL_AVATAR_CLASS = "cro-fn099-plp-hub-carousel-avatar";
  var AVATAR_PLP_CLASS = "cro-fn099-plp-avatar";
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

      var introWrapper = h1.parentElement.parentElement
        ? h1.parentElement.parentElement.parentElement
        : null;
      if (introWrapper) {
        introWrapper.classList.add(INTRO_WRAPPER_CLASS);
      }
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
      if (rows[j].querySelector("img")) {
        rows[j].classList.add(HUB_ROW_AVATAR_CLASS);
        document.body.classList.add(AVATAR_PLP_CLASS);
      }
    }

    var slider = hubSection.querySelector(".page-margin-slider");
    var carouselWrapper = slider ? slider.parentElement : null;
    if (carouselWrapper) {
      carouselWrapper.classList.add(HUB_CAROUSEL_WRAPPER_CLASS);
      if (carouselWrapper.querySelector("img")) {
        carouselWrapper.classList.add(HUB_CAROUSEL_AVATAR_CLASS);
        document.body.classList.add(AVATAR_PLP_CLASS);
        addAvatarCarouselSpacer(carouselWrapper);
      }
    }

    updateCollectionsHubSwiper(hubSection);
  }

  function addAvatarCarouselSpacer(carouselWrapper) {
    // This carousel uses a fixed slidesPerView (e.g. 3.7), not "auto" - so
    // Swiper calculates each slide's own width from the container ratio and
    // never measures our CSS-resized content, meaning swiper.update() can't
    // fix a boundary mismatch here (there's no stale measurement to
    // refresh). An empty trailing slide extends Swiper's own scrollable
    // range enough for the real last slide to become reachable.
    var wrapperEl = carouselWrapper.querySelector(".swiper-wrapper");
    if (!wrapperEl || wrapperEl.querySelector("[data-cro-fn099-spacer]")) {
      return;
    }

    var spacer = document.createElement("div");
    spacer.className = "swiper-slide";
    spacer.setAttribute("data-cro-fn099-spacer", "true");
    wrapperEl.appendChild(spacer);
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

    // "women's" is checked before "men's", since "women's" contains "men's"
    // as a substring.
    if (lower.indexOf("women's") !== -1) {
      text = stripWord(text, "women's");
    } else if (lower.indexOf("men's") !== -1) {
      text = stripWord(text, "men's");
    }

    if (text.toLowerCase().indexOf("t-shirts") !== -1) {
      text = stripWord(text, "t-shirts");
    }

    el.textContent = text;
  }

  function applyHubLinksCopy() {
    var links = document.querySelectorAll("." + HUB_LINK_CLASS);
    for (var i = 0; i < links.length; i++) {
      applyHubLinkCopy(links[i]);
    }
  }

  var HUB_ROW_ANCHOR_ATTR = "data-cro-fn099-hub-row-anchor";

  function getHubLayoutState() {
    // Three states: below 768px shows the carousel; 768-991px shows the
    // grid links in their original position (above the filters section);
    // 992px+ moves them next to the filter button.
    if (window.matchMedia("(min-width: 992px)").matches) return "desktop";
    if (window.matchMedia("(min-width: 768px)").matches) return "tablet";
    return "mobile";
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
    var state = getHubLayoutState();

    if (state === "desktop") {
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
    } else {
      // mobile or tablet: keep the row in its original position, above the
      // filters section.
      if (anchor && anchor.parentNode && anchor.nextSibling !== hubRow) {
        anchor.parentNode.insertBefore(hubRow, anchor.nextSibling);
      }
      if (originalWrapper) {
        if (state === "tablet") {
          // The wrapper's own "hidden" class still applies here (the site's
          // native breakpoint for showing it is higher) - force it visible.
          originalWrapper.style.setProperty("display", "block", "important");
          originalWrapper.style.setProperty(
            "margin-top",
            "1.25rem",
            "important",
          );
          originalWrapper.style.setProperty("margin-bottom", "0", "important");
        } else {
          originalWrapper.style.removeProperty("display");
          originalWrapper.style.removeProperty("margin-top");
          originalWrapper.style.removeProperty("margin-bottom");
        }
      }
    }

    updateFiltersRowVisibility(state === "desktop");
  }

  function updateFiltersRowVisibility(desktop) {
    // The desktop filters row (normally hidden until the theme's native
    // "lg" breakpoint) and the separate mobile sticky filter bar (normally
    // hidden only at that same native "lg" breakpoint) both need to flip
    // early at our own 768px point too. A CSS override fought the theme's
    // own !important utility classes and lost depending on stylesheet load
    // order - setting inline styles with explicit "important" priority
    // always outranks any external stylesheet rule, sidestepping that.
    var filtersTrigger = document.querySelector("filters-trigger");
    var filtersRow = filtersTrigger
      ? filtersTrigger.closest('[class*="lg:flex"]')
      : null;
    var mobileFilterBar = document.querySelector(
      '[class*="lg:hidden"][class*="sticky"]',
    );

    if (filtersRow) {
      if (desktop) {
        filtersRow.style.setProperty("display", "flex", "important");
      } else {
        filtersRow.style.removeProperty("display");
      }
    }

    if (mobileFilterBar) {
      if (desktop) {
        mobileFilterBar.style.setProperty("display", "none", "important");
      } else {
        mobileFilterBar.style.removeProperty("display");
      }
    }
  }

  function moveAvatarHubRow() {
    // Avatar-style anchors never get HUB_LINK_GRID_CLASS (they lack the
    // "button" class moveHubLinksGridRow looks for), so that function never
    // finds this row anyway. Unlike the button variant, this row never
    // relocates next to the filter button - it always stays in its
    // original position; only its visibility toggles between the carousel
    // (below 1032px) and the grid (at 1032px+, forced visible since the
    // site's own native breakpoint for it is higher).
    var avatarRow = document.querySelector("." + HUB_ROW_AVATAR_CLASS);
    if (!avatarRow) return;

    var originalWrapper = avatarRow.closest('[class*="pdpDesktop:block"]');
    if (!originalWrapper) return;

    originalWrapper.classList.add(HUB_ROW_AVATAR_WRAPPER_CLASS);

    if (window.matchMedia("(min-width: 1032px)").matches) {
      originalWrapper.style.setProperty("display", "block", "important");
    } else {
      originalWrapper.style.removeProperty("display");
    }
  }

  function moveDescriptionToBottom() {
    var readMore = document.querySelector("read-more");
    if (!readMore || readMore.__croMoved) return;

    // Not every PLP is guaranteed to have this bottom SEO block - if it's
    // missing, leave the description where it already is. Some PLPs also
    // have an unrelated hero/promo carousel that reuses the same
    // ".rte .metafield-rich_text_field" pattern for its own blurb, but its
    // heading is a styled <div class="h2">, not a real <h2> - requiring an
    // actual <h2> directly before the field rules those out.
    var metafield = document.querySelector(
      ".rte > h2 + .metafield-rich_text_field",
    );
    if (!metafield || !metafield.parentNode) return;

    metafield.parentNode.insertBefore(readMore, metafield);
    readMore.__croMoved = true;
  }

  function applyPlpStyles() {
    if (!isPlpPage()) return;
    applyTitleStyle();
    applyDescriptionStyle();
    applyHubLinksStyle();
    applyHubLinksCopy();
    moveHubLinksGridRow();
    moveAvatarHubRow();
    moveDescriptionToBottom();
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
          var labels = filtersTriggerEl.querySelectorAll(
            "[data-filters-label]",
          );
          var visibleLabel = null;
          for (var i = 0; i < labels.length; i++) {
            if (window.getComputedStyle(labels[i]).display !== "none") {
              visibleLabel = labels[i];
              break;
            }
          }
          if (!visibleLabel) return;

          var state = visibleLabel.getAttribute("data-filters-label");
          if (state === "hidden") {
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
          } else if (state === "shown") {
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
            eventLabel: "FN099 | (Variation 1) | Closes Filters",
            eventSegment: "FN099EV1O",
          },
        });

        // console.log("Closes filters");
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
