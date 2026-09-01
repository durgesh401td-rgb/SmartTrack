# SmartTrack
💰 A responsive Expense &amp; Investment Tracker web portal featuring interactive compound growth calculators and real-time data storage powered by Google Sheets and Google Apps Script.


# 📈 SmartTrack – Personal Expense & Investment Tracker

A modern, responsive, and user-friendly web application designed to help individuals monitor daily expenses, plan long-term investments, and simulate compound wealth growth. The application integrates seamlessly with **Google Sheets** as a serverless database backend via **Google Apps Script**.

---

## 🚀 Live Demo
- **Website URL:** [https://your-live-link.netlify.app](https://your-live-link.netlify.app) *(Replace with your actual link)*
- **Google Sheet Database (View Only):** [Google Sheet Link](https://docs.google.com/spreadsheets/d/your-sheet-id) *(Replace with your sheet link)*

---

## 🌟 Key Features

- **Multi-Page Semantic Navigation:** Seamless routing across 5 distinct web pages:
  - `Home`: Financial overview, hero stats, and value proposition cards.
  - `About Us`: Mission, pillars of financial discipline, and core principles.
  - `Services`: Budgeting modules and an **interactive Compound Growth Calculator**.
  - `Gallery`: Visual showcase of analytics dashboards, asset allocation, and data flow.
  - `Contact & Log Entry`: Dynamic transaction and feedback submission form.
- **Serverless Cloud Storage:** All form submissions are sent to Google Sheets in real-time with zero complex backend servers required.
- **Interactive Financial Calculators:** Real-time client-side compounding interest and SIP return calculations.
- **Fully Responsive UI:** Built with modern CSS (Flexbox, CSS Grid) for desktop, tablet, and mobile views.

---

## 🛠️ Built With

- **Frontend:**
  - Semantic HTML5
  - Modern CSS3 (Variables, Glassmorphism, CSS Grid & Flexbox)
  - JavaScript (ES6+ Fetch API, DOM manipulation)
  - [Font Awesome Icons](https://fontawesome.com/)
  - [Plus Jakarta Sans Font](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Backend & Database:**
  - Google Apps Script (`doPost` Web App handler)
  - Google Sheets API / Spreadsheet Service

---

## 📁 Project Structure

```text
├── index.html              # Home page
├── about.html              # About Us page
├── services.html           # Services & interactive investment calculator
├── gallery.html            # Analytics showcase gallery
├── contact.html            # Contact & transaction logging form
├── style.css               # Global stylesheet & responsive styles
├── script.js               # Client-side JavaScript & form handler
├── google-apps-script.js   # Google Apps Script backend code
└── README.md               # Project documentation
