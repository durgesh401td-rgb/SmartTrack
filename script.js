// ==============================================================================
// SmartTrack — Core Application Engine
// Features: INR (₹) Financial Formatting, Action Audit Logger, Custom EMI &
// Spending Manager, Live Custom Currency Engine, & Client Advisory System
// ==============================================================================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbycDAU-ASJLtjqigyEPA9EUsUyxjTN3qlO5VMzogxCe_PepDkOlIZNHZH97t3DFq_l8/exec";

// ------------------------------------------------------------------------------
// 1. BACKEND ACTION LOGGER (Captures & Records Every Single User Interaction)
// ------------------------------------------------------------------------------
const ActionLogger = {
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem("smarttrack_action_logs") || "[]");
    } catch (e) {
      return [];
    }
  },

  async log(action, details = {}) {
    const logEntry = {
      id: "act_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      isoTime: new Date().toISOString(),
      action: action,
      details: details,
      page: window.location.pathname.split("/").pop() || "index.html",
      synced: false
    };

    // 1. Save locally for instant offline audit & UI inspection
    const logs = this.getLogs();
    logs.unshift(logEntry);
    if (logs.length > 100) logs.pop(); // Keep latest 100 actions
    localStorage.setItem("smarttrack_action_logs", JSON.stringify(logs));
    this.updateLogUI();

    // 2. Transmit to Google Apps Script Backend in real-time
    try {
      if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
        fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "action_log",
            action: action,
            details: details,
            page: logEntry.page,
            timestamp: logEntry.timestamp,
            clientMeta: navigator.userAgent
          })
        }).then(() => {
          logEntry.synced = true;
          this.markSynced(logEntry.id);
        }).catch((err) => {
          console.warn("Backend log sync deferred:", err);
        });
      }
    } catch (err) {
      console.warn("Action logging fetch exception:", err);
    }
  },

  markSynced(id) {
    const logs = this.getLogs();
    const entry = logs.find(l => l.id === id);
    if (entry) {
      entry.synced = true;
      localStorage.setItem("smarttrack_action_logs", JSON.stringify(logs));
      this.updateLogUI();
    }
  },

  updateLogUI() {
    const badge = document.getElementById("logCountBadge");
    if (badge) {
      const logs = this.getLogs();
      badge.textContent = logs.length;
    }
    const listContainer = document.getElementById("actionLogDrawerList");
    if (listContainer) {
      const logs = this.getLogs();
      if (logs.length === 0) {
        listContainer.innerHTML = '<p class="log-empty">No actions recorded yet.</p>';
        return;
      }
      listContainer.innerHTML = logs.map(l => `
        <div class="log-item ${l.synced ? 'synced' : 'pending'}">
          <div class="log-item-header">
            <strong>${escapeHTML(l.action)}</strong>
            <span class="log-time">${l.timestamp}</span>
          </div>
          <div class="log-item-body">
            <code>${escapeHTML(typeof l.details === "object" ? JSON.stringify(l.details) : l.details)}</code>
          </div>
          <div class="log-item-footer">
            <span class="sync-tag ${l.synced ? 'tag-green' : 'tag-amber'}">
              <i class="fa-solid ${l.synced ? 'fa-cloud-arrow-up' : 'fa-paper-plane'}"></i>
              ${l.synced ? 'Backend Synced' : 'Dispatched to Backend'}
            </span>
            <span class="log-page">${escapeHTML(l.page)}</span>
          </div>
        </div>
      `).join("");
    }
  }
};

// Global helper for logging
function recordAction(action, details) {
  ActionLogger.log(action, details);
}

// ------------------------------------------------------------------------------
// 2. INR FORMATTER UTILITY (₹ Lakhs & Crores friendly)
// ------------------------------------------------------------------------------
function formatINR(number) {
  if (isNaN(number) || number === null) return "₹0";
  const rounded = Math.round(number);
  return "₹" + rounded.toLocaleString("en-IN");
}

