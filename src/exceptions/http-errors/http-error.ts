export class HttpError {
  protected name: string;

  protected statusCode: number;

  protected message: string;

  protected errorCode: number;

  constructor(statusCode: number, errorCode?: number) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
