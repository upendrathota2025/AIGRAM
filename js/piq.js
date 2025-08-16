// DOM elements
const actionSelect = document.getElementById('action');
const extraInputs = document.getElementById('extraInputs');
const uploadedImg = document.getElementById('uploadedImg');
const renderedImg = document.getElementById('renderedImg');
const imageInput = document.getElementById('imageUpload');
const renderBtn = document.getElementById('renderBtn');
const spinner = document.getElementById('spinner');

// Update extra input fields based on action
function updateExtraInputs() {
  extraInputs.innerHTML = '';
  if (actionSelect.value === 'resize' || actionSelect.value === 'crop') {
    extraInputs.innerHTML = `
      <label>Width:</label>
      <input type="number" id="widthInput" placeholder="Width in px" min="1">
      <label>Height:</label>
      <input type="number" id="heightInput" placeholder="Height in px" min="1">`;
  } else if (actionSelect.value === 'compress') {
    extraInputs.innerHTML = `
      <label>Compression %:</label>
      <input type="number" id="compressionInput" placeholder="1-100" min="1" max="100">`;
  }
}

// Initialize on load
updateExtraInputs();
actionSelect.addEventListener('change', updateExtraInputs);

// Show uploaded image preview
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) {
    uploadedImg.src = "images/dummy-image.png"; // fallback placeholder
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    uploadedImg.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Handle Render button click
renderBtn.addEventListener('click', async () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("⚠️ Please upload an image first.");
    return;
  }

  // Validate inputs
  let width, height, compression;
  if (actionSelect.value === "resize" || actionSelect.value === "crop") {
    width = parseInt(document.getElementById("widthInput")?.value, 10);
    height = parseInt(document.getElementById("heightInput")?.value, 10);

    if (!width || !height || width <= 0 || height <= 0) {
      alert("⚠️ Please enter valid positive Width and Height.");
      return;
    }
  } else if (actionSelect.value === "compress") {
    compression = parseInt(document.getElementById("compressionInput")?.value, 10);
    if (!compression || compression <= 0 || compression > 100) {
      alert("⚠️ Please enter a valid Compression % (1–100).");
      return;
    }
  }
  // Grayscale needs no extra validation

  // Prepare form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("action", actionSelect.value);
  if (width) formData.append("width", width);
  if (height) formData.append("height", height);
  if (compression) formData.append("compression", compression);

  try {
    // Show spinner & dim image
    spinner.style.display = "inline-block";
    renderedImg.style.opacity = "0.3";

    // 🔗 Replace with your actual API endpoint
    const response = await fetch("https://your-api.com/render", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("API error");

    // If API returns an image blob
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    renderedImg.src = url;

    // If API returns JSON with base64:
    // const data = await response.json();
    // renderedImg.src = "data:image/png;base64," + data.image;

  } catch (err) {
    console.error(err);
    alert("❌ Failed to render image. Please try again.");
  } finally {
    // Hide spinner & restore image opacity
    spinner.style.display = "none";
    renderedImg.style.opacity = "1";
  }
});

// Download rendered image with dynamic filename
document.getElementById('downloadBtn').addEventListener('click', () => {
  if (!renderedImg.src || renderedImg.src.includes("dummy-image.png")) {
    alert("⚠️ No rendered image available to download.");
    return;
  }

  let filename = "rendered";

  switch (actionSelect.value) {
    case "resize":
    case "crop": {
      const width = document.getElementById("widthInput")?.value || "auto";
      const height = document.getElementById("heightInput")?.value || "auto";
      filename += `_${actionSelect.value}_${width}x${height}`;
      break;
    }
    case "compress": {
      const compression = document.getElementById("compressionInput")?.value || "unknown";
      filename += `_compress_${compression}`;
      break;
    }
    case "grayscale":
      filename += "_grayscale";
      break;
  }

  filename += ".png"; // final extension

  const link = document.createElement("a");
  link.href = renderedImg.src;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Reset uploaded image
document.getElementById('resetBtn').addEventListener('click', () => {
  // Clear file input
  imageInput.value = "";

  // Restore placeholder
  uploadedImg.src = "images/dummy-image.png";

  // Also reset rendered image since nothing to render anymore
  renderedImg.src = "images/dummy-image.png";
});


// Bulk form toggle
document.getElementById('bulkBtn').addEventListener('click', () => {
  const formContainer = document.getElementById('bulkFormContainer');
  formContainer.style.display = formContainer.style.display === "none" ? "block" : "none";
});

// Handle bulk form submit
document.getElementById('bulkForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const tps = document.getElementById('tps').value;
  const usecase = document.getElementById('usecase').value;
  const email = document.getElementById('email').value;
  const company = document.getElementById('company').value;
  const volume = document.getElementById('volume').value;

  const details = {
    tps,
    usecase,
    email,
    company,
    volume
  };

  try {
    // 🔗 Replace this with your backend email API
    const response = await fetch("https://your-api.com/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details)
    });

    if (!response.ok) throw new Error("Email API failed");

    alert("✅ Request submitted successfully. We will contact you shortly.");
    e.target.reset();
    document.getElementById('bulkFormContainer').style.display = "none";

  } catch (err) {
    console.error(err);
    alert("❌ Failed to submit request. Please try again later.");
  }
});
