const express = require("express");
const knex = require("knex");
const cors = require("cors");

const app = express();


app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173", // front (webpack)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


const db = knex({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    user: "root",
    password: "root",
    database: "agendamento_db"
  }
});

/* =========================
   🔐 LOGIN (SIMPLES)
========================= */
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await db("usuario")
      .where({ email, senha })
      .first();

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário inválido" });
    }

    // 🔥 token simples (depois pode usar JWT)
    res.json({
      mensagem: "Login OK",
      token: "token_fake_123"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro no servidor" });
  }
});

/* =========================
   👤 MODELO
========================= */
app.post("/modelos", async (req, res) => {
  const { nome, telefone, senha } = req.body;

  try {
    const [id] = await db("modelo").insert({
      nome,
      telefone,
      senha,
      data_cadastro: new Date(),
      data_atualizacao: new Date()
    });

    res.json({ id, mensagem: "Modelo cadastrado!" });

  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/modelos", async (req, res) => {
  const dados = await db("modelo");
  res.json(dados);
});

app.put("/modelos/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, telefone } = req.body;

  await db("modelo")
    .where({ id_modelo_pk: id })
    .update({
      nome,
      telefone,
      data_atualizacao: new Date()
    });

  res.json({ mensagem: "Atualizado com sucesso!" });
});

/* =========================
   💅 SERVIÇOS
========================= */
app.get("/servicos", async (req, res) => {
  const dados = await db("servicos");
  res.json(dados);
});

/* =========================
   📅 AGENDAMENTO
========================= */
app.post("/agendamentos", async (req, res) => {
  const {
    id_modelo_fk,
    id_servico_fk,
    data_agendamento,
    horario_agendamento
  } = req.body;

  try {
    // 🔥 VALIDAÇÃO
    if (!id_modelo_fk || !id_servico_fk || !data_agendamento || !horario_agendamento) {
      return res.status(400).json({ mensagem: "Dados incompletos!" });
    }

    // 🔥 LIMITE POR DIA
    const limite = 5;

    const total = await db("agendamento")
      .where({ data_agendamento })
      .count("id_agendamento_pk as total");

    if (total[0].total >= limite) {
      return res.status(400).json({
        mensagem: "Limite de agendamentos atingido para este dia!"
      });
    }

    await db("agendamento").insert({
      id_modelo_fk,
      id_servico_fk,
      data_agendamento,
      horario_agendamento,
      status_agendamento: true
    });

    res.json({ mensagem: "Agendamento realizado com sucesso!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

/* =========================
   📋 LISTAS
========================= */

// simples
app.get("/agendamentos", async (req, res) => {
  const dados = await db("agendamento");
  res.json(dados);
});

// detalhado (USADO NO FRONT)
app.get("/agendamentos/detalhado", async (req, res) => {
  const dados = await db("agendamento as a")
    .leftJoin("modelo as m", "a.id_modelo_fk", "m.id_modelo_pk")
    .leftJoin("servicos as s", "a.id_servico_fk", "s.id_servico_pk")
    .select(
      "a.id_agendamento_pk",
      "m.nome",
      "s.nome_servico",
      "a.data_agendamento",
      "a.horario_agendamento"
    );

  res.json(dados);
});

/* =========================
   🔄 UPDATE
========================= */
app.put("/agendamentos/:id", async (req, res) => {
  const { id } = req.params;

  await db("agendamento")
    .where({ id_agendamento_pk: id })
    .update(req.body);

  res.json({ mensagem: "Agendamento atualizado!" });
});

/* =========================
   ❓ FAQ
========================= */
app.get("/faq", async (req, res) => {
  const dados = await db("perguntas_frequentes");
  res.json(dados);
});

/* =========================
   🚀 SERVIDOR
========================= */
app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});