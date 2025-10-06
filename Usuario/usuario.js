function irCadastro() { // abre a tela de cadastro
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
window.onclick = function (event) {
  const modalCarrinho = document.getElementById("modalCarrinho");
  const modalFavoritos = document.getElementById("modalFavoritos");

  if (event.target === modalCarrinho) {
    modalCarrinho.style.display = "none";
  }
  if (event.target === modalFavoritos) {
    modalFavoritos.style.display = "none";
  }
};

function mostrarDados(numero) {   // Define uma função chamada "mostrarDados" que recebe um  "numero". É usado para identificar qual <section> deve aparecer.
  const secoes = document.querySelectorAll('section');   // Pega todas as tags <section> da página e guarda na constante "secoes". O resultado é uma lista (NodeList) com todas as <section>.
  secoes.forEach(secao => {   // Para cada <section> encontrada, executa uma função que recebe cada "secao" individualmente.
    if (secao.id === `dados${numero}`) {  // Verifica se o ID da seção atual é igual a "dados" + o valor do "numero".
      secao.classList.add('ativo'); // Se a condição for verdadeira, adiciona a classe "ativo" nessa seção.
    } else {
      secao.classList.remove('ativo'); // Remove a classe "ativo" dessa seção, para que ela fique com o display: none.
    }
  });
}

const API_URL = 'http://127.0.0.1:3000';

function logout() {
  localStorage.removeItem('authToken'); // Apaga o token
  window.location.href = "../Cadastro-Login/index.html";
}

// Atualizar dados do perfil (SÓ NOME)
document.querySelector("#formPerfil").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem('authToken');
  if (!token) {
    alert("Sua sessão expirou. Faça login novamente.");
    window.location.href = "../Cadastro-Login/index.html";
    return;
  }

  // Coletamos SÓ o nome
  const nome = document.querySelector("#nome").value;


  const res = await fetch(`${API_URL}/perfil`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    // Enviamos SÓ o nome
    body: JSON.stringify({ nome })
  });

  const data = await res.json();

  if (res.ok) {
    alert(data.mensagem);
    // Chama a função para recarregar os dados na tela após a atualização:
    buscarDadosDoPerfil();
  } else {
    alert("Erro: " + data.mensagem);
  }
});

//CARRINHO 
let carrinho = []; //Aparece no localstorage

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

async function buscarDadosDoPerfil() {
  const token = localStorage.getItem('authToken');
  // Se não houver token, redireciona imediatamente
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
      const perfil = data.perfil; // Acessa o objeto perfil

      // 1. Atualiza a div de boas-vindas
      if (document.getElementById('nome-usuario')) {
        document.getElementById('nome-usuario').textContent = perfil.nome;
      }

      // 2. Preenche os campos de dados
      if (document.querySelector("#nome")) document.querySelector("#nome").value = perfil.nome || '';
      if (document.querySelector("#email")) document.querySelector("#email").value = perfil.email || '';
      if (document.querySelector("#cpf")) document.querySelector("#cpf").value = perfil.cpf || '';

    } else if (response.status === 401) {
      // Token inválido/expirado, limpa o token e redireciona
      localStorage.removeItem('authToken');
      window.location.href = "../Cadastro-Login/index.html";
    } else {
      console.error("Falha ao carregar perfil:", response.status);
    }
  } catch (error) {
    console.error("Erro de rede ao buscar perfil:", error);
  }
}

// ENDEREÇO 
// Função para mostrar ou esconder o formulário de endereço
function alternarFormulario(mostrar) {
  const containerForm = document.getElementById('containerFormEndereco');
  const btnMostrar = document.getElementById('btnMostrarFormulario');

  // Se os elementos não existirem (porque o usuário pode não estar na seção de endereços), saí da função.
  if (!containerForm || !btnMostrar) return;

  if (mostrar) {
    // Mostra o formulário e oculta o botão
    containerForm.style.display = 'block';
    btnMostrar.style.display = 'none';
  } else {
    // Oculta o formulário e mostra o botão
    containerForm.style.display = 'none';
    btnMostrar.style.display = 'block';
  }
}

