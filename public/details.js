/**
 * details.js — Página de Detalhes (details.html)
 * Livraria Atlântica — Atividade Prática JSON Server
 *
 * Responsabilidades:
 *  - Ler o parâmetro `id` da URL via URLSearchParams
 *  - Buscar o livro específico via GET /livros/:id
 *  - Renderizar os dados completos do livro
 *  - Tratar erros: id ausente, item não encontrado, falha de rede
 */
 
const API_BASE = 'http://localhost:3000';
 
// ─────────────────────────────────────────────
//  Utilitário: gera estrelas de avaliação
// ─────────────────────────────────────────────
/**
 * Recebe uma nota (0–5) e retorna estrelas preenchidas/vazias.
 * @param {number} nota
 * @returns {string} HTML com ★ e ☆
 */
function gerarEstrelas(nota) {
  const total = 5;
  const cheias = Math.round(nota);
  return '★'.repeat(cheias) + '☆'.repeat(total - cheias);
}
 
// ─────────────────────────────────────────────
//  Utilitário: renderiza mensagem de erro
// ─────────────────────────────────────────────
/**
 * Exibe um painel de erro no container principal.
 * @param {string} titulo — Título do erro
 * @param {string} mensagem — Descrição legível
 */
function renderErro(titulo, mensagem) {
  const conteudo = document.getElementById('detalhe-conteudo');
  document.title = 'Erro — Livraria Atlântica';
 
  conteudo.innerHTML = `
    <div class="estado-erro">
      <p class="estado-erro-titulo">${titulo}</p>
      <p>${mensagem}</p>
      <a href="index.html" class="btn-primario">Voltar ao acervo</a>
    </div>
  `;
}
 
// ─────────────────────────────────────────────
//  Busca o livro pelo id no JSON Server
// ─────────────────────────────────────────────
/**
 * Faz GET /livros/:id. Lança erro se não encontrado (404).
 * @param {string|number} id
 * @returns {Promise<Object>} Dados do livro
 */
async function fetchItem(id) {
  const resposta = await fetch(`${API_BASE}/livros/${id}`);
 
  if (resposta.status === 404) {
    throw new Error('NOT_FOUND');
  }
 
  if (!resposta.ok) {
    throw new Error(`HTTP ${resposta.status}`);
  }
 
  const livro = await resposta.json();
  return livro;
}
 
// ─────────────────────────────────────────────
//  Renderiza os dados completos do livro
// ─────────────────────────────────────────────
/**
 * Injeta o HTML de detalhes a partir dos dados do livro.
 * @param {Object} livro
 */
function renderDetalhe(livro) {
  const conteudo = document.getElementById('detalhe-conteudo');
 
  // Atualiza o <title> da página com o nome do livro
  document.title = `${livro.titulo} — Livraria Atlântica`;
 
  // Formata preço
  const precoFormatado = livro.preco
    ? `R$ ${Number(livro.preco).toFixed(2).replace('.', ',')}`
    : 'Sob consulta';
 
  // Monta chips de tags
  const tagsHTML = Array.isArray(livro.tags) && livro.tags.length > 0
    ? `<ul class="detalhe-tags-lista" aria-label="Tags">
        ${livro.tags.map(tag => `<li><span class="tag-chip">${tag}</span></li>`).join('')}
       </ul>`
    : '';
 
  // Avaliação com estrelas
  const avaliacaoHTML = livro.avaliacao
    ? `<div class="detalhe-avaliacao">
        <span class="estrelas" aria-label="Avaliação: ${livro.avaliacao} de 5">${gerarEstrelas(livro.avaliacao)}</span>
        <span class="avaliacao-numero">${Number(livro.avaliacao).toFixed(1)}</span>
        <span class="avaliacao-texto">/ 5</span>
       </div>`
    : '';
 
  // Imagem com fallback
  const imgSrc = livro.imagem || '';
  const capaMarcacao = imgSrc
    ? `<img src="${imgSrc}"
            alt="Capa do livro ${livro.titulo}"
            onerror="this.parentElement.innerHTML='<div class=detalhe-capa-placeholder>📖</div>'" />`
    : `<div class="detalhe-capa-placeholder">📖</div>`;
 
  // Metadados adicionais (somente os que existirem)
  const metaItens = [
    livro.anoPublicacao && { label: 'Publicado em', valor: livro.anoPublicacao },
    livro.paginas       && { label: 'Páginas',       valor: `${livro.paginas} págs.` },
    livro.editora       && { label: 'Editora',        valor: livro.editora },
    livro.autor         && { label: 'Autor',          valor: livro.autor },
  ].filter(Boolean);
 
  const metaHTML = metaItens.map(m => `
    <div class="detalhe-meta-item">
      <span class="detalhe-meta-label">${m.label}</span>
      <span class="detalhe-meta-valor">${m.valor}</span>
    </div>
  `).join('');
 
  // Injeta o HTML completo
  conteudo.innerHTML = `
    <div class="detalhe-grid">
 
      <!-- Coluna esquerda: capa -->
      <div class="detalhe-capa">
        ${capaMarcacao}
      </div>
 
      <!-- Coluna direita: informações -->
      <div class="detalhe-info">
 
        <p class="detalhe-categoria">${livro.categoria || 'Geral'}</p>
        <h1 class="detalhe-titulo">${livro.titulo}</h1>
        <p class="detalhe-autor">por ${livro.autor || 'Autor desconhecido'}</p>
 
        ${avaliacaoHTML}
 
        <div class="detalhe-meta">
          <div class="detalhe-meta-item">
            <span class="detalhe-meta-label">Preço</span>
            <span class="detalhe-meta-valor preco">${precoFormatado}</span>
          </div>
          ${metaHTML}
        </div>
 
        <h2 class="detalhe-descricao-titulo">Sobre o livro</h2>
        <p class="detalhe-descricao">${livro.descricaoCompleta || livro.descricaoCurta || 'Sem descrição disponível.'}</p>
 
        ${tagsHTML}
 
      </div>
    </div>
  `;
}
 
// ─────────────────────────────────────────────
//  Inicialização da página de detalhes
// ─────────────────────────────────────────────
/**
 * Lê o parâmetro `id` da URL, busca o livro e renderiza.
 * Trata os casos de id ausente e item inexistente.
 */
async function init() {
  // 1. Lê os parâmetros da QueryString
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
 
  // 2. Valida presença do id
  if (!id) {
    renderErro(
      'Nenhum livro selecionado',
      'A URL não contém um <code>id</code> válido. Acesse um livro a partir do acervo.'
    );
    return;
  }
 
  // 3. Busca o livro e renderiza
  try {
    const livro = await fetchItem(id);
    renderDetalhe(livro);
  } catch (erro) {
    if (erro.message === 'NOT_FOUND') {
      renderErro(
        'Livro não encontrado',
        `Não existe nenhum livro com o id <strong>${id}</strong> no acervo.`
      );
    } else {
      renderErro(
        'Erro de conexão',
        `Não foi possível acessar o servidor. Verifique se o JSON Server está ativo em
         <strong>localhost:3000</strong>.<br><small>Detalhe: ${erro.message}</small>`
      );
    }
  }
}
 
// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);