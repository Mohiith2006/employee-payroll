const companyBrand = document.getElementById("companyBrand");
const kpiRow = document.getElementById('kpiRow');
const activityList = document.getElementById('activityList');

function getSettings() {
  return JSON.parse(localStorage.getItem('settings')) || {
    company: "Company Name",
    requiredHours: 90,
    overtimeMultiplier: 1.5
  };
}
function getEmployees() { return JSON.parse(localStorage.getItem('employees')) || []; }
function getAttendance() { return JSON.parse(localStorage.getItem('attendance')) || []; }
function getPayruns() { return JSON.parse(localStorage.getItem('payruns')) || []; }

function calcPayrollRow(emp, att, requiredHours, overtimeMultiplier) {
  if (!att || typeof att.hours === "undefined") {
    return {gross: 0, deductions: { pf: 0, esi: 0, tax: 0, total: 0 }, net: 0, otRate: 0,
      salaryForHours: 0, otPay: 0, hoursWorked: 0, overtimeHours: 0 };
  }
  const base = +emp.baseSalary || 0;
  const hoursWorked = +att.hours || 0;
  const regHours = Math.min(hoursWorked, requiredHours);
  const overtimeHours = Math.max(hoursWorked - requiredHours, 0);
  const salaryForHours = Math.round(base * (regHours / requiredHours));
  const otRate = Math.round(base / requiredHours * overtimeMultiplier);
  const otPay = Math.round(overtimeHours * otRate);
  const gross = salaryForHours + otPay;
  const pf = salaryForHours * 0.12;
  const esi = salaryForHours * 0.0175;
  const tax = Math.max(0, (salaryForHours - 25000) * 0.1);
  const deductions = pf + esi + tax;
  const net = gross - deductions;
  return {
    gross, deductions: { pf, esi, tax, total: deductions },
    net, otRate, salaryForHours, otPay, hoursWorked, overtimeHours
  };
}

function renderCompany() {
  if (companyBrand) {
    companyBrand.textContent = (getSettings().company || "Company Name").toUpperCase();
  }
}

function renderKPIs() {
  const s = getSettings();
  const payruns = getPayruns();
  let latestMonth = payruns.length ? payruns[payruns.length-1].period : '';
  const employees = getEmployees();
  const attendance = getAttendance();
  let totalNet = 0, totalOT = 0, numWithAttendance = 0;
  for (const emp of employees) {
    const att = attendance.find(a => a.employeeId === emp.id && a.period === latestMonth);
    const result = calcPayrollRow(emp, att, s.requiredHours, s.overtimeMultiplier);
    if(att && att.hours !== undefined) numWithAttendance++;
    totalNet += result.net;
    totalOT += result.otPay;
  }
  const avgNet = numWithAttendance > 0 ? Math.round(totalNet / numWithAttendance) : 0;
  kpiRow.innerHTML = `
    <div class="tile">Latest Payroll<br><b>${latestMonth||"N/A"}</b></div>
    <div class="tile">Net Payroll<br><b>₹${totalNet.toLocaleString()}</b></div>
    <div class="tile">Average Net<br><b>₹${avgNet.toLocaleString()}</b></div>
    <div class="tile">OT Paid<br><b>₹${totalOT.toLocaleString()}</b></div>
    <div class="tile">Employees<br><b>${employees.length}</b></div>
  `;
}

function renderActivity() {
  const payruns = getPayruns();
  const employees = getEmployees();
  let acts = [];
  if (payruns.length) {
    acts = acts.concat(payruns.slice(-3).map(pr =>
       `<b>Payroll Run</b> for <b>${pr.period}</b>: ₹${pr.totalNet} / ${pr.employeeCount} employees.`));
  }
  if (employees.length) {
    acts = acts.concat(employees.slice(-3).reverse().map(e =>
      `<b>Added/Edited:</b> ${e.name}, <span style="color:var(--muted);">${e.department}, ₹${e.baseSalary}</span>`));
  }
  activityList.innerHTML = acts.length ?
    acts.map(a=>`<li>${a}</li>`).join('') :
    "<li>No recent activity.</li>";
}

// Universal dashboard init—call on DOMContentLoaded and on focus/navigation
function dashboardInit() {
  renderCompany();
  renderKPIs();
  renderActivity();
}

// Global exposure and page-load
window.dashboardInit = dashboardInit;
document.addEventListener('DOMContentLoaded', dashboardInit);
