import { listarTarefasPorData } from './storage.js'; // Importa do storage p/ exibir as tarefas nas células do calendário

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const LIMITE_TAREFAS_CELULA = 2;

let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let dataSelecionada = formatarDataISO(new Date());

const ouvintesSelecao = [];

export function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function obterDataSelecionada() {
  return dataSelecionada;
}

export function aoSelecionarDia(callback) {
  ouvintesSelecao.push(callback);
}

function escaparHtml(texto) {
  const elemento = document.createElement('div');
  elemento.textContent = texto ?? '';
  return elemento.innerHTML;
}

function montarPreviewTarefas(dataISO) {
  const tarefas = listarTarefasPorData(dataISO)
    .sort((atual, proxima) => atual.startDate.localeCompare(proxima.startDate));

  if (tarefas.length === 0) {
    return '';
  }

  const visiveis = tarefas.slice(0, LIMITE_TAREFAS_CELULA);
  const restante = tarefas.length - visiveis.length;
  const itens = visiveis
    .map((tarefa) => `<span class="calendario-tarefa">${escaparHtml(tarefa.title)}</span>`)
    .join('');
  const mais = restante > 0
    ? `<span class="calendario-tarefa-mais">+${restante}</span>`
    : '';

  return `<span class="calendario-tarefas">${itens}${mais}</span>`;
}

function gerarCelulasDoMes(ano, mes) {
  const celulas = [];
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);

  for (let i = primeiroDia.getDay() - 1; i >= 0; i -= 1) {
    const data = new Date(ano, mes, -i);
    celulas.push({ data, outroMes: true });
  }

  for (let dia = 1; dia <= ultimoDia.getDate(); dia += 1) {
    celulas.push({ data: new Date(ano, mes, dia), outroMes: false });
  }

  while (celulas.length % 7 !== 0) {
    const ultimaData = celulas[celulas.length - 1].data;
    const proximaData = new Date(ultimaData);
    proximaData.setDate(proximaData.getDate() + 1);
    celulas.push({ data: proximaData, outroMes: true });
  }

  return celulas;
}

export function selecionarDia(dataISO) {
  dataSelecionada = dataISO;

  const data = new Date(`${dataISO}T00:00:00`);
  mesAtual = data.getMonth();
  anoAtual = data.getFullYear();

  renderizarCalendario();
  ouvintesSelecao.forEach((callback) => callback(dataISO));
}


export function renderizarCalendario() {
  const container = document.getElementById('calendario');
  const tituloMesAno = document.getElementById('mesAno');
  const celulas = gerarCelulasDoMes(anoAtual, mesAtual);

  tituloMesAno.textContent = `${MESES[mesAtual]} ${anoAtual}`;

  const cabecalho = DIAS_SEMANA
    .map((dia) => `<div class="calendario-cabecalho">${dia}</div>`)
    .join('');

  const dias = celulas
    .map(({ data, outroMes }) => {
      const dataISO = formatarDataISO(data);
      const selecionado = dataISO === dataSelecionada;
      const classes = [
        'calendario-dia',
        outroMes ? 'outro-mes' : '',
        selecionado ? 'selecionado' : '',
      ].filter(Boolean).join(' ');

      return `
        <button
          type="button"
          class="${classes}"
          data-data="${dataISO}"
          aria-label="Dia ${data.getDate()}"
          aria-pressed="${selecionado}"
        >
          <span class="calendario-numero">${data.getDate()}</span>
          ${montarPreviewTarefas(dataISO)}
        </button>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="calendario-grid">
      ${cabecalho}
      ${dias}
    </div>
  `;

  container.querySelectorAll('.calendario-dia').forEach((botao) => {
    botao.addEventListener('click', () => {
      selecionarDia(botao.dataset.data);
    });
  });
}

function irParaMesAnterior() {
  mesAtual -= 1;
  if (mesAtual < 0) {
    mesAtual = 11;
    anoAtual -= 1;
  }
  renderizarCalendario();
}

function irParaMesProximo() {
  mesAtual += 1;
  if (mesAtual > 11) {
    mesAtual = 0;
    anoAtual += 1;
  }
  renderizarCalendario();
}

document.getElementById('mesAnterior').addEventListener('click', irParaMesAnterior);
document.getElementById('mesProximo').addEventListener('click', irParaMesProximo);

renderizarCalendario();
