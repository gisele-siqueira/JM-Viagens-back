//app.js
const { MongoClient, ObjectId } = require("mongodb");
async function connect() {
  if (global.db) return global.db;
  const conn = await MongoClient.connect(
    "mongodb+srv://giselecostasiqueira79:snoopy79gis@cluster0.9j1ne18.mongodb.net/?retryWrites=true&w=majority"
  );
  if (!conn) return new Error("Can't connect");
  global.db = await conn.db("unifor");
  return global.db;
}

const express = require("express");
const app = express();
const port = 3000; //porta padrão

app.use(require("cors")());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//definindo as rotas
const router = express.Router();

router.get("/", (req, res) =>
  res.json({ message: "Funcionando, SHOW DE BOLA!" })
);

// GET dog
router.get("/dog", async function (req, res, next) {
  try {
    const apidog = await fetch("https://dog.ceo/api/breed/hound/list");
    res.json(await apidog.json());
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

/* GET aluno */
router.get("/aluno/:id?", async function (req, res, next) {
  try {
    const db = await connect();
    if (req.params.id)
      res.json(
        await db
          .collection("aluno")
          .findOne({ _id: new ObjectId(req.params.id) })
      );
    else res.json(await db.collection("aluno").find().toArray());
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});


// POST /aluno
router.post("/aluno", async function (req, res, next) {
  try {
    const aluno = req.body;
    const db = await connect();
    res.json(await db.collection("aluno").insertOne(aluno));
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

// PUT /aluno/{id}
router.put("/aluno/:id", async function (req, res, next) {
  try {
    const aluno = req.body;
    const db = await connect();
    res.json(
      await db
        .collection("aluno")
        .updateOne({ _id: new ObjectId(req.params.id) }, { $set: aluno })
    );
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

// DELETE /aluno/{id}
router.delete("/aluno/:id", async function (req, res, next) {
  try {
    const db = await connect();
    res.json(
      await db
        .collection("aluno")
        .deleteOne({ _id: new ObjectId(req.params.id) })
    );
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

// POST Rota para o cadastro de usuário
router.post("/cadastro", async (req, res) => {
  // Obtenha os dados do usuário a partir do corpo da requisição
  const { nome, username, senha, email, endereco, pais, estado, cep } =
    req.body;

  // Crie um objeto com os dados do usuário
  const usuario = {
    nome,
    username,
    senha,
    email,
    endereco,
    pais,
    estado,
    cep,
  };

  try {
    const db = await connect();
    const result = await db.collection("cadastro").insertOne(usuario);
    res.json(result);
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
});

// PUT - Atualização cadastro
router.put("/atualizar-usuario", async (req, res) => {
  const {emailalterar, updateEndereco, updateSenha } = req.body;
  

  try {
    const db = await connect();
    const collection = db.collection("cadastro");

    const result = await collection.updateOne(
      { email: emailalterar },
      { $set: { endereco: updateEndereco, senha: updateSenha } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json({ message: "Usuário atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
});

module.exports = router;

//GET Usuario cadastrado
router.get("/listacadastrados", async function (req, res, next) {
  try {
    const db = await connect();

    const cadastrados = await db.collection("cadastro").find();
    const listaCadastrados = [];
    for await (const cadastrado of cadastrados ) {
      listaCadastrados.push(cadastrado);
    }
    return res.json(listaCadastrados);
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

//Delete de usuario cadastrado
router.delete("/deletarusuario/:email", async function (req, res, next) {
  const { email } = req.params;

  try {
    const db = await connect();

    const result = await db
      .collection("cadastro")
      .findOne({ email:email }, {});

    if (!result) {
      return res.status(404).json({ message: "Usuario não encontrado" });
    }

    await db.collection("cadastro").deleteOne({ email:email });

    return res.status(204).json({message:"Usuário deletado"});
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

//Post login

router.post("/login", async (req, res) => {
  // Obtenha os dados do usuário a partir do corpo da requisição
  const { senha, email } = req.body;

  try {
    const db = await connect();

    const result = await db
      .collection("cadastro")
      .findOne({ email: email }, {});

    if (!result) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (result.senha !== senha) {
      return res.status(401).json({ message: "Senha incorreta" });
    }

    // const result = await db.collection("cadastro").insertOne(usuario);
    return res.status(200).json(result);
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ erro: "Erro ao cadastrar usuário" });
  }
});

//GET Pacotes
router.get("/pacotes", async function (req, res, next) {
  try {
    const db = await connect();

    const pacotes = await db.collection("pacotes").find();
    const listaPacotes = [];
    for await (const pacote of pacotes) {
      listaPacotes.push(pacote);
    }
    return res.json(listaPacotes);
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

// DELETE /pacotes/{id}
router.delete("/pacotes/:id", async function (req, res, next) {
  const { id } = req.params;

  try {
    const db = await connect();

    const result = await db
      .collection("pacotes")
      .findOne({ _id: new ObjectId(id) }, {});

    if (!result) {
      return res.status(404).json({ message: "Pacote não encontrado" });
    }

    await db.collection("pacotes").deleteOne({ _id: new ObjectId(id) });

    return res.status(204).json();
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

// POST Pacotes
router.post("/inserirpacotes", async function (req, res, next) {
  try {
    const novoPacote = req.body; // Obtém o novo pacote enviado no corpo da requisição
    const db = await connect();

    // Insere o novo pacote na coleção "pacotes"
    const resultado = await db.collection("pacotes").insertOne(novoPacote);

    if (resultado.insertedCount === 1) {
      // Sucesso ao inserir o pacote
      return res.status(201).json({ mensagem: "Pacote cadastrado com sucesso!" });
    } else {
      // Falha ao inserir o pacote
      return res.status(500).json({ erro: "Ocorreu um erro ao cadastrar o pacote." });
    }
  } catch (ex) {
    console.log(ex);
    res.status(400).json({ erro: `${ex}` });
  }
});

//PUT Pacotes
// PUT Atualizar Pacotes
router.put("/atualizarpacotes", async (req, res) => {
  const { nomealterar, updateOrigem, updateData } = req.body;

  try {
    const db = await connect();
    const collection = db.collection("pacotes");

    const result = await collection.updateOne(
      { nome: nomealterar },
      { $set: { origem: updateOrigem, data: updateData } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Pacote não encontrado" });
    }

    res.status(200).json({ message: "Pacote atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar pacote:", error);
    res.status(500).json({ message: "Erro ao atualizar pacote" });
  }
});



app.use("/", router);

//inicia o servidor
app.listen(port);
console.log("API funcionando!");
