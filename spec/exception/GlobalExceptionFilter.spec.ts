import {GlobalExceptionFilter} from '../../src/exception/GlobalExceptionFilter';
import {ResponseMock} from './ResponseMock';
import {ArgumentsHost, BadRequestException, HttpStatus, InternalServerErrorException} from '@nestjs/common';
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
            beforeEach(() => {
                globalExceptionFilter.catch(new BadRequestException(), hostMock);
            });

            it('Response has status and message properties', () => {
                expect(responseMock._status).toBe(HttpStatus.BAD_REQUEST);
                expect(responseMock._json).toEqual({
                    'message': {
                        'error': 'Bad Request',
                        'statusCode': HttpStatus.BAD_REQUEST,
                    },
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
});
