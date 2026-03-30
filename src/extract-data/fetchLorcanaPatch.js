/**
 * @fileoverview ETL Script Secundario para Disnedle (ES Module)
 * Resuelve discrepancias de nombres entre la BD local y la API de Lorcast.
 * Uso: node src/extract-data/fetchLorcanaPatch.js
 */

import fs from 'fs/promises';

const OUTPUT_PATH = '../data/lorcana_patch_pool.json';
const API_BASE_URL = 'https://api.lorcast.com/v0/cards/search';
const RATE_LIMIT_MS = 150;

// Diccionario: { "Nombre en tu JSON": "Nombre exacto en Lorcana" }
const characterMapping = {
    "The Evil Queen": "The Queen",
    "Timothy Q Mouse": "Timothy Q. Mouse",
    "Mr Smee": "Mr. Smee",
    "King Triton": "Triton",
    "Mrs Potts": "Mrs. Potts",
    "Commander Rourke": "Lyle Tiberius Rourke",
    "Captain Gantu": "Gantu",
    "Dr Facilier": "Dr. Facilier",
    "Fix-It Felix Jr": "Fix-It Felix, Jr.",
    "Sergeant Calhoun": "Calhoun",
    "Abuela Alma": "Alma Madrigal",
    "Clarabelle Cow": "Clarabelle"
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function extractMissingCards() {
    console.log('🚀 Iniciando parche de extracción de cartas de Lorcana...');

    const patchPool = {};
    let foundCount = 0;
    let notFoundCount = 0;

    for (const [dbName, lorcanaName] of Object.entries(characterMapping)) {
        // Buscamos usando el nombre de Lorcana
        const query = `name:"${lorcanaName}"`;
        const url = `${API_BASE_URL}?q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);

            if (response.status === 200) {
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    // Guardamos en el JSON usando el nombre original de tu base de datos (dbName)
                    patchPool[dbName] = data.results.map(card => ({
                        id: card.id,
                        nombre_carta: `${card.name}${card.version ? `, ${card.version}` : ''}`,
                        url_imagen: card.image_uris?.digital?.normal || card.image_uris?.digital?.small || null
                    })).filter(card => card.url_imagen !== null);

                    foundCount++;
                    console.log(`✅ [ENCONTRADO] ${dbName} (Buscado como "${lorcanaName}" - ${patchPool[dbName].length} cartas)`);
                } else {
                    notFoundCount++;
                    console.log(`❌ [NO ENCONTRADO] ${dbName} (Buscado como "${lorcanaName}")`);
                }
            } else if (response.status === 404) {
                notFoundCount++;
                console.log(`❌ [NO ENCONTRADO] ${dbName} (Buscado como "${lorcanaName}")`);
            } else {
                console.warn(`⚠️ [ERROR API] ${lorcanaName} - Status: ${response.status}`);
            }

        } catch (error) {
            console.error(`🚨 Error de red consultando a ${lorcanaName}:`, error.message);
        }

        await sleep(RATE_LIMIT_MS);
    }

    // Guardar el parche en un JSON independiente (o podrías fusionarlo con el principal)
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(patchPool, null, 2), 'utf-8');

    console.log('\n=======================================');
    console.log('🩹 ¡Extracción del Parche Completada!');
    console.log(`✅ Personajes parcheados con éxito: ${foundCount}`);
    console.log(`❌ Fallos en el parche: ${notFoundCount}`);
    console.log(`💾 Archivo guardado en: ${OUTPUT_PATH}`);
    console.log('=======================================');
}

extractMissingCards();