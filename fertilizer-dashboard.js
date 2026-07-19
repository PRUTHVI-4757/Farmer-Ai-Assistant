const form = document.getElementById("fertilizerForm");
const submitBtn = document.getElementById("submitBtn");
const messageBox = document.getElementById("messageBox");
const fileInput = document.getElementById("soilReport");
const fileName = document.getElementById("fileName");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const resultState = document.getElementById("resultState");

const outCrop = document.getElementById("outCrop");
const outSoilSummary = document.getElementById("outSoilSummary");
const outN = document.getElementById("outN");
const outP = document.getElementById("outP");
const outK = document.getElementById("outK");
const outPh = document.getElementById("outPh");
const outFertilizer = document.getElementById("outFertilizer");
const outAdvice = document.getElementById("outAdvice");
const outWeather = document.getElementById("outWeather");
const outUpdated = document.getElementById("outUpdated");
const confidenceScore = document.getElementById("confidenceScore");

function collectData() {
  return {
    Crop: document.getElementById("crop").value.trim(),
    Season: document.getElementById("season").value,
    Soil_Type: document.getElementById("soilType").value,
    Nitrogen_Level: document.getElementById("nitrogenLevel").value,
    Phosphorus_Level: document.getElementById("phosphorusLevel").value,
    Potassium_Level: document.getElementById("potassiumLevel").value,
    pH: parseFloat(document.getElementById("ph").value),
    Growth_Stage: document.getElementById("growthStage").value
  };
}

function validateData(data) {
  if (!data.Crop || !data.Season || !data.Soil_Type || !data.Nitrogen_Level || !data.Phosphorus_Level || !data.Potassium_Level || isNaN(data.pH) || !data.Growth_Stage) {
    return "Please fill in all required fields before getting fertilizer advice.";
  }
  if (data.pH < 0 || data.pH > 14) {
    return "Soil pH must be between 0 and 14.";
  }
  return "";
}

function setMessage(text, type = "error") {
  messageBox.textContent = text;
  messageBox.style.color = type === "success" ? "#8ff0b1" : "#ffb8b8";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? "Analyzing Farm Data..." : "🌱 Get Fertilizer Advice";
  emptyState.classList.toggle("hidden", isLoading || !resultState.classList.contains("hidden"));
  loadingState.classList.toggle("hidden", !isLoading);
}

function showResult(payload, data) {
  outCrop.textContent = data.Crop;
  outSoilSummary.textContent = `${data.Soil_Type} soil, ${data.Season} season, ${data.Growth_Stage} stage`;
  outN.textContent = data.Nitrogen_Level;
  outP.textContent = data.Phosphorus_Level;
  outK.textContent = data.Potassium_Level;
  outPh.textContent = data.pH.toFixed(1);
  outFertilizer.textContent = payload.fertilizer || "No fertilizer returned";
  outAdvice.textContent = "Apply fertilizer based on local soil test and crop stage.";
  outWeather.textContent = "Check rainfall and irrigation before application.";
  outUpdated.textContent = new Date().toLocaleString();
  confidenceScore.textContent = "Confidence: Backend Response";
  emptyState.classList.add("hidden");
  loadingState.classList.add("hidden");
  resultState.classList.remove("hidden");
  setMessage("Fertilizer advice received successfully.", "success");
}

function showError(text) {
  loadingState.classList.add("hidden");
  resultState.classList.add("hidden");
  emptyState.classList.remove("hidden");
  setMessage(text);
  submitBtn.disabled = false;
  submitBtn.textContent = "🌱 Get Fertilizer Advice";
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileName.textContent = file ? file.name : "No file selected";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMessage("");

  const data = collectData();
  const validationError = validateData(data);

  if (validationError) {
    setMessage(validationError);
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    const result = await response.json();
    showResult(result, data);
  } catch (error) {
    showError("Unable to connect to the AI fertilizer advisor. Please start the Python Flask backend.");
  }
});