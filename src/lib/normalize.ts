import type { DisneyCharacter, Gender, RawDataset, Role } from '../types';

const roleMap: Record<string, Role> = {
  Protagonista: 'Hero',
  Secundario: 'Ally',
  Villano: 'Villain',
};

const genderMap: Record<string, Gender> = {
  Femenino: 'Female',
  Masculino: 'Male',
  Neutro: 'Neutral',
};

const speciesMap: Record<string, string> = {
  'Alienígena': 'Alien',
  Animal: 'Animal',
  Atlante: 'Atlantean',
  'Avatar Digital': 'Digital Avatar',
  Bestia: 'Beast',
  Bruja: 'Witch',
  'Bruja Marina': 'Sea Witch',
  Criatura: 'Creature',
  'Criatura Mitológica': 'Mythical Creature',
  Cyborg: 'Cyborg',
  Dios: 'God',
  'Dragón': 'Dragon',
  Enano: 'Dwarf',
  'Entidad Oscura': 'Dark Entity',
  'Experimento Alienígena': 'Alien Experiment',
  Genio: 'Genie',
  Hada: 'Fairy',
  Humano: 'Human',
  Mago: 'Wizard',
  Marioneta: 'Puppet',
  'Muñeco de Nieve Vivo': 'Living Snowman',
  'Objeto Animado': 'Animated Object',
  Peluche: 'Plush Toy',
  'Personaje de Videojuego': 'Video Game Character',
  Robot: 'Robot',
  'Semidiós': 'Demigod',
  'Ser Cósmico': 'Cosmic Being',
  'Ser Elemental': 'Elemental Being',
  'Ser Mágico': 'Magical Being',
  Sirena: 'Mermaid',
  'Sátiro': 'Satyr',
  Tritón: 'Triton',
  'Árbol Mágico': 'Magical Tree',
};

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
function toFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function normalizeCharacters(dataset: RawDataset): DisneyCharacter[] {
  return dataset.movies.flatMap((movie) =>
    movie.characters.map((character) => {
      const imgPath = `${toFileName(character.pelicula)}/${toFileName(character.nombre)}.png`;

      
      return {
        id: `${slugify(character.nombre)}-${character.año}-${slugify(character.pelicula)}`,
        name: character.nombre,
        movie: character.pelicula,
        role: roleMap[character.rol] ?? 'Ally',
        species: speciesMap[character.especie] ?? character.especie,
        powers: character.poderes === 'Sí',
        year: character.año,
        gender: genderMap[character['género']] ?? 'Neutral',
        imageFile: imgPath,
        emojis: character.emojis ?? [],
        silhouettePath: imgPath,
      };
    }),
  );
}
