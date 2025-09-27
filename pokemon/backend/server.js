import express from 'express';
import pkg from 'pg';
import cors from 'cors';

const { Pool } = pkg;

const app = express();
const PORT = 5000;

// Enable CORS for React frontend
app.use(cors());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokedex',
  password: 'Stamata35',
  port: 5432,
});

// GET Pokémon by ID
app.get('/pokemon/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM pokemon WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET multiple Pokémon by range (for generations)
app.get('/pokemon-range/:start/:end', async (req, res) => {
  const start = parseInt(req.params.start);
  const end = parseInt(req.params.end);

  try {
    const result = await pool.query(
      'SELECT * FROM pokemon WHERE id BETWEEN $1 AND $2 ORDER BY id ASC',
      [start, end]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
