
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3001/api/rag/ingest';
const KNOWLEDGE_DIR = path.join(__dirname, '../data/knowledge');

async function ingestFiles() {
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
        console.log(`📁 Creando carpeta: ${KNOWLEDGE_DIR}. Por favor, pon tus archivos .txt allí.`);
        fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
        return;
    }

    const files = fs.readdirSync(KNOWLEDGE_DIR).filter(f => f.endsWith('.txt') || f.endsWith('.md'));

    if (files.length === 0) {
        console.log('⚠️ No hay archivos para procesar en data/knowledge');
        return;
    }

    console.log(`🚀 Iniciando ingesta de ${files.length} archivos...`);

    for (const file of files) {
        const filePath = path.join(KNOWLEDGE_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        try {
            console.log(`📤 Procesando: ${file}...`);
            const response = await axios.post(API_URL, {
                content: content,
                metadata: {
                    source: file,
                    ingestedAt: new Date().toISOString()
                }
            });
            console.log(`✅ ${file} cargado con éxito. ID: ${response.data.id}`);
        } catch (error) {
            console.error(`❌ Error cargando ${file}:`, error.response?.data || error.message);
        }
    }

    console.log('🏁 Proceso finalizado.');
}

ingestFiles();
