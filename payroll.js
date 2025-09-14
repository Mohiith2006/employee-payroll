const REQUIRED_MONTHLY_HOURS = 90;
const OVERTIME_RATE_MULTIPLIER = 1.5;

const payrollTable = document.getElementById('payrollTable');
const payrollMonth = document.getElementById('payrollMonth');
const processPayrollBtn = document.getElementById('processPayrollBtn');
const slipModal = document.getElementById('slipModal');

function getEmployees() { return JSON.parse(localStorage.getItem('employees')) || []; }
function getAttendance() { return JSON.parse(localStorage.getItem('attendance')) || []; }
function getPayruns() { return JSON.parse(localStorage.getItem('payruns')) || []; }
function setPayruns(list) { localStorage.setItem('payruns', JSON.stringify(list)); }

function calcPayrollRow(emp, att) {
  if (!att || typeof att.hours === "undefined") {
    return {
      gross: 0, deductions: { pf: 0, esi: 0, tax: 0, total: 0 }, net: 0, otRate: 0,
      salaryForHours: 0, otPay: 0, hoursWorked: 0, overtimeHours: 0
    };
  }
  const base = +emp.baseSalary || 0;
  const hoursWorked = +att.hours || 0;
  const regHours = Math.min(hoursWorked, REQUIRED_MONTHLY_HOURS);
  const overtimeHours = Math.max(hoursWorked - REQUIRED_MONTHLY_HOURS, 0);
  const salaryForHours = Math.round(base * (regHours / REQUIRED_MONTHLY_HOURS));
  const otRate = Math.round(base / REQUIRED_MONTHLY_HOURS * OVERTIME_RATE_MULTIPLIER);
  const otPay = Math.round(overtimeHours * otRate);
  const gross = salaryForHours + otPay;
  const pf = salaryForHours * 0.12;
  const esi = salaryForHours * 0.0175;
  const tax = Math.max(0, (salaryForHours - 25000) * 0.1);
  const deductions = pf + esi + tax;
  const net = gross - deductions;

  return {
    gross,
    deductions: { pf, esi, tax, total: deductions },
    net,
    otRate,
    salaryForHours,
    otPay,
    hoursWorked,
    overtimeHours
  };
}

function getCurrentMonth() {
  return payrollMonth.value || new Date().toISOString().slice(0,7);
}

function renderPayroll() {
  const employees = getEmployees();
  const attendance = getAttendance();
  const month = getCurrentMonth();
  let html = `<table class="table"><thead><tr>
    <th>ID</th><th>Name</th><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th><th>Actions</th>
  </tr></thead><tbody>`;
  let totalNet = 0, totalDeductions = 0, totalOT = 0;
  for (const emp of employees) {
    const att = attendance.find(a => a.employeeId === emp.id && a.period === month) || null;
    const result = calcPayrollRow(emp, att);
    totalNet += Math.round(result.net);
    totalDeductions += Math.round(result.deductions.total);
    totalOT += Math.round(result.otPay || 0);

    html += `<tr>
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>₹${result.gross.toFixed(2)}</td>
      <td>
        <span class="badge">PF ₹${result.deductions.pf.toFixed(0)}</span>
        <span class="badge">ESI ₹${result.deductions.esi.toFixed(0)}</span>
        <span class="badge">Tax ₹${result.deductions.tax.toFixed(0)}</span>
      </td>
      <td>₹${result.net.toFixed(2)}</td>
      <td>
        <button class="btn" onclick="showPayslip('${emp.id}')">Payslip</button>
      </td>
    </tr>`;
  }
  html += '</tbody></table>';
  html += `<div style="padding:8px 0;"><strong>Total Net:</strong> ₹${totalNet} | <strong>Total Deductions:</strong> ₹${totalDeductions} | <strong>Total Overtime Paid:</strong> ₹${totalOT}</div>`;
  payrollTable.innerHTML = html;
}

