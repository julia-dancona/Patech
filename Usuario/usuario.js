// REDIRECIONAMENTO 
function irCadastro() {
  window.location.href = "../Cadastro-Login/index.html";
}

//  FUNÇÕES DE MODAL 
function abrirModal(id) {
  document.getElementById(id).style.display = "flex";
}

function fecharModal(id) {
  document.getElementById(id).style.display = "none";
}

// CARRINHO  
let carrinho = [];

function adicionarAoCarrinho(idProduto) {
  const produto = document.getElementById(idProduto);
  if (!produto) {
    console.error("Produto não encontrado:", idProduto);
    return;
  }

  const nome = produto.querySelector(".produto-nome").textContent.trim();
  const preco = produto.querySelector(".produto-preco").textContent.trim();
  const imagem = produto.querySelector(".produto-img").src;

  carrinho.push({ nome, preco, imagem });
  atualizarCarrinho();
  abrirCarrinho();
}

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
      <button class="remover-btn" onclick="removerItemCarrinho(${index})">Remover</button>
    `;
    container.appendChild(div);
  });
}

function removerItemCarrinho(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

function abrirCarrinho() {
  document.getElementById("modalCarrinho").style.display = "block";
}

function fecharCarrinho() {
  document.getElementById("modalCarrinho").style.display = "none";
}

// Permitir que o botão da navbar abra o carrinho
function irCarrinho() {
  abrirCarrinho();
}

//  FAVORITOS / LISTA 
let favoritos = [];

function adicionarAosFavoritos(idProduto) {
  const produto = document.getElementById(idProduto);
  if (!produto) {
    console.error("Produto não encontrado:", idProduto);
    return;
  }

  const nome = produto.querySelector(".produto-nome").textContent.trim();
  const preco = produto.querySelector(".produto-preco").textContent.trim();
  const imagem = produto.querySelector(".produto-img").src;

  favoritos.push({ nome, preco, imagem });
  atualizarFavoritos();
  abrirModal("modalFavoritos");
}

function atualizarFavoritos() {
  const container = document.getElementById("itens-favoritos");
  const vazio = document.getElementById("favoritos-vazio");

  container.innerHTML = "";

  if (favoritos.length === 0) {
    vazio.style.display = "block";
    return;
  } else {
    vazio.style.display = "none";
  }

  favoritos.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("item-favorito");
    div.innerHTML = `
      <img src="${item.imagem}" alt="${item.nome}" class="favorito-img">
      <div class="favorito-info">
        <p>${item.nome}</p>
        <p>${item.preco}</p>
      </div>
      <button class="remover-btn" onclick="removerItemFavorito(${index})">Remover</button>
    `;
    container.appendChild(div);
  });
}

function removerItemFavorito(index) {
  favoritos.splice(index, 1);
  atualizarFavoritos();
}

function irFavorito() {
  abrirModal("modalFavoritos");
}

// PERFIL DO USUÁRIO 
const API_URL = 'http://127.0.0.1:3000';

async function buscarDadosDoPerfil() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = "../Cadastro-Login/index.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/perfil`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      const perfil = data.perfil;

      if (document.getElementById('nome-usuario')) {
        document.getElementById('nome-usuario').textContent = perfil.nome;
      }

      if (document.querySelector("#nome")) document.querySelector("#nome").value = perfil.nome || '';
      if (document.querySelector("#email")) document.querySelector("#email").value = perfil.email || '';
      if (document.querySelector("#cpf")) document.querySelector("#cpf").value = perfil.cpf || '';
    } else if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = "../Cadastro-Login/index.html";
    } else {
      console.error("Falha ao carregar perfil:", response.status);
    }
  } catch (error) {
    console.error("Erro de rede ao buscar perfil:", error);
  }
}

// ENDEREÇOS 
async function listarEnderecos() {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/enderecos`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    const data = await response.json();
    const container = document.getElementById('lista-enderecos-salvos');
    container.innerHTML = '';

    const msgSemEndereco = document.createElement('p');
    msgSemEndereco.id = 'sem-endereco';
    msgSemEndereco.textContent = 'Parece que você ainda não cadastrou nenhum endereço!';

    if (response.ok && data.enderecos.length > 0) {
      data.enderecos.forEach(endereco => {
        const div = document.createElement('div');
        div.classList.add('endereco-item');
        const enderecoCompleto = `${endereco.rua}, ${endereco.numero} - ${endereco.cidade}/${endereco.estado} - CEP: ${endereco.cep}`;

        div.innerHTML = `
          <p class="endereco-principal">${endereco.principal ? 'ENDEREÇO PRINCIPAL' : ''}</p>
          <p>${enderecoCompleto}</p>
          ${endereco.complemento ? `<p>Complemento: ${endereco.complemento}</p>` : ''}
          <div class="botoesAcaoes">
            <button onclick="deletarEndereco(${endereco.id_endereco})" class="btnRed">Excluir</button>
          </div>
          <hr>
        `;
        container.appendChild(div);
      });
    } else {
      container.appendChild(msgSemEndereco);
    }
  } catch (error) {
    console.error("Erro ao listar endereços:", error);
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem('authToken');
  window.location.href = "../Cadastro-Login/index.html";
}

// CARREGAR A PÁGINA 
document.addEventListener("DOMContentLoaded", () => {
  buscarDadosDoPerfil();
  listarEnderecos();
});
