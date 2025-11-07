import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const BRANCH = "main";

app.get("/api/pdfs", async (req, res) => {
  try {
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json"
    };

    const urlBase = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;
    const pastasResp = await axios.get(`${urlBase}?ref=${BRANCH}`, { headers });
    const pastas = pastasResp.data;

    const pdfs = [];

    for (const pasta of pastas) {
      if (pasta.type !== "dir") continue;

      const arqsResp = await axios.get(`${urlBase}/${encodeURIComponent(pasta.name)}?ref=${BRANCH}`, { headers });
      const arquivos = arqsResp.data;

      const instrumentos = arquivos
        .filter(a => a.name.toLowerCase().endsWith(".pdf"))
        .map(a => ({
          name: a.name.replace(/\.pdf$/i, ""),
          url: `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/${encodeURIComponent(pasta.name)}/${encodeURIComponent(a.name)}`
        }));

      if (instrumentos.length > 0) {
        pdfs.push({
          nome: pasta.name.replace(/ - PDF's$/i, ""),
          instrumentos
        });
      }
    }

    res.json(pdfs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar PDFs." });
  }
});

app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));


