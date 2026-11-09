// console.log("David Silva | LT179 variation 1");

(function () {
  // Stop the code running twice if the script is injected more than once
  if (window.LT179_loaded) return;
  window.LT179_loaded = true;

  // Make sure the tracking array exists, so a push never throws an error
  window.adobeDataLayer = window.adobeDataLayer || [];

  const CART_UPDATE_URL = "/webapi/carts/";
  let updateTimer = null;
  let latestCheckId = 0;
  let currentSubscription = null;
  let upsellSeenFired = false;
  let basketHadSubscription = null;
  let seenObserver = null;

  // Icons from the Figma design (pink #E2004D, 14x14)
  const ICONS = {
    calendar:
      '<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="Calendar" clip-path="url(#clip0_0_41)"> <path id="icon" d="M4.02828 0.42042C3.93953 0.442708 3.87079 0.485338 3.80421 0.559384C3.69522 0.68061 3.696 0.674506 3.696 1.40165V2.04232L2.5935 2.04757C1.51056 2.05274 1.48891 2.05338 1.3735 2.08369C0.907844 2.20594 0.568876 2.54479 0.443968 3.01294L0.413 3.129V7.819V12.509L0.443156 12.621C0.491778 12.8016 0.529942 12.8891 0.616196 13.0178C0.803488 13.2973 1.05939 13.476 1.39668 13.5627C1.48537 13.5856 1.81923 13.587 6.986 13.587C11.52 13.587 12.4968 13.5837 12.5712 13.5683C13.0737 13.4639 13.4639 13.0737 13.5683 12.5712C13.5837 12.4969 13.587 11.6551 13.587 7.805V3.129L13.556 3.01294C13.4311 2.54479 13.0922 2.20594 12.6265 2.08369C12.5111 2.05338 12.4894 2.05274 11.4065 2.04757L10.304 2.04232V1.40165C10.304 0.669774 10.3053 0.679658 10.1908 0.554344C10.0988 0.453712 10.0093 0.414722 9.87 0.414526C9.69262 0.414288 9.55241 0.50337 9.47583 0.665L9.43603 0.749L9.43601 1.3965L9.436 2.044H7H4.564L4.56399 1.3965L4.56397 0.749L4.52417 0.665C4.47943 0.57057 4.39471 0.486248 4.30452 0.446348C4.23261 0.41454 4.10092 0.402178 4.02828 0.42042ZM1.54242 2.95267C1.45837 2.98171 1.37131 3.05801 1.32531 3.143C1.29508 3.19885 1.29499 3.20198 1.29116 4.2665L1.28733 5.334H7H12.7127L12.7088 4.2665C12.705 3.20214 12.7049 3.19883 12.6747 3.14237C12.658 3.11122 12.6161 3.05967 12.5815 3.02781C12.4679 2.92312 12.5031 2.926 11.3382 2.926H10.3054L10.3012 3.3915C10.2972 3.83669 10.2957 3.85945 10.2669 3.913C10.2265 3.9884 10.1354 4.0762 10.055 4.11727C9.96334 4.16412 9.79698 4.16461 9.69361 4.11834C9.61009 4.08094 9.52178 3.9949 9.47568 3.906C9.44367 3.84429 9.44292 3.83362 9.43895 3.3845L9.43491 2.926H7H4.56509L4.56105 3.3845C4.55708 3.83362 4.55633 3.84429 4.52432 3.906C4.47822 3.9949 4.38991 4.08094 4.30639 4.11834C4.20302 4.16461 4.03666 4.16412 3.94502 4.11727C3.86464 4.0762 3.77355 3.9884 3.73306 3.913C3.70432 3.85945 3.70282 3.83669 3.6988 3.3915L3.6946 2.926L2.6558 2.92646C1.6842 2.92688 1.61217 2.92858 1.54242 2.95267ZM1.29137 9.3205L1.295 12.439L1.32595 12.4969C1.36536 12.5706 1.42943 12.6346 1.50312 12.674L1.561 12.705H7H12.439L12.4969 12.674C12.5706 12.6346 12.6346 12.5706 12.674 12.4969L12.705 12.439L12.7086 9.3205L12.7122 6.202H7H1.28776L1.29137 9.3205ZM3.36232 7.39948C3.25294 7.42322 3.16667 7.47251 3.06471 7.56953C2.65037 7.96384 2.93808 8.666 3.514 8.666C3.87505 8.666 4.158 8.38096 4.158 8.01725C4.158 7.72276 3.92657 7.44723 3.63392 7.3933C3.5293 7.37402 3.47374 7.3753 3.36232 7.39948ZM6.84832 7.39948C6.63436 7.44591 6.43412 7.64201 6.37759 7.86044C6.27109 8.27201 6.57549 8.666 7 8.666C7.58187 8.666 7.86328 7.96116 7.441 7.56144C7.34472 7.4703 7.25833 7.42284 7.1451 7.39885C7.02845 7.37414 6.96444 7.37428 6.84832 7.39948ZM10.3343 7.39948C10.1204 7.44591 9.92012 7.64201 9.86359 7.86044C9.75709 8.27201 10.0615 8.666 10.486 8.666C10.9089 8.666 11.2153 8.27138 11.1091 7.86352C11.0794 7.7498 11.0436 7.68613 10.9567 7.59259C10.8592 7.48765 10.7538 7.42484 10.632 7.39903C10.5144 7.37414 10.4506 7.37423 10.3343 7.39948ZM3.374 10.2662C3.26122 10.292 3.17192 10.3401 3.08235 10.4234C2.92877 10.5661 2.86054 10.7354 2.87372 10.941C2.88558 11.1257 2.96642 11.2791 3.11548 11.3996C3.22738 11.4901 3.32259 11.5247 3.48162 11.5328C3.64647 11.5411 3.76816 11.5071 3.88744 11.4193C4.25375 11.1496 4.24563 10.6159 3.87132 10.3605C3.73895 10.2702 3.52975 10.2306 3.374 10.2662ZM6.881 10.2617C6.55333 10.334 6.33688 10.6134 6.36016 10.934C6.37448 11.1313 6.44997 11.2769 6.60156 11.3996C6.71332 11.4901 6.80856 11.5247 6.96762 11.5328C7.13247 11.5411 7.25416 11.5071 7.37344 11.4193C7.74176 11.1481 7.73184 10.6179 7.35358 10.3576C7.23351 10.275 7.01837 10.2313 6.881 10.2617ZM10.388 10.2574C10.3206 10.2681 10.1845 10.3222 10.1287 10.3604C9.81358 10.5762 9.74943 11.0024 9.9867 11.3036C10.0544 11.3895 10.1837 11.4767 10.2926 11.5097C10.3712 11.5336 10.4143 11.538 10.5184 11.5328C10.6774 11.5247 10.7727 11.4901 10.8844 11.3996C11.036 11.2769 11.1115 11.1313 11.1258 10.934C11.1401 10.737 11.0698 10.5648 10.9171 10.4229C10.7726 10.2885 10.5769 10.2273 10.388 10.2574Z" fill-rule="evenodd" clip-rule="evenodd" fill="#E2004D"/> </g> <defs> <clipPath id="clip0_0_41"> <rect width="14" height="14" fill="white"/> </clipPath> </defs> </svg>',
    box: '<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="Recycled-Box-1--Streamline-Ultimate" clip-path="url(#clip0_0_47)"> <path id="path5" d="M6.47266 10.2644C6.35663 10.2644 6.24535 10.3105 6.16331 10.3926C6.08126 10.4746 6.03517 10.5859 6.03516 10.7019V12.8894C6.03516 13.0054 6.08125 13.1167 6.1633 13.1988C6.24534 13.2808 6.35662 13.3269 6.47266 13.3269C6.58869 13.3269 6.69997 13.2808 6.78201 13.1988C6.86406 13.1167 6.91016 13.0054 6.91016 12.8894V11.1394H8.66016C8.77619 11.1394 8.88747 11.0933 8.96951 11.0113C9.05156 10.9292 9.09766 10.8179 9.09766 10.7019C9.09766 10.5859 9.05156 10.4746 8.96951 10.3925C8.88747 10.3105 8.77619 10.2644 8.66016 10.2644H6.47266Z" fill="#E2004D"/> <path id="path6" d="M6.78411 10.2724C6.72769 10.2835 6.674 10.3055 6.62611 10.3373C6.57822 10.3691 6.53707 10.4101 6.50501 10.4578C6.47295 10.5055 6.45061 10.5591 6.43927 10.6155C6.42792 10.6718 6.4278 10.7299 6.4389 10.7863C6.59495 11.583 7.00925 12.3057 7.6181 12.8427C8.22701 13.3798 8.99668 13.7012 9.80674 13.7565C10.6168 13.8117 11.4228 13.5986 12.0991 13.1492C12.7753 12.6999 13.2843 12.0398 13.5471 11.2716C13.5658 11.2172 13.5736 11.1597 13.57 11.1023C13.5664 11.0449 13.5515 10.9888 13.5262 10.9372C13.5009 10.8855 13.4657 10.8394 13.4226 10.8014C13.3794 10.7634 13.3292 10.7342 13.2748 10.7156C13.2205 10.697 13.1629 10.6892 13.1055 10.6928C13.0482 10.6964 12.992 10.7112 12.9404 10.7365C12.8888 10.7618 12.8426 10.797 12.8046 10.8402C12.7666 10.8833 12.7374 10.9335 12.7188 10.9879C12.5183 11.5739 12.1307 12.0773 11.6148 12.4201C11.099 12.7629 10.484 12.9259 9.86598 12.8838C9.24804 12.8416 8.66141 12.5962 8.19687 12.1865C7.73239 11.7768 7.41585 11.2254 7.29681 10.6176C7.27449 10.5039 7.20797 10.4037 7.11185 10.339C7.01574 10.2743 6.89787 10.2503 6.78411 10.2724Z" fill="#E2004D"/> <path id="path7" d="M13.4727 6.3269C13.3566 6.3269 13.2453 6.373 13.1633 6.45504C13.0812 6.53709 13.0352 6.64837 13.0352 6.7644V8.5144H11.2852C11.1691 8.5144 11.0578 8.5605 10.9758 8.64254C10.8937 8.72459 10.8477 8.83587 10.8477 8.9519C10.8477 9.06794 10.8937 9.17922 10.9758 9.26126C11.0578 9.34331 11.1691 9.3894 11.2852 9.3894H13.4727C13.5887 9.38939 13.7 9.34329 13.782 9.26125C13.864 9.17921 13.9101 9.06793 13.9102 8.9519V6.7644C13.9102 6.64837 13.8641 6.53709 13.782 6.45504C13.7 6.373 13.5887 6.3269 13.4727 6.3269Z" fill="#E2004D"/> <path id="path8" d="M10.1391 5.8975C9.32903 5.84217 8.52298 6.05547 7.84677 6.50476C7.17056 6.95411 6.66155 7.61415 6.39869 8.38236C6.38003 8.43675 6.37227 8.49428 6.37585 8.55166C6.37944 8.60905 6.3943 8.66516 6.41959 8.7168C6.44488 8.76844 6.4801 8.81458 6.52324 8.8526C6.56637 8.89061 6.61658 8.91975 6.67099 8.93835C6.72537 8.95702 6.7829 8.96478 6.84029 8.96119C6.89767 8.9576 6.95379 8.94274 7.00542 8.91745C7.05706 8.89216 7.10321 8.85694 7.14122 8.8138C7.17924 8.77067 7.20838 8.72046 7.22698 8.66605C7.42751 8.08 7.81509 7.57674 8.33098 7.23393C8.84687 6.89116 9.4619 6.72801 10.0798 6.77022C10.6978 6.81238 11.2844 7.05779 11.7489 7.46749C12.2135 7.87718 12.53 8.42845 12.649 9.03633C12.6713 9.15004 12.7379 9.25025 12.834 9.31497C12.9301 9.37969 13.048 9.40363 13.1617 9.38155C13.2181 9.3705 13.2718 9.34845 13.3197 9.31664C13.3676 9.28483 13.4088 9.2439 13.4408 9.19618C13.4729 9.14846 13.4952 9.09489 13.5066 9.03853C13.5179 8.98217 13.518 8.92412 13.5069 8.86771C13.3509 8.07093 12.9367 7.34829 12.3277 6.81124C11.7188 6.27418 10.9491 5.95276 10.1391 5.8975Z" fill="#E2004D"/> <path id="path7_2" d="M1.3125 2.625C0.590625 2.625 0 3.21562 0 3.9375V10.0625C0 10.7844 0.590625 11.375 1.3125 11.375H4.8125C4.92853 11.375 5.03981 11.3289 5.12186 11.2469C5.20391 11.1648 5.25 11.0535 5.25 10.9375C5.25 10.8215 5.20391 10.7102 5.12186 10.6281C5.03981 10.5461 4.92853 10.5 4.8125 10.5H1.3125C1.10104 10.5 0.875 10.274 0.875 10.0625V3.9375C0.875 3.72604 1.10104 3.5 1.3125 3.5H10.0625C10.274 3.5 10.5 3.72604 10.5 3.9375V5.10417C10.5 5.2202 10.5461 5.33148 10.6281 5.41353C10.7102 5.49557 10.8215 5.54167 10.9375 5.54167C11.0535 5.54167 11.1648 5.49557 11.2469 5.41353C11.3289 5.33148 11.375 5.2202 11.375 5.10417V3.9375C11.375 3.21562 10.7844 2.625 10.0625 2.625H1.3125Z" fill="#E2004D"/> <path id="path8_2" d="M3.12061 0C2.65394 0 2.23711 0.234608 2.02913 0.650553L2.06103 0.597005L0.369141 3.04769C0.303298 3.14318 0.278072 3.26092 0.29901 3.375C0.319947 3.48909 0.385334 3.5902 0.480794 3.65609C0.576288 3.72193 0.694021 3.74716 0.808109 3.72622C0.922197 3.70528 1.0233 3.63989 1.08919 3.54443L2.78109 1.09489C2.79259 1.07779 2.80287 1.05989 2.81185 1.04134C2.83721 0.99062 3.00394 0.875 3.12061 0.875H8.3125C8.42917 0.875 8.53627 0.940561 8.66227 1.10856L10.2812 3.53874C10.3132 3.58657 10.3542 3.62765 10.402 3.65961C10.4498 3.69157 10.5034 3.7138 10.5598 3.72501C10.6162 3.73623 10.6743 3.73622 10.7307 3.72498C10.7871 3.71374 10.8407 3.69149 10.8885 3.65951C10.985 3.59524 11.052 3.49531 11.0749 3.38167C11.0977 3.26802 11.0745 3.14995 11.0104 3.05339L9.37663 0.602702C9.37225 0.596123 9.36769 0.589665 9.36295 0.583333C9.13895 0.284667 8.77917 0 8.3125 0H3.12061Z" fill="#E2004D"/> <path id="path9" d="M5.6875 0C5.57147 0 5.46019 0.0460936 5.37814 0.128141C5.29609 0.210188 5.25 0.321468 5.25 0.4375V3.0625C5.25 3.17853 5.29609 3.28981 5.37814 3.37186C5.46019 3.45391 5.57147 3.5 5.6875 3.5C5.80353 3.5 5.91481 3.45391 5.99686 3.37186C6.07891 3.28981 6.125 3.17853 6.125 3.0625V0.4375C6.125 0.321468 6.07891 0.210188 5.99686 0.128141C5.91481 0.0460936 5.80353 0 5.6875 0Z" fill="#E2004D"/> </g> <defs> <clipPath id="clip0_0_47"> <rect width="14" height="14" fill="white"/> </clipPath> </defs> </svg>',
    notes:
      '<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"> <g id="Advanced Notes" clip-path="url(#clip0_0_29)"> <path id="icon" d="M3.21056 0.419874C3.12502 0.437878 3.06915 0.470904 2.99453 0.547512C2.88873 0.656124 2.87 0.724318 2.87 1.00072V1.23038L2.1525 1.23563C1.37323 1.24131 1.39448 1.23934 1.19 1.32532C0.816368 1.48245 0.544544 1.79829 0.444948 2.191L0.413 2.317V5.775V9.233L0.444668 9.352C0.561708 9.79187 0.877814 10.1231 1.309 10.2577L1.435 10.297H3.262H5.089L5.152 10.2596C5.3055 10.1686 5.38171 10.0392 5.38147 9.87C5.38124 9.69487 5.29672 9.558 5.138 9.47568L5.075 9.443L3.325 9.436L1.575 9.429L1.512 9.39631C1.41863 9.34786 1.34758 9.2722 1.31592 9.18754C1.28832 9.11379 1.288 9.07508 1.288 5.76997C1.288 2.06451 1.28033 2.35907 1.3798 2.24287C1.40634 2.21185 1.46079 2.17017 1.50079 2.15023L1.5735 2.114H2.22174H2.87V2.33747C2.87 2.53138 2.87395 2.57152 2.89989 2.64083C3.02655 2.97935 3.49042 3.02519 3.67952 2.71786C3.73482 2.628 3.752 2.52906 3.752 2.30042V2.114H5.362H6.972V2.33747C6.972 2.53138 6.97595 2.57152 7.00189 2.64083C7.13629 3.00006 7.63035 3.02366 7.80004 2.67897C7.84605 2.58552 7.84648 2.58278 7.85184 2.34885L7.85725 2.11296L8.51712 2.11698C9.11702 2.12064 9.18112 2.12325 9.22228 2.14574C9.29016 2.18285 9.36589 2.26457 9.39928 2.33675C9.42875 2.40047 9.42906 2.41212 9.436 3.738L9.443 5.075L9.47568 5.138C9.558 5.29672 9.69487 5.38124 9.87 5.38147C10.0392 5.38171 10.1686 5.3055 10.2596 5.152L10.297 5.089L10.3009 3.717C10.3053 2.19391 10.3071 2.23005 10.2133 2.01153C10.1359 1.83144 10.0802 1.75015 9.933 1.603C9.73717 1.40717 9.55606 1.30861 9.29173 1.25401C9.2036 1.23581 9.07043 1.232 8.52135 1.232H7.85753L7.85148 0.9905C7.84589 0.767816 7.84263 0.742994 7.80963 0.672C7.76419 0.574238 7.68615 0.496076 7.588 0.450044C7.48699 0.402654 7.33447 0.400372 7.23471 0.444752C7.13895 0.487354 7.03833 0.593754 7.002 0.690858C6.97579 0.760914 6.972 0.800198 6.972 1.00153V1.232H5.36358H3.75518L3.74959 0.9905C3.74443 0.766612 3.74139 0.743386 3.70797 0.672C3.61924 0.482398 3.41214 0.377412 3.21056 0.419874ZM2.97482 3.65043C2.80409 3.7113 2.66181 3.83942 2.58619 4.00037C2.5474 4.08295 2.5411 4.11284 2.53677 4.235C2.53288 4.34473 2.53764 4.39348 2.55879 4.46046C2.70386 4.9197 3.28423 5.05977 3.626 4.718C3.8029 4.5411 3.86126 4.27339 3.77481 4.03535C3.72446 3.89676 3.58239 3.74812 3.43312 3.67788C3.34915 3.63838 3.32315 3.63315 3.192 3.6295C3.07838 3.62634 3.02907 3.6311 2.97482 3.65043ZM5.19793 3.63958C5.05903 3.67259 4.90174 3.78906 4.81517 3.92298C4.74047 4.03857 4.71236 4.1552 4.72133 4.31243C4.72759 4.42221 4.73554 4.45379 4.77924 4.54219C4.83892 4.66294 4.96772 4.79247 5.08427 4.84894C5.46361 5.03276 5.92893 4.78404 5.99448 4.36241C6.0429 4.05089 5.85351 3.7449 5.55471 3.6519C5.46825 3.62499 5.28584 3.61869 5.19793 3.63958ZM7.33562 3.65788C7.04427 3.75721 6.86692 4.05114 6.91152 4.36075C6.97215 4.78162 7.4369 5.03115 7.82138 4.84926C7.97882 4.77478 8.12517 4.59864 8.16841 4.43156C8.25541 4.09538 8.06824 3.75446 7.74073 3.65253C7.62094 3.61525 7.45422 3.61745 7.33562 3.65788ZM3.059 5.54526C2.89839 5.56893 2.71806 5.6908 2.62423 5.83908C2.50023 6.03501 2.50335 6.34409 2.63122 6.52984C2.69504 6.62256 2.80808 6.7187 2.90888 6.76598C2.98967 6.80387 3.02238 6.81092 3.13985 6.8157C3.30956 6.82262 3.42749 6.78938 3.54441 6.70167C3.6983 6.58626 3.78557 6.44323 3.80719 6.27112C3.86282 5.82802 3.50377 5.47967 3.059 5.54526ZM5.257 5.54443C5.10712 5.56784 4.99825 5.6279 4.8838 5.75029C4.77033 5.87164 4.71846 6.00723 4.71817 6.18325C4.71775 6.43188 4.86307 6.65664 5.096 6.76764C5.18272 6.80896 5.19523 6.811 5.362 6.81099C5.53179 6.81097 5.53983 6.80959 5.63223 6.76442C5.88753 6.63963 6.03767 6.36044 5.9956 6.0887C5.95224 5.80852 5.7358 5.5887 5.46 5.54473C5.35983 5.52875 5.35739 5.52874 5.257 5.54443ZM9.61776 6.15969C8.71405 6.2208 7.89208 6.59639 7.24423 7.24423C6.58442 7.90405 6.21982 8.71279 6.15989 9.64956C6.10291 10.54 6.36339 11.3914 6.92114 12.138C7.04175 12.2994 7.41068 12.6726 7.574 12.7983C7.86691 13.0239 8.26118 13.2436 8.58704 13.363C9.59322 13.7317 10.7209 13.6478 11.655 13.1347C12.2748 12.7943 12.7943 12.2748 13.1347 11.655C13.594 10.8189 13.7126 9.81582 13.4607 8.89683C13.3319 8.4271 13.1028 7.96947 12.7983 7.574C12.6726 7.41068 12.2994 7.04175 12.138 6.92114C11.5796 6.50397 10.9942 6.26354 10.339 6.18233C10.1215 6.15538 9.82106 6.14596 9.61776 6.15969ZM9.59245 7.04306C9.2976 7.07154 8.94218 7.16911 8.666 7.29739C8.09479 7.56273 7.60127 8.04741 7.32232 8.617C6.9356 9.40664 6.93498 10.3339 7.32063 11.1196C7.5404 11.5673 7.87928 11.9555 8.29576 12.2365C8.61015 12.4487 9.02075 12.6091 9.429 12.6793C9.62847 12.7136 10.1025 12.7139 10.3052 12.6799C10.9231 12.5761 11.4483 12.3085 11.8784 11.8784C12.3068 11.45 12.5717 10.9317 12.6794 10.311C12.7131 10.1168 12.713 9.6264 12.6792 9.429C12.5945 8.93395 12.3933 8.47679 12.0967 8.10499C11.9984 7.98175 11.7749 7.75727 11.648 7.65425C11.0872 7.19902 10.3248 6.97236 9.59245 7.04306ZM3.01371 7.46959C2.82974 7.51913 2.6728 7.6487 2.58791 7.82111C2.54227 7.91384 2.541 7.92114 2.541 8.09171C2.541 8.25857 2.54307 8.27137 2.5842 8.358C2.66617 8.53062 2.82925 8.66958 3.00244 8.71441C3.45374 8.8312 3.8716 8.45866 3.80656 7.9975C3.75439 7.62761 3.37211 7.37306 3.01371 7.46959ZM9.77656 7.99387C9.64631 8.0213 9.52972 8.11768 9.47247 8.24523L9.43516 8.32839L9.43908 9.16569L9.443 10.003L9.47507 10.0631C9.52048 10.1481 9.60847 10.2312 9.69511 10.2708L9.76935 10.3048L10.6142 10.3009C11.4485 10.297 11.4597 10.2966 11.515 10.2669C11.5969 10.2228 11.6748 10.1397 11.7163 10.052C11.7655 9.9483 11.7671 9.79854 11.7203 9.69361C11.683 9.61013 11.597 9.52181 11.508 9.47568C11.4458 9.44341 11.4381 9.44292 10.878 9.436L10.311 9.429L10.304 8.862C10.2961 8.22272 10.2995 8.24386 10.1853 8.12181C10.0832 8.01262 9.92405 7.96281 9.77656 7.99387Z" fill-rule="evenodd" clip-rule="evenodd" fill="#E2004D"/> </g> <defs> <clipPath id="clip0_0_29"> <rect width="14" height="14" fill="white"/> </clipPath> </defs> </svg>',
  };

  function isCartPage() {
    return window.location.pathname === "/cart";
  }

  function getJson(url) {
    return fetch(url, { credentials: "same-origin" }).then(function (res) {
      if (!res.ok) throw new Error(url + " returned " + res.status);
      return res.json();
    });
  }

  // Brief rule: drop the pennies and add £3
  function formatUpToPrice(price) {
    return "£" + (Math.floor(price) + 3).toFixed(2);
  }

  // Resolves with the wine plan offer, or null when the basket doesn't qualify
  function getOffer() {
    return getJson("/api/offer/cart").then(function (data) {
      const offers =
        (data.response &&
          data.response.UpsellOffers &&
          data.response.UpsellOffers.offerItems) ||
        [];
      const winePlan = offers.filter(function (offer) {
        return offer.type === "WINEPLAN";
      })[0];
      return winePlan || null;
    });
  }

  function getSubscriptionData(offer) {
    let subscription = {
      itemCode: offer.itemCode,
      type: offer.type,
      rule: offer.rule,
    };

    return getJson("/api/futurepayments/byproduct?items=" + offer.itemCode)
      .then(function (data) {
        const details = data.response.itemDetails[0];
        subscription.title = details.displayName + " Subscription";
        subscription.frequency = details.frequency;
        subscription.price = formatUpToPrice(details.nextCasePrice);
        subscription.freeDelivery = details.nextCaseDeliveryCharge === 0;
        return getJson("/api/wineplan/" + details.schemeId);
      })
      .then(function (data) {
        const plan = data.response.response;
        const caseOption =
          plan.caseOptions.filter(function (option) {
            return option.optionAvailable;
          })[0] || plan.caseOptions[0];
        subscription.bottles = plan.numberOfBottles;
        subscription.colour = caseOption.caseTypeDisplayString.toLowerCase();
        return subscription;
      });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text);
    return div.innerHTML;
  }

  function buildDeliveryHtml(sub) {
    let price = sub.price;
    if (sub.freeDelivery) price = price + " + Free delivery";
    return (
      "<strong>" +
      escapeHtml(sub.bottles) +
      " bottles</strong> of " +
      escapeHtml(sub.colour) +
      " wine delivered <strong>every " +
      escapeHtml(sub.frequency) +
      " weeks</strong> for <strong>around " +
      escapeHtml(price) +
      "</strong>"
    );
  }

  function buildBenefitHtml(icon, html) {
    return (
      '<li class="lt179-benefit"><span class="lt179-icon">' +
      icon +
      "</span><span>" +
      html +
      "</span></li>"
    );
  }

  function buildModuleHtml(sub) {
    return (
      "" +
      '<div class="lt179-card">' +
      '<div class="lt179-intro">' +
      '<img class="lt179-logo" src="/next/images/subscribe-save-logo.svg" alt="Subscribe and Save">' +
      '<p class="lt179-intro-text">Save an extra 20% on your whole order today (up to £40) when you start a subscription.</p>' +
      "</div>" +
      '<div class="lt179-details">' +
      '<p class="lt179-title">' +
      escapeHtml(sub.title) +
      "</p>" +
      '<ul class="lt179-benefits">' +
      buildBenefitHtml(ICONS.calendar, buildDeliveryHtml(sub)) +
      buildBenefitHtml(
        ICONS.box,
        "Save at least <strong>20%</strong> on every renewal order",
      ) +
      buildBenefitHtml(
        ICONS.notes,
        "Change frequency, delay or cancel online at anytime",
      ) +
      "</ul>" +
      "</div>" +
      '<div class="lt179-footer">' +
      '<button type="button" class="lt179-button">Add to basket</button>' +
      "</div>" +
      "</div>"
    );
  }

  // The basket line items sit inside this wrapper; the module goes straight after it
  function findLineItemsWrapper() {
    const wrappers = document.querySelectorAll(
      '.product-area > div[style*="position: relative"]',
    );
    return wrappers[wrappers.length - 1] || null;
  }

  // Puts the module in place, or back in place if the site re-drew the basket and removed it
  function ensureModulePlaced() {
    if (!currentSubscription || !isCartPage()) return;

    const wrapper = findLineItemsWrapper();
    if (!wrapper) return;

    let module = document.querySelector(".lt179-module");
    if (module && module.previousElementSibling === wrapper) return;

    if (!module) {
      module = document.createElement("div");
      module.className = "lt179-module";
      module.innerHTML = buildModuleHtml(currentSubscription);
    }
    wrapper.insertAdjacentElement("afterend", module);
    // console.log("LT179: module placed");
    watchUpsellSeen(module);
  }

  // ---------- Events ----------

  function watchUpsellSeen(module) {
    if (upsellSeenFired || !("IntersectionObserver" in window)) return;

    if (!seenObserver) {
      seenObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting || upsellSeenFired) return;
            upsellSeenFired = true;
            seenObserver.disconnect();
            // 1. Subscription Upsell Seen (triggering event, once per basket view)
            adobeDataLayer.push({
              event: "targetClickEvent",
              eventData: {
                click: {
                  clickLocation: "Conversio CRO",
                  clickAction: "LT179 | Event Tracking",
                  clickText:
                    "LT179 (Variation 1) | Subscription Upsell Seen (trigger)",
                },
              },
            });
            // console.log("LT179 EVENT: Subscription Upsell Seen");
          });
        },
        { threshold: 0.5 },
      );
    }
    seenObserver.observe(module);
  }

  // A new page view (SPA navigation) counts as a new basket view
  function watchPageChanges() {
    const originalPushState = history.pushState;
    history.pushState = function () {
      const result = originalPushState.apply(this, arguments);
      upsellSeenFired = false;
      return result;
    };
    window.addEventListener("popstate", function () {
      upsellSeenFired = false;
    });
  }

  function cartHasSubscription(cart) {
    const items = (cart && cart.lineItems) || [];
    return items.some(function (item) {
      const upsell =
        item.classificationDetails && item.classificationDetails.upsell;
      return Boolean(upsell && upsell.type === "WINEPLAN");
    });
  }

  // Compare each new basket with the previous one, so every way of removing the subscription counts
  function checkSubscriptionRemoved(xhr) {
    let cart;
    try {
      cart =
        xhr.responseType === "json"
          ? xhr.response
          : JSON.parse(xhr.responseText);
    } catch (error) {
      return;
    }
    if (!cart || !cart.lineItems) return;

    const hasSubscription = cartHasSubscription(cart);
    if (basketHadSubscription === true && !hasSubscription) {
      // 3. Remove Subscription
      adobeDataLayer.push({
        event: "targetClickEvent",
        eventData: {
          click: {
            clickLocation: "Conversio CRO",
            clickAction: "LT179 | Event Tracking",
            clickText: "LT179 (Variation 1) | Remove Subscription",
          },
        },
      });
      // console.log("LT179 EVENT: Remove Subscription");
    }
    basketHadSubscription = hasSubscription;
  }

  function watchCheckoutClicks() {
    document.addEventListener("click", function (event) {
      if (!isCartPage()) return;
      if (event.target.closest(".order-summary .payment-checkout a")) {
        // 4. Proceed to Checkout Click
        adobeDataLayer.push({
          event: "targetClickEvent",
          eventData: {
            click: {
              clickLocation: "Conversio CRO",
              clickAction: "LT179 | Event Tracking",
              clickText: "LT179 (Variation 1) | Proceed to Checkout Click",
            },
          },
        });
        // console.log("LT179 EVENT: Proceed to Checkout Click");
      }
    });
  }

  // ---------- End events ----------

  function renderModule(sub, checkId) {
    if (checkId !== latestCheckId) return;

    currentSubscription = sub;
    const module = document.querySelector(".lt179-module");
    if (module) module.innerHTML = buildModuleHtml(sub);
    ensureModulePlaced();
    finishPendingAdd();
  }

  function removeModule() {
    currentSubscription = null;
    clearPendingAdd();
    const module = document.querySelector(".lt179-module");
    if (module) {
      module.remove();
      // console.log("LT179: module removed");
    }
  }

  const PENDING_KEY = "lt179-add-pending";

  // The native box is hidden by our CSS but still on the page (except in the site's 2→3 bug)
  function findNativeAddButton() {
    return document.querySelector(
      '[data-testid="subscribe-save-offer"] [data-testid="add-to-cart-button"]',
    );
  }

  function setButtonAdding(adding) {
    const button = document.querySelector(".lt179-button");
    if (!button) return;
    button.disabled = adding;
    button.textContent = adding ? "Adding…" : "Add to basket";
  }

  // The native button sends the request with the site's own security headers and updates the basket
  function clickNativeButton(nativeButton) {
    setButtonAdding(true);
    nativeButton.click();
    // console.log("LT179: native add button clicked");

    // If the basket never updates, give the button back so the user can try again
    setTimeout(function () {
      if (currentSubscription) setButtonAdding(false);
    }, 8000);
  }

  function readPendingAdd() {
    try {
      const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY));
      // Ignore old notes, e.g. from a reload that happened long ago
      if (pending && Date.now() - pending.time < 30000) return pending;
    } catch (error) {
      // Storage blocked or empty: carry on as if nothing is pending
    }
    return null;
  }

  function clearPendingAdd() {
    try {
      sessionStorage.removeItem(PENDING_KEY);
    } catch (error) {
      // Nothing to clear
    }
  }

  // After the reload, finish the add once the native button exists
  function finishPendingAdd() {
    const pending = readPendingAdd();
    if (!pending || !currentSubscription) return;

    if (pending.itemCode !== currentSubscription.itemCode) {
      clearPendingAdd();
      return;
    }

    const nativeButton = findNativeAddButton();
    if (!nativeButton) {
      setButtonAdding(true);
      return;
    }
    clearPendingAdd();
    clickNativeButton(nativeButton);
  }

  function onAddButtonClick(button) {
    if (!currentSubscription || button.disabled) return;

    // 2. Add Subscription CTA Click
    adobeDataLayer.push({
      event: "targetClickEvent",
      eventData: {
        click: {
          clickLocation: "Conversio CRO",
          clickAction: "LT179 | Event Tracking",
          clickText: "LT179 (Variation 1) | Add Subscription CTA Click",
        },
      },
    });
    // console.log("LT179 EVENT: Add Subscription CTA Click");

    const nativeButton = findNativeAddButton();
    if (nativeButton) {
      clickNativeButton(nativeButton);
      return;
    }

    // Native box missing (site bug): remember the add, reload so the native box appears, then finish it
    try {
      sessionStorage.setItem(
        PENDING_KEY,
        JSON.stringify({
          itemCode: currentSubscription.itemCode,
          time: Date.now(),
        }),
      );
    } catch (error) {
      // console.log("LT179: could not save pending add", error);
      return;
    }
    setButtonAdding(true);
    // console.log("LT179: native button missing, reloading to finish the add");
    window.location.reload();
  }

  // One listener on the page, so it still works after the module is re-drawn
  function watchAddButton() {
    document.addEventListener("click", function (event) {
      const button = event.target.closest(".lt179-button");
      if (button) onAddButtonClick(button);
    });
  }

  // Watch for the site re-drawing the page; check at most once per frame
  function watchForRedraws() {
    let checkQueued = false;
    const observer = new MutationObserver(function () {
      if (checkQueued || !currentSubscription) return;
      checkQueued = true;
      requestAnimationFrame(function () {
        checkQueued = false;
        ensureModulePlaced();
        finishPendingAdd();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function onBasketUpdated(reason) {
    if (!isCartPage()) return;
    // console.log("LT179: basket updated (" + reason + ")");
    document.body.classList.add("lt179-v1");

    latestCheckId = latestCheckId + 1;
    const checkId = latestCheckId;

    getOffer()
      .then(function (offer) {
        if (!offer) return null;
        return getSubscriptionData(offer);
      })
      .then(function (subscription) {
        // A newer basket update started while we waited, so this answer is out of date
        if (checkId !== latestCheckId) return;

        if (!subscription) {
          // console.log("LT179: no offer");
          removeModule();
          return;
        }
        // console.log("LT179: offer", subscription);
        renderModule(subscription, checkId);
      })
      .catch(function (error) {
        if (checkId !== latestCheckId) return;
        // Agreed fallback: show the site's original Subscribe & Save box instead
        // console.log("LT179: request failed, showing native box", error);
        removeModule();
        document.body.classList.remove("lt179-v1");
      });
  }

  // One click fires several cart requests, so wait until they stop and react once
  function scheduleBasketUpdated(reason) {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(function () {
      onBasketUpdated(reason);
    }, 300);
  }

  // Listen for the site's own basket requests finishing successfully
  function watchCartRequests() {
    const originalOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function (method, url) {
      this.addEventListener("load", function () {
        const isCartRequest = String(url).indexOf(CART_UPDATE_URL) !== -1;
        if (isCartRequest && this.status >= 200 && this.status < 300) {
          checkSubscriptionRemoved(this);
          scheduleBasketUpdated(method + " " + url);
        }
      });
      return originalOpen.apply(this, arguments);
    };
  }

  watchCartRequests();
  watchForRedraws();
  watchAddButton();
  watchPageChanges();
  watchCheckoutClicks();

  // The basket may have loaded before this script ran
  scheduleBasketUpdated("page load");
})();
