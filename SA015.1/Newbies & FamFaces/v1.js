function checkLoginStatus() {
  let isLoggedIn = false;

  if (typeof window.dataLayer !== "undefined" && window.dataLayer.length > 0) {
    window.dataLayer.forEach((item) => {
      if (item.user_type === "Logged In") {
        isLoggedIn = true;
      }
    });
  }
  return isLoggedIn;
}

function checkMembershipStatus() {
  const isLoggedIn = checkLoginStatus();

  if (isLoggedIn) {
    let loyaltyTier = "";

    if (
      typeof window.dataLayer !== "undefined" &&
      window.dataLayer.length > 0
    ) {
      window.dataLayer.forEach((item) => {
        if (item.loyalty_tier_name !== undefined) {
          loyaltyTier = item.loyalty_tier_name;
        }
      });

      loyaltyTier = loyaltyTier.toLowerCase();

      if (loyaltyTier === "") {
        console.log("=============================>");
        console.log("Not a Sephora member");
        console.log("=============================>");
      } else if (loyaltyTier === "bronze") {
        console.log("=============================>");
        console.log("Free UK Delivery");
        console.log("=============================>");
      } else if (loyaltyTier === "silver") {
        console.log("=============================>");
        console.log("Free Standard Delivery");
        console.log("=============================>");
      } else if (loyaltyTier === "gold") {
        console.log("=============================>");
        console.log("Free Premier Next Day Delivery");
        console.log("=============================>");
      } else {
        console.log("=============================>");
        console.log("Unknown tier: ", loyaltyTier);
        console.log("=============================>");
      }
    } else {
      console.log("=============================>");
      console.log("User is not logged in");
      console.log("=============================>");
    }
  }
}
checkMembershipStatus();

// =====================================================>
// LOYALTY POINTS FUNCTION
// =====================================================>
// Function to get loyalty data from dataLayer
function getLoyaltyData() {
  if (window.dataLayer) {
    var loyaltyData = window.dataLayer.find(function (item) {
      return (
        item.loyalty_points !== undefined ||
        item.loyalty_is_loyalty !== undefined ||
        item.user_type !== undefined ||
        item.loyalty_next_reward_points_remaining !== undefined ||
        item.loyalty_next_tier_points_remaining !== undefined
      );
    });

    var result = loyaltyData
      ? {
          points: loyaltyData.loyalty_points || 0,
          isLoyalty: loyaltyData.loyalty_is_loyalty || false,
          userType: loyaltyData.user_type || "guest",
          pointsRemaining:
            loyaltyData.loyalty_next_reward_points_remaining || 0,
          nextTierPoints: loyaltyData.loyalty_next_tier_points_remaining || 0,
        }
      : {
          points: 0,
          isLoyalty: false,
          userType: "guest",
          pointsRemaining: 0,
          nextTierPoints: 0,
        };

    return result;
  }

  return {
    points: 0,
    isLoyalty: false,
    userType: "guest",
    pointsRemaining: 0,
    nextTierPoints: 0,
  };
}

// =====================================================>
// HELPER FUNCTIONS
// =====================================================>

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