function escapeHTML(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ------------------------------------------------------------------------------
// 3. LIVE & CUSTOMIZABLE CURRENCY EXCHANGE ENGINE
// ------------------------------------------------------------------------------
const CurrencyEngine = {
  // Exchange rates relative to INR (1 Unit = X INR)
  rates: {
    INR: 1.0,
    USD: 86.50,
    EUR: 92.30,
    GBP: 110.60,
    AED: 23.55,
    CAD: 61.80,
    SGD: 64.70
  },

  symbols: {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "د.إ",
    CAD: "CA$",
    SGD: "S$"
  },

  init() {
    const saved = localStorage.getItem("smarttrack_custom_rates");
    if (saved) {
      try {
        this.rates = { ...this.rates, ...JSON.parse(saved) };
      } catch (e) {}
    }
    this.renderRateCards();
    this.bindEvents();
  },

  bindEvents() {
    const convertBtn = document.getElementById("currencyConvertBtn");
    if (convertBtn) {
      convertBtn.addEventListener("click", () => this.handleConvert());
    }
    const updateRateBtn = document.getElementById("updateCustomRateBtn");
    if (updateRateBtn) {
      updateRateBtn.addEventListener("click", () => this.handleCustomRateUpdate());
    }
    const fetchLiveBtn = document.getElementById("fetchLiveRatesBtn");
    if (fetchLiveBtn) {
      fetchLiveBtn.addEventListener("click", () => this.fetchLiveRates());
    }
  },

  renderRateCards() {
    const container = document.getElementById("currencyRatesGrid");
    if (!container) return;

    container.innerHTML = Object.keys(this.rates).filter(k => k !== "INR").map(code => `
      <div class="rate-card" data-currency="${code}">
        <div class="rate-header">
          <span class="rate-code">${code} (${this.symbols[code] || ''})</span>
          <span class="rate-badge">1 ${code} = ₹${this.rates[code].toFixed(2)}</span>
        </div>
        <div class="rate-edit-row">
          <label>Adjust Rate (₹):</label>
          <input type="number" step="0.01" class="custom-rate-input" id="rate_${code}" value="${this.rates[code]}">
        </div>
      </div>
    `).join("");
  },

  handleCustomRateUpdate() {
    const updated = {};
    Object.keys(this.rates).forEach(code => {
      if (code === "INR") return;
      const input = document.getElementById(`rate_${code}`);
      if (input && !isNaN(parseFloat(input.value)) && parseFloat(input.value) > 0) {
        this.rates[code] = parseFloat(input.value);
        updated[code] = this.rates[code];
      }
    });
    localStorage.setItem("smarttrack_custom_rates", JSON.stringify(this.rates));
    this.renderRateCards();
    this.handleConvert();
    recordAction("Custom Currency Rate Adjusted", { newRates: updated });
    alert("✅ Custom currency exchange rates updated and stored!");
  },

  async fetchLiveRates() {
    const btn = document.getElementById("fetchLiveRatesBtn");
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Fetching live forex...';

    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (res.ok) {
        const data = await res.json();
        const inrPerUsd = data.rates.INR;
        if (inrPerUsd) {
          this.rates.USD = inrPerUsd;
          this.rates.EUR = inrPerUsd / data.rates.EUR;
          this.rates.GBP = inrPerUsd / data.rates.GBP;
          this.rates.AED = inrPerUsd / data.rates.AED;
          this.rates.CAD = inrPerUsd / data.rates.CAD;
          this.rates.SGD = inrPerUsd / data.rates.SGD;
          localStorage.setItem("smarttrack_custom_rates", JSON.stringify(this.rates));
          this.renderRateCards();
          this.handleConvert();
          recordAction("Live Market Forex Rates Fetched", { baseUSD: inrPerUsd, rates: this.rates });
          alert("⚡ Live market exchange rates synced successfully!");
        }
      }
    } catch (e) {
      alert("⚠️ Using cached exchange rates (Forex API rate-limited or offline).");
    } finally {
      if (btn) btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Fetch Real-Time Market Rates';
    }
  },

  handleConvert() {
    const amountInput = document.getElementById("convertAmount");
    const fromSelect = document.getElementById("convertFrom");
    const toSelect = document.getElementById("convertTo");
    const resultBox = document.getElementById("convertResult");

    if (!amountInput || !fromSelect || !toSelect || !resultBox) return;

    const amount = parseFloat(amountInput.value) || 0;
    const from = fromSelect.value;
    const to = toSelect.value;

    // Convert 'from' to INR, then to 'to'
    const inrValue = amount * (this.rates[from] || 1);
    const converted = inrValue / (this.rates[to] || 1);

    const fromSym = this.symbols[from] || from;
    const toSym = this.symbols[to] || to;

    resultBox.innerHTML = `
      <div class="result-highlight">
        <span>${fromSym}${amount.toLocaleString("en-IN")} ${from} =</span>
        <h3>${toSym}${converted.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${to}</h3>
      </div>
      <p class="rate-sub">Effective Rate: 1 ${from} = ${( (this.rates[from] || 1) / (this.rates[to] || 1) ).toFixed(4)} ${to}</p>
    `;

    recordAction("Currency Converted", { from, to, amount, converted: converted.toFixed(2) });
  }
};

