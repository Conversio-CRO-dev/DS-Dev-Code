// console.log("David Silva | FN099 control");

function findHubSection() {
  // ".page-margin-slider" is unique to the collections-hub component,
  // used to scope down from the page-wide "a.button" pattern so unrelated
  // buttons elsewhere (e.g. promo banners) never match.
  var slider = document.querySelector(".page-margin-slider");
  return slider ? slider.closest(".shopify-section") : null;
}

function trackEvents() {
  if (!document.querySelector("body").classList.contains("FN009")) {
    document.querySelector("body").classList.add("FN009");
    document.addEventListener("click", (e) => {
      // 1. Category quicklink click
      var hubLink = e.target.closest('a.button[href^="/collections/"]');
      if (hubLink) {
        var hubSection = findHubSection();
        if (hubSection && hubSection.contains(hubLink)) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN099 | Event Tracking",
              eventLabel:
                "FN099 | (Control Original) | Category quicklink click",
              eventSegment: "FN099ECOG",
            },
          });

          // console.log("Category quicklink click");
        }
      }

      // 2. Read more click
      if (e.target.closest("[data-readmore-trigger]")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN099 | Event Tracking",
            eventLabel: "FN099 | (Control Original) | Read more clicK",
            eventSegment: "FN099ECOH",
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
                eventLabel: "FN099 | (Control Original) | Hides filters",
                eventSegment: "FN099ECOI",
              },
            });

            // console.log("Hides filters");
          } else if (text === "Hide Filters") {
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                eventCategory: "Conversio CRO",
                eventAction: "FN099 | Event Tracking",
                eventLabel: "FN099 | (Control Original) | Opens filters",
                eventSegment: "FN099ECOJ",
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
            eventLabel: "FN099 | (Control Original) | Hides filters",
            eventSegment: "FN099ECOI",
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
            eventLabel: "FN099 | (Control Original) | Opens filters",
            eventSegment: "FN099ECOJ",
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
            eventLabel: "FN099 | (Control Original) | Applies filter",
            eventSegment: "FN099ECOK",
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
            eventLabel: "FN099 | (Control Original) | PLP ATB",
            eventSegment: "FN099ECOL",
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
              eventLabel: "FN099 | (Control Original) | Selects colour",
              eventSegment: "FN099ECON",
            },
          });

          // console.log("Selects colour");
        } else {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN099 | Event Tracking",
              eventLabel: "FN099 | (Control Original) | PLP > PDP Clickthrough",
              eventSegment: "FN099ECOM",
            },
          });

          // console.log("PLP > PDP Clickthrough");
        }
      }
    });
  }
}

trackEvents();
