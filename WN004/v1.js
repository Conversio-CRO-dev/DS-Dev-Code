function openSearch() {
  var mobileBtn = document.querySelector(".searchButtonItem.mobileOnly");
  var isMobile = mobileBtn.offsetParent !== null;

  if (isMobile) {
    document.querySelector('.searchButton[data-button="mobile"]').click();
    return;
  }

  var whereText = document
    .querySelector('.searchButton[data-button="where"] .searchButtonSubtitle')
    .textContent.trim();
  var whereIsFilled = whereText !== "Any hotel";

  var params = new URLSearchParams(window.location.search);
  var whenIsFilled = params.has("from");

  if (whereIsFilled && !whenIsFilled) {
    document.querySelector('.searchButton[data-button="when"]').click();
  } else if (whenIsFilled && !whereIsFilled) {
    document.querySelector('.searchButton[data-button="where"]').click();
  } else if (!whereIsFilled && !whenIsFilled) {
    document.querySelector('.searchButton[data-button="where"]').click();
  } else if (whereIsFilled && whenIsFilled) {
    document.querySelector('.searchButton[data-button="where"]').click();
  } else {
    document
      .querySelector(".searchBarBlockContainer")
      .classList.add("openSearchBlock");
  }
}

(() => {
  if (window.__bookCtaSearchHandlerAttached) return;
  window.__bookCtaSearchHandlerAttached = true;

  document.addEventListener("click", (e) => {
    const bookCta = e.target.closest(".pageHeaderCta--book");

    if (!bookCta) return;

    const searchBar = document.querySelector("#searchBarBlock");

    if (!searchBar) return;

    const searchBarContainer = searchBar.closest(".searchBarBlockContainer");

    const searchBarIsHidden =
      searchBar.classList.contains("hide") ||
      searchBarContainer?.classList.contains("hide") ||
      window.getComputedStyle(searchBar).display === "none" ||
      window.getComputedStyle(searchBar).visibility === "hidden" ||
      (searchBarContainer &&
        window.getComputedStyle(searchBarContainer).display === "none") ||
      (searchBarContainer &&
        window.getComputedStyle(searchBarContainer).visibility === "hidden");

    if (!searchBarIsHidden) {
      e.preventDefault();
      openSearch();
    }
  });
})();
