export class ResponseMock {
    public _status: number;
    public _json: any;

    public status(status: number): ResponseMock {
        this._status = status;
        return this;
    }

    public json(json: any): ResponseMock {
        this._json = json;
        return this;
    }
}
