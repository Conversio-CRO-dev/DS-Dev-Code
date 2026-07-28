// console.log("David Silva | TS034 Variation 1: Search Copy");

let flag = 0;

function showModule() {
  createModule();
  if (!window._ts034ShownTracked) {
    window._ts034ShownTracked = true;
    window.dataLayer.push({
      event: "conversioEvent",
      conversio: {
        eventCategory: "Conversio CRO",
        eventAction: "TS034 | Event Tracking",
        eventLabel: "TS034 | (Variation 1) | Module shown",
        eventSegment: "TS034EV1Q",
      },
    });
  }
}

function hideModule() {
  const module = document.getElementById("booking-search-module");
  if (module) module.remove();
  // console.log("Don't show Module");
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
      const activity = localStorage.getItem("lastSearchActivity") || "";

      const searchData = {
        activity: activity,
        location: location,
        date: params.get("searchdate") || "",
        adults: params.get("adults") || "",
        children: params.get("kids") || "",
      };

      localStorage.setItem("lastBookingSearch", JSON.stringify(searchData));
      localStorage.setItem("lastBookingUrl", url);
      hideModule();
    } else if (localStorage.getItem("lastBookingSearch")) {
      const dismissed = sessionStorage.getItem("ts034DismissedSearch");
      const currentSearch = localStorage.getItem("lastBookingSearch");
      if (dismissed !== currentSearch) {
        showModule();
      }
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

      const activityDropdown = document.querySelector(
        "#booking-form .activity",
      );
      if (activityDropdown) {
        const activityEl = activityDropdown.querySelector("span.truncate");
        if (activityEl) {
          localStorage.setItem("lastSearchActivity", activityEl.innerText);
        }
      } else {
        localStorage.setItem("lastSearchActivity", "Go Karting");
      }
    }

    original.apply(this, args); // now navigate
    checkUrl();
  };
}

interceptHistoryMethod("pushState");
interceptHistoryMethod("replaceState");

function formatDate(dateStr) {
  if (!dateStr) return dateStr;

  const [year, month, day] = dateStr.split("-");
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
}

function formatCount(count, singular, plural) {
  const n = parseInt(count, 10);
  return `${n} ${n === 1 ? singular : plural}`;
}

const ACTIVITY_IMAGES = [
  {
    keyword: "sim racing",
    url: "https://images.prismic.io/teamsport/aO-AlZ5xUNkB1-tA_UK-Bournemouth-Sim-Racing.jpg",
  },
  {
    keyword: "laser",
    url: "https://images.prismic.io/teamsport/Zo0eTh5LeNNTw70O_UK-Laser-Combat.png",
  },
  {
    keyword: "golf",
    url: "https://images.prismic.io/teamsport/Zz2u4q8jQArT1D-U_Puttclub-London-0301.png",
  },
  {
    keyword: "mini racers",
    url: "https://images.prismic.io/teamsport/aQNu_bpReVYa31rj_UK-Mini-Racers-Logo-4-.png",
  },
  {
    keyword: "bowling",
    url: "https://images.prismic.io/teamsport/afBoQsBOoF08xXHP_UK-TeamSport-Ten-Pin-Brent-Cross.png",
  },
  {
    keyword: "go karting",
    url: "https://images.prismic.io/teamsport/afmge8BOoF08xnAS_UK-Google-Go-Karting.png",
  },
];

const DEFAULT_ACTIVITY_IMAGE =
  "https://images.prismic.io/teamsport/afmge8BOoF08xnAS_UK-Google-Go-Karting.png";

function getActivityImage(activity) {
  const normalized = (activity || "").toLowerCase();
  const match = ACTIVITY_IMAGES.find((entry) =>
    normalized.includes(entry.keyword),
  );
  return match ? match.url : DEFAULT_ACTIVITY_IMAGE;
}

