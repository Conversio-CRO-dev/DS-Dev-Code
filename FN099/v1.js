console.log("David Silva | FN099 variation 1");

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
  var DESCRIPTION_FALLBACK_WRAPPER_CLASS = "cro-fn099-plp-description-fallback";
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
    if (!swiperEl || !swiperEl.swiper) return;

    // This carousel's native config uses a fixed numeric slidesPerView
    // (e.g. 1.7), which makes Swiper calculate each slide's width itself
    // from container-width / ratio, rather than reading our CSS-resized
    // content. That mismatch let the carousel scroll past its real
    // content into blank space (its own computed maxTranslate assumed
    // wider slides than we're actually rendering). Forcing "auto" makes
    // Swiper measure our actual rendered widths instead, keeping its
    // scroll boundaries in sync with them.
    if (swiperEl.swiper.params.slidesPerView !== "auto") {
      swiperEl.swiper.params.slidesPerView = "auto";
    }

    // The left inset before the first slide comes from .page-margin-slider's
    // own margin-left (not Swiper's slidesOffsetBefore, which is 0) - mirror
    // it as slidesOffsetAfter so scrolling to the end reserves the same
    // amount of space after the last slide, read dynamically rather than
    // hardcoded in case it ever differs by breakpoint.
    var marginSlider = hubSection.querySelector(".page-margin-slider");
    var edgeOffset = marginSlider
      ? parseFloat(getComputedStyle(marginSlider).marginLeft) || 0
      : 0;
    swiperEl.swiper.params.slidesOffsetAfter = edgeOffset;

    // Our CSS resizes .swiper-slide directly, but Swiper caches slide widths
    // internally for its swipe/snap math - update() re-measures the DOM so
    // that internal state matches what's now on screen.
    if (typeof swiperEl.swiper.update === "function") {
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
    var stripped = text.replace(pattern, " ").replace(/\s+/g, " ").trim();
    // If the label is just the word itself (e.g. "T-Shirts" on its own),
    // stripping it would leave an empty button - keep the original text
    // instead of blanking it out.
    return stripped || text;
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

  function moveHubLinksGridRow() {
    // This row no longer relocates next to the filter button - the client
    // asked for it to stay under the title (in the space freed up by moving
    // the description to the bottom of the page) at every breakpoint.
    // Below 768px the carousel shows instead; from 768px up this row is
    // forced visible in place, since the site's own native breakpoint for
    // showing it is higher.
    var sample = document.querySelector("." + HUB_LINK_GRID_CLASS);
    if (!sample) return;

    var hubRow = sample.closest(".flex.flex-row.flex-wrap.gap-8");
    if (!hubRow) return;

    var originalWrapper = hubRow.closest('[class*="pdpDesktop:block"]');
    if (!originalWrapper) return;

    if (window.matchMedia("(min-width: 768px)").matches) {
      // No margin-top override - the wrapper has no mt-* class, so it's
      // already 0 natively. margin-bottom mirrors the exact values the H1
      // itself uses at these same breakpoints, so the row-to-filters gap
      // matches the h1-to-row gap for visual consistency, instead of the
      // wrapper's native (much larger) "mb-8 lg:mb-16".
      originalWrapper.style.setProperty("display", "block", "important");
      originalWrapper.style.removeProperty("margin-top");
      if (window.matchMedia("(min-width: 1024px)").matches) {
        originalWrapper.style.setProperty("margin-bottom", "20px", "important");
      } else {
        originalWrapper.style.setProperty(
          "margin-bottom",
          "1.3rem",
          "important",
        );
      }
    } else {
      originalWrapper.style.removeProperty("display");
      originalWrapper.style.removeProperty("margin-top");
      originalWrapper.style.removeProperty("margin-bottom");
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

  function moveDescriptionFallback(readMore) {
    // Some PLPs have no bottom SEO block at all (no .rte/.metafield-rich_text_field
    // anywhere on the page) - insert a wrapper matching that block's usual
    // visual structure right after the recurring "New Arrivals/Broadcast"
    // promo slider, the last other section before the page trails off.
    // Anchored on ".swiper-peek-b" rather than the section's own id, since
    // that id looks theme-editor-generated and could change if the promo
    // section is ever reconfigured.
    var promoSwiper = document.querySelector(".swiper-peek-b");
    var promoSection = promoSwiper
      ? promoSwiper.closest(".shopify-section")
      : null;
    if (!promoSection || !promoSection.parentNode) return false;

    var outer = document.createElement("div");
    outer.className =
      "max-w-screen-2xl mx-auto mb-14 lg:mb-18 " +
      DESCRIPTION_FALLBACK_WRAPPER_CLASS;

    var grid = document.createElement("div");
    grid.className = "grid-container page-margin";

    var col = document.createElement("div");
    col.className = "col-span-4 md:col-span-8 lg:col-span-4 mb-5 rte";

    col.appendChild(readMore);
    grid.appendChild(col);
    outer.appendChild(grid);

    promoSection.parentNode.insertBefore(outer, promoSection.nextSibling);
    return true;
  }

  function findBottomDescriptionAnchor() {
    // The real bottom SEO block's content immediately after the <h2> isn't
    // consistent across PLPs - sometimes it's the .metafield-rich_text_field
    // directly, sometimes it's wrapped in a <reveal-content> "read more"
    // toggle component instead. Detecting by "first child is a real <h2>"
    // (not the hero/promo carousel's styled <div class="h2">, and not the
    // FAQ accordion's ".rte" spans, whose first child is the metafield
    // itself, no <h2> at all) and inserting right after it, whatever
    // follows, covers both shapes without needing to know which one it is.
    var rteBlocks = document.querySelectorAll(".rte");
    for (var i = 0; i < rteBlocks.length; i++) {
      var firstChild = rteBlocks[i].firstElementChild;
      if (
        firstChild &&
        firstChild.tagName === "H2" &&
        firstChild.nextElementSibling
      ) {
        return firstChild.nextElementSibling;
      }
    }
    return null;
  }

  function moveDescriptionToBottom() {
    var readMore = document.querySelector("read-more");
    if (!readMore || readMore.__croMoved) return;

    var anchor = findBottomDescriptionAnchor();
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(readMore, anchor);
      readMore.__croMoved = true;
      return;
    }

    if (moveDescriptionFallback(readMore)) {
      readMore.__croMoved = true;
    }
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
    debounceTimer = setTimeout(applyPlpStyles, 50);
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
