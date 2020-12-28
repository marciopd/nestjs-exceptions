import {GlobalExceptionFilter} from '../../src/exception/GlobalExceptionFilter';
import {ResponseMock} from './ResponseMock';
import {ArgumentsHost, BadRequestException, HttpStatus, InternalServerErrorException, UnauthorizedException} from '@nestjs/common';
import {IntegrationError} from '../../src/exception/IntegrationError';

describe('GlobalExceptionFilter tests', () => {
    let globalExceptionFilter: GlobalExceptionFilter;
    let hostMock: ArgumentsHost;
    let responseMock: ResponseMock;

    beforeEach(() => {
        responseMock = new ResponseMock();
        const contextMock = {
            getResponse: () => responseMock,
            getRequest: () => {
                return {url: ''};
            },
        };
        hostMock = {
            switchToHttp: () => contextMock,
        } as ArgumentsHost;
    });

    describe('With sending internal server error cause', () => {
        beforeEach(() => {
            globalExceptionFilter = new GlobalExceptionFilter(true);
        });

        describe('When the error is not Internal Server Error', () => {
            describe('When error message is a simple String', () => {
                beforeEach(() => {
                    globalExceptionFilter.catch(new BadRequestException('Invalid email'), hostMock);
                });

                it('Response has status and message properties', () => {
                    expect(responseMock._status).toBe(HttpStatus.BAD_REQUEST);
                    expect(responseMock._json).toEqual({
                        'message': {
                            'error': 'Bad Request',
                            'message': 'Invalid email',
                            'statusCode': HttpStatus.BAD_REQUEST,
                        },
                    });
                });
            });
            describe('When error message is an Object in Nest.js old error format', () => {
                beforeEach(() => {
                    globalExceptionFilter.catch(new BadRequestException({error: 'Bad Request', message: 'Invalid email X', statusCode: 400}), hostMock);
                });

                it('Response has status and message properties', () => {
                    expect(responseMock._status).toBe(HttpStatus.BAD_REQUEST);
                    expect(responseMock._json).toEqual({
                        'message': {
                            'error': 'Bad Request',
                            'message': 'Invalid email X',
                            'statusCode': HttpStatus.BAD_REQUEST,
                        },
                    });
                });
            });
            describe('When error message is an Array', () => {
                const errorMessageArray = [
                    {
                        error: 'must not be blank',
                        field: 'name',
                    },
                ];
                beforeEach(() => {
                    globalExceptionFilter.catch(new BadRequestException(errorMessageArray), hostMock);
                });

                it('Response has status and message properties', () => {
                    expect(responseMock._status).toBe(HttpStatus.BAD_REQUEST);
                    expect(responseMock._json).toEqual({
                        'message': {
                            'error': 'Bad Request',
                            'message': errorMessageArray,
                            'statusCode': HttpStatus.BAD_REQUEST,
                        },
                    });
                });
            });
        });

        describe('When the error is Internal Server Error', () => {
            beforeEach(() => {
                globalExceptionFilter.catch(new InternalServerErrorException(), hostMock);
            });

            it('Response has errorId, status and message properties', () => {
                expect(responseMock._status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                expect(responseMock._json.errorId).toBeDefined();
                expect(responseMock._json.message).toEqual({
                    'error': 'Internal Server Error',
                    'statusCode': HttpStatus.INTERNAL_SERVER_ERROR,
                });
            });
        });

        describe('When the error is an Integration Error', () => {
            const message = 'Failed to call service X';
            const errorCause = new Error('CONN RESET');

            beforeEach(() => {
                globalExceptionFilter.catch(new IntegrationError(message, errorCause), hostMock);
            });

            it('Response has errorId, integrationErrorDetails, status and message properties', () => {
                expect(responseMock._status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                expect(responseMock._json.errorId).toBeDefined();
                expect(responseMock._json.message).toEqual({
                    'error': message,
                    'statusCode': HttpStatus.INTERNAL_SERVER_ERROR,
                });
                expect(responseMock._json.integrationErrorDetails).toBe('{"causeError":{"message":"CONN RESET"}}');
            });
        });
    });

    describe('With logging parameters', () => {
        let loggingContext: any;
        let loggingMessage: any;

        beforeEach(() => {
            loggingContext = undefined;
            loggingMessage = undefined;
        });

        const prepareCaptureErrorLog = () => {
            (globalExceptionFilter as any).logger = {
                error: (context: any, message: string): void => {
                    loggingContext = context;
                    loggingMessage = message;
                },
            } as any;
        };

        describe('When logging all errors', () => {
            beforeEach(() => {
                globalExceptionFilter = new GlobalExceptionFilter(true, true);
                prepareCaptureErrorLog();
                globalExceptionFilter.catch(new BadRequestException(), hostMock);
            });

            it('Should log error and return response', () => {
                expect(responseMock).toBeDefined();
                expect(loggingContext).toBeDefined();
                expect(loggingContext.route).toBeDefined();
                expect(loggingContext.stack).toBeDefined();
                expect(loggingMessage).toEqual({'error': 'Bad Request', 'statusCode': 400});
            });
        });

        describe('When not logging all errors', () => {
            beforeEach(() => {
                globalExceptionFilter = new GlobalExceptionFilter(true, false);
                prepareCaptureErrorLog();
                globalExceptionFilter.catch(new BadRequestException(), hostMock);
            });

            it('Should not log error and return response', () => {
                expect(responseMock).toBeDefined();
                expect(loggingContext).toBeUndefined();
                expect(loggingMessage).toBeUndefined();
            });
        });

        describe('When logging specific errors', () => {
            beforeEach(() => {
                globalExceptionFilter = new GlobalExceptionFilter(true, false, [401]);
                prepareCaptureErrorLog();
                globalExceptionFilter.catch(new UnauthorizedException('Invalid Token'), hostMock);
            });

            it('Should log error and return response', () => {
                expect(responseMock).toBeDefined();
                expect(loggingContext).toBeDefined();
                expect(loggingContext.route).toBeDefined();
                expect(loggingContext.stack).toBeDefined();
                expect(loggingMessage).toEqual({
                    'error': 'Unauthorized',
                    'message': 'Invalid Token',
                    'statusCode': 401,
                });
            });
        });

    });
});
