
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

        let message = 'Internal server error';
        if (exception instanceof HttpException) {
            const res = exception.getResponse();
            if (typeof res === 'object' && res !== null && 'message' in res) {
                // If message is an array (class-validator), join it
                const msg = (res as any).message;
                message = Array.isArray(msg) ? msg.join(', ') : msg;
            } else if (typeof res === 'string') {
                message = res;
            }
        } else if (exception instanceof Error) {
            // For non-http errors, we might want to hide details in production, 
            // but strictly following the existing logic of debugMessage for now, 
            // creating a 'message' field that client expects.
            message = process.env.NODE_ENV !== 'production' ? exception.message : 'Internal server error';
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
