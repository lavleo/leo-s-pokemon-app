import fetch from 'node-fetch';
import pkg from 'pg';
const { Pool } = pkg;

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pokedex',
  password: 'Stamata35',
  port: 5432,
});

// Helper: fetch JSON
const fetchJSON = async (url) => {
  const res = await fetch(url);
  return await res.json();
};

// Map generation to main game for sprite
const genMainGame = {
  1: "red",              // Gen1 → Red / FireRed / LeafGreen
  2: "heartgold",        // Gen2 → SoulSilver / HeartGold
  3: "emerald",           // Gen3 → Ruby / Sapphire / Emerald
  4: "platinum",         // Gen4 → Diamond / Pearl / Platinum
  5: "black-2",          // Gen5 → Black / White / Black2 / White2
  // Gen6+ just pick default sprite
};

const seedPokemon = async (id) => {
  try {
    const data = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const species = await fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${id}`);

    const generationNumber = species.generation.url.match(/generation\/(\d+)/)[1];

    let frontSprite = data.sprites.front_default;
    let shinySprite = data.sprites.front_shiny;

    // Try to get generation-specific sprite
    if (genMainGame[generationNumber]) {
      const game = genMainGame[generationNumber];
      const genSprites = data.sprites.versions;
      // Loop through generations to find the sprite
      for (let gen in genSprites) {
        if (genSprites[gen][game] && genSprites[gen][game].front_default) {
          frontSprite = genSprites[gen][game].front_default;
          shinySprite = genSprites[gen][game].front_shiny || shinySprite;
          break;
        }
      }
    }

    const sprites = {
      front_default: frontSprite,
      front_shiny: shinySprite,
    };

    const types = data.types.map((t) => t.type.name);
    const abilities = data.abilities.map((a) => ({ name: a.ability.name, is_hidden: a.is_hidden, slot: a.slot }));
    const moves = data.moves.map((m) => ({ name: m.move.name, version_group_details: m.version_group_details }));
    const stats = data.stats.map((s) => ({ name: s.stat.name, base_stat: s.base_stat, effort: s.effort }));
    const held_items = data.held_items;

    await pool.query(
      `INSERT INTO pokemon 
        (id, name, height, weight, abilities, held_items, moves, stats, types, sprites) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
        ON CONFLICT (id) DO NOTHING`,
      [
        data.id,
        data.name,
        data.height,
        data.weight,
        JSON.stringify(abilities),
        JSON.stringify(held_items),
        JSON.stringify(moves),
        JSON.stringify(stats),
        JSON.stringify(types),
        JSON.stringify(sprites),
      ]
    );

    console.log(`Seeded Pokémon: #${id} ${data.name}`);
  } catch (err) {
    console.error(`Error seeding Pokémon #${id}`, err);
  }
};

// Seed all Pokémon
const seedAllPokemon = async () => {
  for (let i = 1; i <= 1010; i++) {
    await seedPokemon(i);
  }
  console.log("All Pokémon seeded!");
  pool.end();
};

seedAllPokemon();
