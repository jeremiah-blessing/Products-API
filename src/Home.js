import "./Home.scss";

const generateButton = document.getElementById("gak-button");
const copyButton = document.getElementById("apikey-copybutton");
const instructionsButton = document.getElementById("instructions");
const recentKeyButton = document.getElementById("recent-keys");
const swaggerUiUrl = document.getElementById("swagger-ui-url");
const viewYourSite = document.getElementById("view-your-site");
const nextContainer = document.querySelector(".whatnext-container");

var currentApiKey = "",
  copyButtonTimeout = setTimeout(() => {}, 1000);

const apiKeyBaffle = baffle(".apikey-keytext", {
  characters: "░▒▒< ▓▓░/ ▓▒▓▒▓ ░░▒ ▓▒>/▓ ░▒ ▓▓█ ██░ ▒░█",
});

// Add event listener

generateButton.addEventListener("click", () => {
  generateButton.disabled = true;
  generateButton.innerText = "Generating..";
  apiKeyBaffle.start();
  getApiKey();
});

copyButton.addEventListener("click", () => {
  clearTimeout(copyButtonTimeout);
  copyButtonTimeout = setTimeout(() => {
    copyButton.innerHTML = `Copy <i data-feather="copy"></i>`;
    feather.replace();
  }, 2000);
  copyButton.innerHTML = `Copied <i data-feather="check"></i>`;
  feather.replace();
  copyTextToClipboard(currentApiKey);
});

instructionsButton.addEventListener("click", instructionLightbox);

recentKeyButton.addEventListener("click", () => {
  const state = recentKeyButton.dataset.active;
  if (state === "true") {
    document.querySelector(".recent-keys-container").classList.remove("active");
    recentKeyButton.dataset.active = "false";
    recentKeyButton.classList.remove("active");
  } else {
    document.querySelector(".recent-keys-container").classList.add("active");
    recentKeyButton.dataset.active = "true";
    recentKeyButton.classList.add("active");
  }
  feather.replace();
});

// Functions

function instructionLightbox() {
  var pswpElement = document.querySelectorAll(".pswp")[0];

  // build items array
  // TODO: Instructions images
  var items = [
    {
      src: "https://placekitten.com/600/400",
      w: 600,
      h: 400,
    },
    {
      src: "https://placekitten.com/1200/900",
      w: 1200,
      h: 900,
    },
  ];

  // define options (if needed)
  var options = {
    // optionName: 'option value'
    // for example:
    index: 0, // start at first slide
  };

  // Initializes and opens PhotoSwipe
  var gallery = new PhotoSwipe(
    pswpElement,
    PhotoSwipeUI_Default,
    items,
    options
  );
  gallery.init();
}

function getApiKey() {
  fetch("/generate-key")
    .then((res) => {
      const status = res.status;
      switch (status) {
        case 429:
          generateButton.disabled = false;
          generateButton.innerText = "Generate";
          apiKeyBaffle
            .text((text) => "Too many requests. Try after 30s")
            .reveal(1500);
          break;
        case 201:
          res.json().then((data) => {
            generateButton.disabled = true;
            generateButton.innerText = "Generated!";
            currentApiKey = data.key;
            apiKeyBaffle.text((text) => data.key).reveal(1500);
            nextContainer.classList.add("active");

            // Set the URLs
            swaggerUiUrl.setAttribute("href", `/api-docs/${data.key}`);
            viewYourSite.setAttribute("href", `/site/${data.key}`);

            // Store it in the Localstorage
            var tempKeys = JSON.parse(localStorage.getItem("apikeys"));
            if (tempKeys === null) tempKeys = [];
            tempKeys.push(data.key);
            localStorage.setItem("apikeys", JSON.stringify(tempKeys));
            setTimeout(() => {
              renderRecentKeys();
              copyButton.style.opacity = 1;
            }, 1500);
          });
          break;

        default:
          generateButton.disabled = false;
          generateButton.innerText = "Generate";
          apiKeyBaffle.text((text) => "Network error. Try again.").reveal(1500);
          break;
      }
    })
    .catch(() => {
      generateButton.disabled = false;
      generateButton.innerText = "Generate";
      apiKeyBaffle.text((text) => "Network error. Try again.").reveal(500);
    });
}

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  textArea.style.position = "fixed";
  textArea.style.top = 0;
  textArea.style.left = 0;

  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = 0;
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";

  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Copying text command was " + msg);
  } catch (err) {
    console.log("Oops, unable to copy");
  }

  document.body.removeChild(textArea);
}

function renderRecentKeys() {
  const apikeys = JSON.parse(localStorage.getItem("apikeys"));
  const keysDiv = document.querySelector(".recent-keys-container");
  if (apikeys === null) {
    keysDiv.innerHTML = `<li>empty</li>`;
  } else {
    var keysHTML = "";
    apikeys.forEach((element) => {
      keysHTML += `<li>${element}</li>`;
    });
    keysDiv.innerHTML = keysHTML;
  }
}

// Init

function init() {
  renderRecentKeys();
}
init();
