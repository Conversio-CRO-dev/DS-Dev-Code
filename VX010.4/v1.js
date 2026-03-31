// Mobile & Desktopo Version | Separate CSS

if (window.innerWidth < 768) {
  // mobile code
  function elementReady(selector) {
    return new Promise((resolve) => {
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

  let button = null;
  let buttonText = null;
  let originalText = "";
  let atbNotificationAdded = false;
  let orgiginalBtnHtml = "";

  function initATB(buttonSelector) {
    if (buttonSelector.querySelector(".block")) {
      let textEl = buttonSelector.querySelector(".block");
      originalText = textEl.textContent;
      orgiginalBtnHtml = buttonSelector.innerHTML;
    } else if (document.querySelector("#layer-product-list")) {
      originalText = "";
      orgiginalBtnHtml = buttonSelector.innerHTML;
    } else {
      originalText = buttonSelector.textContent;
    }

    buttonSelector.innerHTML = `
 <span class="spinner"></span>
 <span class="button-text">${originalText}</span>
 `;
    button = buttonSelector;
    button.classList.add("atb-button");
    buttonText = button.querySelector(".button-text");
  }

  // Set button to loading state
  function setLoadingState() {
    button.disabled = true;
    button.classList.add("loading");
    button.classList.remove("success");

    // PLP page
    if (
      document.querySelector("#layer-product-list") ||
      button.classList.contains("add-on-add-to-cart-btn")
    ) {
      buttonText.textContent = null;
    } else {
      buttonText.textContent = "Adding";
    }
  }

  // Set button to success state
  function setSuccessState() {
    button.classList.remove("loading");
    button.classList.add("success");
    button.disabled = false;

    // add on success
    if (document.querySelector(".add-on-add-to-cart-btn.atb-button.success")) {
      buttonText.innerHTML = `<svg width="2rem" height="2rem" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#4AA35A"><g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(5.279999999999999,5.279999999999999), scale(0.56)"><rect x="-2.4" y="-2.4" width="28.80" height="28.80" rx="14.4" fill="#fafeff" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.144"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM18.4158 9.70405C18.8055 9.31268 18.8041 8.67952 18.4127 8.28984L17.7041 7.58426C17.3127 7.19458 16.6796 7.19594 16.2899 7.58731L10.5183 13.3838L7.19723 10.1089C6.80398 9.72117 6.17083 9.7256 5.78305 10.1189L5.08092 10.8309C4.69314 11.2241 4.69758 11.8573 5.09083 12.2451L9.82912 16.9174C10.221 17.3039 10.8515 17.301 11.2399 16.911L18.4158 9.70405Z" fill="#4AA35A"></path> </g></svg>`;
    } else if (document.querySelector("#layer-product-list")) {
      // PLP page
      buttonText.textContent = "";
    } else {
      buttonText.textContent = "Added";
    }
  }

  // Reset button to original state
  function resetButtonState() {
    button.disabled = false;
    button.classList.remove("loading", "success");
    button.style.backgroundColor = "";
    if (orgiginalBtnHtml) {
      button.innerHTML = orgiginalBtnHtml;
    } else {
      buttonText.textContent = originalText;
    }
  }

  // New function to get selected add-ons from Alpine.js
  function getSelectedAddons() {
    try {
      const productAddonsEl = document.querySelector(
        '[x-data*="productAddons"]',
      );
      if (productAddonsEl && productAddonsEl._x_dataStack) {
        const alpineData = productAddonsEl._x_dataStack[0];
        if (alpineData && alpineData.getSelectedAddons) {
          return alpineData.getSelectedAddons();
        }
      }
    } catch (error) {
      console.error("Error getting selected add-ons:", error);
      return [];
    }
  }

  // Enhanced function to build URL with add-ons
  function buildCartUrlWithAddons(baseUrl, selectedAddons) {
    if (!selectedAddons || selectedAddons.length === 0) {
      return baseUrl;
    }

    // Extract product_id from base URL
    const productIdMatch = baseUrl.match(/product_id\/(\d+)/);
    if (!productIdMatch) {
      return baseUrl;
    }

    const productId = productIdMatch[1];
    const addonSkus = selectedAddons.map((addon) => addon.sku).join(",");

    // Build the URL with add-ons
    return `https://www.vax.co.uk/checkout/cart/added/product_id/${productId}/product_add_on_sku/${encodeURIComponent(addonSkus)}`;
  }

  async function fetchAndShowCartContent(url, atbBtn, itemTitle) {
    try {
      const response = await fetch(url, {
        credentials: "same-origin",
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      let totalPrice;
      // for accessories atb page is just the cart page by default showing all items
      if (url === "https://www.vax.co.uk/checkout/cart/") {
        const allItems = doc.querySelectorAll(".cart-item");
        let targetElement;
        allItems.forEach((item) => {
          let itemText = item.querySelector(".product-item-link");

          if (itemText.textContent.trim() === itemTitle) {
            targetElement = item;
          }
        });

        if (targetElement) {
          let pageWrapper = document.querySelector(".page-wrapper");
          pageWrapper?.classList.add("accessories-item");

          totalPrice =
            document.querySelector(".product-info-main .current-price")
              ?.textContent || "";

          totalPrice =
            document.querySelector(".main-product-price .current-price")
              ?.textContent || "";

          // PLP exception as no total price shown
          if (!totalPrice && document.querySelector("#product-list")) {
            let itemContainerPlp = atbBtn.closest("form");
            let finalPrice = itemContainerPlp?.querySelector(
              '[data-price-type="finalPrice"]',
            );
            // Remove £ symbol and trim whitespace
            totalPrice = totalPrice.replace("£", "").trim();
            totalPrice = "£" + finalPrice.getAttribute("data-price-amount");
          }
          let itemCount = 1;

          showCartPopup(targetElement.outerHTML, itemCount, totalPrice, atbBtn);
        }
      } else {
        const targetElement = doc.querySelector(
          "#maincontent .grid.grid-cols-1 div .md\\:overflow-hidden",
        );

        if (targetElement) {
          totalPrice =
            document.querySelector(".main-product-price .current-price")
              ?.textContent || "";

          // PLP exception as no total price shown
          if (!totalPrice && document.querySelector("#product-list")) {
            let itemContainerPlp = atbBtn.closest("form");
            let finalPrice = itemContainerPlp?.querySelector(
              '[data-price-type="finalPrice"]',
            );
            totalPrice = totalPrice.replace("£", "").trim();
            totalPrice = "£" + finalPrice.getAttribute("data-price-amount");
          }

          let itemCount = targetElement.querySelectorAll(".cart-item").length;

          showCartPopup(targetElement.outerHTML, itemCount, totalPrice, atbBtn);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart content:", error);
    }
  }

  const vaxAddOns = [
    {
      name: "VAX Hard Floor Antibacterial Cleaning Solution 4L",
      sku: "1-9-142097",
      url: "https://www.vax.co.uk/onepwr-solution-4l",
      productId: "11556",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/NEW%20-%20Solutions/Hard%20Floor%20Cleaning%20Solution%204L%20-%201-9-143316/VAXUK4335_PNG-_Product_Card_-_VAX_OP_Multifloor_Solution_4L.png",
      rating: 4.6,
    },
    {
      name: "VAX Hard Floor Antibacterial Cleaning Solution 1L",
      sku: "1-9-142276",
      url: "https://www.vax.co.uk/onepwr-solution-1l",
      productId: "11643",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/NEW%20-%20Solutions/1L%20Hard%20Floor%20Cleaning%20Solution%201-9-142276/VAXUK4335_-_Product_Card_-_VAX_OP_PNG_Multifloor_Solution_1L.png",
      rating: 4.6,
    },
    {
      name: "VAX ONEPWR™ 4.0Ah Battery and 1.5A Charger Kit",
      sku: "battery-bundle-3",
      url: "https://www.vax.co.uk/vax-onepwr-battery-and-slide-charger-kit",
      productId: "14790",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Batteries/Slider_Charger_01_direct_72DPI_880x880_rko6kd.png",
      rating: 4.8,
    },
    {
      name: "VAX Original Carpet Cleaning Solution 1.5L",
      sku: "1-9-142055",
      url: "https://www.vax.co.uk/original-carpet-cleaning-solution-1-5l",
      productId: "11301",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Original_Rose_Burst_Solution_1.5L_01_direct_72DPI_880x88_drpdwu.jpg?_i=AB",
      rating: 4.9,
    },
    {
      name: "VAX ONEPWR™ 4.0Ah Dual Battery + Dual Bay Charger Kit",
      sku: "battery-bundle-2",
      url: "https://www.vax.co.uk/vax-onepwr-dual-battery-and-dual-bay-charger-kit",
      productId: "14789",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/media/catalog/product/d/u/dual-bay-charger-feature-01_1.jpg?_i=AB",
      rating: 4.4,
    },
    {
      name: "VAX HomePro Sponge Filter and Frame",
      sku: "1-7-143201",
      url: "https://www.vax.co.uk/vax-homepro-sponge-filter-and-frame",
      productId: "14939",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Spares/ONEPWR%20HomePro/SPARES_VAX_HomePro_Pre_Motor_Filter_3Q.jpg",
      rating: 4.5,
    },
    {
      name: "VAX SpotWash Spot Cleaning Oxy-Lift Boost Solution 1L",
      sku: "1-9-143111",
      url: "https://www.vax.co.uk/vax-spotwash-spot-cleaning-oxy-lift-boost-solution-1l",
      productId: "14753",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Solutions/Spotwash_OxyLift_Rose_Burst_1L_01_direct_72DPI_880x880_h5h90a.png",
      rating: 4.8,
    },
    {
      name: "Pet Stain & Odour Remover Pre-Treatment Solution 1 Litre Refill",
      sku: "1-9-142879",
      url: "https://www.vax.co.uk/pet-stain-odour-remover-pre-treatment-solution-1litre",
      productId: "14481",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Pet_Stain_Odour_Remover_Pre_Treatment_Solution_1L_Refill_01_direct_72DPI_880x880_jcmv8t.jpg",
      rating: 4.8,
    },
    {
      name: "VAX ONEPWR™ 4.0Ah Dual Battery Kit",
      sku: "battery-bundle-1",
      url: "https://www.vax.co.uk/vax-onepwr-dual-battery-kit",
      productId: "14788",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Batteries/Dual_Battery_01_direct_72DPI_880x880_xtmqzh.png",
      rating: 4.9,
    },
    {
      name: "VAX Spring Fresh Steam Detergent 1L",
      sku: "1-9-132807-01",
      url: "https://www.vax.co.uk/vax-spring-fresh-steam-detergent-1l-1",
      productId: "9881",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Steam_Spring_Fresh_Solution_1L_01_direct_72DPI_880x88_bzgcwk.jpg",
      rating: 4.8,
    },
    {
      name: "VAX Citrus Burst Steam Detergent 1L",
      sku: "1-9-132666-01",
      url: "https://www.vax.co.uk/citrus-burst-steam-detergent-1l",
      productId: "5062",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Steam_Citrus_Burst_Solution_1L_01_direct_72DPI_880x88_movni9.jpg?_i=AB",
      rating: 4.4,
    },
    {
      name: "VAX Pet Steam Detergent (Apple Burst) 1L",
      sku: "1-9-132813-01",
      url: "https://www.vax.co.uk/pet-steam-detergent-apple-blossom-1l",
      productId: "9826",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Steam_Pet_Apple_Blossom_Solution_1L_01_direct_72DPI_880x880_wmocns.jpg",
      rating: 4.7,
    },
    {
      name: "Vax Microfibre Cleaning Pads x2 (Type 1)",
      sku: "1-1-131448-00",
      url: "https://www.vax.co.uk/1-1-131448-00-microfibre-pads",
      productId: "1935",
      imageUrl:
        "https://www.vax.co.uk/media/catalog/product/s/2/s2st-bundle_microfibrepads.jpg",
      rating: 4.2,
    },
    {
      name: "VAX Platinum Professional Carpet Cleaning Solution 4L",
      sku: "1-9-142060",
      url: "https://www.vax.co.uk/vax-platinum-professional-carpet-cleaning-solution-4l",
      productId: "11285",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/media/catalog/product/p/l/platinum_4l_hero_500px.jpg",
      rating: 4.8,
    },
    {
      name: "VAX Platinum Professional Carpet Cleaning Solution 1.5L",
      sku: "1-9-139136",
      url: "https://www.vax.co.uk/platinum-carpet-cleaning-solution-1-5l",
      productId: "11127",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Platinum_Professional_Rose_Burst_1.5L_01_direct_72DPI_880x88_ocukgm.jpg",
      rating: 4.8,
    },
    {
      name: "VAX Platinum Antibacterial Carpet Cleaning Solution 1.5L",
      sku: "1-9-142404",
      url: "https://www.vax.co.uk/vax-platinum-antibacterial-carpet-cleaning-solution-1-5l",
      productId: "14061",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Platinum_Antibac_Citrus_Burst_1.5L_01_direct_72DPI_880x88_bmazhd.jpg",
      rating: 4.9,
    },
    {
      name: "VAX Platinum Antibacterial Carpet Cleaning Solution 4L",
      sku: "1-9-142405",
      url: "https://www.vax.co.uk/vax-platinum-antibacterial-carpet-cleaning-solution-4l",
      productId: "14062",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Platinum_Antibac_Citrus_Burst_4L_01_direct_72DPI_880x88_b6ivyf.jpg",
      rating: 4.8,
    },
    {
      name: "VAX 4.0Ah ONEPWR™ Battery",
      sku: "1-1-142920",
      url: "https://www.vax.co.uk/vax-onepwr-4ah-battery",
      productId: "14575",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Batteries/4.0Ah_ONEPWR_Battery_GEN_2_01_direct_72DPI_880x880_mxzqm9.png",
      rating: 4.6,
    },
    {
      name: "Vax SpotWash Spot Cleaning Solution 1L",
      sku: "1-9-143091",
      url: "https://www.vax.co.uk/vax-spotwash-spot-cleaning-solution-1l",
      productId: "14755",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Solutions/Spotwash_Original_Solution_Rose_Burst_1L_01_direct_72DPI_880x880_gxgfyn.png",
      rating: 4.8,
    },
    {
      name: "VAX Spot Cleaner Car Cleaning Toolkit",
      sku: "1-9-143308",
      url: "https://www.vax.co.uk/vax-spot-cleaner-car-cleaning-tool-kit",
      productId: "15011",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/Tool%20Kit%20-%20Spot%20Cleaner%20Car%20Cleaning%20Tool%20Kit/VAXUK4163-Toolkit-SpotwashCarKit-880x880.png",
      rating: 4.3,
    },
    {
      name: "VAX SpotWash Spot Cleaning Solutions Bundle",
      sku: "1-1-142893",
      url: "https://www.vax.co.uk/vax-spotwash-spot-cleaning-solutions-bundle",
      productId: "14484",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Solutions/SpotWash-Solutions-BundleImage-880x880_2x.png?_i=AB",
      rating: 4.8,
    },
    {
      name: "VAX SpotWash Spot Cleaning Solutions Kit",
      sku: "1-9-143093",
      url: "https://www.vax.co.uk/vax-spot-washing-solutions-kit",
      productId: "14742",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Solutions/SpotWash-Solutions-BundleImage-880x880_2x.png?_i=AB",
      rating: 4.8,
    },
    {
      name: "Vax Blade 4 Filter",
      sku: "1-7-142167",
      url: "https://www.vax.co.uk/black-filter-high-rated-blade-3-max",
      productId: "11443",
      imageUrl:
        "https://ik.vax.co.uk/tr:c-at_max:w-960/media/catalog/product/1/-/1-7-142167_black_filter_blade_plan_view.jpg",
      rating: 4.3,
    },
    {
      name: "VAX SpotWash Spot Cleaning Antibacterial Solution 1.5L",
      sku: "1-9-143105",
      url: "https://www.vax.co.uk/solutions/vax-spotwash-spot-cleaning-antibacterial-solution-1-5l",
      productId: "14774",
      imageUrl:
        "https://ik.vax.co.uk/tr:cm-pad_resize:w-392:h-392/media/catalog/product/c/l/cld_6718ca46c0c65_Spotwash_Antibac_Solution_Citrus_Burst_1L_01_direct_72DPI_880x880_ixpwkm.png",
      rating: 5.0,
    },
    {
      name: "VAX SpotWash Spot Cleaning Antibacterial Solution 1L",
      sku: "1-9-143107 ",
      url: "https://www.vax.co.uk/carpet-cleaners-and-washers/spot-cleaners/vax-spotwash-solution-range/vax-spotwash-spot-cleaning-antibacterial-solution-1l",
      productId: "14773",
      imageUrl:
        "https://ik.vax.co.uk/media/catalog/product/c/l/cld_6718ca46c0c65_Spotwash_Antibac_Solution_Citrus_Burst_1L_01_direct_72DPI_880x880_ixpwkm.png",
      rating: 4.8,
    },
    {
      name: "VAX Pace Vacuum Filter",
      sku: "1-3-142701",
      url: "https://www.vax.co.uk/spares-and-solutions/filter-1-3-142701",
      productId: "14177",
      imageUrl:
        "https://ik.vax.co.uk/tr:c-at_max:w-1280/media/catalog/product/f/i/filter_1_6.jpg",
      rating: 4.8,
    },
  ];

  async function getAddOns() {
    let addOnHtml = "";

    let addOns = await allElementsReady(
      "#dropdown-container-top-picks-with-your-purchase .addon-option .addon-name",
    );

    let preSelectedAddOns = await getSelectedAddons();

    let selectedSkus;
    if (preSelectedAddOns.length > 0) {
      selectedSkus = preSelectedAddOns.map((addon) => addon.sku);
    }

    addOns.forEach((addOn) => {
      let title = addOn.textContent.trim();
      let item = addOn.closest("label");
      let savingPrice = item.querySelector(".price-box .saving-price");
      let currPrice = item.querySelector(".price-box .current-price");

      // Find matching product in data
      let product = vaxAddOns.find((p) => p.name === title);

      // Skip if this add-on was already selected on PDP
      if (product && selectedSkus && selectedSkus.includes(product.sku)) {
        return; // Skip this iteration
      }

      if (product) {
        addOnHtml += `
 <a href="${product.url}" class="add-on-item">
 <img src="${product.imageUrl}" alt="${product.name}" class="add-on-image">
 <div class="add-on-details">
 <h3 class="add-on-item-title">${product.name}</h3>
 <div class="add-on-rating">
 ${generateStars(product.rating)}
 </div>
 <div class="add-on-price">
 ${savingPrice && savingPrice.textContent ? `<span class="add-on-saving-price">${savingPrice.textContent}</span>` : ""}
 <span class="current-price">${currPrice.textContent}</span>
 </div>
 </div>
 <button class="add-on-add-to-cart-btn" data-product-id="${product.productId}">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 18" fill="none" stroke="none" class="h-auto w-5 md:w-6 pointer-events-none" role="img">
 <g clip-path="url(#clip0_1555_2892)">
 <path d="M3.53086 -0.00012207C3.82512 -0.00012207 4.05293 0.181636 4.11094 0.437573L4.26562 1.12488H19.7977C20.5113 1.12488 21.0809 1.83679 20.8805 2.55433L19.65 6.92214C19.2879 6.83425 18.9117 6.78152 18.5285 6.76043L19.7977 2.24988H4.52227L6.02695 8.99988H13.4133C13.1285 9.34441 12.8789 9.7241 12.675 10.1249H6.31172L6.825 12.3749H12.0246C12.007 12.5612 12 12.7475 12 12.9374C12 13.1272 12.007 13.3135 12.0246 13.4999H6.375C6.11133 13.4999 5.88633 13.3171 5.82656 13.0604L3.11355 1.12488H1.3125C1.00186 1.12488 0.75 0.873159 0.75 0.562378C0.75 0.251737 1.00186 -0.000111523 1.3125 -0.000111523L3.53086 -0.00012207ZM5.21836 16.0311C5.21836 14.9448 6.13242 14.0624 7.18711 14.0624C8.30508 14.0624 9.15586 14.9448 9.15586 16.0311C9.15586 17.1175 8.30508 17.9999 7.18711 17.9999C6.13242 17.9999 5.21836 17.1175 5.21836 16.0311ZM7.18711 16.8749C7.68633 16.8749 8.03086 16.4987 8.03086 16.0311C8.03086 15.5635 7.68633 15.1874 7.18711 15.1874C6.75117 15.1874 6.34336 15.5635 6.34336 16.0311C6.34336 16.4987 6.75117 16.8749 7.18711 16.8749ZM18.75 12.3432H20.4375C20.7469 12.3432 21 12.628 21 12.9057C21 13.2468 20.7469 13.4682 20.4375 13.4682H18.75V15.1557C18.75 15.4968 18.4969 15.7182 18.1875 15.7182C17.8781 15.7182 17.625 15.4968 17.625 15.1557V13.4682H15.9375C15.6281 13.4682 15.375 13.2468 15.375 12.9057C15.375 12.628 15.6281 12.3432 15.9375 12.3432H17.625V10.6557C17.625 10.378 17.8781 10.0932 18.1875 10.0932C18.4969 10.0932 18.75 10.378 18.75 10.6557V12.3432ZM23.25 12.9374C23.25 15.7323 20.9824 17.9999 18.1875 17.9999C15.3926 17.9999 13.125 15.7323 13.125 12.9374C13.125 10.1425 15.3926 7.87488 18.1875 7.87488C20.9824 7.87488 23.25 10.1425 23.25 12.9374ZM18.1875 8.99988C16.0113 8.99988 14.25 10.7612 14.25 12.9374C14.25 15.1136 16.0113 16.8749 18.1875 16.8749C20.3637 16.8749 22.125 15.1136 22.125 12.9374C22.125 10.7612 20.3637 8.99988 18.1875 8.99988Z" fill="white"></path>
 </g>
 <defs>
 <clipPath id="clip0_1555_2892">
 <rect width="22.5" height="18" fill="white" transform="translate(0.75 -0.00012207)"></rect>
 </clipPath>
 </defs>
 </svg>
 </button>
 </a>
 `;
      }
    });

    if (addOnHtml === "") {
      //console.log("VX010.3 | (Variation 1) | User adds to bag from PDP: no add-ons shown");
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "VX010.3 | Event Tracking",
          event_label:
            "VX010.3 | (Variation 1) | User adds to bag from PDP: no add-ons shown",
          event_segment: "VX010.3EV1I",
        },
      });
    } else {
      // console.log("VX010.3 | (Variation 1) | User adds to bag from PDP: add-ons shown");
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "VX010.3 | Event Tracking",
          event_label:
            "VX010.3 | (Variation 1) | User adds to bag from PDP: add-ons shown",
          event_segment: "VX010.3EV1H",
        },
      });
    }

    return addOnHtml;
  }

  function generateStars(rating) {
    const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

    // Create single star SVG with smaller size and gap
    const starSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 14 13" fill="none" stroke="none" style="display:inline-block; margin-right:2px;">
 <path d="M6.73002 0L8.89253 4.1L13.46 4.89L10.2275 8.2125L10.8875 12.8L6.73002 10.755L2.57001 12.8L3.23001 8.2125L0 4.89L4.56502 4.1L6.73002 0Z"/>
 </svg>`;

    const fiveStars = starSVG.repeat(5);

    return `
    <span class="addon-stars"
    aria-label="${rating} out of 5 stars"
    style="position:relative; display:inline-block; line-height:1; white-space:nowrap;">
    <span style="opacity:0.35;">${fiveStars.replace(/fill="none"/g, 'fill="#000"')}</span>
    <span style="position:absolute; top:0; left:0; overflow:hidden; width:${pct}%;">
    <span>${fiveStars.replace(/fill="none"/g, 'fill="#FF671F"')}</span>
    </span>
    </span>
    `;
  }

  // get main product price el from PDPs
  let mainProdPriceEl;

  elementReady(".main-product-price").then((el) => {
    mainProdPriceEl = el.cloneNode(true);
  });

  async function fetchProductPrice(productUrl) {
    try {
      const response = await fetch(productUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const priceElement = doc.querySelector(".main-product-price");
      if (priceElement) {
        return priceElement.cloneNode(true);
      }
    } catch (error) {
      console.error("Error fetching product price:", error);
    }
    return null;
  }

  async function showCartPopup(htmlContent, itemCount, totalPrice, atbBtn) {
    let atbNotificationEl = document.createElement("div");

    atbNotificationEl.setAttribute("role", "dialog");
    atbNotificationEl.setAttribute("aria-modal", "true");

    if (window.innerWidth < 768) {
      atbNotificationEl.className = "atb-notification";
    } else {
      atbNotificationEl.className =
        "atb-notification fixed right-0 flex w-[400px] lg:w-[600px] z-50 transition-all duration-300 ease-out translate-x-full";
    }

    atbNotificationEl.className =
      "atb-notification fixed bottom-0 left-0 right-0 flex w-full lg:hidden z-50";

    let addOnHtml;
    let prodAddOns = document.querySelector("#product-addons");
    if (prodAddOns) {
      addOnHtml = await getAddOns();
    } else if (!prodAddOns && !document.querySelector("#product-list")) {
      // console.log("VX010.3 | (Variation 1) | User adds to bag from PDP: no add-ons shown");
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "VX010.3 | Event Tracking",
          event_label:
            "VX010.3 | (Variation 1) | User adds to bag from PDP: no add-ons shown",
          event_segment: "VX010.3EV1I",
        },
      });
    }

    let pdpPageClass = document.querySelector(".product-main-full-width");
    let pdpPageClassOther = document.querySelector(".product-info-main");
    if (pdpPageClass || pdpPageClassOther) {
      // console.log("VX010.3 | (Variation 1) | User adds to bag from PDP");
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "VX010.3 | Event Tracking",
          event_label: "VX010.3 | (Variation 1) | User adds to bag from PDP",
          event_segment: "VX010.3EV1G",
        },
      });
    } else {
      // console.log("VX010.3 | (Variation 1) | User adds to bag from elsewhere (no add-ons shown)");
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          event_category: "Conversio CRO",
          event_action: "VX010.3 | Event Tracking",
          event_label:
            "VX010.3 | (Variation 1) | User adds to bag from elsewhere (no add-ons shown)",
          event_segment: "VX010.3EV1J",
        },
      });
    }

    let addOnSection = addOnHtml
      ? `
    <div class="add-on-container">
    <h3 class="add-on-cont-title">Complete your order with:</h3>
    <div class="add-on-items">
    ${addOnHtml}
    </div>
    </div>
    `
      : "";

    atbNotificationEl.innerHTML = `
    <div class="flex flex-col space-y-6 w-full h-full p-6 bg-white shadow-md">
    <div id="atb-notification-title" class="flex justify-between">
    <h3 class="text-xl">Added to basket</h3>
    <div class="text-right popup-close-btn">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="black" class="text-white" width="24" height="24" role="img">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
    <title>x</title></svg>
    </div>
    </div>
    <div>
    ${htmlContent}
    ${addOnSection}
    <div class="flex total-price">
    <span>Total: </span>
    <span class="price"> ${totalPrice}</span>
    </div>
    <div class="btn-group grid grid-cols-2 gap-6 lg:gap-12">
    <a href="https://www.vax.co.uk/checkout/cart/" class="action go-to-basket leading-4 lg:leading-6" style="background-color: #FF671F;">
    View Basket </a>
    <a href="https://www.vax.co.uk/checkout/" class="action go-to-checkout leading-4 lg:leading-6" style="background-color: #003366;">
    Checkout </a>
    </div>
    </div>
    <div class="payment-options text-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="196" height="27" viewBox="0 0 196 27" fill="none" stroke="none" class="mx-auto text-transparent" role="img">
    <g clip-path="url(#clip0_701_22187)">
    <rect x="0.164726" y="0.164726" width="39.6705" height="26.3372" rx="2.47089" fill="#1434CB"></rect>
    <rect x="0.164726" y="0.164726" width="39.6705" height="26.3372" rx="2.47089" stroke="#CCCCCC" stroke-width="0.329452"></rect>
    <path
    d="M27.082 8.7446C26.5894 8.54915 25.808 8.33334 24.8418 8.33334C22.3752 8.33334 20.6383 9.64865 20.6276 11.5291C20.6071 12.9166 21.8712 13.6872 22.8166 14.1498C23.783 14.6225 24.1115 14.931 24.1115 15.3524C24.1016 15.9995 23.3306 16.2978 22.6115 16.2978C21.6143 16.2978 21.08 16.1441 20.268 15.784L19.9391 15.6297L19.5896 17.7981C20.1754 18.065 21.2547 18.3018 22.3752 18.3122C24.996 18.3122 26.7022 17.0172 26.7224 15.0133C26.7324 13.9136 26.0649 13.071 24.6258 12.3825C23.7522 11.9405 23.2172 11.6425 23.2172 11.1903C23.2275 10.7792 23.6697 10.3581 24.6559 10.3581C25.4679 10.3374 26.0645 10.5326 26.5164 10.7279L26.7423 10.8305L27.082 8.7446Z"
    fill="white"
    ></path>
    <path d="M18.0276 18.1682H15.5299L17.0921 8.50844H19.5897L18.0276 18.1682Z" fill="white"></path>
    <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M33.4848 8.50844H31.5528C30.957 8.50844 30.5044 8.683 30.2474 9.30992L26.5373 18.1681H29.1581C29.1581 18.1681 29.5896 16.9758 29.6823 16.7191H32.8892C32.9609 17.0582 33.1872 18.1681 33.1872 18.1681H35.4998L33.4848 8.50844ZM30.4017 14.7461C30.6074 14.1912 31.3989 12.0434 31.3989 12.0434C31.3947 12.0516 31.4269 11.9624 31.4749 11.8294L31.4755 11.8277L31.4759 11.8267C31.5476 11.6279 31.654 11.3329 31.7275 11.1186L31.9021 11.9509C31.9021 11.9509 32.3751 14.2631 32.4778 14.7461H30.4017Z"
    fill="white"
    ></path>
    <path d="M13.4437 8.50844L10.9976 15.0955L10.7303 13.7596L10.7301 13.7587L9.8567 9.32044C9.71288 8.70349 9.27089 8.5288 8.7262 8.50844H4.70762L4.6665 8.70362C5.64662 8.95426 6.52325 9.31542 7.29135 9.76448L9.51757 18.158H12.1588L16.0848 8.50844H13.4437Z" fill="white"></path>
    <rect x="52.1931" y="0.193127" width="39.6137" height="26.2804" rx="2.8969" fill="white"></rect>
    <rect x="52.1931" y="0.193127" width="39.6137" height="26.2804" rx="2.8969" stroke="#CCCCCC" stroke-width="0.386254"></rect>
    <path
    d="M85.3332 13.2403C85.3332 17.7954 81.6479 21.4807 77.0928 21.4807C75.1701 21.4807 73.4076 20.8169 72.0113 19.7182C73.934 18.2074 75.1472 15.8727 75.1472 13.2403C75.1472 10.608 73.9112 8.27325 72.0113 6.76252C73.4076 5.66381 75.1701 5 77.0928 5C81.6479 5 85.3332 8.70816 85.3332 13.2403Z"
    fill="#F79E1B"
    ></path>
    <path d="M72.0113 6.76252C73.9112 8.27325 75.1472 10.608 75.1472 13.2403C75.1472 15.8727 73.934 18.2074 72.0113 19.7182L71.9883 19.7182C70.0885 18.2303 68.8525 15.8727 68.8525 13.2404C68.8525 10.6081 70.0885 8.2733 71.9884 6.76257L72.0113 6.76252Z" fill="#FF5F00"></path>
    <path
    d="M68.8525 13.2404C68.8525 10.6081 70.0885 8.2733 71.9884 6.76257C70.5921 5.66386 68.8296 5.00004 66.9068 5.00004C62.3518 5.00004 58.6665 8.6853 58.6665 13.2404C58.6665 17.7955 62.3518 21.4807 66.9068 21.4807C68.8296 21.4807 70.592 20.8169 71.9883 19.7182C70.0885 18.2303 68.8525 15.8727 68.8525 13.2404Z"
    fill="#EB001B"
    ></path>
    <rect x="104.153" y="0.153365" width="39.6933" height="26.3599" rx="2.30048" fill="white"></rect>
    <rect x="104.153" y="0.153365" width="39.6933" height="26.3599" rx="2.30048" stroke="#CCCCCC" stroke-width="0.306731"></rect>
    <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M115.409 17.1479H113.632C113.51 17.1479 113.406 17.2364 113.387 17.3564L112.668 21.9154C112.654 22.0053 112.724 22.0864 112.815 22.0864H113.664C113.785 22.0864 113.889 21.998 113.908 21.8777L114.102 20.6481C114.12 20.5277 114.224 20.4394 114.346 20.4394H114.908C116.08 20.4394 116.755 19.8726 116.932 18.7496C117.012 18.2583 116.935 17.8723 116.705 17.6018C116.453 17.3051 116.004 17.1479 115.409 17.1479ZM115.614 18.813C115.517 19.451 115.03 19.451 114.559 19.451H114.29L114.478 18.2595C114.49 18.1876 114.552 18.1345 114.625 18.1345H114.748C115.069 18.1345 115.372 18.1345 115.528 18.3175C115.621 18.4267 115.65 18.5889 115.614 18.813ZM120.724 18.7926H119.872C119.8 18.7926 119.737 18.8456 119.726 18.9177L119.688 19.1558L119.629 19.0695C119.445 18.802 119.034 18.7126 118.623 18.7126C117.682 18.7126 116.879 19.4251 116.722 20.4247C116.641 20.9232 116.757 21.4 117.04 21.7325C117.299 22.0382 117.67 22.1656 118.112 22.1656C118.87 22.1656 119.29 21.6781 119.29 21.6781L119.252 21.9148C119.238 22.0052 119.308 22.0863 119.398 22.0863H120.165C120.287 22.0863 120.39 21.9979 120.409 21.8776L120.87 18.9637C120.884 18.874 120.815 18.7926 120.724 18.7926ZM119.537 20.4496C119.455 20.936 119.069 21.2625 118.577 21.2625C118.329 21.2625 118.132 21.1832 118.005 21.033C117.879 20.8838 117.831 20.6713 117.871 20.4348C117.948 19.9525 118.341 19.6154 118.825 19.6154C119.067 19.6154 119.264 19.6957 119.393 19.8473C119.523 20.0004 119.574 20.2141 119.537 20.4496ZM124.402 18.7925H125.258C125.378 18.7925 125.448 18.9268 125.38 19.0251L122.534 23.1324C122.488 23.199 122.412 23.2385 122.331 23.2385H121.477C121.356 23.2385 121.286 23.1031 121.356 23.0046L122.242 21.7539L121.299 18.9884C121.267 18.8923 121.338 18.7925 121.44 18.7925H122.281C122.39 18.7925 122.486 18.8642 122.518 18.9687L123.018 20.639L124.198 18.9009C124.244 18.833 124.321 18.7925 124.402 18.7925Z"
    fill="#253B80"
    ></path>
    <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M133.678 21.9154L134.408 17.2732C134.419 17.2011 134.482 17.148 134.554 17.1478H135.376C135.466 17.1478 135.536 17.2291 135.522 17.3191L134.802 21.8778C134.783 21.9981 134.68 22.0865 134.558 22.0865H133.824C133.734 22.0865 133.664 22.0054 133.678 21.9154ZM128.091 17.148H126.312C126.191 17.148 126.088 17.2365 126.069 17.3565L125.35 21.9154C125.335 22.0054 125.405 22.0865 125.496 22.0865H126.408C126.493 22.0865 126.565 22.0247 126.579 21.9405L126.783 20.6482C126.801 20.5278 126.905 20.4395 127.027 20.4395H127.589C128.76 20.4395 129.436 19.8727 129.613 18.7497C129.693 18.2584 129.616 17.8724 129.386 17.6019C129.133 17.3051 128.686 17.148 128.091 17.148ZM128.296 18.8131C128.199 19.4511 127.711 19.4511 127.24 19.4511H126.972L127.16 18.2596C127.171 18.1877 127.233 18.1346 127.306 18.1346H127.429C127.75 18.1346 128.053 18.1346 128.21 18.3176C128.303 18.4268 128.331 18.589 128.296 18.8131ZM133.405 18.7927H132.554C132.481 18.7927 132.419 18.8457 132.408 18.9178L132.37 19.1559L132.31 19.0696C132.126 18.8021 131.715 18.7127 131.305 18.7127C130.364 18.7127 129.561 19.4252 129.404 20.4248C129.323 20.9233 129.438 21.4001 129.721 21.7326C129.981 22.0383 130.352 22.1657 130.794 22.1657C131.552 22.1657 131.972 21.6782 131.972 21.6782L131.934 21.9148C131.92 22.0053 131.989 22.0864 132.081 22.0864H132.847C132.969 22.0864 133.072 21.998 133.091 21.8777L133.551 18.9637C133.565 18.8741 133.496 18.7927 133.405 18.7927ZM132.218 20.4497C132.136 20.9361 131.75 21.2626 131.257 21.2626C131.011 21.2626 130.813 21.1833 130.686 21.033C130.56 20.8839 130.512 20.6714 130.552 20.4349C130.629 19.9526 131.021 19.6155 131.506 19.6155C131.748 19.6155 131.944 19.6958 132.074 19.8474C132.204 20.0005 132.256 20.2142 132.218 20.4497Z"
    fill="#179BD7"
    ></path>
    <path
    d="M128.585 6.53741C128.573 6.61222 128.559 6.68869 128.544 6.76726C128.027 9.42145 126.259 10.3384 124 10.3384H122.85C122.574 10.3384 122.341 10.539 122.298 10.8114L121.709 14.546L121.542 15.6045C121.514 15.7834 121.652 15.9447 121.833 15.9447H123.873C124.114 15.9447 124.319 15.7692 124.357 15.531L124.377 15.4273L124.761 12.99L124.786 12.8563C124.824 12.6173 125.029 12.4418 125.271 12.4418H125.576C127.552 12.4418 129.099 11.6394 129.552 9.31739C129.74 8.3474 129.643 7.53749 129.143 6.96786C128.992 6.7961 128.804 6.65359 128.585 6.53741Z"
    fill="#179BD7"
    ></path>
    <path
    d="M128.044 6.32194C127.965 6.29895 127.883 6.27805 127.8 6.25925C127.716 6.24086 127.63 6.22456 127.541 6.21036C127.231 6.1602 126.891 6.13638 126.527 6.13638H123.455C123.379 6.13638 123.307 6.15351 123.243 6.18444C123.101 6.25256 122.996 6.38672 122.97 6.55095L122.317 10.6908L122.298 10.8116C122.341 10.5391 122.574 10.3385 122.85 10.3385H124C126.259 10.3385 128.028 9.4212 128.544 6.76743C128.56 6.68887 128.573 6.61239 128.585 6.53759C128.454 6.46821 128.312 6.40887 128.16 6.35829C128.122 6.34576 128.083 6.33364 128.044 6.32194Z"
    fill="#222D65"
    ></path>
    <path
    d="M122.97 6.55088C122.995 6.38663 123.101 6.25249 123.242 6.18478C123.307 6.15385 123.379 6.13672 123.454 6.13672H126.527C126.891 6.13672 127.231 6.16054 127.541 6.21069C127.629 6.2249 127.715 6.2412 127.799 6.25958C127.883 6.2784 127.964 6.29929 128.044 6.32227C128.083 6.33398 128.122 6.34609 128.16 6.35822C128.312 6.40878 128.454 6.46855 128.585 6.5375C128.738 5.55665 128.583 4.88882 128.053 4.28409C127.468 3.61836 126.413 3.33334 125.063 3.33334H121.143C120.867 3.33334 120.632 3.53393 120.589 3.80684L118.956 14.1565C118.924 14.3613 119.082 14.5461 119.288 14.5461H121.709L122.316 10.6908L122.97 6.55088Z"
    fill="#253B80"
    ></path>
    <rect x="156.114" y="0.113604" width="39.7728" height="26.4395" rx="1.70406" fill="#FFB3C7"></rect>
    <rect x="156.114" y="0.113604" width="39.7728" height="26.4395" rx="1.70406" stroke="#CCCCCC" stroke-width="0.227208"></rect>
    <path d="M161.919 16.7693H160.333V9.66666H161.919V16.7693Z" fill="black"></path>
    <path
    d="M165.878 9.66666H164.326C164.326 10.9737 163.742 12.1734 162.723 12.9583L162.108 13.4314L164.489 16.7696H166.447L164.256 13.698C165.295 12.6348 165.878 11.2043 165.878 9.66666Z"
    fill="black"
    ></path>
    <path d="M168.407 16.7674H166.909V9.66802H168.407V16.7674Z" fill="black"></path>
    <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M172.931 11.8565V12.1706C172.527 11.8872 172.039 11.7207 171.513 11.7207C170.121 11.7207 168.992 12.8809 168.992 14.312C168.992 15.7432 170.121 16.9033 171.513 16.9033C172.039 16.9033 172.527 16.7368 172.931 16.4535V16.7674H174.361V11.8565H172.931ZM172.926 14.312C172.926 15.0099 172.346 15.5756 171.63 15.5756C170.915 15.5756 170.334 15.0099 170.334 14.312C170.334 13.6142 170.915 13.0486 171.63 13.0486C172.346 13.0486 172.926 13.6142 172.926 14.312Z"
    fill="black"
    ></path>
    <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M188.019 12.1706V11.8565H189.449V16.7674H188.019V16.4535C187.615 16.7368 187.127 16.9033 186.601 16.9033C185.209 16.9033 184.081 15.7432 184.081 14.312C184.081 12.8809 185.209 11.7207 186.601 11.7207C187.127 11.7207 187.615 11.8872 188.019 12.1706ZM186.719 15.5756C187.434 15.5756 188.014 15.0099 188.014 14.312C188.014 13.6142 187.434 13.0486 186.719 13.0486C186.003 13.0486 185.423 13.6142 185.423 14.312C185.423 15.0099 186.003 15.5756 186.719 15.5756Z"
    fill="black"
    ></path>
    <path
    d="M181.539 11.7244C180.968 11.7244 180.427 11.9067 180.066 12.4098V11.8567H178.642V16.7674H180.083V14.1867C180.083 13.4399 180.57 13.0742 181.157 13.0742C181.785 13.0742 182.147 13.4602 182.147 14.1765V16.7674H183.575V13.6444C183.575 12.5016 182.691 11.7244 181.539 11.7244Z"
    fill="black"
    ></path>
    <path
    d="M176.573 11.8565V12.4962C176.86 12.1125 177.394 11.8568 177.975 11.8568V13.2858C177.972 13.2858 177.97 13.2856 177.967 13.2855C177.964 13.2853 177.961 13.2852 177.958 13.2852C177.392 13.2852 176.577 13.701 176.577 14.4745V16.7674H175.109V11.8565H176.573Z"
    fill="black"
    ></path>
    <path d="M190.07 15.9482C190.07 15.4386 190.472 15.0255 190.967 15.0255C191.463 15.0255 191.865 15.4386 191.865 15.9482C191.865 16.4577 191.463 16.8709 190.967 16.8709C190.472 16.8709 190.07 16.4577 190.07 15.9482Z" fill="black"></path>
    </g>
    <defs>
    <clipPath id="clip0_701_22187">
    <rect width="196" height="26.6667" fill="white"></rect>
    </clipPath>
    </defs>
    <title>payment-options</title>
    </svg>
    </div>
    </div>
    `;

    document.body.appendChild(atbNotificationEl);

    // Fetch and replace prices for ALL cart items
    const cartItems = atbNotificationEl.querySelectorAll(".cart-item");

    for (const item of cartItems) {
      const productLink = item.querySelector('a[href*="/"]');
      const productUrl = productLink ? productLink.getAttribute("href") : null;

      if (productUrl) {
        const freshPriceElement = await fetchProductPrice(productUrl);
        if (freshPriceElement) {
          const existingPrice = item.querySelector(
            ".price-including-tax, .price-box, .small",
          );
          if (existingPrice) {
            existingPrice.replaceWith(freshPriceElement);
          }
        }
      }
    }

    createPageOverlay();
    // Trigger animation after a tiny delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        atbNotificationEl.classList.add("show");
      });
    });

    if (!document.querySelector("#layer-product-list")) {
      setSuccessState();
    } else {
      resetButtonState();
    }

    atbNotificationAdded = true;
  }

  // Function to create and toggle the overlay
  function createPageOverlay() {
    let overlay = document.getElementById("page-overlay");

    if (overlay) {
      overlay.classList.toggle("active");
      document.body.classList.toggle("overlay-active");
      return;
    }

    overlay = document.createElement("div");
    overlay.id = "page-overlay";
    overlay.className = "page-overlay active";

    document.body.appendChild(overlay);
    document.body.classList.add("overlay-active");
  }

  function hidePageOverlay() {
    const overlay = document.getElementById("page-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      document.body.classList.remove("overlay-active");
    }
  }

  function removeAtbNotification() {
    removePageOverlay();
    document.body.classList.remove("overlay-active");

    // console.log("VX010.3 | (Variation 1) | User dismisses ATB notification");
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        event_category: "Conversio CRO",
        event_action: "VX010.3 | Event Tracking",
        event_label:
          "VX010.3 | (Variation 1) | User dismisses ATB notification",
        event_segment: "VX010.3EV1M",
      },
    });

    let atbNotification = document.querySelector(".atb-notification");
    if (atbNotification) {
      atbNotification.classList.remove("show");
      setTimeout(() => {
        atbNotification.remove();
      }, 300); // Wait for animation to finish
    }
  }

  function removePageOverlay() {
    const overlay = document.getElementById("page-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  function preventRedirect(e, form, atbBtn) {
    e.preventDefault();
    e.stopImmediatePropagation();

    initATB(atbBtn);
    setLoadingState();

    const url = form.action;
    const data = new FormData(form);

    fetch(url, {
      method: form.method.toUpperCase(),
      credentials: "same-origin",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01",
      },
      body: data,
    })
      .then((res) => {
        // console.log("📊 Response status:", res.status);
        // console.log("📊 Response OK:", res.ok);

        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        const selectedAddons = getSelectedAddons();

        if (json.preBasketUrl) {
          // MAIN product redirect to atb notification page
          const cartUrl = buildCartUrlWithAddons(
            json.preBasketUrl,
            selectedAddons,
          );
          fetchAndShowCartContent(cartUrl, atbBtn);
        } else if (json.backUrl) {
          // ACCESSORIES ATB redirect goes to cart page not ATB notification page like for the main products
          // for unsuccessful ATB clicks (qyt exceeded)
          if (json.backUrl === window.location.href) {
            resetButtonState();
          } else {
            // successful ATB clicks
            // get prodict title and find the item in the cart
            // there are 2x diff pdp structures, one has the .product-main-full-width class, the other has .product-info-main class
            let itemTitle;
            let pdpPageMain = atbBtn.closest(".product-main-full-width");
            let pdpPageOther = atbBtn.closest(".product-info-main");
            if (pdpPageMain) {
              itemTitle = pdpPageMain
                .querySelector(".page-title")
                .textContent.trim();

              fetchAndShowCartContent(json.backUrl, atbBtn, itemTitle);
            } else if (pdpPageOther) {
              itemTitle = pdpPageOther
                .closest(".page-main")
                .querySelector(".page-title")
                .textContent.trim();

              fetchAndShowCartContent(json.backUrl, atbBtn, itemTitle);
            } else {
              // get prod title if item added from PLP
              let prodForm = atbBtn.closest("form");
              itemTitle = prodForm.querySelector("h4").textContent.trim();
              fetchAndShowCartContent(json.backUrl, atbBtn, itemTitle);
            }
          }
        } else {
          resetButtonState();
          return;
        }

        if (typeof dataLayerParams !== "undefined" && dataLayerParams.items) {
          dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
              items: dataLayerParams.items.map((item) => ({
                item_id: item.item_id,
                item_name: item.item_name,
                price: item.price,
                quantity: item.quantity || 1,
                item_category: item.item_category,
              })),
            },
          });
        } else {
          let itemEl = e.target.closest("[data-product-sku]");
          let itemId = itemEl ? itemEl.getAttribute("data-product-sku") : null;
          let itemTitle = itemEl.querySelector("h4 span")?.textContent || null;
          let priceElement = itemEl.querySelector(
            ".current-price [data-price-amount]",
          );
          let price = priceElement
            ? parseFloat(priceElement.getAttribute("data-price-amount"))
            : 0;
          const pathParts = window.location.pathname.split("/").filter(Boolean);
          let itemCategory = pathParts[pathParts.length - 1] || "";
          itemCategory = itemCategory
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
              items: [
                {
                  item_id: itemId,
                  item_name: itemTitle,
                  price: price,
                  quantity: 1,
                  item_category: itemCategory,
                },
              ],
            },
          });
        }

        window.dispatchEvent(new CustomEvent("reload-customer-section-data"));
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        resetButtonState();
        window.location.reload();
      });
  }

  async function addAddonToCart(addonName) {
    let product = vaxAddOns.find((p) => p.name === addonName);
    let productId = product.productId;

    if (!product || !productId) {
      console.error("Add-on not found:", addonName);
      return;
    }

    const currentUrl = window.location.href;
    const encodedReturn = btoa(currentUrl);

    // Get form_key from page
    const formKeyInput = document.querySelector('input[name="form_key"]');
    const formKey = formKeyInput ? formKeyInput.value : "";

    if (!formKey) {
      console.error("Form key not found!");
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("form_key", formKey);
    formData.append("product", productId);
    formData.append("qty", "1");

    const url = `/checkout/cart/add/uenc/${encodedReturn}/product/${productId}/`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const responseText = await response.text();

      if (response.ok) {
        setSuccessState();

        // Trigger customer section reload
        window.dispatchEvent(new CustomEvent("reload-customer-section-data"));

        // DataLayer tracking for GA4
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
              items: [
                {
                  item_name: addonName,
                  item_id: productId,
                  price: 0,
                  quantity: 1,
                  item_category: "Add-on",
                },
              ],
            },
          });
        }
      } else {
        console.error("❌ Failed to add add-on:", response.status);
        resetButtonState();
      }
    } catch (error) {
      console.error("❌ Error adding add-on:", error);
    }
  }

  // EVENTS
  elementReady("#html-body").then((main) => {
    if (!main.classList.contains("test-vax")) {
      main.addEventListener(
        "click",
        (e) => {
          main.classList.add("test-vax");

          if (e.target.closest(".popup-close-btn")) {
            removeAtbNotification();
          }

          // ADD-ON ATB
          if (e.target.closest(".add-on-add-to-cart-btn")) {
            event.preventDefault();
            event.stopPropagation();

            let atbBtn = e.target.closest(".add-on-add-to-cart-btn");
            let addonName = atbBtn
              .closest(".add-on-item")
              ?.querySelector(".add-on-item-title").textContent;

            atbBtn.disabled = true;
            initATB(atbBtn);
            setLoadingState();
            addAddonToCart(addonName);
            setTimeout(() => {
              // console.log("VX010.3 | (Variation 1) | User ATB add-on product in ATB notification");
              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: "VX010.3 | Event Tracking",
                  event_label:
                    "VX010.3 | (Variation 1) | User ATB add-on product in ATB notification",
                  event_segment: "VX010.3EV1P",
                },
              });
            }, 1000);

            return;
          }

          if (
            e.target.closest(".add-to-basket") &&
            !e.target.closest(".product_addtocart_form.cross-sell-cart-form")
          ) {
            let form;
            if (e.target.closest(".order-2")) {
              form = e.target.closest(".order-2").querySelector("form");
            } else if (e.target.closest("form")) {
              form = e.target.closest("form");
            } else {
              let mainPdpForm = document.querySelector(
                "#product_addtocart_form",
              );
              //window.scrollTo(0, 0);
              form = mainPdpForm;
            }
            let atbBtn = e.target.closest(".add-to-basket");
            if (form && !atbBtn.disabled) {
              preventRedirect(e, form, atbBtn);
              // console.log("VX010.3 | (Variation 1) | User adds to bag");
              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: "VX010.3 | Event Tracking",
                  event_label: "VX010.3 | (Variation 1) | User adds to bag",
                  event_segment: "VX010.3EV1Q",
                },
              });
            }
            return;
          }

          // close atb notification if user clicked anywhere else on the page
          if (
            !e.target.closest(".atb-notification") &&
            atbNotificationAdded === true
          ) {
            if (document.querySelector(".atb-notification")) {
              removeAtbNotification();
              atbNotificationAdded = false;
            }
          }

          // click on main item (in the notification)
          if (e.target.closest(".atb-notification .cart-item")) {
            // console.log("VX010.3 | (Variation 1) | User clicks on main product in ATB notification");
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "VX010.3 | Event Tracking",
                event_label:
                  "VX010.3 | (Variation 1) | User clicks on main product in ATB notification",
                event_segment: "VX010.3EV1K",
              },
            });
          }

          // User clicks 'View Basket' in ATB notification
          if (e.target.closest(".atb-notification .go-to-basket")) {
            // console.log("VX010.3 | (Variation 1) | User clicks 'View Basket' in ATB notification");
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "VX010.3 | Event Tracking",
                event_label:
                  "VX010.3 | (Variation 1) | User clicks 'View Basket' in ATB notification",
                event_segment: "VX010.3EV1L",
              },
            });
          }

          // User clicks 'Checkout' in ATB notification
          if (
            e.target.closest(
              '.atb-notification [href="https://www.vax.co.uk/checkout/"]',
            )
          ) {
            // console.log("VX010.3 | (Variation 1) | User clicks 'Checkout' in ATB notification");
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "VX010.3 | Event Tracking",
                event_label:
                  "VX010.3 | (Variation 1) | User clicks 'Checkout' in ATB notification ",
                event_segment: "VX010.3EV1N",
              },
            });
          }

          // User clicks on add-on product in ATB notification
          if (e.target.closest(".add-on-item")) {
            // console.log("VX010.3 | (Variation 1) | User clicks on add-on product in ATB notification");
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "VX010.3 | Event Tracking",
                event_label:
                  "VX010.3 | (Variation 1) | User clicks on add-on product in ATB notification",
                event_segment: "VX010.3EV1O",
              },
            });
          }
        },
        true,
      );
    }
  });

  let lastTrustedClick = null;

  // capture trusted clicks globally
  document.addEventListener(
    "click",
    (e) => {
      if (e.isTrusted) {
        lastTrustedClick = e.target;
      }
    },
    true,
  );

  async function miniBagClicks() {
    const cartDrawer = await elementReady(
      "div[role='dialog'][aria-labelledby='cart-drawer-title']",
    );

    if (!cartDrawer) return;

    const isOpen = (el) => window.getComputedStyle(el).display !== "none";
    let wasOpen = isOpen(cartDrawer);

    const observer = new MutationObserver(() => {
      const nowOpen = isOpen(cartDrawer);

      if (nowOpen && !wasOpen) {
        const openedFromCartDrawerItself =
          lastTrustedClick && cartDrawer.contains(lastTrustedClick);
        const openedFromAtbNotification =
          lastTrustedClick && lastTrustedClick.closest(".atb-notification");
        const openedFromOverlay =
          lastTrustedClick && lastTrustedClick.closest("#page-overlay");

        const openedFromInside =
          openedFromCartDrawerItself ||
          openedFromAtbNotification ||
          openedFromOverlay;

        if (lastTrustedClick && !openedFromInside) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "VX010.3 | Event Tracking",
              event_label:
                "VX010.3 | (Variation 1) | Clicks sitewide cart icon",
              event_segment: "VX010.3EV1T",
            },
          });
        }

        setTimeout(() => {
          const viewBasketBtn = cartDrawer.querySelector(
            ".action.go-to-basket",
          );
          const checkoutBtn = cartDrawer.querySelector(
            ".action.go-to-checkout",
          );

          if (viewBasketBtn && !viewBasketBtn._boundConversio) {
            viewBasketBtn._boundConversio = true;
            viewBasketBtn.addEventListener("click", (e) => {
              if (!e.isTrusted) return;

              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: "VX010.3 | Event Tracking",
                  event_label:
                    "VX010.3 | (Variation 1) | Clicks 'view basket' in sitewide cart icon",
                  event_segment: "VX010.3EV1U",
                },
              });
            });
          }

          if (checkoutBtn && !checkoutBtn._boundConversio) {
            checkoutBtn._boundConversio = true;
            checkoutBtn.addEventListener("click", (e) => {
              if (!e.isTrusted) return;

              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: "VX010.3 | Event Tracking",
                  event_label:
                    "VX010.3 | (Variation 1) | Clicks 'checkout' in sitewide cart icon",
                  event_segment: "VX010.3EV1V",
                },
              });
            });
          }
        }, 1000);
      }

      wasOpen = nowOpen;
    });

    observer.observe(cartDrawer, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  miniBagClicks();
} else {
  // desktop code
  function elementReady(selector) {
    return new Promise((resolve) => {
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

  // Add-ons data array (copy from mobile)
  const vaxAddOns = [
    {
      name: "VAX Hard Floor Antibacterial Cleaning Solution 4L",
      sku: "1-9-142097",
      url: "https://www.vax.co.uk/onepwr-solution-4l",
      productId: "11556",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/NEW%20-%20Solutions/Hard%20Floor%20Cleaning%20Solution%204L%20-%201-9-143316/VAXUK4335_PNG-_Product_Card_-_VAX_OP_Multifloor_Solution_4L.png",
      rating: 4.6,
    },
    {
      name: "VAX Hard Floor Antibacterial Cleaning Solution 1L",
      sku: "1-9-142276",
      url: "https://www.vax.co.uk/onepwr-solution-1l",
      productId: "11643",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/NEW%20-%20Solutions/1L%20Hard%20Floor%20Cleaning%20Solution%201-9-142276/VAXUK4335_-_Product_Card_-_VAX_OP_PNG_Multifloor_Solution_1L.png",
      rating: 4.6,
    },
    {
      name: "VAX ONEPWR™ 4.0Ah Battery and 1.5A Charger Kit",
      sku: "battery-bundle-3",
      url: "https://www.vax.co.uk/vax-onepwr-battery-and-slide-charger-kit",
      productId: "14790",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Batteries/Slider_Charger_01_direct_72DPI_880x880_rko6kd.png",
      rating: 4.8,
    },
    {
      name: "VAX Original Carpet Cleaning Solution 1.5L",
      sku: "1-9-142055",
      url: "https://www.vax.co.uk/original-carpet-cleaning-solution-1-5l",
      productId: "11301",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Original_Rose_Burst_Solution_1.5L_01_direct_72DPI_880x88_drpdwu.jpg?_i=AB",
      rating: 4.9,
    },
    {
      name: "VAX ONEPWR™ 4.0Ah Dual Battery + Dual Bay Charger Kit",
      sku: "battery-bundle-2",
      url: "https://www.vax.co.uk/vax-onepwr-dual-battery-and-dual-bay-charger-kit",
      productId: "14789",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/media/catalog/product/d/u/dual-bay-charger-feature-01_1.jpg?_i=AB",
      rating: 4.4,
    },
    {
      name: "VAX HomePro Sponge Filter and Frame",
      sku: "1-7-143201",
      url: "https://www.vax.co.uk/vax-homepro-sponge-filter-and-frame",
      productId: "14939",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Spares/ONEPWR%20HomePro/SPARES_VAX_HomePro_Pre_Motor_Filter_3Q.jpg",
      rating: 4.5,
    },
    {
      name: "VAX SpotWash Spot Cleaning Oxy-Lift Boost Solution 1L",
      sku: "1-9-143111",
      url: "https://www.vax.co.uk/vax-spotwash-spot-cleaning-oxy-lift-boost-solution-1l",
      productId: "14753",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Solutions/Spotwash_OxyLift_Rose_Burst_1L_01_direct_72DPI_880x880_h5h90a.png",
      rating: 4.8,
    },
    {
      name: "Pet Stain & Odour Remover Pre-Treatment Solution 1 Litre Refill",
      sku: "1-9-142879",
      url: "https://www.vax.co.uk/pet-stain-odour-remover-pre-treatment-solution-1litre",
      productId: "14481",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Pet_Stain_Odour_Remover_Pre_Treatment_Solution_1L_Refill_01_direct_72DPI_880x880_jcmv8t.jpg",
      rating: 4.8,
    },
    {
      name: "VAX ONEPWR™ 4.0Ah Dual Battery Kit",
      sku: "battery-bundle-1",
      url: "https://www.vax.co.uk/vax-onepwr-dual-battery-kit",
      productId: "14788",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Batteries/Dual_Battery_01_direct_72DPI_880x880_xtmqzh.png",
      rating: 4.9,
    },
    {
      name: "VAX Spring Fresh Steam Detergent 1L",
      sku: "1-9-132807-01",
      url: "https://www.vax.co.uk/vax-spring-fresh-steam-detergent-1l-1",
      productId: "9881",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Steam_Spring_Fresh_Solution_1L_01_direct_72DPI_880x88_bzgcwk.jpg",
      rating: 4.8,
    },
    {
      name: "VAX Citrus Burst Steam Detergent 1L",
      sku: "1-9-132666-01",
      url: "https://www.vax.co.uk/citrus-burst-steam-detergent-1l",
      productId: "5062",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Steam_Citrus_Burst_Solution_1L_01_direct_72DPI_880x88_movni9.jpg?_i=AB",
      rating: 4.4,
    },
    {
      name: "VAX Pet Steam Detergent (Apple Burst) 1L",
      sku: "1-9-132813-01",
      url: "https://www.vax.co.uk/pet-steam-detergent-apple-blossom-1l",
      productId: "9826",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Steam_Pet_Apple_Blossom_Solution_1L_01_direct_72DPI_880x880_wmocns.jpg",
      rating: 4.7,
    },
    {
      name: "Vax Microfibre Cleaning Pads x2 (Type 1)",
      sku: "1-1-131448-00",
      url: "https://www.vax.co.uk/1-1-131448-00-microfibre-pads",
      productId: "1935",
      imageUrl:
        "https://www.vax.co.uk/media/catalog/product/s/2/s2st-bundle_microfibrepads.jpg",
      rating: 4.2,
    },
    {
      name: "VAX Platinum Professional Carpet Cleaning Solution 4L",
      sku: "1-9-142060",
      url: "https://www.vax.co.uk/vax-platinum-professional-carpet-cleaning-solution-4l",
      productId: "11285",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/media/catalog/product/p/l/platinum_4l_hero_500px.jpg",
      rating: 4.8,
    },
    {
      name: "VAX Platinum Professional Carpet Cleaning Solution 1.5L",
      sku: "1-9-139136",
      url: "https://www.vax.co.uk/platinum-carpet-cleaning-solution-1-5l",
      productId: "11127",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Platinum_Professional_Rose_Burst_1.5L_01_direct_72DPI_880x88_ocukgm.jpg",
      rating: 4.8,
    },
    {
      name: "VAX Platinum Antibacterial Carpet Cleaning Solution 1.5L",
      sku: "1-9-142404",
      url: "https://www.vax.co.uk/vax-platinum-antibacterial-carpet-cleaning-solution-1-5l",
      productId: "14061",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Platinum_Antibac_Citrus_Burst_1.5L_01_direct_72DPI_880x88_bmazhd.jpg",
      rating: 4.9,
    },
    {
      name: "VAX Platinum Antibacterial Carpet Cleaning Solution 4L",
      sku: "1-9-142405",
      url: "https://www.vax.co.uk/vax-platinum-antibacterial-carpet-cleaning-solution-4l",
      productId: "14062",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/Product%20Web%20Assets/Solutions/Platinum_Antibac_Citrus_Burst_4L_01_direct_72DPI_880x88_b6ivyf.jpg",
      rating: 4.8,
    },
    {
      name: "VAX 4.0Ah ONEPWR™ Battery",
      sku: "1-1-142920",
      url: "https://www.vax.co.uk/vax-onepwr-4ah-battery",
      productId: "14575",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Batteries/4.0Ah_ONEPWR_Battery_GEN_2_01_direct_72DPI_880x880_mxzqm9.png",
      rating: 4.6,
    },
    {
      name: "Vax SpotWash Spot Cleaning Solution 1L",
      sku: "1-9-143091",
      url: "https://www.vax.co.uk/vax-spotwash-spot-cleaning-solution-1l",
      productId: "14755",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Solutions/Spotwash_Original_Solution_Rose_Burst_1L_01_direct_72DPI_880x880_gxgfyn.png",
      rating: 4.8,
    },
    {
      name: "VAX Spot Cleaner Car Cleaning Toolkit",
      sku: "1-9-143308",
      url: "https://www.vax.co.uk/vax-spot-cleaner-car-cleaning-tool-kit",
      productId: "15011",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/Tool%20Kit%20-%20Spot%20Cleaner%20Car%20Cleaning%20Tool%20Kit/VAXUK4163-Toolkit-SpotwashCarKit-880x880.png",
      rating: 4.3,
    },
    {
      name: "VAX SpotWash Spot Cleaning Solutions Bundle",
      sku: "1-1-142893",
      url: "https://www.vax.co.uk/vax-spotwash-spot-cleaning-solutions-bundle",
      productId: "14484",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Solutions/SpotWash-Solutions-BundleImage-880x880_2x.png?_i=AB",
      rating: 4.8,
    },
    {
      name: "VAX SpotWash Spot Cleaning Solutions Kit",
      sku: "1-9-143093",
      url: "https://www.vax.co.uk/vax-spot-washing-solutions-kit",
      productId: "14742",
      imageUrl:
        "https://ik.imagekit.io/bupk9kgio/image/upload/w_1024,c_scale/c_scale,dpr_2.0,f_auto,q_auto/v1/AA%20-%20HomePro%20Web%20Updates/AA%20-%20Homepro%20Thumbnails/Solutions/SpotWash-Solutions-BundleImage-880x880_2x.png?_i=AB",
      rating: 4.8,
    },
    {
      name: "Vax Blade 4 Filter",
      sku: "1-7-142167",
      url: "https://www.vax.co.uk/black-filter-high-rated-blade-3-max",
      productId: "11443",
      imageUrl:
        "https://ik.vax.co.uk/tr:c-at_max:w-960/media/catalog/product/1/-/1-7-142167_black_filter_blade_plan_view.jpg",
      rating: 4.3,
    },
    {
      name: "VAX SpotWash Spot Cleaning Antibacterial Solution 1.5L",
      sku: "1-9-143105",
      url: "https://www.vax.co.uk/solutions/vax-spotwash-spot-cleaning-antibacterial-solution-1-5l",
      productId: "14774",
      imageUrl:
        "https://ik.vax.co.uk/tr:cm-pad_resize:w-392:h-392/media/catalog/product/c/l/cld_6718ca46c0c65_Spotwash_Antibac_Solution_Citrus_Burst_1L_01_direct_72DPI_880x880_ixpwkm.png",
      rating: 5.0,
    },
    {
      name: "VAX SpotWash Spot Cleaning Antibacterial Solution 1L",
      sku: "1-9-143107 ",
      url: "https://www.vax.co.uk/carpet-cleaners-and-washers/spot-cleaners/vax-spotwash-solution-range/vax-spotwash-spot-cleaning-antibacterial-solution-1l",
      productId: "14773",
      imageUrl:
        "https://ik.vax.co.uk/media/catalog/product/c/l/cld_6718ca46c0c65_Spotwash_Antibac_Solution_Citrus_Burst_1L_01_direct_72DPI_880x880_ixpwkm.png",
      rating: 4.8,
    },
    {
      name: "VAX Pace Vacuum Filter",
      sku: "1-3-142701",
      url: "https://www.vax.co.uk/spares-and-solutions/filter-1-3-142701",
      productId: "14177",
      imageUrl:
        "https://ik.vax.co.uk/tr:c-at_max:w-1280/media/catalog/product/f/i/filter_1_6.jpg",
      rating: 4.8,
    },
  ];

  // Helper function to generate star ratings
  function generateStars(rating) {
    const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

    const starSVG = `
	  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 14 13" fill="none" stroke="none" style="display:inline-block; margin-right:2px;">
			<path d="M6.73002 0L8.89253 4.1L13.46 4.89L10.2275 8.2125L10.8875 12.8L6.73002 10.755L2.57001 12.8L3.23001 8.2125L0 4.89L4.56502 4.1L6.73002 0Z"/>
		</svg>
	`;

    const fiveStars = starSVG.repeat(5);

    return `
		<span
		  class="addon-stars"
		  aria-label="${rating} out of 5 stars"
		  style="position: relative; display: inline-block; line-height: 1; white-space: nowrap;"
		>
		  <span style="opacity: 0.35">${fiveStars.replace(/fill="none"/g, 'fill="#000"')}</span>
		  <span style="position:absolute; top:0; left:0; overflow:hidden; width:${pct}%;">
		    <span>${fiveStars.replace(/fill="none"/g, 'fill="#FF671F"')}</span>
		  </span>
		</span>
    `;
  }

  // Function to get add-ons HTML
  async function getAddOns() {
    console.log("🔍 getAddOns() called");
    let addOnHtml = "";

    // Check if the add-ons container exists on the page
    const container = document.querySelector(
      "#dropdown-container-top-picks-with-your-purchase",
    );
    console.log("📦 Add-ons container found?", container);

    let addOns = await allElementsReady(
      "#dropdown-container-top-picks-with-your-purchase .addon-option .addon-name",
    );

    console.log("🔍 Found add-on elements:", addOns.length);

    let preSelectedAddOns = await getSelectedAddons();
    console.log("📋 Pre-selected add-ons:", preSelectedAddOns);

    let selectedSkus;
    if (preSelectedAddOns.length > 0) {
      selectedSkus = preSelectedAddOns.map((addon) => addon.sku);
      console.log("🎯 Selected SKUs to filter out:", selectedSkus);
    }

    addOns.forEach((addOn, index) => {
      let title = addOn.textContent.trim();
      console.log(`📝 Add-on ${index + 1}: "${title}"`);

      let item = addOn.closest("label");
      let savingPrice = item.querySelector(".price-box .saving-price");
      let currPrice = item.querySelector(".price-box .current-price");

      console.log(
        `  💰 Prices - Saving: ${savingPrice?.textContent}, Current: ${currPrice?.textContent}`,
      );

      // Find matching product in data
      let product = vaxAddOns.find((p) => p.name === title);
      console.log(`  🏷️ Product found in vaxAddOns?`, product ? "YES" : "NO");

      // Skip if this add-on was already selected on PDP
      if (product && selectedSkus && selectedSkus.includes(product.sku)) {
        console.log(`  ⏭️ Skipping ${title} - already selected`);
        return; // Skip this iteration
      }

      if (product) {
        console.log(`  ✅ Adding ${title} to HTML`);
        addOnHtml += `
 <a href="${product.url}" class="add-on-item">
 <img src="${product.imageUrl}" alt="${product.name}" class="add-on-image">
 <div class="add-on-details">
 <h3 class="add-on-item-title">${product.name}</h3>
 <div class="add-on-rating">
 ${generateStars(product.rating)}
 </div>
 <div class="add-on-price">
 ${savingPrice && savingPrice.textContent ? `<span class="add-on-saving-price">${savingPrice.textContent}</span>` : ""}
 <span class="current-price">${currPrice.textContent}</span>
 </div>
 </div>
 <button class="add-on-add-to-cart-btn" data-product-id="${product.productId}">
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 18" fill="none" stroke="none" class="h-auto w-5 md:w-6 pointer-events-none" role="img">
 <g clip-path="url(#clip0_1555_2892)">
 <path d="M3.53086 -0.00012207C3.82512 -0.00012207 4.05293 0.181636 4.11094 0.437573L4.26562 1.12488H19.7977C20.5113 1.12488 21.0809 1.83679 20.8805 2.55433L19.65 6.92214C19.2879 6.83425 18.9117 6.78152 18.5285 6.76043L19.7977 2.24988H4.52227L6.02695 8.99988H13.4133C13.1285 9.34441 12.8789 9.7241 12.675 10.1249H6.31172L6.825 12.3749H12.0246C12.007 12.5612 12 12.7475 12 12.9374C12 13.1272 12.007 13.3135 12.0246 13.4999H6.375C6.11133 13.4999 5.88633 13.3171 5.82656 13.0604L3.11355 1.12488H1.3125C1.00186 1.12488 0.75 0.873159 0.75 0.562378C0.75 0.251737 1.00186 -0.000111523 1.3125 -0.000111523L3.53086 -0.00012207ZM5.21836 16.0311C5.21836 14.9448 6.13242 14.0624 7.18711 14.0624C8.30508 14.0624 9.15586 14.9448 9.15586 16.0311C9.15586 17.1175 8.30508 17.9999 7.18711 17.9999C6.13242 17.9999 5.21836 17.1175 5.21836 16.0311ZM7.18711 16.8749C7.68633 16.8749 8.03086 16.4987 8.03086 16.0311C8.03086 15.5635 7.68633 15.1874 7.18711 15.1874C6.75117 15.1874 6.34336 15.5635 6.34336 16.0311C6.34336 16.4987 6.75117 16.8749 7.18711 16.8749ZM18.75 12.3432H20.4375C20.7469 12.3432 21 12.628 21 12.9057C21 13.2468 20.7469 13.4682 20.4375 13.4682H18.75V15.1557C18.75 15.4968 18.4969 15.7182 18.1875 15.7182C17.8781 15.7182 17.625 15.4968 17.625 15.1557V13.4682H15.9375C15.6281 13.4682 15.375 13.2468 15.375 12.9057C15.375 12.628 15.6281 12.3432 15.9375 12.3432H17.625V10.6557C17.625 10.378 17.8781 10.0932 18.1875 10.0932C18.4969 10.0932 18.75 10.378 18.75 10.6557V12.3432ZM23.25 12.9374C23.25 15.7323 20.9824 17.9999 18.1875 17.9999C15.3926 17.9999 13.125 15.7323 13.125 12.9374C13.125 10.1425 15.3926 7.87488 18.1875 7.87488C20.9824 7.87488 23.25 10.1425 23.25 12.9374ZM18.1875 8.99988C16.0113 8.99988 14.25 10.7612 14.25 12.9374C14.25 15.1136 16.0113 16.8749 18.1875 16.8749C20.3637 16.8749 22.125 15.1136 22.125 12.9374C22.125 10.7612 20.3637 8.99988 18.1875 8.99988Z" fill="white"></path>
 </g>
 <defs>
 <clipPath id="clip0_1555_2892">
 <rect width="22.5" height="18" fill="white" transform="translate(0.75 -0.00012207)"></rect>
 </clipPath>
 </defs>
 </svg>
 </button>
 </a>
 `;
      } else {
        console.log(`  ❌ No matching product found for "${title}"`);
      }
    });

    console.log("📊 Final addOnHtml length:", addOnHtml.length);
    console.log(
      "🎨 First 200 chars of addOnHtml:",
      addOnHtml.substring(0, 200),
    );

    return addOnHtml;
  }

  // Function to add add-on to cart
  async function addAddonToCart(addonName) {
    let product = vaxAddOns.find((p) => p.name === addonName);
    let productId = product.productId;

    if (!product || !productId) {
      console.error("Add-on not found:", addonName);
      return;
    }

    const currentUrl = window.location.href;
    const encodedReturn = btoa(currentUrl);

    const formKeyInput = document.querySelector('input[name="form_key"]');
    const formKey = formKeyInput ? formKeyInput.value : "";

    if (!formKey) {
      console.error("Form key not found!");
      return;
    }

    const formData = new FormData();
    formData.append("form_key", formKey);
    formData.append("product", productId);
    formData.append("qty", "1");

    const url = `/checkout/cart/add/uenc/${encodedReturn}/product/${productId}/`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      const responseText = await response.text();

      if (response.ok) {
        setSuccessState();

        window.dispatchEvent(new CustomEvent("reload-customer-section-data"));

        if (window.dataLayer) {
          window.dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
              items: [
                {
                  item_name: addonName,
                  item_id: productId,
                  price: 0,
                  quantity: 1,
                  item_category: "Add-on",
                },
              ],
            },
          });
        }
      } else {
        console.error("Failed to add add-on:", response.status);
        resetButtonState();
      }
    } catch (error) {
      console.error("Error adding add-on:", error);
    }
  }

  let button = null;
  let buttonText = null;
  let originalText = "";
  let atbNotificationAdded = false;
  let orgiginalBtnHtml = "";

  function initATB(buttonSelector) {
    if (buttonSelector.querySelector(".block")) {
      let textEl = buttonSelector.querySelector(".block");
      originalText = textEl.textContent;
      orgiginalBtnHtml = buttonSelector.innerHTML;
    } else if (document.querySelector("#layer-product-list")) {
      originalText = "";
      orgiginalBtnHtml = buttonSelector.innerHTML;
    } else {
      originalText = buttonSelector.textContent;
    }

    buttonSelector.innerHTML = `
 <span class="spinner"></span>
 <span class="button-text">${originalText}</span>
 `;
    button = buttonSelector;
    button.classList.add("atb-button");
    buttonText = document.querySelector(".button-text");
  }

  // Set button to loading state
  function setLoadingState() {
    button.disabled = true;
    button.classList.add("loading");
    button.classList.remove("success");

    // PLP page
    if (document.querySelector("#layer-product-list")) {
      buttonText.textContent = null;
    } else {
      buttonText.textContent = "Adding";
    }
  }

  // Set button to success state
  function setSuccessState() {
    button.classList.remove("loading");
    button.classList.add("success");

    // PLP page
    if (document.querySelector("#layer-product-list")) {
      buttonText.textContent = "";
    } else {
      buttonText.textContent = "Added";
    }
  }

  // Reset button to original state
  function resetButtonState() {
    button.disabled = false;
    button.classList.remove("loading", "success");
    button.style.backgroundColor = "";
    if (orgiginalBtnHtml) {
      button.innerHTML = orgiginalBtnHtml;
    } else {
      buttonText.textContent = originalText;
    }
  }

  // New function to get selected add-ons from Alpine.js
  function getSelectedAddons() {
    try {
      const productAddonsEl = document.querySelector(
        '[x-data*="productAddons"]',
      );
      if (productAddonsEl && productAddonsEl._x_dataStack) {
        const alpineData = productAddonsEl._x_dataStack[0];
        if (alpineData && alpineData.getSelectedAddons) {
          return alpineData.getSelectedAddons();
        }
      }
    } catch (error) {
      console.error("Error getting selected add-ons:", error);
      return [];
    }
  }

  // Enhanced function to build URL with add-ons
  function buildCartUrlWithAddons(baseUrl, selectedAddons) {
    if (!selectedAddons || selectedAddons.length === 0) {
      return baseUrl;
    }

    // Extract product_id from base URL
    const productIdMatch = baseUrl.match(/product_id\/(\d+)/);
    if (!productIdMatch) {
      return baseUrl;
    }

    const productId = productIdMatch[1];
    const addonSkus = selectedAddons.map((addon) => addon.sku).join(",");

    // Build the URL with add-ons
    return `https://www.vax.co.uk/checkout/cart/added/product_id/${productId}/product_add_on_sku/${encodeURIComponent(addonSkus)}`;
  }

  async function fetchAndShowCartContent(url) {
    try {
      const response = await fetch(url, {
        credentials: "same-origin",
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Get the first current price from the cart
      const firstPrice = doc.querySelector(".current-price .price");
      let totalPrice = firstPrice ? firstPrice.textContent.trim() : "";

      console.log("💰 First price in cart:", totalPrice);

      // For accessories ATB page
      if (url === "https://www.vax.co.uk/checkout/cart/") {
        const targetElement = doc.querySelector(".cart-item:last-of-type");

        if (targetElement) {
          let pageWrapper = document.querySelector(".page-wrapper");
          pageWrapper?.classList.add("accessories-item");

          let itemCount = 1;
          showCartPopup(targetElement.outerHTML, itemCount, totalPrice);
        }
      } else {
        const targetElement = doc.querySelector(
          "#maincontent .grid.grid-cols-1 div .md\\:overflow-hidden",
        );

        if (targetElement) {
          let itemCount = targetElement.querySelectorAll(".cart-item").length;
          showCartPopup(targetElement.outerHTML, itemCount, totalPrice);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart content:", error);
    }
  }

  async function openMiniBag() {
    if (sessionStorage.getItem("addedToBag") && sessionStorage.getItem("url")) {
      let miniCart = await elementReady("#menu-cart-icon");
      miniCart.click();
      let url = sessionStorage.getItem("url");
      sessionStorage.removeItem("addedToBag");
    }
  }

  openMiniBag();

  async function showCartPopup(htmlContent, itemCount, totalPrice) {
    // Prevent multiple popups
    if (document.querySelector(".atb-notification")) {
      return;
    }

    // Check if we're on a PDP page and get add-ons
    let addOnHtml = "";
    const prodAddOns = document.querySelector("#product-addons");
    console.log("🔍 Checking for #product-addons:", prodAddOns);

    if (prodAddOns) {
      console.log("✅ #product-addons found, calling getAddOns()");
      addOnHtml = await getAddOns();
      console.log("📦 addOnHtml returned length:", addOnHtml.length);
    } else {
      console.log("❌ No #product-addons found on page");
    }

    let atbNotificationEl = document.createElement("div");

    // Calculate announcement bar height
    const announcementBar = document.querySelector(".top-banner-container");
    let topPosition = 0;

    if (announcementBar) {
      topPosition = announcementBar.offsetHeight;
    }

    atbNotificationEl.setAttribute("role", "dialog");
    atbNotificationEl.setAttribute("aria-labelledby", "cart-drawer-title");
    atbNotificationEl.setAttribute("aria-modal", "true");

    atbNotificationEl.className =
      "atb-notification fixed right-0 flex w-[400px] lg:w-[600px] z-50 transition-all duration-300 ease-out";
    atbNotificationEl.classList.add("translate-x-full");

    // Apply the top position and adjust height based on announcement bar height
    if (announcementBar) {
      atbNotificationEl.style.top = `${topPosition}px`;
      atbNotificationEl.style.height = `calc(100vh - ${topPosition}px)`;
    } else {
      atbNotificationEl.style.top = "0";
      atbNotificationEl.style.height = "100vh";
    }

    atbNotificationEl.innerHTML = `
	  <div class="flex flex-col w-full h-full bg-white shadow-md">
	  
	    <!-- TOP SECTION - Takes 50% height, scrollable -->
	    <div class="top-content flex flex-col flex-1 overflow-y-auto">
	    
	      <div id="cart-drawer-title" class="flex flex-col justify-between px-6 pt-6">
	        <div class="flex justify-between items-center mb-4">
	          <h3 class="uppercase text-xl">Added to basket</h3>
	          <svg
	            onclick="removeAtbNotification()"
	            xmlns="http://www.w3.org/2000/svg"
	            width="24"
	            height="24"
	            viewBox="0 0 24 24"
	            fill="none"
	            class="cursor-pointer hover:opacity-70 transition-opacity"
	          >
	            <path
	              d="M19.7775 5.63747L18.3625 4.22247L11.9975 10.5875L5.63497 4.22247L4.21997 5.63747L10.585 12.0025L4.21997 18.365L5.63497 19.78L11.9975 13.415L18.3625 19.78L19.7775 18.365L13.4125 12.0025L19.7775 5.63747Z"
	              fill="#000F21"
	            />
	          </svg>
	        </div>
	        
	        <div class="txt-right-container text-right">
	          <span class="text-colorDefault text-xs font-normal">
	            ${itemCount} ${itemCount <= 1 ? "item" : "items"}
	          </span>
	          <div>
	            <div class="flex items-center space-x-2 text-sm">
	              <span class="font-normal leading-none">Total</span>
	              <strong><span class="price">${totalPrice}</span></strong>
	            </div>
	          </div>
	        </div>
	      </div>
	      
	      <div class="px-6 pb-4">${htmlContent}</div>
	    </div>
	  
<!-- BOTTOM SECTION - Shows add-ons or alternative content -->
<div class="bottom-content flex flex-col flex-1">

  ${
    addOnHtml
      ? `
  <div class="w-full bg-[#F9F8F8] py-6 px-6" style="overflow-y: auto;">
    <h3 class="add-on-cont-title mb-6">Complete your order with:</h3>
    <div class="add-on-container" style="padding: 0;">
      <div class="add-on-items">
        ${addOnHtml}
      </div>
    </div>
  </div>
  `
      : `
  <div class="w-full bg-[#F9F8F8] py-6 px-6">
    <h3 class="uppercase text-xl mb-6">Complete your order with:</h3>
    <div class="bg-white px-3">${htmlContent}</div>
  </div>
  `
  }
  
  <div class="flex flex-col px-6 pb-6 flex-1">
    <div class="flex items-center justify-end mb-4 gap-2 mt-auto">
      <span class="text-lg font-bold uppercase">Total:</span>
      <span class="text-lg font-bold text-secondary">
        <span class="price">${totalPrice}</span>
      </span>
    </div>
    
    <div class="btn-group grid grid-cols-2 gap-6">
      <button
        onclick="navigateAndClose('https://www.vax.co.uk/checkout/cart')"
        class="continue-shopping-btn uppercase text-sm font-bold w-full h-10 rounded px-10 py-3 text-center border-none inline-flex items-center justify-center"
      >
        View Basket
      </button>
      <button
        onclick="navigateAndClose('https://www.vax.co.uk/checkout')"
        class="action go-to-basket text-sm uppercase font-bold w-full h-10 rounded px-10 py-3 leading-4 lg:leading-6 text-center border-none inline-flex items-center justify-center"
      >
        Checkout
      </button>
    </div>
  </div>
</div>
	`;

    let defaultMiniCartContents = await elementReady(
      '#cart-drawer [aria-labelledby="cart-drawer-title"]',
    );
    defaultMiniCartContents.classList.add("hide-cart");

    let cartContainer = await elementReady("#cart-drawer");
    cartContainer.appendChild(atbNotificationEl);

    // Use setTimeout to ensure the element is fully rendered before animating
    setTimeout(() => {
      atbNotificationEl.classList.remove("translate-x-full");
      atbNotificationEl.classList.add("translate-x-0");
    }, 20);

    let miniCart = await elementReady("#menu-cart-icon");

    miniCart.click();
    createPageOverlay();

    if (!document.querySelector("#layer-product-list")) {
      setSuccessState();
    } else {
      resetButtonState();
    }

    setTimeout(() => {
      resetButtonState();
    }, 2000);

    atbNotificationAdded = true;
  }

  // Function to create and toggle the overlay
  function createPageOverlay() {
    let overlay = document.getElementById("page-overlay");

    if (overlay) {
      overlay.classList.toggle("active");
      document.body.classList.toggle("overlay-active");
      return;
    }

    overlay = document.createElement("div");
    overlay.id = "page-overlay";
    overlay.className = "page-overlay active";

    document.body.appendChild(overlay);
    document.body.classList.add("overlay-active");
  }

  function hidePageOverlay() {
    const overlay = document.getElementById("page-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      document.body.classList.remove("overlay-active");
    }
  }

  function removeAtbNotification() {
    let atbNotification = document.querySelector(".atb-notification");

    if (atbNotification) {
      // Trigger leave animation
      atbNotification.classList.remove("translate-x-0");
      atbNotification.classList.add("translate-x-full");

      // Wait for animation to complete before removing
      setTimeout(() => {
        removePageOverlay();
        document.body.classList.remove("overlay-active");
        atbNotification.remove();

        let defaultMiniCartContents = document.querySelector(
          '#cart-drawer [aria-labelledby="cart-drawer-title"]',
        );
        if (defaultMiniCartContents) {
          defaultMiniCartContents.classList.remove("hide-cart");
        }

        let miniCart = document.querySelector("#menu-cart-icon");
        if (miniCart) {
          miniCart.click();
        }

        // Reset the flag
        atbNotificationAdded = false;
      }, 300);
    }
  }

  function navigateAndClose(url) {
    // Add loading state to the button that was clicked
    const activeElement = document.activeElement;
    if (activeElement && activeElement.classList) {
      activeElement.classList.add("opacity-50", "cursor-wait");
      activeElement.disabled = true;
    }

    // Immediately remove overlay and popup without animation
    removePageOverlay();
    document.body.classList.remove("overlay-active");

    let atbNotification = document.querySelector(".atb-notification");
    if (atbNotification) {
      atbNotification.remove();
    }

    let defaultMiniCartContents = document.querySelector(
      '#cart-drawer [aria-labelledby="cart-drawer-title"]',
    );
    if (defaultMiniCartContents) {
      defaultMiniCartContents.classList.remove("hide-cart");
    }

    // Reset the flag
    atbNotificationAdded = false;

    // Use setTimeout to ensure DOM updates before navigation
    setTimeout(() => {
      window.location.href = url;
    }, 50);
  }

  function removePageOverlay() {
    const overlay = document.getElementById("page-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  function preventRedirect(e, form) {
    e.preventDefault();
    e.stopImmediatePropagation();

    const url = form.action;
    const data = new FormData(form);

    fetch(url, {
      method: form.method.toUpperCase(),
      credentials: "same-origin",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01",
      },
      body: data,
    })
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        const selectedAddons = getSelectedAddons();

        if (json.preBasketUrl) {
          const cartUrl = buildCartUrlWithAddons(
            json.preBasketUrl,
            selectedAddons,
          );
          fetchAndShowCartContent(cartUrl);
        } else if (json.backUrl) {
          fetchAndShowCartContent(json.backUrl);
        } else {
          return;
        }

        if (typeof dataLayerParams !== "undefined" && dataLayerParams.items) {
          dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
              items: dataLayerParams.items.map((item) => ({
                item_id: item.item_id,
                item_name: item.item_name,
                price: item.price,
                quantity: item.quantity || 1,
                item_category: item.item_category,
              })),
            },
          });
        } else {
          let itemEl = e.target.closest("[data-product-sku]");
          let itemId = itemEl ? itemEl.getAttribute("data-product-sku") : null;

          let itemTitle = itemEl.querySelector("h4 span")?.textContent || null;

          let priceElement = itemEl.querySelector(
            ".current-price [data-price-amount]",
          );

          let price = priceElement
            ? parseFloat(priceElement.getAttribute("data-price-amount"))
            : 0;

          const pathParts = window.location.pathname.split("/").filter(Boolean);
          let itemCategory = pathParts[pathParts.length - 1] || "";

          itemCategory = itemCategory
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
              items: [
                {
                  item_id: itemId,
                  item_name: itemTitle,
                  price: price,
                  quantity: 1,
                  item_category: itemCategory,
                },
              ],
            },
          });
        }

        window.dispatchEvent(new CustomEvent("reload-customer-section-data"));
      })
      .catch((err) => {
        resetButtonState();
        window.location.reload();
      });
  }

  elementReady("#html-body").then((main) => {
    if (!main.classList.contains("test-vax")) {
      main.addEventListener(
        "click",
        (e) => {
          main.classList.add("test-vax");

          if (
            e.target.closest(".add-to-basket") &&
            !e.target.closest(".product_addtocart_form.cross-sell-cart-form")
          ) {
            let form;
            if (e.target.closest(".order-2")) {
              form = e.target.closest(".order-2").querySelector("form");
            } else if (e.target.closest("form")) {
              form = e.target.closest("form");
            } else {
              let mainPdpForm = document.querySelector(
                "#product_addtocart_form",
              );
              window.scrollTo(0, 0);
              form = mainPdpForm;
            }
            let atbBtn = e.target.closest(".add-to-basket");
            if (form && !atbBtn.disabled) {
              preventRedirect(e, form);
              initATB(atbBtn);
              setLoadingState();
              elementReady(".message.error").then(resetButtonState);

              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: "VX010.2 | Event Tracking",
                  event_label: "VX010.2 | (Variation 1) | User adds to bag",
                  event_segment: "VX010.2EV1Q",
                },
              });
            }
          }

          // close atb notification if user clicked anywhere else on the page
          if (
            !e.target.closest(".atb-notification") &&
            atbNotificationAdded === true
          ) {
            if (document.querySelector(".atb-notification")) {
              removeAtbNotification();
              atbNotificationAdded = false;
              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: "VX010.2 | Event Tracking",
                  event_label:
                    "VX010.2 | (Variation 1) | User dismisses ATB notification",
                  event_segment: "VX010.2EV1P",
                },
              });
            }
          }

          // continue shopping. do not fire dismiss event here
          if (e.target.closest(".continue-shopping-btn")) {
            console.log("continue shopping clicked");
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "VX010.2 | Event Tracking",
                event_label:
                  "VX010.2 | (Variation 1) | User clicks Continue shopping in ATB notification ",
                event_segment: "VX010.2EV1O",
              },
            });
            if (document.querySelector(".atb-notification")) {
              removeAtbNotification();
              atbNotificationAdded = false;
            }
          }

          // view basket in ATB notification click
          if (
            e.target.closest('[href="https://www.vax.co.uk/checkout/cart/"]') &&
            e.target.closest(".atb-notification")
          ) {
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "VX010.2 | Event Tracking",
                event_label:
                  "VX010.2 | (Variation 1) | User clicks View Basket in ATB notification",
                event_segment: "VX010.2EV1N",
              },
            });
          }

          // User clicks on product
          if (
            e.target.closest(".atb-notification") &&
            e.target.closest("a") &&
            e.target.closest(".cart-item")
          ) {
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "VX010.2 | Event Tracking",
                event_label:
                  "VX010.2 | (Variation 1) | User clicks on product ",
                event_segment: "VX010.2EV1G",
              },
            });
          }
        },
        true,
      );
    }
  });

  let lastTrustedClick = null;

  // capture trusted clicks globally
  document.addEventListener(
    "click",
    (e) => {
      if (e.isTrusted) {
        lastTrustedClick = e.target;
      }
    },
    true,
  );

  async function miniBagClicks() {
    const cartDrawer = await elementReady(
      "div[role='dialog'][aria-labelledby='cart-drawer-title']",
    );

    if (!cartDrawer) return;

    const isOpen = (el) => window.getComputedStyle(el).display !== "none";
    let wasOpen = isOpen(cartDrawer);

    const observer = new MutationObserver(() => {
      const nowOpen = isOpen(cartDrawer);

      if (nowOpen && !wasOpen) {
        const openedFromCartDrawerItself =
          lastTrustedClick && cartDrawer.contains(lastTrustedClick);
        const openedFromAtbNotification =
          lastTrustedClick && lastTrustedClick.closest(".atb-notification");
        const openedFromOverlay =
          lastTrustedClick && lastTrustedClick.closest("#page-overlay");

        const openedFromInside =
          openedFromCartDrawerItself ||
          openedFromAtbNotification ||
          openedFromOverlay;

        if (lastTrustedClick && !openedFromInside) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "VX010.2 | Event Tracking",
              event_label:
                "VX010.2 | (Variation 1) | Clicks sitewide cart icon ",
              event_segment: "VX010.2EV1H",
            },
          });
        }

        setTimeout(() => {
          const viewBasketBtn = cartDrawer.querySelector(
            ".action.go-to-basket",
          );
          const checkoutBtn = cartDrawer.querySelector(
            ".action.go-to-checkout",
          );

          if (viewBasketBtn && !viewBasketBtn._boundConversio) {
            viewBasketBtn._boundConversio = true;
            viewBasketBtn.addEventListener("click", (e) => {
              if (!e.isTrusted) return;

              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: "VX010.2 | Event Tracking",
                  event_label:
                    "VX010.2 | (Variation 1) | Clicks view basket in sitewide cart icon",
                  event_segment: "VX010.2EV1I",
                },
              });
            });
          }

          if (checkoutBtn && !checkoutBtn._boundConversio) {
            checkoutBtn._boundConversio = true;
            checkoutBtn.addEventListener("click", (e) => {
              if (!e.isTrusted) return;

              window.dataLayer.push({
                event: "conversioEvent",
                conversio: {
                  event_category: "Conversio CRO",
                  event_action: "VX010.2 | Event Tracking",
                  event_label:
                    "VX010.2 | (Variation 1) | Clicks checkout in sitewide cart icon",
                  event_segment: "VX010.2EV1J",
                },
              });
            });
          }
        }, 1000);
      }

      wasOpen = nowOpen;
    });

    observer.observe(cartDrawer, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }

  miniBagClicks();
}
