// ---------- API & State ----------
const API_BASE = 'http://localhost:8000/api';
let players = [];
let chartRuns = null;
let chartWickets = null;
let currentChartType = 'bar'; // 'bar' or 'line'

// ---------- DOM refs ----------
const $ = (id) => document.getElementById(id);
const tableBody = $('tableBody');
const searchInput = $('searchInput');
const roleFilter = $('roleFilter');
const predictSelect = $('predictPlayerSelect');
const classifySelect = $('classifyPlayerSelect');

// ---------- Fetch data ----------
async function fetchPlayers() {
  try {
    const resp = await fetch(`${API_BASE}/players`);
    if (!resp.ok) throw new Error('Backend not reachable');
    players = await resp.json();
    renderAll();
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" style="color:#f87171; text-align:center;">⚠️ Could not load data. Make sure the backend is running on port 8000.</td></tr>`;
    console.error(err);
  }
}

// ---------- Render ----------
function renderAll() {
  updateStats();
  populateSelects();
  renderTable(players);
  renderCharts();
  $('playerCount').textContent = players.length;
}

function updateStats() {
  const total = players.length;
  const runs = players.reduce((s, p) => s + p.Runs, 0);
  const wickets = players.reduce((s, p) => s + p.Wickets, 0);
  const avg = total ? Math.round(runs / total) : 0;
  $('statPlayers').textContent = total;
  $('statRuns').textContent = runs;
  $('statWickets').textContent = wickets;
  $('statAvgRuns').textContent = avg;
}

function populateSelects() {
  const opts = players.map(p => `<option value="${p.PlayerID}">${p.Name} (${p.Role})</option>`).join('');
  predictSelect.innerHTML = `<option value="">— Choose —</option>${opts}`;
  classifySelect.innerHTML = `<option value="">— Choose —</option>${opts}`;
}

// ---------- Table with search & filter ----------
function renderTable(data) {
  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8;">No players match your filters.</td></tr>`;
    return;
  }
  let html = '';
  data.forEach(p => {
    const cluster = p.cluster !== undefined ? p.cluster : 0;
    html += `
      <tr data-id="${p.PlayerID}">
        <td><strong>${p.Name}</strong></td>
        <td><span class="role-tag role-${p.Role.replace(/[ -]/g, '')}">${p.Role}</span></td>
        <td>${p.Matches}</td>
        <td>${p.Runs}</td>
        <td>${p.Wickets}</td>
        <td><span class="cluster-badge-sm cluster-${cluster}">Cluster ${cluster}</span></td>
      </tr>
    `;
  });
  tableBody.innerHTML = html;

  // Click row -> show player detail alert (or modal)
  document.querySelectorAll('#tableBody tr').forEach(row => {
    row.addEventListener('click', function() {
      const id = this.dataset.id;
      const player = players.find(p => p.PlayerID === id);
      if (player) {
        alert(`🏏 ${player.Name}\nRole: ${player.Role}\nMatches: ${player.Matches}\nRuns: ${player.Runs}\nWickets: ${player.Wickets}\nCluster: ${player.cluster}`);
      }
    });
  });
}

// Filter logic
function filterTable() {
  const search = searchInput.value.toLowerCase().trim();
  const role = roleFilter.value;
  let filtered = players.filter(p => {
    const matchName = p.Name.toLowerCase().includes(search) || p.Role.toLowerCase().includes(search);
    const matchRole = role === '' || p.Role === role;
    return matchName && matchRole;
  });
  renderTable(filtered);
}

searchInput.addEventListener('input', filterTable);
roleFilter.addEventListener('change', filterTable);

// ---------- Sorting ----------
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', function() {
    const key = this.dataset.sort;
    const isAsc = this.classList.toggle('asc');
    const sorted = [...players].sort((a, b) => {
      let valA = a[key], valB = b[key];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return isAsc ? -1 : 1;
      if (valA > valB) return isAsc ? 1 : -1;
      return 0;
    });
    // Re-apply filters after sorting
    filterTable();
  });
});

