(function() {
  let dailyChart, weekChart, perfChart, focusChart, distChart;

  const init = () => {
    dailyChart = new Chart(document.getElementById('chart-daily'), { type: 'line', data: { labels: [], datasets: [{ label: 'وقت التركيز (دقيقة)', data: [], borderColor: '#4f46e5', tension: 0.3, fill: true, backgroundColor: 'rgba(79,70,229,0.1)' }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
    weekChart = new Chart(document.getElementById('chart-weekly'), { type: 'bar', data: { labels: ['سبت','أحد','إثنين','ثلاثاء','أربعاء','خميس','جمعة'], datasets: [{ label: 'مهام مكتملة', data: [0,0,0,0,0,0,0], backgroundColor: '#10b981' }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
    distChart = new Chart(document.getElementById('chart-distribution'), { type: 'doughnut', data: { labels: ['نشطة','مكتملة','مؤرشفة'], datasets: [{ data: [0,0,0], backgroundColor: ['#f59e0b','#10b981','#64748b'] }] } });
    perfChart = new Chart(document.getElementById('chart-performance'), { type: 'radar', data: { labels: ['إنتاجية','تركيز','التزام','دقة','سرعة'], datasets: [{ label: 'أداء', data: [60,70,80,50,90], backgroundColor: 'rgba(245,158,11,0.4)' }] } });
    focusChart = new Chart(document.getElementById('chart-focus'), { type: 'scatter', data: { datasets: [{ label: 'جلسات', data: [] }] } });
  };

  const updateDaily = (data) => { dailyChart.data.labels = data.labels; dailyChart.data.datasets[0].data = data.data; dailyChart.update(); };
  const updateWeekly = (data) => { weekChart.data.datasets[0].data = data; weekChart.update(); };
  const updateDist = (data) => { distChart.data.datasets[0].data = data; distChart.update(); };

  window.TimeFlowCharts = { init, updateDaily, updateWeekly, updateDist };
})();