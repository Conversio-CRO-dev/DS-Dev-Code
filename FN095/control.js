// console.log("David Silva | FN095 control");

window.dataLayer = window.dataLayer || [];

const GRID_SELECTOR = "#CollectionProductGrid";
const API_URL = "/api/2025-04/graphql.json";
// Public Storefront token, the same one the theme's compare tool sends
const API_TOKEN = "fb5c9d20856f6e9a1b447b9e284e0917";

const SUMMARY_QUERY =
  "query ($ids: [ID!]!) { nodes(ids: $ids) { ... on Product { id " +
  'weatherRating: metafield(namespace: "linedup", key: "weather_rating") { value } } } }';

// Product ID -> summary text, so the same product is never fetched twice
const summaryCache = new Map();

const waitForElement = (selector, callback, attemptsLeft = 50) => {
  const element = document.querySelector(selector);

  if (element) {
    callback(element);
    return;
  }

  if (attemptsLeft > 0) {
    setTimeout(() => waitForElement(selector, callback, attemptsLeft - 1), 100);
  }
};

const fetchSummaries = async (productIds) => {
  const idsToFetch = productIds.filter((id) => !summaryCache.has(id));

  if (idsToFetch.length === 0) return summaryCache;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-shopify-storefront-access-token": API_TOKEN,
    },
    body: JSON.stringify({
      query: SUMMARY_QUERY,
      variables: { ids: idsToFetch.map((id) => "gid://shopify/Product/" + id) },
    }),
  });

  if (!response.ok)
    throw new Error("Storefront API responded with " + response.status);

  const result = await response.json();

  // Cache every requested ID first, so products with no copy aren't requested again
  idsToFetch.forEach((id) => summaryCache.set(id, ""));

  result.data.nodes.forEach((product) => {
    if (!product || !product.weatherRating) return;

    const productId = product.id.replace("gid://shopify/Product/", "");
    summaryCache.set(productId, product.weatherRating.value);
  });

  return summaryCache;
};

let gridObserver = null;
let summaryDisplayedTracked = false;

// Fires once per page view, the first time any card in the grid has copy V1 would show
const checkForSummaries = async () => {
  if (summaryDisplayedTracked) return;

  const grid = document.querySelector(GRID_SELECTOR);
  if (!grid) return;

  const productIds = [...grid.querySelectorAll("product-card[id]")].map(
    (card) => card.id,
  );
  if (productIds.length === 0) return;

  try {
    const summaries = await fetchSummaries(productIds);

    // Checked again after the fetch in case another check finished first
    if (summaryDisplayedTracked || !productIds.some((id) => summaries.get(id)))
      return;

    summaryDisplayedTracked = true;
    // Nothing else in Control needs to react to grid changes
    if (gridObserver) gridObserver.disconnect();

    // 1. PLP Product Summary Displayed
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "FN095 | Event Tracking",
        eventLabel:
          "FN095 | (Control Original) | PLP Product Summary Displayed",
        eventSegment: "FN095ECOG",
      },
    });
    // console.log("PLP Product Summary Displayed");
  } catch (error) {
    console.warn("FN095: could not load product summaries", error);
  }
};

const getFormValue = (body, key) => {
  if (body instanceof FormData || body instanceof URLSearchParams)
    return body.get(key);
  if (typeof body === "string") return new URLSearchParams(body).get(key);
  return null;
};

// PLP Quick Buy sends the product grid's section ID, other add to bags on the page don't
const isPlpQuickBuy = (resource, options) => {
  const url = resource instanceof Request ? resource.url : String(resource);
  if (!url.includes("/cart/add")) return false;

  const sectionId = getFormValue(options && options.body, "section-id");
  return Boolean(sectionId && sectionId.includes("collection-product-loop"));
};

// Wraps fetch to see the theme's add to bag requests; every request still goes through unchanged
const watchQuickBuyAdds = () => {
  const originalFetch = window.fetch;

  window.fetch = (...args) => {
    const request = originalFetch(...args);

    if (isPlpQuickBuy(args[0], args[1])) {
      request
        .then((response) => {
          if (!response.ok) return;

          // 2. ATB from PLP
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "FN095 | Event Tracking",
              eventLabel: "FN095 | (Control Original) | ATB from PLP",
              eventSegment: "FN095ECOH",
            },
          });
          // console.log("ATB from PLP");
        })
        .catch(() => {});
    }

    return request;
  };
};

// One listener on the page covers new cards from filters, sort and Load more.
// Capture phase so it still runs if a theme script stops the click bubbling up.
const watchCardClicks = () => {
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest(
        GRID_SELECTOR + " product-card a[href*='/products/']",
      );
      if (!link) return;

      if (link.matches("[data-swatch]")) {
        // 4. Selects colour
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN095 | Event Tracking",
            eventLabel: "FN095 | (Control Original) | Selects colour",
            eventSegment: "FN095ECOJ",
          },
        });
        // console.log("Selects colour");
      } else {
        // 3. PLP > PDP Click through
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "FN095 | Event Tracking",
            eventLabel: "FN095 | (Control Original) | PLP > PDP Click through",
            eventSegment: "FN095ECOI",
          },
        });
        // console.log("PLP > PDP Click through");
      }
    },
    true,
  );
};

// The Compare label ticks a hidden checkbox, which fires "change"; unticking is ignored
const watchCompareTicks = () => {
  document.addEventListener(
    "change",
    (event) => {
      const checkbox = event.target.closest(
        GRID_SELECTOR + " product-card input[name='compare-products']",
      );
      if (!checkbox || !checkbox.checked) return;

      // 5. Adds to comparison tool
      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "FN095 | Event Tracking",
          eventLabel: "FN095 | (Control Original) | Adds to comparison tool",
          eventSegment: "FN095ECOK",
        },
      });
      // console.log("Adds to comparison tool");
    },
    true,
  );
};

// Filters, sort and Load more change many elements at once, so wait until they settle
let checkTimer = null;
const scheduleCheckForSummaries = () => {
  clearTimeout(checkTimer);
  checkTimer = setTimeout(checkForSummaries, 100);
};

const init = (grid) => {
  if (document.body.classList.contains("fn095-control")) return;
  document.body.classList.add("fn095-control");

  watchQuickBuyAdds();
  watchCardClicks();
  watchCompareTicks();

  gridObserver = new MutationObserver(scheduleCheckForSummaries);
  gridObserver.observe(grid, { childList: true, subtree: true });

  checkForSummaries();
};

waitForElement(GRID_SELECTOR, init);
