// index.js e knex.js unidos em um unico arquivo
// ponto de entrada do servidor
const express = require('express');
const knex = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // <-- Adicione esta linha para importar o pacote cors

const app = express();

// --- Configuração CORS ---
// Adicione esta configuração ANTES de suas rotas
app.use(cors({
  origin: 'http://localhost:3001', // Permita requisições APENAS do seu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP que suas rotas usam
  credentials: true // Necessário se você estiver enviando cookies ou cabeçalhos de autorização customizados
}));
// --- Fim da Configuração CORS ---

app.use(express.json()); // Para parsear JSON no corpo da requisição

const SEGREDO = "minhasecretkey"; // Em produção, use variáveis de ambiente (.env)

// Middleware de autenticação JWT
function autenticar(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ erro: "Token não enviado" });

    try {
        const [, token] = auth.split(" ");
        const payload = jwt.verify(token, SEGREDO);
        req.usuario_id = payload.id;
        next();
    } catch (err) {
        return res.status(401).json({ erro: "Token inválido" });
    }
}

// Rota de cadastro
app.post('/signup', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Nome, email e senha são obrigatórios." });
    }

    const usuarioExistente = await knex('usuarios').where({ email }).first();
    if (usuarioExistente) {
        return res.status(400).json({ erro: "Email já cadastrado." });
    }

    const hash = await bcrypt.hash(senha, 10);
    await knex('usuarios').insert({ nome, email, senha: hash });

    res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
});

// Rota de login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    const usuario = await knex('usuarios').where({ email }).first();
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
        return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    const token = jwt.sign({ id: usuario.id }, SEGREDO, { expiresIn: '1h' });
    res.json({ token });
});

// Rota pública: listar mensagens
app.get('/mensagens', async (req, res) => {
    const mensagens = await knex('mensagens')
        .join('usuarios', 'usuarios.id', '=', 'mensagens.usuario_id')
        .select(
            'mensagens.id',
            'usuarios.nome as autor',
            'mensagens.texto',
            'mensagens.data_postagem'
        );

    res.json(mensagens);
});

// Rota protegida: criar mensagem
app.post('/mensagens', autenticar, async (req, res) => {
    const { texto } = req.body;

    if (!texto) return res.status(400).json({ erro: "Texto da mensagem é obrigatório." });

    await knex('mensagens').insert({
        usuario_id: req.usuario_id,
        texto
    });

    res.status(201).json({ mensagem: "Mensagem criada com sucesso." });
});

// Inicia o servidor
app.listen(3000, () => {
    console.log("🚀 Servidor rodando em http://localhost:3000");
});