// LISTA ENDEREÇOS SALVOS
async function listarEnderecos() {
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/enderecos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    const container = document.getElementById('lista-enderecos-salvos');

    // Limpa o container antes de inserir os novos dados
    container.innerHTML = '';

    // CRIA A MENSAGEM DE 'SEM ENDEREÇO' AQUI, SEMPRE QUE A LISTA É ATUALIZADA
    const msgSemEndereco = document.createElement('p');
    msgSemEndereco.id = 'sem-endereco';
    msgSemEndereco.textContent = 'Parece que você ainda não cadastrou nenhum endereço! Adicione agora!';

    if (response.ok && data.enderecos.length > 0) {

      data.enderecos.forEach(endereco => {
        const divEndereco = document.createElement('div');
        divEndereco.classList.add('endereco-item');

        // Texto do endereço
        const enderecoCompleto = `${endereco.rua}, ${endereco.numero} - ${endereco.cidade}/${endereco.estado} - CEP: ${endereco.cep}`;

        // Adiciona o conteúdo
        divEndereco.innerHTML = `
            <p class="endereco-principal">${endereco.principal ? 'ENDEREÇO PRINCIPAL' : ''}</p>
            <p>${enderecoCompleto}</p>
            ${endereco.complemento ? `<p>Complemento: ${endereco.complemento}</p>` : ''}
            <div class="botoesAcaoes">
                <button onclick="deletarEndereco(${endereco.id_endereco})" class="btnRed">Excluir</button>
            </div>
            <hr>
        `;
        container.appendChild(divEndereco);
      });

      // SE HOUVER ENDEREÇOS: Oculta o formulário de primeira e mostra o botão "Adicionar Novo"
      alternarFormulario(false);

    } else {
      // SE NÃO HOUVER ENDEREÇOS: Mostra a mensagem e o formulário para o usuário começar
      container.appendChild(msgSemEndereco);
      alternarFormulario(true);
    }

  } catch (error) {
    console.error("Erro ao listar endereços:", error);
  }
}

// ADD NOVO ENDEREÇO
// Verifica se o formulário de endereço existe antes de adicionar o listener
if (document.querySelector("#formEndereco")) {
  document.querySelector("#formEndereco").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('authToken');
    if (!token) return alert("Sua sessão expirou.");

    const cep = document.querySelector("#cep").value.replace(/\D/g, "");
    const rua = document.querySelector("#rua").value;
    const numero = document.querySelector("#numero").value;
    const complemento = document.querySelector("#complemento").value;
    const cidade = document.querySelector("#cidade").value;
    const estado = document.querySelector("#estado").value;
    const principal = document.querySelector("#principal").checked;

    try {
      const res = await fetch(`${API_URL}/enderecos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cep, rua, numero, complemento, cidade, estado, principal })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.mensagem);
        document.querySelector("#formEndereco").reset(); // Limpa o formulário
        listarEnderecos(); // Recarrega a lista

        // Esconde o formulário e mostra o botão de adicionar
        alternarFormulario(false);

      } else {
        alert("Erro ao adicionar endereço: " + data.mensagem);
      }
    } catch (error) {
      console.error("Erro de rede ao adicionar endereço:", error);
      alert("Erro de rede. Verifique sua conexão.");
    }
  });
}

// DELETA ENDEREÇO 
async function deletarEndereco(id) {
  if (!confirm("Tem certeza que deseja excluir este endereço?")) return;

  const token = localStorage.getItem('authToken');
  if (!token) return alert("Sua sessão expirou.");

  try {
    const res = await fetch(`${API_URL}/enderecos/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.mensagem);
      listarEnderecos(); // Recarrega a lista após exclusão
    } else {
      alert("Erro ao excluir: " + data.mensagem);
    }
  } catch (error) {
    console.error("Erro de rede ao deletar endereço:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  buscarDadosDoPerfil();
  listarEnderecos(); 
});

function logout() {
   localStorage.removeItem('authToken'); // Apaga o token
   window.location.href = "../Cadastro-Login/index.html"; // Redireciona para o login
}