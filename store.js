import employeesData from '../data/seed-employees.json' assert {type: 'json'};
import attendanceData from '../data/seed-attendance.json' assert {type: 'json'};
import payrunData from '../data/seed-payruns.json' assert {type: 'json'};

function lsGet(key, fallback) {
  return JSON.parse(localStorage.getItem(key)) ?? fallback;
}
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
export const Store = {
  get employees() { return lsGet('employees', employeesData); },
  set employees(val) { lsSet('employees', val); },
  get attendance() { return lsGet('attendance', attendanceData); },
  set attendance(val) { lsSet('attendance', val); },
  get payruns() { return lsGet('payruns', payrunData); },
  set payruns(val) { lsSet('payruns', val); },
};
