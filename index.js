var radio = document.querySelector('.manual-btn')
var cont = 1

document.getElementById('radio1').checked = true

setInterval(() => {
    proximovideo()
}, 5000)

function proximovideo(){
    cont++

    if(cont > 2){
        cont = 1
    }

    document.getElementById('radio' + cont).checked = true
}

function irCadastro(){
    window.location.href = "../Cadastro-Login"
}

function irCarrinho() { //chama o carrinho pelo id
  document.getElementById("modalCarrinho1").style.display = "block";
}
function fecharModalCarrinho() {
  document.getElementById("modalCarrinho1").style.display = "none";
}

// FAVORITOS MODAL
function irFavorito() { //chama o carrinho pelo id
  document.getElementById("modalFavoritos1").style.display = "block";
}
function fecharModalFavoritos() {
  document.getElementById("modalFavoritos1").style.display = "none";
}

window.onclick = function(event) {
  const modalCarrinho = document.getElementById("modalCarrinho1");
  const modalFavoritos = document.getElementById("modalFavoritos1");

  if (event.target === modalCarrinho) {
    modalCarrinho.style.display = "none";
  }
  if (event.target === modalFavoritos) {
    modalFavoritos.style.display = "none";
  }
};

// PRODUTOS MODAL
document.querySelectorAll(".modais").forEach(modalBox => {
  const btn = modalBox.querySelector(".abrir-modal");
  const modal = modalBox.querySelector(".modal-Produto");
  const fechar = modalBox.querySelector(".fechar");

  // abrir
  btn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // fechar no X
  fechar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // fechar clicando fora
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});

//FILTRO POR CATEGORIA
    function filtrarProdutos(categoriaSelecionada) {
        const produtos = document.querySelectorAll('.nossasPecas .modais');
      
        produtos.forEach(produto => {
            const categoriaProduto = produto.getAttribute('data-category');

            if (categoriaSelecionada === 'all' || categoriaProduto === categoriaSelecionada) {
                produto.style.display = 'block';
            } else {
                produto.style.display = 'none';
            }
        });

        const botoes = document.querySelectorAll('.categorias');
      
        botoes.forEach(btn => btn.classList.remove('active'));

        // Adiciona a classe 'active' ao botão que corresponde à categoria selecionada
        // Procuramos o botão que tem o mesmo valor no atributo data-category ou alt
        let botaoAtivo;
        if (categoriaSelecionada === 'all') {
            botaoAtivo = document.querySelector('.todos button');
        } else {
            // Seleciona o botão que tem a categoria (usando data-category, se você o tiver adicionado)
            // Se não tiver data-category nos botões, usamos o atributo alt, como na sua estrutura original
            botaoAtivo = document.querySelector(`.categorias[alt="${categoriaSelecionada}"]`);
        }
        
        if (botaoAtivo) {
            botaoAtivo.classList.add('active');
        }
    }

    // Chama a função ao carregar a página para garantir que todos os produtos estejam visíveis por padrão
    window.onload = function() {
        filtrarProdutos('all');
    };