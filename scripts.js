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
let initialColors;

// Functions --------------------------------------------------

// Generate Random Hex
function generateHex() {
  return chroma.random();
}

// Assign Random Color Hex Value To Each Color Div
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

    // Add Color And Hash
    div.style.backgroundColor = randomColor;
    colorH2.innerText = randomColor;

    // Check For Contrast
    checkTextContrast(randomColor, colorH2);
    for (icon of icons) {
      checkTextContrast(randomColor, icon);
    }

    // Initial Color Slider
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  resetInputs();
}

// Check Color Luminance Contrast With Text And Icons
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.3) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

// Range Slider Background Color
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

// Update Color Div Background After Slider
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

// Update Hex Value In Color Div After Slider
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

// Range Slider Hue, Saturation, and Brightness Values
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

// Copies Hex Value To Clipboard
function copyToClipboard(hex) {
  // Create / Destroy Copy Element
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  // Opens Confirmation Modal
  const popup = document.querySelector(".copy-container");
  popup.classList.add("active");
  popup.children[0].classList.add("active");

  // Closes Modal After 1 Sec
  setTimeout(() => {
    popup.classList.remove("active");
    popup.children[0].classList.remove("active");
  }, 1000);
}

// Opens Slider Adjustment Pannel
function openAdjustmentPannel(index) {
  sliderContainers[index].classList.toggle("active");
}

// Locks Color Palette During Generate
function lockColor(index) {
  const lockBtn = controls[index].children[1];
  colorDivs[index].classList.toggle("locked");
  lockBtn.classList.toggle("locked");

  // Toggle Lock Icon
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
  // Generate Paletts Before Open
  generateLibrary(localPalettes);

  // Open Library
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
  // Clean Items From Library
  libraryPalettes.innerHTML = "";

  // Create Library Items And Append To Library Modal
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
    selectBtn.setAttribute("data-nr", palette.nr);
    selectBtn.addEventListener("click", (e) => {
      selectPalette(e);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.classList.add("delete-palette");
    deleteBtn.setAttribute("data-nr", palette.nr);
    deleteBtn.addEventListener("click", (e) => {
      deletePalette(e);
    });

    paletteColor.forEach((color) => {
      const smallColorDiv = document.createElement("div");
      smallColorDiv.style.backgroundColor = color;
      smallColorDiv.classList.add("small-color");
      smallPalette.appendChild(smallColorDiv);
    });
    libraryItem.appendChild(nameH3);
    libraryItem.appendChild(smallPalette);
    libraryItem.appendChild(selectBtn);
    libraryItem.appendChild(deleteBtn);

    libraryPalettes.appendChild(libraryItem);
  });
}

//
function savePalette() {
  // Generate Palette Object
  const name = saveInput.value;
  const paletteColors = [];
  currentHex.forEach((hex) => paletteColors.push(hex.innerText));

  let PaletteNr;

  if (localStorage.getItem("palettes") === null) {
    PaletteNr = 0;
  } else {
    const results = JSON.parse(localStorage.getItem("palettes"));
    PaletteNr = results.length;
  }

  const paletteObj = { name: name, color: paletteColors, nr: PaletteNr };

  // Save to Local Storage
  saveLocal(paletteObj);

  // Reset Name Value
  saveInput.value = "";

  //Close Save Modal
  closeSavePopup();
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

// Select From Library Palette
function selectPalette(e) {
  const index = e.target.getAttribute("data-nr");
  const colorsArray = JSON.parse(localStorage.getItem("palettes"))[index].color;
  initialColors = colorsArray;

  colorDivs.forEach((div, index) => {
    const colorH2 = div.children[0];
    const backgroundColor = colorsArray[index];

    const icons = div.querySelectorAll(".controls button");

    // Add Color And Hash
    div.style.backgroundColor = backgroundColor;
    colorH2.innerText = backgroundColor;

    // Check For Contrast
    checkTextContrast(backgroundColor, colorH2);
    for (icon of icons) {
      checkTextContrast(backgroundColor, icon);
    }

    // Initial Color Slider
    const color = chroma(backgroundColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  closeLibraryPopup();
}

// Delete Palette
function deletePalette(e) {
  // Filter Local Storage For Deleted Item
  const index = e.target.getAttribute("data-nr");
  const localItems = JSON.parse(localStorage.getItem("palettes"));
  const filtered = localItems.filter((el) => el.nr != index);

  // Assign New Key Value And Set Local Storage
  let newLocal = [];

  filtered.forEach((palette, index) => {
    const paletteObj = { name: palette.name, color: palette.color, nr: index };
    newLocal.push(paletteObj);
  });

  localStorage.setItem("palettes", JSON.stringify(newLocal));

  // New Library Minus Deleted Item
  generateLibrary(newLocal);
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