// ------------------------------------------------------------------------------
// 4. CUSTOM EMI & LOAN REPAYMENT CALCULATOR
// ------------------------------------------------------------------------------
function calculateEMI() {
  const principal = parseFloat(document.getElementById("emi-principal").value) || 0;
  const annualRate = parseFloat(document.getElementById("emi-rate").value) || 0;
  const tenureYears = parseFloat(document.getElementById("emi-tenure").value) || 0;
  const tenureType = document.getElementById("emi-tenure-type") ? document.getElementById("emi-tenure-type").value : "years";

  const totalMonths = tenureType === "months" ? tenureYears : tenureYears * 12;

  if (principal <= 0 || annualRate <= 0 || totalMonths <= 0) {
    alert("Please enter valid positive numbers for Principal, Interest Rate, and Tenure.");
    return;
  }

  const monthlyRate = annualRate / 12 / 100;
  // Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - principal;

  // Prepayment simulation: What if 1 extra EMI paid per year?
  const extraEmiAnnual = emi;
  // Approximation of tenure reduction
  const interestPercent = Math.round((totalInterest / totalPayment) * 100);

  document.getElementById("emi-monthly-result").textContent = formatINR(emi);
  document.getElementById("emi-interest-result").textContent = formatINR(totalInterest);
  document.getElementById("emi-total-result").textContent = formatINR(totalPayment);
  document.getElementById("emi-split-result").textContent = `${100 - interestPercent}% Principal / ${interestPercent}% Interest`;

  const tipBox = document.getElementById("emi-management-tip");
  if (tipBox) {
    tipBox.style.display = "block";
    tipBox.innerHTML = `
      <div class="tip-card">
        <h4><i class="fa-solid fa-lightbulb"></i> Smart EMI Repayment Strategy</h4>
        <p>• <strong>Prepayment Power:</strong> Paying just <strong>1 extra EMI of ${formatINR(emi)} per year</strong> can reduce your tenure by ~<strong>${Math.max(1, Math.round(totalMonths * 0.18 / 12))} years</strong> and save up to <strong>${formatINR(totalInterest * 0.22)}</strong> in total interest!</p>
        <p>• <strong>DTI Guideline:</strong> Ensure your total combined monthly EMIs do not exceed <strong>40% of your monthly take-home income</strong>.</p>
      </div>
    `;
  }

  recordAction("EMI Calculated", {
    principal,
    annualRate,
    totalMonths,
    monthlyEMI: Math.round(emi),
    totalInterest: Math.round(totalInterest)
  });
}

