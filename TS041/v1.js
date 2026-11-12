// console.log("David Silva | TS041 variation 1");

(function () {
  if (window.ts041Loaded) return;
  window.ts041Loaded = true;

  const PREFIX = "ts041";

  // Tags each Adults/Children stepper (button, number, button) so the CSS can target it.
  // We add data attributes instead of classes because React rewrites className on re-render.
  function tagSteppers() {
    const numbers = document.querySelectorAll("form button + span");

    numbers.forEach(function (number) {
      const stepper = number.parentElement;
      if (stepper.hasAttribute("data-" + PREFIX + "-stepper")) return;
      if (
        stepper.children.length !== 3 ||
        stepper.lastElementChild.tagName !== "BUTTON"
      )
        return;
      if (!/^\d+$/.test(number.textContent.trim())) return;

      const row = stepper.parentElement;
      const type = /child/i.test(row.textContent) ? "children" : "adults";
      const widget = stepper.closest("#BookingModalDialog")
        ? "modal"
        : "inline";

      stepper.setAttribute("data-" + PREFIX + "-stepper", type);
      row.setAttribute("data-" + PREFIX + "-row", widget);

      // The inline bar's form gets its own tag so only its field widths change
      if (widget === "inline") {
        stepper
          .closest("form")
          .setAttribute("data-" + PREFIX + "-form", "inline");
      }
    });
  }

  // The modal only exists while open, so re-check on DOM changes (at most once per frame)
  function watchPage() {
    let scheduled = false;

    const observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        tagSteppers();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // "inline bar" or "modal", from the tag on the stepper's row
  function getWidgetType(element) {
    const row =
      element.querySelector("[data-" + PREFIX + "-row]") ||
      element.closest("[data-" + PREFIX + "-row]");
    return row && row.getAttribute("data-" + PREFIX + "-row") === "modal"
      ? "modal"
      : "inline bar";
  }

  function getCount(form, type) {
    const number = form.querySelector(
      "[data-" + PREFIX + '-stepper="' + type + '"] > span',
    );
    return number ? parseInt(number.textContent.trim(), 10) : 0;
  }

  // One listener on the document, in capture phase, so it sees every real customer click once
  // and before React handles it. isTrusted skips clicks made by code.
  function watchEvents() {
    window.dataLayer = window.dataLayer || [];

    document.addEventListener(
      "click",
      function (event) {
        if (!event.isTrusted) return;

        // 1. Quantity Button Click (disabled buttons send no click, so Children - at 0 is never counted)
        const button = event.target.closest(
          "[data-" + PREFIX + "-stepper] > button",
        );
        if (button) {
          const stepper = button.parentElement;
          // console.log("TS041 | Quantity Button Click", {
          //   participant_type: stepper.getAttribute(
          //     "data-" + PREFIX + "-stepper",
          //   ),
          //   direction: button === stepper.lastElementChild ? "plus" : "minus",
          //   widget_type: getWidgetType(stepper),
          // });

          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "TS041 | Event Tracking",
              eventLabel: "TS041 | (Variation 1) | Quantity Button Click",
              eventSegment: "TS041EV1G",
            },
          });
          return;
        }

        // 4. Booking Widget Search Click (only the booking form, the one holding our steppers)
        const search = event.target.closest('button[type="submit"]');
        const form = search && search.closest("form");
        if (form && form.querySelector("[data-" + PREFIX + "-stepper]")) {
          const adults = getCount(form, "adults");
          const children = getCount(form, "children");
          // console.log("TS041 | Booking Widget Search Click", {
          //   adults: adults,
          //   children: children,
          //   total_participants: adults + children,
          //   widget_type: getWidgetType(form),
          // });

          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              eventCategory: "Conversio CRO",
              eventAction: "TS041 | Event Tracking",
              eventLabel: "TS041 | (Variation 1) | Booking Widget Search Click",
              eventSegment: "TS041EV1J",
            },
          });
        }
      },
      true,
    );
  }

  document.body.classList.add(PREFIX + "-v1");
  tagSteppers();
  watchPage();
  watchEvents();
})();
