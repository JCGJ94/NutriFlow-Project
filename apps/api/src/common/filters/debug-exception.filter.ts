
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface HttpExceptionResponse {
    message?: string | string[];
}

interface ExceptionWithStatus {
    status?: number;
    statusCode?: number;
    message?: string;
}

interface RequestWithUser extends Request {
    user?: { id: string };
}

/**
 * Emergency filter to debug unhandled 500 errors
 */
@Catch()
export class DebugExceptionFilter implements ExceptionFilter {


    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<RequestWithUser>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : (exception as ExceptionWithStatus)?.status || (exception as ExceptionWithStatus)?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            const res = exception.getResponse() as string | HttpExceptionResponse;
            message = typeof res === 'string' ? res : (Array.isArray(res.message) ? res.message[0] : res.message) || exception.message;
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const errorLog = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            user: request.user?.id || 'anonymous',
            error: exception instanceof Error ? exception.stack : JSON.stringify(exception),
            message: message,
        };

        if (status >= 500) {
            // Solo loguear como CRITICAL errores reales del servidor (500+)
            console.error('🔥 CRITICAL ERROR CAUGHT BY FILTER 🔥', errorLog);

            try {
                const logPath = path.resolve(process.cwd(), 'api-error.log');
                fs.appendFileSync(logPath, JSON.stringify(errorLog, null, 2) + '\n---\n');
            } catch (e) {
                console.error('Failed to write to api-error.log', e);
            }
        } else if (status === 401 || status === 403) {
            // Errores de auth son normales, loguear como debug/info para no alarmar
            // console.debug(`[Auth] ${request.method} ${request.url} - ${status}: ${message}`);
        } else {
            // Otros 4xx (400, 404, etc)
            console.warn(`[ClientError] ${request.method} ${request.url} - ${status}: ${message}`);
        }
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
