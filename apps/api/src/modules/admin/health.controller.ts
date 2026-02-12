import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('health')
export class HealthController {
    @Get()
    @ApiOperation({ summary: 'Verificar el estado de salud de la API' })
    @ApiResponse({ status: 200, description: 'La API está operativa' })
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        };
    }
}
