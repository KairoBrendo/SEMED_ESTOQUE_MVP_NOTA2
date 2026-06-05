// ============================================
// SISTEMA DE CONTROLE DE ESTOQUE - SEMED
// Desenvolvido por: Kairo Brendo e Paulo Ricardo
// Curso: Análise e Desenvolvimento de Sistemas
// ============================================

// ============================================
// DADOS DO SISTEMA (salvos no navegador)
// ============================================

function carregarDados() {
  let produtos = localStorage.getItem('produtos');
  let historico = localStorage.getItem('historico');
  return {
    produtos: produtos ? JSON.parse(produtos) : [],
    historico: historico ? JSON.parse(historico) : []
  };
}

function salvarDados() {
  localStorage.setItem('produtos', JSON.stringify(dados.produtos));
  localStorage.setItem('historico', JSON.stringify(dados.historico));
}

let dados = carregarDados();

// ============================================
// NAVEGAÇÃO ENTRE TELAS
// ============================================

function mostrarTela(idTela) {
  let todasTelas = document.querySelectorAll('.tela');
  todasTelas.forEach(function(tela) {
    tela.classList.remove('ativa');
  });

  let botoes = document.querySelectorAll('.btn-menu');
  botoes.forEach(function(btn) {
    btn.classList.remove('ativo');
  });

  let telaAlvo = document.getElementById(idTela);
  if (telaAlvo) {
    telaAlvo.classList.add('ativa');
  }

  if (window.event && window.event.target && window.event.target.classList.contains('btn-menu')) {
    window.event.target.classList.add('ativo');
  } else {
    let mapeamentoBotoes = {
      'tela-inicio': '🏠 Início',
      'tela-cadastro': '➕ Cadastrar Produto',
      'tela-entrada': '📥 Registrar Entrada',
      'tela-saida': '📤 Registrar Saída',
      'tela-estoque': '📋 Ver Estoque',
      'tela-historico': '📜 Histórico'
    };
    botoes.forEach(function(btn) {
      if (btn.textContent.trim() === mapeamentoBotoes[idTela]) {
        btn.classList.add('ativo');
      }
    });
  }

  if (idTela === 'tela-inicio')    atualizarInicio();
  if (idTela === 'tela-cadastro')  atualizarTabelaProdutos();
  if (idTela === 'tela-entrada')   atualizarSelectProdutos('produto-entrada');
  if (idTela === 'tela-saida')     atualizarSelectProdutos('produto-saida');
  if (idTela === 'tela-estoque')   atualizarTabelaEstoque();
  if (idTela === 'tela-historico') atualizarTabelaHistorico();
}

// ============================================
// TELA INICIAL
// ============================================

function atualizarInicio() {
  let totalProdutos = dados.produtos.length;
  let totalEntradas = dados.historico.filter(function(m) { return m.tipo === 'entrada'; }).length;
  let totalSaidas   = dados.historico.filter(function(m) { return m.tipo === 'saida'; }).length;
  let baixo = dados.produtos.filter(function(p) { return p.quantidade <= p.minimo && p.quantidade > 0; }).length;
  let zerado = dados.produtos.filter(function(p) { return p.quantidade === 0; }).length;

  document.getElementById('total-produtos').textContent = totalProdutos;
  document.getElementById('total-entradas').textContent = totalEntradas;
  document.getElementById('total-saidas').textContent   = totalSaidas;
  document.getElementById('total-baixo').textContent    = baixo + zerado;
}

// ============================================
// CADASTRAR PRODUTO
// ============================================

function cadastrarProduto() {
  let nome      = document.getElementById('nome-produto').value.trim();
  let categoria = document.getElementById('categoria-produto').value;
  let unidade   = document.getElementById('unidade-produto').value;
  let minimo    = parseInt(document.getElementById('minimo-produto').value);

  if (nome === '' || categoria === '' || unidade === '' || isNaN(minimo) || minimo < 0) {
    mostrarMensagem('Preencha os campos corretamente!', 'erro');
    return;
  }

  let jaExiste = dados.produtos.find(function(p) { return p.nome.toLowerCase() === nome.toLowerCase(); });
  if (jaExiste) {
    mostrarMensagem('Já existe um produto com esse nome!', 'erro');
    return;
  }

  let novoProduto = { id: Date.now(), nome: nome, categoria: categoria, unidade: unidade, minimo: minimo, quantidade: 0 };
  dados.produtos.push(novoProduto);
  salvarDados();

  document.getElementById('nome-produto').value = '';
  document.getElementById('categoria-produto').value = '';
  document.getElementById('unidade-produto').value = '';
  document.getElementById('minimo-produto').value = '';

  mostrarMensagem('Produto cadastrado com sucesso! ✅', 'sucesso');
  atualizarTabelaProdutos();
}

