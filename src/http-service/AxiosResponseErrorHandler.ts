import {BadRequestException, HttpStatus} from '@nestjs/common';

export class AxiosResponseErrorHandler {
    public static rethrowBadRequestError(error: any): void {
        if (this.isBadRequest(error)) {
            throw new BadRequestException(this.getResponseErrorMessage(error));
        }
    }

    private static getResponseErrorMessage(error: any): string {
        return error.response.data && error.response.data.message;
    }

    private static isBadRequest(error: any): boolean {
        return error && error.response && error.response.status === HttpStatus.BAD_REQUEST;
    }
}
