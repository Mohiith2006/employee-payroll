const anaMonth = document.getElementById('anaMonth');
const kpiRow = document.getElementById('kpiRow');
const chartsGrid = document.getElementById('chartsGrid');

const REQUIRED_MONTHLY_HOURS = 90;
const OVERTIME_RATE_MULTIPLIER = 1.5;

function getEmployees() { return JSON.parse(localStorage.getItem('employees')) || []; }
function getAttendance() { return JSON.parse(localStorage.getItem('attendance')) || []; }
function getPayruns() { return JSON.parse(localStorage.getItem('payruns')) || []; }

function calcPayrollRow(emp, att) {
  if (!att || typeof att.hours === "undefined") {
    return {gross: 0, deductions: { pf: 0, esi: 0, tax: 0, total: 0 }, net: 0, otRate: 0,
      salaryForHours: 0, otPay: 0, hoursWorked: 0, overtimeHours: 0 };
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
    gross, deductions: { pf, esi, tax, total: deductions },
    net, otRate, salaryForHours, otPay, hoursWorked, overtimeHours
  };
}

function getCurrentMonth() {
  return anaMonth.value || new Date().toISOString().slice(0,7);
}

function renderKPIs(month) {
  const employees = getEmployees();
  const attendance = getAttendance();
  let totalNet = 0, totalOT = 0, totalGross = 0;
  let numWithAttendance = 0;
  for (const emp of employees) {
    const att = attendance.find(a => a.employeeId === emp.id && a.period === month);
    const result = calcPayrollRow(emp, att);
    if (att && att.hours !== undefined) numWithAttendance += 1;
    totalNet += result.net;
    totalGross += result.gross;
    totalOT += result.otPay;
  }
  const avgNet = numWithAttendance > 0 ? Math.round(totalNet / numWithAttendance) : 0;
  kpiRow.innerHTML = `
    <div class="tile">Net Payroll <br><b>₹${totalNet.toLocaleString()}</b></div>
    <div class="tile">Average Net Pay <br><b>₹${avgNet.toLocaleString()}</b></div>
    <div class="tile">OT Paid <br><b>₹${totalOT.toLocaleString()}</b></div>
    <div class="tile">Active Employees <br><b>${numWithAttendance}</b></div>
  `;
}

