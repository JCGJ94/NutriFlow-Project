
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

        if (status >= 500) {
            // Console log
            console.error('🔥 CRITICAL ERROR CAUGHT BY FILTER 🔥', errorLog);

            // File log
            try {
                const logPath = path.resolve(process.cwd(), 'api-error.log');
                fs.appendFileSync(logPath, JSON.stringify(errorLog, null, 2) + '\n---\n');
            } catch (e) {
                console.error('Failed to write to api-error.log', e);
            }
        } else {
            // Warn for auth/validation errors but don't spam critical logs
            console.warn(`[${request.method} ${request.url}] ${status} - ${message}`);
        }

        let finalMessage = message;
        if (exception instanceof HttpException) {
            // Already handled message extraction above, but ensure it's clean
        } else if (exception instanceof Error) {
            finalMessage = process.env.NODE_ENV !== 'production' ? exception.message : 'Internal server error';
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message, // Client expects this
            debugMessage: process.env.NODE_ENV !== 'production'
                ? (exception instanceof Error ? exception.stack : JSON.stringify(exception))
                : undefined,
        });
    }
}
