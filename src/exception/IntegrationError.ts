import {HttpStatus, InternalServerErrorException} from '@nestjs/common';

export class IntegrationError extends InternalServerErrorException {
    public constructor(message: string, public readonly causeError?: any) {
        super({message: message, statusCode: HttpStatus.INTERNAL_SERVER_ERROR});
    }
}
