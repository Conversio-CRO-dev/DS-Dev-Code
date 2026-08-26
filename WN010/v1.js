// console.log("David Silva | WN010 variation 1");

(function () {
  const BACK_COOKIE_NAME = "cro_back_url";
  const FOUR_HOURS_IN_SECONDS = 60 * 60 * 4;
  const TRACKING_PARAM_PATTERN =
    /^(utm_|_ga|_gl|_gcl|gclid$|gclsrc$|dclid$|fbclid$|msclkid$|ttclid$|twclid$|mc_(cid|eid)$)/i;
  const CUSTOM_STYLES = `
    .croBackButton {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 8px 0 8px 12px;
      color: #1a1a1a;
      text-decoration: none;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      line-height: 1;
    }

    .croBackButton:hover {
      opacity: 0.7;
    }

    .croBackButtonIcon {
      display: block;
    }

    .croBackButtonLabel {
      display: block;
    }

    .croBackButton + .navbar-item {
      padding: 8px 12px 8px 0px;
    }
  `;

  function getCookie(name) {
    const match = document.cookie.match("(?:^|; )" + name + "=([^;]*)");
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setBackCookie(url) {
    document.cookie =
      BACK_COOKIE_NAME +
      "=" +
      encodeURIComponent(url) +
      "; domain=.warnerhotels.co.uk; path=/; max-age=" +
      FOUR_HOURS_IN_SECONDS +
      "; secure; samesite=lax";
  }

  function buildCleanUrl() {
    const params = new URLSearchParams(window.location.search);
    Array.from(params.keys()).forEach(function (key) {
      if (TRACKING_PARAM_PATTERN.test(key)) params.delete(key);
    });
    const query = params.toString();
    return (
      window.location.origin +
      window.location.pathname +
      (query ? "?" + query : "") +
      window.location.hash
    );
  }

  function initEntryCapture() {
    document.addEventListener(
      "click",
      function (event) {
        const link =
          event.target.closest &&
          event.target.closest('a[href*="book.warnerhotels.co.uk"]');
        if (!link) return;
        setBackCookie(buildCleanUrl());
      },
      true,
    );
  }

  function buildBackLink(backUrl) {
    const link = document.createElement("a");
    link.className = "navbar-item croBackButton";
    link.href = backUrl;
    link.innerHTML =
      '<svg class="croBackButtonIcon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">' +
      '<path d="M15 4L7 12L15 20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>" +
      '<span class="croBackButtonLabel">Back</span>';
    return link;
  }

  function injectBackButton() {
    const brand = document.querySelector("header .navbar-brand");
    if (!brand || brand.querySelector(".croBackButton")) return;

    const backUrl = getCookie(BACK_COOKIE_NAME);
    if (!backUrl) return;

    brand.insertBefore(buildBackLink(backUrl), brand.firstChild);
  }

  function initBookingBackButton() {
    const style = document.createElement("style");
    style.textContent = CUSTOM_STYLES;
    document.head.appendChild(style);

    injectBackButton();
    new MutationObserver(injectBackButton).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (window.location.hostname === "book.warnerhotels.co.uk") {
    initBookingBackButton();
  } else if (window.location.hostname === "www.warnerhotels.co.uk") {
    initEntryCapture();
  }
})();