function allElementsReady(selector) {
  return new Promise((resolve, reject) => {
    let elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      resolve(Array.from(elements));
      return;
    }
    const observer = new MutationObserver(() => {
      let elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        observer.disconnect();
        resolve(Array.from(elements));
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

// =====================================================>
// BRAND EXCLUSIONS
// =====================================================>

const brands = [
  "Advanced Nutrition Programme",
  "adwoa beauty®",
  "By Rosie Jane",
  "Commodity",
  "Dyson",
  "FOREO",
  "Gxve Beauty",
  "HAUS Labs",
  "Jo Malone London",
  "Kat Burki",
  "LAWLESS Beauty",
  "Makeup By Mario",
  "MERIT BEAUTY",
  "Naked Sundays",
  "ONE/SIZE Beauty",
  "Relevant: Your Skin Seen",
  "SALT & STONE",
  "Seasonly",
  "Sephora Favorites",
  "Shark Beauty",
  "Skinfix",
  "Straand",
  "The 7 Virtues",
  "Topicals",
  "Truly",
  "Unbottled",
];

async function checkBrandMatch() {
  // Get all product titles in the cart
  const productTitles = await allElementsReady(
    ".basket-product-title-container b",
  );

  if (!productTitles.length) {
    return false;
  }

  // Check if any product title contains an excluded brand
  for (let titleElement of productTitles) {
    const titleText = titleElement.textContent.trim();

    // Check if this title contains any of the excluded brands
    const hasExcludedBrand = brands.some((brand) =>
      titleText.toLowerCase().includes(brand.toLowerCase()),
    );

    if (hasExcludedBrand) {
      return true; // Found an excluded brand
    }
  }

  return false; // No excluded brands found
}

const excludedBrandSlugs = [
  "advanced-nutrition",
  "aesop",
  "adwoa",
  "bobbi-brown",
  "by-rosie-jane",
  "chanel",
  "charlotte-tilbury",
  "clarins",
  "commodity",
  "dermalogica",
  "dior",
  "dr-jart",
  "drunk-elephant",
  "dyson",
  "feelunique",
  "foreo",
  "gisou",
  "glossier",
  "gucci",
  "gxve",
  "haus-labs",
  "hermes",
  "ilia",
  "jo-loves",
  "jo-malone",
  "k18",
  "kat-burki",
  "kilian",
  "la-mer",
  "lancome",
  "lawless",
  "mac",
  "makeup-by-mario",
  "medik8",
  "merit",
  "molton-brown",
  "moroccanoil",
  "mugler",
  "naked-sundays",
  "neals-yard",
  "neal-s-yard",
  "necessaire",
  "nest-new-york",
  "origins",
  "penhaligon",
  "pestle",
  "rem-beauty",
  "r-e-m-beauty",
  "ranavat",
  "rare-beauty",
  "refy",
  "relevant",
  "rhode",
  "rose-inc",
  "salt-and-stone",
  "salt-stone",
  "seasonly",
  "sephora-favorites",
  "sephora-favourites",
  "shark-beauty",
  "silke",
  "sisley",
  "skinfix",
  "spacemasks",
  "straand",
  "tarte",
  "7-virtues",
  "the-ordinary",
  "tom-ford",
  "too-faced",
  "topicals",
  "tower-28",
  "tower28",
  "truly",
  "uklash",
  "unbottled",
  "valentino",
  "vegamour",
];

function checkCartForExcludedBrands() {
  const cartItems = document.querySelectorAll(".bagItemsContainer");

  for (const item of cartItems) {
    const productLink = item.querySelector(".product-title");
    const brandEl = item.querySelector(".basket-product-title-container b");

    if (!productLink || !brandEl) continue;

    const brandName = brandEl.textContent.trim();
    const urlSlug = productLink.getAttribute("href").replace("/p/", "");

    const isExcluded = excludedBrandSlugs.some(function (slug) {
      return urlSlug.startsWith(slug);
    });

    if (isExcluded) {
      console.log("Product belongs to Excluded Brand List:", brandName);
      return true;
    }
  }

  return false;
}

function watchCartForChanges() {
  const basket = document.querySelector("#basket");
  if (!basket) return;

  const observer = new MutationObserver(() => {
    checkCartForExcludedBrands();
  });

  observer.observe(basket, {
    childList: true,
    subtree: true,
  });
}

// =====================================================>
// MAIN FUNCTIONS
// =====================================================>

// This function adds the NEW customer message (15% off)
async function addNewCustomerMessage() {
  let deliveryNoticeCont = await elementReady("#delivery-notice");

  var wrapper = document.createElement("div");
  wrapper.className = "delivery-text";

  // Move all existing children into the wrapper
  while (deliveryNoticeCont.firstChild) {
    wrapper.appendChild(deliveryNoticeCont.firstChild);
  }

  // Append the wrapper back into the container
  deliveryNoticeCont.appendChild(wrapper);
}

// This function adds the membership banner (for Silver/Gold members)
async function addMembershipBanner() {
  // Get user's membership tier
  const isLoggedIn = checkLoginStatus();

  if (!isLoggedIn) return; // Stop if not logged in

  let loyaltyTier = "";
  if (typeof window.dataLayer !== "undefined" && window.dataLayer.length > 0) {
    window.dataLayer.forEach((item) => {
      if (item.loyalty_tier_name !== undefined) {
        loyaltyTier = item.loyalty_tier_name;
      }
    });
    loyaltyTier = loyaltyTier.toLowerCase().trim();
  }

  // Only show for Silver or Gold members
  if (
    loyaltyTier !== "bronze" &&
    loyaltyTier !== "silver" &&
    loyaltyTier !== "gold"
  )
    return;

  // Wait for the delivery-notice container
  const deliveryContainer = await elementReady("#delivery-notice");

  // Remove any existing delivery-text (new customer message)
  const oldMessage = document.querySelector(
    "#delivery-notice > div.delivery-text",
  );
  if (oldMessage) {
    oldMessage.remove();
  }

  // Create the new banner
  const banner = document.createElement("div");
  banner.className = "delivery-banner";

  // Choose the right message based on tier
  let message = "";
  const capitalizedTier = `${loyaltyTier.charAt(0).toUpperCase()}${loyaltyTier.slice(1)}`;

  if (loyaltyTier === "bronze") {
    message = `<strong>Free</strong> Standard Delivery applied at Checkout as a <strong>MY SEPHORA</strong> ${capitalizedTier} Tier Member`;
  } else if (loyaltyTier === "silver") {
    message = `<strong>Free</strong> Standard Delivery applied at Checkout as a <strong>MY SEPHORA</strong> ${capitalizedTier} Tier Member`;
  } else if (loyaltyTier === "gold") {
    message = `<strong>Free</strong> Premier Next Day Delivery applied at Checkout as a <strong>MY SEPHORA</strong> ${capitalizedTier} Tier Member`;
  }

  // Add the banner content - converted from template literal to string concatenation
  banner.innerHTML =
    '<div class="left-content">' +
    '<div class="info-icon">' +
    '<svg width="24" height="24" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="17" cy="17" r="15" stroke="black" stroke-width="2"/>' +
    '<circle cx="17" cy="10.5" r="1.6" fill="black"/>' +
    '<path d="M17 15V23" stroke="black" stroke-width="2.4" stroke-linecap="round"/>' +
    "</svg>" +
    "</div>" +
    "<span>" +
    message +
    "</span>" +
    "</div>" +
    '<div class="right-content">' +
    '<div class="close-btn">' +
    '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M7 7L21 21" stroke="black" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M21 7L7 21" stroke="black" stroke-width="2.5" stroke-linecap="round"/>' +
    "</svg>" +
    "</div>" +
    "</div>";

  // Add click event to close button
  // const closeBtn = banner.querySelector('.close-btn');
  // closeBtn.addEventListener('click', function() {
  //     banner.remove();
  // });

  // Add banner to the page
  deliveryContainer.insertBefore(banner, deliveryContainer.firstChild);
}

// =====================================================>
// LOYALTY BANNER FUNCTION
// =====================================================>
async function addLoyaltyBanner() {
  // Wait for the delivery-notice container
  const deliveryContainer = await elementReady("#delivery-notice");

  // Get loyalty data
  const loyaltyData = getLoyaltyData();

  // Create loyalty banner
  const loyaltyBanner = document.createElement("div");
  loyaltyBanner.className = "loyalty-banner";

  // Create left content with icon
  const leftLoyaltyContent = document.createElement("div");
  leftLoyaltyContent.className = "left-loyalty-content";

  const loyalIcon = document.createElement("div");
  loyalIcon.className = "loyalty-icon-container";
  loyalIcon.innerHTML =
    '<img src="/assets/svg/loyalty/my-sephora-m-nav-icon.svg">';

  leftLoyaltyContent.appendChild(loyalIcon);

  // Create right content with text
  const rightLoyaltyContent = document.createElement("div");
  rightLoyaltyContent.className = "right-loyalty-container";

  const pTag = document.createElement("p");
  pTag.className = "title-program";
  // pTag.textContent = 'My Sephora loyalty programme rewards you.';
  pTag.innerHTML =
    '<span style="text-transform: uppercase;">My Sephora</span> loyalty programme rewards you.'; //updated 'MY SEPHORA'

  const pTag2 = document.createElement("p");
  pTag2.className = "info-program";

  // Different messages based on login status and points
  if (!checkLoginStatus()) {
    // User is logged out - converted from template literal to string concatenation
    // pTag2.innerHTML = 'Earn <span class="points">100 points</span> to claim your next Reward.';
    pTag2.innerHTML = "Log in or create an account to start benefitting"; //updated 'Log in or create an account to start benefitting'
  } else if (loyaltyData.pointsRemaining > 0) {
    // User has points remaining to next reward (this will show 94)
    // pTag2.innerHTML = 'Earn <span class="points">' + loyaltyData.pointsRemaining + ' points</span> to claim your next Reward.';
    pTag2.innerHTML =
      'Only <span class="points">' +
      loyaltyData.pointsRemaining +
      " points</span> before your next Reward!"; // updated 'Only [X points] before your next Reward!'
  } else if (loyaltyData.pointsRemaining === 0) {
    // User has reached the next reward threshold
    pTag2.innerHTML =
      'You have <span class="points">' +
      loyaltyData.points +
      " points</span>! Ready to redeem?";
  } else {
    // Fallback - calculate from points
    let pointsNeeded = 100 - loyaltyData.points;
    if (pointsNeeded < 0) pointsNeeded = 0;
    pTag2.innerHTML =
      'Earn <span class="points">' +
      pointsNeeded +
      " points</span> to claim your next Reward.";
  }

  rightLoyaltyContent.appendChild(pTag);
  rightLoyaltyContent.appendChild(pTag2);

  // Assemble the banner
  loyaltyBanner.appendChild(leftLoyaltyContent);
  loyaltyBanner.appendChild(rightLoyaltyContent);

  // Add the banner to the container
  deliveryContainer.appendChild(loyaltyBanner);
}

// This function adds all the styles
function addAllStyles() {
  // Check if styles already exist
  if (document.getElementById("sa015-styles")) return;

  var newStyle = document.createElement("style");
  newStyle.id = "sa015-styles";
  newStyle.setAttribute("type", "text/css");

  newStyle.textContent =
    "/* New customer message styles */" +
    ".new-customer.green-text {" +
    "  padding: 0px 4px !important;" +
    "  font-family: AvantGardeBold !important;" +
    "  background: #e1f6df !important;" +
    "  color: #04784e !important;" +
    "  padding-top: 3px !important;" +
    "  cursor: pointer;" +
    "  padding-bottom: 4px !important;" +
    "  padding-left: 5px !important;" +
    "}" +
    ".green-text {" +
    "  cursor: pointer;" +
    "  transition: background-color 0.2s ease;" +
    "}" +
    ".green-text:hover {" +
    "  background-color: rgba(0, 128, 0, 0.1);" +
    "}" +
    ".code-copy-feedback {" +
    "  background-color: white;" +
    "  color: #333;" +
    "  padding: 4px 10px;" +
    "  border-radius: 8px;" +
    "  font-size: 12px;" +
    "  font-weight: bold;" +
    "  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.055);" +
    "  border: 1px solid #e0e0e0;" +
    "  animation: fadeInOut 2s ease-in-out;" +
    "  pointer-events: none;" +
    "  position: relative;" +
    "}" +
    ".code-copy-feedback::after {" +
    '  content: "";' +
    "  position: absolute;" +
    "  top: 100%;" +
    "  left: 50%;" +
    "  transform: translateX(-50%);" +
    "  border: 6px solid transparent;" +
    "  border-top-color: white;" +
    "  border-bottom: none;" +
    "}" +
    ".code-copy-feedback::before {" +
    '  content: "";' +
    "  position: absolute;" +
    "  top: 100%;" +
    "  left: 50%;" +
    "  transform: translateX(-50%);" +
    "  border: 7px solid transparent;" +
    "  border-top-color: #e0e0e0;" +
    "  border-bottom: none;" +
    "  z-index: -1;" +
    "}" +
    "@keyframes fadeInOut {" +
    "  0% {" +
    "    opacity: 0;" +
    "    transform: translateY(5px);" +
    "  }" +
    "  20% {" +
    "    opacity: 1;" +
    "    transform: translateY(0);" +
    "  }" +
    "  80% {" +
    "    opacity: 1;" +
    "    transform: translateY(0);" +
    "  }" +
    "  100% {" +
    "    opacity: 0;" +
    "    transform: translateY(-5px);" +
    "  }" +
    "}" +
    ".flex-el {" +
    "  display: inline-flex;" +
    "}" +
    "/* REMOVED ALL DISCOUNT-CONTAINER STYLES */" +
    "#basketcolumn #delivery-notice {" +
    "  display: flex !important;" +
    "  width: 100% !important;" +
    "  flex-direction: row;" +
    "  justify-content: start;" +
    "  align-items: stretch;" +
    "  gap: 12px;" +
    "  margin-top: -12px;" +
    "  padding: 0px 30px 15px 45px;" +
    "  max-height: 65px;" +
    "}" +
    "#basketcolumn .delivery-text svg {" +
    "  vertical-align: unset !important;" +
    "  width: 40px !important;" +
    "  height: 30px !important;" +
    "  margin-bottom: 2px;" +
    "}" +
    ".exclusions-text {" +
    "  font-size: 11px !important;" +
    "}" +
    ".delivery-text {" +
    "  gap: 10px;" +
    "  justify-content: start;" +
    "  border: 1px solid #d7d7d7;" +
    "  letter-spacing: 0.4px;" +
    "  align-items: center;" +
    "  border-radius: 8px;" +
    "  font-size: 14px;" +
    "  padding: 10px;" +
    "  display: flex;" +
    "  width: 50%;" +
    "  height: 42px;" +
    "  margin-left: -27px;" +
    "}" +
    "#delivery-notice .delivery-text > span {" +
    "  font-size: 13px !important;" +
    "}" +
    "#basket-home #basket-left {" +
    "  margin-top: 1rem;" +
    "}" +
    ".responsive-header .header > ul {" +
    "  margin: 0 !important;" +
    "}" +
    "#breadcrumbs {" +
    "  margin-left: 1rem;" +
    "}" +
    "/* Membership banner styles */" +
    ".delivery-banner {" +
    "  display: flex;" +
    "  align-items: center;" +
    "  justify-content: space-between;" +
    "  padding: 16px 10px;" +
    "  border-radius: 8px;" +
    "  margin-bottom: 0.9rem;" +
    "  box-sizing: border-box;" +
    "  background: linear-gradient(124deg, #e2f5fb 7.98%, #f0dafa 88.5%);" +
    "}" +
    ".left-content {" +
    "  display: flex;" +
    "  align-items: center;" +
    "  gap: 12px;" +
    "}" +
    ".left-content .info-icon > svg," +
    ".right-content .close-btn > svg {" +
    "  padding-right: 0 !important;" +
    "  width: 34px !important;" +
    "  height: 28px !important;" +
    "}" +
    ".left-content span {" +
    "  font-size: 13px !important;" +
    "  letter-spacing: 0.4px !important;" +
    "  line-height: 1.6 !important;" +
    "  text-align: justify;" +
    "}" +
    ".close-btn {" +
    "  display: none;" +
    "  cursor: pointer;" +
    "}" +
    "/* Loyalty banner styles */" +
    ".loyalty-banner {" +
    "  display: flex;" +
    "  align-items: center;" +
    "  gap: 12px;" +
    "  padding: 12px 10px;" +
    "  border-radius: 8px;" +
    "  margin-bottom: 0.9rem;" +
    "  box-sizing: border-box;" +
    "  border: 1px solid #e0e0e0;" +
    "}" +
    ".left-loyalty-content {" +
    "  display: flex;" +
    "  align-items: center;" +
    "}" +
    ".left-loyalty-content img {" +
    "  width: 40px;" +
    "  height: 40px;" +
    "}" +
    ".right-loyalty-container {" +
    "  display: flex;" +
    "  flex-direction: column;" +
    "}" +
    ".right-loyalty-container p {" +
    "  margin: 0 !important;" +
    "  font-size: 13px;" +
    "  line-height: 1.6 !important;" +
    "}" +
    ".right-loyalty-container .title-program {" +
    "  font-family: AvantGardeBold, Arial, sans-serif;" +
    "}" +
    ".right-loyalty-container .info-program .points {" +
    "  color: #d50032;" +
    "  font-family: AvantGardeBold, Arial, sans-serif;" +
    "  font-weight: bold;" +
    "}" +
    "/* Desktop styles */" +
    "@media (min-width: 1024px) {" +
    "  #basket-home #basket-left {" +
    "    margin-top: 0px;" +
    "    position: relative !important;" +
    "    width: calc(100% - 390px) !important;" +
    "    overflow: hidden !important;" +
    "  }" +
    "  #delivery-notice {" +
    "    display: flex !important;" +
    "    justify-content: space-between;" +
    "    align-items: center;" +
    "    width: 100% !important;" +
    "    margin-bottom: 0 !important;" +
    "    gap: 12px;" +
    "  }" +
    "  .delivery-banner," +
    "  .loyalty-banner {" +
    "    margin: 0;" +
    "    gap: 12px;" +
    "    padding: 10px;" +
    "    width: 50%;" +
    "  }" +
    "  .left-content span {" +
    "    font-size: 17px;" +
    "  }" +
    "}" +
    "/* Mobile styles */" +
    "@media (max-width: 768px) {" +
    "  #basketcolumn #delivery-notice {" +
    "    flex-direction: column;" +
    "    padding: 0 0 10px;" +
    "    margin-top: 0;" +
    "    max-height: unset;" +
    "    gap: 10px;" +
    "  }" +
    "  #basketcolumn #delivery-notice b {" +
    "    margin-top: 1px;" +
    "  }" +
    "  /* REMOVED DISCOUNT-CONTAINER STYLES */" +
    "  #delivery-notice svg {" +
    "    height: 20px;" +
    "    width: 25px;" +
    "    padding-right: 0 !important;" +
    "  }" +
    "  .delivery-text {" +
    "    display: flex !important;" +
    "    align-content: center !important;" +
    "    flex-wrap: wrap;" +
    "    gap: 6px;" +
    "    line-height: unset;" +
    "    margin-left: 0 !important;" +
    "    width: unset !important;" +
    "    justify-content: start;" +
    "    height: unset !important;" +
    "  }" +
    "  #basketcolumn .delivery-text svg {" +
    "    width: 34px !important;" +
    "    height: 28px !important;" +
    "  }" +
    "  #basketcolumn #delivery-notice {" +
    "    flex-direction: column !important;" +
    "  }" +
    "  .delivery-banner," +
    "  .loyalty-banner {" +
    "    width: 100%;" +
    "    margin-bottom: 0px;" +
    "  }" +
    "  /* On mobile, delivery-banner should be on top */" +
    "  .delivery-banner {" +
    "    order: 1;" +
    "  }" +
    "  .loyalty-banner {" +
    "    order: 2;" +
    "  }" +
    "  .left-content," +
    "  .loyalty-banner {" +
    "    gap: 5px !important;" +
    "  }" +
    "}";

  document.head.appendChild(newStyle);
}

// Copy feedback function
function showCopyFeedback(element) {
  const feedback = document.createElement("div");
  feedback.className = "code-copy-feedback";
  feedback.textContent = "Code copied!";

  const rect = element.getBoundingClientRect();
  feedback.style.position = "fixed";
  feedback.style.left = rect.left - 16 + "px";
  feedback.style.top = rect.top - 39 + "px";
  feedback.style.zIndex = "10000";

  document.body.appendChild(feedback);

  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
  }, 2000);
}

// Fallback copy function
function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Fallback copy failed:", err);
  }
  document.body.removeChild(textArea);
}

