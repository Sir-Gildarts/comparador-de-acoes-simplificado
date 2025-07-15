async function getAcoes() {
  // Brapi tem endpoint para listar ações
  const resp = await fetch('https://brapi.dev/api/quote/list?type=stock&limit=1000');
  const data = await resp.json();
  return data.stocks || [];
}

function getRIlink(ticker) {
  // Monta link para RI oficial e fallback para StatusInvest
  const base = ticker.split('.')[0].toLowerCase();
  const urlEmp = `https://ri.${base}.com.br`;
  return fetch(urlEmp, { method: 'HEAD' }).then(r => {
    if (r.ok) return urlEmp;
    return `https://statusinvest.com.br/acoes/${ticker}/relatorios`;
  }).catch(() => `https://statusinvest.com.br/acoes/${ticker}/relatorios`);
}

async function buscar() {
  const acoes = await getAcoes();

  const ppvMin = parseFloat(document.getElementById('ppvMin').value) || 0;
  const ppvMax = parseFloat(document.getElementById('ppvMax').value) || Infinity;
  const dyMin = parseFloat(document.getElementById('dyMin').value) || 0;
  const liqMin = parseFloat(document.getElementById('liqMin').value) || 0;
  const vacMax = parseFloat(document.getElementById('vacMax').value) || Infinity;
  const seg = document.getElementById('segmento').value.toLowerCase();

  const filtrados = acoes.filter(a => {
    const ppv = a.priceToBook || 0;
    const dy = (a.dividendYield || 0) * 100;
    const liq = (a.fullVolume || 0) / 1000;
    const vac = 0; // API não fornece vacância, então ignoramos por enquanto
    const nome = (a.companyName || '').toLowerCase();
    const setor = (a.sector || '').toLowerCase();

    return ppv >= ppvMin && ppv <= ppvMax &&
           dy >= dyMin &&
           liq >= liqMin &&
           vac <= vacMax &&
           (seg === '' || nome.includes(seg) || setor.includes(seg));
  });

  const tbody = document.querySelector('#tabelaResultados tbody');
  tbody.innerHTML = '';

  for (const a of filtrados) {
    const riLink = await getRIlink(a.symbol);
    const link = riLink ? `<a href="${riLink}" target="_blank">Relatório</a>` : '—';
    const tr = `<tr>
      <td>${a.symbol}</td>
      <td>${a.companyName || '—'}</td>
      <td>${a.regularMarketPrice ? a.regularMarketPrice.toFixed(2) : '-'}</td>
      <td>${a.priceToBook ? a.priceToBook.toFixed(2) : '-'}</td>
      <td>${a.dividendYield ? (a.dividendYield * 100).toFixed(2) : '-'}</td>
      <td>${a.fullVolume ? (a.fullVolume / 1000).toFixed(0) : '-'}</td>
      <td>—</td>
      <td>${a.sector || '—'}</td>
      <td>${link}</td>
    </tr>`;
    tbody.insertAdjacentHTML('beforeend', tr);
  }
}

document.getElementById('btnBuscar').addEventListener('click', buscar);
