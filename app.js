/* ---------- Estado dos dados (carregado de dados.json) ---------- */
let REGISTROS = [];
const RANK = {A:3,B:2,C:1};
function grauRegistro(r){
  return [r.territorio,r.especie,r.molecula,r.atividade]
    .reduce((pior,elo)=> RANK[elo.grau] < RANK[pior] ? elo.grau : pior, 'A');
}
const CORES = {A:'var(--gradeA)', B:'var(--gradeB)', C:'var(--gradeC)'};

/* ---------- Estado compartilhado (filtros) ---------- */
let filtroGrau = null;
let filtroUF = null;
function dadosFiltrados(){
  return REGISTROS.filter(r =>
    (!filtroGrau || r.grauFinal === filtroGrau) && (!filtroUF || r.uf === filtroUF));
}

/* ---------- Mapa ---------- */
const map = L.map('atlas').setView([2.6,-61.2], 7);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
  maxZoom: 13
}).addTo(map);
let camadaMarcadores = L.layerGroup().addTo(map);

/* ---------- Roraima: contorno do estado (dourado) + municípios (branco fino) ---------- */
let camadaMunicipios, camadaEstadoRR, nomesMunicipios = {};

fetch('https://servicodados.ibge.gov.br/api/v4/malhas/estados/RR?qualidade=2&formato=application/vnd.geo+json')
  .then(r => r.json())
  .then(geo => {
    camadaEstadoRR = L.geoJSON(geo, { style: () => ({color:'#c9a227', weight:3, fill:false}) }).addTo(map);
    map.fitBounds(camadaEstadoRR.getBounds(), {padding:[20,20]});
  })
  .catch(() => avisarFalhaMalha('contorno do estado'));

Promise.all([
  fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/RR/municipios').then(r=>r.json()),
  fetch('https://servicodados.ibge.gov.br/api/v4/malhas/estados/RR?intrarregiao=municipio&qualidade=2&formato=application/vnd.geo+json').then(r=>r.json())
]).then(([lista, geo]) => {
  lista.forEach(m => nomesMunicipios[String(m.id)] = m.nome);
  camadaMunicipios = L.geoJSON(geo, {
    style: () => ({color:'#ffffff', weight:1, opacity:.5, fillOpacity:0}),
    onEachFeature: (feature, layer) => {
      const nome = nomesMunicipios[feature.properties.codarea] || 'Município';
      layer.bindTooltip(nome, {sticky:true});
      layer.on('mouseover', () => layer.setStyle({fillOpacity:.15, fillColor:'#ffffff', weight:1.5}));
      layer.on('mouseout', () => layer.setStyle({fillOpacity:0, weight:1}));
    }
  }).addTo(map);
  atualizarPainelRR();
}).catch(() => avisarFalhaMalha('municípios'));

function avisarFalhaMalha(parte){
  const painel = document.getElementById('painel-rr');
  if(painel) painel.textContent = `Não foi possível carregar a malha do IBGE (${parte}) agora — o serviço pode estar instável. Os marcadores continuam funcionando; tente recarregar em alguns minutos.`;
}

function atualizarPainelRR(){
  const painel = document.getElementById('painel-rr');
  if(!painel) return;
  const doRR = REGISTROS.filter(r => r.uf === 'RR');
  const porGrau = {A:0,B:0,C:0};
  doRR.forEach(r => porGrau[r.grauFinal]++);
  const nMunicipios = Object.keys(nomesMunicipios).length;
  painel.innerHTML = nMunicipios
    ? `<strong>${nMunicipios}</strong> municípios de Roraima · <strong>${doRR.length}</strong> registros no estado (A: ${porGrau.A} · B: ${porGrau.B} · C: ${porGrau.C})`
    : `<strong>${doRR.length}</strong> registros no estado (A: ${porGrau.A} · B: ${porGrau.B} · C: ${porGrau.C})`;
}

function icone(r){
  const cor = CORES[r.grauFinal];
  const simbolo = r.tipo === 'animal' ? '◆' : '❋';
  return L.divIcon({
    className:'',
    html:`<div style="width:26px;height:26px;border-radius:50%;border:3px solid ${cor};
      background:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;color:${cor}">${simbolo}</div>`,
    iconSize:[26,26]
  });
}