// ------------------------------------------------------------------------------
// 5. SPENDING & BUDGET MANAGEMENT CALCULATOR (50/30/20 & Health Score)
// ------------------------------------------------------------------------------
function calculateSpendingBudget() {
  const income = parseFloat(document.getElementById("spend-income").value) || 0;
  const needs = parseFloat(document.getElementById("spend-needs").value) || 0;
  const wants = parseFloat(document.getElementById("spend-wants").value) || 0;
  const emis = parseFloat(document.getElementById("spend-emis").value) || 0;
  const investments = parseFloat(document.getElementById("spend-investments").value) || 0;

  if (income <= 0) {
    alert("Please enter a valid Monthly In-Hand Income.");
    return;
  }

  const totalExpense = needs + wants + emis;
  const actualSavings = income - totalExpense;
  const savingsRate = Math.round((actualSavings / income) * 100);
  const dti = Math.round((emis / income) * 100);

  // Ideal 50/30/20 figures
  const idealNeeds = income * 0.50;
  const idealWants = income * 0.30;
  const idealSavings = income * 0.20;

  // Actual percentages
  const needsPct = Math.round(((needs + emis) / income) * 100);
  const wantsPct = Math.round((wants / income) * 100);

  // Health Score (0 - 100)
  let healthScore = 60;
  if (savingsRate >= 20) healthScore += 20;
  else if (savingsRate < 5) healthScore -= 25;

  if (dti <= 30) healthScore += 15;
  else if (dti > 45) healthScore -= 20;

  if (wantsPct <= 30) healthScore += 10;
  else healthScore -= 10;

  healthScore = Math.max(10, Math.min(100, healthScore));

  let healthBadge = "🟢 Excellent Health";
  let badgeColor = "#10b981";
  if (healthScore < 50) {
    healthBadge = "🔴 Critical Overspending Alert";
    badgeColor = "#ef4444";
  } else if (healthScore < 75) {
    healthBadge = "🟡 Moderate Financial Balance";
    badgeColor = "#f59e0b";
  }

  // Populate UI
  document.getElementById("spend-total-outflow").textContent = formatINR(totalExpense);
  document.getElementById("spend-net-savings").textContent = formatINR(actualSavings);
  document.getElementById("spend-savings-rate").textContent = `${savingsRate}% of income`;
  document.getElementById("spend-dti-rate").textContent = `${dti}% (${dti > 40 ? 'High Risk' : 'Safe Zone'})`;

  const statusBox = document.getElementById("spend-score-box");
  if (statusBox) {
    statusBox.style.display = "block";
    statusBox.innerHTML = `
      <div class="score-card" style="border-left: 5px solid ${badgeColor};">
        <div class="score-header">
          <h3>Financial Health Score: <strong>${healthScore}/100</strong></h3>
          <span class="health-pill" style="background:${badgeColor}20; color:${badgeColor}; font-weight:700;">${healthBadge}</span>
        </div>
        <div class="score-breakdown-bars">
          <div class="bar-group">
            <div class="bar-labels"><span>Needs & Fixed EMIs (Actual: ${needsPct}% vs Ideal: 50%)</span></div>
            <div class="progress-track"><div class="progress-fill ${needsPct > 55 ? 'fill-red' : 'fill-green'}" style="width: ${Math.min(100, needsPct)}%"></div></div>
          </div>
          <div class="bar-group">
            <div class="bar-labels"><span>Lifestyle & Wants (Actual: ${wantsPct}% vs Ideal: 30%)</span></div>
            <div class="progress-track"><div class="progress-fill ${wantsPct > 35 ? 'fill-amber' : 'fill-blue'}" style="width: ${Math.min(100, wantsPct)}%"></div></div>
          </div>
        </div>
      </div>
    `;
  }

  // Tailored Advice Generator
  const adviceList = [];
  if (dti > 40) {
    adviceList.push(`⚠️ <strong>High Debt Burden (${dti}% DTI):</strong> Your EMIs consume more than 40% of income. Prioritize prepaying high-cost debt (credit cards, personal loans) before aggressive stock market investing.`);
  }
  if (wants > idealWants) {
    const excess = wants - idealWants;
    adviceList.push(`✂️ <strong>Lifestyle Trimming Opportunity:</strong> You are spending ${formatINR(excess)} above the recommended 30% wants threshold. Diverting half (${formatINR(excess / 2)}) to an automated SIP could generate ${formatINR((excess / 2) * 12 * 10 * 1.8)} over 10 years.`);
  }
  if (actualSavings < idealSavings) {
    adviceList.push(`🛡️ <strong>Savings Gap:</strong> Currently saving ${savingsRate}% vs recommended 20% (${formatINR(idealSavings)}/mo). Automate savings on salary day before spending.`);
  } else {
    adviceList.push(`🏆 <strong>Outstanding Savings Discipline!</strong> You are saving ${savingsRate}% (${formatINR(actualSavings)}/mo). Ensure you maintain a 6-month emergency reserve of ${formatINR(totalExpense * 6)} in high-yield liquid funds.`);
  }

  const adviceContainer = document.getElementById("spend-advice-container");
  if (adviceContainer) {
    adviceContainer.style.display = "block";
    adviceContainer.innerHTML = `
      <div class="advice-card">
        <h4><i class="fa-solid fa-compass"></i> Tailored Financial Management Directives</h4>
        <ul>${adviceList.map(item => `<li>${item}</li>`).join("")}</ul>
      </div>
    `;
  }

  recordAction("Spending & Budget Analyzed", {
    income,
    needs,
    wants,
    emis,
    healthScore,
    savingsRate,
    dti
  });
}