// Event listeners
function events() {
  elementReady("#basketcolumn").then((main) => {
    if (!main.classList.contains("test-sa-015")) {
      main.addEventListener("click", (e) => {
        // Copy code event
        if (
          e.target.closest(".flex-el") &&
          e.target.textContent.trim() === "NEW15"
        ) {
          const codeText = "NEW15";

          navigator.clipboard
            .writeText(codeText)
            .then(() => {
              showCopyFeedback(e.target);
            })
            .catch((err) => {
              console.error("Failed to copy code:", err);
              fallbackCopyText(codeText);
              showCopyFeedback(e.target);
            });

          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "SA015.1 | Event Tracking",
              event_label: "SA015.1 | (Variation 1) | NEW15 Copy Code Click",
              event_segment: "SA015EV1I",
            },
          });
        }

        // T&C Click
        if (
          e.target.closest(
            '[href="https://www.sephora.co.uk/new-customer-offer"]',
          )
        ) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "SA015.1 | Event Tracking",
              event_label: "SA015.1 | (Variation 1) | T&Cs Link link",
              event_segment: "SA015EV1J",
            },
          });
        }

        // Continue to checkout click
        if (e.target.closest(".continue-to-checkout")) {
          window.dataLayer.push({
            event: "conversioEvent",
            conversio: {
              event_category: "Conversio CRO",
              event_action: "SA015.1 | Event Tracking",
              event_label:
                "SA015.1 | (Variation 1) | Continue to Checkout CTA Click",
              event_segment: "SA015EV1H",
            },
          });
        }
      });
      main.classList.add("test-sa-015");
    }
  });
}

