async function getAcoes() {
  const resp = await fetch('https://brapi.dev/api/quote/list?type=stock&limit=1000');
  const data = await resp.json();
  return data.stocks || [];
}

function getRIlink(ticker) {
  const base = ticker.split('.')[0].toLowerCase();
  const urlEmp = `https://ri.${base}.com.br`;
  return fetch(urlEmp, {method:'HEAD'}).then(r => r.ok ? urlEmp : null)
    .catch(() => null)
    .then(u => u ? u : `https://statusinvest.com.br/acoes/${ticker}/relatorios`);
}

async function buscar() {
  const acoes = await getAcoes();
  const ppvMin = +document.getElementById('ppvMin').value || 0;
  const ppvMax = +document.getElementById('ppvMax').value || Infinity;
  const dyMin = +document.getElementById('dyMin').value || 0;
  const liqMin = +document.getElementById('liqMin').value || 0;
  const vacMax = +document.getElementById('vacMax').value || Infinity;
  const seg = document.getElementById('segmento').value.toLowerCase();

  const filtrados = acoes.filter(a => {
    const ppv = a.priceToBook || 0;
    const dy = a.dividendYield * 100 || 0;
    const liq = a.fullVolume / 1000 || 0;
    const vac = 0;
    const nome = (a.companyName || '').toLowerCase();
    return ppv >= ppvMin && ppv <= ppvMax && dy >= dyMin && liq >= liqMin && vac <= vacMax
      && (!seg || nome.includes(seg) || (a.sector && a.sector.toLowerCase().includes(seg)));
  });

  const tbody = document.querySelector('#tabelaResultados tbody');
  tbody.innerHTML = '';

  for (const a of filtrados) {
    const riLink = await getRIlink(a.symbol);
    const link = riLink ? `<a href="${riLink}" target="_blank">Relatório</a>` : '—';
    const tr = `<tr>
      <td>${a.symbol}</td>
      <td>${a.companyName || '—'}</td>
      <td>${a.regularMarketPrice.toFixed(2)}</td>
      <td>${(a.priceToBook||0).toFixed(2)}</td>
      <td>${((a.dividendYield||0)*100).toFixed(2)}</td>
      <td>${(a.fullVolume/1000||0).toFixed(0)}</td>
      <td>—</td>
      <td>${a.sector||'—'}</td>
      <td>${link}</td>
    </tr>`;
    tbody.insertAdjacentHTML('beforeend', tr);
  }
}

document.getElementById('btnBuscar').addEventListener('click', buscar);
