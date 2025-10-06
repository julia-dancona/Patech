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

function irCarrinho() { //chama o carrinho pelo id
  document.getElementById("modalCarrinho").style.display = "block";
}

function fecharModalCarrinho() {
  document.getElementById("modalCarrinho").style.display = "none";
}

// Fecha o modal se o usuário clicar fora 
window.onclick = function(event) {
  const modal = document.getElementById("modalCarrinho");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// FAVORITOS MODAL
function irFavorito() { //chama o carrinho pelo id
  document.getElementById("modalFavoritos").style.display = "block";
}
function fecharModalFavoritos() {
  document.getElementById("modalFavoritos").style.display = "none";
}
// Fecha o modal se o usuário clicar fora 
window.onclick = function(event) {
  const modal = document.getElementById("modalFavoritos");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

function irCadastro(){ // abre a tela de cadastro
    window.location.href = "../Cadastro-Login/index.html"
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