function moveElementsOnMobileOnly() {
  // Check if it's mobile
  if (window.innerWidth <= 767) {
    console.log("LT153 - PLP Columns");

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

    async function addCustomQuickAdd() {
      let allAtbButtons = await allElementsReady(
        ".ais-Hits .ais-Hits-item .grid-addto-cart-container",
      );

      const promises = allAtbButtons.map(async (atb) => {
        let item = atb.closest(".ais-Hits-item");
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
          console.error(
            "Error fetching itemCode for " + productId + ":",
            error,
          );
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

      await Promise.all(promises);
    }
    addCustomQuickAdd();

    function cleanReviewNumbers() {
      const reviewCounts = document.querySelectorAll(".review-count");
      reviewCounts.forEach((reviewSpan) => {
        const numberOnly = reviewSpan.textContent.match(/\d+/);
        if (numberOnly) {
          reviewSpan.textContent = numberOnly[0];
        }
      });
    }
    cleanReviewNumbers();

    function formatPriceText() {
      document
        .querySelectorAll(".grid-view.law .ais-Hits-item .lowestPricepossible")
        .forEach((el) => {
          if (el.querySelector(".cv-price-amount")) return;
          el.innerHTML = el.textContent
            .replace(
              /(from\s+)(£[\d,.]+)(\s+per bottle)/i,
              '$1<span class="cv-price-amount">$2</span> /bottle ',
            )
            .replace(
              /(£[\d,.]+)(\s+per case)/i,
              '<span class="cv-price-amount">$1</span> /case ',
            );
        });
    }
    formatPriceText();

    function moveInfoIconBtn() {
      document
        .querySelectorAll(
          ".grid-view.law .ais-Hits-item .lowestPricePossibleOnOffer",
        )
        .forEach((offerEl) => {
          if (offerEl.dataset.cvIconMoved) return;
          const btn = offerEl.parentElement?.querySelector(
            ":scope > .plp-info-icon-btn",
          );
          const innerText = offerEl.querySelector(".plp-offer-info");
          if (btn && innerText) {
            innerText.appendChild(btn);
            offerEl.dataset.cvIconMoved = "1";
          }
        });
    }
    moveInfoIconBtn();

    function formatOfferText() {
      document
        .querySelectorAll(
          ".grid-view.law .ais-Hits-item .lowestPricePossibleOnOffer .plp-offer-info",
        )
        .forEach((el) => {
          if (el.dataset.cvFormatted) return;
          const textNodes = Array.from(el.childNodes).filter(
            (n) => n.nodeType === Node.TEXT_NODE,
          );
          if (!textNodes.length) return;
          const combined = textNodes.map((n) => n.textContent).join("");
          const replaced = combined.replace(
            /when you mix\s+(\d+)\+?/i,
            "when added to $1 other bottles",
          );
          textNodes[0].textContent = replaced;
          textNodes.slice(1).forEach((n) => n.remove());
          el.dataset.cvFormatted = "1";
        });
    }
    formatOfferText();

    function removeYearFromTitles() {
      document
        .querySelectorAll(".grid-view.law .ais-Hits-item .titleDescSale a")
        .forEach((link) => {
          link.childNodes.forEach((node) => {
            if (
              node.nodeType === Node.TEXT_NODE &&
              /^\s*\d{4}\s*$/.test(node.textContent)
            ) {
              node.remove();
            }
          });
        });
    }
    removeYearFromTitles();

    function moveStockPill() {
      document
        .querySelectorAll(".grid-view.law .ais-Hits-item .image-container")
        .forEach((container) => {
          const pill = container.querySelector(".offer .pill.stock");
          if (!pill || container.querySelector(":scope > .pill.stock")) return;
          container.appendChild(pill);
        });
    }
    moveStockPill();

    async function getPricingPanels() {
      let allAtbButtons = await allElementsReady(
        '.ais-Hits-item [aria-haspopup="dialog"]',
      );

      allAtbButtons.forEach(async (atbButton) => {
        let atbCont = atbButton.closest(".grid-addto-cart-container");
        let itemCont = atbButton.closest(".ais-Hits-item");

        // Guard: skip if expected containers are missing
        if (!atbCont || !itemCont) return;

        if (
          !itemCont.querySelector(".offer-price-badge") &&
          !itemCont.querySelector(".reserve-text")
        ) {
          window._cvProgrammaticClick = true;
          atbButton.click();
          window._cvProgrammaticClick = false;

          let popupAtbButton = await nestedElementReady(
            atbCont,
            ".mantine-Popover-dropdown .cart-button",
          );
          let popup = await nestedElementReady(
            atbCont,
            ".mantine-Popover-dropdown",
          );

          let clonedPopup = popup.cloneNode(true);
          if (!popup.classList.contains("cv-open")) {
            window._cvProgrammaticClick = true;
            itemCont.click();
            window._cvProgrammaticClick = false;
          }

          let tieredDiscounts = clonedPopup.querySelector(
            ".tiered-price-container",
          );
          let bulkDeal = clonedPopup.querySelector(".bulk-add-to-cart");
          let caseDeals = clonedPopup.querySelector(".case-details");
          let addOns = clonedPopup.querySelector(".add-on-container");
          let doubleCaseDeal =
            clonedPopup.querySelectorAll(".top-price-section");
          let caseSku = clonedPopup.querySelector(".case-sku");

          if (
            tieredDiscounts ||
            bulkDeal ||
            bulkDeal ||
            caseDeals ||
            addOns ||
            (caseSku && doubleCaseDeal.length > 1)
          ) {
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

            let dealStuff = clonedPopup.querySelector(".top-price-section");
            let orSection = clonedPopup.querySelector(".separation-line");
            if (orSection)
              orSection.parentElement.classList.add("hide-section");

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

    function moveAllElements() {
      const allSaveContainers = document.querySelectorAll(
        "div.maxSavingsContainer",
      );

      allSaveContainers.forEach((saveContainer) => {
        const currentParent = saveContainer.parentElement;
        const grandParent = currentParent?.parentElement;

        if (currentParent) {
          currentParent.id = "box-container";

          const clonedSave = saveContainer.cloneNode(true);
          saveContainer.remove();
          grandParent.appendChild(clonedSave);

          // Only move price-per-litre if it lives in this same container
          const priceElement = currentParent.querySelector(
            "span.price-per-litre",
          );
          if (priceElement) {
            const clonedPrice = priceElement.cloneNode(true);
            priceElement.remove();
            grandParent.appendChild(clonedPrice);
          }
        }
      });
    }

    // Wait for page to load then run
    setTimeout(moveAllElements, 1000);

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
              clickAction: "LT153 | Event Tracking",
              clickText: "LT153 (Variation 1) | Opens pricing popup",
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
                    clickAction: "LT153 | Event Tracking",
                    clickText: "LT153 (Variation 1) | Opens pricing popup",
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
          addCustomQuickAdd();
          getPricingPanels();
          cleanReviewNumbers();
          removeYearFromTitles();
          formatPriceText();
          moveInfoIconBtn();
          formatOfferText();
          moveStockPill();
        }
      });

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

      if (lastSlashIndex !== -1 && firstQuestionIndex === -1) {
        return url.substring(lastSlashIndex + 1);
      }

      return null;
    }

    elementReady("body").then((main) => {
      if (!main.classList.contains("test-lt153")) {
        main.addEventListener("click", (e) => {
          // 1. QUANTITY SELECTOR INCREASE
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
                  clickAction: "LT153 | Event Tracking",
                  clickText: "LT153 (Variation 1) | Quantity selector increase",
                },
              },
            });

            console.log("Increase Btn Click!");
          }

          // 2. QUANTITY SELECTOR DECREASE
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
                  clickAction: "LT153 | Event Tracking",
                  clickText: "LT153 (Variation 1) | Quantity selector decrease",
                },
              },
            });

            console.log("Decrease Btn Click!");
          }

          // 3. PLP ATB (Add to Basket)
          if (e.target.closest("#custom-atb")) {
            const quickAdd = e.target.closest("#custom-quick-add");
            const itemCode = quickAdd.getAttribute("data-item-code");
            const quantityToAdd = parseInt(
              quickAdd.querySelector("#custom-qty-input").value,
            );

            let customAtb = e.target.closest("#custom-atb");

            const originalHTML = customAtb.innerHTML;

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

            document.addEventListener(
              "aws-add-to-cart-status",
              addToCartStatus,
            );
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
                  clickAction: "LT153 | Event Tracking",
                  clickText: "LT153 (Variation 1) | PLP ATB",
                },
              },
            });

            console.log("PLP Btn click!");
          }

          // 4. PLP > PDP CLICK-THROUGH
          if (
            e.target.closest("div.image-bg") ||
            e.target.closest("div.titleDescSale a")
          ) {
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT153 | Event Tracking",
                  clickText: "LT153 (Variation 1) | PLP > PDP click-through",
                },
              },
            });

            console.log("PLP > PDP Click!");
          }

          // 5. OPENS TOOLIP
          const tooltipButton = e.target.closest(".plp-info-icon-btn");
          const tooltipIcon = e.target.closest("i.css-1i91q3o");
          const tooltipTrigger = tooltipButton || tooltipIcon;

          if (tooltipTrigger) {
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT153 | Event Tracking",
                  clickText: "LT153 (Variation 1) | Opens tooltip",
                },
              },
            });

            console.log("Tooltip Click!");
          }

          // 7. PAGINATION CLICK
          const prevBtn = e.target.closest(
            ".ais-Pagination-item--previousPage button",
          );
          const nextBtn = e.target.closest(
            ".ais-Pagination-item--nextPage button",
          );
          const pageLink = e.target.closest(
            '[data-testid^="pagination-link-"]',
          );

          if (prevBtn && !prevBtn.closest(".ais-Pagination-item--disabled")) {
            console.log("Pagination click - Previous page");
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT153 | Event Tracking",
                  clickText:
                    "LT153 (Variation 1) | Pagination click - Previous page",
                },
              },
            });
          } else if (nextBtn) {
            console.log("Pagination click - Next page");
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT153 | Event Tracking",
                  clickText:
                    "LT153 (Variation 1) | Pagination click - Next page",
                },
              },
            });
          } else if (pageLink) {
            const pageNumber = pageLink.textContent.trim();
            console.log("Pagination click - Page " + pageNumber);
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT153 | Event Tracking",
                  clickText:
                    "LT153 (Variation 1) | Pagination click - Page " +
                    pageNumber,
                },
              },
            });
          }
        });

        // 6. SCROLL DEPTH REACHED (25%, 50%, 75%)
        (function trackScrollDepth() {
          let trackingPoints = {
            25: false,
            50: false,
            75: false,
          };

          function getScrollPercentage() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop =
              window.scrollY || document.documentElement.scrollTop;

            const scrollableDistance = documentHeight - windowHeight;
            if (scrollableDistance <= 0) return 0;

            const scrolledPercentage = (scrollTop / scrollableDistance) * 100;
            const rounded = Math.min(100, Math.max(0, scrolledPercentage));

            return rounded;
          }

          function checkAndTrackScroll() {
            const percentage = getScrollPercentage();

            if (percentage >= 25 && !trackingPoints[25]) {
              trackingPoints[25] = true;
              if (typeof adobeDataLayer !== "undefined") {
                adobeDataLayer.push({
                  event: "targetClickEvent",
                  eventData: {
                    click: {
                      clickLocation: "Conversio CRO",
                      clickAction: "LT153 | Event Tracking",
                      clickText:
                        "LT153 (Variation 1) | Scroll depth reached 25%",
                    },
                  },
                });
              }
              console.log("EVENT PUSHED: Scroll depth 25%");
            }

            if (percentage >= 50 && !trackingPoints[50]) {
              trackingPoints[50] = true;
              if (typeof adobeDataLayer !== "undefined") {
                adobeDataLayer.push({
                  event: "targetClickEvent",
                  eventData: {
                    click: {
                      clickLocation: "Conversio CRO",
                      clickAction: "LT153 | Event Tracking",
                      clickText:
                        "LT153 (Variation 1) | Scroll depth reached 50%",
                    },
                  },
                });
              }
              console.log("EVENT PUSHED: Scroll depth 50%");
            }

            if (percentage >= 75 && !trackingPoints[75]) {
              trackingPoints[75] = true;
              if (typeof adobeDataLayer !== "undefined") {
                adobeDataLayer.push({
                  event: "targetClickEvent",
                  eventData: {
                    click: {
                      clickLocation: "Conversio CRO",
                      clickAction: "LT153 | Event Tracking",
                      clickText:
                        "LT153 (Variation 1) | Scroll depth reached 75%",
                    },
                  },
                });
              }
              console.log("EVENT PUSHED: Scroll depth 75%");
            }
          }

          // Throttle scroll event for performance
          let scrollTimeout;
          let scrollCount = 0;

          window.addEventListener(
            "scroll",
            function () {
              scrollCount++;
              if (scrollTimeout) clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                checkAndTrackScroll();
              }, 200);
            },
            {
              passive: true,
            },
          );

          // Initial check on load
          setTimeout(() => {
            checkAndTrackScroll();
          }, 1000);

          // Also check on window resize (important for responsive/mobile)
          let resizeTimeout;
          window.addEventListener("resize", function () {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
              checkAndTrackScroll();
            }, 500);
          });
        })();

        // INPUT CHANGE HANDLER (existing)
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

        main.classList.add("test-lt153");
      }
    });

    (function () {
      document.addEventListener(
        "click",
        (e) => {
          if (window._cvProgrammaticClick) return;

          const btn = e.target.closest(".plp-info-icon-btn");

          if (btn) {
            const alreadyOpen = document.querySelector(
              ".mantine-Popover-dropdown.cv-open",
            );
            if (alreadyOpen) {
              alreadyOpen.classList.remove("cv-open");
              e.stopPropagation();
              e.preventDefault();
              return;
            }

            // Case A: dropdown already in DOM — add cv-open and block Mantine from toggling it closed
            const inParent = btn.parentElement.querySelector(
              ".mantine-Popover-dropdown",
            );
            if (inParent) {
              inParent.classList.add("cv-open");
              e.stopPropagation();
              e.preventDefault();
              return;
            }

            // Case B: dropdown not in DOM yet — let Mantine open it, then tag it
            const obs = new MutationObserver((mutations, observer) => {
              for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                  if (node.nodeType !== 1) continue;
                  const dropdown = node.classList?.contains(
                    "mantine-Popover-dropdown",
                  )
                    ? node
                    : node.querySelector?.(".mantine-Popover-dropdown");
                  if (dropdown) {
                    observer.disconnect();
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        dropdown.classList.add("cv-open");
                      });
                    });
                    return;
                  }
                }
              }
            });
            obs.observe(document.body, {
              childList: true,
              subtree: true,
            });
            setTimeout(() => obs.disconnect(), 1000);
          } else if (!e.target.closest(".mantine-Popover-dropdown")) {
            document
              .querySelectorAll(".mantine-Popover-dropdown.cv-open")
              .forEach((d) => d.classList.remove("cv-open"));
          }
        },
        true,
      );
    })();

    var newStyle = document.createElement("style");
    newStyle.id = "LT153";

    newStyle.textContent = `
			.mantine-Popover-dropdown {
			  display: none !important;
			}
			
			.mantine-Popover-dropdown.cv-open {
			  display: block !important;
			}
			
			/* new custom quantity and ADD styles */
			.css-r4wj6w.grid-view .ais-Hits-list .ais-Hits-item .addToCart-container {
			  bottom: 75px !important;
			}
			
			.ais-Hits-list .ais-Hits-item:hover {
				box-shadow: none !important;
			}
			
			#quantity-swatches {
			  display: flex;
			  gap: 8px;
			  margin-bottom: 1rem;
			  width: 100%;
			  height: 44px;
			}
			
			.qty-swatch {
			  padding: 11px 16px;
			  border: 1px solid #bcbcbc;
			  font-weight: bold;
			  width: 100%;
			  background: white;
			  border-radius: 5px;
			  cursor: pointer;
			}
			
			.qty-swatch:hover,
			#qty-12-box:hover {
			  border: 2px solid black;
			  font-weight: bold;
			}
			
			#qty-12-box {
			  cursor: pointer;
			  margin: 1rem 0;
			  padding: 11px 16px;
			  border: 1px solid #ccc;
			  color: black;
			  height: 44px;
			  align-items: center;
			  justify-content: center;
			  display: flex;
			  border-radius: 5px;
			  background: white;
			}
			
			#custom-quick-add {
			  display: flex;
			  justify-content: space-between;
			  align-items: center;
			  gap: 24px;
			  margin-top: 1rem;
			  margin-top: auto;
			  width: 100%;
			  padding: 16px;
			}
			
			#quantity-selector {
			  display: flex;
			  align-items: center;
			  gap: 0;
			  height: 34px;
			  flex-shrink: 0;
			}
			
			.qty-btn {
			  display: flex;
			  width: 34px !important;
			  height: 34px;
			  padding: 0.667px;
			  justify-content: center;
			  align-items: center;
			  border-radius: 5px;
			  border: 1px solid black;
			  cursor: pointer;
			  background: white;
			  color: black;
			}
			
			#qty-decrease:disabled {
			  color: #cccccc;
			  border: 1px solid #cccccc;
			  cursor: auto;
			}
			
			#custom-qty-input {
			  height: 34px;
			  border: unset !important;
			  border-radius: 0;
			  text-align: center;
			  font-weight: normal;
			  -moz-appearance: textfield;
			  display: flex;
			  width: 40px;
			  min-height: var(--height-34, 34px);
			  padding: 7.8px 6px;
			  justify-content: center;
			  align-items: flex-start;
			  color: var(--www-laithwaites-co-uk-black, var(--color-black-solid, #000));
			  text-align: center;
			  font-family: var(--font-family-Font-2, Roboto);
			  font-size: var(--font-size-16, 16px);
			  font-style: normal;
			  font-weight: var(--font-weight-400, 400);
			  line-height: var(--line-height-18_4, 18.4px);
			}
			
			#custom-qty-input::-webkit-inner-spin-button,
			#custom-qty-input::-webkit-outer-spin-button {
			  -webkit-appearance: none;
			  margin: 0;
			}
			
			#custom-atb {
			  padding: 14px 26px;
			  background: #2e7d5d;
			  color: white;
			  font-weight: bold;
			  border: none;
			  width: 100%;
			  height: 44px;
			  border-radius: 5px;
			  cursor: pointer;
			  line-height: 1;
			}
			
			#custom-atb:hover {
			  background: #094b32;
			  color: white;
			}
			
			/* hide original ATB BTB with popup etc.*/
			.grid-addto-cart-container {
			  display: none;
			}
			
			/* OFFER BADGE STYLES */
			.custom-pricing-cont {
			  display: flex;
			  align-items: center;
			  justify-content: center;
			}
			
			.custom-pricing-cont .lowestPricePossibleOnOffer {
			  display: flex;
			  align-items: center;
			  justify-content: center;
			  overflow: visible;
			}
			
			.lowestPricepossible,
			.lowestPricePossibleOnOffer,
			.maxSavingsContainer,
			.price-per-litre {
			  text-align: center !important;
			  width: 100% !important;
			}
			
			.plp-info-icon-btn {
			  display: inline-flex !important;
			  align-items: center !important;
			  justify-content: center !important;
			  margin: 0 !important;
			}
			
			#box-container {
			  padding: 0;
			}
			
			.badge-price {
			  height: 16px;
			  display: flex;
			  flex-shrink: 0;
			}
			
			/* CUSTOM CREATED DEAL POPUP STYLES */
			.offer-price-badge {
			  position: relative;
			  padding-left: 6px;
			  padding-right: 5px;
			  cursor: pointer;
			  display: inline-flex;
			  align-items: center;
			  justify-content: center;
			}
			
			.deal-popup-container {
			  position: absolute;
			  bottom: 120%;
			  left: 50%;
			  transform: translateX(-50%);
			  margin-bottom: 10px;
			  background: white;
			  border: 1px solid #ccc;
			  border-radius: 4px;
			  padding: 16px;
			  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
			  opacity: 0;
			  pointer-events: none;
			  transition: opacity 0.2s ease;
			  z-index: 1000;
			}
			
			.deal-popup-arrow {
			  position: absolute;
			  width: 2.25rem;
			  height: 2.25rem;
			  background: white;
			  border-right: 1px solid #ccc;
			  border-bottom: 1px solid #ccc;
			  transform: rotate(45deg);
			  bottom: -1.125rem;
			  left: 50%;
			  margin-left: -1.125rem;
			  transition: left 0.2s ease;
			}
			
			/* left align popup deal text */
			.deal-popup-container .add-on-container,
			.deal-popup-container .tiered-price-container,
			.deal-popup-container .top-price-section {
			  text-align: left;
			}
			
			.hide-section {
			  display: none;
			}
			
			.deal-popup-container .add-to-cart-section {
			  display: none;
			}
			
			/* ADD STYLES TO RESERVE ITEMS, TO REVERT BACK TO ORIGINAL */
			.reserve-item .grid-addto-cart-container {
			  display: block !important;
			}
			
			.css-r4wj6w.grid-view
			  .ais-Hits-list
			  .ais-Hits-item.reserve-item
			  .addToCart-container {
			  bottom: 16px !important;
			}
			
			/* remove margin bottom for pricing element on mobile */
			.css-r4wj6w .ais-Hits-item .addToCart-container {
			  margin-bottom: unset !important;
			}
			.mantine-Carousel-root .price {
			  display: flex;
			}
			.mantine-Carousel-root .buyers-price {
			  margin-left: 5px;
			}
			
			/* 'ADDING' text take up too much space, so spinner added instead for those screen sizes */
			.btn-spinner {
			  width: 16px;
			  height: 16px;
			  border: 2px solid rgba(255, 255, 255, 0.3);
			  border-top-color: white;
			  border-radius: 50%;
			  animation: spin 0.6s linear infinite;
			  display: inline-block;
			}
			
			@keyframes spin {
			  to {
			    transform: rotate(360deg);
			  }
			}
			
			/* Hide spinner by default */
			#custom-atb .btn-spinner {
			  display: none;
			}
			
			/* David | Mobile: 2-column product grid layout */
			@media (max-width: 767px) {
			  body,
			  html {
			    overflow-x: hidden !important;
			    width: 100% !important;
			    max-width: 100% !important;
			  }
			
			  .ais-Hits,
			  [class*="ais-Hits"] {
			    overflow-x: hidden !important;
			    width: 100% !important;
			    max-width: 100% !important;
			  }
			
			  .ais-Hits-list {
			    display: grid !important;
			    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
			    gap: 16px !important;
			    padding: 0 !important;
			    width: 100% !important;
			    max-width: 100% !important;
			    overflow-x: hidden !important;
			    box-sizing: border-box !important;
			  }
			
			  .ais-Hits-item {
			    width: 100% !important;
			    min-width: 0 !important;
			    max-width: 100% !important;
			    margin: 0 !important;
			    overflow: hidden !important;
			    box-sizing: border-box !important;
			    border: none !important;
			    border-radius: 0 !important;
			  }
			
			  .ais-Hits-item * {
			    max-width: 100% !important;
			    box-sizing: border-box !important;
			  }
			
			  .ais-Hits-item .addToCart-container {
			    margin: 0 !important;
			    padding: 0 !important;
			  }
			
			  .ais-Highlight > .ais-Highlight-nonHighlighted {
			    display: flex !important;
			    flex-direction: column !important;
			    justify-content: center !important;
			    align-self: stretch !important;
			
			    overflow: hidden !important;
			    color: var(--content-headings-headings, #000) !important;
			    text-overflow: ellipsis !important;
			    font-family: "Noto Serif" !important;
			    font-size: 18px !important;
			    font-style: normal !important;
			    font-weight: 600 !important;
			    line-height: var(
			      --typography-label-Medium-Bold-line-height,
			      20px
			    ) !important;
			    /* 111.111% */
			    letter-spacing: var(
			      --typography-label-Medium-Bold-letter-spacing,
			      0
			    ) !important;
			  }
			
			  /* Target the image-bg and image-container that actually contain the images */
			  .ais-Hits-item .image-bg {
			    width: 100% !important;
			    position: relative !important;
			    border-radius: 0 !important;
			  }
			
			  .ais-Hits-item .image-container {
			    position: relative !important;
			    width: 100% !important;
			    padding-bottom: 100% !important;
			    /* Creates square aspect ratio */
			    overflow: hidden !important;
			    background: #f8f5ef !important;
			    display: block !important;
			  }
			
			  /* The image div that contains the absolutely positioned image */
			  .ais-Hits-item .image-container .image {
			    position: absolute !important;
			    top: 0 !important;
			    left: 0 !important;
			    width: 100% !important;
			    height: 100% !important;
			  }
			
			  /* The actual img tag - preserve existing object-fit contain */
			  .ais-Hits-item .image-container .image img {
			    position: absolute !important;
			    top: 0 !important;
			    left: 0 !important;
			    width: 100% !important;
			    height: 90% !important;
			    object-fit: contain !important;
			    object-position: center !important;
			    background-color: #f8f5ef !important;
			  }
			
			  /* Country container */
			  .ais-Hits-item .country {
			    display: inline-flex !important;
			    align-items: center !important;
			    gap: 4px !important;
			    flex-wrap: wrap !important;
			    line-height: 30px;
			  }
			
			  /* Country container div */
			  .ais-Hits-item .country-container {
			    align-items: center !important;
			  }
			
			  /* Flag images */
			  .ais-Hits-item .country-container img {
			    width: 20px !important;
			    height: auto !important;
			    max-width: 20px !important;
			    object-fit: contain !important;
			    display: inline-block !important;
			  }
			
			  /* Country title text */
			  .ais-Hits-item .country-title {
			    font-size: 16px !important;
			    white-space: nowrap !important;
			  }
			
			  /* Wine style text */
			  .ais-Hits-item .wine-style {
			    font-size: 14px !important;
			    line-height: 18.4px !important;
			  }
			
			  /* Grape variety container */
			  .ais-Hits-item .grapeVariety-container {
			    display: inline-flex !important;
			    align-items: start !important;
			    gap: 4px !important;
			    font-size: 12px !important;
			    margin: 0 !important;
			  }
			
			  /* Grape variety title */
			  .ais-Hits-item .grapeVariety-title {
			    font-size: 16px !important;
			    white-space: nowrap !important;
			  }
			
			  /* Country rating container */
			  .inline-container > .inline-container {
			    width: 100% !important;
			  }
			
			  .inline-container > .country-rating {
			    display: flex !important;
			    flex-flow: row wrap !important;
			    justify-content: start !important;
			    width: 100% !important;
			
			    /* gap: 0 !important; */
			    margin: 0 !important;
			  }
			
			  /* Rating container */
			  .ais-Hits-item .rating {
			    display: inline-flex !important;
			    align-items: center !important;
			    gap: 8px !important;
			  }
			
			  /* Rating stars container */
			  .ais-Hits-item .star-icons {
			    display: inline-flex !important;
			    align-items: center !important;
			    gap: 2px !important;
			  }
			
			  /* Review count */
			  .grid-view.law .ais-Hits-item .review-count {
			    display: inline-flex !important;
			    align-items: center !important;
			    line-height: 1 !important;
			    margin-left: 0 !important;
			    font-size: 14px !important;
			  }
			
			  .ais-Hits-item .rating a {
			    display: inline-flex !important;
			    align-items: center !important;
			  }
			
			  .grid-view.law .ais-Hits-item .country-rating {
			    gap: 8px !important;
			  }
			
			  .grid-view.law .ais-Hits-item .country-rating :last-child {
			    display: flex !important;
			    justify-content: flex-start !important;
			    font-size: 14px !important;
			    gap: 0 !important;
			    line-height: 18.4px !important;
			  }
			  .grid-view.law .ais-Hits-item .country-rating .country {
			    gap: 8px !important;
			    width: 100%;
			  }
			
			  div.hit-content.align-top
			    > div.inline-container
			    > div.inline-container
			    > div
			    > div:nth-child(2) {
			    width: 100%;
			  }
			
			  .css-1x2qwlw .ais-Hits-item .hit-content .inline-container .rating {
			    width: 100% !important;
			  }
			
			  /* Hit content padding */
			  .ais-Hits-item .hit-content {
			    padding: 16px 0 0 0 !important;
			  }
			
			  /* Price amount */
			  .grid-view.law .ais-Hits-item .lowestPricepossible .cv-price-amount {
			    font-size: 18px !important;
			    font-style: normal !important;
			    font-weight: 700 !important;
			    line-height: 25.2px !important;
			    letter-spacing: 0.18px !important;
			  }
			
			  /* Title */
			  .grid-view.law .ais-Hits-item .titleDescSale a span {
			    font-size: 18px !important;
			    font-style: normal !important;
			    font-weight: 600 !important;
			  }
			
			  /* Price container */
			  .ais-Hits-item .lowestPricepossible,
			  .ais-Hits-item .price-container {
			    font-size: 14px !important;
			    margin: 14px 0 0 0 !important;
			    font-weight: normal !important;
			  }
			
			  /* Saving text */
			  .ais-Hits-item .saving {
			    font-size: 14px !important;
			  }
			
			  /* Inline container */
			  .ais-Hits-item .inline-container {
			    margin: 6px 0 !important;
			  }
			
			  .lowestPricepossible {
			    text-align: left !important;
			  }
			
			  .maxSavingsContainer {
			    margin: 10px 0 !important;
			  }
			
			  /* CUSTOM QUICK ADD STYLES */
			  #custom-quick-add {
			    gap: 10px !important;
			    flex-wrap: wrap !important;
			    padding: 10px 0 0 0 !important;
			  }
			
			  #quantity-selector {
			    height: 32px !important;
			    width: 100%;
			    justify-content: flex-start;
			  }
			
			  .qty-btn {
			    width: 32px !important;
			    height: 32px !important;
			  }
			
			  #custom-qty-input {
			    width: 36px !important;
			    height: 32px !important;
			    font-size: 14px !important;
			  }
			
			  #custom-atb {
			    display: flex !important;
			    flex-direction: column !important;
			    justify-content: center !important;
			    align-items: center !important;
			    align-self: stretch !important;
			    font-size: 12px !important;
			    height: 44px !important;
			    padding: 14px !important;
			    border-radius: 5px !important;
			    background: #2e7d5d !important;
			  }
			
			  /* Button text */
			  #custom-quick-add .btn-text-full {
			    display: block !important;
			    font-size: 16px !important;
			  }
			
			  .btn-text-short {
			    display: none !important;
			  }
			
			  /* Offer badge */
			  .offer-price-badge {
			    padding: 8px !important;
			    margin: -8px !important;
			  }
			
			  .badge-price svg {
			    width: 14px !important;
			    height: 14px !important;
			  }
			
			  .css-1x2qwlw.grid-view
			    .ais-Hits-list
			    .ais-Hits-item
			    .hit-content
			    .inline-container
			    .rating
			    a
			    span
			    svg {
			    margin-right: 0 !important;
			  }
			
			  .image-container > .quick-links-container,
			  .quick-links-container > .zoom {
			    display: none;
			  }
			
			  div.css-ija0x4 {
			    display: flex;
			    justify-content: center;
			    align-items: center;
			  }
			
			  /* Left-align all content inside hit-content */
			  .grid-view.law .ais-Hits-item .hit-content.align-top {
			    text-align: left !important;
			  }
			
			  .grid-view.law .ais-Hits-item .hit-content.align-top .inline-container,
			  .grid-view.law .ais-Hits-item .hit-content.align-top .title,
			  .grid-view.law .ais-Hits-item .hit-content.align-top .titleDescSale,
			  .grid-view.law .ais-Hits-item .hit-content.align-top .country-rating,
			  .grid-view.law .ais-Hits-item .hit-content.align-top .rating {
			    text-align: left !important;
			  }
			
			  .grid-view.law .ais-Hits-item .hit-content.align-top .title {
			    padding-bottom: 8px !important;
			  }
			
			  .grid-view.law .ais-Hits-item .hit-content.align-top .inline-container {
			    justify-content: flex-start !important;
			    margin: 0 !important;
			  }
			
			  .grid-view.law .ais-Hits-item .hit-content.align-top .country,
			  .grid-view.law .ais-Hits-item .hit-content.align-top .rating,
			  .grid-view.law .ais-Hits-item .hit-content.align-top .grapeVariety-container,
			  .grid-view.law .ais-Hits-item .hit-content.align-top .country-container {
			    justify-content: flex-start !important;
			  }
			
			  .grid-view.law .ais-Hits-item .hit-content > .inline-container {
			    display: flex !important;
			    flex-direction: column !important;
			    gap: 8px !important;
			  }
			
			  .grid-view.law .ais-Hits-item .hit-content .rating {
			    display: flex !important;
			    justify-content: flex-start !important;
			    width: 100% !important;
			    margin-top: 0 !important;
			  }
			
			  .grid-view.law .ais-Hits-item .hit-content .country {
			    margin-bottom: 0 !important;
			  }
			
			  /* Left-align addToCart-container and its children */
			  .grid-view.law .ais-Hits-item .addToCart-container {
			    text-align: left !important;
			    width: 100% !important;
			  }
			  .grid-view.law .ais-Hits-item .addToCart-container .lowestPricepossible,
			  .grid-view.law .ais-Hits-item .addToCart-container .maxSavingsContainer,
			  .grid-view.law .ais-Hits-item .addToCart-container .price-per-litre {
			    text-align: left !important;
			    width: 100% !important;
			  }
			  .grid-view.law .ais-Hits-item .addToCart-container .custom-pricing-cont {
			    justify-content: flex-start !important;
			    width: 100% !important;
			  }
			  .grid-view.law
			    .ais-Hits-item
			    .addToCart-container
			    [data-testid="pricing-and-purchase-panel-wrapper"] {
			    justify-content: flex-start !important;
			    align-items: flex-start !important;
			  }
			
			  .grid-view.law .ais-Hits-item #box-container {
			    width: 100% !important;
			    padding: 0 !important;
			  }
			  .grid-view.law .ais-Hits-item #box-container > *:not(.saving-section-content),
			  .grid-view.law
			    .ais-Hits-item
			    #box-container
			    > *:not(.saving-section-content)
			    > *:not(.saving-section-content) {
			    width: 100% !important;
			  }
			
			  .grid-view.law .ais-Hits-item .image-container > .pill.stock {
			    position: absolute !important;
			    bottom: 0 !important;
			    right: 8px !important;
			    z-index: 3 !important;
			    margin: 0 !important;
			  }
			
			  .grid-view.law .ais-Hits-item .lowestPricePossibleOnOffer .plp-offer-info {
			    display: block !important;
			    line-height: 20px !important;
			  }
			
			  .grid-view.law
			    .ais-Hits-item
			    .lowestPricePossibleOnOffer
			    .plp-offer-info
			    .plp-info-icon-btn {
			    width: 16px !important;
			    height: 16px !important;
			    vertical-align: middle !important;
			    margin-left: 4px !important;
			  }
			
			  .css-bd5p8m.grid-view .ais-Hits-list .ais-Hits-item {
			    box-shadow: none !important;
			    /* Add if not overriding */
			  }
			
			  .css-ija0x4 .top-price-section .price-section .price {
			    font-size: 18px;
			    line-height: 25.2px;
			  }
			
			  .mantine-Popover-dropdown > .mantine-Popover-arrow {
			    width: 1.25rem !important;
			    height: 1.25rem !important;
			    bottom: -0.65rem !important;
			    left: 135.5px !important;
			  }
			}
			
			/* Extra small devices (phones under 380px) */
			@media (max-width: 380px) {
			  .ais-Hits-item .titleDescSale a {
			    font-size: 12px !important;
			  }
			
			  .ais-Hits-item .country-container img {
			    width: 18px !important;
			    max-width: 18px !important;
			  }
			
			  #custom-quick-add {
			    flex-direction: column !important;
			    gap: 8px !important;
			  }
			
			  #quantity-selector {
			    width: 100% !important;
			  }
			
			  #custom-atb {
			    width: 100% !important;
			  }
			}
			
			@media (max-width: 375px) {
			  #custom-atb .btn-text-short {
			    display: inline;
			  }
			
			  #custom-atb .btn-text-full {
			    display: none;
			  }
			}
			
			@media (max-width: 1024px) {
			  #bottom-wrapper {
			    gap: 4px;
			  }
			
			  #custom-qty-input {
			    width: 50px;
			  }
			
			  .offer-price-badge {
			    padding: 14px;
			    margin: -14px;
			  }
			
			  .custom-pricing-cont .lowestPricePossibleOnOffer span {
			    padding-right: 6px;
			  }
			}
			
			@media (max-width: 1022px) {
			  #custom-atb .btn-text-short {
			    display: none;
			  }
			}
			
			@media (max-width: 767px) {
			  .deal-popup-container {
			    min-width: unset;
			  }
			
			  .ais-Hits-item .image-bg .offer {
			    position: relative !important;
			    z-index: 2 !important;
			  }
			
			  .ais-Hits-item .image-bg .offer svg {
			    width: 38px !important;
			    height: auto !important;
			  }
			
			  .css-ija0x4 .tiered-price-container div:first-of-type .price {
			    font-size: 16px !important;
			  }
			}
			
			@media (min-width: 1024px) and (max-width: 1300px) {
			  #custom-atb.loading .btn-spinner {
			    display: inline-block;
			  }
			
			  #custom-atb.loading .btn-text-short,
			  #custom-atb.loading .btn-text-full {
			    display: none !important;
			  }
			}
			
			@media (min-width: 1024px) and (max-width: 1230px) {
			  #custom-quick-add {
			    gap: 16px;
			  }
			}
			
			@media (min-width: 1022px) and (max-width: 1465px) {
			  #custom-atb .btn-text-short {
			    display: inline;
			  }
			
			  #custom-atb .btn-text-full {
			    display: none;
			  }
			}
			
			@media (min-width: 1465px) {
			  #custom-atb .btn-text-short {
			    display: none;
			  }
			}
			
			@media (min-width: 1366px) {
			  .grid-view .web-description {
			    display: none !important;
			  }
			
			  .grid-view .ais-Hits .ais-Hits-item .web-description.class-grid {
			    display: none !important;
			  }
			
			  .css-16v6bxo .ais-Hits-list .ais-Hits-item .hit-content .web-description {
			    display: none !important;
			  }
			
			  .grid-view .ais-Hits .ais-Hits-item .hit-content {
			    min-height: unset !important;
			    height: fit-content;
			  }
			
			  .grid-view .ais-Hits .ais-Hits-item .hit-content .country {
			    position: static !important;
			  }
			
			  .grid-view .ais-Hits .ais-Hits-item .hit-content .inline-container .rating {
			    position: static !important;
			  }
			
			  .grid-view
			    .ais-Hits-list
			    .ais-Hits-item
			    .hit-content
			    .inline-container
			    .rating {
			    margin-top: 0 !important;
			  }
			
			  .grid-view
			    .ais-Hits-list
			    .ais-Hits-item.happy-to-wait-prod
			    .hit-content
			    .inline-container
			    .rating {
			    margin-top: unset !important;
			  }
			
			  .grid-view
			    .ais-Hits-list
			    .ais-Hits-item
			    .hit-content
			    .inline-container
			    .rating.default {
			    margin-top: 10px !important;
			  }
			
			  .grid-view
			    .ais-Hits-list
			    .ais-Hits-item
			    .hit-content
			    .inline-container
			    .happy-to-wait-container {
			    min-height: 46px;
			    margin-top: -0.65rem;
			  }
			}
			
			/* Desktop hover */
			@media (hover: hover) and (pointer: fine) {
			  .offer-price-badge:hover .deal-popup-container {
			    opacity: 1;
			    pointer-events: auto;
			  }
			}
			
			/* Mobile/touch devices only */
			@media (hover: none) and (pointer: coarse) {
			  .offer-price-badge.popup-active .deal-popup-container {
			    opacity: 1;
			    pointer-events: auto;
			  }
			
			  .offer-price-badge:not(.popup-active) .deal-popup-container {
			    opacity: 0 !important;
			    pointer-events: none !important;
			  }
			}
			
			/* Desktop widths - deal popup container */
			@media (min-width: 1025px) {
			  .deal-popup-container {
			    width: 350px;
			  }
			}
			
			@media (min-width: 1480px) {
			  .deal-popup-container {
			    width: 380px;
			  }
			}
			
			@media (min-width: 1551px) {
			  .deal-popup-container {
			    width: 420px;
			  }
			}
			
			@media (min-width: 1680px) {
			  .deal-popup-container {
			    width: 480px;
			  }
			}
    `;

    document.head.appendChild(newStyle);
  }
}

// Run on page load
setTimeout(moveElementsOnMobileOnly, 1000);

// Also run on window resize (in case user rotates device)
window.addEventListener("resize", function () {
  if (window.innerWidth <= 767) {
    moveElementsOnMobileOnly();
  }
});
