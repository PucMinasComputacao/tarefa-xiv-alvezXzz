/**
 * script.js — Home Page (index.html)
 * Livraria Atlântica — Atividade Prática JSON Server
 *
 * Responsabilidades:
 *  - Buscar lista de livros via Fetch API (GET /livros)
 *  - Criar cards dinamicamente a partir dos dados
 *  - Renderizar os cards no grid da página
 *  - Tratar estados de carregamento e erro
 */
 
const API_BASE = 'http://localhost:3000';
 
// ─────────────────────────────────────────────
//  1. Busca os dados no JSON Server
// ─────────────────────────────────────────────
/**
 * Faz uma requisição GET para /livros e retorna o array.
 * @returns {Promise<Array>} Lista de livros
 */
async function fetchItems() {
  const resposta = await fetch(`${API_BASE}/livros`);
 
  if (!resposta.ok) {
    throw new Error(`Erro ao buscar livros: HTTP ${resposta.status}`);
  }
 
  const livros = await resposta.json();
  return livros;
}
 
// ─────────────────────────────────────────────
//  2. Cria o elemento HTML de um card
// ─────────────────────────────────────────────
/**
 * Recebe um objeto livro e retorna um <article> com o card.
 * @param {Object} item — Objeto com os dados do livro
 * @returns {HTMLElement}
 */
function createCard(item) {
  const card = document.createElement('article');
  card.classList.add('card-livro');
 
  // Formata o preço em reais
  const precoFormatado = item.preco
    ? `R$ ${Number(item.preco).toFixed(2).replace('.', ',')}`
    : 'Sob consulta';
 
  // Badge de destaque (só aparece se destaque === true)
  const badgeDestaque = item.destaque
    ? `<span class="badge-destaque">Destaque</span>`
    : '';
 
  // Fallback para imagem
  const imgSrc = item.imagem || '';
  const imgAttr = imgSrc
    ? `src="${imgSrc}" alt="Capa do livro ${item.titulo}"`
    : `src="https://placehold.co/300x450/f2ede4/6b5f4e?text=${encodeURIComponent(item.titulo)}" alt="Capa não disponível"`;
 
  card.innerHTML = `
    <div class="card-capa">
      <img ${imgAttr} loading="lazy" onerror="this.src='https://placehold.co/300x450/f2ede4/6b5f4e?text=Sem+Capa'" />
      ${badgeDestaque}
    </div>
    <div class="card-corpo">
      <span class="card-categoria">${item.categoria || 'Geral'}</span>
      <h3 class="card-titulo">${item.titulo}</h3>
      <p class="card-autor">${item.autor || ''}</p>
      <p class="card-descricao">${item.descricaoCurta || ''}</p>
      <div class="card-rodape">
        <span class="card-preco">${precoFormatado}</span>
        <a class="btn-detalhes" href="details.html?id=${item.id}">Ver detalhes</a>
      </div>
    </div>
  `;
 
  return card;
}
 
// ─────────────────────────────────────────────
//  3. Renderiza todos os cards no grid
// ─────────────────────────────────────────────
/**
 * Limpa o container e injeta os cards a partir de um array.
 * @param {Array} items — Array de objetos livro
 */
function renderCards(items) {
  const grid = document.getElementById('grid-livros');
  const contagem = document.getElementById('contagem-livros');
 
  // Limpa conteúdo anterior (inclusive o spinner)
  grid.innerHTML = '';
 
  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div class="estado-vazio">
        <p class="estado-vazio-titulo">Nenhum livro encontrado</p>
        <p>O acervo está vazio no momento. Tente adicionar livros via <a href="cadastro_livro.html">cadastro</a>.</p>
      </div>
    `;
    contagem.textContent = '0 livros';
    return;
  }
 
  // Atualiza contagem no cabeçalho da seção
  contagem.textContent = `${items.length} ${items.length === 1 ? 'livro' : 'livros'}`;
 
  // Cria e adiciona cada card
  items.forEach(item => {
    const card = createCard(item);
    grid.appendChild(card);
  });
}
 
// ─────────────────────────────────────────────
//  4. Exibe mensagem de erro no grid
// ─────────────────────────────────────────────
/**
 * Substitui o conteúdo do grid por um painel de erro.
 * @param {Error} erro — Objeto de erro capturado
 */
function renderErro(erro) {
  const grid = document.getElementById('grid-livros');
  const contagem = document.getElementById('contagem-livros');
 
  contagem.textContent = 'Erro';
 
  grid.innerHTML = `
    <div class="estado-erro">
      <p class="estado-erro-titulo">Não foi possível carregar os livros</p>
      <p>Verifique se o JSON Server está rodando em <strong>localhost:3000</strong>.<br>
         Execute: <code>npx json-server db.json</code></p>
      <p><small>Detalhe técnico: ${erro.message}</small></p>
      <button class="btn-primario" onclick="init()">Tentar novamente</button>
    </div>
  `;
}
 
// ─────────────────────────────────────────────
//  5. Inicialização da página
// ─────────────────────────────────────────────
/**
 * Ponto de entrada: busca os itens e os renderiza.
 * Chamada automaticamente ao carregar a página.
 */
async function init() {
  // Mostra spinner enquanto carrega
  const grid = document.getElementById('grid-livros');
  grid.innerHTML = `
    <div class="estado-carregando" id="estado-carregando">
      <div class="estado-carregando-spinner"></div>
      <p>Buscando livros no servidor…</p>
    </div>
  `;
 
  try {
    const livros = await fetchItems();
    renderCards(livros);
  } catch (erro) {
    console.error('Falha ao carregar livros:', erro);
    renderErro(erro);
  }
}
 
// Chama init() assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
  