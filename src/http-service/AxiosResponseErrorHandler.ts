import {BadRequestException, HttpStatus, NotFoundException} from '@nestjs/common';

export class AxiosResponseErrorHandler {
    public static rethrowBadRequestError(error: any): void {
        AxiosResponseErrorHandler.rethrowError(error, HttpStatus.BAD_REQUEST, BadRequestException);
    }

    public static rethrowNotFoundError(error: any): void {
        AxiosResponseErrorHandler.rethrowError(error, HttpStatus.NOT_FOUND, NotFoundException);
    }

    public static rethrowError(error: any, errorHttpStatusCode: number, errorType: any): void {
        if (this.isHttpError(error, errorHttpStatusCode)) {
            throw new errorType(this.getResponseErrorMessage(error));
        }
    }

    public static isHttpError(error: any, httpStatus: HttpStatus): boolean {
        return error && error.response && error.response.status === httpStatus;
    }

    private static getResponseErrorMessage(error: any): string {
        return error.response.data && error.response.data.message || error.response.data;
    }
}
