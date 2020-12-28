import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from '@nestjs/common';
import {Request, Response} from 'express';
import {JsonLogger, LoggerFactory} from 'json-logger-service';
import * as uuid from 'uuid/v1';
import {IntegrationError} from './IntegrationError';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private static extractIntegrationErrorDetails(error: any): string {
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

    private logger: JsonLogger = LoggerFactory.createLogger(GlobalExceptionFilter.name);

    public constructor(private readonly sendClientInternalServerErrorCause: boolean = false,
                       private readonly logAllErrors: boolean = false,
                       private readonly logErrorsWithStatusCode: number[] = []) {
    }

    public catch(exception: any, host: ArgumentsHost): any {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const responseStatus = exception.status ? exception.status : HttpStatus.INTERNAL_SERVER_ERROR;
        const messageObject = this.getBackwardsCompatibleMessageObject(exception, responseStatus);
        let errorId = undefined;
        let integrationErrorDetails = undefined;

        if (responseStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
            errorId = uuid();
            integrationErrorDetails = GlobalExceptionFilter.extractIntegrationErrorDetails(exception);

            this.logger.error({
                errorId: errorId,
                route: request.url,
                integrationErrorDetails,
                stack: exception.stack && JSON.stringify(exception.stack, ['stack'], 4),
            }, messageObject);
        } else if (this.logAllErrors || this.logErrorsWithStatusCode.indexOf(responseStatus) !== -1) {
            this.logger.error({
                route: request.url,
                stack: exception.stack && JSON.stringify(exception.stack),
            }, messageObject);
        }

        response
            .status(responseStatus)
            .json({
                errorId: errorId,
                message: this.getClientResponseMessage(responseStatus, exception),
                integrationErrorDetails: responseStatus === HttpStatus.INTERNAL_SERVER_ERROR && this.sendClientInternalServerErrorCause ? integrationErrorDetails : undefined,
            });
    }

    private getClientResponseMessage(responseStatus: number, exception: any): any {
        if (responseStatus !== HttpStatus.INTERNAL_SERVER_ERROR
            || (responseStatus === HttpStatus.INTERNAL_SERVER_ERROR && this.sendClientInternalServerErrorCause)) {
            return this.getBackwardsCompatibleMessageObject(exception, responseStatus);
        }

        return 'Internal server error.';
    }

    private getBackwardsCompatibleMessageObject(exception: any, responseStatus: number): any {
        const errorResponse = exception.response;
        if (errorResponse && errorResponse.error) {
            return {error: errorResponse.error, message: errorResponse.message, statusCode: responseStatus};
        }
        return {error: exception.message, statusCode: responseStatus};
    }
}
