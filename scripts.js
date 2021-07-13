// Global selections and variables -----------------------------
const colorDivs = document.querySelectorAll(".color");
const currentHex = document.querySelectorAll(".color h2");
const controls = document.querySelectorAll(".controls");
const sliderContainers = document.querySelectorAll(".sliders");
const sliders = document.querySelectorAll('input[type="range"]');
const generateBtn = document.querySelector(".generate");
const saveBtn = document.querySelector(".save");
const saveInput = document.querySelector(".save-container input");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const libraryBtn = document.querySelector(".library");
const closeLibrary = document.querySelector(".close-library");
const libraryPalettes = document.querySelector(".palette-list");
let savedPalettes = [];
let initialColors;

// Functions --------------------------------------------------

// Generate random hex
function generateHex() {
  return chroma.random();
}

// Assign random color hex value to each colors div
function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const colorH2 = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains("locked")) {
      initialColors.push(colorH2.innerText);
      return;
    } else {
      initialColors.push(randomColor.hex());
    }

    const icons = div.querySelectorAll(".controls button");

    //add color and hash
    div.style.backgroundColor = randomColor;
    colorH2.innerText = randomColor;

    //check for contrast
    checkTextContrast(randomColor, colorH2);
    for (icon of icons) {
      checkTextContrast(randomColor, icon);
    }

    //initial color slider
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  resetInputs();
}

// check color luminance for contrast with text and icons
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.3) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

// updates the range slider background color
function colorizeSliders(color, hue, brightness, saturation) {
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(
    0.5
  )}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)`;
}

// Sets the color div background when adjusting the sliders
function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  colorizeSliders(color, hue, brightness, saturation);
}

// update the hex value displayed in color div after updating slider
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);

  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();

  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

// range slider value of hue, saturation, and brightness values from generated color
function resetInputs() {
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = hueValue;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = satValue;
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = brightValue;
    }
  });
}

// copies hex value to clipboard
function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  const popup = document.querySelector(".copy-container");

  popup.classList.add("active");
  popup.children[0].classList.add("active");

  setTimeout(() => {
    popup.classList.remove("active");
    popup.children[0].classList.remove("active");
  }, 1000);
}

// opens slider adjustment pannel
function openAdjustmentPannel(index) {
  sliderContainers[index].classList.toggle("active");
}

// locks color in the palette during generate
function lockColor(index) {
  const lockBtn = controls[index].children[1];
  colorDivs[index].classList.toggle("locked");
  lockBtn.classList.toggle("locked");

  if (lockBtn.classList.contains("locked")) {
    lockBtn.innerHTML = `<i class="fas fa-lock"></i>`;
  } else {
    lockBtn.innerHTML = `<i class="fas fa-lock-open"></i>`;
  }
}

// Opens Save Palette Popup
function savePopup() {
  const popup = document.querySelector(".save-container");
  popup.classList.add("active");
  popup.children[0].classList.add("active");
}

// Closes Save Palette Popup
function closeSavePopup() {
  const popup = document.querySelector(".save-container");
  popup.classList.remove("active");
  popup.children[0].classList.remove("active");
}

// Opens Library Popup
function LibraryPopup() {
  let localPalettes;

  // Check Local Storage Before Save
  if (localStorage.getItem("palettes") === null) {
    localPalettes = "No Color Palettes Saved";
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  generateLibrary(localPalettes);

  const popup = document.querySelector(".library-container");
  popup.classList.add("active");
  popup.children[0].classList.add("active");
}

// Closes Library Popup
function closeLibraryPopup() {
  const popup = document.querySelector(".library-container");
  popup.classList.remove("active");
  popup.children[0].classList.remove("active");
}

function generateLibrary(localPalettes) {
  libraryPalettes.innerHTML = "";

  localPalettes.forEach((palette) => {
    const libraryItem = document.createElement("div");
    libraryItem.classList.add("library-item");

    const paletteName = palette.name;
    const paletteColor = palette.color;

    const nameH3 = document.createElement("h3");
    nameH3.innerText = paletteName;
    nameH3.classList.add("palette-name");

    const smallPalette = document.createElement("div");
    smallPalette.classList.add("small-palette");

    const selectBtn = document.createElement("button");
    selectBtn.innerText = "Select";
    selectBtn.classList.add("select-palette");

    paletteColor.forEach((color) => {
      const smallColorDiv = document.createElement("div");
      smallColorDiv.style.backgroundColor = color;
      smallColorDiv.classList.add("small-color");
      smallPalette.appendChild(smallColorDiv);
    });
    libraryItem.appendChild(nameH3);
    libraryItem.appendChild(smallPalette);
    libraryItem.appendChild(selectBtn);

    libraryPalettes.appendChild(libraryItem);
  });
}

//
function savePalette() {
  //Close Save Modal
  const popup = document.querySelector(".save-container");
  popup.classList.remove("active");
  popup.children[0].classList.remove("active");

  // Generate Palette Object
  const name = saveInput.value;
  const paletteColors = [];
  currentHex.forEach((hex) => paletteColors.push(hex.innerText));
  let PaletteNr = savedPalettes.length;
  const paletteObj = { name: name, color: paletteColors, nr: PaletteNr };
  savedPalettes.push(paletteObj);

  // Save to Local Storage
  saveLocal(paletteObj);

  // Reset Name Value
  saveInput.value = "";
}

// Save Local Storage
function saveLocal(paletteObj) {
  let localPalettes;

  // Check Local Storage Before Save
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  // Save To Local Storage
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

//Invocation
randomColors();

// Event listeners  ---------------------------------

// On Generate Button
generateBtn.addEventListener("click", randomColors);

// On Save Button
saveBtn.addEventListener("click", savePopup);

// Save Modal Close Button
closeSave.addEventListener("click", closeSavePopup);

// Save Modal Save Button
submitSave.addEventListener("click", savePalette);

// On Library Button
libraryBtn.addEventListener("click", LibraryPopup);

// Library Modal Close Button
closeLibrary.addEventListener("click", closeLibraryPopup);

// On Sliders
sliders.forEach((slider) => {
  slider.addEventListener("input", (e) => {
    hslControls(e);
  });
});

// On Color Divs
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

// On Hex Values
currentHex.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

// On Slider Icon
controls.forEach((control, index) => {
  control.children[0].addEventListener("click", () => {
    openAdjustmentPannel(index);
  });
});

// Slider Panel Close Button
sliderContainers.forEach((container, index) => {
  container.children[0].addEventListener("click", () => {
    openAdjustmentPannel(index);
  });
});

// On Lock Icon
controls.forEach((control, index) => {
  control.children[1].addEventListener("click", () => {
    lockColor(index);
  });
});
