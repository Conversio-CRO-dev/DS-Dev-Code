console.log("==================================================>");
console.log("David Adam Silva | LT153 - LT151/stack product list");
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
    const observer = new MutationObserver(() => {
      let found = parentElement.querySelector(selector);
      if (found) {
        resolve(found);
        observer.disconnect();
      }
    });
    observer.observe(parentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function getProductId(url) {
  const lastSlashIndex = url.lastIndexOf("/");
  const firstQuestionIndex = url.indexOf("?");

  if (lastSlashIndex !== -1 && firstQuestionIndex !== -1) {
    return url.substring(lastSlashIndex + 1, firstQuestionIndex);
  }

  if (lastSlashIndex !== -1 && firstQuestionIndex === -1) {
    return url.substring(lastSlashIndex + 1);
  }

  return null;
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

// Add this function AFTER restructureAllProductItems() and BEFORE init()
function forceFixMobileWidths() {
  if (window.innerWidth <= 767) {
    const items = document.querySelectorAll(".ais-Hits-item");
    items.forEach((item) => {
      // Force reflow
      item.style.display = "flex";
      item.style.width = "100%";

      const wrapper = item.querySelector(".product-content-wrapper");
      if (wrapper) {
        wrapper.style.width = "auto";
        wrapper.style.maxWidth = "100%";
        wrapper.style.flex = "1 1 0";
      }

      const title = item.querySelector(".title a, .titleDescSale");
      if (title) {
        title.style.whiteSpace = "normal";
        title.style.wordWrap = "break-word";
      }
    });
  }
}

// Function to restructure all product items
function restructureAllProductItems() {
  // Select all product list items
  const productListItems = document.querySelectorAll(".ais-Hits-item");

  productListItems.forEach((item) => {
    restructureProductItem(item);
  });

  // Force fix mobile widths after restructuring
  forceFixMobileWidths();
}

async function addCustomQuickAdd() {
  let allAtbButtons = await allElementsReady(
    ".ais-Hits .ais-Hits-item .grid-addto-cart-container",
  );

  const promises = allAtbButtons.map(async (atb) => {
    let item = atb.closest(".ais-Hits-item");
    if (!item) return;

    let reserveStuff = item.querySelector(".reserve-text");

    const url = item.querySelector("[href]")?.getAttribute("href");
    if (!url) return;

    const productId = getProductId(url);
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

    item.dataset.productId = productId;
    item.dataset.itemCode = itemCode;

    if (item.querySelector("#custom-quick-add")) return;

    let customCont = document.createElement("div");
    customCont.classList.add("custom-container");
    customCont.innerHTML =
      '<div id="custom-quick-add" data-item-code="' +
      itemCode +
      '">' +
      '<div id="quantity-selector">' +
      '    <button disabled class="qty-btn" id="qty-decrease"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
      '  <path d="M0.64 11.2798C0.64 11.2798 0.586667 11.2931 0.48 11.3198C0.373333 11.3465 0.266667 11.4398 0.16 11.5998C0.0533333 11.7598 0 11.9065 0 12.0398C0 12.1731 0.0533333 12.3198 0.16 12.4798C0.266667 12.6398 0.386667 12.7331 0.52 12.7598C0.653333 12.7865 4.48 12.7998 12 12.7998C19.52 12.7998 23.3467 12.7865 23.48 12.7598C23.6133 12.7331 23.7333 12.6398 23.84 12.4798C23.9467 12.3198 24 12.1731 24 12.0398C24 11.9065 23.96 11.7731 23.88 11.6398C23.8 11.5065 23.72 11.4265 23.64 11.3998C23.56 11.3731 22.9333 11.3331 21.76 11.2798H0.64Z" fill="currentColor"/>' +
      "</svg></button>" +
      '    <input type="number" id="custom-qty-input" value="1" min="1" max="99">' +
      '    <button class="qty-btn" id="qty-increase"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
      '  <path d="M11.6 0.799786C11.4933 0.906452 11.4133 0.986452 11.36 1.03979L11.28 1.19979L11.2 11.1998L1.91997 11.2798C1.43997 11.2798 1.1733 11.3065 1.11997 11.3598C0.853304 11.4665 0.719971 11.6931 0.719971 12.0398C0.719971 12.3865 0.879971 12.6131 1.19997 12.7198C1.30664 12.7198 3.0133 12.7198 6.31997 12.7198H11.2L11.28 22.7998L11.36 22.9598C11.52 23.1731 11.7333 23.2798 12 23.2798C12.2666 23.2798 12.48 23.1731 12.64 22.9598L12.72 22.7998L12.8 12.7998L22.8 12.7198L22.96 12.6398C23.1733 12.4798 23.28 12.2531 23.28 11.9598C23.28 11.6665 23.1466 11.4665 22.88 11.3598C22.8266 11.3065 22.56 11.2798 22.08 11.2798L12.8 11.1998L12.72 1.91979C12.72 1.43979 12.6933 1.13312 12.64 0.999786C12.5866 0.866453 12.4533 0.773119 12.24 0.719786C12.0266 0.666452 11.8133 0.693119 11.6 0.799786Z" fill="currentColor"/>' +
      "</svg></button>" +
      "</div>" +
      '<button id="custom-atb">' +
      '    <span class="btn-text-full">ADD TO BASKET</span>' +
      '    <span class="btn-text-short">ADD</span>' +
      "</button></div>";

    if (!reserveStuff) {
      item.appendChild(customCont);
      // Restructure after adding custom container
      restructureProductItem(item);
    } else {
      item.classList.add("reserve-item");
      // Restructure reserve items too
      restructureProductItem(item);
    }
  });

  await Promise.all(promises);
}

addCustomQuickAdd();

let latestHits = [];

const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  this._url = url;
  return originalXHROpen.apply(this, [method, url, ...rest]);
};

XMLHttpRequest.prototype.send = function (...args) {
  this.addEventListener("load", function () {
    if (this._url?.includes("algolia.net") && this._url?.includes("queries")) {
      try {
        const data = JSON.parse(this.responseText);
        const hits = data?.results?.[0]?.hits;
        if (hits?.length) {
          latestHits = hits;
        }
      } catch (e) {}
    }
  });
  return originalXHRSend.apply(this, args);
};

async function getNextData() {
  const nextDataScript = await elementReady("#__NEXT_DATA__");
  if (nextDataScript) {
    const nextData = JSON.parse(nextDataScript.textContent);
    const productData =
      nextData.props?.pageProps?.serverState?.initialResults
        ?.PROD_UKLAIT_PRODUCTS_EN_PRIMARY;
    if (productData) {
      latestHits = productData.results[0].hits;
    }
  }
}

async function analyzeLaithwaitesPricing() {
  const productsJSON = latestHits;

  if (!Array.isArray(productsJSON) || !productsJSON.length) {
    return;
  }

  function getUrlProductId(href) {
    try {
      const url = new URL(href, window.location.origin);
      const parts = url.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || null;
    } catch (e) {
      return null;
    }
  }

  const allLinks = await allElementsReady(
    '.ais-Hits-list .ais-Hits-item .title a[href*="/product/"]',
  );
  let promoBannerLoggedThisPageView = false;
  let mixMaxShownLoggedThisPageView = false;

  const productsByProductId = new Map();

  allLinks.forEach((link) => {
    const productId = getUrlProductId(link.href);
    if (productId && !productsByProductId.has(productId)) {
      productsByProductId.set(productId, link);
    }
  });

  productsByProductId.forEach(async (linkElement, productId) => {
    const itemCont = linkElement.closest(".ais-Hits-item");
    if (!itemCont) return;

    const resolvedItemCode =
      itemCont
        .querySelector("#custom-quick-add")
        ?.getAttribute("data-item-code") ||
      itemCont.dataset.itemCode ||
      "";

    const jsonProduct = productsJSON.find((p) => {
      return (
        (resolvedItemCode && String(p.itemCode) === String(resolvedItemCode)) ||
        String(p.itemCode) === String(productId) ||
        String(p.productId) === String(productId) ||
        String(p.objectID) === String(productId) ||
        String(p.productCode) === String(productId) ||
        String(p.id) === String(productId)
      );
    });

    if (!jsonProduct) {
      console.log("LT151 no jsonProduct match", {
        productId,
        resolvedItemCode,
      });
      return;
    }

    let prodInfoObj = jsonProduct;
    let pricingEl = itemCont.querySelector(".addToCart-container");
    let customCont = await nestedElementReady(itemCont, ".custom-container");
    let sku = prodInfoObj?.skus?.[0];

    if (!customCont || !pricingEl || !sku) {
      return;
    }

    let subType = prodInfoObj.productWebType;
    if (subType) {
      itemCont.setAttribute("sub-type", subType);
    }

    if (subType && subType === "Beer") {
      return;
    }

    let porductType = prodInfoObj.productType;
    if (porductType) {
      itemCont.setAttribute("product-type", porductType);
    }

    const offers = Array.isArray(prodInfoObj.offers) ? prodInfoObj.offers : [];
    const bottleCount = Number(sku?.numberOfBottles);
    const hasBottleCount = Number.isFinite(bottleCount) && bottleCount > 0;

    const priceText = hasBottleCount
      ? bottleCount === 1
        ? "per bottle"
        : "per " + bottleCount + " bottle case"
      : "per bottle";

    if (offers.length === 0) {
      let noOfferPrice = document.createElement("div");
      noOfferPrice.classList.add("no-offer-pricing");

      noOfferPrice.innerHTML =
        '<div class="price-clean">£' +
        Number(sku.salePrice).toFixed(2) +
        "</div>" +
        '<div class="per-bottle-text"> /' +
        priceText +
        "</div>";

      if (!customCont.querySelector(".no-offer-pricing")) {
        customCont.prepend(noOfferPrice);
        pricingEl.style.display = "none";
      }
    } else if (
      Number(sku.buyersRRP) > Number(sku.salePrice) &&
      !prodInfoObj.promotionalData
    ) {
      let savingsDiff = Number(sku.buyersRRP) - Number(sku.salePrice);

      let offerPricing = document.createElement("div");
      offerPricing.classList.add("offer-pricing");

      offerPricing.innerHTML =
        '<div class="full-price-crossed">£' +
        Number(sku.buyersRRP).toFixed(2) +
        "</div>" +
        '<div class="price-breakdown">' +
        '<div class="offer-price">' +
        '<div class="price-clean">£' +
        Number(sku.salePrice).toFixed(2) +
        "</div>" +
        '<div class="per-bottle-text">/' +
        priceText +
        "</div>" +
        "</div>" +
        '<div class="savings-balance">' +
        '<div class="savings-text">Save £</div>' +
        '<div class="savings-amount">' +
        savingsDiff.toFixed(2) +
        "</div>" +
        "</div>" +
        "</div>";

      if (!customCont.querySelector(".offer-pricing")) {
        customCont.prepend(offerPricing);
        pricingEl.style.display = "none";
      }
    } else if (
      prodInfoObj.promotionalData &&
      prodInfoObj.promotionalData[0] &&
      prodInfoObj.promotionalData[0].tierUIRules &&
      prodInfoObj.promotionalData[0].tierUIRules[0]
    ) {
      let tierRule = prodInfoObj.promotionalData[0].tierUIRules[0];
      let tieredDisc = Number(tierRule.quantity);
      let promoPrice = Number(tierRule.amount);
      let savingsDiff = Number(sku.buyersRRP) - Number(sku.salePrice);

      let offerPricing = document.createElement("div");
      offerPricing.classList.add("offer-pricing");

      offerPricing.innerHTML =
        '<div class="full-price-crossed">£' +
        Number(sku.buyersRRP).toFixed(2) +
        "</div>" +
        '<div class="price-breakdown">' +
        '<div class="offer-price">' +
        '<div class="price-clean">£' +
        Number(sku.salePrice).toFixed(2) +
        "</div>" +
        '<div class="per-bottle-text">/' +
        priceText +
        "</div>" +
        "</div>" +
        '<div class="savings-balance">' +
        '<div class="savings-text">Save £</div>' +
        '<div class="savings-amount">' +
        savingsDiff.toFixed(2) +
        "</div>" +
        "</div>" +
        "</div>";

      if (!customCont.querySelector(".offer-pricing")) {
        customCont.prepend(offerPricing);
        pricingEl.style.display = "none";
      }

      if (promoPrice && tieredDisc > 1) {
        let promoTextToBuy =
          hasBottleCount && bottleCount > 1 ? "cases" : "bottles";

        const nativeSavingsEl = itemCont.querySelector(
          ".maxSavingsContainer .saving",
        );
        const cleanSavingsText = (nativeSavingsEl?.textContent || "")
          .replace(/save\s*£?/i, "")
          .replace(/[^\d.]/g, "");

        let promoPricing = document.createElement("div");
        promoPricing.classList.add("promo-pricing");
        promoPricing.innerHTML =
          '<div class="price-breakdown">' +
          '<div class="offer-price">' +
          '<div class="price-clean">£' +
          promoPrice.toFixed(2) +
          "</div>" +
          '<div class="per-bottle-text">/' +
          priceText +
          "</div>" +
          "</div>" +
          (cleanSavingsText
            ? '<div class="savings-balance">' +
              '<div class="savings-text">Save £</div>' +
              '<div class="savings-amount">' +
              cleanSavingsText +
              "</div>" +
              "</div>"
            : "") +
          "</div>" +
          '<div class="promo-rule"><span>When you buy ' +
          tieredDisc +
          " " +
          promoTextToBuy +
          "</span></div>";

        if (!customCont.querySelector(".promo-pricing")) {
          customCont.prepend(promoPricing);
          pricingEl.style.display = "none";

          const newPromoRule = promoPricing.querySelector(".promo-rule");

          const existingBadge =
            itemCont.querySelector(
              ".lowestPricePossibleOnOffer .offer-price-badge",
            ) || itemCont.querySelector(".offer-price-badge");

          if (
            existingBadge &&
            newPromoRule &&
            !newPromoRule.querySelector(".offer-price-badge")
          ) {
            newPromoRule.classList.add("promo-popup");
            newPromoRule.appendChild(existingBadge);
          }

          if (!promoBannerLoggedThisPageView) {
            promoBannerLoggedThisPageView = true;
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT151 | Event Tracking",
                  clickText: "LT151 (Variation 1) | Purple Banner shown",
                },
              },
            });
          }
        }
      }
    } else {
      const hasExistingCustomPricing = customCont.querySelector(
        ".offer-pricing, .promo-pricing, .no-offer-pricing",
      );

      const nativeBottleVppTextEl = itemCont.querySelector(
        '.lowestPricePossibleOnOffer[data-testid="product-have-vpp-threshold"]',
      );
      const nativeSavingsEl = itemCont.querySelector(
        ".maxSavingsContainer .saving",
      );
      const hasDiscount = Number(sku.buyersRRP) > Number(sku.salePrice);

      // Only for bottle VPP cards like "when you mix 12+"
      if (
        !hasExistingCustomPricing &&
        nativeBottleVppTextEl &&
        porductType !== "Case"
      ) {
        const promoRuleText = "Mix & Match with 12 or more other bottles";

        const promoPrice = Number(sku.salePrice);
        const cleanSavingsText = (nativeSavingsEl?.textContent || "")
          .replace(/save\s*£?/i, "")
          .replace(/[^\d.]/g, "");

        let promoPricing = document.createElement("div");
        promoPricing.classList.add("promo-pricing");
        promoPricing.innerHTML =
          '<div class="price-breakdown">' +
          '<div class="offer-price">' +
          '<div class="price-clean">£' +
          promoPrice.toFixed(2) +
          "</div>" +
          '<div class="per-bottle-text">/' +
          priceText +
          "</div>" +
          "</div>" +
          (cleanSavingsText
            ? '<div class="savings-balance">' +
              '<div class="savings-text">Save £</div>' +
              '<div class="savings-amount">' +
              cleanSavingsText +
              "</div>" +
              "</div>"
            : "") +
          "</div>" +
          '<div class="promo-rule"><span>' +
          promoRuleText +
          "</span></div>";

        customCont.prepend(promoPricing);
        pricingEl.style.display = "none";

        if (!mixMaxShownLoggedThisPageView) {
          mixMaxShownLoggedThisPageView = true;
          adobeDataLayer.push({
            event: "targetClickEvent",
            eventData: {
              click: {
                clickLocation: "Conversio CRO",
                clickAction: "LT151 | Event Tracking",
                clickText:
                  "LT151 (Variation 1) | User shown Mix & Max product card",
              },
            },
          });
        }

        const newPromoRule = promoPricing.querySelector(".promo-rule");

        const existingBadge =
          itemCont.querySelector(
            '.lowestPricePossibleOnOffer[data-testid="product-have-vpp-threshold"] .offer-price-badge',
          ) || null;

        if (
          existingBadge &&
          newPromoRule &&
          !newPromoRule.querySelector(".offer-price-badge")
        ) {
          newPromoRule.classList.add("promo-popup");
          newPromoRule.appendChild(existingBadge);
        }

        if (newPromoRule && newPromoRule.textContent.includes("Mix & Match")) {
          newPromoRule.classList.add("mix-match");
        }

        return;
      }

      if (!hasExistingCustomPricing && hasDiscount) {
        let savingsDiff = Number(sku.buyersRRP) - Number(sku.salePrice);

        let offerPricing = document.createElement("div");
        offerPricing.classList.add("offer-pricing");

        offerPricing.innerHTML =
          '<div class="full-price-crossed">£' +
          Number(sku.buyersRRP).toFixed(2) +
          "</div>" +
          '<div class="price-breakdown">' +
          '<div class="offer-price">' +
          '<div class="price-clean">£' +
          Number(sku.salePrice).toFixed(2) +
          "</div>" +
          '<div class="per-bottle-text">/' +
          priceText +
          "</div>" +
          "</div>" +
          '<div class="savings-balance">' +
          '<div class="savings-text">Save £</div>' +
          '<div class="savings-amount">' +
          savingsDiff.toFixed(2) +
          "</div>" +
          "</div>" +
          "</div>";

        customCont.prepend(offerPricing);
        pricingEl.style.display = "none";
      }
    }
  });
}

