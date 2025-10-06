const API_URL = 'http://127.0.0.1:3000';
let card = document.querySelector(".card");
let loginButton = document.querySelector(".loginButton");
let cadastroButton = document.querySelector(".cadastroButton");
let entrarButton = document.querySelector(".entrarButton");
let cadastrarButton = document.querySelector(".cadastrarButton");
const formLogin = document.querySelector(".formLogin form");
const formCadastro = document.querySelector(".formCadastro form");

// AUXILIAR
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
  }, 7000);
}

function Sair() {
  window.location.href = "../index.html";
}

loginButton.onclick = () => {
  card.classList.remove("cadastroActive");
  card.classList.add("loginActive");
};

cadastroButton.onclick = () => {
  card.classList.remove("loginActive");
  card.classList.add("cadastroActive");
};

// CADASTRO
cadastrarButton.onclick = async () => {
  const inputs = formCadastro.querySelectorAll('input');
  const nome = inputs[0].value.trim();
  const email = inputs[2].value.trim();
  const senha = inputs[3].value;
  const confirmaSenha = inputs[4].value;
  const cpfRaw = inputs[1].value.trim();
  const cpf = cpfRaw.replace(/\D/g, '');

  // Validações...
  if (!nome || !cpf || !email || !senha || !confirmaSenha) {
    displayMessage(formCadastro, 'Preencha todos os campos!', false);
    return;
  }
  if (cpf.length !== 11) {
    displayMessage(formCadastro, 'CPF deve conter 11 números.', false);
    return;
  }
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
      // REMOVIDO: credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      // Se o seu BACK-END for ajustado para retornar o token no cadastro, descomente a linha abaixo.
      // localStorage.setItem('authToken', data.token); 

      displayMessage(formCadastro, data.mensagem + ' Redirecionando...', true);

      // Redireciona para o login (OU PODE REDIRECIONAR DIRETO PARA USUARIO.HTML se o back-end retornar o token)
      setTimeout(() => {
        window.location.href = "../Usuario/usuario.html";
      }, 1500); // Padronizado para 1.5s

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
      // REMOVIDO: credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      // SALVA O TOKEN NO LOCAL STORAGE
      localStorage.setItem('authToken', data.token);

      displayMessage(formLogin, data.mensagem + ' Redirecionando...', true);
      setTimeout(() => {
        window.location.href = "../Usuario/usuario.html";
      }, 1500); // Padronizado para 1.5s
    } else {
      displayMessage(formLogin, data.mensagem, false);
    }
  } catch (error) {
    displayMessage(formLogin, 'Erro de conexão.', false);
    console.error('Erro de rede/servidor:', error);
  }
};