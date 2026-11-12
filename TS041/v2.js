// console.log("David Silva | TS041 variation 2");

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

      addBox(stepper, number, type);
      guardSearch(stepper.closest("form"));
    });
  }

  // Adds our typeable box next to React's number. React keeps the real count;
  // the box mirrors it, and drives it by clicking React's own buttons.
  function addBox(stepper, number, type) {
    const box = document.createElement("input");
    box.type = "text";
    box.className = PREFIX + "-box";
    box.setAttribute("inputmode", "numeric");
    box.setAttribute("pattern", "[0-9]*");
    box.setAttribute("autocomplete", "off");
    box.setAttribute(
      "aria-label",
      type === "adults" ? "Number of adults" : "Number of children",
    );
    box.value = readCount(number);

    // Inserted as a sibling, never inside the span: React replaces the span's text on every update
    number.after(box);

    let applying = false;
    let skipNextMouseUp = false;
    // True once the customer types, so Field Commit only fires for typed values
    let typed = false;

    // Whenever React changes the number (+ or - clicked), copy it into the box.
    // Skipped while typing, and while we apply a typed value (otherwise it would count up 1, 2, 3...)
    const observer = new MutationObserver(function () {
      if (applying || document.activeElement === box) return;
      box.value = readCount(number);
    });
    observer.observe(number, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    // True while the customer is in another tab/app with the box still focused
    let leftWindow = false;

    // Select the whole number so typing replaces it
    box.addEventListener("focus", function () {
      // Coming back from another tab/app: the browser refocuses the box by itself.
      // Not a customer tap, so no Focus event and no re-select (keeps what they were typing)
      if (leftWindow) {
        leftWindow = false;
        return;
      }

      // 2. Quantity Field Focus
      // console.log("TS041 | Quantity Field Focus", {
      //   participant_type: type,
      //   widget_type: getWidgetType(stepper),
      // });

      window.dataLayer.push({
        event: "conversioEvent",
        conversio: {
          eventCategory: "Conversio CRO",
          eventAction: "TS041 | Event Tracking",
          eventLabel: "TS041 | (Variation 2) | Quantity Field Focus",
          eventSegment: "TS041EV2H",
        },
      });

      box.select();
      skipNextMouseUp = true;
      // iOS ignores select() during focus, so select again just after
      setTimeout(function () {
        box.setSelectionRange(0, box.value.length);
      }, 0);
    });

    // Chrome clears the selection on the mouseup that follows a click-to-focus
    box.addEventListener("mouseup", function (event) {
      if (!skipNextMouseUp) return;
      skipNextMouseUp = false;
      event.preventDefault();
    });

    // Digits only, also strips non-digits from pasted text
    box.addEventListener("input", function () {
      const digits = box.value.replace(/\D/g, "");
      if (digits !== box.value) box.value = digits;
      typed = true;
    });

    // Enter applies the value but must not submit the form (no Search).
    // Enter from a phone keypad is its Done / Go key (Android)
    box.addEventListener("keydown", function (event) {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commit(isTouchDevice() ? "done" : "enter").then(function () {
        box.select();
      });
    });

    box.addEventListener("blur", function (event) {
      // The whole window lost focus (tab/app switch), not the box: keep the typed value pending.
      // Search and + / - still apply it if clicked, as they do for any pending value
      if (!document.hasFocus()) {
        leftWindow = true;
        // Back in the window but focus went elsewhere (box not refocused): treat it as leaving the box
        window.addEventListener(
          "focus",
          function () {
            setTimeout(function () {
              if (!leftWindow || document.activeElement === box) return;
              leftWindow = false;
              commit("blur");
            }, 0);
          },
          { once: true },
        );
        return;
      }

      commit(getBlurMethod(event));
    });

    // Applies the value and, if the customer typed it, reports how they committed it
    function commit(method) {
      const wasTyped = typed && box.value !== "";
      typed = false;

      return apply().then(function () {
        if (!wasTyped) return;
        // 3. Quantity Field Commit
        // console.log("TS041 | Quantity Field Commit", {
        //   participant_type: type,
        //   value: parseInt(readCount(number), 10),
        //   // App switch while typing: the page is hidden by now, so it's not a Done tap
        //   method: document.hidden ? "blur" : method,
        //   widget_type: getWidgetType(stepper),
        // });

        window.dataLayer.push({
          event: "conversioEvent",
          conversio: {
            eventCategory: "Conversio CRO",
            eventAction: "TS041 | Event Tracking",
            eventLabel: "TS041 | (Variation 2) | Quantity Field Commit",
            eventSegment: "TS041EV2I",
          },
        });
      });
    }

    // Applies run one after another, so two can never click at the same time and overshoot
    let queue = Promise.resolve();

    // Sends the typed value to React. Empty goes back to the last valid number
    function apply() {
      if (box.value === "") {
        box.value = readCount(number);
        return queue;
      }

      const target = parseInt(box.value, 10);
      box.value = String(target);
      applying = true;

      queue = queue
        .then(function () {
          return setCount(stepper, number, target);
        })
        .then(function () {
          applying = false;
          box.value = readCount(number);
        });
      return queue;
    }

    // True while a typed value hasn't fully reached React yet
    function isPending() {
      return applying || box.value !== readCount(number);
    }

    // Search (in guardSearch) uses these to apply any pending value first
    box[PREFIX + "Apply"] = apply;
    box[PREFIX + "IsPending"] = isPending;

    // + and - act on what is typed: hold the customer's click, apply the typed value, then replay it.
    // Capture phase on the stepper runs before React's own click handler.
    stepper.addEventListener(
      "click",
      function (event) {
        // Our own clicks (applying and replays) are not "trusted", so they go straight to React
        if (!event.isTrusted) return;

        const button = event.target.closest("button");
        if (!button || !isPending()) return;

        event.preventDefault();
        event.stopPropagation();
        apply().then(function () {
          if (!button.disabled) button.click();
        });
      },
      true,
    );
  }

  // Search uses the typed value even if the customer clicks it straight from the box:
  // hold the click, apply every pending box in this form, then replay the click
  function guardSearch(form) {
    if (form.hasAttribute("data-" + PREFIX + "-guarded")) return;
    form.setAttribute("data-" + PREFIX + "-guarded", "");

    form.addEventListener(
      "click",
      function (event) {
        if (!event.isTrusted) return;

        const search = event.target.closest('button[type="submit"]');
        if (!search) return;

        const pendingBoxes = Array.from(
          form.querySelectorAll("." + PREFIX + "-box"),
        ).filter(function (box) {
          return box[PREFIX + "IsPending"]();
        });
        if (pendingBoxes.length === 0) return;

        event.preventDefault();
        event.stopPropagation();
        Promise.all(
          pendingBoxes.map(function (box) {
            return box[PREFIX + "Apply"]();
          }),
        ).then(function () {
          search.click();
        });
      },
      true,
    );
  }

  function readCount(number) {
    return number.textContent.trim();
  }

  function isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
  }

  // Remembers the last tap/click and Tab key, so a blur can be told apart from iPhone's Done
  let lastPointerDown = 0;
  let lastTabKey = 0;

  document.addEventListener(
    "pointerdown",
    function () {
      lastPointerDown = Date.now();
    },
    true,
  );

  document.addEventListener(
    "keydown",
    function (event) {
      if (event.key === "Tab") lastTabKey = Date.now();
    },
    true,
  );

  // iPhone's Done button is browser chrome and sends nothing to the page. So a blur with
  // no recent tap, no Tab and no new focused field (keypad arrows) on a touch device is Done.
  function getBlurMethod(event) {
    const recently = Date.now() - 500;
    if (
      lastPointerDown > recently ||
      lastTabKey > recently ||
      event.relatedTarget
    )
      return "blur";
    return isTouchDevice() ? "done" : "blur";
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

  // Reads the box (what the customer typed), or React's number if the box is empty
  function getCount(form, type) {
    const stepper = form.querySelector(
      "[data-" + PREFIX + '-stepper="' + type + '"]',
    );
    if (!stepper) return 0;
    const box = stepper.querySelector("." + PREFIX + "-box");
    const value =
      box && box.value !== ""
        ? box.value
        : readCount(stepper.querySelector("span"));
    return parseInt(value, 10);
  }

  // One listener on the document, in capture phase, so it sees every real customer click once
  // and before React or our guards handle it. isTrusted skips our own apply clicks and replays.
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
              eventLabel: "TS041 | (Variation 2) | Quantity Button Click",
              eventSegment: "TS041EV2G",
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
              eventLabel: "TS041 | (Variation 2) | Booking Widget Search Click",
              eventSegment: "TS041EV2J",
            },
          });
        }
      },
      true,
    );
  }

  // Clicks React's own + or - one at a time until its number matches the target.
  // Clicks must be spaced: React only counts one of several clicks fired in a row.
  async function setCount(stepper, number, target) {
    const minus = stepper.firstElementChild;
    const plus = stepper.lastElementChild;
    let current = parseInt(readCount(number), 10);

    while (current !== target) {
      const button = target > current ? plus : minus;
      if (button.disabled) break;

      const before = readCount(number);
      button.click();
      const changed = await waitForChange(number, before);
      // Safety stop: if React didn't respond, don't keep clicking forever
      if (!changed) break;

      current = parseInt(readCount(number), 10);
    }
  }

  // Resolves true as soon as React re-renders the number, or false after 500ms
  function waitForChange(number, before) {
    return new Promise(function (resolve) {
      if (readCount(number) !== before) {
        resolve(true);
        return;
      }

      const timer = setTimeout(function () {
        observer.disconnect();
        resolve(false);
      }, 500);

      const observer = new MutationObserver(function () {
        if (readCount(number) === before) return;
        observer.disconnect();
        clearTimeout(timer);
        resolve(true);
      });
      observer.observe(number, {
        childList: true,
        characterData: true,
        subtree: true,
      });
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

  document.body.classList.add(PREFIX + "-v2");
  tagSteppers();
  watchPage();
  watchEvents();
})();
