import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('NutriFlow API')
        .setDescription('API para generación de dietas semanales orientadas a pérdida de peso y buenos hábitos.')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' }, 'supabase-auth')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    const outputPath = path.resolve(__dirname, '../../../../docs/api/openapi.json');

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log(`✅ OpenAPI spec exported to ${outputPath}`);
    await app.close();
}

generate();