async function init() {
  await getNextData();

  const waitForFullHits = setInterval(() => {
    if (
      Array.isArray(latestHits) &&
      latestHits.length &&
      latestHits[0].skus &&
      latestHits[0].skus.length
    ) {
      clearInterval(waitForFullHits);
      analyzeLaithwaitesPricing();
      // Restructure products after initial load
      setTimeout(() => {
        restructureAllProductItems();
      }, 100);
    }
  }, 100);
}

init();

async function getPricingPanels() {
  let allAtbButtons = await allElementsReady(
    '.ais-Hits-item [aria-haspopup="dialog"]',
  );

  for (const atbButton of allAtbButtons) {
    let atbCont = atbButton.closest(".grid-addto-cart-container");
    let itemCont = atbButton.closest(".ais-Hits-item");

    if (!itemCont) continue;
    if (itemCont.querySelector(".reserve-text")) continue;

    if (itemCont.dataset.lt151PricingProcessing === "true") continue;
    if (itemCont.dataset.lt151PricingProcessed === "true") continue;
    if (itemCont.querySelector(".promo-rule .offer-price-badge")) {
      itemCont.dataset.lt151PricingProcessed = "true";
      continue;
    }

    itemCont.dataset.lt151PricingProcessing = "true";

    try {
      atbButton.click();

      let popup = await nestedElementReady(
        atbCont,
        ".mantine-Popover-dropdown",
      );
      if (!popup) continue;

      if (itemCont.querySelector(".promo-rule .offer-price-badge")) {
        itemCont.dataset.lt151PricingProcessed = "true";
        continue;
      }

      let clonedPopup = popup.cloneNode(true);
      itemCont.click();

      let tieredDiscounts = clonedPopup.querySelector(
        ".tiered-price-container",
      );
      let bulkDeal = clonedPopup.querySelector(".bulk-add-to-cart");
      let caseDeals = clonedPopup.querySelector(".case-details");
      let addOns = clonedPopup.querySelector(".add-on-container");
      let doubleCaseDeal = clonedPopup.querySelectorAll(".top-price-section");
      let caseSku = clonedPopup.querySelector(".case-sku");
      let vppBtn = clonedPopup.querySelector(".vpp-btn");

      if (
        tieredDiscounts ||
        bulkDeal ||
        caseDeals ||
        addOns ||
        vppBtn ||
        (caseSku && doubleCaseDeal.length > 1)
      ) {
        let dealIcon = document.createElement("div");
        dealIcon.classList.add("offer-price-badge");
        dealIcon.innerHTML =
          '<div class="badge-price"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">' +
          '  <g clip-path="url(#clip0_159_17216)">' +
          '    <path d="M9.46741 1.10107C11.0278 1.01553 12.4915 1.30449 13.8737 1.96924C14.6114 2.32407 15.2704 2.76233 15.899 3.31689C16.1255 3.5167 16.5577 3.95158 16.7448 4.16748C17.6896 5.25833 18.3743 6.60976 18.692 8.00928C19.0516 9.59337 18.9645 11.3607 18.4635 12.8062C17.9819 14.1956 17.3417 15.2388 16.3639 16.2368C15.1579 17.4677 13.6611 18.3082 11.9967 18.6909C10.7262 18.983 9.30459 18.9866 8.04065 18.7007C6.57937 18.3701 5.23079 17.6795 4.1012 16.6831C2.97509 15.6897 2.12926 14.4474 1.61487 13.0298C1.30545 12.177 1.14721 11.3829 1.09729 10.4194C0.978214 8.1192 1.77405 5.85022 3.31702 4.10107C4.88881 2.31934 7.12598 1.22947 9.46741 1.10107ZM9.95667 1.34326C9.73965 1.34468 9.46242 1.35316 9.33752 1.36377C8.00305 1.47709 6.81443 1.84492 5.66174 2.50244C4.54641 3.13881 3.49363 4.13567 2.76526 5.23975C1.44569 7.24015 1.01712 9.71274 1.58459 12.0483C1.9083 13.3806 2.54275 14.6121 3.43811 15.6479C4.3864 16.745 5.54912 17.5635 6.90002 18.0854C8.8822 18.8513 11.1181 18.8513 13.1002 18.0854C14.057 17.7158 14.891 17.2181 15.649 16.561C16.7514 15.6054 17.5631 14.4522 18.0856 13.1001C18.8512 11.1185 18.8512 8.8815 18.0856 6.8999C17.5631 5.54778 16.7514 4.39457 15.649 3.43896C14.0725 2.07232 12.0523 1.32959 9.95667 1.34326ZM9.11877 8.70068C9.35383 8.70028 9.47018 8.70576 9.54749 8.71729C9.60583 8.72598 9.64485 8.73841 9.71936 8.77393C9.87992 8.85046 10.0242 9.00397 10.0934 9.18115L10.11 9.2251L10.1198 10.8032C10.1252 11.7191 10.1259 12.186 10.1461 12.4341C10.1561 12.5562 10.1748 12.7001 10.2448 12.8345C10.2824 12.9068 10.3252 12.9592 10.359 12.9956C10.3738 13.0115 10.388 13.0257 10.3961 13.0337C10.4058 13.0433 10.4114 13.0488 10.4166 13.0542C10.5037 13.1444 10.6294 13.2716 10.858 13.3306C11.0151 13.3711 11.2168 13.3746 11.4371 13.3804C11.6557 13.3861 11.7403 13.3899 11.7858 13.395H11.7877C11.7889 13.3956 11.7902 13.3963 11.7916 13.397C11.8446 13.4213 11.8602 13.4411 11.8629 13.4448C11.8645 13.4471 11.8738 13.4606 11.8766 13.5034C11.8786 13.5346 11.8775 13.5507 11.8766 13.5571C11.8741 13.5611 11.8667 13.5714 11.8512 13.5884C11.8496 13.5901 11.8452 13.595 11.8375 13.6021C11.8298 13.6092 11.8211 13.6173 11.8121 13.6245L11.8102 13.6255C11.7497 13.6284 11.6387 13.6304 11.4 13.6304C11.1465 13.6304 11.0303 13.6293 10.9586 13.6245C10.9117 13.6214 10.8988 13.6176 10.8483 13.603C10.4065 13.476 10.0774 13.1625 9.92834 12.7202L9.89026 12.6079L9.8844 11.0728L9.87854 9.4585L9.87659 8.96045H9.09045C8.92426 8.96045 8.84481 8.95361 8.80042 8.9458C8.78227 8.9426 8.7751 8.94035 8.77405 8.93994C8.77297 8.93952 8.76903 8.9376 8.76038 8.93213C8.67641 8.87859 8.68534 8.74603 8.7887 8.70947C8.79236 8.70887 8.80201 8.70795 8.82092 8.70654C8.87264 8.70272 8.95732 8.70096 9.11877 8.70068ZM9.72913 5.78467C9.77891 5.78589 9.80712 5.78723 9.82678 5.78857C9.84448 5.7898 9.84456 5.79033 9.83655 5.78857C9.81729 5.78432 9.80795 5.77664 9.88147 5.81299C9.96996 5.85685 10.0519 5.9413 10.0934 6.02881C10.1003 6.04348 10.1049 6.05398 10.108 6.06104C10.1082 6.06379 10.1089 6.06715 10.109 6.0708C10.1099 6.09682 10.11 6.13252 10.11 6.19092C10.11 6.25303 10.1089 6.28901 10.108 6.31494C10.1037 6.32388 10.0988 6.33821 10.0885 6.35889C9.99243 6.55185 9.83368 6.63113 9.63831 6.604C9.47714 6.58148 9.32258 6.43736 9.29163 6.25342C9.25994 6.06413 9.38228 5.8561 9.57678 5.7915C9.58382 5.78917 9.58792 5.78782 9.60022 5.78662L9.72913 5.78467Z" fill="#1B0C5E" stroke="#1B0C5E"/>' +
          "  </g>" +
          "  <defs>" +
          '    <clipPath id="clip0_159_17216">' +
          '      <rect width="20" height="20" fill="white"/>' +
          "    </clipPath>" +
          "  </defs>" +
          "</svg></div>";

        let pricingCont = itemCont.querySelector(
          '[data-testid="pricing-and-purchase-panel-wrapper"] div',
        );
        pricingCont?.classList.add("custom-pricing-cont");

        let dealTextEl =
          itemCont.querySelector(".promo-rule") ||
          itemCont.querySelector(".offer-pricing") ||
          itemCont.querySelector(".no-offer-pricing") ||
          itemCont.querySelector(
            '.lowestPricePossibleOnOffer[data-testid="product-have-vpp-threshold"]',
          ) ||
          itemCont.querySelector(".lowestPricePossibleOnOffer") ||
          itemCont.querySelector(".maxSavingsContainer") ||
          itemCont.querySelector(
            '[data-testid="pricing-and-purchase-panel-wrapper"]',
          ) ||
          itemCont.querySelector(".custom-container");

        if (!dealTextEl) continue;

        if (
          dealTextEl.classList.contains("promo-rule") &&
          !dealTextEl.querySelector(".offer-price-badge")
        ) {
          let dealText = dealTextEl.textContent;
          let newDealText = document.createElement("span");
          newDealText.innerHTML = dealText;
          dealTextEl.innerHTML = "";
          dealTextEl.appendChild(newDealText);
          dealTextEl.classList.add("promo-popup");
          dealTextEl.appendChild(dealIcon);
        }

        let fullPriceStriked = clonedPopup.querySelector(
          '.straight-sku-wrapper [data-testid="strike-price"], .case-sku-wrapper [data-testid="strike-price"]',
        );
        let priceSection = clonedPopup.querySelector(
          '.straight-sku-wrapper [data-testid="price-section"], .case-sku-wrapper [data-testid="price-section"]',
        );

        if (
          priceSection &&
          fullPriceStriked &&
          !priceSection.contains(fullPriceStriked)
        ) {
          priceSection.prepend(fullPriceStriked);
        }

        let addOnContainer = clonedPopup.querySelector(
          '[data-testid="add-on-container"]',
        );
        if (addOnContainer) {
          addOnContainer.innerHTML = addOnContainer.innerHTML.replace(
            /(\(£[\d.]+(?:\s*a bottle)\))/,
            '<span class="highlight-price">$1</span>',
          );
        }

        let dealStuff = clonedPopup.querySelector(".top-price-section");
        let orSection = clonedPopup.querySelector(".separation-line");
        if (orSection && orSection.parentElement)
          orSection.parentElement.classList.add("hide-section");

        if (dealStuff) {
          let customDealPopup = document.createElement("div");
          customDealPopup.classList.add("deal-popup-container");
          customDealPopup.innerHTML =
            '<div class="deal-popup-arrow"></div>' + dealStuff.outerHTML;

          let existingBadge = itemCont.querySelector(".offer-price-badge");
          let badgeHost =
            existingBadge ||
            itemCont.querySelector(".promo-rule") ||
            itemCont.querySelector(".offer-pricing") ||
            itemCont.querySelector(".no-offer-pricing") ||
            itemCont.querySelector(
              '.lowestPricePossibleOnOffer[data-testid="product-have-vpp-threshold"]',
            ) ||
            itemCont.querySelector(".lowestPricePossibleOnOffer") ||
            itemCont.querySelector(".maxSavingsContainer") ||
            itemCont.querySelector(
              '[data-testid="pricing-and-purchase-panel-wrapper"]',
            ) ||
            itemCont.querySelector(".custom-container");

          if (badgeHost) {
            if (existingBadge) {
              if (!existingBadge.querySelector(".deal-popup-container")) {
                existingBadge.prepend(customDealPopup);
              }
            } else {
              let standaloneBadge = document.createElement("div");
              standaloneBadge.classList.add("offer-price-badge");
              standaloneBadge.innerHTML = dealIcon.innerHTML;
              standaloneBadge.prepend(customDealPopup);
              badgeHost.appendChild(standaloneBadge);
            }
          }
        }
      }

      itemCont.dataset.lt151PricingProcessed = "true";
    } catch (err) {
      console.error("getPricingPanels failed", err);
    } finally {
      delete itemCont.dataset.lt151PricingProcessing;
    }
  }
}

