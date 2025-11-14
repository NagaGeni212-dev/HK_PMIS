(function () {
  const STYLE_ID = 'overview-widget-style';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ovw-card {
        width: 260px;
        border: 1px solid #ccc;
        font-family: Arial, sans-serif;
        font-size: 13px;
        background: #ffffff;
      }
      .ovw-title {
        background: #4b0007;
        color: #fff;
        text-align: center;
        padding: 8px 4px;
        font-weight: bold;
      }
      .ovw-section {
        border-top: 1px solid #ddd;
        padding: 8px 4px;
      }
      .ovw-section-header {
        background: #e5e5e5;
        text-align: center;
        padding: 4px 2px;
        font-weight: bold;
      }
      .ovw-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 8px;
      }
      .ovw-label {
        font-weight: bold;
      }
      .ovw-value {
        color: #c00000;
        font-weight: bold;
        text-align: right;
      }
      .ovw-row.center {
        justify-content: center;
      }
      .ovw-row.center .ovw-value {
        text-align: center;
        width: 100%;
      }
      .ovw-footer-row {
        display: flex;
        justify-content: space-around;
        padding: 4px 8px;
      }
      .ovw-footer-row .ovw-label {
        font-weight: bold;
      }
    `;
    document.head.appendChild(style);
  }

  // very simple CSV parser (no commas-inside-cells support)
  function parseCSV(text) {
    return text
      .trim()
      .split('\n')
      .map(row => row.split(',').map(c => c.trim()));
  }

  function csvToMetricMap(text) {
  const rows = parseCSV(text);
  const map = {};
  rows.forEach(row => {
    const [key, valueRaw] = row;
    if (key) {
      const cleaned = (valueRaw || '').trim().replace(/^"(.*)"$/, '$1');
      map[key] = cleaned;
    }
  });
  return map;
}

  function buildLayout(container) {
    container.innerHTML = `
      <div class="ovw-card">
        <div class="ovw-title">Overview</div>

        <div class="ovw-section">
          <div class="ovw-row">
            <div class="ovw-label">HB</div>
            <div class="ovw-label">HPP ARP</div>
          </div>
          <div class="ovw-row">
            <div class="ovw-value" data-metric="HB"></div>
            <div class="ovw-value" data-metric="HPP_ARP"></div>
          </div>
        </div>

        <div class="ovw-section">
          <div class="ovw-row">
            <div class="ovw-label">Real Progress</div>
            <div class="ovw-label">HPP Real</div>
          </div>
          <div class="ovw-row">
            <div class="ovw-value" data-metric="Real_Progress"></div>
            <div class="ovw-value" data-metric="HPP_Real"></div>
          </div>
        </div>

        <div class="ovw-section">
          <div class="ovw-section-header">EAC %</div>
          <div class="ovw-row center">
            <div class="ovw-value" data-metric=EAC></div>
          </div>
        </div>

        <div class="ovw-section">
          <div class="ovw-section-header">Solvabilitas</div>
          <div class="ovw-row">
            <div class="ovw-label">Cash in</div>
            <div class="ovw-label">Defisit / Surplus</div>
          </div>
          <div class="ovw-row">
            <div class="ovw-value" data-metric="Cash_in"></div>
            <div class="ovw-value" data-metric="Defisit_Surplus"></div>
          </div>
        </div>

        <div class="ovw-section">
          <div class="ovw-section-header">QHSSE</div>
          <div class="ovw-footer-row">
            <div class="ovw-label">NC</div>
            <div class="ovw-label">Nearmiss</div>
            <div class="ovw-label">Fatality</div>
          </div>
          <div class="ovw-footer-row">
            <div class="ovw-value" data-metric="NC"></div>
            <div class="ovw-value" data-metric="Nearmiss"></div>
            <div class="ovw-value" data-metric="Fatality"></div>
          </div>
        </div>
      </div>
    `;
  }

  function fillMetrics(container, metricMap) {
    container.querySelectorAll('[data-metric]').forEach(el => {
      const key = el.getAttribute('data-metric');
      el.textContent = metricMap[key] != null ? metricMap[key] : '-';
    });
  }

  async function initWidget(container) {
    const csvUrl = container.dataset.sheetCsv;
    if (!csvUrl) {
      container.textContent = 'Missing data-sheet-csv attribute';
      return;
    }

    injectStyles();
    container.textContent = 'Loading...';

    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error('Network error');
      const text = await res.text();
      const metrics = csvToMetricMap(text);

      buildLayout(container);
      fillMetrics(container, metrics);
    } catch (e) {
      console.error(e);
      container.textContent = 'Failed to load data';
    }
  }

  function initAllWidgets() {
    document
      .querySelectorAll('[data-overview-widget]')
      .forEach(initWidget);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllWidgets);
  } else {
    initAllWidgets();
  }
})();