function renderMapa(lista){
  camadaMarcadores.clearLayers();
  lista.forEach(r=>{
    L.marker([r.lat,r.lng], {icon: icone(r)})
      .bindPopup(`<strong>${r.organismo}</strong><br>${r.uf} · grau ${r.grauFinal}<br>${r.atividade.desc}`)
      .addTo(camadaMarcadores);
  });
}

/* ---------- Tabela ---------- */
function renderTabela(lista){
  document.getElementById('corpo-tabela').innerHTML = lista.map(r=>`
    <tr>
      <td><em>${r.organismo}</em></td>
      <td>${r.tipo === 'animal' ? 'Animal' : 'Planta'}</td>
      <td>${r.uf}</td>
      <td>${r.molecula.nome}</td>
      <td>${r.atividade.desc}</td>
      <td class="grade" style="color:${CORES[r.grauFinal]}">${r.grauFinal}</td>
    </tr>`).join('');
}

/* ---------- Fichas ---------- */
function renderFichas(lista){
  document.getElementById('grid-fichas').innerHTML = lista.map(r=>`
    <div class="ficha">
      <div class="tipo">${r.tipo === 'animal' ? 'Animal peçonhento' : 'Planta medicinal'} · ${r.uf}</div>
      <h3><em>${r.organismo}</em></h3>
      <dl>
        <dt>Molécula / composto</dt><dd>${r.molecula.nome}</dd>
        <dt>Ação observada</dt><dd>${r.atividade.desc}</dd>
        <dt>Procedência</dt><dd>${r.atividade.fonte}</dd>
      </dl>
      <span class="badge" style="background:${CORES[r.grauFinal]}">grau ${r.grauFinal}</span>
    </div>`).join('');
}

function renderizarTudo(){
  const lista = dadosFiltrados();
  renderMapa(lista);
  renderTabela(lista);
  renderFichas(lista);
  const aviso = document.getElementById('filtro-uf-aviso');
  if(filtroUF){ aviso.style.display='block'; aviso.textContent = `Filtrando por ${filtroUF} — toque no estado de novo para limpar.`; }
  else { aviso.style.display='none'; }
}

/* ---------- Chips de filtro por grau ---------- */
const chipsWrap = document.getElementById('chips-grau');
['A','B','C'].forEach(g=>{
  const chip = document.createElement('button');
  chip.className='chip'; chip.setAttribute('aria-pressed','false');
  chip.innerHTML = `<span class="dot" style="background:${CORES[g]}"></span> Grau ${g}`;
  chip.onclick = ()=>{
    filtroGrau = (filtroGrau === g) ? null : g;
    document.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed', c===chip && filtroGrau ? 'true':'false'));
    renderizarTudo();
  };
  chipsWrap.appendChild(chip);
});

/* ---------- Abas (mapa/tabela/fichas) — sem recarregar dados ---------- */
document.querySelectorAll('.aba').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const alvo = btn.dataset.vista;
    if(alvo === 'mapa'){ document.getElementById('atlas-sec').scrollIntoView({behavior:'smooth'}); return; }
    document.querySelectorAll('.aba').forEach(b=>b.setAttribute('aria-selected', b===btn ? 'true':'false'));
    document.querySelectorAll('.vista').forEach(v=> v.classList.toggle('ativa', v.dataset.vista===alvo));
  });
});

/* ---------- Exportar CSV client-side ---------- */
document.getElementById('btn-csv').addEventListener('click', ()=>{
  const lista = dadosFiltrados();
  const linhas = lista.map(r=>[r.organismo,r.tipo,r.uf,r.molecula.nome,r.atividade.desc,r.grauFinal]
    .map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','));
  const csv = ['"organismo","tipo","uf","molecula","atividade","grau"', ...linhas].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'peconhaflora.csv'; a.click();
});

/* ---------- Carregar os dados e renderizar ---------- */
fetch('dados.json')
  .then(r => r.json())
  .then(dados => {
    REGISTROS = dados;
    REGISTROS.forEach(r => r.grauFinal = grauRegistro(r));
    renderizarTudo();
    atualizarPainelRR();
  })
  .catch(() => {
    document.getElementById('painel-rr').textContent =
      'Não foi possível carregar dados.json — confira se esse arquivo está na mesma pasta do index.html no repositório.';
  });
