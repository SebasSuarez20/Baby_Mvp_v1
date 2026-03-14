// api/upload.js
import AWS from 'aws-sdk';
import multer from 'multer';
import { promisify } from 'util';

// Configura AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1' // Cambia si es necesario
});
const s3 = new AWS.S3();

// Multer para manejar archivos
const upload = multer({ storage: multer.memoryStorage() });
const uploadMiddleware = promisify(upload.single('file'));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Procesar el archivo con multer
    await uploadMiddleware(req, res);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME || 'tu-bucket-s3', // Usa variable de entorno
      Key: `uploads/${Date.now()}-${req.file.originalname}`,
      Body: req.file.buffer,
      ACL: 'public-read'
    };

    const data = await s3.upload(params).promise();
    res.status(200).json({ url: data.Location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Deshabilitar bodyParser para multer
  },
};