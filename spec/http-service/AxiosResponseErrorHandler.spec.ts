import {HttpStatus} from '@nestjs/common';
import {AxiosResponseErrorHandler} from '../../src/http-service/AxiosResponseErrorHandler';

describe('AxiosResponseErrorHandler tests', () => {
    describe('Rethrowing Bad request errors', () => {
        const originalErrorMessage = 'Original error message';

        describe('When the error is a Axios Bad request', () => {
            it('Rethrows the error', () => {
                const expectedMessage = {
                    'error': 'Bad Request',
                    'message': 'Original error message',
                    'statusCode': 400,
                };
                const error = {response: {status: HttpStatus.BAD_REQUEST, data: {message: originalErrorMessage}}};
                try {
                    AxiosResponseErrorHandler.rethrowBadRequestError(error);
                    fail();
                } catch (e) {
                    expect(e.status).toBe(HttpStatus.BAD_REQUEST);
                    expect(e.message).toEqual(expectedMessage);
                }
            });
        });

        describe('When the error is NOT a Axios Bad request', () => {
            it('Ignores the error', () => {
                const error = {response: {status: HttpStatus.INTERNAL_SERVER_ERROR, data: {message: originalErrorMessage}}};
                AxiosResponseErrorHandler.rethrowBadRequestError(error);
            });
        });
    });
});