function atualizarTabelaProdutos() {
  let tabela = document.getElementById('tabela-produtos');
  if (dados.produtos.length === 0) {
    tabela.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum produto cadastrado ainda.</td></tr>';
    return;
  }
  let html = '';
  dados.produtos.forEach(function(produto) {
    html += `<tr><td>${produto.nome}</td><td>${produto.categoria}</td><td>${produto.unidade}</td><td>${produto.minimo}</td><td><button class="btn-excluir" onclick="excluirProduto(${produto.id})">🗑️ Excluir</button></td></tr>`;
  });
  tabela.innerHTML = html;
}

function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) return;
  dados.produtos = dados.produtos.filter(function(p) { return p.id !== id; });
  salvarDados();
  mostrarMensagem('Produto excluído!', 'sucesso');
  atualizarTabelaProdutos();
}

// ============================================
// ENTRADAS E SAÍDAS
// ============================================

function atualizarSelectProdutos(idSelect) {
  let select = document.getElementById(idSelect);
  if (dados.produtos.length === 0) {
    select.innerHTML = '<option value="">-- Nenhum produto cadastrado --</option>';
    return;
  }
  let opcoes = '<option value="">-- Selecione um produto --</option>';
  dados.produtos.forEach(function(produto) {
    opcoes += `<option value="${produto.id}">${produto.nome} (${produto.quantidade} ${produto.unidade})</option>`;
  });
  select.innerHTML = opcoes;
}

function registrarEntrada() {
  let idProduto = parseInt(document.getElementById('produto-entrada').value);
  let quantidade = parseInt(document.getElementById('qtd-entrada').value);
  let data = document.getElementById('data-entrada').value;
  let obs  = document.getElementById('obs-entrada').value.trim();

  if (!idProduto || isNaN(quantidade) || quantidade <= 0 || data === '') {
    mostrarMensagem('Preencha os campos obrigatórios!', 'erro');
    return;
  }

  let produto = dados.produtos.find(function(p) { return p.id === idProduto; });
  if (!produto) return;

  produto.quantidade += quantidade;
  dados.historico.push({ tipo: 'entrada', idProduto: produto.id, nomeProduto: produto.nome, quantidade: quantidade, data: data, destino: '', obs: obs });
  salvarDados();

  document.getElementById('produto-entrada').value = '';
  document.getElementById('qtd-entrada').value = '';
  document.getElementById('data-entrada').value = '';
  document.getElementById('obs-entrada').value = '';

  mostrarMensagem('Entrada registrada! ✅', 'sucesso');
  atualizarSelectProdutos('produto-entrada');
}

function registrarSaida() {
  let idProduto = parseInt(document.getElementById('produto-saida').value);
  let quantidade = parseInt(document.getElementById('qtd-saida').value);
  let destino = document.getElementById('destino-saida').value.trim();
  let data = document.getElementById('data-saida').value;
  let obs  = document.getElementById('obs-saida').value.trim();

  if (!idProduto || isNaN(quantidade) || quantidade <= 0 || destino === '' || data === '') {
    mostrarMensagem('Preencha os campos obrigatórios!', 'erro');
    return;
  }

  let produto = dados.produtos.find(function(p) { return p.id === idProduto; });
  if (!produto) return;

  if (quantidade > produto.quantidade) {
    mostrarMensagem('Estoque insuficiente! Disponível: ' + produto.quantidade, 'erro');
    return;
  }

  produto.quantidade -= quantidade;
  dados.historico.push({ tipo: 'saida', idProduto: produto.id, nomeProduto: produto.nome, quantidade: quantidade, data: data, destino: destino, obs: obs });
  salvarDados();

  document.getElementById('produto-saida').value = '';
  document.getElementById('qtd-saida').value = '';
  document.getElementById('destino-saida').value = '';
  document.getElementById('data-saida').value = '';
  document.getElementById('obs-saida').value = '';

  mostrarMensagem('Saída registrada! ✅', 'sucesso');
  atualizarSelectProdutos('produto-saida');
}

// ============================================
// TABELAS DE ESTOQUE E HISTÓRICO
// ============================================

function atualizarTabelaEstoque(filtro) {
  let tabela = document.getElementById('tabela-estoque');
  let busca = filtro !== undefined ? filtro : document.getElementById('busca-estoque').value.toLowerCase();
  let filtrados = dados.produtos.filter(function(p) { return p.nome.toLowerCase().includes(busca) || p.categoria.toLowerCase().includes(busca); });

  if (filtrados.length === 0) {
    tabela.innerHTML = '<tr><td colspan="5" class="vazio">Nenhum produto encontrado.</td></tr>';
    return;
  }

  let html = '';
  filtrados.forEach(function(produto) {
    let classe = produto.quantidade === 0 ? 'zerado' : (produto.quantidade <= produto.minimo ? 'baixo' : 'ok');
    let texto = produto.quantidade === 0 ? 'Zerado' : (produto.quantidade <= produto.minimo ? 'Baixo' : 'Normal');
    html += `<tr><td>${produto.nome}</td><td>${produto.categoria}</td><td>${produto.quantidade}</td><td>${produto.unidade}</td><td><span class="badge ${classe}">${texto}</span></td></tr>`;
  });
  tabela.innerHTML = html;
}

