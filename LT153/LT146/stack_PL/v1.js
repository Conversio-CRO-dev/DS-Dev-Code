console.log("==================================================>");
console.log("David Adam Silva | LT153 - LT146/stack product list");
console.log("==================================================>");

// <script>
function elementReady(selector) {
  return new Promise((resolve, reject) => {
    let el = document.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }
    new MutationObserver((mutationRecords, observer) => {
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
        resolve(element);
        observer.disconnect();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

// Function to restructure a single product item
function restructureProductItem(productListItem) {
  // Check if already restructured to avoid duplicates
  if (productListItem.querySelector(".product-content-wrapper")) return;

  // Create a wrapper div to group all product content except the image
  const productContentWrapper = document.createElement("div");
  productContentWrapper.className = "product-content-wrapper";

  // Get the product image container (we want to keep this separate)
  const productImageContainer = productListItem.querySelector(".image-bg");

  // If no image container, skip this item
  if (!productImageContainer) return;

  // Get all elements inside the list item that aren't the image
  const nonImageElements = productListItem.querySelectorAll(
    ":scope > :not(.image-bg)",
  );

  // Add the wrapper to the product list item
  productListItem.appendChild(productContentWrapper);

  // Move all non-image content into the wrapper
  nonImageElements.forEach((element) => {
    productContentWrapper.appendChild(element);
  });

  // Put the image back at the beginning (before the wrapper)
  productListItem.insertBefore(productImageContainer, productContentWrapper);
}

// Function to restructure all product items
function restructureAllProductItems() {
  // Select all product list items
  const productListItems = document.querySelectorAll(".ais-Hits-item");

  productListItems.forEach((item) => {
    restructureProductItem(item);
  });
}

// Call the function to restructure all items
restructureAllProductItems();

// Watch for new products being added to the grid and restructure them
function observeAndRestructureNewProducts() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        // Check if the added node is a product item or contains product items
        if (node.nodeType === 1) {
          if (node.classList && node.classList.contains("ais-Hits-item")) {
            // Directly added product item
            restructureProductItem(node);
          } else if (node.querySelectorAll) {
            // Check for product items inside the added node
            const productItems = node.querySelectorAll(".ais-Hits-item");
            productItems.forEach((item) => {
              restructureProductItem(item);
            });
          }
        }
      });
    });
  });

  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Start observing after initial restructuring
setTimeout(() => {
  observeAndRestructureNewProducts();
}, 1000);

