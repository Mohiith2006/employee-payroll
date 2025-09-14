const attTable = document.getElementById('attTable');
const attModal = document.getElementById('attModal');
const attSearch = document.getElementById('attSearch');
const attMonth = document.getElementById('attMonth');

function getEmployees() {
  return JSON.parse(localStorage.getItem('employees')) || [];
}
function getAttendance() {
  return JSON.parse(localStorage.getItem('attendance')) || [];
}
function setAttendance(list) {
  localStorage.setItem('attendance', JSON.stringify(list));
}

function getCurrentMonth() {
  return attMonth.value || new Date().toISOString().slice(0,7);
}

function renderAttendance(filter = "") {
  const employees = getEmployees();
  let filtered = employees;
  if (filter) {
    const q = filter.toLowerCase();
    filtered = employees.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }
  const month = getCurrentMonth();
  const attList = getAttendance();

  let html = `<table class='table'><thead><tr>
    <th>ID</th><th>Name</th><th>Department</th><th>Hours Worked</th><th>Actions</th>
  </tr></thead><tbody>`;
  for (const e of filtered) {
    const att = attList.find(a => a.employeeId === e.id && a.period === month) || {};
    html += `<tr>
      <td>${e.id}</td>
      <td>${e.name}</td>
      <td>${e.department}</td>
      <td>${att.hours ?? ""}</td>
      <td>
        <button class="btn" onclick="editAttendance('${e.id}')">Edit</button>
      </td>
    </tr>`;
  }
  html += '</tbody></table>';
  attTable.innerHTML = html;
}

window.editAttendance = function(employeeId) {
  const employees = getEmployees();
  const attList = getAttendance();
  const month = getCurrentMonth();
  const e = employees.find(emp => emp.id === employeeId);
  let att = attList.find(a => a.employeeId === employeeId && a.period === month) || {};
  attModal.innerHTML = `
    <div class="content">
      <h2>Attendance: ${e.name} (${month})</h2>
      <form id="attForm" class="form-grid">
        <input type="hidden" name="employeeId" value="${e.id}">
        <input type="hidden" name="period" value="${month}">
        <label>Total Hours Worked <input name="hours" type="number" min="0" max="300" required value="${att.hours ?? ""}"></label>
        <div style="grid-column:1/-1;display:flex;gap:14px;">
          <button class="btn primary" type="submit">Save</button>
          <button class="btn" type="button" id="closeModal">Cancel</button>
        </div>
      </form>
    </div>
  `;
  attModal.style.display = "flex";
  document.getElementById('closeModal').onclick = closeModal;

  document.getElementById('attForm').onsubmit = function(ev) {
    ev.preventDefault();
    const fd = new FormData(this);
    const data = Object.fromEntries(fd.entries());
    data.hours = +data.hours;
    let all = getAttendance();
    const idx = all.findIndex(a => a.employeeId === data.employeeId && a.period === data.period);
    if (idx >= 0) all[idx] = data;
    else all.push(data);
    setAttendance(all);
    closeModal();
    renderAttendance(attSearch.value);
  };
}

function closeModal() {
  attModal.style.display = "none";
}

attSearch.oninput = () => renderAttendance(attSearch.value);
attMonth.onchange = () => renderAttendance(attSearch.value);

document.addEventListener('DOMContentLoaded', () => {
  const nowMonth = new Date().toISOString().slice(0,7);
  attMonth.value = nowMonth;
  renderAttendance();
});
