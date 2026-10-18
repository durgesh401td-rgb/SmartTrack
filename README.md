# 💰 SmartTrack — Personal Expense & Investment Tracker

A modern, responsive, and privacy-focused personal finance portal built in vanilla HTML5, CSS3, and JavaScript, integrated with a Google Apps Script serverless backend and Google Sheets database.

SmartTrack is tailored for Indian Rupee (`₹`) financial tracking, custom loan EMI management, spending ratio optimization, dynamic forex conversions, and real-time backend action auditing.

---

## 🚀 Key Features

### 1. 🪙 Indian Rupee (`₹`) Denominated Accounting
- Full native support for Indian Rupee currency formatting (`formatINR`) with Lakhs and Crores notations.
- Real-time net worth tracking, monthly expense breakdowns, and mutual fund / SIP growth summaries.

### 2. 🧮 Comprehensive Financial Calculator Suite
- **Custom Loan EMI & Prepayment Calculator**:
  - Calculates Monthly EMI, Total Interest Payable, and Principal vs. Interest split.
  - **Smart Prepayment Strategy**: Calculates exact years and interest saved by paying 1 extra EMI per year.
- **Spending & Budget Health Advisor (50/30/20 Rule)**:
  - Evaluates In-Hand Income against Fixed Needs, Wants, and Loan EMIs.
  - Computes Debt-to-Income (DTI) ratio with risk flags (Safe Zone vs. High Debt Alert).
  - Generates a **Financial Health Score (0–100)** with dynamic progress meters and actionable cash flow directives.
- **Systematic Investment Plan (SIP) Compounding Calculator**:
  - Simulates compounding returns over 1 to 50 years with custom annual return rates.

### 3. 💱 Live & Customizable Forex Engine
- Real-time exchange ticker for USD, EUR, GBP, and AED relative to INR (`₹`).
- **Editable Custom Rates**: Allows users to manually adjust and store custom exchange rates in `localStorage` as per project requirements.
- **Market Rate Sync**: One-click integration with live Forex APIs to fetch current market exchange rates.
- **Two-Way Currency Converter**: Instant conversion between INR, USD, EUR, GBP, and AED.

### 4. 🎯 Client-Centric Recommendation System
Interactive financial roadmaps tailored for specific client archetypes:
- **Student / Early Career**: Micro-SIPs, emergency buffer, and debt avoidance.
- **Salaried Professional**: Tax optimization (Section 80C, ELSS, PPF) and 50/30/20 discipline.
- **Family with Active Loan**: Prepayment strategies and liability protection.
- **High Net-Worth (HNI) Investor**: HUF structuring, PMS/AIFs, and currency hedging.

### 5. ⚡ Real-Time Backend Action Logger & Google Sheets Sync
- **Universal Audit Trail**: Automatically logs every user interaction (calculations, currency updates, persona clicks, form submissions).
- **Google Apps Script Dual-Sheet Backend**:
  - Routes financial transactions to the `Transactions` sheet.
  - Routes interaction events to the `Action_Logs` sheet.
- **In-Browser Audit Drawer**: Live slide-in drawer to inspect all captured client events and their cloud sync status.

---

## 📂 Repository Structure

```
expense-tracker/
├── index.html                       # Main dashboard and landing portal
├── about.html                       # About us, mission, and core principles
├── services.html                    # EMI, Spending, SIP calculators & Client Advisor
├── gallery.html                     # Visual analytics showcase & UI previews
├── contact.html                     # Transaction entry form & contact support
├── style.css                        # Responsive stylesheet and design system
├── script.js                        # Client logic, calculations & backend action logger
├── google-apps-script.js            # Serverless webhook script for Google Sheets
├── SmartTrack_Source_Code.pdf       # Compiled source code documentation
├── SmartTrack_Source_Code_Minimal.pdf # Compact 38-page minimal code PDF
└── README.md                        # Project documentation
```

---

## 🛠️ Google Sheets & Apps Script Setup

1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. In the top menu, go to **Extensions** > **Apps Script**.
3. Copy the code from [`google-apps-script.js`](google-apps-script.js) and paste it into the editor (`Code.gs`).
4. Click **Deploy** > **New deployment**.
5. Select type: **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
6. Click **Deploy** and copy the generated **Web App URL**.
7. Open [`script.js`](script.js) and update the `GOOGLE_SCRIPT_URL` constant:
   ```javascript
   const GOOGLE_SCRIPT_URL = "YOUR_DEPLOYED_WEB_APP_URL_HERE";
   ```

---

## 💻 Running Locally

Simply open `index.html` in any modern web browser or run a lightweight local server:

```bash
# Python 3
python -m http.server 8000

# Node.js npx
npx serve .
```

Navigate to `http://localhost:8000` in your browser.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
