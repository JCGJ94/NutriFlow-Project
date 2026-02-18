const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const demoDir = path.join(__dirname, '../public/demo');

if (!fs.existsSync(demoDir)) {
    console.error(`Directory not found: ${demoDir}`);
    process.exit(1);
}

const files = fs.readdirSync(demoDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));

async function optimize() {
    console.log(`Scanning ${demoDir}...`);
    for (const file of files) {
        const filePath = path.join(demoDir, file);
        const stats = fs.statSync(filePath);

        // Threshold: 200KB
        if (stats.size > 200 * 1024) {
            console.log(`Optimizing ${file} (${(stats.size / 1024).toFixed(2)}KB)...`);

            try {
                // 1. Create WebP version
                const webpPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
                if (!fs.existsSync(webpPath)) {
                    await sharp(filePath)
                        .resize({ width: 1920, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toFile(webpPath);
                    console.log(`  + Generated ${path.basename(webpPath)}`);
                }

                // 2. Compress original (Assuming PNG for the identified large files)
                if (file.toLowerCase().endsWith('.png')) {
                    const buffer = await sharp(filePath)
                        .resize({ width: 1920, withoutEnlargement: true })
                        .png({ quality: 80, compressionLevel: 9 })
                        .toBuffer();

                    if (buffer.length < stats.size) {
                        fs.writeFileSync(filePath, buffer);
                        console.log(`  -> Original compressed: ${(buffer.length / 1024).toFixed(2)}KB (${((1 - buffer.length / stats.size) * 100).toFixed(1)}% savings)`);
                    } else {
                        console.log(`  -> Original already optimized.`);
                    }
                }
            } catch (err) {
                console.error(`  x Error optimizing ${file}:`, err.message);
            }
        }
    }
    console.log('Optimization complete.');
}

optimize();
