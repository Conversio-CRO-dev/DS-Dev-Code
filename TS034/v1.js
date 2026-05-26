console.log("David Silva | TS034");

function showModule() {
  createModule();
  console.log("Show Module in this page");
}

function hideModule() {
  const module = document.getElementById("booking-search-module");
  if (module) module.remove();
  console.log("Don't show Module");
}

// A timer variable to hold our debounce
let debounceTimer;

// Function to check the url
function checkUrl() {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const url = window.location.href;

    if (url.includes("booking?")) {
      const params = new URLSearchParams(new URL(url).search);
      const location = localStorage.getItem("lastSearchLocation") || "";

      const searchData = {
        location: location,
        date: params.get("searchdate") || "",
        adults: params.get("adults") || "",
        children: params.get("kids") || "",
      };

      localStorage.setItem("lastBookingSearch", JSON.stringify(searchData));
      localStorage.setItem("lastBookingUrl", url);
      hideModule();
    } else {
      showModule();
    }
  }, 300);
}

// Run on page load
checkUrl();

// Run on back/forward navigation
window.addEventListener("popstate", checkUrl);

// Run on silent URL changes (SPAs like React/Vue)
function interceptHistoryMethod(methodName) {
  const original = history[methodName];

  history[methodName] = function (...args) {
    const newUrl = args[2]; // the new URL being navigated to

    // The form is still in the DOM right now — save location before page changes
    if (newUrl && newUrl.toString().includes("booking?")) {
      const locationEl = document.querySelector("#booking-form span.truncate");
      if (locationEl && locationEl.innerText !== "Location") {
        localStorage.setItem("lastSearchLocation", locationEl.innerText);
      }
    }

    original.apply(this, args); // now navigate
    checkUrl();
  };
}

interceptHistoryMethod("pushState");
interceptHistoryMethod("replaceState");

function createModule() {
  if (document.getElementById("booking-search-module")) return;

  const card = document.createElement("div");
  card.id = "booking-search-module";

  const cardHeader = document.createElement("div");
  cardHeader.id = "booking-search-module-header";

  const cardTitle = document.createElement("span");
  cardTitle.className = "booking-search-module-title";
  cardTitle.textContent = "YOUR SAVED SEARCH";

  const closeBtn = document.createElement("button");
  closeBtn.id = "booking-search-module-close";
  closeBtn.textContent = "X";

  const cardBody = document.createElement("div");
  cardBody.id = "booking-search-module-body";

  function createRow(icon, text) {
    const row = document.createElement("div");
    row.className = "booking-search-module-row";
    row.innerHTML = `<span>${icon}</span><span>${text}</span>`;
    return row;
  }

  const savedData = JSON.parse(localStorage.getItem("lastBookingSearch"));
  if (!savedData) return;

  const locationRow = createRow("📍", savedData.location);
  const dateRow = createRow("📅", savedData.date);
  const adultsRow = createRow("👤", savedData.adults + "x Adults");
  const childrenRow = createRow("👥", savedData.children + "x Children");

  const cardFooter = document.createElement("div");
  cardFooter.id = "booking-search-module-footer";

  const resumeBtn = document.createElement("button");
  resumeBtn.className = "module-resume-btn";
  resumeBtn.textContent = "RESUME";

  const newsearchBtn = document.createElement("button");
  newsearchBtn.className = "module-newsearch-btn";
  newsearchBtn.textContent = "NEW SEARCH";

  cardFooter.append(resumeBtn, newsearchBtn);
  cardBody.append(locationRow, dateRow, adultsRow, childrenRow);
  cardHeader.append(cardTitle, closeBtn);
  card.append(cardHeader, cardBody, cardFooter);
  document.body.appendChild(card);

  closeBtn.addEventListener("click", () => {
    card.remove();
  });

  resumeBtn.addEventListener("click", () => {
    const savedUrl = localStorage.getItem("lastBookingUrl");

    if (savedUrl) {
      window.location.href = savedUrl;
    }
  });

  newsearchBtn.addEventListener("click", () => {
    const mobileBookBtn = document.querySelector(".show-mobile-form");

    if (mobileBookBtn) {
      mobileBookBtn.click();
    }
  });
}

function getCounterValue(labelText) {
  const counters = document.querySelectorAll(
    "#booking-form .flex.justify-between.gap-1",
  );

  for (const counter of counters) {
    const section = counter.parentElement;

    if (section.textContent.includes(labelText)) {
      return counter.querySelector("span").innerText;
    }
  }
}

function saveSearchData() {
  const locationEl = document.querySelector("#booking-form span.truncate");
  const dateEl = document.querySelector(
    '#booking-form input[name="searchdate"]',
  );

  if (!locationEl || !dateEl) {
    console.log("Search form elements not found");
    return;
  }

  const location = locationEl.innerText;
  const date = dateEl.value;
  const adults = getCounterValue("Adults");
  const children = getCounterValue("Children");

  const searchData = { location, date, adults, children };
  console.log("Search saved:", searchData);

  localStorage.setItem("lastBookingSearch", JSON.stringify(searchData));
}