processPayrollBtn.onclick = function() {
  const employees = getEmployees();
  const attendance = getAttendance();
  const month = getCurrentMonth();
  if (!month) return alert("Please select a month.");

  let totalNet = 0;
  for (const emp of employees) {
    const att = attendance.find(a => a.employeeId === emp.id && a.period === month) || null;
    const result = calcPayrollRow(emp, att);
    totalNet += Math.round(result.net);
  }
  let prs = getPayruns();
  if (prs.some(pr => pr.period === month)) {
    alert("Payroll already processed for this month.");
    return;
  }
  prs.push({period: month, totalNet, employeeCount: employees.length});
  setPayruns(prs);
  alert("Payroll processed!");
  renderPayroll();
};

window.showPayslip = function(empId) {
  const employees = getEmployees();
  const emp = employees.find(e => e.id === empId);
  const attendance = getAttendance();
  const month = getCurrentMonth();
  const att = attendance.find(a => a.employeeId === empId && a.period === month) || {hours: 0};
  const calcs = calcPayrollRow(emp, att);

  slipModal.innerHTML = `
  <div class="content">
    <h2>Payslip: ${emp.name} (${month})</h2>
    <table class="table" style="margin:18px 0;">
      <tr><td><b>Employee ID</b></td><td>${emp.id}</td></tr>
      <tr><td><b>Department</b></td><td>${emp.department}</td></tr>
      <tr><td><b>Role</b></td><td>${emp.role}</td></tr>
      <tr><td><b>Required Hours (Month)</b></td><td>${REQUIRED_MONTHLY_HOURS}</td></tr>
      <tr><td><b>Hours Worked</b></td><td>${calcs.hoursWorked}</td></tr>
      <tr><td><b>Overtime Hours</b></td><td>${calcs.overtimeHours} (₹${calcs.otRate} per hr)</td></tr>
      <tr><td><b>Base Salary (Full)</b></td><td>₹${emp.baseSalary}</td></tr>
      <tr><td><b>Prorated Salary</b></td><td>₹${calcs.salaryForHours}</td></tr>
      <tr><td><b>Overtime Pay</b></td><td>₹${calcs.otPay}</td></tr>
      <tr><td><b><b>Gross Pay</b></b></td><td><b>₹${calcs.gross.toFixed(2)}</b></td></tr>
      <tr><td><b>PF</b></td><td>₹${calcs.deductions.pf.toFixed(0)}</td></tr>
      <tr><td><b>ESI</b></td><td>₹${calcs.deductions.esi.toFixed(0)}</td></tr>
      <tr><td><b>Tax</b></td><td>₹${calcs.deductions.tax.toFixed(0)}</td></tr>
      <tr><td><b>Total Deductions</b></td><td><b>₹${calcs.deductions.total.toFixed(2)}</b></td></tr>
      <tr><td><b>Net Salary</b></td><td><b>₹${calcs.net.toFixed(2)}</b></td></tr>
    </table>
    <div style="display:flex;gap:14px;">
      <button class="btn" onclick="printPayslip()">Print</button>
      <button class="btn" id="closeModal">Close</button>
    </div>
  </div>
  `;
  slipModal.style.display = "flex";
  document.getElementById("closeModal").onclick = closeModal;
  window.printPayslip = function() {
    var content = slipModal.querySelector('.content').innerHTML;
    var wind = window.open('', '', 'width=600,height=700');
    wind.document.write('<html><head><title>Payslip</title>');
    wind.document.write('<link rel="stylesheet" href="assets/css/base.css"/><link rel="stylesheet" href="assets/css/components.css"/>');
    wind.document.write('</head><body>' + content + '</body></html>');
    wind.document.close();
    wind.print();
    setTimeout(() => wind.close(), 100);
  }
}
function closeModal() {
  slipModal.style.display = "none";
}

payrollMonth.onchange = renderPayroll;
document.addEventListener('DOMContentLoaded', () => {
  payrollMonth.value = new Date().toISOString().slice(0,7);
  renderPayroll();
});
