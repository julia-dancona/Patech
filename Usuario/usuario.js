function irCadastro(){ // abre a tela de cadastro
    window.location.href = "../Cadastro-Login/index.html"
}

// CARRINHO MODAL 
function irCarrinho() { //chama o carrinho pelo id
  document.getElementById("modalCarrinho").style.display = "block";
}
function fecharModalCarrinho() {
  document.getElementById("modalCarrinho").style.display = "none";
}

// FAVORITOS MODAL
function irFavorito() { //chama o carrinho pelo id
  document.getElementById("modalFavoritos").style.display = "block";
}
function fecharModalFavoritos() {
  document.getElementById("modalFavoritos").style.display = "none";
}

// Junta os dois modais e coloca eles pra fechar cxaso clique fora
window.onclick = function(event) {
  const modalCarrinho = document.getElementById("modalCarrinho");
  const modalFavoritos = document.getElementById("modalFavoritos");

  if (event.target === modalCarrinho) {
    modalCarrinho.style.display = "none";
  }
  if (event.target === modalFavoritos) {
    modalFavoritos.style.display = "none";
  }
};

function mostrarDados(numero) {   // Define uma função chamada "mostrarDados" que recebe um  "numero". É usado para identificar qual <section> deve aparecer.
  const secoes = document.querySelectorAll('section');   // Pega todas as tags <section> da página e guarda na constante "secoes". O resultado é uma lista (NodeList) com todas as <section>.
  secoes.forEach(secao => {   // Para cada <section> encontrada, executa uma função que recebe cada "secao" individualmente.
    if (secao.id === `dados${numero}`) {  // Verifica se o ID da seção atual é igual a "dados" + o valor do "numero".
      secao.classList.add('ativo'); // Se a condição for verdadeira, adiciona a classe "ativo" nessa seção.
    } else {
      secao.classList.remove('ativo'); // Remove a classe "ativo" dessa seção, para que ela fique com o display: none.
    }
  });
}

const API_URL = "http://localhost:3000";

// Atualizar dados do perfil
document.querySelector("#formPerfil").addEventListener("submit", async (e) => {
  e.preventDefault();

const nome = document.querySelector("#nome").value;
const email = document.querySelector("#email").value;
const cpf = document.querySelector("#cpf").value;

const res = await fetch(`${API_URL}/me`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ nome, email, cpf })
});

const data = await res.json();

if (res.ok) {
  alert(data.mensagem); // você pode estilizar depois
} else {
  alert("Erro: " + data.mensagem);
}
});

// Logout
async function logout() {
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  window.location.href = "../Cadastro-Login/index.html";
}