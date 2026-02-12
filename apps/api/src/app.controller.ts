import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
    @Get()
    root() {
        return {
            name: 'NutriFlow API',
            version: '0.1.0',
            status: 'online',
            docs: '/v1/docs',
            health: '/v1/health'
        };
    }
}
