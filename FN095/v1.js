// console.log("David Silva | FN095 variation 1");

window.dataLayer = window.dataLayer || [];

const GRID_SELECTOR = "#CollectionProductGrid";
const API_URL = "/api/2025-04/graphql.json";
// Public Storefront token, the same one the theme's compare tool sends
const API_TOKEN = "fb5c9d20856f6e9a1b447b9e284e0917";

const SUMMARY_QUERY =
  "query ($ids: [ID!]!) { nodes(ids: $ids) { ... on Product { id " +
  'weatherRating: metafield(namespace: "linedup", key: "weather_rating") { value } } } }';

// Every rule depends on the body class, so the styles can't apply before init runs
const STYLES = `
  body.fn095-v1 product-card .fn095-title,
  body.fn095-v1 product-card [data-ajax-product-card-price-2] p {
    font-size: 16px;
  }

  body.fn095-v1 product-card .fn095-summary {
    margin: 0 0 12px;
    font-size: 12px;
    line-height: 1.5;
  }
`;

// Product ID -> summary text, so the same product is never fetched twice
const summaryCache = new Map();

const addStyles = () => {
  const style = document.createElement("style");
  style.id = "fn095-styles";
  style.textContent = STYLES;
  document.head.append(style);
};

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

const getTallestHeight = (elements) =>
  Math.max(
    0,
    ...elements.map((element) =>
      Math.ceil(element.getBoundingClientRect().height),
    ),
  );

// Cards in the same row share the same top position on the page
const groupCardsByRow = (cards) => {
  const rows = new Map();

  cards.forEach((card) => {
    const rowTop = Math.round(card.getBoundingClientRect().top);
    if (!rows.has(rowTop)) rows.set(rowTop, []);
    rows.get(rowTop).push(card);
  });

  return [...rows.values()];
};

const matchHeights = (elements) => {
  const tallestHeight = getTallestHeight(elements);
  elements.forEach((element) => {
    element.style.minHeight = tallestHeight + "px";
  });
};

const equaliseHeights = () => {
  const grid = document.querySelector(GRID_SELECTOR);
  if (!grid) return;

  // Clear the old heights first so every element can shrink back to its natural height
  grid
    .querySelectorAll(".fn095-badge, .fn095-title, .fn095-summary")
    .forEach((element) => {
      element.style.removeProperty("min-height");
    });

  const cards = [...grid.querySelectorAll("product-card[id]")].filter((card) =>
    card.querySelector(".fn095-summary"),
  );

  groupCardsByRow(cards).forEach((rowCards) => {
    matchHeights(
      rowCards
        .map((card) => card.querySelector(".fn095-badge"))
        .filter(Boolean),
    );
    matchHeights(
      rowCards
        .map((card) => card.querySelector(".fn095-title"))
        .filter(Boolean),
    );
    matchHeights(rowCards.map((card) => card.querySelector(".fn095-summary")));
  });
};

// Waits for the next frame so many changes at once only trigger one measurement
let equaliseFrame = null;
const scheduleEqualise = () => {
  cancelAnimationFrame(equaliseFrame);
  equaliseFrame = requestAnimationFrame(equaliseHeights);
};

// Only width changes matter: our own min-heights change card heights and must not retrigger it
const cardWidths = new WeakMap();
const cardResizeObserver = new ResizeObserver((entries) => {
  let widthChanged = false;

  entries.forEach((entry) => {
    const width = Math.round(entry.contentRect.width);
    if (cardWidths.get(entry.target) !== width) widthChanged = true;
    cardWidths.set(entry.target, width);
  });

  if (widthChanged) scheduleEqualise();
});

const decorateCard = (card, summaryText) => {
  const price = card.querySelector("[data-ajax-product-card-price-2]");
  if (!price) return;

  // Every card has this badge wrapper; it's just empty when there's no "Just In" style badge
  const badge = card.querySelector(".flex.items-start.flex-wrap.mb-4");
  if (badge) badge.classList.add("fn095-badge");

  const title = price.previousElementSibling;
  if (title) title.classList.add("fn095-title");

  if (card.querySelector(".fn095-summary")) return;

  // Cards with no copy still get an empty summary so their price lines up with the rest
  const summary = document.createElement("p");
  summary.className = "fn095-summary";
  summary.textContent = summaryText || "";
  price.before(summary);

  cardResizeObserver.observe(card);
};

// Fires once per page view, the first time any card with copy is in the grid
let summaryDisplayedTracked = false;
const trackSummaryDisplayed = () => {
  if (summaryDisplayedTracked) return;

  const summaries = [
    ...document.querySelectorAll(GRID_SELECTOR + " .fn095-summary"),
  ];
  if (!summaries.some((summary) => summary.textContent)) return;

  summaryDisplayedTracked = true;

  // 1. PLP Product Summary Displayed
  window.dataLayer.push({
    event: "conversioEvent",
    conversio: {
      eventCategory: "Conversio CRO",
      eventAction: "FN095 | Event Tracking",
      eventLabel: "FN095 | (Variation 1) | PLP Product Summary Displayed",
      eventSegment: "FN095EV1G",
    },
  });
  // console.log("PLP Product Summary Displayed");
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
              eventLabel: "FN095 | (Variation 1) | ATB from PLP",
              eventSegment: "FN095EV1H",
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
            eventLabel: "FN095 | (Variation 1) | Selects colour",
            eventSegment: "FN095EV1J",
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
            eventLabel: "FN095 | (Variation 1) | PLP > PDP Click through",
            eventSegment: "FN095EV1I",
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
          eventLabel: "FN095 | (Variation 1) | Adds to comparison tool",
          eventSegment: "FN095EV1K",
        },
      });
      // console.log("Adds to comparison tool");
    },
    true,
  );
};

// Only handles cards without a summary yet, so it's safe to run any number of times
const processCards = async () => {
  const grid = document.querySelector(GRID_SELECTOR);
  if (!grid) return;

  const newCards = [...grid.querySelectorAll("product-card[id]")].filter(
    (card) => !card.querySelector(".fn095-summary"),
  );
  if (newCards.length === 0) return;

  try {
    const summaries = await fetchSummaries(newCards.map((card) => card.id));
    newCards.forEach((card) => decorateCard(card, summaries.get(card.id)));
    scheduleEqualise();
    trackSummaryDisplayed();
  } catch (error) {
    console.warn("FN095: could not load product summaries", error);
  }
};

// Filters, sort and Load more change many elements at once, so wait until they settle
let processTimer = null;
const scheduleProcessCards = () => {
  clearTimeout(processTimer);
  processTimer = setTimeout(processCards, 100);
};

const init = (grid) => {
  if (document.body.classList.contains("fn095-v1")) return;
  document.body.classList.add("fn095-v1");

  addStyles();
  watchQuickBuyAdds();
  watchCardClicks();
  watchCompareTicks();
  processCards();

  // Text measured before the web font loads can be the wrong height
  document.fonts.ready.then(scheduleEqualise);

  const gridObserver = new MutationObserver(scheduleProcessCards);
  gridObserver.observe(grid, { childList: true, subtree: true });
};

waitForElement(GRID_SELECTOR, init);
