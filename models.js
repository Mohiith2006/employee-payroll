export class Employee {
  constructor({id, name, department, role, baseSalary, payGrade, status, pan, aadhaar}) {
    this.id = id;
    this.name = name;
    this.department = department;
    this.role = role;
    this.baseSalary = +baseSalary;
    this.payGrade = payGrade;
    this.status = status ?? 'Active';
    this.pan = pan ?? '';
    this.aadhaar = aadhaar ?? '';
  }
}

export function calculateGross(base, allowances=0, otRate=0, otHours=0) {
  return base + allowances + (otRate * otHours);
}
export function calculateDeductions(base) {
  const pf = base * 0.12, esi = base * 0.0175, tax = Math.max(0, (base - 25000) * 0.1);
  return { pf, esi, tax, sum: pf+esi+tax };
}
export function calculateNet(gross, deductions) {
  return gross - deductions.sum;
}
