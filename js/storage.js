const CHAVE_TAREFAS = 'tarefas';

function obterTarefas() {
  const dados = localStorage.getItem(CHAVE_TAREFAS);
  return dados ? JSON.parse(dados) : [];
}

function persistirTarefas(tarefas) {
  localStorage.setItem(CHAVE_TAREFAS, JSON.stringify(tarefas));
}

function tarefaOcorreNaData(tarefa, date) {
  const inicio = tarefa.startDate;
  const fim = tarefa.endDate || inicio;
  return date >= inicio && date <= fim;
}

export function listarTarefas() {
  return obterTarefas();
}

export function listarTarefasPorData(date) {
  return obterTarefas().filter((tarefa) => tarefaOcorreNaData(tarefa, date));
}

export function salvarTarefa(tarefa) {
  const tarefas = obterTarefas();
  const novaTarefa = { id: Date.now(), ...tarefa };
  tarefas.push(novaTarefa);
  persistirTarefas(tarefas);
  return novaTarefa;
}

export function editarTarefa(id, dados) {
  const tarefas = obterTarefas();
  const indice = tarefas.findIndex((tarefa) => tarefa.id === id);

  if (indice === -1) {
    return null;
  }

  tarefas[indice] = { ...tarefas[indice], ...dados, id };
  persistirTarefas(tarefas);
  return tarefas[indice];
}

export function excluirTarefa(id) {
  const tarefas = obterTarefas();
  const indice = tarefas.findIndex((tarefa) => tarefa.id === id);

  if (indice === -1) {
    return false;
  }

  tarefas.splice(indice, 1);
  persistirTarefas(tarefas);
  return true;
}

export function contarTarefasPorData(date) {
  return listarTarefasPorData(date).length;
}
