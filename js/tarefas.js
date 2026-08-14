import { listarTarefasPorData, excluirTarefa } from './storage.js';
import { aoSelecionarDia, obterDataSelecionada, selecionarDia, renderizarCalendario } from './calendario.js';
import { abrirModalNovaTarefa, abrirModalEdicao, aoSalvarTarefa } from './modal.js';

const elementoPainel = document.getElementById('painelTarefas');
const rotuloData = document.getElementById('dataSelecionada');
const containerLista = document.getElementById('listaTarefas');
const instanciaPainel = new bootstrap.Offcanvas(elementoPainel);

const formatadorData = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function abrirPainel() {
  instanciaPainel.show();
}

function escaparHtml(texto) {
  const elemento = document.createElement('div');
  elemento.textContent = texto ?? '';
  return elemento.innerHTML;
}

function extrairHora(valor) {
  return (valor || '').slice(11, 16);
}

function formatarDataExtenso(dataISO) {
  return formatadorData.format(new Date(`${dataISO}T00:00:00`));
}

function buscarTarefa(id) {
  return listarTarefasPorData(obterDataSelecionada())
    .find((tarefa) => tarefa.id === id);
}

function montarItem(tarefa) {
  const descricao = tarefa.description
    ? `<p class="small text-body-secondary mb-0 tarefa-descricao">${escaparHtml(tarefa.description)}</p>`
    : '';

  return `
    <li class="list-group-item tarefa-item">
      <div class="tarefa-item-linha">
        <div class="tarefa-item-texto">
          <p class="fw-semibold mb-1 tarefa-titulo">${escaparHtml(tarefa.title)}</p>
          <p class="small text-primary mb-1">
            ${extrairHora(tarefa.startDate)} às ${extrairHora(tarefa.endDate)}
          </p>
          ${descricao}
        </div>
        <div class="btn-group btn-group-sm flex-shrink-0">
          <button type="button" class="btn btn-outline-secondary" data-acao="editar" data-id="${tarefa.id}">
            Editar
          </button>
          <button type="button" class="btn btn-outline-danger" data-acao="excluir" data-id="${tarefa.id}">
            Excluir
          </button>
        </div>
      </div>
    </li>
  `;
}

function editarItem(id) {
  const tarefa = buscarTarefa(id);

  if (tarefa) {
    abrirModalEdicao(tarefa);
  }
}

function excluirItem(id) {
  const tarefa = buscarTarefa(id);

  if (!tarefa) {
    return;
  }

  if (!window.confirm(`Deseja realmente excluir a tarefa "${tarefa.title}"?`)) {
    return;
  }

  excluirTarefa(id);
  renderizarCalendario();
  renderizarTarefas(obterDataSelecionada());
}

function renderizarTarefas(dataISO) {
  const tarefas = listarTarefasPorData(dataISO)
    .sort((atual, proxima) => atual.startDate.localeCompare(proxima.startDate));

  rotuloData.textContent = formatarDataExtenso(dataISO);

  if (tarefas.length === 0) {
    containerLista.innerHTML = `
      <p class="text-body-secondary text-center py-4 mb-0">
        Nenhuma tarefa cadastrada para este dia.
      </p>
    `;
    return;
  }

  containerLista.innerHTML = `
    <ul class="list-group list-group-flush">
      ${tarefas.map(montarItem).join('')}
    </ul>
  `;

  containerLista.querySelectorAll('[data-acao]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const id = Number(botao.dataset.id);

      if (botao.dataset.acao === 'editar') {
        editarItem(id);
      } else {
        excluirItem(id);
      }
    });
  });
}

document.getElementById('btnAbrirPainel').addEventListener('click', () => {
  renderizarTarefas(obterDataSelecionada());
  abrirPainel();
});

document.getElementById('btnNovaTarefaPainel').addEventListener('click', () => {
  abrirModalNovaTarefa(obterDataSelecionada());
});

aoSelecionarDia((dataISO) => {
  renderizarTarefas(dataISO);
  abrirPainel();
});

aoSalvarTarefa((tarefa) => {
  selecionarDia(tarefa.startDate.slice(0, 10));
});

const CHAVE_LARGURA_PAINEL = 'painelLargura';
const LARGURA_MINIMA_PAINEL = 280;
const FRAÇÃO_LARGURA_MINIMA = 0.7;
const FRAÇÃO_LARGURA_MAXIMA = 0.92;

function larguraMinimaPainel() {
  return Math.min(LARGURA_MINIMA_PAINEL, Math.floor(window.innerWidth * FRAÇÃO_LARGURA_MINIMA));
}

function larguraMaximaPainel() {
  return Math.floor(window.innerWidth * FRAÇÃO_LARGURA_MAXIMA);
}

function aplicarLarguraPainel(pixels) {
  const largura = Math.min(
    Math.max(Math.round(pixels), larguraMinimaPainel()),
    larguraMaximaPainel(),
  );
  elementoPainel.style.setProperty('--bs-offcanvas-width', `${largura}px`);
  localStorage.setItem(CHAVE_LARGURA_PAINEL, String(largura));
  return largura;
}

function restaurarLarguraPainel() {
  const salva = Number(localStorage.getItem(CHAVE_LARGURA_PAINEL));

  if (Number.isFinite(salva) && salva > 0) {
    aplicarLarguraPainel(salva);
  }
}

function iniciarRedimensionamento(evento) {
  evento.preventDefault();

  const inicioX = evento.clientX;
  const inicioLargura = elementoPainel.getBoundingClientRect().width;

  function mover(movimento) {
    aplicarLarguraPainel(inicioLargura + (inicioX - movimento.clientX));
  }

  function soltar() {
    window.removeEventListener('pointermove', mover);
    window.removeEventListener('pointerup', soltar);
    document.body.classList.remove('painel-redimensionando');
  }

  document.body.classList.add('painel-redimensionando');
  window.addEventListener('pointermove', mover);
  window.addEventListener('pointerup', soltar);
}

document.getElementById('painelRedimensionar').addEventListener('pointerdown', iniciarRedimensionamento);

document.getElementById('painelRedimensionar').addEventListener('keydown', (evento) => {
  const atual = elementoPainel.getBoundingClientRect().width;

  if (evento.key === 'ArrowLeft') {
    evento.preventDefault();
    aplicarLarguraPainel(atual + 24);
  } else if (evento.key === 'ArrowRight') {
    evento.preventDefault();
    aplicarLarguraPainel(atual - 24);
  }
});

window.addEventListener('resize', () => {
  if (localStorage.getItem(CHAVE_LARGURA_PAINEL)) {
    restaurarLarguraPainel();
  }
});

restaurarLarguraPainel();
renderizarTarefas(obterDataSelecionada());