function filtrarEstoque() {
  atualizarTabelaEstoque(document.getElementById('busca-estoque').value.toLowerCase());
}

function atualizarTabelaHistorico(filtroTipo) {
  let tabela = document.getElementById('tabela-historico');
  let tipo = filtroTipo !== undefined ? filtroTipo : document.getElementById('filtro-tipo').value;
  let filtrados = dados.historico.filter(function(m) { return tipo === 'todos' || m.tipo === tipo; });

  if (filtrados.length === 0) {
    tabela.innerHTML = '<tr><td colspan="5" class="vazio">Nenhuma movimentação.</td></tr>';
    return;
  }

  let html = '';
  filtrados.reverse().forEach(function(mov) {
    let info = mov.destino ? mov.destino : (mov.obs ? mov.obs : '-');
    html += `<tr><td><span class="badge ${mov.tipo}">${mov.tipo === 'entrada' ? '📥 Entrada' : '📤 Saída'}</span></td><td>${mov.nomeProduto}</td><td>${mov.quantidade}</td><td>${formatarData(mov.data)}</td><td>${info}</td></tr>`;
  });
  tabela.innerHTML = html;
}

function filtrarHistorico() {
  atualizarTabelaHistorico(document.getElementById('filtro-tipo').value);
}

function limparHistorico() {
  if (!confirm('Deseja apagar todo o histórico de movimentações?')) return;
  dados.historico = [];
  salvarDados();
  mostrarMensagem('Histórico limpo!', 'sucesso');
  atualizarTabelaHistorico();
}

// ============================================
// AUXILIARES
// ============================================

function formatarData(dataString) {
  if (!dataString) return '-';
  let partes = dataString.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function mostrarMensagem(texto, tipo) {
  let msg = document.getElementById('mensagem');
  msg.textContent = texto;
  msg.className = 'mensagem ' + tipo;
  setTimeout(function() { msg.className = 'mensagem escondida'; }, 3000);
}

// ============================================
// SISTEMA DE LOGIN E SESSÃO PERSISTENTE
// ============================================

function fazerLogin() {
  let usuario = document.getElementById('login-usuario').value.trim();
  let senha = document.getElementById('login-senha').value.trim();

  let usuarioCorreto = 'admin';
  let senhaCorreta = '123';

  if (usuario === usuarioCorreto && senha === senhaCorreta) {
    mostrarMensagem('Login realizado com sucesso! ✅', 'sucesso');

    // Salva o token para não deslogar ao atualizar a página
    localStorage.setItem('usuarioLogado', 'true');

    document.getElementById('app-header').style.display = 'block';
    document.getElementById('app-nav').style.display = 'flex';
    document.getElementById('tela-login').classList.remove('ativa');
    
    mostrarTela('tela-inicio');
  } else {
    document.getElementById('login-senha').value = '';
    mostrarMensagem('Usuário ou senha incorretos! ❌', 'erro');
  }
}

function fazerLogout() {
  // Apaga a sessão ativa do navegador
  localStorage.removeItem('usuarioLogado');

  document.getElementById('app-header').style.display = 'none';
  document.getElementById('app-nav').style.display = 'none';

  let todasTelas = document.querySelectorAll('.tela');
  todasTelas.forEach(function(tela) {
    tela.classList.remove('ativa');
  });
  document.getElementById('tela-login').classList.add('ativa');

  document.getElementById('login-usuario').value = '';
  document.getElementById('login-senha').value = '';

  mostrarMensagem('Sessão encerrada com sucesso! 👋', 'sucesso');
}

function verificarSessao() {
  let logado = localStorage.getItem('usuarioLogado');

  if (logado === 'true') {
    // Se estava logado, pula o login direto para a inicial
    document.getElementById('app-header').style.display = 'block';
    document.getElementById('app-nav').style.display = 'flex';
    document.getElementById('tela-login').classList.remove('ativa');
    mostrarTela('tela-inicio');
  } else {
    // Se não estiver logado, garante que fique na tela de login
    document.getElementById('app-header').style.display = 'none';
    document.getElementById('app-nav').style.display = 'none';
    
    let todasTelas = document.querySelectorAll('.tela');
    todasTelas.forEach(function(tela) {
      tela.classList.remove('ativa');
    });
    document.getElementById('tela-login').classList.add('ativa');
  }
}

// Inicia checando a sessão automaticamente ao carregar
verificarSessao();