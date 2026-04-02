// console.log("=======================>");
// console.log("David Adam Silva | TS028");
// console.log("=======================>");

(function () {
  const TITLE_MATCH = "adult ultimate race experience";
  const STYLE_ID = "selling-fast-sa-style";
  const CARD_INIT_FLAG = "sellingFastInit";
  const DROPDOWN_BOUND_FLAG = "sellingFastDropdownBound";
  const DESKTOP_SLOT_COUNT = 3;
  const MOBILE_SLOT_COUNT = 2;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
			.selling-fast-pill-sa {
			  display: inline-flex;
			  align-items: center;
			  padding: 0.5rem 0.5rem 0.5rem 0.75rem;
			  border-radius: 0.5rem;
			  background: #ed8b00;
			  color: #111;
			  gap: 2px;
			  letter-spacing: 0.8px;
			  font-family: bebasneuepro-bold, bebasneuepro-bold-fallback;
			  white-space: nowrap;
			  line-height: 1;
			}
			
			.selling-fast-pill-sa svg {
			  width: 1.6rem;
			  height: 1.6rem;
			  display: block;
			  flex-shrink: 0;
			  vertical-align: middle;
			  position: relative;
			  top: -0.05rem;
			}
			
			.selling-fast-times-header-sa {
			  display: flex;
			  align-items: center;
			  justify-content: space-between;
			  gap: 12px;
			  margin-bottom: 8px;
			}
			
			.selling-fast-times-header-sa h2 {
			  margin-bottom: 0;
			}
			
			.selling-fast-mobile-pill-wrap-sa {
			  display: none;
			}
			
			.selling-fast-slot-sa {
			  border-color: #f5a000 !important;
			  position: relative;
			}
			
			.selling-fast-slot-sa .selling-fast-clock-sa {
			  position: absolute;
			  top: 8px;
			  right: 10px;
			  width: 18px;
			  height: 18px;
			  display: inline-flex;
			  align-items: center;
			  justify-content: center;
			  pointer-events: none;
			}
			
			.selling-fast-slot-sa .selling-fast-clock-sa svg {
			  width: 18px;
			  height: 18px;
			  display: block;
			}
			
			.selling-fast-dropdown-option-sa {
			  position: relative;
			}
			
			.selling-fast-option-content-sa {
			  display: inline-flex;
			  align-items: center;
			  gap: 6px;
			  white-space: nowrap;
			}
			
			.selling-fast-option-label-sa {
			  font-size: 0.9rem;
			  line-height: 1;
			  font-weight: 700;
			  letter-spacing: 0.5px;
			  text-transform: uppercase;
			  color: #111;
			  font-family: bebasneuepro-bold, bebasneuepro-bold-fallback;
			}
			
			.selling-fast-option-label-sa:before {
			  content: "- ";
			}
			
			.selling-fast-clock-inline-sa {
			  display: inline-flex;
			  align-items: center;
			  justify-content: center;
			  width: 18px;
			  height: 18px;
			  flex: 0 0 18px;
			}
			
			.selling-fast-clock-inline-sa svg {
			  width: 18px;
			  height: 18px;
			  display: block;
			}
			
			@media (max-width: 1024px) {
			  .selling-fast-mobile-pill-wrap-sa {
			    display: block;
			    width: 100%;
			  }
			
			  .selling-fast-mobile-pill-wrap-sa .selling-fast-pill-sa {
			    display: flex;
			    width: 100%;
			    justify-content: center;
			    align-items: center; /* Add this */
			    border-radius: 4px;
			  }
			
			  /* Add this to ensure SVG shows on mobile */
			  .selling-fast-mobile-pill-wrap-sa .selling-fast-pill-sa svg {
			    width: 1.4rem;
			    height: 1.4rem;
			    display: inline-block;
			    flex-shrink: 0;
			  }
			
			  .lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2 {
			    flex-direction: row !important;
			    flex-wrap: nowrap !important;
			    align-items: stretch !important;
			    gap: 0.75rem !important;
			  }
			
			  /* Target the card container */
			  li.flex.flex-col .flex.flex-col.gap-y-5.pt-5.pb-2.px-3 {
			    padding-left: 0.75rem !important;
			    padding-right: 0.75rem !important;
			    padding-top: 0.5rem !important;
			    padding-bottom: 0.5rem !important;
			    gap: 0.5rem !important;
			  }
			
			  /* Dropdown container - takes 70% */
			  .lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2 > div:first-child {
			    flex: 7 1 0% !important;
			    min-width: 0 !important;
			    width: 100% !important;
			  }
			
			  /* Book button container - takes 30% */
			  .lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2 > div:last-child {
			    flex: 3 1 0% !important;
			    min-width: 0 !important;
			    width: 100% !important;
			  }
			
			  /* Make both containers use full height and width */
			  .lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2 > div,
			  .mobile-dropdown-container,
			  .mobile-book-container {
			    display: flex !important;
			    align-items: stretch !important;
			    width: 100% !important;
			  }
			
			  /* Ensure dropdown button fills entire container */
			  .mobile-dropdown-container button,
			  .mobile-dropdown-container .relative {
			    width: 100% !important;
			    display: flex !important;
			  }
			
			  /* Style the dropdown button and book button consistently */
			  .lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2 button,
			  .lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2 a,
			  .mobile-dropdown-container button,
			  .mobile-book-container a {
			    width: 100% !important;
			    font-size: 16px !important;
			    padding: 0.75rem 0.5rem !important;
			    display: flex !important;
			    align-items: center !important;
			    text-align: center !important;
			    white-space: nowrap !important;
			    margin: 0 !important;
			  }
			
			  /* Fix for the inner button wrapper if exists */
			  .mobile-dropdown-container .relative {
			    width: 100% !important;
			  }
			
			  /* Adjust dropdown button inner text and icon positioning */
			  .mobile-dropdown-container button span {
			    line-height: 1.2 !important;
			  }
			
			  /* Keep the clock icon appropriately sized */
			  .lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2 button svg {
			    width: 20px !important;
			    height: 20px !important;
			  }
			
			  /* Target the dropdown ul listbox to push it down */
			  .mobile-dropdown-container ul[role="listbox"] {
			    top: 50px !important;
			    position: absolute !important;
			  }
			}
    `;

    document.head.appendChild(style);
  }

  function clockIcon() {
    return `
	    <svg
	      xmlns="http://www.w3.org/2000/svg"
	      viewBox="0 0 96 96"
	      width="96"
	      height="96"
	    >
	      <image 
	        width="96" 
	        height="96" 
	        preserveAspectRatio="none"
	        href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAF3ElEQVR4nO2cTWhdRRSAP6zmidLE2CJq0lqaKFhQqmDoytantS78wYVUXajBH9xqoOCqitpGwUr9t6mINjRVjAuxxUJrrcvGP3ShIdS26Z+gXbdJaJ4MnAfhkTn3vvfuvTPzMh8MhfS+O2fmzD1z5sycgUgkEolEIpFIJBKJRObQBrwBnAEqdZbTwKC8I9Iggw10fG0x74g0yJkMFHDWdSNC5nQGCjjluhEL3QRtdd2IkGkTJTTyJcRJOEcqlhIpiEpUgFsqUQHF0QU8CrwGjABHFAWMAV+K7X8EuMG18CGyCCgDHwF/Z+AFHQM+AO6Td0eUkT4I/JNBpyd5RstcN9YneoDPgekcO762mLo+A3pZwHQCbwFTBXZ8bTF1bwOuUuTcALwo/7YM90uMpuJJMabpgRoZS8BozXO7CJwrgKE6O+ci8BuwHXgOWAeslC+oTUqnmLJ18sx2+c1snXXtAC6Xzt9neWY9AU+yY3V0+vfAU8CSJupcCvQDh+Sdaer+Cdiv/P8AAXJbynjOBeBDGeFZ0yOu7YUmzVVwX8DtwLmERs2KV3J9QV/irgbMkylfERirU3T+OHCnA9nMfDFRR+fvk7khGLpkM0Rr1G5gsUMZ24E9KTp/f2idf6VMZprJGcAfNiWYpLHQFKC5mjPAE/jHkyKbTW4TTwqCBxNGvo+dP1cJ2pdQu1jzjs6EYJpPZkczRzb5Jx3PWYlsS5hwQ4m3fKG042085SYlsDaujJzhmmdHPZjw2hUX1SzkVuAhw4rdt/n5Gzz2ue9S5oNP8YxuJZ5vVrg2Bjxf+NgG1Yy02RvetAh6PiG8cG/CAsi1ErqV2NGreMIixfMxgbUkRj1Xwg6LXKbNl+IB91gEvJgyqllSYu8+KKFXmQvM4QFvV70mnp+WkudK+MEi03t4wDGLcGYzhRZRwtMWeUzbndKtuJ5mN6pe2oBvEpTwnWwbFsk1ihly6g09bhHq1ybeWfL0S/jdIos5geeM1y1CmU1xWkwJ71rk2IKHMRNzMoEClHAAeAFYQ/48b5HBbOg44xeLUGszen8phRKqZS/QQb6hifnqNYeFnXHCIlSWwapSHUr4lvxYqYSonWHbcG/mLE+zSugjH5Za6jN94Axb+DmPvKwScDCFAsy+AjnVP199pg8WhAKSoqfVcjAn78imABOsc8Z/BZmgKmtSmqE8XFSbCfoXD8MQee4Y7U2phJ0FTcImi8cZP1uEMqfO8qJDvJ0kBZjQwbUZ1ltWzgw5Y0+OC7Ek+mQRdkBRwq3kvxDTDhvkzis5hSKycFGPA5eRfyhiMw55zCKUSY6gYCXsnBOxPJ5DeMIWjNuIQ5Ypu2GNhKOb5TrgloxHflI42hxCdort/IzJTGkVnrW08U884GOLcCYtqFU47POB3fWKGTJpQaHT6/um/CXASYuAJicrdIYsbTvl09UHg0qcxPkk1QTLlXiX052w+bwhm6DmGoJQGbG0aVqU4xWfKCtSL2xlnaxVbL+XpvVGJcVnQo58h0IHcFQZ/XnkMeeeoGEuUgqF3aFeBLs4ITXVpP/4zkuK/JOSAeo1DysNmJVEOF/pV+z+bAhJelXeV5Qw46kS+hPSVIuM8GYSnbRt1lRH0yb8MjtaeuqREC+A7ZKwcEUpXyfcVpU37YqvXy0nffT507IqxWUdE3LqrGjKiqtZLebQwc0ETl/K62qGCzrqvTzFqK92/h20CKvEhUtq9JTkZPXkFNUcSnlJ4IlWGPnzxYu0G1QqNV/EYclMMbtRjWJ++wzwYx0XNI35loKatXdk29yuKMow+7HvyMmEsozmq+dc2rdE/laWZ0wdf9R5K9asuJrBeTuN8JCyh1BxUCZDWmRleYXly44vbp2WUe/1DSh5s0I64XyBHT8l+xQmghuZM0lvTektNWNqtrTyJJvVHvPdcs3BeAad/pecXijLuyMNhDQ2ynwxIm7iUVncTUk5J38bk2c2y2+KuIc0EolEIpFIJBKJRCKRSCQSIQ3/A1xjum/C1G2aAAAAAElFTkSuQmCC"
	      />
	    </svg>
	  `;
  }

  function clockIconOrange() {
    return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
    >
      <path 
        fill="#f5a000" 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      />
    </svg>
  `;
  }

  function createSellingFastPill() {
    const pill = document.createElement("span");
    pill.className = "selling-fast-pill-sa";
    pill.innerHTML = `SELLING FAST ${clockIcon()}`;
    return pill;
  }

  function isTimeText(text) {
    return /^\d{2}:\d{2}$/.test((text || "").trim());
  }

  function pickRandomItems(items, count) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
  }

  function getAdultCard() {
    return (
      Array.from(document.querySelectorAll("li.flex.flex-col")).find((card) => {
        const title = card.querySelector("h3");
        return (
          title && title.textContent.trim().toLowerCase().includes(TITLE_MATCH)
        );
      }) || null
    );
  }

  function ensureDesktopPill(card) {
    const heading = Array.from(card.querySelectorAll("h2")).find((el) =>
      el.textContent
        .trim()
        .toLowerCase()
        .includes("available experience times"),
    );

    if (!heading) return;
    if (
      heading.parentElement &&
      heading.parentElement.classList.contains("selling-fast-times-header-sa")
    )
      return;

    const row = document.createElement("div");
    row.className = "selling-fast-times-header-sa";
    heading.parentNode.insertBefore(row, heading);
    row.appendChild(heading);
    row.appendChild(createSellingFastPill());
  }

  function ensureMobileRowLayout(card) {
    const mobileRow = card.querySelector(
      ".lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2",
    );
    if (!mobileRow) return;

    // Get the two main containers
    const children = Array.from(mobileRow.children);
    const dropdownContainer = mobileRow
      .querySelector('button[aria-haspopup="listbox"]')
      ?.closest(".flex-1");
    const bookButtonContainer = mobileRow
      .querySelector('a[href*="booking"]')
      ?.closest(".min-w-max");

    // Reorder if needed: dropdown first, then book button
    if (
      dropdownContainer &&
      bookButtonContainer &&
      children.indexOf(dropdownContainer) >
        children.indexOf(bookButtonContainer)
    ) {
      mobileRow.insertBefore(dropdownContainer, bookButtonContainer);
    }

    // Add specific classes for styling consistency
    if (dropdownContainer) {
      dropdownContainer.classList.add("mobile-dropdown-container");

      // Apply inline styles to ensure full width
      dropdownContainer.style.flex = "7 1 0%";
      dropdownContainer.style.width = "100%";
      dropdownContainer.style.minWidth = "0";

      // Ensure the dropdown button inside uses consistent height and full width
      const dropdownButton = dropdownContainer.querySelector("button");
      if (dropdownButton) {
        dropdownButton.style.width = "100%";
        dropdownButton.style.height = "100%";
        dropdownButton.style.display = "flex";
        dropdownButton.style.alignItems = "center";
        dropdownButton.style.justifyContent = "start";

        // Handle the relative wrapper if it exists
        const relativeWrapper = dropdownButton.closest(".relative");

        if (relativeWrapper && dropdownContainer.contains(relativeWrapper)) {
          relativeWrapper.style.width = "100%";
          relativeWrapper.style.display = "flex";
        }
      }
    }

    if (bookButtonContainer) {
      bookButtonContainer.classList.add("mobile-book-container");

      // Apply inline styles to ensure full width
      bookButtonContainer.style.flex = "3 1 0%";
      bookButtonContainer.style.width = "100%";
      bookButtonContainer.style.minWidth = "0";

      // Ensure the book button uses consistent height and full width
      const bookButton = bookButtonContainer.querySelector("a");
      if (bookButton) {
        bookButton.style.width = "100%";
        bookButton.style.height = "100%";
        bookButton.style.display = "flex";
        bookButton.style.alignItems = "center";
        bookButton.style.justifyContent = "center";
        bookButton.style.textAlign = "center";
      }
    }

    // Add class to indicate layout is active
    mobileRow.classList.add("mobile-row-layout-active");

    // Set the row container to ensure children stretch
    // mobileRow.style.display = "flex";
    // mobileRow.style.flexDirection = "row";
    // mobileRow.style.alignItems = "stretch";
    // mobileRow.style.gap = "0.75rem";
  }

  function getMobileDropdownButton(card) {
    return Array.from(
      card.querySelectorAll('button[aria-haspopup="listbox"]'),
    ).find((btn) =>
      btn.textContent.trim().toLowerCase().includes("available times"),
    );
  }

  function ensureMobilePill(card) {
    const button = getMobileDropdownButton(card);
    if (!button) return;

    const mobileRow = button.closest(
      ".lg\\:hidden.flex.flex-col.xs\\:flex-row.gap-2",
    );
    if (!mobileRow) return;

    const parent = mobileRow.parentElement;
    if (!parent) return;
    if (parent.querySelector(".selling-fast-mobile-pill-wrap-sa")) return;

    const wrap = document.createElement("div");
    wrap.className = "selling-fast-mobile-pill-wrap-sa";
    wrap.appendChild(createSellingFastPill());

    parent.insertBefore(wrap, mobileRow);
  }

  function getDesktopTimeButtons(card) {
    return Array.from(card.querySelectorAll("button")).filter((btn) => {
      if (btn.getAttribute("aria-haspopup") === "listbox") return false;
      const text = btn.textContent.replace(/\s+/g, " ").trim();
      return isTimeText(text);
    });
  }

  function decorateDesktopSlot(button) {
    if (!button) return;
    if (button.classList.contains("selling-fast-slot-sa")) return;

    button.classList.add("selling-fast-slot-sa");

    if (!button.querySelector(".selling-fast-clock-sa")) {
      const icon = document.createElement("span");
      icon.className = "selling-fast-clock-sa";
      icon.innerHTML = clockIconOrange();
      button.appendChild(icon);

      button.firstElementChild.style.borderColor = "#ed8b00";
    }
  }

  function setupDesktopSlots(card) {
    const buttons = getDesktopTimeButtons(card);
    if (!buttons.length) return;

    pickRandomItems(buttons, DESKTOP_SLOT_COUNT).forEach(decorateDesktopSlot);
  }

  function getDropdownListForButton(button) {
    if (!button) return null;

    const controlledId = button.getAttribute("aria-controls");
    if (controlledId) {
      const list = document.getElementById(controlledId);
      if (list) return list;
    }

    const wrap = button.closest(".relative");
    if (!wrap) return null;

    return wrap.querySelector('ul[role="listbox"]');
  }

  function getOptionTimeSpan(option) {
    return (
      option.querySelector("span.block.truncate") ||
      option.querySelector("span")
    );
  }

  function clearDropdownDecorations(listbox) {
    Array.from(listbox.querySelectorAll('li[role="option"]')).forEach(
      (option) => {
        option.classList.remove("selling-fast-dropdown-option-sa");

        const content = option.querySelector(".selling-fast-option-content-sa");
        if (content) {
          const timeSpan = content.querySelector(
            ".selling-fast-option-time-sa",
          );
          if (timeSpan) {
            timeSpan.classList.remove("selling-fast-option-time-sa");
            option.appendChild(timeSpan);
          }
          content.remove();
        }

        const looseLabel = option.querySelector(
          ".selling-fast-option-label-sa",
        );
        const looseClock = option.querySelector(
          ".selling-fast-clock-inline-sa",
        );
        if (looseLabel) looseLabel.remove();
        if (looseClock) looseClock.remove();
      },
    );
  }

  function decorateDropdownOption(option) {
    const timeSpan = getOptionTimeSpan(option);
    if (!timeSpan) return;

    const rawTime = timeSpan.textContent.trim();
    if (!isTimeText(rawTime)) return;

    option.classList.add("selling-fast-dropdown-option-sa");

    let content = option.querySelector(".selling-fast-option-content-sa");
    if (!content) {
      content = document.createElement("span");
      content.className = "selling-fast-option-content-sa";
      option.appendChild(content);
    }

    timeSpan.classList.add("selling-fast-option-time-sa");
    content.appendChild(timeSpan);

    if (!content.querySelector(".selling-fast-option-label-sa")) {
      const label = document.createElement("span");
      label.className = "selling-fast-option-label-sa";
      label.textContent = "SELLING FAST";
      content.appendChild(label);
    }

    if (!content.querySelector(".selling-fast-clock-inline-sa")) {
      const icon = document.createElement("span");
      icon.className = "selling-fast-clock-inline-sa";
      icon.innerHTML = clockIconOrange();
      content.appendChild(icon);
    }
  }

  function decorateDropdownForCard(card) {
    const button = getMobileDropdownButton(card);
    if (!button) return;

    const listbox = getDropdownListForButton(button);
    if (!listbox) return;

    const options = Array.from(
      listbox.querySelectorAll('li[role="option"]'),
    ).filter((option) => {
      const timeSpan = getOptionTimeSpan(option);
      return timeSpan && isTimeText(timeSpan.textContent);
    });

    if (!options.length) return;

    clearDropdownDecorations(listbox);
    pickRandomItems(options, MOBILE_SLOT_COUNT).forEach(decorateDropdownOption);
  }

  function waitForDropdownAndDecorate(card) {
    const button = getMobileDropdownButton(card);
    if (!button) return;

    let attempts = 0;
    const maxAttempts = 20;

    const timer = setInterval(() => {
      attempts += 1;

      const listbox = getDropdownListForButton(button);
      if (listbox) {
        clearInterval(timer);
        decorateDropdownForCard(card);
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 100);
  }

  function bindMobileDropdown(card) {
    const button = getMobileDropdownButton(card);
    if (!button) return;
    if (button.dataset[DROPDOWN_BOUND_FLAG] === "true") return;

    button.dataset[DROPDOWN_BOUND_FLAG] = "true";

    button.addEventListener("click", function () {
      waitForDropdownAndDecorate(card);
    });
  }

  function initCard(card) {
    if (!card) return;
    if (card.dataset[CARD_INIT_FLAG] === "true") return;

    ensureDesktopPill(card);
    ensureMobilePill(card);
    setupDesktopSlots(card);
    bindMobileDropdown(card);
    ensureMobileRowLayout(card);

    card.dataset[CARD_INIT_FLAG] = "true";
  }

  function tryInit() {
    injectStyles();
    const card = getAdultCard();
    if (card) {
      initCard(card);
      return true;
    }
    return false;
  }

  if (!tryInit()) {
    const observer = new MutationObserver(() => {
      if (tryInit()) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
    }, 10000);
  }
})();
