function productCardOptimisation(root) {
  const scope = root || document;

  const allPriceContainers = scope.querySelectorAll(
    ".flex-none.medium.flex.flex-col",
  );
  allPriceContainers.forEach((container) => {
    container.style.width = "100%";
  });

  const addToCartBtn = scope.querySelectorAll(
    ".mt-2.flex.space-x-2 > .add-to-basket",
  );
  addToCartBtn.forEach((item) => {
    item.textContent = "Add to basket";
  });

  const klarnaBadges = scope.querySelectorAll(
    ".product-prices .klarna-osm-placement",
  );
  klarnaBadges.forEach((badge) => {
    badge.remove();
  });

  const priceBoxes = scope.querySelectorAll(".price-box");

  priceBoxes.forEach((priceBox) => {
    if (priceBox.querySelector(".price-boxes")) return;

    const currentPrice = priceBox.querySelector(".current-price");
    const oldPrice = priceBox.querySelector(".old-price");

    if (currentPrice && oldPrice) {
      const wrapper = document.createElement("div");
      wrapper.className = "price-boxes";

      currentPrice.parentNode.insertBefore(wrapper, currentPrice);
      wrapper.appendChild(currentPrice);
      wrapper.appendChild(oldPrice);
    }
  });
}

function initProductCardOptimisation() {
  const productList = document.querySelector("#product-list");
  if (!productList) return;

  productCardOptimisation(productList);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;

        if (node.matches(".product-item")) {
          productCardOptimisation(node);
        } else {
          const newProducts = node.querySelectorAll(".product-item");
          newProducts.forEach((product) => {
            productCardOptimisation(product);
          });
        }
      });
    });
  });

  observer.observe(productList, {
    childList: true,
    subtree: true,
  });
}

function addStylesToPage() {
  if (document.querySelector("#product-card-optimisation-styles")) return;

  const styles = `
    .mt-2.flex.space-x-2 > .product-item-link {
      display: none;
    }

    .mt-2.flex.space-x-2 > .add-to-basket {
      width: 100%;
      margin-left: 0;
    }

    .saving-price-label {
      display: none !important;
    }

    .price-boxes {
      display: flex;
      gap: 10px;
    }

    .price-boxes > .old-price {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = "product-card-optimisation-styles";
  styleElement.textContent = styles;

  document.head.appendChild(styleElement);
}

addStylesToPage();
initProductCardOptimisation();
