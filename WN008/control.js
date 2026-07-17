// console.log("David Silva | WN008 - Dummy Control");

/* Control snippet — segment: WN008.XCO */
function waitForDataLayer(callback) {
  let checkInterval = setInterval(() => {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      clearInterval(checkInterval);
      callback();
    }
  }, 100);
}

(function () {
  "use strict";

  var dl = (window.dataLayer = window.dataLayer || []);

  function isConsentUpdate(args) {
    return (
      args &&
      args.length >= 3 &&
      args[0] === "consent" &&
      args[1] === "update" &&
      args[2] &&
      args[2].analytics_storage === "granted"
    );
  }

  function handleConsentUpdate(obj) {
    waitForDataLayer(() => {
      window.dataLayer.push({
        event: "conversioExperience",
        conversio: {
          experience_category: "Conversio Experience",
          experience_action: "WN008 | Guided Hotel Hub Exploration",
          experience_label: "WN008 | Control Original",
          experience_segment: "WN008.XCO",
        },
      });
    });
  }

  // 1. Check historical pushes
  for (var i = 0; i < dl.length; i++) {
    if (isConsentUpdate(dl[i])) {
      handleConsentUpdate(dl[i][2]);
      return;
    }
  }

  // 2. Listen for future pushes
  var originalPush = dl.push;

  dl.push = function () {
    var args = Array.prototype.slice.call(arguments);

    for (var j = 0; j < args.length; j++) {
      if (isConsentUpdate(args[j])) {
        handleConsentUpdate(args[j][2]);
      }
    }

    return originalPush.apply(dl, arguments);
  };
})();

// Control keeps the "BREAKS" hotel hub nav item — no removal/MutationObserver here.

function locationNavLinkClick(location) {
  /* Event snippet — segment: WN008ECOH */
  window.dataLayer.push({
    event: "conversioEvent",
    conversio: {
      event_category: "Conversio CRO",
      event_action: "WN008 | Event Tracking",
      event_label:
        "WN008 | (Control Original) | Location Nav Link Click" + location,
      event_segment: "WN008ECOH",
    },
  });
}

function debugShow(label) {
  var div = document.createElement("div");
  div.style.cssText =
    "position:fixed;top:0;right:0;background:red;color:white;padding:20px;z-index:99999;font-size:16px;";
  div.textContent = label + " | FIRED!";
  document.body.appendChild(div);
  setTimeout(function () {
    div.remove();
  }, 2000);
}

// Known hub nav labels and their assigned segment codes. Breaks stays listed here
// (unlike v1) since control keeps the nav item instead of removing it. Anything
// clicked that isn't listed still gets tracked, just under the shared fallback code.
const hubNavSegments = {
  ROOMS: "WN008ECOI",
  DINING: "WN008ECOJ",
  SPA: "WN008ECOK",
  ENTERTAINMENT: "WN008ECOL",
  EXPERIENCES: "WN008ECOM",
  "WHAT'S NEARBY": "WN008ECON",
  BREAKS: "WN008ECOO",
};
const hubNavFallbackSegment = "WN008ECOQ";

function trackHubNavClick(label, href) {
  const segment = hubNavSegments[label] || hubNavFallbackSegment;

  window.dataLayer.push({
    event: "conversioEvent",
    conversio: {
      event_category: "Conversio CRO",
      event_action: "WN008 | Event Tracking",
      event_label: "WN008 | (Control Original) | " + label + " Nav Link Click",
      event_segment: segment,
    },
  });

  // debugShow(label + " Click");
  setTimeout(() => {
    window.location.href = href;
  }, 300);
}

function trackEvents() {
  if (!document.querySelector("body").classList.contains("TS036")) {
    document.querySelector("body").classList.add("TS036");

    document.addEventListener("click", (e) => {
      // 1 Burger Nav Opened
      if (e.target.closest(".pageHeaderButton.nav button")) {
        /* Event snippet — segment: WN008ECOG */
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN008 | Event Tracking",
            event_label: "WN008 | (Control Original) | Burger Nav Opened",
            event_segment: "WN008ECOG",
          },
        });

        // debugShow("Burger Nav Opened");
      }

      // Hamburger Menu List — hotel hub submenu (only rendered when a hotel is selected)
      const hamburgerHubLink = e.target.closest("a.burgerNavSubmenuLink");
      if (hamburgerHubLink && document.querySelector("ul.hotelNavList")) {
        const label = hamburgerHubLink.textContent.trim().toUpperCase();

        if (label) {
          e.preventDefault();
          trackHubNavClick(label, hamburgerHubLink.href);
        }
      }

      // Desk&Mobile Menu List
      Array.from(
        document.querySelectorAll(
          "ul.hotelNavList li.hotelNavItem a.hotelNavLink",
        ),
      ).forEach((item) => {
        if (!item.contains(e.target)) return;

        if (item.classList.contains("hotelNavLink--home")) {
          e.preventDefault();
          const hotelName = item.textContent.trim();

          locationNavLinkClick(hotelName);
          // debugShow("Hotel Home Link Click - " + hotelName);
          setTimeout(() => {
            window.location.href = item.href;
          }, 300);
          return;
        }

        e.preventDefault();
        trackHubNavClick(item.dataset.text, item.href);
      });

      // 10 Header Book CTA Click
      if (e.target.closest("a.pageHeaderCta--book")) {
        /* Event snippet — segment: WN008ECOP */
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN008 | Event Tracking",
            event_label: "WN008 | (Control Original) | Header Book CTA Click",
            event_segment: "WN008ECOP",
          },
        });

        // debugShow("Header Book CTA Click");
      }
    });
  }
}

trackEvents();
