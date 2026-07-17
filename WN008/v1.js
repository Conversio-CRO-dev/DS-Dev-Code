// console.log("David Silva | WN008 - Variation 1");

/* Variation 1 of 2 — segment: WN008.XV1 */
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
          experience_label: "WN008 | Variation 1",
          experience_segment: "WN008.XV1",
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

function removeBreaksFromHotelHub() {
  // Desktop hotel hub nav (pageHeaderHotelNavRow), only present on hotel pages
  Array.from(
    document.querySelectorAll("ul.hotelNavList li.hotelNavItem a.hotelNavLink"),
  ).forEach((item) => {
    if (item.textContent.toLowerCase().trim() === "breaks") {
      item.parentNode.remove();
    }
  });

  // Hamburger menu, hotel hub submenu (shares markup with the generic burger submenus)
  Array.from(
    document.querySelectorAll(
      "li.burgerNavSubmenuItem div.burgerNavSubmenuItemInner > a.burgerNavSubmenuLink",
    ),
  ).forEach((item) => {
    if (item.textContent.toLowerCase().trim() === "breaks") {
      item.parentNode.remove();
    }
  });
}

// Run immediately in case the hotel hub nav is already in the DOM.
removeBreaksFromHotelHub();

// Next.js swaps the header's nav content client-side (no full page reload) whenever
// the visitor lands on or leaves a hotel page, so this must keep watching and re-run
// on every DOM change, not just once, otherwise BREAKS reappears after navigation.
new MutationObserver(() => {
  removeBreaksFromHotelHub();
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

function locationNavLinkClick(location) {
  /* Event snippet — segment: WN008EV1H */
  window.dataLayer.push({
    event: "conversioEvent",
    conversio: {
      event_category: "Conversio CRO",
      event_action: "WN008 | Event Tracking",
      event_label: "WN008 | (Variation 1) | Location Nav Link Click" + location,
      event_segment: "WN008EV1H",
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

// Known hub nav labels and their assigned segment codes. Anything clicked that
// isn't listed here (a hotel showing an item we haven't seen yet, e.g. Activities)
// still gets tracked, just under the shared fallback code below.
const hubNavSegments = {
  ROOMS: "WN008EV1I",
  DINING: "WN008EV1J",
  SPA: "WN008EV1K",
  ENTERTAINMENT: "WN008EV1L",
  EXPERIENCES: "WN008EV1M",
  "WHAT'S NEARBY": "WN008EV1N",
};
const hubNavFallbackSegment = "WN008EV1Q";

function trackHubNavClick(label, href) {
  const segment = hubNavSegments[label] || hubNavFallbackSegment;

  window.dataLayer.push({
    event: "conversioEvent",
    conversio: {
      event_category: "Conversio CRO",
      event_action: "WN008 | Event Tracking",
      event_label: "WN008 | (Variation 1) | " + label + " Nav Link Click",
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
        /* Event snippet — segment: WN008EV1G */
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN008 | Event Tracking",
            event_label: "WN008 | (Variation 1) | Burger Nav Opened",
            event_segment: "WN008EV1G",
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
        /* Event snippet — segment: WN008EV1P */
        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            event_category: "Conversio CRO",
            event_action: "WN008 | Event Tracking",
            event_label: "WN008 | (Variation 1) | Header Book CTA Click",
            event_segment: "WN008EV1P",
          },
        });

        // debugShow("Header Book CTA Click");
      }
    });
  }
}

trackEvents();
