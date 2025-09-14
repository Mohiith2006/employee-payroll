export function validateEmployee(emp) {
  if (!emp.name || emp.name.length < 2) return false;
  if (!emp.department || emp.department.length < 2) return false;
  if (!emp.role || emp.role.length < 2) return false;
  if (!emp.baseSalary || isNaN(emp.baseSalary)) return false;
  if (!emp.payGrade) return false;
  return true;
}
