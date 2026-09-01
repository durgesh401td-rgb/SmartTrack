// --- Google Apps Script Web App URL ---
// Replace this with your own deployed Google Apps Script URL (instructions below)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycDAU-ASJLtjqigyEPA9EUsUyxjTN3qlO5VMzogxCe_PepDkOlIZNHZH97t3DFq_l8/exec";

// --- 1. Form Submission with Google Sheets Integration ---
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("trackerForm");
  const responseMsg = document.getElementById("formResponse");
  const submitBtn = document.getElementById("submitBtn");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Show loading indicator
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Google Sheet...';
      responseMsg.className = "response-message";
      responseMsg.style.display = "none";

      const formData = new FormData(form);
      const dataPayload = {
        timestamp: new Date().toLocaleString(),
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        entryType: formData.get("entryType"),
        category: formData.get("category"),
        amount: formData.get("amount") || 0,
        notes: formData.get("notes")
      };

      try {
        if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
          // Fallback simulation if user hasn't pasted the URL yet
          await new Promise((resolve) => setTimeout(resolve, 1000));
          showNotification("Success! Form validated. (Configure Google Apps Script URL in script.js to write directly to Google Sheets).", "success");
          form.reset();
        } else {
          // Real Google Sheets submission
          const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(dataPayload)
          });

          showNotification("🎉 Success! Your entry has been recorded in Google Sheets.", "success");
          form.reset();
        }
      } catch (error) {
        console.error("Submission error:", error);
        showNotification("⚠️ An error occurred while submitting. Please try again.", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit to Google Sheet';
      }
    });
  }
});

function showNotification(text, type) {
  const responseMsg = document.getElementById("formResponse");
  if (responseMsg) {
    responseMsg.textContent = text;
    responseMsg.className = `response-message ${type}`;
    responseMsg.style.display = "block";
  }
}

// --- 2. Interactive Investment Growth Calculator ---
function calculateGrowth() {
  const monthly = parseFloat(document.getElementById("calc-monthly").value) || 0;
  const rate = parseFloat(document.getElementById("calc-rate").value) || 0;
  const years = parseFloat(document.getElementById("calc-years").value) || 0;

  const months = years * 12;
  const monthlyRate = rate / 100 / 12;

  let totalValue = 0;
  if (monthlyRate > 0) {
    totalValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  } else {
    totalValue = monthly * months;
  }

  const investedAmount = monthly * months;
  const estimatedReturns = totalValue - investedAmount;

  document.getElementById("res-invested").innerText = `$${Math.round(investedAmount).toLocaleString()}`;
  document.getElementById("res-gain").innerText = `$${Math.round(estimatedReturns).toLocaleString()}`;
  document.getElementById("res-total").innerText = `$${Math.round(totalValue).toLocaleString()}`;
}