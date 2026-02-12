import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
    @Get()
    @Redirect('/v1/health', 301)
    root() {
        return { message: 'NutriFlow API is running. Redirecting to Health Check...' };
    }
}
