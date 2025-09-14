export function renderTable(columns, data) {
  const table = document.createElement('table');
  table.className = "table";
  // Header
  const thead = table.createTHead();
  const tr = thead.insertRow();
  columns.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c.header;
    tr.appendChild(th);
  });
  // Rows
  const tbody = table.createTBody();
  data.forEach(row => {
    const tr = tbody.insertRow();
    columns.forEach(c => {
      const td = tr.insertCell();
      if (c.cell)
        td.innerHTML = typeof c.cell === 'function' ? c.cell(row) : c.cell;
      else
        td.textContent = row[c.key];
    });
  });
  return table;
}
