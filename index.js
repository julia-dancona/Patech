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


//PESQUISA FUNCIONA

let inputElement = document.querySelector("input")
let listElement = document.querySelector("ul")
let itemElement = document.querySelectorAll("li")

inputElement.addEventListener("input", (e) => {
  // Aqui irá executar em toda alteração no input
})

inputElement.addEventListener("input", (e) => {
  itemElement.forEach((li) => {
    // Função executada para cada item da lista
  })
})

let inputed = e.target.value.toLowerCase()

inputElement.addEventListener("input", (e) => {
  let inputed = e.target.value.toLowerCase()
  itemElement.forEach((li) => {
    let text = li.textContent.toLowerCase()
    if(text.includes(inputed)){
      li.style.display = "block"
    }else{
      li.style.display = "none"
    }
  })
})