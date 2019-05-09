import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from '@nestjs/common';
import {Request, Response} from 'express';
import {JsonLogger, LoggerFactory} from 'json-logger-service';
import * as uuid from 'uuid/v1';
import {IntegrationError} from './IntegrationError';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private static readonly LOGGER: JsonLogger = LoggerFactory.createLogger(GlobalExceptionFilter.name);

    public constructor(private readonly sendClientInternalServerErrorCause: boolean = false) {
    }

    public catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const responseStatus = exception.status ? exception.status : HttpStatus.INTERNAL_SERVER_ERROR;
        const errorId = uuid();

        const integrationErrorDetails = this.extractIntegrationErrorDetails(exception);

        GlobalExceptionFilter.LOGGER.error({
            errorId,
            route: request.url,
            integrationErrorDetails,
        }, exception.message);

        response
            .status(responseStatus)
            .json({
                errorId,
                message: this.getClientResponseMessage(responseStatus, exception),
                integrationErrorDetails: responseStatus === HttpStatus.INTERNAL_SERVER_ERROR && this.sendClientInternalServerErrorCause ? integrationErrorDetails : undefined,
            });
    }

    private extractIntegrationErrorDetails(error: any): string {
        if (!(error instanceof IntegrationError)) {
            return undefined;
        }

        if (!error.causeError) {
            return undefined;
        }

        if (error.causeError instanceof String) {
            return error.causeError as string;
        }

        if (!error.causeError.message && !error.causeError.response) {
            return undefined;
        }

        const integrationErrorDetails = {
            message: error.causeError.message,
            details: error.causeError.response && error.causeError.response.data,
        };
        return JSON.stringify({causeError: integrationErrorDetails});
    }

    private getClientResponseMessage(responseStatus: number, exception: any): string {
        if (responseStatus !== HttpStatus.INTERNAL_SERVER_ERROR
            || (responseStatus === HttpStatus.INTERNAL_SERVER_ERROR && this.sendClientInternalServerErrorCause)) {
            return exception.message;
        }

        return 'Internal server error.';
    }
}
