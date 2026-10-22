// console.log("David Silva | SY008 variation 1");

(function () {
  // Stops the code running twice if the tool injects it again
  if (window.sy008v1) return;
  window.sy008v1 = true;

  // v1.css only styles the page while the body has this class
  const TEST_CLASS = "sy008-v1";
  const desktop = window.matchMedia("(min-width: 1200px)");
  const MAX_OPTIONS = 5;

  // Wording after "Show all ", groups not listed use their name in lowercase
  const SHOW_ALL_LABELS = {
    "New Products": "new products",
    Category: "categories",
    "Sub-Category": "sub-categories",
    Promotion: "promotions",
    "Product Availability": "product availability",
    Temperature: "temperatures",
    Brand: "brands",
    "Market Sector": "market sectors",
    "Dietary & Lifestyle": "dietary & lifestyle",
    Allergens: "allergens",
    "Cooking Method": "cooking methods",
    "Provenance and Assurance": "provenance and assurance",
    "Meal Part or Occasion": "meal parts or occasions",
    "Product Info": "product info",
    "Spice Level": "spice levels",
  };

  // Angular can rebuild the panel when results reload, so remember which groups were expanded
  let expandedGroups = [];
  let lastSearchTerm = "";

  function isSearchPage() {
    return window.location.pathname.indexOf("/search") === 0;
  }

  // GTM tracks every click, so drop the tracking push for our automatic clicks only (Control never sends them)
  function clickWithoutTracking(element) {
    const dataLayer = window.dataLayer || [];
    const originalPush = dataLayer.push;

    dataLayer.push = function (entry) {
      const clicked = entry && entry["gtm.element"];
      if (
        entry &&
        entry.event === "gtm.click-v2" &&
        clicked &&
        element.contains(clicked)
      ) {
        // console.log("SY008 | blocked tracking for automatic click");
        return;
      }
      return originalPush.apply(dataLayer, arguments);
    };

    element.click();
    dataLayer.push = originalPush;
  }

  function openFilterPanel() {
    const filterButton = document.querySelector(
      "cx-page-slot.ProductLeftRefinements button.page-actions-filter",
    );
    const panel = document.querySelector(
      "cx-page-slot.ProductLeftRefinements cx-facet-list",
    );

    if (!filterButton || panel) return;

    preventAutoFocus();
    clickWithoutTracking(filterButton);
    // console.log("SY008 | filter panel opened");
  }

  // Below 1200px or off search, our CSS switches off and the open slide-out would cover the page
  function closeFilterPanel() {
    const closeButton = document.querySelector(
      "cx-page-slot.ProductLeftRefinements cx-facet-list .list-header .close",
    );

    // Leaving search removes the panel before we can close it, and the site leaves its scroll lock behind
    if (!closeButton) {
      document.body.classList.remove("modal-open");
      // console.log("SY008 | removed leftover scroll lock");
      return;
    }

    clickWithoutTracking(closeButton);
    // console.log("SY008 | filter panel closed");
  }

  // The slide-out moves focus to its first heading when opened (blue outline), not needed for an always-visible panel
  function preventAutoFocus() {
    function removeFocus(event) {
      if (event.target.closest("cx-facet-list")) {
        event.target.blur();
        // console.log("SY008 | removed automatic focus from panel");
      }
    }

    document.addEventListener("focusin", removeFocus);
    setTimeout(function () {
      document.removeEventListener("focusin", removeFocus);
    }, 1000);
  }

  function addFilterIcon() {
    const title = document.querySelector(
      ".ProductLeftRefinements cx-facet-list .list-header h4",
    );

    if (!title || title.querySelector(".sy008-filter-icon")) return;

    const icon = document.createElement("span");
    icon.className = "sy008-filter-icon fas fa-filter";
    title.prepend(icon);
  }

  function getSearchTerm() {
    const text = new URLSearchParams(window.location.search).get("text") || "";
    return text.split(":")[0].toLowerCase();
  }

  function updateShowAllLinks() {
    // A new search starts with every group back to 5 options
    const searchTerm = getSearchTerm();
    if (searchTerm !== lastSearchTerm) {
      expandedGroups = [];
      lastSearchTerm = searchTerm;
    }

    const groups = document.querySelectorAll(
      ".ProductLeftRefinements cx-facet-list cx-facet",
    );

    groups.forEach(function (group) {
      const heading = group.querySelector(".heading");
      const optionList = group.querySelector(":scope > div");
      if (!heading || !optionList) return;

      const groupName = heading.textContent.trim();
      const options = Array.from(optionList.querySelectorAll("a.value"));
      const hiddenOptions = options.slice(MAX_OPTIONS);
      const hasHiddenSelected = hiddenOptions.some(function (option) {
        return option.classList.contains("selected");
      });

      // Keep a ticked option visible so the customer can always untick it
      if (hasHiddenSelected && expandedGroups.indexOf(groupName) === -1) {
        expandedGroups.push(groupName);
      }

      const showAll =
        hiddenOptions.length === 0 || expandedGroups.indexOf(groupName) !== -1;
      let link = optionList.querySelector(".sy008-show-all-link");

      group.setAttribute("data-sy008-show-all", showAll ? "true" : "false");

      if (showAll) {
        if (link) link.remove();
        return;
      }

      if (link) return;

      link = document.createElement("button");
      link.type = "button";
      link.className = "sy008-show-all-link";
      link.textContent =
        "Show all " + (SHOW_ALL_LABELS[groupName] || groupName.toLowerCase());

      link.addEventListener("click", function () {
        expandedGroups.push(groupName);
        group.setAttribute("data-sy008-show-all", "true");
        link.remove();
        // console.log("SY008 | show all: " + groupName);
      });

      // Inside the option list, so the site hides it with the options when the group is collapsed
      optionList.appendChild(link);
    });
  }

  // Only close the panel at the moment the variant switches off, never a slide-out the customer opened themselves
  let wasActive = false;

  function checkPage() {
    const isActive = isSearchPage() && desktop.matches;

    if (wasActive && !isActive) closeFilterPanel();
    wasActive = isActive;

    document.body.classList.toggle(TEST_CLASS, isActive);
    if (!isActive) return;

    openFilterPanel();
    addFilterIcon();
    updateShowAllLinks();
  }

  function trackResultsClicks(event) {
    window.dataLayer = window.dataLayer || [];

    // Skip clicks made by scripts (including ours), only real customer clicks count
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
      // console.log("SY008 | V1 | Search Results Product Click | " + productId);
      // 1. Search Results Product Click
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY008 | Event Tracking",
          event_label: "SY008 | (Variation 1) | Search Results Product Click",
          event_segment: "SY008EV1G",
        },
      });
      return;
    }

    // First add only, the label changes to "Update" once the product is in the basket
    const basketButton = event.target.closest(
      'cx-add-to-cart button[type="submit"]',
    );
    if (basketButton && basketButton.textContent.trim() === "Add") {
      // console.log("SY008 | V1 | Search Results Add to Basket Click | " + productId);
      // 2. Search Results Add to Basket Click
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "SY008 | Event Tracking",
          event_label:
            "SY008 | (Variation 1) | Search Results Add to Basket Click",
          event_segment: "SY008EV1H",
        },
      });
    }
  }

  // Capture phase: runs before the site reacts, so the button still says "Add"
  document.addEventListener("click", trackResultsClicks, true);

  // Angular re-renders the page without reloading, so re-check whenever the DOM changes
  let timer;
  const observer = new MutationObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(checkPage, 100);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  desktop.addEventListener("change", checkPage);
  checkPage();
})();
