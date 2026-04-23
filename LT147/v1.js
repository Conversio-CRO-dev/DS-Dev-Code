(function () {
  // Store product type from API
  let cachedProductType = null;

  // Store price data from API
  let cachedPriceData = null;

  // Fetch product data from API to determine bottle/case type and prices
  fetchProductData().then((apiData) => {
    if (apiData) {
      const productType = getProductTypeFromAPI(apiData);
      if (productType) {
        cachedProductType = productType;
      }

      // Store price data from API
      const priceData = getPriceDataFromAPI(apiData);
      if (priceData) {
        cachedPriceData = priceData;
      }
    }
  });

  // Only run this code once
  if (window.purchaseTabsAlreadyAdded) return;
  window.purchaseTabsAlreadyAdded = true;

  // Wait for the page to load, then try to add our tabs
  waitForPurchaseSection();

  // This function keeps trying to find the purchase section on the page
  function waitForPurchaseSection() {
    let attempts = 0;
    const maxAttempts = 40; // Try 40 times (10 seconds total)

    const checkInterval = setInterval(function () {
      attempts++;

      // Try to add our tabs
      const success = addPurchaseTabs();

      // If we succeeded or tried too many times, stop checking
      if (success || attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 250); // Check every 1/4 second
  }

  // Main function that adds our custom purchase tabs
  function addPurchaseTabs() {
    // Find all accordion sections on the page
    const accordions = document.querySelectorAll("[data-accordion='true']");

    if (accordions.length === 0) return false;

    let tabsAdded = false;

    // Check each accordion to see if it has subscription and one-time options
    accordions.forEach(function (accordion) {
      const subscribeSection = accordion.querySelector(
        ".accordion-item.subscribe-save",
      );
      const oneTimeSection = accordion.querySelector(
        ".accordion-item.one-time",
      );

      // If we found both sections, add our custom tabs
      if (subscribeSection && oneTimeSection) {
        createCustomTabs(accordion, subscribeSection, oneTimeSection);
        tabsAdded = true;
      }
    });

    return tabsAdded;
  }

  // Creates our custom tabs and replaces the original purchase options
  function createCustomTabs(accordion, subscribeSection, oneTimeSection) {
    // Don't add tabs twice
    if (accordion.parentNode.querySelector(".custom-purchase-tabs")) return;

    // Add the CSS styles to the page
    addStylesToPage();

    // Hide the original accordion content
    accordion.classList.add("hide-original-panel");

    // Get all the information we need from the original sections
    const subscribeInfo = getSubscribeInfo(subscribeSection);
    const oneTimeInfo = getOneTimeInfo(oneTimeSection);

    // Figure out which one is currently selected
    const isSubscribeActive =
      subscribeSection.getAttribute("data-active") === "true";
    const activeType = isSubscribeActive ? "subscribe" : "one-time";

    // Create our custom tabs container
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "custom-purchase-tabs";

    // Create the tab buttons at the top
    const tabButtons = document.createElement("div");
    tabButtons.className = "custom-tab-buttons";

    // Create quantity tracker
    let currentQuantity = 1;

    // Track which purchase type is currently active ('subscribe' or 'one-time')
    let currentPurchaseType = activeType;

    // Create the tab cards
    const oneTimeCard = createTabCard(
      oneTimeInfo,
      activeType === "one-time",
      "one-time-purchase",
    );

    const subscribeCard = createTabCard(
      subscribeInfo,
      activeType === "subscribe",
      "subscribe-and-save",
    );

    // Create the panel that shows the price and add to cart button
    const infoPanel = createInfoPanel();
    updateInfoPanel(
      infoPanel,
      activeType === "subscribe" ? subscribeInfo : oneTimeInfo,
      currentQuantity,
    );

    // Set up what happens when you click the one-time tab
    oneTimeCard.onclick = function () {
      // Update which tab looks active
      oneTimeCard.classList.add("active");
      subscribeCard.classList.remove("active");

      // Update the purchase type
      currentPurchaseType = "one-time";

      // Update the info panel to show one-time purchase details
      updateInfoPanel(infoPanel, oneTimeInfo, currentQuantity);

      // Click the original one-time section to keep things in sync
      const originalButton = oneTimeSection.querySelector(
        "[data-accordion-control='true']",
      );
      if (
        originalButton &&
        oneTimeSection.getAttribute("data-active") !== "true"
      ) {
        originalButton.click();
      }
    };

    // Set up what happens when you click the subscribe tab
    subscribeCard.onclick = function () {
      subscribeCard.classList.add("active");
      oneTimeCard.classList.remove("active");

      // Update the purchase type
      currentPurchaseType = "subscribe";

      updateInfoPanel(infoPanel, subscribeInfo, currentQuantity);

      const originalButton = subscribeSection.querySelector(
        "[data-accordion-control='true']",
      );
      if (
        originalButton &&
        subscribeSection.getAttribute("data-active") !== "true"
      ) {
        originalButton.click();
      }
    };

    // Put everything together
    tabButtons.appendChild(oneTimeCard);
    tabButtons.appendChild(subscribeCard);
    tabsContainer.appendChild(tabButtons);
    tabsContainer.appendChild(infoPanel);

    // Hide the original accordion and add our tabs
    accordion.style.display = "none";
    accordion.parentNode.insertBefore(tabsContainer, accordion);
  }

  // Creates a single tab card (like a button for one-time or subscribe)
  function createTabCard(info, isActive, cardType) {
    const card = document.createElement("div");

    // Add base class and card type class based on the cardType parameter
    card.className = "purchase-tab-card";

    // Add the specific tab type class
    if (cardType === "one-time-purchase") {
      card.classList.add("one-time-purchase");
    } else if (cardType === "subscribe-and-save") {
      card.classList.add("subscribe-and-save");
    }

    // Add active class if needed
    if (isActive) {
      card.classList.add("active");
    }

    // Add a badge for subscription (like "Save 20%")
    let badgeHTML = "";
    if (info.badge) {
      badgeHTML = '<div class="purchase-tab-badge">' + info.badge + "</div>";
    }

    let displayPrice = "";
    let displayOldPrice = "";
    let unitText = "case"; // default to case

    // Check if this is a single bottle or case
    const isSingleBottle =
      cachedPriceData && cachedPriceData.numberOfBottles === 1;
    const isCase = cachedPriceData && cachedPriceData.numberOfBottles > 1;

    // Different pricing logic based on card type
    if (cardType === "one-time-purchase") {
      // ONE TIME PURCHASE TAB
      if (cachedPriceData && cachedPriceData.salePrice) {
        // Display sale price from API
        displayPrice = "£" + cachedPriceData.salePrice.toFixed(2);

        // ONLY show strikethrough price for CASES (not for single bottles)
        if (
          isCase &&
          cachedPriceData.listPrice &&
          cachedPriceData.listPrice !== cachedPriceData.salePrice
        ) {
          displayOldPrice = "£" + cachedPriceData.listPrice.toFixed(2);
        } else {
          displayOldPrice = ""; // No strikethrough for single bottles
        }
      } else {
        // Fallback to scraped prices
        displayPrice = info.price;
        if (isCase && info.oldPrice) {
          displayOldPrice = info.oldPrice;
        } else {
          displayOldPrice = "";
        }
      }

      // Determine unit text based on number of bottles
      if (isSingleBottle) {
        unitText = "bottle";
      } else {
        unitText = "case";
      }
    } else if (cardType === "subscribe-and-save") {
      // SUBSCRIBE & SAVE TAB

      // Get the subscription price from the page (the discounted price)
      let subscribePriceElement = document.querySelector(
        "#mantine-h04ws6jr1-control-subscribe-save > span.mantine-1vdf3ji.mantine-Accordion-label > div.ss-item-content > div.case-price-content.uk-pricing-row > span > b",
      );

      // Fallback selectors if the specific one doesn't exist
      if (!subscribePriceElement) {
        subscribePriceElement = document.querySelector(
          "[data-testid='subscribe-price']",
        );
      }
      if (!subscribePriceElement) {
        subscribePriceElement = document.querySelector(
          ".subscribe-save .case-price",
        );
      }
      if (!subscribePriceElement) {
        subscribePriceElement = document.querySelector(
          ".ss-item-content .case-price",
        );
      }

      if (subscribePriceElement) {
        // Use the subscription price from the page
        displayPrice = subscribePriceElement.innerText.trim();
      } else {
        // Fallback to the scraped price from info
        displayPrice = info.price;
      }

      // ONLY show strikethrough price for CASES (not for single bottles)
      if (isCase && cachedPriceData && cachedPriceData.salePrice) {
        // Cases - show API sale price as strikethrough
        displayOldPrice = "£" + cachedPriceData.salePrice.toFixed(2);
      } else {
        // Single bottles - no strikethrough price
        displayOldPrice = "";
      }

      // Determine unit text based on number of bottles
      if (isSingleBottle) {
        unitText = "bottle";
      } else {
        unitText = "case";
      }
    }

    // Create old price HTML if we have an old price
    let oldPriceHTML = "";
    if (displayOldPrice) {
      oldPriceHTML = '<span class="old-price">' + displayOldPrice + "</span>";
    }

    card.innerHTML =
      badgeHTML +
      '<div class="purchase-tab-content">' +
      '<div class="min-tab-content">' +
      '<span class="purchase-tab-radio"></span>' +
      '<div class="tab-title-container">' +
      '<span class="purchase-tab-title">' +
      info.title +
      "</span>" +
      '<div class="info-panel-price">' +
      displayPrice +
      '<span class="price-case"> /' +
      unitText +
      " </span>" +
      oldPriceHTML +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";

    return card;
  }

  // Creates the panel that shows price and has the quantity/+add to cart
  function createInfoPanel() {
    const panel = document.createElement("div");
    panel.className = "purchase-info-panel";
    return panel;
  }

  // Helper function to generate quantity selector HTML
  function getQuantitySelectorHTML(quantity, buttonText) {
    return (
      '<div class="purchase-actions">' +
      '<div class="quantity-container">' +
      '<button class="quantity-btn minus" ' +
      (quantity <= 1 ? "disabled" : "") +
      ">" +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
      '<path d="M0.64 11.2798C0.64 11.2798 0.586667 11.2931 0.48 11.3198C0.373333 11.3465 0.266667 11.4398 0.16 11.5998C0.0533333 11.7598 0 11.9065 0 12.0398C0 12.1731 0.0533333 12.3198 0.16 12.4798C0.266667 12.6398 0.386667 12.7331 0.52 12.7598C0.653333 12.7865 4.48 12.7998 12 12.7998C19.52 12.7998 23.3467 12.7865 23.48 12.7598C23.6133 12.7331 23.7333 12.6398 23.84 12.4798C23.9467 12.3198 24 12.1731 24 12.0398C24 11.9065 23.96 11.7731 23.88 11.6398C23.8 11.5065 23.72 11.4265 23.64 11.3998C23.56 11.3731 22.9333 11.3331 21.76 11.2798H0.64Z" fill="#CCCCCC"/>' +
      "</svg>" +
      "</button>" +
      '<span class="quantity-display">' +
      quantity +
      "</span>" +
      '<button class="quantity-btn plus">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
      '<path d="M11.6002 0.799782C11.4935 0.906448 11.4135 0.986448 11.3602 1.03979L11.2802 1.19979L11.2002 11.1998L1.92021 11.2798C1.44021 11.2798 1.17354 11.3065 1.12021 11.3598C0.853548 11.4665 0.720215 11.6931 0.720215 12.0398C0.720215 12.3865 0.880215 12.6131 1.20021 12.7198C1.30688 12.7198 3.01354 12.7198 6.32021 12.7198H11.2002L11.2802 22.7998L11.3602 22.9598C11.5202 23.1731 11.7335 23.2798 12.0002 23.2798C12.2668 23.2798 12.4802 23.1731 12.6402 22.9598L12.7202 22.7998L12.8002 12.7998L22.8002 12.7198L22.9602 12.6398C23.1735 12.4798 23.2802 12.2531 23.2802 11.9598C23.2802 11.6665 23.1468 11.4665 22.8802 11.3598C22.8268 11.3065 22.5602 11.2798 22.0802 11.2798L12.8002 11.1998L12.7202 1.91979C12.7202 1.43979 12.6935 1.13312 12.6402 0.999782C12.5868 0.866449 12.4535 0.773115 12.2402 0.719782C12.0268 0.666448 11.8135 0.693115 11.6002 0.799782Z" fill="black"/>' +
      "</svg>" +
      "</button>" +
      "</div>" +
      '<button class="add-to-cart-btn">' +
      buttonText +
      "</button>" +
      "</div>"
    );
  }

  // Helper function to get the original "How it works" button
  function getHowItWorksButton() {
    // Try multiple selectors to find the how-it-works button
    let howButton = document.querySelector(
      ".how-it-works-wrapper > .how-it-works",
    );
    if (!howButton) {
      howButton = document.querySelector(".how-it-works");
    }
    if (!howButton) {
      howButton = document.querySelector("[data-testid='how-it-works']");
    }
    return howButton;
  }

  // Helper function to get the original quantity selector input
  function getOriginalQuantityInput() {
    // Try multiple selectors to find the original quantity input
    let quantityInput = document.querySelector(
      ".customProdQantityField .form-control.quantity",
    );
    if (!quantityInput) {
      quantityInput = document.querySelector('[data-testid="quantity-input"]');
    }
    if (!quantityInput) {
      quantityInput = document.querySelector('input[name="quantity"]');
    }
    if (!quantityInput) {
      quantityInput = document.querySelector(".quantity-input");
    }
    return quantityInput;
  }

  // Helper function to get the original decrement button
  function getOriginalDecrementButton() {
    let decrementBtn = document.querySelector(
      ".customProdQantityField .btn-minus",
    );
    if (!decrementBtn) {
      decrementBtn = document.querySelector(
        '[data-testid="decrement-quantity"]',
      );
    }
    return decrementBtn;
  }

  // Helper function to get the original increment button
  function getOriginalIncrementButton() {
    let incrementBtn = document.querySelector(
      ".customProdQantityField .btn-plus",
    );
    if (!incrementBtn) {
      incrementBtn = document.querySelector(
        '[data-testid="increment-quantity"]',
      );
    }
    return incrementBtn;
  }

  // Updates the info panel with the correct information
  function updateInfoPanel(panel, info, quantity) {
    // Check if this is a single bottle or a case using cached API data
    const isSingleBottle =
      cachedPriceData && cachedPriceData.numberOfBottles === 1;
    const isCase = cachedPriceData && cachedPriceData.numberOfBottles > 1;
    const numberOfBottles = cachedPriceData
      ? cachedPriceData.numberOfBottles
      : 12; // Default to 12 if not available

    // Get the subscription price element for subscribe tab
    let subscribePriceElement = document.querySelector(
      "#mantine-h04ws6jr1-control-subscribe-save > span.mantine-1vdf3ji.mantine-Accordion-label > div.ss-item-content > div.case-price-content.uk-pricing-row > span > b",
    );
    if (!subscribePriceElement) {
      subscribePriceElement = document.querySelector(
        "[data-testid='subscribe-price']",
      );
    }
    if (!subscribePriceElement) {
      subscribePriceElement = document.querySelector(
        ".subscribe-save .case-price",
      );
    }

    // Get the subscription per-bottle price element
    let subscribePerBottleElement = document.querySelector(
      "#mantine-p9omkzjr1-control-subscribe-save > span.mantine-1vdf3ji.mantine-Accordion-label > div.ss-item-content > div.per-bottle-content > span > b",
    );
    if (!subscribePerBottleElement) {
      subscribePerBottleElement = document.querySelector(
        ".subscribe-save .per-bottle-price b",
      );
    }

    // Get the subscription per-bottle text (e.g., "per bottle")
    let subscribePerBottleText = document.querySelector(
      "#mantine-p9omkzjr1-control-subscribe-save > span.mantine-1vdf3ji.mantine-Accordion-label > div.ss-item-content > div.per-bottle-content > span > span",
    );
    if (!subscribePerBottleText) {
      subscribePerBottleText = document.querySelector(
        ".subscribe-save .per-bottle-price span",
      );
    }

    // Get the original one-time section content for cloning (single bottle scenario)
    const originalOneTimeContent = document.querySelector(
      "#mantine-x3xv7bw46-control-one-time > span.mantine-1vdf3ji.mantine-Accordion-label > div.css-sz18ks",
    );

    // Get case details and saving section for case one-time scenario
    const caseDetailsElement = document.querySelector(
      "#mantine-xtaronlp5-control-one-time > span.mantine-1vdf3ji.mantine-Accordion-label > div.css-sz18ks > div > div > div > div.price-section.saving > div.case-details",
    );
    const savingSectionElement = document.querySelector(
      "#mantine-xtaronlp5-control-one-time > span.mantine-1vdf3ji.mantine-Accordion-label > div.css-sz18ks > div > div > div > div.saving-section",
    );

    // Get saving badge for case subscribe scenario & one time purchase
    const savingBadgeElement = document.querySelector(
      ".subscribe-save .saving-badge",
    );
    const savingBadgeOneTime = document.querySelector(
      ".saving-section-content .saving",
    );

    if (info.type === "subscribe") {
      // SUBSCRIBE & SAVE TAB
      if (isSingleBottle) {
        // SINGLE BOTTLE - Subscribe & Save
        const subscribePrice = subscribePriceElement
          ? subscribePriceElement.innerText.trim()
          : info.price;

        let oneTimePricePerBottle = null;
        if (cachedPriceData && cachedPriceData.salePrice) {
          oneTimePricePerBottle = cachedPriceData.salePrice;
        }

        let subscribePriceValue = null;
        let oneTimePriceValue = null;

        if (subscribePrice) {
          subscribePriceValue = parseFloat(subscribePrice.replace("£", ""));
        }

        if (oneTimePricePerBottle) {
          oneTimePriceValue = oneTimePricePerBottle;
        }

        const caseSize = 12;
        let subscribeCaseTotal = "";
        let oneTimeCaseTotal = "";
        let savingAmount = "";

        if (subscribePriceValue && !isNaN(subscribePriceValue)) {
          subscribeCaseTotal =
            "£" + (subscribePriceValue * caseSize).toFixed(2);
        }

        if (oneTimePriceValue && !isNaN(oneTimePriceValue)) {
          oneTimeCaseTotal = "£" + (oneTimePriceValue * caseSize).toFixed(2);
        }

        if (
          subscribePriceValue &&
          oneTimePriceValue &&
          !isNaN(subscribePriceValue) &&
          !isNaN(oneTimePriceValue)
        ) {
          const saving =
            oneTimePriceValue * caseSize - subscribePriceValue * caseSize;
          if (saving > 0) {
            savingAmount = "£" + saving.toFixed(2);
          }
        }

        var saveBadgeHTML = savingAmount
          ? '<span class="save-badge">Save ' + savingAmount + "</span>"
          : '<span class="save-badge">Save when you subscribe to a full case</span>';

        panel.innerHTML =
          '<div class="info-panel-subscribe-single-bottle">' +
          '<div class="subscribe-price-row">' +
          '<div class="case-price">' +
          '<span class="case-price-total">' +
          subscribeCaseTotal +
          "</span>" +
          '<span class="price-unit">/case </span>' +
          '<span class="strike per-bottle-strike"> ' +
          oneTimeCaseTotal +
          "</span>" +
          "</div>" +
          '<div class="subscribe-save-message">' +
          saveBadgeHTML +
          "</div>" +
          "</div>" +
          "</div>" +
          '<div class="subscribe-case-upsell">' +
          '<span class="case-upsell-title">' +
          caseSize +
          " bottles - " +
          subscribePrice +
          " /bottle" +
          "</span>" +
          '<a href="#">' +
          '<span class="info-link">How does it work?</span>' +
          "</a>" +
          "</div>" +
          '<button class="add-to-cart-btn">' +
          info.buttonText +
          "</button>";
      } else if (isCase) {
        // CASE - Subscribe & Save
        let subscribePrice = subscribePriceElement
          ? subscribePriceElement.innerText.trim()
          : info.price;
        const savingBadge = savingBadgeElement
          ? savingBadgeElement.innerText.trim()
          : info.save;

        subsPrice = Number(subscribePrice.substring(1)) / 12;

        var saveBadgeHTML2 = savingBadge
          ? '<span class="save-badge">' + savingBadge + "</span>"
          : "";

        panel.innerHTML =
          '<div class="info-panel-subscribe-case">' +
          '<div class="subscribe-case-info promo-sub-price">' +
          "<span>" +
          numberOfBottles +
          " bottles -</span>" +
          '<span class="case-price"> ' +
          subsPrice.toFixed(2) +
          " /bottle</span>" +
          "</div>" +
          saveBadgeHTML2 +
          "</div>" +
          '<a href="#">' +
          '<span class="info-link">How does it work?</span>' +
          "</a>" +
          '<button class="add-to-cart-btn">' +
          info.buttonText +
          "</button>";
      } else {
        // Default fallback for subscribe
        var saveBadgeFallback = info.save
          ? '<span class="save-badge">' + info.save + "</span>"
          : "";
        panel.innerHTML =
          '<div class="info-panel-meta">' +
          "<span>" +
          formatMetaInfo(info.meta) +
          "</span>" +
          saveBadgeFallback +
          "</div>" +
          '<a href="#">' +
          '<span class="info-link">How does it work?</span>' +
          "</a>" +
          '<button class="add-to-cart-btn">' +
          info.buttonText +
          "</button>";
      }

      // Set up add to cart button for SUBSCRIBE tab
      const subscribeAddToCartBtn = panel.querySelector(".add-to-cart-btn");
      if (subscribeAddToCartBtn) {
        subscribeAddToCartBtn.onclick = function () {
          if (info.sourceButton) {
            info.sourceButton.click();
          }
        };
      }
    } else {
      // ONE TIME PURCHASE TAB
      if (isSingleBottle) {
        // SINGLE BOTTLE - One Time Purchase

        let clonedPricingHTML = "";

        // Try to find and clone the straight-sku-wrapper element
        const straightSkuWrapper = document.querySelector(
          ".straight-sku-wrapper",
        );
        if (straightSkuWrapper) {
          // Clone the element and get its HTML
          const clone = straightSkuWrapper.cloneNode(true);
          clonedPricingHTML = clone.outerHTML;
        } else {
          // Fallback: try alternative selectors
          const vppPriceElement = document.querySelector(
            '[data-testid="vpp-price"]',
          );
          const standardPriceSection = document.querySelector(
            '[data-testid="standard-price-section"]',
          );
          const addOnContainer = document.querySelector(
            '[data-testid="add-on-container"]',
          );

          if (vppPriceElement || standardPriceSection || addOnContainer) {
            let fallbackHTML = '<div class="straight-sku-wrapper">';
            if (vppPriceElement) {
              fallbackHTML += vppPriceElement.outerHTML;
            }
            if (standardPriceSection && standardPriceSection.parentElement) {
              fallbackHTML +=
                '<div class="top-price-section">' +
                standardPriceSection.parentElement.innerHTML +
                "</div>";
            }
            if (addOnContainer) {
              fallbackHTML += addOnContainer.outerHTML;
            }
            fallbackHTML += "</div>";
            clonedPricingHTML = fallbackHTML;
          }
        }

        panel.innerHTML =
          '<div class="info-panel-one-time-single-bottle">' +
          clonedPricingHTML +
          "</div>" +
          getQuantitySelectorHTML(quantity, info.buttonText);
      } else if (isCase) {
        // CASE - One Time Purchase
        const caseDetails = caseDetailsElement
          ? caseDetailsElement.innerText.trim()
          : formatMetaInfo(info.meta);
        const savingBadge = savingBadgeOneTime
          ? savingBadgeOneTime.innerText.trim()
          : info.save;

        panel.innerHTML =
          '<div class="info-panel-one-time-case">' +
          '<div class="info-panel-meta">' +
          '<span class="case-details">' +
          caseDetails +
          "</span>" +
          "</div>" +
          '<div class="saving-section-content">' +
          '<span class="save-badge">' +
          savingBadge +
          "</span>" +
          "</div>" +
          "</div>" +
          getQuantitySelectorHTML(quantity, info.buttonText);
      } else {
        // Default fallback for one-time purchase
        panel.innerHTML =
          '<div class="info-panel-meta">' +
          "<span>" +
          formatMetaInfo(info.meta) +
          "</span>" +
          "</div>" +
          getQuantitySelectorHTML(quantity, info.buttonText);
      }

      // Set up quantity buttons for one-time purchase
      const minusBtn = panel.querySelector(".minus");
      const plusBtn = panel.querySelector(".plus");
      const quantityDisplay = panel.querySelector(".quantity-display");

      let currentQty = quantity;

      // Get original quantity elements from the page
      const originalQuantityInput = getOriginalQuantityInput();
      const originalDecrementBtn = getOriginalDecrementButton();
      const originalIncrementBtn = getOriginalIncrementButton();

      // Function to update quantity display and disabled state
      function updateQuantityDisplay(newQty) {
        currentQty = newQty;
        quantityDisplay.textContent = currentQty;

        // Update disabled state of minus button (grey out when quantity is 1)
        if (minusBtn) {
          if (currentQty <= 1) {
            minusBtn.setAttribute("disabled", "disabled");
          } else {
            minusBtn.removeAttribute("disabled");
          }
        }
      }

      // Handle minus button click
      if (minusBtn) {
        minusBtn.onclick = function (e) {
          e.preventDefault();
          if (currentQty > 1) {
            const newQty = currentQty - 1;
            updateQuantityDisplay(newQty);

            // Also update the original quantity selector if it exists
            if (originalQuantityInput) {
              originalQuantityInput.value = newQty;
              // Trigger change event on original input
              const changeEvent = new Event("change", { bubbles: true });
              originalQuantityInput.dispatchEvent(changeEvent);
            }

            // Click the original decrement button if it exists
            if (originalDecrementBtn && !originalDecrementBtn.disabled) {
              originalDecrementBtn.click();
            }
          }
        };
      }

      // Handle plus button click
      if (plusBtn) {
        plusBtn.onclick = function (e) {
          e.preventDefault();
          if (currentQty < 99) {
            const newQty = currentQty + 1;
            updateQuantityDisplay(newQty);

            // Also update the original quantity selector if it exists
            if (originalQuantityInput) {
              originalQuantityInput.value = newQty;
              // Trigger change event on original input
              const changeEvent = new Event("change", { bubbles: true });
              originalQuantityInput.dispatchEvent(changeEvent);
            }

            // Click the original increment button if it exists
            if (originalIncrementBtn) {
              originalIncrementBtn.click();
            }
          }
        };
      }

      // Set up add to cart button for ONE TIME purchase tab
      const oneTimeAddToCartBtn = panel.querySelector(".add-to-cart-btn");
      if (oneTimeAddToCartBtn) {
        oneTimeAddToCartBtn.onclick = function () {
          if (info.sourceButton) {
            // Sync the quantity to the original selector
            if (originalQuantityInput) {
              originalQuantityInput.value = currentQty;
              const changeEvent = new Event("change", { bubbles: true });
              originalQuantityInput.dispatchEvent(changeEvent);
            }
            // Then click the original add to cart button
            info.sourceButton.click();
          }
        };
      }
    }

    // Set up "How does it work?" link click events
    const howItWorksLinks = panel.querySelectorAll(".info-link");
    howItWorksLinks.forEach(function (link) {
      link.onclick = function (e) {
        e.preventDefault();
        const howButton = getHowItWorksButton();
        if (howButton) {
          howButton.click();
        }
      };
    });
  }

  // Gets all the information we need from the subscription section
  function getSubscribeInfo(section) {
    return {
      type: "subscribe",
      title: "SUBSCRIBE & SAVE",
      badge: "Save 20%",
      price: getText(section.querySelector(".case-price")),
      oldPrice:
        getText(section.querySelector(".case-price-savings .strike")) ||
        getText(section.querySelector(".sale-price .strike")),
      meta: getText(section.querySelector(".per-bottle-price")),
      save: getText(section.querySelector(".saving-badge")),
      buttonText:
        getText(
          section.querySelector(
            "[data-testid='add-to-cart-button'], .grid-addto-cart-btn",
          ),
        ) || "ADD TO BASKET",
      sourceButton: section.querySelector(
        "[data-testid='add-to-cart-button'], .grid-addto-cart-btn",
      ),
      howButton: section.querySelector(".how-it-works"),
      productType: cachedProductType || getProductType(section),
    };
  }

  // Gets all the information we need from the one-time purchase section
  function getOneTimeInfo(section) {
    return {
      type: "one-time",
      title: "ONE TIME PURCHASE",
      badge: "",
      price: getText(section.querySelector("[data-testid='price'], .price")),
      oldPrice: getText(
        section.querySelector("[data-testid='strike-price'], .strike"),
      ),
      meta: getText(
        section.querySelector("[data-testid='case-details'], .case-details"),
      ),
      save: getText(section.querySelector("[data-testid='saving'], .saving")),
      buttonText:
        getText(
          section.querySelector(
            "[data-testid='add-to-cart-button'], .grid-addto-cart-btn",
          ),
        ) || "ADD TO BASKET",
      sourceButton: section.querySelector(
        "[data-testid='add-to-cart-button'], .grid-addto-cart-btn",
      ),
      productType: cachedProductType || getProductType(section),
    };
  }

  // Helper function to get clean text from an element
  function getText(element) {
    if (!element) return "";
    // Remove extra spaces and trim
    return element.textContent.replace(/\s+/g, " ").trim();
  }

  // Function to fetch product data from API
  async function fetchProductData() {
    // Try to get the product ID from the page URL
    const url = window.location.href;

    // First pattern: /product/XXXXX (like /product/0016923)
    let productIdMatch = url.match(/\/product\/([A-Za-z0-9]+)(?:\/|$)/);

    // Second pattern: /product/something/XXXXX (like /product/new-viognier-mix/M20574)
    if (!productIdMatch) {
      productIdMatch = url.match(/\/product\/[^\/]+\/([A-Za-z0-9]+)/);
    }

    if (!productIdMatch) {
      return null;
    }

    const productId = productIdMatch[1];

    // Validate that the product ID starts with a letter (M, C, etc.) or is numeric
    if (!productId || productId.length < 4) {
      return null;
    }

    const apiUrl =
      "https://www.laithwaites.co.uk/api/product/item/" + productId;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();

      // Check if the response has valid data
      if (
        data &&
        data.response &&
        data.response.skus &&
        data.statusCode === 0
      ) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  // Function to determine product type from API data
  function getProductTypeFromAPI(apiData) {
    if (!apiData || !apiData.response || !apiData.response.skus) {
      return null;
    }

    // Check the first SKU's numberOfBottles
    const firstSku = apiData.response.skus[0];
    if (firstSku && firstSku.numberOfBottles !== undefined) {
      if (firstSku.numberOfBottles === 1) {
        return "single-bottle";
      } else {
        // 6, 12, etc. - this is a case
        return "case";
      }
    }

    return null;
  }

  // Function to get price data from API response
  function getPriceDataFromAPI(apiData) {
    if (!apiData || !apiData.response || !apiData.response.skus) {
      return null;
    }

    // Get the first SKU (usually the main one)
    const firstSku = apiData.response.skus[0];
    if (firstSku) {
      return {
        salePrice: firstSku.salePrice,
        listPrice: firstSku.listPrice,
        salePricePerBottle: firstSku.salePricePerBottle,
        numberOfBottles: firstSku.numberOfBottles,
      };
    }

    return null;
  }

  // Function to detect if product is a single bottle or case
  function getProductType(section) {
    // Look for text that indicates "per bottle" or "per case"
    const sectionText = section.textContent.toLowerCase();

    if (sectionText.includes("per bottle")) {
      return "single-bottle";
    } else if (sectionText.includes("per case")) {
      return "case";
    }

    // Default to case if we can't determine
    return "case";
  }

  // Helper functions
  function formatMetaInfo(metaText) {
    const match = metaText.match(/\((\d+) bottles\).*?£([\d.]+)/);
    if (match) {
      const bottleCount = match[1];
      const price = match[2];
      return bottleCount + " bottles - £" + price + "/bottle";
    }
    return metaText;
  }

  // Adds all the CSS styles to make our tabs look good
  function addStylesToPage() {
    // Don't add styles twice
    if (document.getElementById("purchase-tabs-styles")) return;

    const styles = `
			.custom-purchase-tabs {
			  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
			  border-radius: 4px;
			}
			
			.custom-tab-buttons {
			  display: grid;
			  grid-template-columns: 1fr 1fr;
			  gap: 0 !important;
			}
			
			.purchase-tab-card {
			  display: flex;
			  min-height: 103px;
			  padding: 24px 16px;
			  flex-direction: column;
			  justify-content: center;
			  align-items: flex-start;
			  gap: 8px;
			  flex: 1 0 0;
			  position: relative;
			}
			
			.one-time-purchase {
			  border-radius: 4px 0 0 0 !important;
			  border: 1px solid #e8e8e8;
			  background: #f8f8f8;
			}
			
			.subscribe-and-save {
			  border-radius: 0 4px 0 0 !important;
			  border: 1px solid #e8e8e8;
			  background: #f8f8f8;
			}
			
			.purchase-tab-card.active {
			  border-radius: 0 !important;
			  border-top: 1px solid;
			  border-right: 1px solid;
			  border-left: 1px solid;
			  border-bottom: 0 solid;
			  border-color: #e8e8e8;
			  background: #fff;
			}
			
			.purchase-tab-card.active::before {
			  content: "";
			  position: absolute;
			  width: 100.5%;
			  height: 7px;
			  border-radius: 8px 8px 0 0;
			  background: #448020;
			  top: -6px;
			  left: 50%;
			  transform: translateX(-50%);
			}
			
			.min-tab-content {
			  display: flex;
			  justify-content: flex-start;
			  align-items: flex-start;
			  gap: 8px;
			  align-self: stretch;
			  position: relative;
			}
			
			.tab-title-container {
			  display: flex;
			  flex-direction: column;
			  align-items: flex-start;
			  gap: 4px;
			  flex: 1 0 0;
			}
			
			.purchase-tab-title {
			  display: flex;
			  padding: 6px 0;
			  flex-direction: column;
			  justify-content: center;
			  align-items: flex-start;
			  align-self: stretch;
			  color: #000;
			  font-family: Roboto;
			  font-size: 12px;
			  font-style: normal;
			  font-weight: 600;
			  line-height: normal;
			  letter-spacing: 0.24px;
			  text-transform: uppercase;
			  margin-bottom: 0;
			}
			
			.purchase-tab-radio {
			  width: 16px;
			  height: 16px;
			  flex-shrink: 0;
			  aspect-ratio: 1/1;
			  position: relative;
			  top: 5px;
			  background: #fff;
			  border-radius: 50%;
			  border: 2px solid #adadad;
			}
			
			.purchase-tab-card.active .purchase-tab-radio {
			  border: 2px solid #198754;
			}
			
			.purchase-tab-card.active .purchase-tab-radio:after {
			  content: "";
			  position: absolute;
			  top: 2px;
			  left: 2px;
			  width: 8px;
			  height: 8px;
			  border-radius: 50%;
			  background: #198754;
			}
			
			.purchase-tab-badge {
			  display: flex !important;
			  width: 63px;
			  padding: 2px 8px;
			  flex-direction: column;
			  justify-content: center;
			  align-items: center;
			  position: absolute;
			  right: 145.5px;
			  top: -7px;
			  left: 50%;
			  transform: translateX(-50%);
			  border-radius: 2px;
			  background: #448020;
			  color: #fff6f6;
			  font-family: Roboto;
			  font-size: 10px;
			  font-style: normal;
			  font-weight: 600;
			  line-height: normal;
			  letter-spacing: 0.5px;
			  text-transform: uppercase;
			  white-space: nowrap;
			  z-index: 1;
			}
			
			.purchase-tab-card.active .purchase-tab-badge {
			  top: -10px;
			}
			
			.save-badge {
			  display: inline-flex !important;
			  flex-direction: row !important;
			  align-items: center;
			  white-space: nowrap;
			  width: auto;
			  padding: 4px 8px;
			  color: #e2004d;
			  font-family: Roboto;
			  font-size: 12px;
			  font-style: normal;
			  font-weight: 700;
			  line-height: 18px;
			  border-radius: 30px;
			  background: #fbe6f1;
			}
			
			.info-panel-price,
			.case-price-total {
			  color: var(--content-accent-accent-primary, #e2004d);
			  font-family: "Noto Serif";
			  font-size: 20px;
			  font-style: normal;
			  font-weight: 700;
			  line-height: 140%;
			  letter-spacing: 0.2px;
			}
			
			.info-panel-price > .price-case,
			.price-unit {
			  color: var(--content-accent-accent-primary, #e2004d);
			  font-family: Roboto;
			  font-size: 12px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 140%;
			  letter-spacing: 0.12px;
			}
			
			.strike,
			.old-price {
			  color: var(--colour-text-secondary, #616161);
			  font-family: Roboto;
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 140%;
			  text-decoration-line: line-through;
			}
			
			.purchase-info-panel {
			  display: flex;
			  padding: 16px;
			  flex-direction: column;
			  justify-content: center;
			  align-items: flex-start;
			  gap: 16px;
			  align-self: stretch;
			  border-radius: 0 0 4px 4px;
			  border-right: 1px solid #e8e8e8;
			  border-bottom: 1px solid #e8e8e8;
			  border-left: 1px solid #e8e8e8;
			  background: #fff;
			}
			
			.info-panel-meta {
			  display: flex;
			  justify-content: space-between;
			  align-items: center;
			  width: 100%;
			}
			
			.info-panel-meta span:first-child {
			  color: #000;
			  font-family: Roboto;
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: normal;
			  letter-spacing: 0;
			}
			
			.info-panel-subscribe-single-bottle {
			  width: 100%;
			}
			
			.subscribe-price-row {
			  display: flex;
			  justify-content: space-between;
			  align-items: center;
			  align-self: stretch;
			  width: 100%;
			}
			
			.subscribe-case-upsell {
			  display: flex;
			  justify-content: space-between;
			  align-items: center;
			  align-self: stretch;
			  width: 100%;
			}
			
			.subscribe-case-upsell > .case-upsell-title {
			  color: #000;
			  font-family: Roboto;
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: normal;
			  letter-spacing: 0;
			}
			
			.purchase-info-panel > .info-panel-subscribe-case {
			  display: flex;
			  justify-content: space-between;
			  align-items: center;
			  width: 100%;
			}
			
			.info-panel-subscribe-case > .promo-sub-price {
			  color: #000;
			  font-family: Roboto;
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: normal;
			  letter-spacing: 0;
			}
			
			.straight-sku-wrapper {
			  display: flex;
			  flex-direction: column;
			  width: 100%;
			  gap: 8px;
			}
			
			.vpp-price {
			  color: var(--content-accent-accent-primary, #e2004d);
			}
			
			.price {
			  font-family: "Noto Serif";
			  font-size: 24px;
			  font-style: normal;
			  font-weight: 700;
			  line-height: 140%;
			  letter-spacing: 0.24px;
			}
			
			.sale-price > span {
			  color: #000;
			}
			
			.add-on-container {
			  padding-top: 10px;
			  color: #cf004f;
			  margin: 10px 0;
			  font-weight: 700;
			}
			
			.purchase-info-panel > .info-panel-one-time-case {
			  display: flex;
			  justify-content: space-between;
			  align-items: center;
			  align-self: stretch;
			  width: 100%;
			}
			
			.info-panel-one-time-case {
			  display: flex;
			  justify-content: space-between;
			  align-items: center;
			  width: 100%;
			  gap: 16px;
			  flex-wrap: wrap;
			}
			
			.info-panel-one-time-case .info-panel-meta {
			  flex: 1;
			}
			
			.saving-section-content {
			  display: inline-flex;
			  align-items: center;
			}
			
			.info-panel-one-time-case .saving-section-content {
			  display: inline-flex;
			  align-items: center;
			}
			
			.purchase-info-panel > a {
			  display: flex;
			  align-items: center;
			  width: 100%;
			}
			
			.purchase-info-panel .info-link {
			  color: #000;
			  text-align: center;
			  font-family: Roboto;
			  font-size: 12px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: normal;
			  text-decoration-line: underline;
			}
			
			.purchase-actions {
			  display: flex;
			  align-items: center;
			  flex: 1 0 0;
			  width: 100%;
			  gap: 24px;
			}
			
			.quantity-container {
			  display: flex;
			  align-items: center;
			}
			
			.quantity-container .quantity-btn {
			  display: flex;
			  width: 34px;
			  height: 34px;
			  padding: 0.667px;
			  justify-content: center;
			  align-items: center;
			  border-radius: 5px;
			  background: #fff;
			  font-size: 30px;
			  cursor: pointer;
			}
			
			.quantity-btn.minus {
			  border: 1px solid #cfcfcf;
			}
			
			.quantity-btn.minus:not(:disabled) {
			  border-color: #000;
			}
			
			.quantity-btn.minus:not(:disabled) svg path {
			  fill: #000;
			}
			
			.quantity-btn.minus:disabled {
			  border-color: #cfcfcf;
			  opacity: 0.5;
			  cursor: not-allowed;
			}
			
			.quantity-btn.minus:disabled svg path {
			  fill: #ccc;
			}
			
			.quantity-btn.plus {
			  border: 1px solid #000;
			}
			
			.quantity-btn.plus svg path {
			  fill: #000;
			}
			
			.quantity-display {
			  display: flex;
			  width: 40px;
			  min-height: 34px;
			  padding: 7px 0 8px 0;
			  justify-content: center;
			  align-items: center;
			  color: #000;
			  font-family: Roboto;
			  font-size: 16px;
			  font-style: normal;
			  font-weight: 500;
			  line-height: normal;
			}
			
			.purchase-info-panel > .add-to-cart-btn,
			.purchase-actions > .add-to-cart-btn {
			  display: flex;
			  padding: 12px 24px;
			  justify-content: center;
			  align-items: center;
			  flex: 1 0 0;
			  width: 100%;
			  height: 44px;
			  border: none;
			  border-radius: 2px;
			  background: #117b53;
			  color: #fff;
			  text-align: center;
			  font-family: Roboto !important;
			  font-size: 14px !important;
			  font-style: normal;
			  font-weight: 600;
			  line-height: 16px !important;
			  letter-spacing: 0.28px;
			  text-transform: uppercase !important;
			}
			
			.purchase-info-panel > .add-to-cart-btn:hover,
			.purchase-actions > .add-to-cart-btn:hover {
			  cursor: pointer;
			}
			
			.purchase-info-panel > .add-to-cart-btn:active,
			.purchase-actions > .add-to-cart-btn:active {
			  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
			  transform: translateY(2px);
			}
			
			.hide-original-panel .accordion-item-panel,
			.hide-original-panel .mantine-Accordion-chevron,
			.hide-original-panel .ss-item-content,
			.hide-original-panel [data-testid="pricing-and-purchase-panel-wrapper"] {
			  display: none !important;
			}
			
			.css-6baa2j .see-more-description,
			.css-6baa2j .product-layout .description-container {
			  margin: 0 !important;
			}
			
			.product-layout .layout-details > .no-print {
			  margin-top: 36px;
			}
			
			@media (max-width: 429px) {
			  .purchase-tab-card {
			    padding: 12px 16px;
			  }
			
			  .purchase-tab-card.active::before {
			    height: 4px;
			    top: -4px;
			  }
			
			  .purchase-tab-radio {
			    top: 3px;
			  }
			
			  .purchase-tab-title {
			    font-size: 10px;
			  }
			
			  .purchase-tab-card.active .purchase-tab-badge {
			    top: -9px;
			  }
			}
    `;

    const styleElement = document.createElement("style");
    styleElement.id = "purchase-tabs-styles";
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
})();