function createModule() {
  if (document.getElementById("booking-search-module")) return;

  const card = document.createElement("div");
  card.id = "booking-search-module";

  const cardHeader = document.createElement("div");
  cardHeader.id = "booking-search-module-header";

  const cardTitle = document.createElement("span");
  cardTitle.className = "booking-search-module-title";
  cardTitle.textContent = "CONTINUE YOUR SEARCH";

  const closeBtn = document.createElement("button");
  closeBtn.id = "booking-search-module-close";
  closeBtn.innerHTML = `
	  <svg aria-hidden="true" focusable="false" class="fill-current " viewBox="0 0 32 32" width="32" height="32">
	  	<use xlink:href="/assets/icons/icons.svg#Close" href="/assets/icons/icons.svg#Close"></use>
	  </svg>
  `;

  const cardBody = document.createElement("div");
  cardBody.id = "booking-search-module-body";

  const moduleSearchActivity = document.createElement("div");
  moduleSearchActivity.className = "module-search-activity";

  const activity = localStorage.getItem("lastSearchActivity") || "Go Karting";
  moduleSearchActivity.innerHTML = `<span>You were looking at <strong>${activity}</strong>:</span>`;

  const moduleBodyContainer = document.createElement("div");
  moduleBodyContainer.className = "module-body-container";

  const moduleBodyRightContent = document.createElement("div");
  moduleBodyRightContent.className = "module-body-right-content";

  const moduleBodyLeftContent = document.createElement("div");
  moduleBodyLeftContent.className = "module-body-left-content";
  moduleBodyLeftContent.innerHTML = `<img src="${getActivityImage(activity)}" alt="${activity}" loading="eager">`;

  function createRow(icon, text) {
    const row = document.createElement("div");
    row.className = "booking-search-module-row";
    row.innerHTML = `<span>${icon}</span><span>${text}</span>`;
    return row;
  }

  const savedData = JSON.parse(localStorage.getItem("lastBookingSearch"));
  if (!savedData) return;

  const ICONS = {
    location: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20"><use href="/assets/icons/icons.svg#Location"></use></svg>`,
    date: `<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="24" height="24"><use xlink:href="/assets/icons/icons.svg#Calendar" href="/assets/icons/icons.svg#Calendar"></use></svg>`,
    adults: `<svg aria-hidden="true" focusable="false" viewBox="0 0 30 30" width="20" height="20"><use href="/assets/icons/icons.svg#User"></use></svg>`,
    children: `<svg aria-hidden="true" focusable="false" viewBox="0 0 30 30" width="20" height="20"><use href="/assets/icons/icons.svg#IconPeople"></use></svg>`,
  };

  const adultSingular = activity === "Go Karting" ? "Adult" : "Participant";
  const adultPlural = activity === "Go Karting" ? "Adults" : "Participants";

  const locationRow = createRow(ICONS.location, savedData.location);
  const dateRow = createRow(ICONS.date, formatDate(savedData.date));

  moduleBodyRightContent.append(locationRow, dateRow);
  if (parseInt(savedData.adults, 10) > 0) {
    moduleBodyRightContent.append(
      createRow(
        ICONS.adults,
        formatCount(savedData.adults, adultSingular, adultPlural),
      ),
    );
  }

  if (parseInt(savedData.children, 10) > 0) {
    moduleBodyRightContent.append(
      createRow(
        ICONS.children,
        formatCount(savedData.children, "Child", "Children"),
      ),
    );
  }

  const cardFooter = document.createElement("div");
  cardFooter.id = "booking-search-module-footer";

  const resumeBtn = document.createElement("button");
  resumeBtn.className = "module-resume-btn";
  resumeBtn.textContent = "RESUME SEARCH";

  const newsearchBtn = document.createElement("button");
  newsearchBtn.className = "module-newsearch-btn";
  newsearchBtn.textContent = "NEW SEARCH";

  cardFooter.append(resumeBtn, newsearchBtn);
  cardBody.append(moduleBodyContainer);
  moduleBodyContainer.append(moduleBodyLeftContent, moduleBodyRightContent);
  cardHeader.append(cardTitle, closeBtn);
  card.append(cardHeader, moduleSearchActivity, cardBody, cardFooter);
  document.body.appendChild(card);

  closeBtn.addEventListener("click", () => {
    sessionStorage.setItem(
      "ts034DismissedSearch",
      localStorage.getItem("lastBookingSearch"),
    );
    card.classList.add("fade-out");
    card.addEventListener("transitionend", () => card.remove(), { once: true });
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

function trackEvents() {
  if (!document.querySelector("body").classList.contains("TS034")) {
    document.querySelector("body").classList.add("TS034");

    // 'Search' Click - Mobile Search Modal
    // Attached directly to the dialog, whenever it shows up in the DOM, instead of
    // delegated on document: the modal stops click propagation before it would
    // reach document, so a listener sitting on the dialog itself still catches it.
    // The dialog is destroyed and recreated (a new DOM node) each time it's
    // opened, so we track which specific node instances already have a
    // listener rather than attaching once and disconnecting.
    const trackedBookingModals = new WeakSet();

    function attachMobileSearchTracking(modal) {
      if (trackedBookingModals.has(modal)) return;
      trackedBookingModals.add(modal);

      modal.addEventListener("click", (e) => {
        if (e.target.closest('button[type="submit"]')) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "TS034 | Event Tracking",
              eventLabel: "TS034 | (Variation 1) |  'Search' Click ",
              eventSegment: "TS034EV1H",
            },
          });

          // console.log("SEARCH Btn Click");
        }
      });
    }

    const existingBookingModal = document.getElementById("BookingModalDialog");
    if (existingBookingModal) {
      attachMobileSearchTracking(existingBookingModal);
    }

    const bookingModalObserver = new MutationObserver(() => {
      const modal = document.getElementById("BookingModalDialog");
      if (modal) {
        attachMobileSearchTracking(modal);
      }
    });
    bookingModalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    document.addEventListener("click", (e) => {
      // 'Search' Click - Desktop Search Bar
      if (
        e.target.closest('button[type="submit"]') &&
        !e.target.closest("#BookingModalDialog")
      ) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "TS034 | Event Tracking",
            eventLabel: "TS034 | (Variation 1) |  'Search' Click ",
            eventSegment: "TS034EV1H",
          },
        });

        // console.log("SEARCH Btn Click");
      }

      // "New Search" Click (mobile)
      if (e.target.closest(".module-newsearch-btn")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "TS034 | Event Tracking",
            eventLabel: "TS034 | (Variation 1) | New Search Click (mobile)",
            eventSegment: "TS034EV1K",
          },
        });

        // console.log("NEW SEARCH Btn Click");
      }

      // "RESUME" Click
      if (e.target.closest(".module-resume-btn")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "TS034 | Event Tracking",
            eventLabel: "TS034 | (Variation 1) | 'RESUME' Click",
            eventSegment: "TS034EV1I",
          },
        });

        // console.log("RESUME Btn Click");
      }

      // Saved Search Module Close 'x'
      if (e.target.closest("#booking-search-module-close")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "TS034 | Event Tracking",
            eventLabel: "TS034 | (Variation 1) | Saved Search Module Close 'x'",
            eventSegment: "TS034EV1J",
          },
        });

        // console.log("Module Close Btn click");
      }

      // "BOOK NOW" Click (mobile) - isTrusted excludes the synthetic click NEW SEARCH triggers on this same button
      if (e.isTrusted && e.target.closest(".show-mobile-form")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "TS034 | Event Tracking",
            eventLabel: "TS034 | (Variation 1) | Book Click",
            eventSegment: "TS034EV1G",
          },
        });

        // console.log("BOOK NOW Btn click");
      }
    });
  }
}

trackEvents();
