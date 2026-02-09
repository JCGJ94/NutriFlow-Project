import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    const apiPrefix = process.env.API_PREFIX || 'api';
    app.setGlobalPrefix(apiPrefix);

    // CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });

    // Security Headers (Helmet)
    app.use(require('helmet')());


    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // DEBUG: Register global exception filter
    const { DebugExceptionFilter } = require('./common/filters/debug-exception.filter');
    app.useGlobalFilters(new DebugExceptionFilter());

    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('NutriFlow API')
        .setDescription(
            'API para generación de dietas semanales orientadas a pérdida de peso y buenos hábitos.',
        )
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                in: 'header',
            },
            'supabase-auth',
        )
        .addTag('profiles', 'Gestión de perfiles nutricionales')
        .addTag('plans', 'Planes de dieta semanales')
        .addTag('ingredients', 'Catálogo de ingredientes')
        .addTag('shopping-list', 'Listas de compra')
        .addTag('admin', 'Administración')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

    // Start server
    const port = process.env.API_PORT || 3001;
    await app.listen(port);

    console.log(`🚀 NutriFlow API running on: http://localhost:${port}/${apiPrefix}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
