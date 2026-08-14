import { salvarTarefa, editarTarefa } from './storage.js';
import { obterDataSelecionada } from './calendario.js';

var elementoModal = document.getElementById('modalTarefa');
var instanciaModal = new bootstrap.Modal(elementoModal);

var campoTitulo = document.getElementById("campoTitulo");
var campoDescricao = document.getElementById("campoDescricao");
var campoData = document.getElementById("campoData");
var campoHoraInicio = document.getElementById("campoHoraInicio");
var campoHoraFim = document.getElementById("campoHoraFim");
var erroModal = document.getElementById("erroModal");

var ouvintesSalvamento = [];
var tarefaPendente = null;
var idTarefaEditando = null;

function extrairHora(valor) {
    return (valor || '').split('T')[1]?.slice(0, 5) || '';
}

document.getElementById('btnNovaTarefaTopo').addEventListener('click', function() {
    abrirModalNovaTarefa(obterDataSelecionada());
});

export function aoSalvarTarefa(callback) {
    ouvintesSalvamento.push(callback);
}

export function abrirModalNovaTarefa(data) {
    document.getElementById('tituloModal').textContent = 'Nova Tarefa';
    idTarefaEditando = null;
    campoTitulo.value = '';
    campoDescricao.value = '';
    campoData.value = data;
    campoHoraInicio.value = '';
    campoHoraFim.value = '';
    erroModal.classList.add('d-none');
    instanciaModal.show();
}

document.getElementById('btnSalvarTarefa').addEventListener('click', function() {
    if (campoTitulo.value === '') {
        mostrarErro('O título é obrigatório.');
        return;
    }

    if (campoData.value === '') {
        mostrarErro('A data é obrigatória.');
        return;
    }

    if (campoHoraInicio.value === '' || campoHoraFim.value === '') {
        mostrarErro('Os horários de início e término são obrigatórios.');
        return;
    }

    if (campoHoraInicio.value >= campoHoraFim.value) {
        mostrarErro('O horário de término deve ser posterior ao de início.');
        return;
    }

    var tarefa = {
        title: campoTitulo.value,
        description: campoDescricao.value,
        startDate: campoData.value + 'T' + campoHoraInicio.value,
        endDate: campoData.value + 'T' + campoHoraFim.value
    };

    if (idTarefaEditando === null) {
        tarefaPendente = salvarTarefa(tarefa);
    } else {
        tarefaPendente = editarTarefa(idTarefaEditando, tarefa);
    }

    instanciaModal.hide();
});

// Só avisa os ouvintes depois do fechamento para não sobrepor modal e painel.
elementoModal.addEventListener('hidden.bs.modal', function() {
    if (tarefaPendente === null) {
        return;
    }

    var tarefaSalva = tarefaPendente;
    tarefaPendente = null;

    ouvintesSalvamento.forEach(function(callback) {
        callback(tarefaSalva);
    });
});

function mostrarErro(mensagem) {
    erroModal.textContent = mensagem;
    erroModal.classList.remove('d-none');
}

export function abrirModalEdicao(tarefa) {
    document.getElementById('tituloModal').textContent = 'Editar Tarefa';
    idTarefaEditando = tarefa.id;
    campoTitulo.value = tarefa.title;
    campoDescricao.value = tarefa.description || '';
    campoData.value = tarefa.startDate.split('T')[0];
    campoHoraInicio.value = extrairHora(tarefa.startDate);
    campoHoraFim.value = extrairHora(tarefa.endDate);
    erroModal.classList.add('d-none');
    instanciaModal.show();
}