export function payrollTrendChart(ctx, labels, values) {
  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ data: values, label: "Payroll Trend", borderColor:'#22c55e', backgroundColor:'#24304955',fill:true }] },
    options: { responsive:true, plugins:{legend:{display:false}} }
  });
}
export function payrollPieChart(ctx, labels, values) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor:['#22c55e','#334155','#ef4444','#ffbe23'] }] }
  });
}
