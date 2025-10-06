// -------------------------
// NAVEGAÇÃO / MODAIS / CATEGORIAS (mantive sua lógica)
// -------------------------
function irCadastro() { // abre a tela de cadastro
  window.location.href = "../Cadastro-Login/index.html"
}
function fecharModalCarrinho() {
  document.getElementById("modalCarrinho1").style.display = "none";
}

function irFavorito() {
  document.getElementById("modalFavoritos1").style.display = "block";
}
function fecharModalFavoritos() {
  document.getElementById("modalFavoritos1").style.display = "none";
}

// fechar modais clicando fora (carrinho / favoritos)
window.onclick = function (event) {
  const modalCarrinho = document.getElementById("modalCarrinho1");
  const modalFavoritos = document.getElementById("modalFavoritos1");

  if (event.target === modalCarrinho) modalCarrinho.style.display = "none";
  if (event.target === modalFavoritos) modalFavoritos.style.display = "none";
};

// Produto -> abrir modal / fechar X
document.querySelectorAll(".modais").forEach((modalBox) => {
  const btn = modalBox.querySelector(".abrir-modal");
  const modal = modalBox.querySelector(".modal-Produto");
  const fechar = modalBox.querySelector(".fechar");

  if (btn) {
    btn.addEventListener("click", () => {
      if (modal) modal.style.display = "block";
    });
  }
  if (fechar) {
    fechar.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }
  // fechar clicando fora do modal específico
  window.addEventListener("click", (e) => {
    if (modal && e.target === modal) modal.style.display = "none";
  });
});

function filtrarProdutos(categoriaSelecionada) {
  const produtos = document.querySelectorAll(".nossasPecas .modais");

  produtos.forEach((produto) => {
    const categoriaProduto = produto.getAttribute("data-category");
    if (categoriaSelecionada === "all" || categoriaProduto === categoriaSelecionada) {
      produto.style.display = "block";
    } else {
      produto.style.display = "none";
    }
  });

  const botoes = document.querySelectorAll(".categorias");
  botoes.forEach((btn) => btn.classList.remove("active"));

  let botaoAtivo;
  if (categoriaSelecionada === "all") {
    botaoAtivo = document.querySelector(".todos button");
  } else {
    botaoAtivo = document.querySelector(`.categorias[aria-label="${categoriaSelecionada}"]`);
  }

  if (botaoAtivo) botaoAtivo.classList.add("active");
}

window.onload = function () {
  filtrarProdutos("all");
  initSearchSuggestions(); // inicializa a busca quando a página carrega
};

// -------------------------
// PESQUISA - SUGESTÕES AO DIGITAR (AUTOCOMPLETE)
// -------------------------
function initSearchSuggestions() {
  const input = document.getElementById("usr");
  const suggestionsEl = document.getElementById("listaProdutos");
  if (!input || !suggestionsEl) return;

  // Normaliza (remove acentos e deixa minúsculo)
  const normalize = (s) =>
    (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Escapa para usar em regex
  const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Extrai o título do produto diretamente do HTML do seu card.
  // Ele tenta usar .legenda-card (onde você tem o título + <p>preco</p>) e remove o <p>.
  function getProductTitle(prodEl) {
    const fig = prodEl.querySelector(".legenda-card") || prodEl.querySelector(".legenda-conteudo") || prodEl.querySelector(".tituloM");
    if (!fig) return "";
    const clone = fig.cloneNode(true);
    clone.querySelectorAll("p").forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, " ").trim();
  }

  // Pega imagem do card (se houver)
  function getProductImage(prodEl) {
    const img = prodEl.querySelector("img.card-produto") || prodEl.querySelector("img.pecas") || prodEl.querySelector("img");
    return img ? img.src : "";
  }
  

  // monta array de produtos a partir do DOM
  const nodes = Array.from(document.querySelectorAll(".nossasPecas .modais"));
  const products = nodes.map((el) => {
    const title = getProductTitle(el);
    return {
      el,
      title,
      img: getProductImage(el),
      norm: normalize(title),
    };
  });

  // Limpa sugestões
  function clearSuggestions() {
    suggestionsEl.innerHTML = "";
  }

  // Renderiza uma lista de sugestões (max 8)
  function renderSuggestions(list, query) {
    suggestionsEl.innerHTML = "";
    if (!list.length) {
      const li = document.createElement("li");
      li.className = "no-results";
      li.textContent = "Nenhum produto encontrado"; 
      suggestionsEl.appendChild(li);
      return;
    }

    list.slice(0, 8).forEach((p) => {
      const li = document.createElement("li");
      li.className = "sug-item";

      // Destacar trecho que bate (tenta usar regex simples, case-insensitive)
      let label = p.title;
      if (query) {
        try {
          const re = new RegExp(escapeReg(query), "i");
          label = label.replace(re, (m) => `<strong>${m}</strong>`);
        } catch (err) {
          /* ignore */
        }
      }

      li.innerHTML = `
        <a href="#" title="${p.title}">
          ${p.img ? `<img src="${p.img}" alt="${p.title}" width="50px">` : ""}
          <span class="item-name">${label}</span>
        </a>
      `;

      // Ao clicar na sugestão, abre o modal do produto correspondente
      li.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        // clique no botão que abre o modal dentro do card
        const abrirBtn = p.el.querySelector(".abrir-modal");
        if (abrirBtn) abrirBtn.click();
        clearSuggestions();
        input.blur();
      });

      suggestionsEl.appendChild(li);
    });
  }

  // Event handlers
  input.addEventListener("input", () => {
    const q = normalize(input.value);
    if (!q) {
      clearSuggestions();
      return;
    }
    const matches = products.filter((p) => p.norm.indexOf(q) > -1);
    renderSuggestions(matches, input.value);
  });

  // Mostrar sugestões ao focar (se já tiver texto)
  input.addEventListener("focus", () => {
    const q = normalize(input.value);
    if (!q) return;
    const matches = products.filter((p) => p.norm.indexOf(q) > -1);
    renderSuggestions(matches, input.value);
  });

  // Fechar sugestões ao clicar fora do .buscar
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".buscar")) clearSuggestions();
  });
}

