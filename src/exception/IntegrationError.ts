export class IntegrationError extends Error {
    public constructor(public readonly message: string, public readonly causeError?: any) {
        super(message);
    }
}
