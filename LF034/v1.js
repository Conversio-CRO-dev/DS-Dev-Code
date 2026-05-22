// console.log("David Silva | LF034");

function updateRangeInputValues(minValue, maxValue) {
  const form = document.querySelector(".ais-RangeInput-form");
  if (!form) return console.warn("Range form not found");

  const minInput = form.querySelector(".ais-RangeInput-input--min");
  const maxInput = form.querySelector(".ais-RangeInput-input--max");
  const submitButton = form.querySelector(".ais-RangeInput-submit");

  if (!minInput || !maxInput) return console.warn("Range inputs not found");

  function setValue(input, value) {
    input.focus();

    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set;

    nativeSetter.call(input, String(value));

    input.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: String(value),
      }),
    );

    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.blur();
  }

  setValue(minInput, minValue);
  setValue(maxInput, maxValue);

  setTimeout(function () {
    form.requestSubmit
      ? form.requestSubmit(submitButton || undefined)
      : submitButton?.click();
  }, 100);
}

(function () {
  let isPriceInitialised = false;
  let isSizeInitialised = false;
  let isClothingTypeRenamed = false;
  let isCollectionCombined = false;
  let isFiltersReordered = false;
  let sizeFilterObserver = null;
  let sizeFilterTimer = null;

  function getCurrentPriceRange() {
    const priceWidget = document.querySelector(
      '.is-widget-container-price_GBP_default[data-attr="price.GBP.default"]:not(.hidden)',
    );

    if (!priceWidget) {
      console.warn("Price widget not found");
      return { min: 10, max: 220 };
    }

    const tooltips = priceWidget.querySelectorAll(".rheostat-tooltip");

    if (tooltips.length < 2) {
      console.warn("Price tooltips not found");
      return { min: 10, max: 220 };
    }

    const min = parseFloat(tooltips[0].textContent.replace(/[^0-9.]/g, ""));
    const max = parseFloat(tooltips[1].textContent.replace(/[^0-9.]/g, ""));

    return {
      min: Number.isNaN(min) ? 10 : min,
      max: Number.isNaN(max) ? 220 : max,
    };
  }

  function formatPrice(value) {
    return Number.isInteger(value) ? value : value.toFixed(2);
  }

  function buildVisiblePriceRanges(minPrice, maxPrice) {
    const baseRanges = [
      {
        min: minPrice,
        max: 20,
        label: "Up to £20",
      },
      {
        min: 20,
        max: 50,
        label: "£20 - £50",
      },
      {
        min: 50,
        max: 100,
        label: "£50 - £100",
      },
      {
        min: 100,
        max: 150,
        label: "£100 - £150",
      },
    ];

    return baseRanges
      .filter(function (range) {
        return range.min < maxPrice;
      })
      .map(function (range) {
        const safeMax = Math.min(range.max, maxPrice);

        return {
          min: range.min,
          max: safeMax,
          label:
            safeMax < range.max
              ? "£" + formatPrice(range.min) + " - £" + formatPrice(safeMax)
              : range.label,
        };
      });
  }

  function normaliseSizeValue(value) {
    return String(value)
      .trim()
      .toUpperCase()
      .replace(/\s*-\s*/g, "-");
  }

  function isPlainNumber(value) {
    return /^\d+(\.\d+)?$/.test(value);
  }

  function titleCaseSizeLabel(value) {
    return String(value)
      .toLowerCase()
      .split(" ")
      .map(function (word) {
        if (!word) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  function getSizeMeta(rawValue) {
    const val = String(rawValue).trim();

    const babySizes = ["0-2", "3-5", "3-6", "6-9", "9-12", "12-18", "18-24"];
    const juniorSizes = [
      "2",
      "2-3",
      "3-4",
      "4-5",
      "5-6",
      "6-7",
      "7-8",
      "9-10",
      "11-12",
      "13-14",
      "15-16",
    ];
    const adultSizes = [
      "2XS",
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "XXXL",
      "XXXXL",
      "XXXXXL",
      "2XL",
      "3XL",
      "4XL",
      "5XL",
      "6XL",
    ];
    const numericSizes = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "16",
      "18",
      "0-3",
      "1-2",
      "6-8",
      "6-12",
    ];

    // Baby
    if (babySizes.includes(val.replace(/M$/, ""))) {
      return {
        groupOrder: 1,
        sizeOrder: babySizes.indexOf(val.replace(/M$/, "")),
        label: val.endsWith("M") ? val.replace(/M$/, "") + " M" : val + " M",
      };
    }

    // Junior
    if (juniorSizes.includes(val.replace(/Y$/, ""))) {
      return {
        groupOrder: 2,
        sizeOrder: juniorSizes.indexOf(val.replace(/Y$/, "")),
        label: val.endsWith("Y") ? val.replace(/Y$/, "") + " Y" : val + " Y",
      };
    }

    // Adult
    if (adultSizes.includes(val)) {
      return {
        groupOrder: 3,
        sizeOrder: adultSizes.indexOf(val),
        label: val,
      };
    }

    // Numeric
    if (numericSizes.includes(val)) {
      return {
        groupOrder: 4,
        sizeOrder: numericSizes.indexOf(val),
        label: val,
      };
    }

    // Fallback
    return {
      groupOrder: 5,
      sizeOrder: 999,
      label: val,
    };
  }

  function reorderForTwoColumnGrid(sortedItems) {
    const midpoint = Math.ceil(sortedItems.length / 2);
    const leftColumnItems = sortedItems.slice(0, midpoint);
    const rightColumnItems = sortedItems.slice(midpoint);

    const reorderedItems = [];

    leftColumnItems.forEach(function (leftItem, index) {
      reorderedItems.push(leftItem);

      if (rightColumnItems[index]) {
        reorderedItems.push(rightColumnItems[index]);
      }
    });

    return reorderedItems;
  }

  function updateSizeLabelText(label, newText) {
    const input = label.querySelector(".ais-RefinementList-checkbox");

    if (!input) return;

    const textNode = Array.from(label.childNodes).find(function (node) {
      return node.nodeType === Node.TEXT_NODE && node.textContent.trim();
    });

    if (textNode) {
      textNode.textContent = " " + newText + " ";
    } else {
      input.insertAdjacentText("afterend", " " + newText + " ");
    }
  }

  function sortSizeFilterItems(sizeContainer) {
    const sizeList = sizeContainer.querySelector(".ais-RefinementList-list");
    if (!sizeList) return;

    const sizeItems = Array.from(
      sizeList.querySelectorAll(".ais-RefinementList-item"),
    );
    if (!sizeItems.length) return;

    const sortedItems = sizeItems
      .map((item) => {
        const checkbox = item.querySelector(".ais-RefinementList-checkbox");
        const label = item.querySelector(".ais-RefinementList-label");
        if (!checkbox || !label) return null;

        const rawValue = checkbox.value;
        const meta = getSizeMeta(rawValue);

        return {
          item,
          label,
          rawValue,
          displayLabel: meta.label,
          groupOrder: meta.groupOrder,
          sizeOrder: meta.sizeOrder,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
        if (a.sizeOrder !== b.sizeOrder) return a.sizeOrder - b.sizeOrder;
        return a.rawValue.localeCompare(b.rawValue);
      });

    // Update label text
    sortedItems.forEach((size) => {
      const input = size.label.querySelector(".ais-RefinementList-checkbox");
      if (!input) return;
      const textNode = Array.from(size.label.childNodes).find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
      );
      if (textNode) textNode.textContent = " " + size.displayLabel + " ";
      else input.insertAdjacentText("afterend", " " + size.displayLabel + " ");
    });

    // Apply two-column grid ordering
    const midpoint = Math.ceil(sortedItems.length / 2);
    const leftCol = sortedItems.slice(0, midpoint);
    const rightCol = sortedItems.slice(midpoint);

    const reorderedItems = [];
    leftCol.forEach((leftItem, i) => {
      reorderedItems.push(leftItem.item);
      if (rightCol[i]) reorderedItems.push(rightCol[i].item);
    });

    // Apply new DOM order
    const currentOrder = sizeItems
      .map((item) => item.querySelector(".ais-RefinementList-checkbox")?.value)
      .join("|");
    const newOrder = reorderedItems
      .map((item) => item.querySelector(".ais-RefinementList-checkbox")?.value)
      .join("|");

    if (currentOrder !== newOrder) {
      reorderedItems.forEach((item) => sizeList.appendChild(item));
    }

    sizeContainer.classList.add("custom-size-filter");
  }

  function initSizeFilter() {
    const container = document.querySelector(
      '.is-widget-container-size[data-attr="size"]',
    );
    if (!container) return false;

    sortSizeFilterItems(container);

    // Observe changes for dynamic updates
    const observer = new MutationObserver(() => {
      setTimeout(() => sortSizeFilterItems(container), 50);
    });

    observer.observe(container, { childList: true, subtree: true });
    return true;
  }

  function renameClothingTypeFilter() {
    const clothingTypeContainer = document.querySelector(
      '.is-widget-container-clothing_product_type[data-attr="clothing_product_type"]',
    );

    if (!clothingTypeContainer) return false;

    const filterTitle = clothingTypeContainer.querySelector(
      ".ais-Panel-header .name",
    );

    if (!filterTitle) return false;

    filterTitle.textContent = "Product Type";

    return true;
  }

  function combineCollectionFilters() {
    const brandedCollectionContainer = document.querySelector(
      '.is-widget-container-branded_collection[data-attr="branded_collection"]',
    );

    const clothingCollectionContainer = document.querySelector(
      '.is-widget-container-clothing_collection[data-attr="clothing_collection"]',
    );

    if (!brandedCollectionContainer || !clothingCollectionContainer) {
      return false;
    }

    const brandedCollectionTitle = brandedCollectionContainer.querySelector(
      ".ais-Panel-header .name",
    );

    const brandedCollectionList = brandedCollectionContainer.querySelector(
      ".ais-RefinementList-list",
    );

    const clothingCollectionItems = Array.from(
      clothingCollectionContainer.querySelectorAll(".ais-RefinementList-item"),
    );

    if (!brandedCollectionTitle || !brandedCollectionList) {
      return false;
    }

    brandedCollectionTitle.textContent = "Collection";

    clothingCollectionItems.forEach(function (item) {
      item.classList.add("collection-filter-item--moved");

      if (!brandedCollectionList.contains(item)) {
        brandedCollectionList.appendChild(item);
      }
    });

    const allCollectionItems = Array.from(
      brandedCollectionList.querySelectorAll(".ais-RefinementList-item"),
    );

    allCollectionItems
      .sort(function (a, b) {
        const aText = a
          .querySelector(".ais-RefinementList-label")
          ?.textContent.trim()
          .toLowerCase();

        const bText = b
          .querySelector(".ais-RefinementList-label")
          ?.textContent.trim()
          .toLowerCase();

        return (aText || "").localeCompare(bText || "");
      })
      .forEach(function (item) {
        brandedCollectionList.appendChild(item);
      });

    clothingCollectionContainer.style.display = "none";

    brandedCollectionContainer.classList.add("custom-collection-filter");

    return true;
  }

  function reorderFacetFilters() {
    const facetsContainer = document.querySelector(
      "#instant-search-facets-container",
    );

    if (!facetsContainer) return false;

    const sizeFilter = document.querySelector(
      '.is-widget-container-size[data-attr="size"]',
    );

    const priceFilter = document.querySelector(
      '.is-widget-container-price_GBP_default[data-attr="price.GBP.default"]:not(.hidden)',
    );

    if (priceFilter && !priceFilter.querySelector(".custom-price-filter")) {
      return false;
    }

    const productTypeFilter = document.querySelector(
      '.is-widget-container-clothing_product_type[data-attr="clothing_product_type"]',
    );

    const colourFilter = document.querySelector(
      '.is-widget-container-color_primary[data-attr="color_primary"]',
    );

    const collectionFilter = document.querySelector(
      '.is-widget-container-branded_collection[data-attr="branded_collection"]',
    );

    const filtersInRequiredOrder = [
      sizeFilter,
      priceFilter,
      productTypeFilter,
      colourFilter,
      collectionFilter,
    ];

    const existingFilters = filtersInRequiredOrder.filter(Boolean);

    if (!existingFilters.length) return false;

    existingFilters.forEach(function (filter) {
      facetsContainer.appendChild(filter);
    });

    return true;
  }

  const observer = new MutationObserver(function () {
    if (!isPriceInitialised) {
      const priceContainer = document.querySelector(
        '.is-widget-container-price_GBP_default[data-attr="price.GBP.default"]:not(.hidden)',
      );

      if (priceContainer) {
        const tooltips = priceContainer.querySelectorAll(".rheostat-tooltip");

        if (tooltips.length >= 2) {
          priceFilter(priceContainer);
          isPriceInitialised = true;
        }
      }
    }

    if (!isSizeInitialised) {
      isSizeInitialised = initSizeFilter();
    }

    if (!isClothingTypeRenamed) {
      isClothingTypeRenamed = renameClothingTypeFilter();
    }

    if (!isCollectionCombined) {
      isCollectionCombined = combineCollectionFilters();
    }

    if (!isFiltersReordered) {
      isFiltersReordered = reorderFacetFilters();
    }

    if (
      isPriceInitialised &&
      isSizeInitialised &&
      isClothingTypeRenamed &&
      isCollectionCombined &&
      isFiltersReordered
    ) {
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  setTimeout(function () {
    observer.disconnect();
  }, 5000);

  trackEvents();

  function priceFilter(newBodyElement) {
    const currentPriceRange = getCurrentPriceRange();
    const minPrice = currentPriceRange.min;
    const maxPrice = currentPriceRange.max;

    console.log("Current PLP price range:", minPrice, maxPrice);

    const priceContainerBody = newBodyElement.querySelector(".ais-Panel-body");

    if (!priceContainerBody) {
      console.error(".ais-Panel-body not found");
      return;
    }

    if (priceContainerBody.querySelector(".custom-price-filter")) {
      return;
    }

    const priceRangeContainer = document.createElement("div");
    priceRangeContainer.className = "custom-price-filter";
    priceRangeContainer.setAttribute("data-attr", "price.GBP.default");

    const visiblePriceRanges = buildVisiblePriceRanges(minPrice, maxPrice);

    priceRangeContainer.innerHTML =
      '<div class="label-container">' +
      visiblePriceRanges
        .map(function (range) {
          return (
            '<label class="ais-RefinementList-label">' +
            "<input " +
            'type="checkbox" ' +
            'class="ais-RefinementList-checkbox price-checkbox" ' +
            'data-min="' +
            range.min +
            '" ' +
            'data-max="' +
            range.max +
            '"' +
            "> " +
            "<span>" +
            range.label +
            "</span>" +
            "</label>"
          );
        })
        .join("") +
      "</div>";

    priceContainerBody.appendChild(priceRangeContainer);

    function addMoreRangesFeature() {
      const labelContainer =
        priceRangeContainer.querySelector(".label-container");

      if (!labelContainer) return;

      const moreRangesContainer = document.createElement("div");
      moreRangesContainer.id = "more-price-ranges";

      const ctaButton = document.createElement("button");
      ctaButton.id = "show-more-ranges-btn";
      ctaButton.textContent = "Show more price ranges";

      const additionalCheckboxes = document.createElement("label");
      additionalCheckboxes.className = "ais-RefinementList-label";
      additionalCheckboxes.id = "additional-price-ranges";
      additionalCheckboxes.style.display = "none";

      additionalCheckboxes.innerHTML =
        '<input type="checkbox" class="ais-RefinementList-checkbox price-checkbox price-checkbox-more" data-min="150" data-max="' +
        maxPrice +
        '"> ' +
        "<span>£150 +</span>";

      moreRangesContainer.appendChild(ctaButton);
      labelContainer.append(additionalCheckboxes, moreRangesContainer);

      let isExpanded = false;

      ctaButton.addEventListener("click", function () {
        isExpanded = !isExpanded;

        if (isExpanded) {
          additionalCheckboxes.style.display = "block";
          ctaButton.textContent = "Show less price ranges";
        } else {
          additionalCheckboxes.style.display = "none";
          ctaButton.textContent = "Show more price ranges";

          const moreCheckbox = additionalCheckboxes.querySelector(
            ".price-checkbox-more",
          );

          if (moreCheckbox && moreCheckbox.checked) {
            moreCheckbox.checked = false;
            updateRangeInputValues(minPrice, maxPrice);

            priceRangeContainer
              .querySelectorAll(".price-checkbox:not(.price-checkbox-more)")
              .forEach(function (cb) {
                cb.checked = false;
              });
          }
        }
      });
    }

    if (maxPrice > 150) {
      addMoreRangesFeature();
    }

    attachCheckboxListeners(priceRangeContainer, minPrice, maxPrice);
  }

  function clearCustomPriceRanges() {
    const priceRangeContainer = document.querySelector(".custom-price-filter");

    if (!priceRangeContainer) return;

    priceRangeContainer
      .querySelectorAll(".price-checkbox")
      .forEach(function (checkbox) {
        checkbox.checked = false;
      });

    const additionalPriceRanges = priceRangeContainer.querySelector(
      "#additional-price-ranges",
    );

    const showMoreButton = priceRangeContainer.querySelector(
      "#show-more-ranges-btn",
    );

    if (additionalPriceRanges) {
      additionalPriceRanges.style.display = "none";
    }

    if (showMoreButton) {
      showMoreButton.textContent = "Show more price ranges";
    }

    console.log("LF034 | Custom price ranges cleared");
  }

  function attachCheckboxListeners(priceRangeContainer, minPrice, maxPrice) {
    const checkboxes = priceRangeContainer.querySelectorAll(".price-checkbox");

    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        checkboxes.forEach(function (cb) {
          if (cb !== checkbox) {
            cb.checked = false;
          }
        });

        if (this.checked) {
          const minValue = parseFloat(this.getAttribute("data-min"));
          const maxValue = parseFloat(this.getAttribute("data-max"));

          console.log("Filtering: £" + minValue + " - £" + maxValue);
          updateRangeInputValues(minValue, maxValue);
        } else {
          console.log("Resetting to show all products");
          updateRangeInputValues(minPrice, maxPrice);
        }
      });
    });
  }
})();
