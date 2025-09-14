const settingsPage = document.getElementById('settingsPage');

function getSettings() {
  return JSON.parse(localStorage.getItem('settings')) || {
    company: "Company Name",
    requiredHours: 90,
    overtimeMultiplier: 1.5,
    departments: ["Engineering", "HR", "Sales"],
    payGrades: ["PG-1", "PG-2", "PG-3"]
  };
}
function setSettings(obj) {
  localStorage.setItem('settings', JSON.stringify(obj));
}

// Render all settings sections
function renderSettings() {
  const s = getSettings();
  settingsPage.innerHTML = `
    <div class="settings-section">
      <h3>Company Information</h3>
      <form id="companyForm">
        <label>Company Name <input type="text" name="company" value="${s.company}" required></label>
        <button type="submit" class="btn primary">Save</button>
      </form>
    </div>
    <div class="settings-section">
      <h3>Attendance & Payroll Plan</h3>
      <form id="planForm" style="display:flex; gap:18px; flex-wrap:wrap;">
        <label>Required Hours / Month <input type="number" min="1" step="1" name="requiredHours" value="${s.requiredHours}" required style="width:70px"></label>
        <label>Overtime Rate Multiplier <input type="number" min="1" max="3" step="0.1" name="overtimeMultiplier" value="${s.overtimeMultiplier}" required style="width:70px"></label>
        <button type="submit" class="btn primary">Save</button>
      </form>
    </div>
    <div class="settings-section">
      <h3>Departments</h3>
      <ul class="editable-list" id="deptList">
        ${s.departments.map((d,i)=>`
          <li>
            <span>${d}</span>
            <button class="btn danger" onclick="removeDepartment('${i}')">Delete</button>
          </li>`).join('')}
      </ul>
      <form id="deptForm" class="inline-form">
        <input type="text" required name="newDept" placeholder="Department Name">
        <button type="submit" class="btn primary">Add</button>
      </form>
    </div>
    <div class="settings-section">
      <h3>Pay Grades</h3>
      <ul class="editable-list" id="payGradeList">
        ${s.payGrades.map((d,i)=>`
          <li>
            <span>${d}</span>
            <button class="btn danger" onclick="removePayGrade('${i}')">Delete</button>
          </li>`).join('')}
      </ul>
      <form id="payGradeForm" class="inline-form">
        <input type="text" required name="newPayGrade" placeholder="Pay Grade Name">
        <button type="submit" class="btn primary">Add</button>
      </form>
    </div>
  `;

  // Company name
  document.getElementById('companyForm').onsubmit = e => {
    e.preventDefault();
    const name = e.target.company.value.trim();
    if (!name) return;
    s.company = name;
    setSettings(s);
    renderSettings();
  };

  // Attendance plan
  document.getElementById('planForm').onsubmit = e => {
    e.preventDefault();
    const requiredHours = +e.target.requiredHours.value;
    const overtimeMultiplier = +e.target.overtimeMultiplier.value;
    s.requiredHours = requiredHours;
    s.overtimeMultiplier = overtimeMultiplier;
    setSettings(s);
    renderSettings();
  };

  // Add department
  document.getElementById('deptForm').onsubmit = e => {
    e.preventDefault();
    const newDept = e.target.newDept.value.trim();
    if (!newDept || s.departments.includes(newDept)) return;
    s.departments.push(newDept);
    setSettings(s);
    renderSettings();
  };

  // Add pay grade
  document.getElementById('payGradeForm').onsubmit = e => {
    e.preventDefault();
    const newPG = e.target.newPayGrade.value.trim();
    if (!newPG || s.payGrades.includes(newPG)) return;
    s.payGrades.push(newPG);
    setSettings(s);
    renderSettings();
  };
}

window.removeDepartment = function(idx) {
  const s = getSettings();
  s.departments.splice(idx, 1);
  setSettings(s);
  renderSettings();
};

window.removePayGrade = function(idx) {
  const s = getSettings();
  s.payGrades.splice(idx, 1);
  setSettings(s);
  renderSettings();
};

renderSettings();
