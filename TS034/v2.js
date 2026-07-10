console.log("David Silva | TS034 | Variation 2: Booking Copy");

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
  cardTitle.textContent = "CONTINUE YOUR BOOKING";

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
  resumeBtn.textContent = "CONTINUE BOOKING";

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

    document.addEventListener("click", (e) => {
      // 'Search' Click - Mobile Search Modal Desktop Search Bar
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

        console.log("SEARCH Btn Click");
      }

      // "New Search" / Book Click (mobile only)
      if (e.target.closest(".module-newsearch-btn")) {
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "TS034 | Event Tracking",
            eventLabel: "TS034 | (Variation 1) | 'New Search' / Book Click",
            eventSegment: "TS034EV1G",
          },
        });

        console.log("NEW SEARCH Btn Click");
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

        console.log("RESUME Btn Click");
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

        console.log("Module Close Btn click");
      }
    });
  }
}

trackEvents();
