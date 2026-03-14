import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configura AWS S3 (agrega tus credenciales para probar uploads)
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'TU_ACCESS_KEY',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'TU_SECRET_KEY',
  region: 'us-east-1'
});
const s3 = new AWS.S3();

const upload = multer({ storage: multer.memoryStorage(),limits: {
    fileSize: 100 * 1024 * 1024
  } });

// API para subir archivos a S3
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const team = req.body.team || "otros";
    const name = req.body.name || "anonimo";

    const safeName = name.replace(/[^a-zA-Z0-9]/g, "_");

    const ext = req.file.originalname.split('.').pop();

    const fileName = `${safeName}_${Date.now()}.${ext}`;

    const key = `${team}/${fileName}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read"
    };

    const data = await s3.upload(params).promise();

    res.json({
      url: data.Location,
      key: key
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API para obtener entradas
let entries = [];
app.get('/api/entries', (req, res) => res.json(entries));
app.post('/api/entries', (req, res) => {
  const { name, team, fileUrl } = req.body;
  if (!name || !team) return res.status(400).json({ error: 'Missing fields' });
  const entry = { name, team, fileUrl, timestamp: new Date().toISOString() };
  entries.push(entry);
  res.status(200).json(entry);
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

function startServer(port = DEFAULT_PORT, maxTries = 5) {
  const server = app.listen(port,"0.0.0.0", () => {
    console.log(`Servidor local en http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxTries > 0) {
      console.warn(`Puerto ${port} en uso. Probando el siguiente puerto...`);
      startServer(port + 1, maxTries - 1);
    } else {
      console.error('Error al iniciar el servidor:', err);
      process.exit(1);
    }
  });
}

startServer();