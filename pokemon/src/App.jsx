import { useEffect, useState, useRef } from "react";
import "./App.css";

const colors = {
  fire: "#e03a3a",
  grass: "#50C878",
  electric: "#fad343",
  water: "#1E90FF",
  ground: "#735139",
  rock: "#63594f",
  fairy: "#EE99AC",
  poison: "#b34fb3",
  bug: "#A8B820",
  dragon: "#fc883a",
  psychic: "#882eff",
  flying: "#87CEEB",
  fighting: "#bf5858",
  normal: "#D2B48C",
  ghost: "#7B62A3",
  dark: "#414063",
  steel: "#808080",
  ice: "#98D8D8",
};

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [nextId, setNextId] = useState(1);
  const loadingRef = useRef(false);
  const batchSize = 24;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const loadPokemonBatch = async () => {
    if (loadingRef.current || nextId > 1010) return;
    loadingRef.current = true;

    try {
      const endId = Math.min(nextId + batchSize - 1, 1010);
      const res = await fetch(`http://localhost:5000/pokemon-range/${nextId}/${endId}`);
      const data = await res.json();

      const newPokemons = data.map((p) => {
        const type = p.types[0];
        const color = colors[type] || "#ccc";
        return {
          id: p.id,
          name: capitalize(p.name),
          sprite: p.sprites.front_shiny,
          type,
          color,
        };
      });

      setPokemonList((prev) => [...prev, ...newPokemons]);
      setNextId(endId + 1);
    } catch (err) {
      console.error("Error loading Pokémon:", err);
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    loadPokemonBatch(); // initial load
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const preloadOffset = 1000; 
      if (scrollTop + clientHeight >= scrollHeight - preloadOffset) {
        loadPokemonBatch();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [nextId]);

  return (
    <div className="App">
      <h1 className="title">Pokédex</h1>
      <div className="pokemon-grid">
        {pokemonList.map((p) => (
          <div
            key={p.id}
            className="pokemon-card"
            data-type={p.type}
            style={{ backgroundColor: p.color }}
          >
            <img src={p.sprite} alt={p.name} />
            <h3>
              #{p.id} {p.name}
            </h3>
            <p>{p.type}</p>
          </div>
        ))}
      </div>
      {loadingRef.current && <p className="loading">Loading Pokémon...</p>}
    </div>
  );
}

export default App;
