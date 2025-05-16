// Área para criação das tabelas do banco de dados
const knex = require('./db');

async function criarTabelas() {
  const existeUsuarios = await knex.schema.hasTable('usuarios');
  if (!existeUsuarios) {
    await knex.schema.createTable('usuarios', table => {
      table.increments('id');
      table.string('nome');
      table.string('email').unique();
      table.string('senha');
    });
    console.log("Tabela 'usuarios' criada.");
  }

  const existeMensagens = await knex.schema.hasTable('mensagens');
  if (!existeMensagens) {
    await knex.schema.createTable('mensagens', table => {
      table.increments('id');
      table.integer('usuario_id').references('id').inTable('usuarios');
      table.text('texto');
      table.timestamp('data_postagem').defaultTo(knex.fn.now());
    });
    console.log("Tabela 'mensagens' criada.");
  }

  await knex.destroy();
}

criarTabelas();