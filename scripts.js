// Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const currentHex = document.querySelectorAll(".color h2");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
let initialColors;

// Functions
// Generate random hex
function generateHex() {
  return chroma.random();
}

// Assign random color hex value to each colors div
function randomColors() {
  colorDivs.forEach((div, index) => {
    const colorH2 = div.children[0];
    const randomColor = generateHex();

    //add color and hash
    div.style.backgroundColor = randomColor;
    colorH2.innerText = randomColor;

    //check for contrast
    checkTextContrast(randomColor, colorH2);

    //initial color slider
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
}

// check color luminance for contrast with h2 text
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.3) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  // scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  // update input range colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(
    0.5
  )}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)`;
}

function hslControls(e) {
  //get the index of slider in data attribute
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  // select sliders in target color
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  // get current background color
  const bgColor = colorDivs[index].querySelector("h2").innerText;

  // adjust color using slider values
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  // set background color to new value
  colorDivs[index].style.backgroundColor = color;
}

//invocation
randomColors();

// Event listeners
sliders.forEach((slider) => {
  slider.addEventListener("input", function (e) {
    hslControls(e);
  });
});
