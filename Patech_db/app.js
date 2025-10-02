const express = require("express");
const { Pool, Client } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://127.0.0.1:5500",  // certifique-se que o front usa exatamente este endereço
    credentials: true,
  })
);

// Função para criar banco se não existir
async function criarBancoSeNaoExistir(dbName) {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    database: "postgres",
  });

  try {
    await client.connect();
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Banco "${dbName}" criado com sucesso.`);
    } else {
      console.log(`Banco "${dbName}" já existe.`);
    }
  } catch (err) {
    console.error("Erro ao criar banco:", err);
    throw err;
  } finally {
    await client.end();
  }
}

let pool;

(async () => {
  try {
    await criarBancoSeNaoExistir(process.env.DB_DATABASE);

    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
    });

    await pool.connect();
    console.log("Conectado ao PostgreSQL!");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS Usuarios (
        id_usuario SERIAL PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        cpf VARCHAR(11) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL
      );
    `);
    console.log("Tabela Usuarios criada ou já existia.");

    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Erro fatal:", err);
    process.exit(1);
  }
})();

const JWT_SECRET = process.env.JWT_SECRET || "um_segredo_bem_forte";

function autenticarToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ mensagem: "Não autenticado" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ mensagem: "Token inválido" });
  }
}

// --- ROTA DE CADASTRO ---
app.post("/cadastro", async (req, res) => {
  console.log("Requisição /cadastro recebida com corpo:", req.body);

  const { nome, cpf, email, senha } = req.body;

  // Validações básicas
  if (!nome || !cpf || !email || !senha) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });
  }

  if (typeof cpf !== "string" || cpf.length !== 11) {
    return res.status(400).json({ mensagem: "CPF deve conter 11 caracteres." });
  }

  // Opcional: remover espaços e caracteres não numéricos do CPF
  const cpfLimpo = cpf.replace(/\D/g, "");
  if (cpfLimpo.length !== 11) {
    return res.status(400).json({ mensagem: "CPF inválido. Deve conter 11 números." });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);

    const query = `
      INSERT INTO Usuarios (nome, cpf, email, senha)
      VALUES ($1, $2, $3, $4)
      RETURNING id_usuario, nome, email;
    `;
    const values = [nome.trim(), cpfLimpo, email.trim().toLowerCase(), senhaHash];

    console.log("Executando query de cadastro:", query, values);

    const result = await pool.query(query, values);

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      usuario: result.rows[0],
    });
  } catch (error) {
    console.error("Erro no cadastro:", error);

    if (error.code === "23505") {
      return res.status(409).json({ mensagem: "E-mail ou CPF já cadastrado." });
    }

    return res.status(500).json({ mensagem: "Erro do servidor." });
  }
});

// --- ROTA DE LOGIN ---
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "E-mail e senha são obrigatórios." });
  }

  try {
    const query = "SELECT id_usuario, nome, senha FROM Usuarios WHERE email = $1";
    const result = await pool.query(query, [email.trim().toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ mensagem: "E-mail ou senha inválidos." });
    }

    const usuario = result.rows[0];
    const match = await bcrypt.compare(senha, usuario.senha);

    if (!match) {
      return res.status(401).json({ mensagem: "E-mail ou senha inválidos." });
    }

    const token = jwt.sign({ id: usuario.id_usuario }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      usuario: { id: usuario.id_usuario, nome: usuario.nome },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
});

// -- Outras rotas omitidas para brevidade, mas mantenha as que você já tem --

// Rota de teste para verificar conexão com banco
app.get("/teste-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ agora: result.rows[0].now });
  } catch (error) {
    console.error("Erro na conexão com DB:", error);
    res.status(500).json({ mensagem: "Erro na conexão com DB" });
  }
});
