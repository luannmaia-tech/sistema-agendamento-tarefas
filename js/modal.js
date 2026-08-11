var instanciaModal = new bootstrap.Modal(document.getElementById('modalTarefa'));

var campoTitulo =document.getElementById("campoTitulo")
var campoDescricao = document.getElementById("campoDescricao");
var campoData = document.getElementById("campoData");
var campoHoraInicio = document.getElementById("campoHoraInicio");
var campoHoraFim = document.getElementById("campoHoraFim");
var erroModal = document.getElementById("erroModal");

var dataSelecionada = '';

document.getElementById('btnNovaTarefaTopo').addEventListener('click', function() {
    abrirModalNovaTarefa('');
});

document.getElementById('btnNovaTarefaPainel').addEventListener('click', function() {
    abrirModalNovaTarefa(dataSelecionada);
});

function abrirModalNovaTarefa(data) {
    document.getElementById('tituloModal').textContent = 'Nova Tarefa';
    campoTitulo.value = '';
    campoDescricao.value = '';
    campoData.value = data;
    campoHoraInicio.value = '';
    campoHoraFim.value = '';
    erroModal.classList.add('d-none');
    instanciaModal.show();
}

var tarefasTemporarias = [];

document.getElementById('btnSalvarTarefa').addEventListener('click', function() {
    if (campoTitulo.value === '') {
        mostrarErro('O título é obrigatório.');
        return;
    }

    if (campoData.value === '') {
        mostrarErro('A data é obrigatória.');
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
        tarefa.id = Date.now();
        tarefasTemporarias.push(tarefa);
    } else {
        for (var i = 0; i < tarefasTemporarias.length; i++) {
            if (tarefasTemporarias[i].id === idTarefaEditando) {
                tarefa.id = idTarefaEditando;
                tarefasTemporarias[i] = tarefa;
            }
        }
    }

    console.log(tarefasTemporarias);
   instanciaModal.hide();
});

function mostrarErro(mensagem) {
    erroModal.textContent = mensagem;
    erroModal.classList.remove('d-none');
}

var idTarefaEditando = null;

function abrirModalEdicao(tarefa) {
    document.getElementById('tituloModal').textContent = 'Editar Tarefa';
    idTarefaEditando = tarefa.id;
    campoTitulo.value = tarefa.title;
    campoDescricao.value = tarefa.description;
    campoData.value = tarefa.startDate.split('T')[0];
    campoHoraInicio.value = tarefa.startDate.split('T')[1];
    campoHoraFim.value = tarefa.endDate.split('T')[1];
    erroModal.classList.add('d-none');
    instanciaModal.show();
}