getPricingPanels();

let currentOpenPopup = null;

function positionDealPopup(badge) {
  const popup = badge.querySelector(".deal-popup-container");
  const arrow = badge.querySelector(".deal-popup-arrow");

  if (!popup || !arrow) return;

  const badgeRect = badge.getBoundingClientRect();
  const popupWidth = popup.offsetWidth || 350;
  const viewportWidth = window.innerWidth;
  const badgeCenterX = badgeRect.left + badgeRect.width / 2;

  const isMobile = viewportWidth <= 767;
  const isTablet = viewportWidth >= 768 && viewportWidth <= 1024;

  const prodCard = badge.closest(".ais-Hits-item");
  const width = prodCard.getBoundingClientRect().width;
  popup.style.width = width + 5 + "px";
  popup.style.maxWidth = width + 5 + "px";

  if (isMobile) {
    const margin = 16;
    popup.style.left = margin - badgeRect.left - 3 + "px";
    popup.style.transform = "none";
    popup.style.bottom = "37px";

    const arrowPosition = badgeCenterX - margin - 14;
    arrow.style.left = arrowPosition + "px";
    arrow.style.marginLeft = "0";
  } else if (isTablet) {
    const margin = 16;
    popup.style.left = margin - badgeRect.left / 2 + "px";
    popup.style.transform = "none";
    popup.style.bottom = "37px";

    const arrowPosition = badgeCenterX / 2 - margin - 14;
    arrow.style.left = arrowPosition + "px";
    arrow.style.marginLeft = "0";
  } else {
    const margin = 20;
    const idealPopupLeft = badgeCenterX - popupWidth / 2;

    const needsLeftAdjustment = idealPopupLeft < margin;
    const needsRightAdjustment =
      idealPopupLeft + popupWidth > viewportWidth - margin;

    if (!needsLeftAdjustment && !needsRightAdjustment) {
      popup.style.left = "50%";
      popup.style.transform = "translateX(-50%)";
      arrow.style.left = "50%";
      arrow.style.marginLeft = "-1.125rem";
    } else {
      let popupLeft = idealPopupLeft;

      if (needsLeftAdjustment) {
        popupLeft = margin;
      } else if (needsRightAdjustment) {
        popupLeft = viewportWidth - margin - popupWidth;
      }

      const offsetFromBadge = popupLeft - badgeRect.left;
      popup.style.left = offsetFromBadge + "px";
      popup.style.transform = "none";

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

    adobeDataLayer.push({
      event: "targetClickEvent",
      eventData: {
        click: {
          clickLocation: "Conversio CRO",
          clickAction: "LT151 | Event Tracking",
          clickText: "LT151 (Variation 1) | Opens tooltip",
        },
      },
    });
  }
}

function closePopup(badge) {
  if (badge) {
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

function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

if (!isTouchDevice()) {
  const trackedBadges = new Set();

  document.addEventListener(
    "mouseenter",
    (e) => {
      if (!e.target.closest) return;
      const badge = e.target.closest(".offer-price-badge");
      if (badge && badge.querySelector(".deal-popup-container")) {
        positionDealPopup(badge);

        if (!trackedBadges.has(badge)) {
          trackedBadges.add(badge);
          adobeDataLayer.push({
            event: "targetClickEvent",
            eventData: {
              click: {
                clickLocation: "Conversio CRO",
                clickAction: "LT151 | Event Tracking",
                clickText: "LT151 (Variation 1) | Opens tooltip",
              },
            },
          });
        }
      }
    },
    true,
  );

  document.addEventListener(
    "mouseleave",
    (e) => {
      if (!e.target.closest) return;
      const badge = e.target.closest(".offer-price-badge");
      if (badge && trackedBadges.has(badge)) {
        const relatedTarget = e.relatedTarget;
        if (!badge.contains(relatedTarget)) {
          trackedBadges.delete(badge);
        }
      }
    },
    true,
  );
}

document.addEventListener("click", (e) => {
  if (isTouchDevice()) {
    if (!e.target.closest) return;
    const badge = e.target.closest(".offer-price-badge");

    if (badge && badge.querySelector(".deal-popup-container")) {
      e.preventDefault();
      e.stopPropagation();

      if (badge.classList.contains("popup-active")) {
        closePopup(badge);
      } else {
        showPopup(badge);
      }
    } else {
      closeAllPopups();
    }
  }
});

if (isTouchDevice()) {
  let scrollStartY = 0;

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

window.addEventListener("resize", () => {
  if (currentOpenPopup) {
    positionDealPopup(currentOpenPopup);
  }
});

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (window.innerWidth <= 767) {
      forceFixMobileWidths();
    }
  }, 150);
});

