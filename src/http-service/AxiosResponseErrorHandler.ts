import {BadRequestException, HttpStatus} from '@nestjs/common';

export class AxiosResponseErrorHandler {
    public static rethrowBadRequestError(error: any): void {
        if (this.isHttpError(error, HttpStatus.BAD_REQUEST)) {
            throw new BadRequestException(this.getResponseErrorMessage(error));
        }
    }

    public static isHttpError(error: any, httpStatus: HttpStatus): boolean {
        return error && error.response && error.response.status === httpStatus;
    }

    private static getResponseErrorMessage(error: any): string {
        return error.response.data && error.response.data.message;
    }
}
