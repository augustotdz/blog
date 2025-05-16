# blog
Trabalho final DESENVOLVIMENTO MOBILE E WEB

## Augusto Teixeira Doneda Zanini

Este projeto é uma API desenvolvida com node.js, express.js e banco SQLite, com integração via knex.js. A API simula um pequeno sistema de blog, permitindo o cadastro e login de usuários, além da criação e listagem de mensagens.

Funcionalidades principais:

    Cadastro de novos usuários com senha criptografada (bcryptjs)
    Autenticação de usuários via JWT (jsonwebtoken)
    Proteção de rotas com middleware personalizado
    Criação de mensagens (somente usuários autenticados)
    Listagem pública de todas as mensagens com nome do autor e data
    Banco de dados local utilizando SQLite3 com Knex.js
