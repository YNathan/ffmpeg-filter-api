import { HttpError } from "./http-error";
import { ErrorCodes } from "../error-codes";

export class BadRequestError extends HttpError {
  constructor(errorCode: number, message: any, data?: any) {
    super(ErrorCodes.STATUS_BAD_REQUEST, errorCode);
    this.errorCode = errorCode;
    this.message = message || "Bad Request.";
    if (data) this.message = data;
  }
}