function observeProductGrid() {
  const observer = new MutationObserver((mutations) => {
    let hasProductChanges = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
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
      setTimeout(async () => {
        console.log("adding new content");
        await addCustomQuickAdd();
        await analyzeLaithwaitesPricing();
        await getPricingPanels();
        // Restructure any new products
        restructureAllProductItems();
      }, 1000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Add this after the observeProductGrid function
function observeMobileWidthChanges() {
  const observer = new MutationObserver(() => {
    forceFixMobileWidths();
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["style", "class"],
  });
}

// Call this after your existing observer
setTimeout(observeMobileWidthChanges, 1000);

setTimeout(observeProductGrid, 1000);

elementReady("body").then((main) => {
  if (!main.classList.contains("test-lt146")) {
    main.addEventListener("click", async (e) => {
      if (e.target.closest(".ais-Hits-item a")) {
        adobeDataLayer.push({
          event: "targetClickEvent",
          eventData: {
            click: {
              clickLocation: "Conversio CRO",
              clickAction: "LT151 | Event Tracking",
              clickText: "LT151 (Variation 1) | Product click-through on PLP",
            },
          },
        });
      }

      if (e.target.closest("#qty-increase")) {
        const item = e.target.closest("#custom-quick-add");
        const input = item?.querySelector("#custom-qty-input");

        if (input) {
          const newValue = parseInt(input.value, 10) + 1;
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
              clickAction: "LT151 | Event Tracking",
              clickText: "LT151 (Variation 1) | Uses increase quantity button",
            },
          },
        });
      }

      if (e.target.closest("#qty-decrease")) {
        const item = e.target.closest("#custom-quick-add");
        const input = item?.querySelector("#custom-qty-input");

        if (input) {
          const newValue = parseInt(input.value, 10) - 1;
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
              clickAction: "LT151 | Event Tracking",
              clickText: "LT151 (Variation 1) | Uses decrease quantity button",
            },
          },
        });
      }

      if (e.target.closest("#custom-atb")) {
        const quickAdd = e.target.closest("#custom-quick-add");
        const itemCode = quickAdd.getAttribute("data-item-code");
        const quantityToAdd = parseInt(
          quickAdd.querySelector("#custom-qty-input").value,
          10,
        );

        let customAtb = e.target.closest("#custom-atb");
        const originalHTML = customAtb.innerHTML;

        const itemCard = e.target.closest(".ais-Hits-item");
        const hasPromoPricing = !!itemCard?.querySelector(".promo-pricing");

        const prodType = itemCard?.getAttribute("product-type") || "";
        const subType = itemCard?.getAttribute("sub-type") || "";

        let eventName;
        let cartQuantity =
          document.querySelector(".cart-quantity")?.textContent;
        cartQuantity === "0"
          ? (eventName = "InitiateCart")
          : (eventName = "addToCart");

        customAtb.classList.add("loading");
        customAtb.innerHTML =
          '<span class="btn-text-full">ADDING...</span><span class="btn-text-short">ADDING...</span><span class="btn-spinner"></span>';
        customAtb.disabled = true;

        const addToCartStatus = (event) => {
          const detail = Array.isArray(event.detail)
            ? event.detail[0]
            : event.detail;
          document.removeEventListener(
            "aws-add-to-cart-status",
            addToCartStatus,
          );

          customAtb.innerHTML = originalHTML;
          customAtb.classList.remove("loading");
          customAtb.disabled = false;

          if (!detail?.error) {
            const input = quickAdd.querySelector("#custom-qty-input");
            const decreaseBtn = quickAdd.querySelector("#qty-decrease");
            if (input) input.value = 1;
            if (decreaseBtn) decreaseBtn.disabled = true;
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
              clickAction: "LT151 | Event Tracking",
              clickText: "LT151 (Variation 1) | ATB on main PLP",
            },
          },
        });

        try {
          const response = await fetch(
            "https://www.laithwaites.co.uk/api/product/item/" + itemCode,
          );
          if (!response.ok) throw new Error("Product fetch failed");

          const data = await response.json();
          const product = data.response || data;
          const sku = product?.skus?.[0];

          let clickActionText;
          eventName === "InitiateCart"
            ? (clickActionText = "add to empty cart")
            : (clickActionText = "add to cart");

          let clickNameText;
          eventName === "InitiateCart"
            ? (clickNameText = "add to empty cart")
            : (clickNameText = "add to cart");

          let clickDescriptionText;
          eventName === "InitiateCart"
            ? (clickDescriptionText = "search results:add to empty cart")
            : (clickDescriptionText = "search results:add to cart");

          const addToCartEvent = {
            event: eventName || "",
            eventData: {
              click: {
                clickAction: clickActionText || "",
                clickDescription: clickDescriptionText || "",
                clickLocation: "search results",
                clickName: clickNameText || "",
                clickText: "Add to Basket",
                errorMessage: "",
              },
              product: {
                0: {
                  accolades: "",
                  attributes: {
                    organic: "",
                    vegan: "",
                    vegetarian: "",
                  },
                  colour: product.colourName || "",
                  country: product.countryName || "",
                  discount: "",
                  enPrimeur: "",
                  favourited: "",
                  grape: product.grapeName || "",
                  isMixed: "",
                  largeImage: "",
                  name: product.name || "",
                  noBottles: "",
                  noReviews:
                    product.productRating?.productRating?.noReviews || "",
                  price: sku?.salePrice || sku?.listPrice || 0,
                  rating: product.productRating?.productRating?.avgRating || 0,
                  salesActivity: "",
                  sku: product.itemCode || sku?.itemCode || "",
                  smallImage: "",
                  stockAmount: "",
                  stockAvailability: "",
                  subType: subType || "",
                  thumbnailImage: "",
                  type: prodType || "",
                  units: "",
                  vintage: product.vintage || "",
                  vppApplier: "",
                  vppPrice: "",
                  vppQualifier: "",
                  webHeadline: "",
                  itemcode: product.itemCode || sku?.itemCode || "",
                  quantity: quantityToAdd,
                },
                quantity: quantityToAdd,
                itemcode: product.itemCode || sku?.itemCode || "",
                price: sku?.salePrice || sku?.listPrice || 0,
              },
            },
          };

          window.adobeDataLayer.push(addToCartEvent);

          if (hasPromoPricing) {
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT151 | Event Tracking",
                  clickText:
                    "LT151 (Variation 1) | ATB on main PLP on a product card with purple discount messaging",
                },
              },
            });
          }
        } catch (error) {
          console.error("addToCart event failed:", error);
        }
      }
    });

    main.addEventListener("change", (e) => {
      if (e.target.id === "custom-qty-input") {
        let value = parseInt(e.target.value, 10);
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

// Initial restructuring when page loads
setTimeout(() => {
  restructureAllProductItems();
}, 500);

// </script>
