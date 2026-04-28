// Add-ons product data
const VAX_ADDONS = [
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

// Helper: Wait for an element to exist
function waitForElement(selector) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

// Helper: Wait for multiple elements
function waitForElements(selector) {
  return new Promise((resolve) => {
    let elements = document.querySelectorAll(selector);
    if (elements.length) return resolve(Array.from(elements));
    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll(selector);
      if (elements.length) {
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

// Helper: Generate star rating SVG
function generateStars(rating) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const starSVG = `<svg class="star-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 14 13" fill="none" stroke="none"><path d="M6.73002 0L8.89253 4.1L13.46 4.89L10.2275 8.2125L10.8875 12.8L6.73002 10.755L2.57001 12.8L3.23001 8.2125L0 4.89L4.56502 4.1L6.73002 0Z"/></svg>`;
  const fiveStars = starSVG.repeat(5);
  return `<span class="addon-stars" aria-label="${rating} out of 5 stars">
    <span class="stars-bg">${fiveStars.replace(/fill="none"/g, 'fill="#000"')}</span>
    <span class="stars-fill" style="width:${pct}%;">${fiveStars.replace(/fill="none"/g, 'fill="#FF671F"')}</span>
  </span>`;
}

// Helper: Get selected add-ons from Alpine.js
function getSelectedAddons() {
  try {
    const productAddonsEl = document.querySelector('[x-data*="productAddons"]');
    if (productAddonsEl?._x_dataStack?.[0]?.getSelectedAddons) {
      return productAddonsEl._x_dataStack[0].getSelectedAddons();
    }
  } catch (error) {
    console.error("Error getting selected add-ons:", error);
  }
  return [];
}

// Helper: Build cart URL with add-ons
function buildCartUrlWithAddons(baseUrl, selectedAddons) {
  if (!selectedAddons?.length) return baseUrl;
  const productIdMatch = baseUrl.match(/product_id\/(\d+)/);
  if (!productIdMatch) return baseUrl;
  const addonSkus = selectedAddons.map((addon) => addon.sku).join(",");
  return `https://www.vax.co.uk/checkout/cart/added/product_id/${productIdMatch[1]}/product_add_on_sku/${encodeURIComponent(addonSkus)}`;
}

// Helper: Fetch product price from product page
async function fetchProductPrice(productUrl) {
  try {
    const response = await fetch(productUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const priceElement = doc.querySelector(".main-product-price");
    return priceElement ? priceElement.cloneNode(true) : null;
  } catch (error) {
    console.error("Error fetching product price:", error);
    return null;
  }
}

// Helper: Get add-ons HTML from PDP add-on selectors
async function getPDPAddOns() {
  let addOnHtml = "";
  let addedCount = 0;
  const maxAddOns = 2;
  const addOns = await waitForElements(
    "#dropdown-container-top-picks-with-your-purchase .addon-option .addon-name",
  );
  const preSelectedAddons = getSelectedAddons();
  const selectedSkus = preSelectedAddons?.map((a) => a.sku) || [];

  for (const addOn of addOns) {
    if (addedCount >= maxAddOns) break;
    const title = addOn.textContent.trim();
    const item = addOn.closest("label");
    const currPrice = item.querySelector(".price-box .current-price");
    const product = VAX_ADDONS.find((p) => p.name === title);
    if (product && !selectedSkus.includes(product.sku)) {
      addOnHtml += `
        <a href="${product.url}" class="add-on-item">
          <img src="${product.imageUrl}" alt="${product.name}" class="add-on-image" />
          <div class="add-on-details">
            <h3 class="add-on-item-title">${product.name}</h3>
            <div class="add-on-rating">${generateStars(product.rating)}</div>
            <div class="add-on-price">
              <span class="current-price">${currPrice?.textContent || ""}</span>
            </div>
          </div>
          <button class="add-on-add-to-cart-btn" data-product-id="${product.productId}">
            <svg class="add-on-cart-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 18" fill="none">
              <g clip-path="url(#clip0_1555_2892)">
                <path d="M3.53086 -0.00012207C3.82512 -0.00012207 4.05293 0.181636 4.11094 0.437573L4.26562 1.12488H19.7977C20.5113 1.12488 21.0809 1.83679 20.8805 2.55433L19.65 6.92214C19.2879 6.83425 18.9117 6.78152 18.5285 6.76043L19.7977 2.24988H4.52227L6.02695 8.99988H13.4133C13.1285 9.34441 12.8789 9.7241 12.675 10.1249H6.31172L6.825 12.3749H12.0246C12.007 12.5612 12 12.7475 12 12.9374C12 13.1272 12.007 13.3135 12.0246 13.4999H6.375C6.11133 13.4999 5.88633 13.3171 5.82656 13.0604L3.11355 1.12488H1.3125C1.00186 1.12488 0.75 0.873159 0.75 0.562378C0.75 0.251737 1.00186 -0.000111523 1.3125 -0.000111523L3.53086 -0.00012207ZM5.21836 16.0311C5.21836 14.9448 6.13242 14.0624 7.18711 14.0624C8.30508 14.0624 9.15586 14.9448 9.15586 16.0311C9.15586 17.1175 8.30508 17.9999 7.18711 17.9999C6.13242 17.9999 5.21836 17.1175 5.21836 16.0311ZM7.18711 16.8749C7.68633 16.8749 8.03086 16.4987 8.03086 16.0311C8.03086 15.5635 7.68633 15.1874 7.18711 15.1874C6.75117 15.1874 6.34336 15.5635 6.34336 16.0311C6.34336 16.4987 6.75117 16.8749 7.18711 16.8749ZM18.75 12.3432H20.4375C20.7469 12.3432 21 12.628 21 12.9057C21 13.2468 20.7469 13.4682 20.4375 13.4682H18.75V15.1557C18.75 15.4968 18.4969 15.7182 18.1875 15.7182C17.8781 15.7182 17.625 15.4968 17.625 15.1557V13.4682H15.9375C15.6281 13.4682 15.375 13.2468 15.375 12.9057C15.375 12.628 15.6281 12.3432 15.9375 12.3432H17.625V10.6557C17.625 10.378 17.8781 10.0932 18.1875 10.0932C18.4969 10.0932 18.75 10.378 18.75 10.6557V12.3432ZM23.25 12.9374C23.25 15.7323 20.9824 17.9999 18.1875 17.9999C15.3926 17.9999 13.125 15.7323 13.125 12.9374C13.125 10.1425 15.3926 7.87488 18.1875 7.87488C20.9824 7.87488 23.25 10.1425 23.25 12.9374ZM18.1875 8.99988C16.0113 8.99988 14.25 10.7612 14.25 12.9374C14.25 15.1136 16.0113 16.8749 18.1875 16.8749C20.3637 16.8749 22.125 15.1136 22.125 12.9374C22.125 10.7612 20.3637 8.99988 18.1875 8.99988Z" fill="white"/>
              </g>
              <defs><clipPath id="clip0_1555_2892"><rect width="22.5" height="18" fill="white" transform="translate(0.75 -0.00012207)"/></clipPath></defs>
            </svg>
          </button>
        </a>
      `;
      addedCount++;
    }
  }
  return addOnHtml;
}

// Helper: Get add-ons for PLP (from main add-ons array, show first 2)
async function getPLPAddOns() {
  let addOnHtml = "";
  const maxAddOns = 2;
  for (let i = 0; i < Math.min(VAX_ADDONS.length, maxAddOns); i++) {
    const product = VAX_ADDONS[i];
    addOnHtml += `
      <a href="${product.url}" class="add-on-item">
        <img src="${product.imageUrl}" alt="${product.name}" class="add-on-image" />
        <div class="add-on-details">
          <h3 class="add-on-item-title">${product.name}</h3>
          <div class="add-on-rating">${generateStars(product.rating)}</div>
          <div class="add-on-price">
            <span class="current-price">Loading...</span>
          </div>
        </div>
        <button class="add-on-add-to-cart-btn" data-product-id="${product.productId}">
          <svg class="add-on-cart-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 18" fill="none">
            <g clip-path="url(#clip0_1555_2892)">
              <path d="M3.53086 -0.00012207C3.82512 -0.00012207 4.05293 0.181636 4.11094 0.437573L4.26562 1.12488H19.7977C20.5113 1.12488 21.0809 1.83679 20.8805 2.55433L19.65 6.92214C19.2879 6.83425 18.9117 6.78152 18.5285 6.76043L19.7977 2.24988H4.52227L6.02695 8.99988H13.4133C13.1285 9.34441 12.8789 9.7241 12.675 10.1249H6.31172L6.825 12.3749H12.0246C12.007 12.5612 12 12.7475 12 12.9374C12 13.1272 12.007 13.3135 12.0246 13.4999H6.375C6.11133 13.4999 5.88633 13.3171 5.82656 13.0604L3.11355 1.12488H1.3125C1.00186 1.12488 0.75 0.873159 0.75 0.562378C0.75 0.251737 1.00186 -0.000111523 1.3125 -0.000111523L3.53086 -0.00012207ZM5.21836 16.0311C5.21836 14.9448 6.13242 14.0624 7.18711 14.0624C8.30508 14.0624 9.15586 14.9448 9.15586 16.0311C9.15586 17.1175 8.30508 17.9999 7.18711 17.9999C6.13242 17.9999 5.21836 17.1175 5.21836 16.0311ZM7.18711 16.8749C7.68633 16.8749 8.03086 16.4987 8.03086 16.0311C8.03086 15.5635 7.68633 15.1874 7.18711 15.1874C6.75117 15.1874 6.34336 15.5635 6.34336 16.0311C6.34336 16.4987 6.75117 16.8749 7.18711 16.8749ZM18.75 12.3432H20.4375C20.7469 12.3432 21 12.628 21 12.9057C21 13.2468 20.7469 13.4682 20.4375 13.4682H18.75V15.1557C18.75 15.4968 18.4969 15.7182 18.1875 15.7182C17.8781 15.7182 17.625 15.4968 17.625 15.1557V13.4682H15.9375C15.6281 13.4682 15.375 13.2468 15.375 12.9057C15.375 12.628 15.6281 12.3432 15.9375 12.3432H17.625V10.6557C17.625 10.378 17.8781 10.0932 18.1875 10.0932C18.4969 10.0932 18.75 10.378 18.75 10.6557V12.3432ZM23.25 12.9374C23.25 15.7323 20.9824 17.9999 18.1875 17.9999C15.3926 17.9999 13.125 15.7323 13.125 12.9374C13.125 10.1425 15.3926 7.87488 18.1875 7.87488C20.9824 7.87488 23.25 10.1425 23.25 12.9374ZM18.1875 8.99988C16.0113 8.99988 14.25 10.7612 14.25 12.9374C14.25 15.1136 16.0113 16.8749 18.1875 16.8749C20.3637 16.8749 22.125 15.1136 22.125 12.9374C22.125 10.7612 20.3637 8.99988 18.1875 8.99988Z" fill="white"/>
            </g>
            <defs><clipPath id="clip0_1555_2892"><rect width="22.5" height="18" fill="white" transform="translate(0.75 -0.00012207)"/></clipPath></defs>
          </svg>
        </button>
      </a>
    `;
  }
  return addOnHtml;
}

// Helper: Update PLP add-on prices after fetching cart
async function updatePLPAddOnPrices(atbNotificationEl, addedProductUrl) {
  if (!addedProductUrl) return;
  try {
    const response = await fetch(addedProductUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const addOnOptions = doc.querySelectorAll(
      "#dropdown-container-top-picks-with-your-purchase .addon-option .price-box .current-price",
    );
    const addOnItems = atbNotificationEl.querySelectorAll(".add-on-item");
    for (let i = 0; i < Math.min(addOnItems.length, addOnOptions.length); i++) {
      const priceSpan = addOnItems[i].querySelector(
        ".add-on-price .current-price",
      );
      const newPrice = addOnOptions[i]?.textContent;
      if (priceSpan && newPrice) {
        priceSpan.textContent = newPrice;
      }
    }
  } catch (error) {
    console.error("Error fetching PLP add-on prices:", error);
  }
}

// Main ATB manager class
class AddToBasketManager {
  constructor() {
    this.isMobile = window.innerWidth < 768;
    this.button = null;
    this.buttonText = null;
    this.originalText = "";
    this.originalHtml = "";
    this.notificationActive = false;
    this.lastTrustedClick = null;
    this.init();
  }

  async init() {
    await waitForElement("#html-body");
    this.setupEventListeners();
    this.setupMiniBagTracking();
    this.captureTrustedClicks();
  }

  captureTrustedClicks() {
    document.addEventListener(
      "click",
      (e) => {
        if (e.isTrusted) this.lastTrustedClick = e.target;
      },
      true,
    );
  }

  setupEventListeners() {
    document.body.addEventListener("click", (e) => {
      if (this.notificationActive && !e.target.closest(".atb-notification")) {
        this.removeNotification();
      }

      const atbBtn = e.target.closest(".add-to-basket");
      if (
        atbBtn &&
        !e.target.closest(".product_addtocart_form.cross-sell-cart-form")
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (atbBtn.disabled) return;
        let form =
          e.target.closest("form") ||
          document.querySelector("#product_addtocart_form");
        if (form) {
          this.handleAddToBasket(e, form, atbBtn);
        }
      }

      const addonBtn = e.target.closest(".add-on-add-to-cart-btn");
      if (addonBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.handleAddonAddToBasket(addonBtn);
      }

      if (e.target.closest(".popup-close-btn, .notification-close")) {
        this.removeNotification();
      }
    });
  }

  async handleAddToBasket(event, form, atbBtn) {
    this.initButton(atbBtn);
    this.setLoadingState();

    const url = form.action;
    const data = new FormData(form);

    try {
      const response = await fetch(url, {
        method: form.method.toUpperCase(),
        credentials: "same-origin",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json, text/javascript, */*; q=0.01",
        },
        body: data,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      const selectedAddons = getSelectedAddons();

      if (json.preBasketUrl) {
        const cartUrl = buildCartUrlWithAddons(
          json.preBasketUrl,
          selectedAddons,
        );
        await this.fetchAndShowCart(cartUrl, atbBtn, form);
      } else if (json.backUrl) {
        if (json.backUrl === window.location.href) {
          this.resetButtonState();
        } else {
          await this.fetchAndShowCart(json.backUrl, atbBtn, form);
        }
      } else {
        this.resetButtonState();
      }

      this.pushAddToCartEvent(event, form);
      window.dispatchEvent(new CustomEvent("reload-customer-section-data"));
    } catch (err) {
      console.error("Add to basket error:", err);
      this.resetButtonState();
      window.location.reload();
    }
  }

  async handleAddonAddToBasket(button) {
    const addonItem = button.closest(".add-on-item");
    const addonName =
      addonItem?.querySelector(".add-on-item-title")?.textContent;
    const product = VAX_ADDONS.find((p) => p.name === addonName);

    if (!product?.productId) {
      console.error("Add-on not found:", addonName);
      return;
    }

    this.initButton(button);
    this.setLoadingState();

    const formKey = document.querySelector('input[name="form_key"]')?.value;
    if (!formKey) {
      console.error("Form key not found");
      this.resetButtonState();
      return;
    }

    const formData = new FormData();
    formData.append("form_key", formKey);
    formData.append("product", product.productId);
    formData.append("qty", "1");

    const url = `/checkout/cart/add/uenc/${btoa(window.location.href)}/product/${product.productId}/`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });

      if (response.ok) {
        this.setSuccessState();
        window.dispatchEvent(new CustomEvent("reload-customer-section-data"));
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "add_to_cart",
            ecommerce: {
              items: [
                {
                  item_name: addonName,
                  item_id: product.productId,
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
        this.resetButtonState();
      }
    } catch (error) {
      console.error("Error adding add-on:", error);
      this.resetButtonState();
    }
  }

  async fetchAndShowCart(url, atbBtn, form) {
    try {
      const response = await fetch(url, {
        credentials: "same-origin",
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      let targetElement,
        itemCount = 1,
        totalPrice = "";
      const isCartPage = url === "https://www.vax.co.uk/checkout/cart/";

      if (isCartPage) {
        targetElement = doc.querySelector(".cart-item:last-of-type");
        document
          .querySelector(".page-wrapper")
          ?.classList.add("accessories-item");
        totalPrice = this.extractTotalPrice(doc, atbBtn);
      } else {
        targetElement = doc.querySelector(
          "#maincontent .grid.grid-cols-1 div .md\\:overflow-hidden",
        );
        if (targetElement) {
          itemCount = targetElement.querySelectorAll(".cart-item").length;
          totalPrice = this.extractTotalPrice(doc, atbBtn);
        }
      }

      if (targetElement) {
        await this.showNotification(
          targetElement.outerHTML,
          itemCount,
          totalPrice,
          atbBtn,
          form,
        );
      }
    } catch (error) {
      console.error("Failed to fetch cart content:", error);
    }
  }

  extractTotalPrice(doc, atbBtn) {
    let totalPrice =
      doc.querySelector(".current-price .price")?.textContent || "";
    if (!totalPrice && document.querySelector("#product-list")) {
      const itemContainer = atbBtn?.closest("form");
      const finalPrice = itemContainer?.querySelector(
        '[data-price-type="finalPrice"]',
      );
      if (finalPrice) {
        totalPrice = "£" + finalPrice.getAttribute("data-price-amount");
      }
    }
    return totalPrice;
  }

  async showNotification(htmlContent, itemCount, totalPrice, atbBtn, form) {
    if (document.querySelector(".atb-notification")) return;

    const hasProductAddons = !!document.querySelector("#product-addons");
    const isPLP = !!document.querySelector(
      "#product-list, #layer-product-list",
    );
    let addOnHtml = "";
    let addedProductUrl = null;

    if (hasProductAddons) {
      addOnHtml = await getPDPAddOns();
    } else if (isPLP) {
      addOnHtml = await getPLPAddOns();
      const productLink = form
        ?.querySelector('a[href*="/"]')
        ?.getAttribute("href");
      if (productLink) {
        addedProductUrl = productLink.startsWith("http")
          ? productLink
          : window.location.origin + productLink;
      }
    }

    const notification = this.createNotificationElement(
      htmlContent,
      itemCount,
      totalPrice,
      addOnHtml,
    );

    // Set announcement bar height as CSS variable for desktop
    const announcementBar = document.querySelector(".top-banner-container");
    const barHeight = announcementBar ? announcementBar.offsetHeight : 0;
    document.documentElement.style.setProperty(
      "--announcement-height",
      `${barHeight}px`,
    );

    document.body.appendChild(notification);

    // Force a reflow before adding the 'show' class
    notification.offsetHeight; // This forces browser to calculate layout

    if (isPLP && !hasProductAddons && addedProductUrl) {
      await updatePLPAddOnPrices(notification, addedProductUrl);
    }

    await this.refreshCartItemPrices(notification);
    this.addItemMetadata(notification);
    this.removeWasFromOldPrice(notification);

    // Add show class to trigger transition
    notification.classList.add("show");

    this.createOverlay();

    if (!isPLP) {
      this.setSuccessState();
    } else {
      this.resetButtonState();
    }

    this.notificationActive = true;
  }

  createNotificationElement(htmlContent, itemCount, totalPrice, addOnHtml) {
    const notification = document.createElement("div");
    notification.setAttribute("role", "dialog");
    notification.setAttribute("aria-modal", "true");

    notification.className = "atb-notification";

    const addOnSection = addOnHtml
      ? `
      <div class="add-on-container">
        <h3 class="add-on-cont-title">Complete your order with:</h3>
        <div class="add-on-items">${addOnHtml}</div>
      </div>
    `
      : "";

    notification.innerHTML = `
		  <div class="notification-inner">
		    <div class="notification-header">
		      <h3 class="notification-title">Added to basket</h3>
		      <div class="popup-close-btn notification-close">
		        <svg class="close-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="black" width="24" height="24">
		          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
		        </svg>
		      </div>
		    </div>
		    <div class="cart-items-wrapper">${htmlContent}</div>
		    ${addOnSection}
		    <div class="total-price-wrapper">
		      <span>Total: </span>
		      <span class="price">${totalPrice}</span>
		    </div>
		    <div class="btn-group">
		      <a href="https://www.vax.co.uk/checkout/cart/" class="btn btn-basket">View Basket</a>
		      <a href="https://www.vax.co.uk/checkout/" class="btn btn-checkout">Checkout</a>
		    </div>
		  </div>
		`;

    return notification;
  }

  async refreshCartItemPrices(notification) {
    const cartItems = notification.querySelectorAll(".cart-item");
    for (const item of cartItems) {
      const productLink = item.querySelector('a[href*="/"]');
      const productUrl = productLink?.getAttribute("href");
      if (productUrl) {
        const freshPrice = await fetchProductPrice(productUrl);
        if (freshPrice) {
          const existingPrice = item.querySelector(
            ".price-including-tax, .price-box, .small",
          );
          if (existingPrice) existingPrice.replaceWith(freshPrice);
        }
      }
    }
  }

  addItemMetadata(notification) {
    setTimeout(() => {
      const cartItem = notification.querySelector(".cart-item");
      if (!cartItem) return;

      let itemCategory = "",
        itemQuantity = "";
      const lastEcomEvent = [...(window.dataLayer || [])]
        .reverse()
        .find((item) => item.ecommerce?.items && item.event === "add_to_cart");

      if (lastEcomEvent?.ecommerce?.items?.[0]) {
        itemCategory = lastEcomEvent.ecommerce.items[0].item_category || "";
        itemQuantity = lastEcomEvent.ecommerce.items[0].quantity || "";
      }

      const productLink = cartItem.querySelector(".product-item-link");
      if (itemCategory) {
        productLink.insertAdjacentHTML(
          "afterend",
          `<div class="item-category">${itemCategory}</div>`,
        );
      }
      if (itemQuantity) {
        const categoryDiv = cartItem.querySelector(".item-category");
        const quantityHtml = `<div class="item-quantity">QTY ${itemQuantity}</div>`;
        if (categoryDiv) {
          categoryDiv.insertAdjacentHTML("afterend", quantityHtml);
        } else {
          productLink.insertAdjacentHTML("afterend", quantityHtml);
        }
      }
    }, 150);
  }

  // Remove "was " text from old price elements
  removeWasFromOldPrice(notification) {
    const oldPriceElements = notification.querySelectorAll(".old-price");
    oldPriceElements.forEach((element) => {
      // Check if the text contains "was " and remove it
      if (element.innerHTML.includes("was ")) {
        element.innerHTML = element.innerHTML.replace("was ", "");
      }
    });
  }

  createOverlay() {
    let overlay = document.getElementById("page-overlay");
    if (overlay) {
      overlay.classList.add("active");
    } else {
      overlay = document.createElement("div");
      overlay.id = "page-overlay";
      overlay.className = "page-overlay active";
      document.body.appendChild(overlay);
    }
    document.body.classList.add("overlay-active");
  }

  removeOverlay() {
    const overlay = document.getElementById("page-overlay");
    if (overlay) {
      overlay.classList.remove("active");
      setTimeout(() => overlay.remove(), 300);
    }
    document.body.classList.remove("overlay-active");
  }

  removeNotification() {
    const notification = document.querySelector(".atb-notification");
    if (!notification) return;

    notification.classList.remove("show");

    setTimeout(() => {
      notification.remove();
      this.removeOverlay();
      this.notificationActive = false;

      // Desktop: Restore mini cart
      if (!this.isMobile) {
        const defaultMiniCart = document.querySelector(
          '#cart-drawer [aria-labelledby="cart-drawer-title"]',
        );
        if (defaultMiniCart) defaultMiniCart.classList.remove("hide-cart");
        document.querySelector("#menu-cart-icon")?.click();
      }
    }, 300);
  }

  initButton(btn) {
    if (btn.querySelector(".block")) {
      const textEl = btn.querySelector(".block");
      this.originalText = textEl?.textContent || "";
      this.originalHtml = btn.innerHTML;
    } else if (document.querySelector("#layer-product-list")) {
      this.originalText = "";
      this.originalHtml = btn.innerHTML;
    } else {
      this.originalText = btn.textContent || "";
    }

    btn.innerHTML = `<span class="spinner"></span><span class="button-text">${this.originalText}</span>`;
    this.button = btn;
    this.button.classList.add("atb-button");
    this.buttonText = btn.querySelector(".button-text");
  }

  setLoadingState() {
    if (!this.button) return;
    this.button.disabled = true;
    this.button.classList.add("loading");
    this.button.classList.remove("success");

    const isPLP = !!document.querySelector("#layer-product-list");
    if (isPLP || this.button.classList.contains("add-on-add-to-cart-btn")) {
      if (this.buttonText) this.buttonText.textContent = "";
    } else if (this.buttonText) {
      this.buttonText.textContent = "Adding";
    }
  }

  setSuccessState() {
    if (!this.button) return;
    this.button.classList.remove("loading");
    this.button.classList.add("success");
    this.button.disabled = false;

    const isAddon = this.button.classList.contains("add-on-add-to-cart-btn");
    const isPLP = !!document.querySelector("#layer-product-list");

    if (isAddon) {
      if (this.buttonText) {
        this.buttonText.innerHTML = `<svg class="success-check" width="2rem" height="2rem" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM18.4158 9.70405C18.8055 9.31268 18.8041 8.67952 18.4127 8.28984L17.7041 7.58426C17.3127 7.19458 16.6796 7.19594 16.2899 7.58731L10.5183 13.3838L7.19723 10.1089C6.80398 9.72117 6.17083 9.7256 5.78305 10.1189L5.08092 10.8309C4.69314 11.2241 4.69758 11.8573 5.09083 12.2451L9.82912 16.9174C10.221 17.3039 10.8515 17.301 11.2399 16.911L18.4158 9.70405Z" fill="#4AA35A"/></svg>`;
      }
    } else if (isPLP) {
      if (this.buttonText) this.buttonText.textContent = "";
    } else if (this.buttonText) {
      this.buttonText.textContent = "Added";
    }
  }

  resetButtonState() {
    if (!this.button) return;
    this.button.disabled = false;
    this.button.classList.remove("loading", "success");
    if (this.originalHtml) {
      this.button.innerHTML = this.originalHtml;
    } else if (this.buttonText) {
      this.buttonText.textContent = this.originalText;
    }
  }

  pushAddToCartEvent(event, form) {
    if (!window.dataLayer) return;
    if (typeof dataLayerParams !== "undefined" && dataLayerParams.items) {
      window.dataLayer.push({
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
      return;
    }

    const itemEl = event.target.closest("[data-product-sku]");
    const itemId = itemEl?.getAttribute("data-product-sku") || null;
    const itemTitle = itemEl?.querySelector("h4 span")?.textContent || null;
    const priceElement = itemEl?.querySelector(
      ".current-price [data-price-amount]",
    );
    const price = priceElement
      ? parseFloat(priceElement.getAttribute("data-price-amount"))
      : 0;
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    let itemCategory = pathParts[pathParts.length - 1] || "";
    itemCategory = itemCategory
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    window.dataLayer.push({
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

  async setupMiniBagTracking() {
    const cartDrawer = await waitForElement(
      "div[role='dialog'][aria-labelledby='cart-drawer-title']",
    );
    if (!cartDrawer) return;

    const isOpen = (el) => window.getComputedStyle(el).display !== "none";
    let wasOpen = isOpen(cartDrawer);

    const observer = new MutationObserver(() => {
      const nowOpen = isOpen(cartDrawer);
      if (nowOpen && !wasOpen) {
        setTimeout(() => {
          const viewBasketBtn = cartDrawer.querySelector(
            ".action.go-to-basket",
          );
          const checkoutBtn = cartDrawer.querySelector(
            ".action.go-to-checkout",
          );
          if (viewBasketBtn && !viewBasketBtn._tracked) {
            viewBasketBtn._tracked = true;
            viewBasketBtn.addEventListener("click", () => {
              if (window.dataLayer)
                window.dataLayer.push({
                  event: "add_to_cart",
                  ecommerce: null,
                });
            });
          }
          if (checkoutBtn && !checkoutBtn._tracked) {
            checkoutBtn._tracked = true;
            checkoutBtn.addEventListener("click", () => {
              if (window.dataLayer)
                window.dataLayer.push({
                  event: "add_to_cart",
                  ecommerce: null,
                });
            });
          }
        }, 100);
      }
      wasOpen = nowOpen;
    });
    observer.observe(cartDrawer, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }
}

// Initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new AddToBasketManager());
} else {
  new AddToBasketManager();
}