function allElementsReady(selector) {
  return new Promise((resolve, reject) => {
    let elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      resolve(Array.from(elements));
      return;
    }
    const observer = new MutationObserver(() => {
      let elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        observer.disconnect();
        resolve(Array.from(elements));
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function nestedElementReady(parentElement, selector) {
  return new Promise((resolve, reject) => {
    let el = parentElement.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }
    const observer = new MutationObserver((mutationRecords) => {
      let el = parentElement.querySelector(selector);
      if (el) {
        resolve(el);
        observer.disconnect();
      }
    });
    observer.observe(parentElement, {
      childList: true,
      subtree: true,
    });
  });
}

// Create a container to group product-content-wrapper and custom-quick-add
function groupContentAndQuickAdd() {
  const productItems = document.querySelectorAll(".ais-Hits-item");

  productItems.forEach((item) => {
    // Check if we already processed this item
    if (item.querySelector(".right-side-group")) return;

    // Get the product-content-wrapper (this contains title, rating, etc.)
    const contentWrapper = item.querySelector(".product-content-wrapper");

    // Get or wait for custom-quick-add to be added
    const checkForQuickAdd = () => {
      const quickAdd = item.querySelector("#custom-quick-add");

      if (contentWrapper && quickAdd) {
        // Create a new container for grouping
        const groupContainer = document.createElement("div");
        groupContainer.className = "right-side-group";

        // Clone or move the elements
        // First, get the parent of contentWrapper (should be the right side container)
        const rightSideContainer = contentWrapper.parentNode;

        // Move both elements into the group container
        groupContainer.appendChild(contentWrapper.cloneNode(true));
        groupContainer.appendChild(quickAdd.cloneNode(true));

        // Remove original elements
        contentWrapper.remove();
        quickAdd.remove();

        // Append the group container to the right side
        rightSideContainer.appendChild(groupContainer);
      } else if (contentWrapper && !quickAdd) {
        // If quick-add isn't there yet, wait for it
        const observer = new MutationObserver((mutations, obs) => {
          const quickAddCheck = item.querySelector("#custom-quick-add");
          if (quickAddCheck) {
            obs.disconnect();

            const groupContainer = document.createElement("div");
            groupContainer.className = "right-side-group";

            const rightSideContainer = contentWrapper.parentNode;

            groupContainer.appendChild(contentWrapper.cloneNode(true));
            groupContainer.appendChild(quickAddCheck.cloneNode(true));

            contentWrapper.remove();
            quickAddCheck.remove();

            rightSideContainer.appendChild(groupContainer);
          }
        });

        observer.observe(item, {
          childList: true,
          subtree: true,
        });
      }
    };

    checkForQuickAdd();
  });
}

async function addCustomQuickAdd() {
  let allAtbButtons = await allElementsReady(
    ".ais-Hits .ais-Hits-item .grid-addto-cart-container",
  );

  // Process each item
  const promises = allAtbButtons.map(async (atb) => {
    let item = atb.closest(".ais-Hits-item");
    let reserveStuff = item.querySelector(".reserve-text");

    // Get product ID from URL
    const url = item.querySelector("[href]")?.getAttribute("href");
    if (!url) return;

    const productId = getProductId(url);

    // Fetch the correct itemCode from API
    let itemCode = productId;

    try {
      const response = await fetch(
        "https://www.laithwaites.co.uk/api/product/item/" + productId,
      );
      if (response.ok) {
        const data = await response.json();
        itemCode = data.response?.skus?.[0]?.itemCode || productId;
      }
    } catch (error) {
      console.error("Error fetching itemCode for " + productId + ":", error);
    }

    let customQuickAdd = document.createElement("div");
    customQuickAdd.setAttribute("id", "custom-quick-add");
    customQuickAdd.setAttribute("data-item-code", itemCode);
    customQuickAdd.innerHTML = `
							<div id="quantity-selector">
							    <button disabled class="qty-btn" id="qty-decrease"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							  <path d="M0.64 11.2798C0.64 11.2798 0.586667 11.2931 0.48 11.3198C0.373333 11.3465 0.266667 11.4398 0.16 11.5998C0.0533333 11.7598 0 11.9065 0 12.0398C0 12.1731 0.0533333 12.3198 0.16 12.4798C0.266667 12.6398 0.386667 12.7331 0.52 12.7598C0.653333 12.7865 4.48 12.7998 12 12.7998C19.52 12.7998 23.3467 12.7865 23.48 12.7598C23.6133 12.7331 23.7333 12.6398 23.84 12.4798C23.9467 12.3198 24 12.1731 24 12.0398C24 11.9065 23.96 11.7731 23.88 11.6398C23.8 11.5065 23.72 11.4265 23.64 11.3998C23.56 11.3731 22.9333 11.3331 21.76 11.2798H0.64Z" fill="currentColor"/>
							</svg></button>
							    <input type="number" id="custom-qty-input" value="1" min="1" max="99">
							    <button class="qty-btn" id="qty-increase"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							  <path d="M11.6 0.799786C11.4933 0.906452 11.4133 0.986452 11.36 1.03979L11.28 1.19979L11.2 11.1998L1.91997 11.2798C1.43997 11.2798 1.1733 11.3065 1.11997 11.3598C0.853304 11.4665 0.719971 11.6931 0.719971 12.0398C0.719971 12.3865 0.879971 12.6131 1.19997 12.7198C1.30664 12.7198 3.0133 12.7198 6.31997 12.7198H11.2L11.28 22.7998L11.36 22.9598C11.52 23.1731 11.7333 23.2798 12 23.2798C12.2666 23.2798 12.48 23.1731 12.64 22.9598L12.72 22.7998L12.8 12.7998L22.8 12.7198L22.96 12.6398C23.1733 12.4798 23.28 12.2531 23.28 11.9598C23.28 11.6665 23.1466 11.4665 22.88 11.3598C22.8266 11.3065 22.56 11.2798 22.08 11.2798L12.8 11.1998L12.72 1.91979C12.72 1.43979 12.6933 1.13312 12.64 0.999786C12.5866 0.866453 12.4533 0.773119 12.24 0.719786C12.0266 0.666452 11.8133 0.693119 11.6 0.799786Z" fill="currentColor"/>
							</svg></button>
							</div>
							<button id="custom-atb">
							    <span class="btn-text-full">ADD TO BASKET</span>
							    <span class="btn-text-short">ADD</span>
							</button>
						`;

    let addtoCartCont = item.querySelector(".addToCart-container");

    if (!item.querySelector("#custom-quick-add") && !reserveStuff) {
      item.appendChild(customQuickAdd);
    } else if (reserveStuff) {
      item.classList.add("reserve-item");
    }
  });

  // Wait for all API calls to complete
  await Promise.all(promises);

  groupContentAndQuickAdd();
}

addCustomQuickAdd();
groupContentAndQuickAdd();

async function getPricingPanels() {
  let allAtbButtons = await allElementsReady(
    '.ais-Hits-item [aria-haspopup="dialog"]',
  );

  allAtbButtons.forEach(async (atbButton) => {
    let atbCont = atbButton.closest(".grid-addto-cart-container");
    let itemCont = atbButton.closest(".ais-Hits-item");

    // add special offer price badge where needed
    if (
      !itemCont.querySelector(".offer-price-badge") &&
      !itemCont.querySelector(".reserve-text")
    ) {
      atbButton.click();

      // wait for popup to show up and populate contents
      let popupAtbButton = await nestedElementReady(
        atbCont,
        ".mantine-Popover-dropdown .cart-button",
      );
      let popup = await nestedElementReady(
        atbCont,
        ".mantine-Popover-dropdown",
      );

      let clonedPopup = popup.cloneNode(true);
      itemCont.click();

      // cards with pricing deals
      let tieredDiscounts = clonedPopup.querySelector(
        ".tiered-price-container",
      );
      let bulkDeal = clonedPopup.querySelector(".bulk-add-to-cart");
      let caseDeals = clonedPopup.querySelector(".case-details");
      let addOns = clonedPopup.querySelector(".add-on-container");
      let doubleCaseDeal = clonedPopup.querySelectorAll(".top-price-section");
      let caseSku = clonedPopup.querySelector(".case-sku");

      if (
        tieredDiscounts ||
        bulkDeal ||
        bulkDeal ||
        caseDeals ||
        addOns ||
        (caseSku && doubleCaseDeal.length > 1)
      ) {
        // add deal icon
        let dealIcon = document.createElement("div");
        dealIcon.classList.add("offer-price-badge");
        dealIcon.innerHTML = `<div class="badge-price"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
  <g clip-path="url(#clip0_159_17216)">
    <path d="M9.46741 1.10107C11.0278 1.01553 12.4915 1.30449 13.8737 1.96924C14.6114 2.32407 15.2704 2.76233 15.899 3.31689C16.1255 3.5167 16.5577 3.95158 16.7448 4.16748C17.6896 5.25833 18.3743 6.60976 18.692 8.00928C19.0516 9.59337 18.9645 11.3607 18.4635 12.8062C17.9819 14.1956 17.3417 15.2388 16.3639 16.2368C15.1579 17.4677 13.6611 18.3082 11.9967 18.6909C10.7262 18.983 9.30459 18.9866 8.04065 18.7007C6.57937 18.3701 5.23079 17.6795 4.1012 16.6831C2.97509 15.6897 2.12926 14.4474 1.61487 13.0298C1.30545 12.177 1.14721 11.3829 1.09729 10.4194C0.978214 8.1192 1.77405 5.85022 3.31702 4.10107C4.88881 2.31934 7.12598 1.22947 9.46741 1.10107ZM9.95667 1.34326C9.73965 1.34468 9.46242 1.35316 9.33752 1.36377C8.00305 1.47709 6.81443 1.84492 5.66174 2.50244C4.54641 3.13881 3.49363 4.13567 2.76526 5.23975C1.44569 7.24015 1.01712 9.71274 1.58459 12.0483C1.9083 13.3806 2.54275 14.6121 3.43811 15.6479C4.3864 16.745 5.54912 17.5635 6.90002 18.0854C8.8822 18.8513 11.1181 18.8513 13.1002 18.0854C14.057 17.7158 14.891 17.2181 15.649 16.561C16.7514 15.6054 17.5631 14.4522 18.0856 13.1001C18.8512 11.1185 18.8512 8.8815 18.0856 6.8999C17.5631 5.54778 16.7514 4.39457 15.649 3.43896C14.0725 2.07232 12.0523 1.32959 9.95667 1.34326ZM9.11877 8.70068C9.35383 8.70028 9.47018 8.70576 9.54749 8.71729C9.60583 8.72598 9.64485 8.73841 9.71936 8.77393C9.87992 8.85046 10.0242 9.00397 10.0934 9.18115L10.11 9.2251L10.1198 10.8032C10.1252 11.7191 10.1259 12.186 10.1461 12.4341C10.1561 12.5562 10.1748 12.7001 10.2448 12.8345C10.2824 12.9068 10.3252 12.9592 10.359 12.9956C10.3738 13.0115 10.388 13.0257 10.3961 13.0337C10.4058 13.0433 10.4114 13.0488 10.4166 13.0542C10.5037 13.1444 10.6294 13.2716 10.858 13.3306C11.0151 13.3711 11.2168 13.3746 11.4371 13.3804C11.6557 13.3861 11.7403 13.3899 11.7858 13.395H11.7877C11.7889 13.3956 11.7902 13.3963 11.7916 13.397C11.8446 13.4213 11.8602 13.4411 11.8629 13.4448C11.8645 13.4471 11.8738 13.4606 11.8766 13.5034C11.8786 13.5346 11.8775 13.5507 11.8766 13.5571C11.8741 13.5611 11.8667 13.5714 11.8512 13.5884C11.8496 13.5901 11.8452 13.595 11.8375 13.6021C11.8298 13.6092 11.8211 13.6173 11.8121 13.6245L11.8102 13.6255C11.7497 13.6284 11.6387 13.6304 11.4 13.6304C11.1465 13.6304 11.0303 13.6293 10.9586 13.6245C10.9117 13.6214 10.8988 13.6176 10.8483 13.603C10.4065 13.476 10.0774 13.1625 9.92834 12.7202L9.89026 12.6079L9.8844 11.0728L9.87854 9.4585L9.87659 8.96045H9.09045C8.92426 8.96045 8.84481 8.95361 8.80042 8.9458C8.78227 8.9426 8.7751 8.94035 8.77405 8.93994C8.77297 8.93952 8.76903 8.9376 8.76038 8.93213C8.67641 8.87859 8.68534 8.74603 8.7887 8.70947C8.79236 8.70887 8.80201 8.70795 8.82092 8.70654C8.87264 8.70272 8.95732 8.70096 9.11877 8.70068ZM9.72913 5.78467C9.77891 5.78589 9.80712 5.78723 9.82678 5.78857C9.84448 5.7898 9.84456 5.79033 9.83655 5.78857C9.81729 5.78432 9.80795 5.77664 9.88147 5.81299C9.96996 5.85685 10.0519 5.9413 10.0934 6.02881C10.1003 6.04348 10.1049 6.05398 10.108 6.06104C10.1082 6.06379 10.1089 6.06715 10.109 6.0708C10.1099 6.09682 10.11 6.13252 10.11 6.19092C10.11 6.25303 10.1089 6.28901 10.108 6.31494C10.1037 6.32388 10.0988 6.33821 10.0885 6.35889C9.99243 6.55185 9.83368 6.63113 9.63831 6.604C9.47714 6.58148 9.32258 6.43736 9.29163 6.25342C9.25994 6.06413 9.38228 5.8561 9.57678 5.7915C9.58382 5.78917 9.58792 5.78782 9.60022 5.78662L9.72913 5.78467Z" fill="#222222" stroke="#222222"/>
  </g>
  <defs>
    <clipPath id="clip0_159_17216">
      <rect width="20" height="20" fill="white"/>
    </clipPath>
  </defs>
</svg></div>`;

        let pricingCont = await nestedElementReady(
          itemCont,
          '[data-testid="pricing-and-purchase-panel-wrapper"] div',
        );
        pricingCont?.classList.add("custom-pricing-cont");

        // add deal icon to offer text cotnainer and make them sit on one line
        let dealTextEl = await nestedElementReady(
          itemCont,
          ".lowestPricePossibleOnOffer",
        );
        let dealText = dealTextEl.textContent;
        let newDealText = document.createElement("span");
        newDealText.innerHTML = dealText;
        dealTextEl.innerHTML = "";
        dealTextEl.appendChild(newDealText);
        dealTextEl.appendChild(dealIcon);

        // create and add cutsom deal popup
        let dealStuff = clonedPopup.querySelector(".top-price-section");
        // remove the extra button section for popups with or seperation
        let orSection = clonedPopup.querySelector(".separation-line");
        if (orSection) orSection.parentElement.classList.add("hide-section");

        let customDealPopup = document.createElement("div");
        customDealPopup.classList.add("deal-popup-container");

        customDealPopup.innerHTML =
          '<div class="deal-popup-arrow"></div>' + dealStuff.outerHTML;
        dealIcon.prepend(customDealPopup);
      }
    }
  });
}

getPricingPanels();

// Track currently open popup
let currentOpenPopup = null;

// function positionDealPopup(badge) {
// 	const popup = badge.querySelector(".deal-popup-container");
// 	const arrow = badge.querySelector(".deal-popup-arrow");

// 	if (!popup || !arrow) return;

// 	// Get badge position relative to viewport
// 	const badgeRect = badge.getBoundingClientRect();
// 	const popupWidth = popup.offsetWidth || 350;
// 	const viewportWidth = window.innerWidth;

// 	// Badge center in viewport coordinates
// 	const badgeCenterX = badgeRect.left + badgeRect.width / 2;

// 	// On mobile with full-width popup, use viewport-based positioning
// 	const isMobile = viewportWidth <= 768;

// 	if (isMobile) {
// 		// Mobile: center popup in viewport with margins
// 		// const margin = 16;
// 		// popup.style.left = margin - badgeRect.left + "px";
// 		// popup.style.transform = "none";
// 		// popup.style.bottom = "37px";

// 		// // Arrow points to badge center
// 		// const arrowPosition = badgeCenterX - margin - 14;

// 		// arrow.style.left = arrowPosition + "px";
// 		// arrow.style.marginLeft = "0";
// 			// Mobile: position relative to container, not viewport
// 	const margin = 16;
// 	popup.style.left = margin + "px";
// 	popup.style.transform = "none";
// 	popup.style.bottom = "37px";

// 	// Arrow points to badge center relative to popup
// 	const popupRect = popup.getBoundingClientRect();
// 	const arrowPosition = badgeCenterX - popupRect.left - 14;

// 	arrow.style.left = arrowPosition + "px";
// 	arrow.style.marginLeft = "0";
// 	} else {
// 		// Desktop: original logic
// 		const margin = 20;
// 		const idealPopupLeft = badgeCenterX - popupWidth / 2;

// 		const needsLeftAdjustment = idealPopupLeft < margin;
// 		const needsRightAdjustment = idealPopupLeft + popupWidth > viewportWidth - margin;

// 		if (!needsLeftAdjustment && !needsRightAdjustment) {
// 			// Perfect - keep centered
// 			popup.style.left = "50%";
// 			popup.style.transform = "translateX(-50%)";
// 			arrow.style.left = "50%";
// 			arrow.style.marginLeft = "-1.125rem";
// 		} else {
// 			// Needs adjustment
// 			let popupLeft = idealPopupLeft;

// 			if (needsLeftAdjustment) {
// 				popupLeft = margin;
// 			} else if (needsRightAdjustment) {
// 				popupLeft = viewportWidth - margin - popupWidth;
// 			}

// 			// Position popup relative to badge
// 			const offsetFromBadge = popupLeft - badgeRect.left;

// 			popup.style.left = offsetFromBadge + "px";
// 			popup.style.transform = "none";

// 			// Arrow position
// 			const arrowPosition = badgeCenterX - popupLeft;

// 			arrow.style.left = arrowPosition + "px";
// 			arrow.style.marginLeft = "0";
// 		}
// 	}
// }

function positionDealPopup(badge) {
  const popup = badge.querySelector(".deal-popup-container");
  const arrow = badge.querySelector(".deal-popup-arrow");

  if (!popup || !arrow) return;

  // Get badge position relative to viewport
  const badgeRect = badge.getBoundingClientRect();
  const popupWidth = popup.offsetWidth || 350;
  const viewportWidth = window.innerWidth;

  // Badge center in viewport coordinates
  const badgeCenterX = badgeRect.left + badgeRect.width / 2;

  // On mobile with full-width popup, use viewport-based positioning
  const isMobile = viewportWidth <= 767;
  const isTablet = viewportWidth >= 768 && viewportWidth <= 1024;

  const prodCard = badge.closest(".ais-Hits-item");
  const width = prodCard.getBoundingClientRect().width;
  // console.log(width);
  popup.style.width = width + 5 + "px";
  popup.style.maxWidth = width + 5 + "px";

  if (isMobile) {
    // Mobile: center popup in viewport with margins
    const margin = 16;
    popup.style.left = margin - badgeRect.left - 3 + "px";
    popup.style.transform = "none";
    popup.style.bottom = "37px";

    // Arrow points to badge center
    const arrowPosition = badgeCenterX - margin - 14;

    arrow.style.left = arrowPosition + "px";
    arrow.style.marginLeft = "0";
  } else if (isTablet) {
    const margin = 16;
    popup.style.left = margin - badgeRect.left / 2 + "px";
    popup.style.transform = "none";
    popup.style.bottom = "37px";

    // Arrow points to badge center
    const arrowPosition = badgeCenterX / 2 - margin - 14;

    arrow.style.left = arrowPosition + "px";
    arrow.style.marginLeft = "0";
  } else {
    // Desktop:
    const margin = 20;
    const idealPopupLeft = badgeCenterX - popupWidth / 2;

    const needsLeftAdjustment = idealPopupLeft < margin;
    const needsRightAdjustment =
      idealPopupLeft + popupWidth > viewportWidth - margin;

    if (!needsLeftAdjustment && !needsRightAdjustment) {
      // Perfect - keep centered
      popup.style.left = "50%";
      popup.style.transform = "translateX(-50%)";
      arrow.style.left = "50%";
      arrow.style.marginLeft = "-1.125rem";
    } else {
      // Needs adjustment
      let popupLeft = idealPopupLeft;

      if (needsLeftAdjustment) {
        popupLeft = margin;
      } else if (needsRightAdjustment) {
        popupLeft = viewportWidth - margin - popupWidth;
      }

      // Position popup relative to badge
      const offsetFromBadge = popupLeft - badgeRect.left;

      popup.style.left = offsetFromBadge + "px";
      popup.style.transform = "none";

      // Arrow position
      const arrowPosition = badgeCenterX - popupLeft;

      arrow.style.left = arrowPosition + "px";
      arrow.style.marginLeft = "0";
    }
  }
}

function showPopup(badge) {
  closePopup(currentOpenPopup);

  const popup = badge.querySelector(".deal-popup-container");
  if (popup) {
    badge.classList.add("popup-active");
    currentOpenPopup = badge;
    positionDealPopup(badge);

    // console.log("Opens pricing popup");
    adobeDataLayer.push({
      event: "targetClickEvent",
      eventData: {
        click: {
          clickLocation: "Conversio CRO",
          clickAction: "LT146 | Event Tracking",
          clickText: "LT146 (Variation 1) | Opens pricing popup",
        },
      },
    });
  }
}

function closePopup(badge) {
  if (badge) {
    // Clear reference first
    if (currentOpenPopup === badge) {
      currentOpenPopup = null;
    }

    badge.classList.remove("popup-active");
  }
}

function closeAllPopups() {
  if (currentOpenPopup) {
    closePopup(currentOpenPopup);
  }
}

// Detect if device is mobile/touch
function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

// Desktop hover behavior
if (!isTouchDevice()) {
  const trackedBadges = new Set(); // Track which badge elements have fired

  document.addEventListener(
    "mouseenter",
    (e) => {
      if (!e.target.closest) return;
      const badge = e.target.closest(".offer-price-badge");
      if (badge && badge.querySelector(".deal-popup-container")) {
        positionDealPopup(badge);

        // Only track if this specific badge hasn't been tracked yet
        if (!trackedBadges.has(badge)) {
          trackedBadges.add(badge);

          // console.log("Opens pricing popup (desktop hover)");
          adobeDataLayer.push({
            event: "targetClickEvent",
            eventData: {
              click: {
                clickLocation: "Conversio CRO",
                clickAction: "LT146 | Event Tracking",
                clickText: "LT146 (Variation 1) | Opens pricing popup",
              },
            },
          });
        }
      }
    },
    true,
  );

  // Clear tracking when mouse leaves the badge AND popup
  document.addEventListener(
    "mouseleave",
    (e) => {
      if (!e.target.closest) return;
      const badge = e.target.closest(".offer-price-badge");
      if (badge && trackedBadges.has(badge)) {
        // Check if mouse is actually leaving to outside (not to a child)
        const relatedTarget = e.relatedTarget;
        if (!badge.contains(relatedTarget)) {
          trackedBadges.delete(badge);
        }
      }
    },
    true,
  );
}

// Mobile click behavior
document.addEventListener("click", (e) => {
  if (isTouchDevice()) {
    if (!e.target.closest) return;
    const badge = e.target.closest(".offer-price-badge");

    if (badge && badge.querySelector(".deal-popup-container")) {
      e.preventDefault();
      e.stopPropagation();

      // Toggle popup
      if (badge.classList.contains("popup-active")) {
        closePopup(badge);
      } else {
        showPopup(badge);
      }
    } else {
      // Clicked outside - close any open popup
      closeAllPopups();
    }
  }
});

// Close popup on scroll (mobile)
if (isTouchDevice()) {
  let scrollStartY = 0;

  // Track scroll position when popup opens
  document.addEventListener("click", (e) => {
    if (!e.target.closest) return;
    const badge = e.target.closest(".offer-price-badge");
    if (badge && badge.querySelector(".deal-popup-container")) {
      scrollStartY = window.scrollY;
    }
  });

  window.addEventListener(
    "scroll",
    () => {
      if (currentOpenPopup) {
        const scrollDistance = Math.abs(window.scrollY - scrollStartY);

        if (scrollDistance > 100) {
          closeAllPopups();
        }
      }
    },
    {
      passive: true,
    },
  );
}

// Reposition on window resize
window.addEventListener("resize", () => {
  if (currentOpenPopup) {
    positionDealPopup(currentOpenPopup);
  }
});

function observeProductGrid() {
  // Observe the parent container that persists across navigation
  const observer = new MutationObserver((mutations) => {
    let hasProductChanges = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            // Check if the grid itself was added, or if it contains product items
            if (
              node.classList?.contains("ais-Hits") ||
              node.querySelector?.(".ais-Hits") ||
              node.classList?.contains("ais-Hits-item") ||
              node.querySelector?.(".ais-Hits-item")
            ) {
              hasProductChanges = true;

              break;
            }
          }
        }
      }
      if (hasProductChanges) break;
    }

    if (hasProductChanges) {
      addCustomQuickAdd();
      getPricingPanels();
    }
  });

  // Observe a parent that doesn't get removed (like body or a wrapper div)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

