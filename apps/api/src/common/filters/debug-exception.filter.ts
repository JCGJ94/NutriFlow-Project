
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Emergency filter to debug unhandled 500 errors
 */
@Catch()
export class DebugExceptionFilter implements ExceptionFilter {


    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;



        const errorLog = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            user: (request as any).user?.id || 'anonymous',
            error: exception instanceof Error ? exception.stack : JSON.stringify(exception),
        };

        // Console log
        console.error('🔥 CRITICAL ERROR CAUGHT BY FILTER 🔥', errorLog);

        // File log
        try {
            const logPath = path.resolve(process.cwd(), 'api-error.log');
            fs.appendFileSync(logPath, JSON.stringify(errorLog, null, 2) + '\n---\n');
        } catch (e) {
            console.error('Failed to write to api-error.log', e);
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            // Include message in response only for debugging
            debugMessage: exception instanceof Error ? exception.message : 'Internal server error',
        });
    }
}
