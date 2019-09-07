# Nest.js exceptions

Provides [Nest](https://nestjs.com/) custom exceptions and exception filters.

## Installation

```bash
$ npm i nestjs-exceptions
```

## Usage

### Integration Error

You might want to use `IntegrationError` to wrap integration errors with a custom message.

```typescript
throw new IntegrationError(`Service runtime error.`, causeError);
```

### Bootstrap with global exception filter

```typescript
const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new GlobalExceptionFilter());
    ...
    await app.listen(3000);
};
bootstrap();
```

`GlobalExceptionFilter` takes care mainly of internal server errors. 
You can configure it during instantiation so that the original cause of 500 errors are returned back to the client. The default is `false` for security reasons.

```typescript
const sendInternalServerErrorCause = true;
new GlobalExceptionFilter(sendInternalServerErrorCause);
```

### GlobalExceptionFilter logging setup
By default, only 500 errors are logged in the server side. 
This can avoid performance issues or Denial of Service attacks because the server is being to much verbose logging.

Anyways, for development reasons or debugging it's possible to log all errors:

```typescript
const sendInternalServerErrorCause = false;
const logAllErrors = true;
new GlobalExceptionFilter(sendInternalServerErrorCause, logAllErrors);
```

Or log only specific errors (besides 500):
```typescript
const sendInternalServerErrorCause = false;
const logAllErrors = false;
const logErrorsWithStatusCode = [400, 401];
new GlobalExceptionFilter(sendInternalServerErrorCause, logAllErrors, logErrorsWithStatusCode);
```
