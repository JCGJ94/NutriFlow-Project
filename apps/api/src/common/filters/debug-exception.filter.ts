
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


        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            message = typeof response === 'string' ? response : (response as any).message || exception.message;
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const errorLog = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            user: (request as any).user?.id || 'anonymous',
            error: exception instanceof Error ? exception.stack : JSON.stringify(exception),
            message: message, // Log the extracted message
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

        // No need to redeclare finalMessage or re-check exception type extensively since we normalized `message` above
        const debugMessage = process.env.NODE_ENV !== 'production'
            ? (exception instanceof Error ? exception.stack : JSON.stringify(exception))
            : undefined;

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
            debugMessage: debugMessage,
        });
    }
}
