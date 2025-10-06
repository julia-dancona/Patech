const express = require("express");
const { Pool, Client } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config(); // Garante que o .env seja carregado

const app = express();
const port = 3000;

// Middlewares 
app.use(express.json()); // JSON no corpo da requisição
app.use(cookieParser()); // cookies
app.use(
    cors({
        origin: "http://127.0.0.1:5500", // Comunicação com o front-end
        credentials: true,
    })
);

// Configuração do Banco de DadoS
async function criarBancoSeNaoExistir(dbName) {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
        database: "postgres", // Conecta ao banco padrão para criar o seu
    });

    try {
        await client.connect();
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Banco "${dbName}" criado.`);
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

        // Criação e Atualização de Tabelas
        // 1. Tabela Usuarios (COM TODOS OS CAMPOS DO PERFIL)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Usuarios (
                id_usuario SERIAL PRIMARY KEY,
                nome VARCHAR(150) NOT NULL,
                cpf VARCHAR(11) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                telefone VARCHAR(20),
                data_nascimento DATE,
                foto_perfil_url TEXT
            );
        `);
        
        // 2. Tabela Enderecos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Enderecos (
                id_endereco SERIAL PRIMARY KEY,
                usuario_id INT REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
                cep VARCHAR(9) NOT NULL,
                rua VARCHAR(255) NOT NULL,
                numero VARCHAR(20),
                complemento VARCHAR(100),
                cidade VARCHAR(100) NOT NULL,
                estado CHAR(2) NOT NULL,
                principal BOOLEAN DEFAULT FALSE,
                UNIQUE (usuario_id, cep, numero)
            );
        `);

        // 3. Tabela Favoritos
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Favoritos (
                id_favorito SERIAL PRIMARY KEY,
                usuario_id INT REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
                item_tipo VARCHAR(50) NOT NULL,
                item_referencia VARCHAR(50) NOT NULL,
                data_favoritado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (usuario_id, item_tipo, item_referencia)
            );
        `);

        app.listen(port, () => console.log(`Servidor rodando em http://localhost:${port}`));
    } catch (err) {
        console.error("Erro fatal na inicialização:", err);
        process.exit(1);
    }
})();

const JWT_SECRET = process.env.JWT_SECRET || "um_segredo_bem_forte";

// --- Middleware de autenticação ---
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Pega o valor após "Bearer "

    if (!token) return res.status(401).json({ mensagem: "Não autenticado" });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch {
        return res.status(401).json({ mensagem: "Token inválido" });
    }
}

// AUTENTICAÇÃO
// Cadastro
app.post("/cadastro", async (req, res) => {
    const { nome, cpf, email, senha } = req.body;
    if (!nome || !cpf || !email || !senha)
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." });

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11)
        return res.status(400).json({ mensagem: "CPF inválido. Deve conter 11 números." });

    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        const result = await pool.query(
            `INSERT INTO Usuarios (nome, cpf, email, senha) VALUES ($1,$2,$3,$4) RETURNING id_usuario, nome, email`,
            [nome.trim(), cpfLimpo, email.trim().toLowerCase(), senhaHash]
        );

        return res.status(201).json({ mensagem: "Usuário cadastrado!", usuario: result.rows[0] });
    } catch (error) {
        if (error.code === "23505") return res.status(409).json({ mensagem: "E-mail ou CPF já cadastrado." });
        return res.status(500).json({ mensagem: "Erro do servidor." });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ mensagem: "E-mail e senha obrigatórios." });

    try {
        const result = await pool.query("SELECT id_usuario, nome, senha FROM Usuarios WHERE email=$1", [
            email.trim().toLowerCase(),
        ]);
        if (result.rows.length === 0) return res.status(401).json({ mensagem: "E-mail ou senha inválidos." });

        const usuario = result.rows[0];
        const match = await bcrypt.compare(senha, usuario.senha);
        if (!match) return res.status(401).json({ mensagem: "E-mail ou senha inválidos." });

        const token = jwt.sign({ id: usuario.id_usuario }, JWT_SECRET, { expiresIn: "7d" });

        // Retorna o token no JSON
        return res.json({ 
            mensagem: "Login realizado!", 
            usuario: { id: usuario.id_usuario, nome: usuario.nome },
            token: token // <--- AGORA VEM NO CORPO DA RESPOSTA!
        });
    } catch {
        return res.status(500).json({ mensagem: "Erro interno do servidor." });
    }
});

// ROTAS DE PERFIL
// GET - Visualizar as informações de perfil do usuário logado
app.get("/perfil", autenticarToken, async (req, res) => {
    try {
        const result = await pool.query(
            // AGORA BUSCA APENAS OS CAMPOS BÁSICOS
            "SELECT nome, email, cpf FROM Usuarios WHERE id_usuario = $1", 
            [req.userId] 
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ mensagem: "Perfil não encontrado." });
        }

        const perfil = result.rows[0];
        // Note que o JSON retornado (perfil) agora só terá { nome, email, cpf }
        return res.status(200).json({ perfil });

    } catch (error) {
        console.error("Erro ao buscar perfil:", error); 
        return res.status(500).json({ mensagem: "Erro interno ao buscar perfil." });
    }
});