function renderCharts(month) {
  chartsGrid.innerHTML = `
    <div class="chart-panel">
      <canvas id="trendChart"></canvas>
      <div class="info-panel" id="trendInfo"></div>
    </div>
    <div class="chart-panel">
      <canvas id="pieChart"></canvas>
      <div class="info-panel" id="pieInfo"></div>
    </div>
    <div class="chart-panel">
      <canvas id="empHoursChart"></canvas>
      <div class="info-panel" id="empHoursInfo"></div>
    </div>
    <div class="chart-panel">
      <canvas id="stackChart"></canvas>
      <div class="info-panel" id="stackInfo"></div>
    </div>
    <div class="chart-panel">
      <canvas id="donutChart"></canvas>
      <div class="info-panel" id="donutInfo"></div>
    </div>
  `;

  const employees = getEmployees();
  const attendance = getAttendance();
  const payruns = getPayruns();

  // --- 1. Payroll Trend Line
  const trendMonths = payruns.map(pr => pr.period);
  const trendNet = payruns.map(pr => pr.totalNet);
  new Chart(document.getElementById('trendChart').getContext('2d'), {
    type: 'line',
    data: { labels: trendMonths, datasets: [{label: "Payroll Trend", data:trendNet, borderColor:'#22c55e', fill:true, backgroundColor:'#22c55e44' }] },
    options: { plugins: { legend: { display: false } }, aspectRatio: 1.7 }
  });
  document.getElementById("trendInfo").innerHTML = `<span>Shows monthly net payroll trend</span>`;

  // --- 2. Payroll Split Pie
  let sumSalary = 0, sumOT = 0;
  for (const emp of employees) {
    const att = attendance.find(a => a.employeeId === emp.id && a.period === month);
    const calc = calcPayrollRow(emp, att);
    sumSalary += calc.salaryForHours;
    sumOT += calc.otPay;
  }
  new Chart(document.getElementById('pieChart').getContext('2d'), {
    type: 'pie',
    data: { labels:['Regular Salary','Overtime'], datasets:[{data:[sumSalary,sumOT],backgroundColor:['#15803d','#fbbf24']}] },
    options:{ aspectRatio: 1.2, plugins:{legend:{position:'top'}}}
  });
  document.getElementById("pieInfo").innerHTML = `<b>₹${sumSalary.toLocaleString()}</b> salary • <b>₹${sumOT.toLocaleString()}</b> OT`;

  // --- 3. Employee Hours Bar
  const barLabels = employees.map(emp => emp.name);
  const barHours = employees.map(emp => {
    const att = attendance.find(a => a.employeeId === emp.id && a.period === month);
    return (att && att.hours) ? att.hours : 0;
  });
  new Chart(document.getElementById('empHoursChart').getContext('2d'), {
    type:'bar',
    data:{ labels:barLabels, datasets:[{label:'Hours Worked', data:barHours, backgroundColor:'#2563eb'}] },
    options:{plugins:{legend:{display:false}},aspectRatio:1.7,
      scales:{y:{beginAtZero:true,max:Math.max(...barHours,REQUIRED_MONTHLY_HOURS)+10}}
    }
  });
  // Top 3 by hours
  let topHours = employees.map((emp, i) => {
    return {name: emp.name, hours: barHours[i]};
  }).sort((a,b)=>b.hours-a.hours).slice(0,3);
  document.getElementById("empHoursInfo").innerHTML = `<b>Top 3 by Hours:</b> <ul class="top-list">${topHours.map(e=>`<li>${e.name}: ${e.hours}h</li>`).join('')}</ul>`;

  // --- 4. Stacked Bar: Net / PF+ESI+Tax per Employee
  const netVals = [], pfVals = [], esiVals = [], taxVals = [];
  for(const emp of employees){
    const att = attendance.find(a => a.employeeId === emp.id && a.period === month);
    const calc = calcPayrollRow(emp, att);
    netVals.push(calc.net);
    pfVals.push(calc.deductions.pf);
    esiVals.push(calc.deductions.esi);
    taxVals.push(calc.deductions.tax);
  }
  new Chart(document.getElementById('stackChart').getContext('2d'), {
    type:'bar',
    data:{
      labels:barLabels,
      datasets:[
        {label:'Net',data:netVals,backgroundColor:'#16a34a',stack:'pay'},
        {label:'PF', data:pfVals, backgroundColor:'#94a3b8', stack:'pay'},
        {label:'ESI', data:esiVals, backgroundColor:'#818cf8', stack:'pay'},
        {label:'Tax', data:taxVals, backgroundColor:'#f87171', stack:'pay'}
      ]
    },
    options:{
      plugins:{legend:{position:'bottom'}},
      aspectRatio:1.25,
      scales:{x:{stacked:true},y:{stacked:true}}
    }
  });
  document.getElementById("stackInfo").textContent = "Stacked pay breakdown (net, PF, ESI, tax) by employee";

  // --- 5. Attendance compliance donut (who met 90h)
  let compliant=0, noncompliant=0, misses=[];
  for(const emp of employees){
    const att = attendance.find(a => a.employeeId === emp.id && a.period === month);
    if(att && att.hours >= REQUIRED_MONTHLY_HOURS) compliant++;
    else {
      noncompliant++;
      misses.push(emp.name);
    }
  }
  new Chart(document.getElementById('donutChart').getContext('2d'), {
    type:'doughnut',
    data:{
      labels:['Met 90h','Below 90h'],
      datasets:[{data:[compliant,noncompliant],backgroundColor:['#22c55e','#f87171']}]
    },
    options:{aspectRatio:1,plugins:{legend:{position:'bottom'}}}
  });
  document.getElementById("donutInfo").innerHTML =
    `<b>${compliant} / ${employees.length}</b> met 90h<br>
    ${noncompliant ? `<span class="compliance-badge">Below: ${misses.join(', ')}</span>` : '<span class="compliance-badge ok">All compliant ✔</span>'}`;
}

// HANDLERS
anaMonth.onchange = () => {
  const month = getCurrentMonth();
  renderKPIs(month);
  renderCharts(month);
};

document.addEventListener('DOMContentLoaded', () => {
  anaMonth.value = new Date().toISOString().slice(0,7);
  const month = getCurrentMonth();
  renderKPIs(month);
  renderCharts(month);
});
