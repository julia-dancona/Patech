// -------------------------
// NAVEGAÇÃO / MODAIS / CATEGORIAS (mantive sua lógica)
// -------------------------
function irCadastro() {
  window.location.href = "../Cadastro-Login";
}

function irCarrinho() {
  document.getElementById("modalCarrinho1").style.display = "block";
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
