// console.log("David Silva | SY008 control");

(function () {
  // Stops the code running twice if the tool injects it again
  if (window.sy008control) return;
  window.sy008control = true;

  // Same audience as the variant: desktop search pages only
  const desktop = window.matchMedia("(min-width: 1200px)");

  function isSearchPage() {
    return window.location.pathname.indexOf("/search") === 0;
  }

  function trackResultsClicks(event) {
    window.dataLayer = window.dataLayer || [];

    // Skip clicks made by scripts, only real customer clicks count
    if (!event.isTrusted) return;
    if (!isSearchPage() || !desktop.matches) return;

    // Product cards only, not ad tiles in the grid
    const card = event.target.closest(
      "#product-results-list .product-item[data-id]",
    );
    if (!card) return;

    const productId = card.getAttribute("data-id");

    // Image, code and name all link to the product page
    if (event.target.closest('a[href*="/p/"]')) {
      // console.log("SY008 | Control | Search Results Product Click | " + productId);
      // 1. Search Results Product Click
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY008 | Event Tracking",
          event_label:
            "SY008 | (Control Original) | Search Results Product Click",
          event_segment: "SY008ECOG",
        },
      });
      return;
    }

    // First add only, the label changes to "Update" once the product is in the basket
    const basketButton = event.target.closest(
      'cx-add-to-cart button[type="submit"]',
    );
    if (basketButton && basketButton.textContent.trim() === "Add") {
      // console.log("SY008 | Control | Search Results Add to Basket Click | " + productId);
      // 2. Search Results Add to Basket Click
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY008 | Event Tracking",
          event_label:
            "SY008 | (Control Original) | Search Results Add to Basket Click",
          event_segment: "SY008ECOH",
        },
      });
    }
  }

  // Capture phase: runs before the site reacts, so the button still says "Add"
  document.addEventListener("click", trackResultsClicks, true);
})();