// PUT - Editar informações do perfil
app.put("/perfil", autenticarToken, async (req, res) => {
    // Agora só precisamos do nome
    const { nome } = req.body; 

    if (!nome) {
        return res.status(400).json({ mensagem: "O nome é obrigatório." });
    }

    try {
        await pool.query(
            // AGORA SÓ ATUALIZA O NOME
            `UPDATE Usuarios
             SET nome = $1
             WHERE id_usuario = $2`,
            [nome.trim(), req.userId]
        );

        return res.json({ mensagem: "Perfil atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return res.status(500).json({ mensagem: "Erro interno ao atualizar perfil." });
    }
});

// ENDEREÇO
// GET /enderecos - Listar todos os endereços do usuário
app.get("/enderecos", autenticarToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id_endereco, cep, rua, numero, complemento, cidade, estado, principal
             FROM Enderecos
             WHERE usuario_id = $1
             ORDER BY principal DESC, id_endereco DESC`,
            [req.userId]
        );
        return res.json({ enderecos: result.rows });
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao listar endereços." });
    }
});

// POST - Adicionar novo endereço
app.post("/enderecos", autenticarToken, async (req, res) => {
    const { cep, rua, numero, complemento, cidade, estado, principal = false } = req.body;
    
    if (!cep || !rua || !cidade || !estado) {
        return res.status(400).json({ mensagem: "CEP, rua, cidade e estado são obrigatórios." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO Enderecos (usuario_id, cep, rua, numero, complemento, cidade, estado, principal)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id_endereco`,
            [req.userId, cep, rua, numero, complemento, cidade, estado, principal]
        );
        return res.status(201).json({ mensagem: "Endereço adicionado!", id: result.rows[0].id_endereco });
    } catch (error) {
        if (error.code === "23505") {
             return res.status(409).json({ mensagem: "Você já cadastrou um endereço com este CEP e Número." });
        }
        console.error("Erro ao adicionar endereço:", error);
        return res.status(500).json({ mensagem: "Erro interno ao adicionar endereço." });
    }
});

// PUT - Editar um endereço existente
app.put("/enderecos/:id_endereco", autenticarToken, async (req, res) => {
    const { id_endereco } = req.params;
    const { cep, rua, numero, complemento, cidade, estado, principal } = req.body;

    if (!cep || !rua || !cidade || !estado) {
        return res.status(400).json({ mensagem: "CEP, rua, cidade e estado são obrigatórios." });
    }

    try {
        const result = await pool.query(
            `UPDATE Enderecos
             SET cep = $1, rua = $2, numero = $3, complemento = $4, cidade = $5, estado = $6, principal = $7
             WHERE id_endereco = $8 AND usuario_id = $9
             RETURNING id_endereco`,
            [cep, rua, numero, complemento, cidade, estado, principal, id_endereco, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: "Endereço não encontrado ou não pertence a você." });
        }
        return res.json({ mensagem: "Endereço atualizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao atualizar endereço:", error);
        return res.status(500).json({ mensagem: "Erro interno ao atualizar endereço." });
    }
});

// DELETE - Excluir um endereço
app.delete("/enderecos/:id_endereco", autenticarToken, async (req, res) => {
    const { id_endereco } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM Enderecos
             WHERE id_endereco = $1 AND usuario_id = $2
             RETURNING id_endereco`,
            [id_endereco, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: "Endereço não encontrado ou não pertence a você." });
        }
        return res.json({ mensagem: "Endereço excluído com sucesso." });
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao excluir endereço." });
    }
});

// FAVORITOS
// GET - Listar favoritos do usuário
app.get("/favoritos", autenticarToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id_favorito, item_tipo, item_referencia, data_favoritado
             FROM Favoritos
             WHERE usuario_id = $1
             ORDER BY data_favoritado DESC`,
            [req.userId]
        );
        return res.json({ favoritos: result.rows });
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao listar favoritos." });
    }
});

// POST - Adicionar um item aos favoritos
app.post("/favoritos", autenticarToken, async (req, res) => {
    const { item_tipo, item_referencia } = req.body;
    if (!item_tipo || !item_referencia) {
        return res.status(400).json({ mensagem: "Tipo e referência do item são obrigatórios." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO Favoritos (usuario_id, item_tipo, item_referencia)
             VALUES ($1, $2, $3)
             RETURNING id_favorito`,
            [req.userId, item_tipo, item_referencia]
        );
        return res.status(201).json({ mensagem: "Item adicionado aos favoritos.", id: result.rows[0].id_favorito });
    } catch (error) {
        if (error.code === "23505") { // Código para violação de UNIQUE constraint
            return res.status(409).json({ mensagem: "Este item já está nos seus favoritos." });
        }
        console.error("Erro ao adicionar favorito:", error);
        return res.status(500).json({ mensagem: "Erro interno ao adicionar favorito." });
    }
});

// DELETE - Remover um favorito
app.delete("/favoritos/:id_favorito", autenticarToken, async (req, res) => {
    const { id_favorito } = req.params;
    try {
        const result = await pool.query(
            `DELETE FROM Favoritos
             WHERE id_favorito = $1 AND usuario_id = $2
             RETURNING id_favorito`,
            [id_favorito, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ mensagem: "Favorito não encontrado ou você não tem permissão." });
        }
        return res.json({ mensagem: "Favorito removido." });
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao remover favorito." });
    }
});