//BANNER

let slideIndex = 1;
showSlides(slideIndex);

// Controles para avançar/voltar
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Controles para o slide atual (dots)
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slider-image");
  let dots = document.getElementsByClassName("dot");

  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

//slider automático

let autoSlideIndex = 0;
autoShowSlides();

function autoShowSlides() {
  let i;
  let slides = document.getElementsByClassName("slider-image");
  let dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  autoSlideIndex++;
  if (autoSlideIndex > slides.length) {autoSlideIndex = 1}
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[autoSlideIndex-1].style.display = "block";
  dots[autoSlideIndex-1].className += " active";
  setTimeout(autoShowSlides, 5000); // Muda de imagem a cada 5 segundos
}

//CARRINHO 
let carrinho = [];

// Adiciona produto ao carrinho a partir do ID do modal
function adicionarAoCarrinho(idProduto) {
  const produto = document.getElementById(idProduto);

  if (!produto) {
    console.error("Produto não encontrado:", idProduto);
    return;
  }

  const nome = produto.querySelector(".produto-nome").textContent.trim();
  const preco = produto.querySelector(".produto-preco").textContent.trim();
  const imagem = produto.querySelector(".produto-img").src;

  // Adiciona o item no array do carrinho
  carrinho.push({ nome, preco, imagem });

  atualizarCarrinho();
  abrirCarrinho();
}

// Atualiza o conteúdo do modal do carrinho
function atualizarCarrinho() {
  const container = document.getElementById("carrinho-itens");
  const vazio = document.getElementById("carrinho-vazio");

  container.innerHTML = "";

  if (carrinho.length === 0) {
    vazio.style.display = "block";
    return;
  } else {
    vazio.style.display = "none";
  }

  carrinho.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("item-carrinho");
    div.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" class="carrinho-img">
      <div class="carrinho-info">
        <p>${item.nome}</p>
        <p>${item.preco}</p>
      </div>
      <button class="remover-btn" onclick="removerItem(${index})">Remover</button>
    `;
    container.appendChild(div);
  });
}

// Remove item do carrinho
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// Abre o modal do carrinho
function abrirCarrinho() {
  document.getElementById("modalCarrinho1").style.display = "block";
}

// Fecha o modal do carrinho
function fecharCarrinho() {
  document.getElementById("modalCarrinho1").style.display = "none";
}

document.addEventListener('DOMContentLoaded', () => {
    // Pega o token de autenticação (se existir)
    const token = localStorage.getItem('authToken');
    
    // Encontra o botão do dashboard/login (você chamou de 'dashboard' no seu usuario.html)
    const dashboardButton = document.getElementById('dashboard'); 
    
    if (dashboardButton) {
        if (token) {
            // Se o token existe (USUÁRIO LOGADO)
            
            // 1. Altera o destino para a página de usuário
            dashboardButton.onclick = function() {
                window.location.href = "../Usuario/usuario.html"; 
            };
   
        } else {            
            // 1. Altera o destino para a página de Login/Cadastro
            dashboardButton.onclick = function() {
                window.location.href = "../Cadastro-Login/index.html";
            };
        }
    }
});