const API_URL = 'http://localhost:3000';
let card = document.querySelector(".card");
let loginButton = document.querySelector(".loginButton"); 
let cadastroButton = document.querySelector(".cadastroButton"); 
let entrarButton = document.querySelector(".entrarButton"); 
let cadastrarButton = document.querySelector(".cadastrarButton"); 
const formLogin = document.querySelector(".formLogin form");
const formCadastro = document.querySelector(".formCadastro form");

// Função auxiliar para exibir feedback temporário ao usuário
function displayMessage(formElement, message, isSuccess = false) {
  let msgElement = formElement.querySelector('.feedback-message');
  if (!msgElement) {
      msgElement = document.createElement('p');
      msgElement.classList.add('feedback-message', 'mt-4');
      // Adiciona a mensagem logo antes do botão do formulário
      formElement.insertBefore(msgElement, formElement.querySelector('button')); 
  }
  
  msgElement.textContent = message;
  // Estilos css dos botões de erro
  msgElement.style.fontWeight = '500';
  msgElement.style.padding = '15px';
  msgElement.style.width = '100%';
  msgElement.style.textAlign = 'center';
  msgElement.style.backgroundColor = isSuccess ? '#D4EDDA' : '#F8D7DA'; 
  msgElement.style.color = isSuccess ? '#155724' : '#721C24'; 
  msgElement.style.borderRadius = '10px';
  msgElement.style.fontSize = '14px';

  // Remove a mensagem após 4 segundos
  setTimeout(() => {
      msgElement.remove();
  }, 4000);
}

// Adiciona um evento de clique ao botão de login (Troca visual)
loginButton.onclick = () => {
  card.classList.remove("cadastroActive"); //remove a class so cadastro e vai pro login 
  card.classList.add("loginActive"); 
};

// Adiciona um evento de clique ao botão de cadastro (Troca visual)
cadastroButton.onclick = () => {
  card.classList.remove("loginActive"); //remove a class so login e vai pro cadastro 
  card.classList.add("cadastroActive");
};

// Função para sair
function Sair() {
  window.location.href = "../index.html"; // Volta paara a tela inicial
}

// CADASTRO 
// Função auxiliar para exibir feedback temporário ao usuário
function displayMessage(formElement, message, isSuccess = false) {
  let msgElement = formElement.querySelector('.feedback-message');
  if (!msgElement) {
      msgElement = document.createElement('p');
      msgElement.classList.add('feedback-message', 'mt-4');
      formElement.insertBefore(msgElement, formElement.querySelector('button')); 
  }
  
  msgElement.textContent = message;
  msgElement.style.fontWeight = '500';
  msgElement.style.padding = '15px';
  msgElement.style.width = '100%';
  msgElement.style.textAlign = 'center';
  msgElement.style.backgroundColor = isSuccess ? '#D4EDDA' : '#F8D7DA'; 
  msgElement.style.color = isSuccess ? '#155724' : '#721C24'; 
  msgElement.style.borderRadius = '10px';
  msgElement.style.fontSize = '14px';

  setTimeout(() => {
      msgElement.remove();
  }, 4000);
}

// Botões para trocar visual entre login e cadastro
loginButton.onclick = () => {
  card.classList.remove("cadastroActive");
  card.classList.add("loginActive"); 
};
cadastroButton.onclick = () => {
  card.classList.remove("loginActive");
  card.classList.add("cadastroActive");
};

// Função para sair
function Sair() {
  window.location.href = "../index.html";
}

// CADASTRO
cadastrarButton.onclick = async () => {
  const inputs = formCadastro.querySelectorAll('input');
  const nome = inputs[0].value.trim();
  const email = inputs[2].value.trim();
  const senha = inputs[3].value;
  const confirmaSenha = inputs[4].value;
  const cpfRaw = inputs[1].value.trim();
  const cpf = cpfRaw.replace(/\D/g, ''); 

  // Valida campos
  if (!nome || !cpf || !email || !senha || !confirmaSenha) {
    displayMessage(formCadastro, 'Preencha todos os campos!', false);
    return; 
  }
  if (cpf.length !== 11) {
    displayMessage(formCadastro, 'CPF deve conter 11 números.', false);
    return;
  }
  // Validação simples de email
  if (!/\S+@\S+\.\S+/.test(email)) {
    displayMessage(formCadastro, 'E-mail inválido.', false);
    return;
  }
  if (senha !== confirmaSenha) {
    displayMessage(formCadastro, 'As senhas não coincidem!', false);
    return;
  }

  const dadosCadastro = { nome, cpf, email, senha };

  try {
    const response = await fetch(`${API_URL}/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosCadastro),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      displayMessage(formCadastro, data.mensagem + ' Redirecionando...', true);
      setTimeout(() => {
        window.location.href = "../Usuario/usuario.html";
      }, 1500);
    } else {
      displayMessage(formCadastro, data.mensagem, false);
    }
  } catch (error) {
    displayMessage(formCadastro, 'Erro de conexão.', false);
    console.error('Erro de rede/servidor:', error);
  }
};

// LOGIN
entrarButton.onclick = async () => {
  const inputs = formLogin.querySelectorAll('input');
  const email = inputs[0].value.trim();
  const senha = inputs[1].value;

  if (!email || !senha) {
    displayMessage(formLogin, 'Preencha e-mail e senha.', false);
    return; 
  }

  const dadosLogin = { email, senha };

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosLogin),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      displayMessage(formLogin, data.mensagem + ' Redirecionando...', true);
      setTimeout(() => {
        window.location.href = "../Usuario/usuario.html";
      }, 1500);
    } else {
      displayMessage(formLogin, data.mensagem, false);
    }
  } catch (error) {
    displayMessage(formLogin, 'Erro de conexão.', false);
    console.error('Erro de rede/servidor:', error);
  }
};
