// Simple localStorage-based Employees CRUD

const empTable = document.getElementById('empTable');
const empModal = document.getElementById('empModal');
const empSearch = document.getElementById('empSearch');
const addEmpBtn = document.getElementById('addEmpBtn');

function getEmployees() {
  return JSON.parse(localStorage.getItem('employees')) || [
    {"id":"E001","name":"John Doe","department":"Engineering","role":"Software Engineer","baseSalary":60000,"payGrade":"PG-2","status":"Active"},
    {"id":"E002","name":"Anjali Rao","department":"HR","role":"HR Executive","baseSalary":35000,"payGrade":"PG-1","status":"Active"}
  ];
}
function setEmployees(list) {
  localStorage.setItem('employees', JSON.stringify(list));
}

function renderEmployees(filter = "") {
  let employees = getEmployees();
  if (filter) {
    const q = filter.toLowerCase();
    employees = employees.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }
  if (employees.length === 0) {
    empTable.innerHTML = "<p style='color:var(--muted);margin-top:2rem;'>No employees found.</p>";
    return;
  }
  let html = `<table class="table"><thead><tr>
    <th>ID</th><th>Name</th><th>Department</th><th>Role</th><th>Salary</th><th>Status</th><th>Actions</th>
  </tr></thead><tbody>`;
  for (const e of employees) {
    html += `<tr>
      <td>${e.id}</td>
      <td>${e.name}</td>
      <td>${e.department}</td>
      <td>${e.role}</td>
      <td>₹${e.baseSalary}</td>
      <td><span class="badge ${e.status.toLowerCase()}">${e.status}</span></td>
      <td>
        <button class="btn" onclick="editEmp('${e.id}')">Edit</button>
        <button class="btn danger" onclick="delEmp('${e.id}')">Delete</button>
      </td>
    </tr>`;
  }
  html += "</tbody></table>";
  empTable.innerHTML = html;
}

window.editEmp = function(id) {
  const emp = getEmployees().find(e => e.id === id);
  showModal(emp);
}
window.delEmp = function(id) {
  if (confirm("Delete this employee?")) {
    let all = getEmployees().filter(e => e.id !== id);
    setEmployees(all);
    renderEmployees(empSearch.value);
  }
};

function showModal(emp = {}) {
  empModal.innerHTML = `
    <div class="content">
      <h2>${emp.id ? "Edit Employee" : "Add Employee"}</h2>
      <form id="empForm" class="form-grid">
        <input name="id" type="hidden" value="${emp.id||""}">
        <label>Name <input name="name" required value="${emp.name||""}"></label>
        <label>Department <input name="department" required value="${emp.department||""}"></label>
        <label>Role <input name="role" required value="${emp.role||""}"></label>
        <label>Salary <input name="baseSalary" type="number" min="0" required value="${emp.baseSalary||""}"></label>
        <label>Pay Grade <input name="payGrade" required value="${emp.payGrade||""}"></label>
        <label>Status
          <select name="status">
            <option${emp.status==="Active"?" selected":""}>Active</option>
            <option${emp.status==="Inactive"?" selected":""}>Inactive</option>
          </select>
        </label>
        <div style="grid-column:1/-1;display:flex;gap:14px;">
          <button class="btn primary" type="submit">Save</button>
          <button class="btn" type="button" id="closeModal">Cancel</button>
        </div>
      </form>
    </div>
  `;
  empModal.style.display = "flex";
  document.getElementById('closeModal').onclick = closeModal;

  document.getElementById('empForm').onsubmit = function(e) {
    e.preventDefault();
    const fd = new FormData(this);
    const data = Object.fromEntries(fd.entries());
    if (!data.id) data.id = "E" + Date.now(); // Auto-generate
    data.baseSalary = +data.baseSalary;
    if (!data.name || !data.department || !data.role || !data.payGrade) {
      alert("All fields required!"); return;
    }
    let all = getEmployees();
    const idx = all.findIndex(e => e.id === data.id);
    if (idx > -1)
      all[idx] = data;
    else
      all.push(data);
    setEmployees(all);
    closeModal();
    renderEmployees(empSearch.value);
  };
}
function closeModal() {
  empModal.style.display = "none";
}
addEmpBtn.onclick = () => showModal();
empSearch.oninput = () => renderEmployees(empSearch.value);
document.addEventListener("DOMContentLoaded", () => renderEmployees());
renderEmployees();