// =====================================================>
// MAIN LOGIC - This decides what to show
// =====================================================>

async function runTest() {
  // First, add all styles
  addAllStyles();

  // Wait for cart to load
  await elementReady(".basket-product-title-container b");

  const hasExcludedBrand = checkCartForExcludedBrands();
  if (hasExcludedBrand) {
    console.log("SA015.1 | excluded brand found in cart, script stopped.");
    return;
  }

  // Then start watching for future add/remove changes
  watchCartForChanges();

  // Get membership info
  const isLoggedIn = checkLoginStatus();
  let loyaltyTier = "";

  if (
    isLoggedIn &&
    typeof window.dataLayer !== "undefined" &&
    window.dataLayer.length > 0
  ) {
    window.dataLayer.forEach((item) => {
      if (item.loyalty_tier_name !== undefined) {
        loyaltyTier = item.loyalty_tier_name;
      }
    });
    loyaltyTier = loyaltyTier.toLowerCase().trim();
  }

  // Check for excluded brands
  // const hasExcludedBrand = await checkBrandMatch();

  // Only show banners if no excluded brands
  //   if (!hasExcludedBrand) {
  // DECISION TIME:
  // Case 1: Silver or Gold members - show delivery-banner (tier message) + loyalty banner
  if (
    loyaltyTier === "bronze" ||
    loyaltyTier === "silver" ||
    loyaltyTier === "gold"
  ) {
    console.log("Showing membership banner for:", loyaltyTier);

    // Remove the default SVG and span if they exist
    const defaultSvg = document.querySelector("#delivery-notice > svg");
    const defaultSpan = document.querySelector("#delivery-notice > span");

    if (defaultSvg) {
      defaultSvg.remove();
    }

    if (defaultSpan) {
      defaultSpan.remove();
    }

    // Add the delivery-banner (tier message)
    await addMembershipBanner();

    // Add the loyalty banner
    await addLoyaltyBanner();
  }

  // Case 2: Logged in but Bronze or undefined member - show delivery-text + loyalty banner
  else if (isLoggedIn && loyaltyTier === "") {
    console.log("Showing new customer message with loyalty banner");

    // Add the new customer message (delivery-text)
    await addNewCustomerMessage();

    // Add the loyalty banner
    await addLoyaltyBanner();
  }

  // Case 3: Not logged in - show delivery-text + loyalty banner with "100 points" message
  else if (!isLoggedIn) {
    console.log("Showing new customer message with loyalty banner for guest");

    // Add the new customer message (delivery-text)
    await addNewCustomerMessage();

    // Add the loyalty banner (will show "Earn 100 points")
    await addLoyaltyBanner();
  }
  //   }

  // Set up event listeners
  events();

  // Track the experience
  setTimeout(() => {
    window.dataLayer.push({
      event: "conversioExperience",
      conversio: {
        experience_category: "Conversio Experience",
        experience_action:
          "SA015.1 | A/B/n | Show Segment Message In The Cart (Reinforce NC OR Loyalty)",
        experience_label: "SA015.1 | Variation 1",
        experience_segment: "SA015.XV1",
      },
    });
  }, 3000);
}

// Start everything
runTest();