setTimeout(observeProductGrid, 1000);

function getProductId(url) {
  const lastSlashIndex = url.lastIndexOf("/");
  const firstQuestionIndex = url.indexOf("?");

  if (lastSlashIndex !== -1 && firstQuestionIndex !== -1) {
    return url.substring(lastSlashIndex + 1, firstQuestionIndex);
  }

  // If no query string, get everything after last slash
  if (lastSlashIndex !== -1 && firstQuestionIndex === -1) {
    return url.substring(lastSlashIndex + 1);
  }

  return null;
}

elementReady("body").then((main) => {
  if (!main.classList.contains("test-lt146")) {
    main.addEventListener("click", (e) => {
      if (e.target.closest("#qty-increase")) {
        const item = e.target.closest("#custom-quick-add");
        const input = item.querySelector("#custom-qty-input");

        if (input) {
          const newValue = parseInt(input.value) + 1;
          if (newValue <= 99) {
            input.value = newValue;
            let decreaseBtn = item.querySelector("#qty-decrease");
            if (newValue > 1 && decreaseBtn) {
              decreaseBtn.disabled = false;
            }
          }
        }

        adobeDataLayer.push({
          event: "targetClickEvent",
          eventData: {
            click: {
              clickLocation: "Conversio CRO",
              clickAction: "LT146 | Event Tracking",
              clickText:
                "LT146 (Variation 1) | User clicks increase quantity button",
            },
          },
        });
      }

      if (e.target.closest("#qty-decrease")) {
        const item = e.target.closest("#custom-quick-add");
        const input = item.querySelector("#custom-qty-input");
        if (input) {
          const newValue = parseInt(input.value) - 1;
          if (newValue >= 1) {
            input.value = newValue;
            let decreaseBtn = item.querySelector("#qty-decrease");
            if (newValue === 1 && decreaseBtn) {
              decreaseBtn.disabled = true;
            }
          }
        }

        adobeDataLayer.push({
          event: "targetClickEvent",
          eventData: {
            click: {
              clickLocation: "Conversio CRO",
              clickAction: "LT146 | Event Tracking",
              clickText:
                "LT146 (Variation 1) | User clicks decrease quantity button",
            },
          },
        });
      }

      // CUSTOM ATB CLICK
      if (e.target.closest("#custom-atb")) {
        const quickAdd = e.target.closest("#custom-quick-add");
        const itemCode = quickAdd.getAttribute("data-item-code");
        const quantityToAdd = parseInt(
          quickAdd.querySelector("#custom-qty-input").value,
        );

        let customAtb = e.target.closest("#custom-atb");

        // const originalText = customAtb.textContent;

        // //customAtb.textContent = "ADDING...";
        // customAtb.innerHTML = "ADDING...";
        // customAtb.disabled = true;

        // const addToCartStatus = (event) => {
        // 	const detail = Array.isArray(event.detail) ? event.detail[0] : event.detail;
        // 	document.removeEventListener("aws-add-to-cart-status", addToCartStatus);
        // 	if (detail?.error) {
        // 		customAtb.textContent = originalText;
        // 		customAtb.disabled = false;
        // 	} else {
        // 		customAtb.innerHTML = `<span class="btn-text-full">ADD TO BASKET</span><span class="btn-text-short">ADD</span>`;
        // 		customAtb.disabled = false;
        // 	}
        // };
        const originalHTML = customAtb.innerHTML;

        // Add loading state
        customAtb.classList.add("loading");
        customAtb.innerHTML = `<span class="btn-text-full">ADDING...</span><span class="btn-text-short">ADDING...</span><span class="btn-spinner"></span>`;
        customAtb.disabled = true;

        const addToCartStatus = (event) => {
          const detail = Array.isArray(event.detail)
            ? event.detail[0]
            : event.detail;
          document.removeEventListener(
            "aws-add-to-cart-status",
            addToCartStatus,
          );
          if (detail?.error) {
            customAtb.innerHTML = originalHTML;
            customAtb.classList.remove("loading");
            customAtb.disabled = false;
          } else {
            customAtb.innerHTML = originalHTML;
            customAtb.classList.remove("loading");
            customAtb.disabled = false;
            // Reset quantity to 1 and disable decrease button
            const input = quickAdd.querySelector("#custom-qty-input");
            const decreaseBtn = quickAdd.querySelector("#qty-decrease");
            if (input) {
              input.value = 1;
            }
            if (decreaseBtn) {
              decreaseBtn.disabled = true;
            }
          }
        };

        document.addEventListener("aws-add-to-cart-status", addToCartStatus);
        document.dispatchEvent(
          new CustomEvent("aws-add-to-cart", {
            bubbles: true,
            detail: [
              {
                itemCode: itemCode,
                quantity: quantityToAdd,
              },
            ],
          }),
        );

        adobeDataLayer.push({
          event: "targetClickEvent",
          eventData: {
            click: {
              clickLocation: "Conversio CRO",
              clickAction: "LT146 | Event Tracking",
              clickText: "LT146 (Variation 1) | ATB on PLP",
            },
          },
        });
      }

      //  EVENTS
      if (e.target.closest(".ais-Hits-item .rating")) {
        //console.log("Clicks on reviews on product cards");
        adobeDataLayer.push({
          event: "targetClickEvent",
          eventData: {
            click: {
              clickLocation: "Conversio CRO",
              clickAction: "LT146 | Event Tracking",
              clickText:
                "LT146 (Variation 1) | Clicks on reviews on product cards",
            },
          },
        });
      }

      if (e.target.closest(".ais-Hits-item .titleDescSale a")) {
        //	console.log("Product click-through on PLP");
        adobeDataLayer.push({
          event: "targetClickEvent",
          eventData: {
            click: {
              clickLocation: "Conversio CRO",
              clickAction: "LT146 | Event Tracking",
              clickText: "LT146 (Variation 1) | Product click-through on PLP",
            },
          },
        });
      }
    });

    // Validate input value when user finishes editing
    main.addEventListener("change", (e) => {
      if (e.target.id === "custom-qty-input") {
        let value = parseInt(e.target.value);
        if (value > 99) {
          e.target.value = 99;
        } else if (value < 1 || isNaN(value)) {
          e.target.value = 1;
        }
      }
    });

    main.classList.add("test-lt146");
  }
});
// </script>
