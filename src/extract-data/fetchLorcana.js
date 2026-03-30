/**
 * @fileoverview ETL Script para Disnedle - Modalidad Lorcana (ES Module)
 * Extrae metadatos e imágenes de cartas para los personajes existentes.
 * Uso (desde la raíz del proyecto): node src/extract-data/fetchLorcana.js
 */

import fs from 'fs/promises';

// Configuración (Ajusta las rutas relativas si es necesario según la ubicación de tu JSON)
const INPUT_PATH = '../data/disney-pixar-characters.json'; // <-- Ajusta esta ruta si tu JSON original está en otro lado
const OUTPUT_PATH = '../data/lorcana_pool.json';
const API_BASE_URL = 'https://api.lorcast.com/v0/cards/search';
const RATE_LIMIT_MS = 150;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function extractLorcanaCards() {
    console.log('🚀 Iniciando extracción de cartas de Lorcana...');

    try {
        const rawData = await fs.readFile(INPUT_PATH, 'utf-8');
        const database = JSON.parse(rawData);

        const characterNames = new Set();
        database.movies.forEach(movie => {
            movie.characters.forEach(char => {
                characterNames.add(char.nombre);
            });
        });

        console.log(`📌 Se encontraron ${characterNames.size} personajes en el lore de Disnedle.`);

        const lorcanaPool = {};
        let foundCount = 0;
        let notFoundCount = 0;

        for (const name of characterNames) {
            const query = `name:"${name}"`;
            const url = `${API_BASE_URL}?q=${encodeURIComponent(query)}`;

            try {
                const response = await fetch(url);

                if (response.status === 200) {
                    const data = await response.json();

                    if (data.results && data.results.length > 0) {
                        lorcanaPool[name] = data.results.map(card => ({
                            id: card.id,
                            nombre_carta: `${card.name}${card.version ? `, ${card.version}` : ''}`,
                            url_imagen: card.image_uris?.digital?.normal || card.image_uris?.digital?.small || null
                        })).filter(card => card.url_imagen !== null);

                        foundCount++;
                        console.log(`✅ [ENCONTRADO] ${name} (${lorcanaPool[name].length} cartas)`);
                    } else {
                        notFoundCount++;
                        console.log(`❌ [NO ENCONTRADO] ${name} (Sin cartas en Lorcana)`);
                    }
                } else if (response.status === 404) {
                    notFoundCount++;
                    console.log(`❌ [NO ENCONTRADO] ${name} (Sin cartas en Lorcana)`);
                } else {
                    console.warn(`⚠️ [ERROR API] ${name} - Status: ${response.status}`);
                }

            } catch (error) {
                console.error(`🚨 Error de red consultando a ${name}:`, error.message);
            }

            await sleep(RATE_LIMIT_MS);
        }

        await fs.writeFile(OUTPUT_PATH, JSON.stringify(lorcanaPool, null, 2), 'utf-8');

        console.log('\n=======================================');
        console.log('🎉 ¡Extracción Completada con Éxito!');
        console.log(`✅ Personajes con cartas: ${foundCount}`);
        console.log(`❌ Personajes sin cartas: ${notFoundCount}`);
        console.log(`💾 Archivo guardado en: ${OUTPUT_PATH}`);
        console.log('=======================================');

    } catch (error) {
        console.error('💥 Error crítico en la ejecución del script. Verifica las rutas de INPUT_PATH:', error);
    }
}

extractLorcanaCards();