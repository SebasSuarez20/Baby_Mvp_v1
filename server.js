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

const upload = multer({ storage: multer.memoryStorage() });

// API para subir archivos a S3
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const params = {
    Bucket: process.env.S3_BUCKET_NAME || 'tu-bucket-s3',
    Key: `uploads/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ACL: 'public-read'
  };

  s3.upload(params, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ url: data.Location });
  });
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
  const server = app.listen(port, () => {
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