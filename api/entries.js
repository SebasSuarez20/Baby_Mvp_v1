// api/entries.js
let entries = []; // En memoria; para producción usa base de datos

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(entries);
  } else if (req.method === 'POST') {
    const { name, team, fileUrl } = req.body;
    if (!name || !team) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const entry = { name, team, fileUrl, timestamp: new Date().toISOString() };
    entries.push(entry);
    res.status(200).json(entry);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}