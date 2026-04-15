(function () {
  console.log("David Adam Silva | LT147 D-version");

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

    // Add old price if there is one (strikethrough price)
    let oldPriceHTML = "";
    if (info.oldPrice) {
      oldPriceHTML = '<span class="old-price">' + info.oldPrice + "</span>";
    }

    card.innerHTML = `${badgeHTML}
		  <div class="purchase-tab-content">
		    <div class="min-tab-content">
		      <span class="purchase-tab-radio"></span>
		      <div class="tab-title-container">
		        <span class="purchase-tab-title">${info.title}</span>
		        <div class="info-panel-price">
		        	${info.price}<span class="price-case">/case </span>${oldPriceHTML}
		        </div>
		      </div>
		    </div>
		  </div>
		`;

    return card;
  }

  // Creates the panel that shows price and has the quantity/+add to cart
  function createInfoPanel() {
    const panel = document.createElement("div");
    panel.className = "purchase-info-panel";
    return panel;
  }

  // Updates the info panel with the correct information
  function updateInfoPanel(panel, info, quantity) {
    let oldPriceHTML = "";
    if (info.oldPrice) {
      oldPriceHTML = `<span class="old-price">${info.oldPrice}</span>`;
    }

    let saveHTML = "";
    if (info.save) {
      console.log("this is save badge info:", info.save);
      saveHTML = `<span class="save-badge">${info.save}</span>`;
    }

    console.log("This is what is store in the variable:", saveHTML);

    if (info.type === "subscribe") {
      // This panel is for subscribe and save
      panel.innerHTML = `
			  <div class="info-panel-meta">
					<span>${formatMetaInfo(info.meta)}</span>
					${saveHTML}
				</div>
			
				<a href="">
					<span class="info-link">How does it work?</span>
				</a>
			  
				<button class="add-to-cart-btn">${info.buttonText}</button>
			`;
    } else {
      // This panel is for one time purchase
      panel.innerHTML = `
				<div class="info-panel-meta">
				  <span>${formatMetaInfo(info.meta)}</span>

				</div>

				<div class="purchase-actions">
					<div class="quantity-container">
						<button class="quantity-btn minus">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							  <path d="M0.64 11.2798C0.64 11.2798 0.586667 11.2931 0.48 11.3198C0.373333 11.3465 0.266667 11.4398 0.16 11.5998C0.0533333 11.7598 0 11.9065 0 12.0398C0 12.1731 0.0533333 12.3198 0.16 12.4798C0.266667 12.6398 0.386667 12.7331 0.52 12.7598C0.653333 12.7865 4.48 12.7998 12 12.7998C19.52 12.7998 23.3467 12.7865 23.48 12.7598C23.6133 12.7331 23.7333 12.6398 23.84 12.4798C23.9467 12.3198 24 12.1731 24 12.0398C24 11.9065 23.96 11.7731 23.88 11.6398C23.8 11.5065 23.72 11.4265 23.64 11.3998C23.56 11.3731 22.9333 11.3331 21.76 11.2798H0.64Z" fill="#CCCCCC"/>
							</svg>
						</button>
						
						<span class="quantity-display">${quantity}</span>
						
						<button class="quantity-btn plus">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							  <path d="M11.6002 0.799782C11.4935 0.906448 11.4135 0.986448 11.3602 1.03979L11.2802 1.19979L11.2002 11.1998L1.92021 11.2798C1.44021 11.2798 1.17354 11.3065 1.12021 11.3598C0.853548 11.4665 0.720215 11.6931 0.720215 12.0398C0.720215 12.3865 0.880215 12.6131 1.20021 12.7198C1.30688 12.7198 3.01354 12.7198 6.32021 12.7198H11.2002L11.2802 22.7998L11.3602 22.9598C11.5202 23.1731 11.7335 23.2798 12.0002 23.2798C12.2668 23.2798 12.4802 23.1731 12.6402 22.9598L12.7202 22.7998L12.8002 12.7998L22.8002 12.7198L22.9602 12.6398C23.1735 12.4798 23.2802 12.2531 23.2802 11.9598C23.2802 11.6665 23.1468 11.4665 22.8802 11.3598C22.8268 11.3065 22.5602 11.2798 22.0802 11.2798L12.8002 11.1998L12.7202 1.91979C12.7202 1.43979 12.6935 1.13312 12.6402 0.999782C12.5868 0.866449 12.4535 0.773115 12.2402 0.719782C12.0268 0.666448 11.8135 0.693115 11.6002 0.799782Z" fill="black"/>
							</svg>
						</button>
					</div>
					
					<button class="add-to-cart-btn">${info.buttonText}</button>
				</div>
			`;

      // Set up quantity buttons for one-time purchase
      const minusBtn = panel.querySelector(".minus");
      const plusBtn = panel.querySelector(".plus");
      const quantityDisplay = panel.querySelector(".quantity-display");

      // Handle minus button click
      if (minusBtn) {
        minusBtn.onclick = function () {
          if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
          }
        };
      }

      // Handle plus button click
      if (plusBtn) {
        plusBtn.onclick = function () {
          quantity++;
          quantityDisplay.textContent = quantity;
        };
      }
    }

    // Set up add to cart button (common for both)
    const addToCartBtn = panel.querySelector(".add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.onclick = function () {
        if (info.sourceButton) {
          info.sourceButton.click(); // Click the original add to cart button
        }
      };
    }
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
    };
  }

  // Helper function to get clean text from an element
  function getText(element) {
    if (!element) return "";
    // Remove extra spaces and trim
    return element.textContent.replace(/\s+/g, " ").trim();
  }

  // Helper functions
  function formatMetaInfo(metaText) {
    // Pattern matches: "1 case (12 bottles) - £7.99 per bottle"
    const match = metaText.match(/\((\d+) bottles\).*?£([\d.]+)/);

    if (match) {
      const bottleCount = match[1]; // "12"
      const price = match[2]; // "7.99"
      return `${bottleCount} bottles - £${price}/bottle`;
    }

    // Return original if pattern doesn't match
    return metaText;
  }

  // Adds all the CSS styles to make our tabs look good
  function addStylesToPage() {
    // Don't add styles twice
    if (document.getElementById("purchase-tabs-styles")) return;

    const styles = `
			.custom-purchase-tabs {
				box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
				border-radius: 4px 4px 4px 4px;
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
				border: 1px solid #E8E8E8;
				background: #F8F8F8;
			}
			
			.subscribe-and-save {
				border-radius: 0 4px 0 0 !important;
				border: 1px solid #E8E8E8;
				background: #F8F8F8;
			}
			
			.purchase-tab-card.active {
				border-radius: 0 !important;
				border-top: 1px solid;
				border-right: 1px solid;
				border-left: 1px solid;
				border-bottom: 0 solid;
				border-color: #E8E8E8;
				background: #FFF;
			}
			
			.purchase-tab-card.active::before {
			  content: '';
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
			
			.purchase-tab-title span:last-child {
			  color: #000;
			  font-family: Roboto;
			  font-size: 12px;
			  font-style: normal;
			  font-weight: 600;
			  line-height: normal;
			  letter-spacing: 0.24px;
			  text-transform: uppercase;
			}
			
			.purchase-tab-radio {
			  width: 16px;
				height: 16px;
				flex-shrink: 0;
				aspect-ratio: 1/1;
				position: relative;
				top: 6px;
				background: #FFF;
			  border-radius: 50%;
			  border: 2px solid #adadad;
			}
			
			.purchase-tab-card.active .purchase-tab-radio {
			  width: 16px;
			  height: 16px;
			  flex-shrink: 0;
			  border-radius: 50%;
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
			
			.purchase-tab-price {
			  font-size: 18px;
			  font-weight: bold;
			  color: #d4145a;
			}
			
			.purchase-tab-subtext {
			  display: none;
			  margin-top: 8px;
			  font-size: 14px;
			  color: #111;
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
			  color: #FFF6F6;
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
			
			.purchase-tab-card.subscribe .purchase-tab-badge,
			.purchase-tab-card.active .purchase-tab-badge {
			  display: block;
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
				border-right: 1px solid #E8E8E8;
				border-bottom: 1px solid #E8E8E8;
				border-left: 1px solid #E8E8E8;
				background: #FFF;
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
				letter-spacing: var(--typography-label-Small-Regular-letter-spacing, 0);
			}
			
			.save-badge {
			  display: flex;
			  padding: 4px 8px;
			  flex-direction: column;
			  align-items: flex-start;
			  color: #e2004d;
			  font-family: Roboto;
			  font-size: 12px;
			  font-style: normal;
			  font-weight: 700;
			  line-height: 18px; /* 150% */
			  border-radius: 30px;
			  background: #fbe6f1;
			}
			
			.info-panel-price {
				color: var(--content-accent-accent-primary, #E2004D);
				font-family: "Noto Serif";
				font-size: 20px;
				font-style: normal;
				font-weight: 700;
				line-height: 140%; /* 28px */
				letter-spacing: 0.2px;
			}
			
			.info-panel-price > .price-case {
				color: var(--content-accent-accent-primary, #E2004D);
				font-family: Roboto;
				font-size: 12px;
				font-style: normal;
				font-weight: 400;
				line-height: 140%; /* 16.8px */
				letter-spacing: 0.12px;
			}
			
			.old-price {
				color: var(--colour-text-secondary, #616161);
				font-family: Roboto;
				font-size: 14px;
				font-style: normal;
				font-weight: 400;
				line-height: 140%; /* 19.6px */
				text-decoration-line: line-through;
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
			
			.quantity-btn {
			  width: 48px;
			  height: 48px;
			  border: 1px solid #cfcfcf;
			  background: white;
			  font-size: 30px;
			  cursor: pointer;
			}
			
			.quantity-display {
			  display: flex;
				width: 40px;
				min-height: var(--height-34, 34px);
				padding: 7.002px 0 7.998px 0;
				justify-content: center;
				align-items: center;
				color: #000;
				font-family: Roboto;
				font-size: 16px;
				font-style: normal;
				font-weight: 500;
				line-height: normal;
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
				border-radius: var(--radius-xs, 2px);
				background: var(--surface-action-primary, #117B53);
				color: var(--content-on-surface-on-surface, #FFF);
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
			
			.purchase-actions .quantity-container > .minus{
				border: var(--stroke-weight-1, 1px) solid var(--color-grey-80, #CCC);
				background: var(--color-white-solid, #FFF);
			}
			
			.purchase-actions .quantity-container > .plus {
				border: var(--stroke-weight-1, 1px) solid var(--color-black-solid, #000);
				background: var(--color-white-solid, #FFF);
			}
			
			.purchase-actions .quantity-container > .quantity-btn {
			  display: flex;
			  width: 34px;
			  height: 34px;
			  padding: 0.667px;
			  justify-content: center;
			  align-items: center;
			  border-radius: 5px;
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
			
			@media (max-width: 429px) {
				.purchase-tab-card {
					padding: 12px 16px;
				}
				
				.purchase-tab-card.active::before {
					height: 4px;
					top: -4px;
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