// ---------- Charts ----------
function renderCharts() {
  if (!players.length) return;
  const labels = players.map(p => p.Name);
  const runs = players.map(p => p.Runs);
  const matches = players.map(p => p.Matches);
  const wickets = players.map(p => p.Wickets);

  const ctx1 = document.getElementById('chartRuns').getContext('2d');
  if (chartRuns) chartRuns.destroy();
  chartRuns = new Chart(ctx1, {
    type: currentChartType,
    data: {
      labels: labels,
      datasets: [
        { label: 'Runs', data: runs, backgroundColor: 'rgba(96,165,250,0.6)', borderColor: '#60a5fa', borderWidth: 2, tension: 0.2 },
        { label: 'Matches', data: matches, backgroundColor: 'rgba(250,204,21,0.4)', borderColor: '#facc15', borderWidth: 2, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
      scales: {
        x: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#1a2332' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: '#1a2332' } }
      }
    }
  });

  const ctx2 = document.getElementById('chartWickets').getContext('2d');
  if (chartWickets) chartWickets.destroy();
  chartWickets = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: wickets,
        backgroundColor: ['#3b82f6','#8b5cf6','#ec4899','#f59e0b','#14b8a6','#f472b6','#6366f1','#22d3ee','#f97316','#a3e635'],
        borderColor: '#141e2d',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 12 } } }
    }
  });
}

// Toggle chart type
$('toggleChartType').addEventListener('click', function() {
  currentChartType = currentChartType === 'bar' ? 'line' : 'bar';
  renderCharts();
});

// ---------- ML: Predict Runs ----------
$('predictPlayerSelect').addEventListener('change', function() {
  const id = this.value;
  if (id) {
    const player = players.find(p => p.PlayerID === id);
    if (player) {
      $('matchesSlider').value = player.Matches;
      $('matchesSliderValue').textContent = player.Matches;
    }
  } else {
    $('matchesSlider').value = 0;
    $('matchesSliderValue').textContent = 0;
  }
});

$('matchesSlider').addEventListener('input', function() {
  $('matchesSliderValue').textContent = this.value;
});

$('btnPredictRuns').addEventListener('click', async function() {
  const id = $('predictPlayerSelect').value;
  if (!id) { $('predictResult').innerHTML = '⚠️ Please select a player.'; return; }
  const matches = parseInt($('matchesSlider').value);
  $('predictResult').innerHTML = '<span class="loader"></span> Predicting...';
  try {
    const resp = await fetch(`${API_BASE}/predict/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: id, matches })
    });
    const data = await resp.json();
    if (data.error) {
      $('predictResult').innerHTML = `⚠️ ${data.error}`;
    } else {
      $('predictResult').innerHTML = `
        <i class="fas fa-bullseye" style="color:#facc15;"></i>
        <strong>${data.player}</strong> &bull;
        <span class="highlight">${data.predicted_runs}</span> predicted runs
        (based on ${data.used_matches} matches)
        ${data.actual_runs !== undefined ? `&bull; Actual: ${data.actual_runs}` : ''}
        <br><span class="text-muted">Model: Linear Regression</span>
      `;
    }
  } catch (err) {
    $('predictResult').innerHTML = `⚠️ Error: ${err.message}`;
  }
});

// ---------- ML: Classify Role ----------
$('classifyPlayerSelect').addEventListener('change', function() {
  const id = this.value;
  if (id) {
    const player = players.find(p => p.PlayerID === id);
    if (player) {
      $('runsSlider').value = player.Runs;
      $('wicketsSlider').value = player.Wickets;
      $('runsSliderValue').textContent = player.Runs;
      $('wicketsSliderValue').textContent = player.Wickets;
    }
  } else {
    $('runsSlider').value = 0;
    $('wicketsSlider').value = 0;
    $('runsSliderValue').textContent = 0;
    $('wicketsSliderValue').textContent = 0;
  }
});

$('runsSlider').addEventListener('input', function() {
  $('runsSliderValue').textContent = this.value;
});
$('wicketsSlider').addEventListener('input', function() {
  $('wicketsSliderValue').textContent = this.value;
});

$('btnClassifyRole').addEventListener('click', async function() {
  const id = $('classifyPlayerSelect').value;
  if (!id) { $('classifyResult').innerHTML = '⚠️ Please select a player.'; return; }
  const runs = parseInt($('runsSlider').value);
  const wickets = parseInt($('wicketsSlider').value);
  $('classifyResult').innerHTML = '<span class="loader"></span> Classifying...';
  try {
    const resp = await fetch(`${API_BASE}/predict/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: id, runs, wickets })
    });
    const data = await resp.json();
    if (data.error) {
      $('classifyResult').innerHTML = `⚠️ ${data.error}`;
    } else {
      $('classifyResult').innerHTML = `
        <i class="fas fa-tag" style="color:#facc15;"></i>
        <strong>${data.player}</strong> &bull;
        <span class="highlight">${data.predicted_role}</span> (predicted)
        ${data.actual_role ? `&bull; Actual: ${data.actual_role}` : ''}
        <br><span class="text-muted">Used: ${data.used_runs} runs, ${data.used_wickets} wickets</span>
      `;
    }
  } catch (err) {
    $('classifyResult').innerHTML = `⚠️ Error: ${err.message}`;
  }
});

// ---------- Init ----------
fetchPlayers();