// ------------------------------------------------------------------------------
// 6. CLIENT PERSONA & ADVISORY SYSTEM
// ------------------------------------------------------------------------------
const ClientAdvisor = {
  personas: {
    student: {
      title: "Student / Early Career Fresher",
      monthlyIncome: "₹25,000 - ₹45,000",
      focus: "Aggressive Skill Investment & Habit Building",
      emergencyTarget: "3 Months of Living Expenses (₹30,000 - ₹50,000)",
      budgetSplit: "55% Needs | 25% Wants | 20% Growth & Index Funds",
      recommendations: [
        "Avoid Credit Card revolving debt and 'Buy Now Pay Later' (BNPL) schemes.",
        "Start a micro-SIP of just ₹1,000/month in a Nifty 50 Index Fund to learn market compounding.",
        "Build a basic medical health insurance cover independent of employer cover.",
        "Focus on upskilling: the highest ROI in your 20s is career earning power."
      ]
    },
    salaried: {
      title: "Salaried Corporate Professional",
      monthlyIncome: "₹75,000 - ₹2,50,000",
      focus: "Tax Optimization & Long-term Wealth Creation",
      emergencyTarget: "6 Months of Core Living Expenses in Liquid/FD funds",
      budgetSplit: "50% Needs | 30% Lifestyle | 20% Direct Equity & Mutual Funds",
      recommendations: [
        "Maximize Section 80C via ELSS Tax Saver Funds or EPF/PPF.",
        "Maintain strict 50/30/20 budgeting rule to avoid lifestyle creep with salary appraisals.",
        "Purchase Pure Term Life Insurance equal to 15x–20x of your annual income.",
        "Diversify into international equity (10%) and flexi-cap domestic equity mutual funds (70%)."
      ]
    },
    loan_heavy: {
      title: "Family with Active Home / Auto Loan",
      monthlyIncome: "₹1,00,000 - ₹3,00,000",
      focus: "EMI Optimization, Debt Elimination & Family Security",
      emergencyTarget: "6–9 Months of Total Expenses including EMIs",
      budgetSplit: "60% Needs & EMIs | 20% Basic Wants | 20% Prepayment & Retirement",
      recommendations: [
        "Apply the 1 Extra EMI / Year strategy to save up to 4–6 years of interest.",
        "Ensure Home Loan insurance or term cover protects the property liability against emergencies.",
        "Keep at least 6 months of EMIs in a sweep-in FD for unconditional peace of mind.",
        "Avoid taking high-interest personal loans to furnish or renovate mortgaged property."
      ]
    },
    hni: {
      title: "High Net-Worth / Wealth Accumulator",
      monthlyIncome: "₹3,50,000+",
      focus: "Capital Preservation, Estate Planning & Asymmetric Growth",
      emergencyTarget: "12 Months in Liquid Arbitrage & Sovereign Debt",
      budgetSplit: "35% Lifestyle | 15% Core Needs | 50% Asset Accumulation",
      recommendations: [
        "Deploy into PMS / AIFs / Private Equity once mutual fund limits are saturated.",
        "Structure assets across HUF (Hindu Undivided Family) or trust entities for tax efficiency.",
        "Hedge currency exposure via US Equities (LRS route) and sovereign gold bonds (SGB).",
        "Annual portfolio rebalancing to trim overperforming equities into risk-free debt."
      ]
    }
  },

  selectPersona(personaKey) {
    const data = this.personas[personaKey];
    if (!data) return;

    // Highlight button
    document.querySelectorAll(".persona-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-persona") === personaKey);
    });

    const output = document.getElementById("personaAdvisorOutput");
    if (!output) return;

    output.innerHTML = `
      <div class="advisor-result-card">
        <div class="advisor-badge">Profile Archetype: ${data.title}</div>
        <div class="advisor-grid-stats">
          <div class="adv-stat">
            <span>Income Bracket:</span>
            <strong>${data.monthlyIncome}</strong>
          </div>
          <div class="adv-stat">
            <span>Recommended Split:</span>
            <strong>${data.budgetSplit}</strong>
          </div>
          <div class="adv-stat">
            <span>Emergency Buffer:</span>
            <strong>${data.emergencyTarget}</strong>
          </div>
          <div class="adv-stat">
            <span>Strategic Core Focus:</span>
            <strong>${data.focus}</strong>
          </div>
        </div>
        <div class="adv-recommendations">
          <h4><i class="fa-solid fa-list-check"></i> Actionable Roadmap for this Profile:</h4>
          <ul>
            ${data.recommendations.map(r => `<li>${r}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    recordAction("Client Advisory Persona Selected", { persona: personaKey, title: data.title });
  }
};

