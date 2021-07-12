// Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const currentHex = document.querySelectorAll(".color h2");
const controls = document.querySelectorAll(".controls");
const generateBtn = document.querySelector(".generate");
const sliderContainers = document.querySelectorAll(".sliders");
const sliders = document.querySelectorAll('input[type="range"]');
let initialColors;

// Functions

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

function openAdjustmentPannel(index) {
  sliderContainers[index].classList.toggle("active");
}

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

//invocation
randomColors();

// Event listeners

// generate new colors with button
generateBtn.addEventListener("click", randomColors);

// change background color when move slider
sliders.forEach((slider) => {
  slider.addEventListener("input", (e) => {
    hslControls(e);
  });
});

// change hex value after slider relsease
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

// click to copy hex value
currentHex.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

// opens and closes slider when clicking on slider control button
controls.forEach((control, index) => {
  control.children[0].addEventListener("click", () => {
    openAdjustmentPannel(index);
  });
});

// closes slider panel when clicking on close button
sliderContainers.forEach((container, index) => {
  container.children[0].addEventListener("click", () => {
    openAdjustmentPannel(index);
  });
});

// locks the current color from being regenerated
controls.forEach((control, index) => {
  control.children[1].addEventListener("click", () => {
    lockColor(index);
  });
});
