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
                        expect(e.response).toEqual(expectedMessage);
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
                        expect(e.response).toEqual(errorInNestJsFormat);
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

    describe('Rethrowing Not Found errors', () => {
        const expectedMessage = 'Original error message';

        describe('When the error is an Axios Not Found request', () => {
            describe('And the error is in Nest.js format', () => {
                it('Rethrows the error', () => {
                    const expectedMessage = {
                        'error': 'Not Found',
                        'message': 'Original error message',
                        'statusCode': 404,
                    };
                    const error = {response: {status: HttpStatus.NOT_FOUND, data: {message: expectedMessage}}};
                    try {
                        AxiosResponseErrorHandler.rethrowNotFoundError(error);
                        fail();
                    } catch (e) {
                        expect(e.status).toBe(HttpStatus.NOT_FOUND);
                        expect(e.response).toEqual(expectedMessage);
                    }
                });
            });

            describe('And the error is NOT in Nest.js format', () => {
                it('Rethrows the error', () => {
                    const error = {response: {status: HttpStatus.NOT_FOUND, data: 'Not found URL'}};
                    try {
                        AxiosResponseErrorHandler.rethrowNotFoundError(error);
                        fail();
                    } catch (e) {
                        expect(e.status).toBe(HttpStatus.NOT_FOUND);
                        const errorInNestJsFormat = {
                            'error': 'Not Found',
                            'message': 'Not found URL',
                            'statusCode': 404,
                        };
                        expect(e.response).toEqual(errorInNestJsFormat);
                    }
                });
            });
        });

        describe('When the error is NOT an Axios Not Found', () => {
            it('Ignores the error', () => {
                const error = {response: {status: HttpStatus.INTERNAL_SERVER_ERROR, data: {message: expectedMessage}}};
                AxiosResponseErrorHandler.rethrowNotFoundError(error);
            });
        });
    });
});