// ------------------------------------------------------------------------------
// 7. COMPOUND INVESTMENT GROWTH CALCULATOR (INR ₹)
// ------------------------------------------------------------------------------
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

  document.getElementById("res-invested").innerText = formatINR(investedAmount);
  document.getElementById("res-gain").innerText = formatINR(estimatedReturns);
  document.getElementById("res-total").innerText = formatINR(totalValue);

  recordAction("SIP Compound Growth Calculated", {
    monthlyInvestment: monthly,
    expectedReturnRate: rate,
    tenureYears: years,
    futureTotalValue: Math.round(totalValue)
  });
}

// ------------------------------------------------------------------------------
// 8. FORM SUBMISSION & LIFECYCLE HOOKS
// ------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Currency Engine
  CurrencyEngine.init();

  // 2. Initialize Persona Advisor if present
  if (document.getElementById("personaAdvisorOutput")) {
    ClientAdvisor.selectPersona("salaried");
  }

  // 3. Initialize Action Logger UI
  ActionLogger.updateLogUI();

  // 4. Record Page View Action
  recordAction("Page Viewed", {
    title: document.title,
    path: window.location.pathname,
    screen: `${window.innerWidth}x${window.innerHeight}`
  });

  // 5. Drawer Toggle Logic
  const toggleBtn = document.getElementById("openLogDrawerBtn");
  const closeBtn = document.getElementById("closeLogDrawerBtn");
  const drawer = document.getElementById("actionLogDrawer");

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener("click", () => {
      drawer.classList.add("open");
      recordAction("Action Log Drawer Opened");
    });
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener("click", () => {
      drawer.classList.remove("open");
    });
  }

  // Clear log history button
  const clearBtn = document.getElementById("clearLogsBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear local activity audit cache?")) {
        localStorage.removeItem("smarttrack_action_logs");
        ActionLogger.updateLogUI();
        recordAction("Audit Cache Cleared Locally");
      }
    });
  }

  // 6. Contact & Transaction Logging Form
  const form = document.getElementById("trackerForm");
  const responseMsg = document.getElementById("formResponse");
  const submitBtn = document.getElementById("submitBtn");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing to Google Sheets...';
      responseMsg.className = "response-message";
      responseMsg.style.display = "none";

      const formData = new FormData(form);
      const dataPayload = {
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        entryType: formData.get("entryType"),
        category: formData.get("category"),
        amount: formData.get("amount") || 0,
        notes: formData.get("notes")
      };

      try {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          showNotification("Success! Form verified locally. (Deploy Google Apps Script URL for live cloud sync).", "success");
          form.reset();
        } else {
          await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataPayload)
          });

          showNotification(`🎉 Success! Entry of ₹${dataPayload.amount} recorded to Google Sheets database.`, "success");
          form.reset();
        }

        recordAction("Financial Entry Submitted", {
          entryType: dataPayload.entryType,
          category: dataPayload.category,
          amount: dataPayload.amount,
          fullName: dataPayload.fullName
        });

      } catch (error) {
        console.error("Submission error:", error);
        showNotification("⚠️ An error occurred while submitting. Please try again.", "error");
        recordAction("Form Submission Failed", { error: error.toString() });
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit to Google Sheet (₹)';
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