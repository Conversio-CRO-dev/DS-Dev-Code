// console.log("David Silva | SY008 control");

(function () {
  // Stops the code running twice if the tool injects it again
  if (window.sy008control) return;
  window.sy008control = true;

  // Same audience as the variant: desktop search pages only. No visual change apart from the tick fix (styles below)
  const desktop = window.matchMedia("(min-width: 1200px)");

  function isSearchPage() {
    return window.location.pathname.indexOf("/search") === 0;
  }

  if (isSearchPage() && desktop.matches) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "conversio_experience",
      conversio: {
        experience_category: "Conversio Experience",
        experience_action: "SY008 | Exposed Filters",
        experience_label: "SY008 | Control Original",
        experience_segment: "SY008.XCO",
      },
    });
  }

  // Copies of the site's ticked and unticked looks, used while the results load
  const style = document.createElement("style");
  style.id = "sy008-control-styles";
  style.textContent = `
    .ProductLeftRefinements cx-facet a.value.sy008-tick-on::after {
      content: "";
      position: absolute;
      left: 0.438rem;
      top: 0.813rem;
      width: 0.438rem;
      height: 0.875rem;
      border: solid rgb(124, 159, 25);
      border-width: 0 0.125rem 0.125rem 0;
      transform: rotate(45deg);
    }

    .ProductLeftRefinements cx-facet.multi-select a.value.sy008-tick-on::before {
      background-color: var(--cx-color-inverse) !important;
      border-color: var(--cx-color-dark) !important;
    }

    .ProductLeftRefinements cx-facet a.value.selected.sy008-tick-off::after {
      display: none !important;
    }

    .ProductLeftRefinements cx-facet.multi-select a.value.selected.sy008-tick-off::before {
      background-color: var(--cx-color-white) !important;
      border-color: var(--cx-color-gray) !important;
    }
  `;
  document.head.appendChild(style);

  // The site only ticks an option once the new results arrive, so show the customer's choice straight away
  let pendingTick = null;
  let pendingTimer;

  function getGroupName(group) {
    const heading = group.querySelector(".heading");
    return heading ? heading.textContent.trim() : "";
  }

  // Option text without the count, which changes after loading
  function getOptionName(option) {
    const copy = option.cloneNode(true);
    const count = copy.querySelector(".count");
    if (count) count.remove();
    return copy.textContent.trim();
  }

  // Angular rebuilds the whole panel while loading, so find the option again by group and name
  function findOption(groupName, optionName) {
    const groups = Array.from(
      document.querySelectorAll(
        ".ProductLeftRefinements cx-facet-list cx-facet",
      ),
    );
    const group = groups.find(function (item) {
      return getGroupName(item) === groupName;
    });
    if (!group) return null;

    const options = Array.from(group.querySelectorAll("a.value"));
    return (
      options.find(function (option) {
        return getOptionName(option) === optionName;
      }) || null
    );
  }

  function clearPendingTick() {
    pendingTick = null;
    clearTimeout(pendingTimer);
    document
      .querySelectorAll(".sy008-tick-on, .sy008-tick-off")
      .forEach(function (option) {
        option.classList.remove("sy008-tick-on", "sy008-tick-off");
      });
  }

  function applyPendingTick() {
    if (!pendingTick) return;

    const option = findOption(pendingTick.group, pendingTick.name);
    if (!option) return;

    // The site's own tick has caught up, so ours is no longer needed
    if (option.classList.contains("selected") === pendingTick.ticked) {
      // console.log("SY008 | Control | site tick caught up: " + pendingTick.name);
      clearPendingTick();
      return;
    }

    option.classList.add(
      pendingTick.ticked ? "sy008-tick-on" : "sy008-tick-off",
    );
  }

  function showTickStraightAway(event) {
    if (!event.isTrusted) return;
    if (!isSearchPage() || !desktop.matches) return;

    const option = event.target.closest(
      ".ProductLeftRefinements cx-facet-list cx-facet a.value",
    );
    if (!option) return;

    clearPendingTick();
    pendingTick = {
      group: getGroupName(option.closest("cx-facet")),
      name: getOptionName(option),
      ticked: !option.classList.contains("selected"),
    };
    // console.log("SY008 | Control | " + (pendingTick.ticked ? "tick" : "untick") + " shown straight away: " + pendingTick.group + " > " + pendingTick.name);
    applyPendingTick();

    // If the search fails the site never updates, so don't keep a wrong tick
    pendingTimer = setTimeout(clearPendingTick, 10000);
  }

  // Capture phase: runs as the mouse is released, before the browser redraws, so the tick never disappears
  document.addEventListener("click", showTickStraightAway, true);

  // Runs before the screen updates, so a rebuilt option never shows without its tick
  const observer = new MutationObserver(applyPendingTick);
  observer.observe(document.body, { childList: true, subtree: true });

  function trackResultsClicks(event) {
    window.dataLayer = window.dataLayer || [];

    // Skip clicks made by scripts, only real customer clicks count
    if (!event.isTrusted) return;
    if (!isSearchPage() || !desktop.matches) return;

    // Selected filter chips: the row under the grey bar and the copy inside the slide-out, "Clear all" not included
    const filterChip = event.target.closest(
      "cx-product-facet-navigation cx-active-facets a:not(.facet-clear-all)",
    );
    if (filterChip) {
      // console.log("SY008 | Control | Clear individual filters | " + filterChip.textContent.trim());
      // 3. Clear individual filters
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY008 | Event Tracking",
          event_label: "SY008 | (Control Original) | Clear individual filters",
          event_segment: "SY008ECOI",
        },
      });
      return;
    }

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
