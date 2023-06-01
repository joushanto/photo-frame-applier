// Get DOM elements
const uploadInput = document.getElementById("upload-input");
const nameInput = document.getElementById("name-input");
const zoomRange = document.getElementById("zoom-range");
const rotationRange = document.getElementById("rotation-range");
const cropBtn = document.getElementById("crop-btn");
const downloadBtn = document.getElementById("download-btn");
const canvas = document.getElementById("canvas");
const frameImg = document.getElementById("frame");
const ctx = canvas.getContext("2d");

// canvas.width = 500;
// canvas.height = 500;

// Variables for image manipulation
let uploadedImage = null;
let zoomValue = 1;
let rotationValue = 0;

// Event listener for file upload
uploadInput.addEventListener("change", handleUpload, false);

// Handle uploaded file
function handleUpload(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      uploadedImage = img;
      updateCanvas();
      cropBtn.disabled = false;
    };
    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
}

// Update the canvas with the current image and adjustments
function updateCanvas() {
  const imageSize = Math.min(canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.translate(centerX, centerY);
  ctx.rotate((rotationValue * Math.PI) / 180);

  // Calculate the scaled size while maintaining the aspect ratio
  const scale = Math.max(uploadedImage.width, uploadedImage.height) / imageSize;
  const scaledWidth = uploadedImage.width / scale;
  const scaledHeight = uploadedImage.height / scale;

  // Center the image on the canvas
  const offsetX = -scaledWidth / 2;
  const offsetY = -scaledHeight / 2;

  ctx.scale(zoomValue, zoomValue);
  ctx.drawImage(uploadedImage, offsetX, offsetY, scaledWidth, scaledHeight);
  ctx.restore();

  // Apply frame
  ctx.drawImage(frameImg, 0, 0, imageSize, imageSize);

  // Add name overlay
  const name = nameInput.value.trim();
  if (name) {
    ctx.fillStyle = "#fff"; // Name text color
    ctx.font = "24px Arial"; // Name font style
    ctx.textAlign = "center";
    ctx.fillText(name, centerX, centerY - imageSize / 2 + 30); // Adjust position as needed
  }
}

// Perform cropping
function cropImage() {
  const frameSize = frameImg.width; // Get frame size from frame image

  const croppedImage = document.createElement("canvas");
  croppedImage.width = croppedImage.height = frameSize;
  const croppedCtx = croppedImage.getContext("2d");

  const imageSize = Math.min(canvas.width, canvas.height);
  const offsetX = (canvas.width - imageSize) / 2;
  const offsetY = (canvas.height - imageSize) / 2;

  croppedCtx.drawImage(
    canvas,
    offsetX,
    offsetY,
    imageSize,
    imageSize,
    0,
    0,
    frameSize,
    frameSize
  );

  canvas.width = frameSize;
  canvas.height = frameSize;
  ctx.drawImage(croppedImage, 0, 0, frameSize, frameSize);

  // Add name overlay
  // const name = nameInput.value.trim();
  // if (name) {
  //   ctx.fillStyle = "#fff"; // Name text color
  //   ctx.font = "24px Arial"; // Name font style
  //   ctx.textAlign = "center";
  //   ctx.fillText(name, frameSize / 2, frameSize - 30); // Adjust position as needed
  // }

  downloadBtn.disabled = false;
}

// Download the final image
function downloadImage() {
  const link = document.createElement("a");
  link.href = canvas.toDataURL();
  link.download = "edited_photo.png";
  link.click();
}

// Event listener for zoom range slider
zoomRange.addEventListener("input", function (e) {
  zoomValue = e.target.value / 100;
  updateCanvas();
});

// Event listener for rotation range slider
rotationRange.addEventListener("input", function (e) {
  rotationValue = e.target.value;
  updateCanvas();
});

// Add event listeners
cropBtn.addEventListener("click", cropImage);
downloadBtn.addEventListener("click", downloadImage);
uploadInput.addEventListener("change", handleUpload);
nameInput.addEventListener("input", updateCanvas);
