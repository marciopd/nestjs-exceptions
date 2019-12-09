import {HttpStatus} from '@nestjs/common';
import {AxiosResponseErrorHandler} from '../../src/http-service/AxiosResponseErrorHandler';

describe('AxiosResponseErrorHandler tests', () => {
    describe('Rethrowing Bad request errors', () => {
        const expectedMessage = 'Original error message';

        describe('When the error is an Axios Bad request', () => {
            describe('And the error is in Nest.js format', () => {
                it('Rethrows the error', () => {
                    const expectedMessage = {
                        'error': 'Bad Request',
                        'message': 'Original error message',
                        'statusCode': 400,
                    };
                    const error = {response: {status: HttpStatus.BAD_REQUEST, data: {message: expectedMessage}}};
                    try {
                        AxiosResponseErrorHandler.rethrowBadRequestError(error);
                        fail();
                    } catch (e) {
                        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
                        expect(e.message).toEqual(expectedMessage);
                    }
                });
            });

            describe('And the error is NOT in Nest.js format', () => {
                it('Rethrows the error', () => {
                    const error = {response: {status: HttpStatus.BAD_REQUEST, data: 'Invalid field X'}};
                    try {
                        AxiosResponseErrorHandler.rethrowBadRequestError(error);
                        fail();
                    } catch (e) {
                        expect(e.status).toBe(HttpStatus.BAD_REQUEST);
                        const errorInNestJsFormat = {
                            'error': 'Bad Request',
                            'message': 'Invalid field X',
                            'statusCode': 400,
                        };
                        expect(e.message).toEqual(errorInNestJsFormat);
                    }
                });
            });
        });

        describe('When the error is NOT an Axios Bad request', () => {
            it('Ignores the error', () => {
                const error = {response: {status: HttpStatus.INTERNAL_SERVER_ERROR, data: {message: expectedMessage}}};
                AxiosResponseErrorHandler.rethrowBadRequestError(error);
            });
        });
    });
});
