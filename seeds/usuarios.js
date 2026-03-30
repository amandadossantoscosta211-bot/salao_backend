/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */

const bcrypt = require('bcrypt')

exports.seed = async function(knex) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"
  const senha_hash = await bcrypt.hash(ADMIN_PASSWORD, 8)
  // Deletes ALL existing entries
  await knex('usuario').del()
  await knex('usuario').insert([
    {nome: "Admin", email: "admin@email.com", senha: senha_hash }
  ]);
};
