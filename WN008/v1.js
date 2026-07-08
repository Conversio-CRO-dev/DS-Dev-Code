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

elementReady("ul.burgerNavTopLevelList").then((hamburgerNavMenuList) => {
  if (hamburgerNavMenuList) {
    Array.from(
      document.querySelectorAll(
        "li.burgerNavSubmenuItem div.burgerNavSubmenuItemInner > a.burgerNavSubmenuLink",
      ),
    ).forEach((item) => {
      const text = item.textContent.toLowerCase().trim();
      if (text === "breaks") {
        item.parentNode.remove();
        // console.log('Target found and removed from hamburger menu list...');
      }
    });
  }
});

elementReady("ul.hotelNavList ").then((deskNavMenuList) => {
  if (deskNavMenuList) {
    Array.from(
      document.querySelectorAll(
        "ul.hotelNavList li.hotelNavItem a.hotelNavLink",
      ),
    ).forEach((item) => {
      const text = item.textContent.toLowerCase().trim();
      if (text === "breaks") {
        item.parentNode.remove();
        // console.log('Target found and removed from desk nav menu list...');
      }
    });
  }
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

function trackEvents() {
  if (!document.querySelector("body").classList.contains("TS036")) {
    document.querySelector("body").classList.add("TS036");
    // Hamburger Menu List
    Array.from(document.querySelectorAll("a.burgerNavSubmenuLink")).forEach(
      (item) => {
        if (item.textContent.toLowerCase().trim() === "rooms") {
          item.addEventListener("click", (e) => {
            e.preventDefault();
            const href = item.href;

            /* Event snippet — segment: WN008EV1I */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "WN008 | Event Tracking",
                event_label: "WN008 | (Variation 1) | Rooms Nav Link Click",
                event_segment: "WN008EV1I",
              },
            });

            debugShow("rooms hamburger nav click");
            setTimeout(() => {
              window.location.href = href;
            }, 300);
          });
        } else if (item.textContent.toLowerCase().trim() === "dining") {
          item.addEventListener("click", (e) => {
            e.preventDefault();
            const href = item.href;

            /* Event snippet — segment: WN008EV1J */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "WN008 | Event Tracking",
                event_label: "WN008 | (Variation 1) | Dining Nav Link Click",
                event_segment: "WN008EV1J",
              },
            });

            debugShow("dining hamburger nav click");
            setTimeout(() => {
              window.location.href = href;
            }, 300);
          });
        } else if (item.textContent.toLowerCase().trim() === "spa") {
          item.addEventListener("click", (e) => {
            e.preventDefault();
            const href = item.href;

            /* Event snippet — segment: WN008EV1K */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "WN008 | Event Tracking",
                event_label: "WN008 | (Variation 1) | SPA Nav Link Click",
                event_segment: "WN008EV1K",
              },
            });

            debugShow("SPA hamburger nav click");
            setTimeout(() => {
              window.location.href = href;
            }, 300);
          });
        } else if (item.textContent.toLowerCase().trim() === "entertainment") {
          item.addEventListener("click", (e) => {
            e.preventDefault();
            const href = item.href;

            /* Event snippet — segment: WN008EV1L */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "WN008 | Event Tracking",
                event_label:
                  "WN008 | (Variation 1) | Entertainment Nav Link Click",
                event_segment: "WN008EV1L",
              },
            });

            debugShow("entertainment hamburger nav click");
            setTimeout(() => {
              window.location.href = href;
            }, 300);
          });
        } else if (item.textContent.toLowerCase().trim() === "experiences") {
          item.addEventListener("click", (e) => {
            e.preventDefault();
            const href = item.href;

            /* Event snippet — segment: WN008EV1M */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "WN008 | Event Tracking",
                event_label:
                  "WN008 | (Variation 1) | Experiences Nav Link Click",
                event_segment: "WN008EV1M",
              },
            });

            debugShow("experiences hamburger nav click");
            setTimeout(() => {
              window.location.href = href;
            }, 300);
          });
        } else if (item.textContent.toLowerCase().trim() === "what's nearby") {
          item.addEventListener("click", (e) => {
            e.preventDefault();
            const href = item.href;

            /* Event snippet — segment: WN008EV1N */
            window.dataLayer.push({
              event: "conversioEvent",
              conversio: {
                event_category: "Conversio CRO",
                event_action: "WN008 | Event Tracking",
                event_label: "WN008 | (Variation 1) | Whats Nearby Link Click",
                event_segment: "WN008EV1N",
              },
            });

            debugShow("What's nearby hamburger nav click");
            setTimeout(() => {
              window.location.href = href;
            }, 300);
          });
        }
      },
    );

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

        debugShow("Burger Nav Opened");
      }

      // 2a Desktop hover location links
      const reserveByWarner = e.target.closest(
        ".globalNavDropdownMulticolumnMenu .subMenuColumn.themeReserve a",
      );
      if (reserveByWarner) {
        e.preventDefault();
        const href = reserveByWarner.href;
        locationNavLinkClick(reserveByWarner.textContent.trim());
        debugShow("Location Click - " + reserveByWarner.textContent.trim());
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }

      const warnerHotels = e.target.closest(
        ".globalNavDropdownMulticolumnMenu .subMenuColumn.themeWarner a",
      );
      if (warnerHotels) {
        e.preventDefault();
        const href = warnerHotels.href;
        locationNavLinkClick(warnerHotels.textContent.trim());
        debugShow("Location Click - " + warnerHotels.textContent.trim());
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }

      const warnerComfort = e.target.closest(
        ".globalNavDropdownMulticolumnMenu .subMenuColumn.themeComfort a",
      );
      if (warnerComfort) {
        e.preventDefault();
        const href = warnerComfort.href;
        locationNavLinkClick(warnerComfort.textContent.trim());
        debugShow("Location Click - " + warnerComfort.textContent.trim());
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }

      // 2b Mobile Nav location links
      const mobileHotelLink = e.target.closest(
        ".burgerNavMobileLevel ul.burgerNavSubmenuList.themeReserve a.burgerNavSubmenuLink",
      );
      if (mobileHotelLink) {
        e.preventDefault();
        const href = mobileHotelLink.href;
        locationNavLinkClick(mobileHotelLink.textContent.trim());
        debugShow("Mobile Reserve - " + mobileHotelLink.textContent.trim());
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }

      const mobileWarnerLink = e.target.closest(
        ".burgerNavMobileLevel ul.burgerNavSubmenuList.themeWarner a.burgerNavSubmenuLink",
      );
      if (mobileWarnerLink) {
        e.preventDefault();
        const href = mobileWarnerLink.href;
        locationNavLinkClick(mobileWarnerLink.textContent.trim());
        debugShow("Mobile Warner - " + mobileWarnerLink.textContent.trim());
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }

      const mobileComfortLink = e.target.closest(
        ".burgerNavMobileLevel ul.burgerNavSubmenuList.themeComfort a.burgerNavSubmenuLink",
      );
      if (mobileComfortLink) {
        e.preventDefault();
        const href = mobileComfortLink.href;
        locationNavLinkClick(mobileComfortLink.textContent.trim());
        debugShow("Mobile Comfort - " + mobileComfortLink.textContent.trim());
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }

      // Desk&Mobile Menu List
      Array.from(
        document.querySelectorAll(
          "ul.hotelNavList li.hotelNavItem a.hotelNavLink",
        ),
      ).forEach((item) => {
        if (item.contains(e.target) && item.dataset.text === "ROOMS") {
          e.preventDefault();
          const href = item.href;

          /* Event snippet — segment: WN008EV1I */
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN008 | Event Tracking",
              event_label: "WN008 | (Variation 1) | Rooms Nav Link Click",
              event_segment: "WN008EV1I",
            },
          });

          debugShow("ROOMS Click");
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        } else if (item.contains(e.target) && item.dataset.text === "DINING") {
          e.preventDefault();
          const href = item.href;

          /* Event snippet — segment: WN008EV1J */
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN008 | Event Tracking",
              event_label: "WN008 | (Variation 1) | Dining Nav Link Click",
              event_segment: "WN008EV1J",
            },
          });

          debugShow("DINING Click");
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        } else if (item.contains(e.target) && item.dataset.text === "SPA") {
          e.preventDefault();
          const href = item.href;

          /* Event snippet — segment: WN008EV1K */
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN008 | Event Tracking",
              event_label: "WN008 | (Variation 1) | SPA Nav Link Click",
              event_segment: "WN008EV1K",
            },
          });

          debugShow("SPA Click");
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        } else if (
          item.contains(e.target) &&
          item.dataset.text === "ENTERTAINMENT"
        ) {
          e.preventDefault();
          const href = item.href;

          /* Event snippet — segment: WN008EV1L */
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN008 | Event Tracking",
              event_label:
                "WN008 | (Variation 1) | Entertainment Nav Link Click",
              event_segment: "WN008EV1L",
            },
          });

          debugShow("ENTERTAINMENT Click");
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        } else if (
          item.contains(e.target) &&
          item.dataset.text === "EXPERIENCES"
        ) {
          e.preventDefault();
          const href = item.href;

          /* Event snippet — segment: WN008EV1M */
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN008 | Event Tracking",
              event_label: "WN008 | (Variation 1) | Experiences Nav Link Click",
              event_segment: "WN008EV1M",
            },
          });

          debugShow("EXPERIENCES Click");
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        } else if (
          item.contains(e.target) &&
          item.dataset.text === "WHAT'S NEARBY"
        ) {
          e.preventDefault();
          const href = item.href;

          /* Event snippet — segment: WN008EV1N */
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "WN008 | Event Tracking",
              event_label: "WN008 | (Variation 1) | Whats Nearby Link Click",
              event_segment: "WN008EV1N",
            },
          });

          debugShow("WHAT'S NEARBY");
          setTimeout(() => {
            window.location.href = href;
          }, 300);
        }
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

        debugShow("Header Book CTA Click");
      }
    });
  }
}

trackEvents();
