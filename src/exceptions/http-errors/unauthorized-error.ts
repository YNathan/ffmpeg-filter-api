import { HttpError } from "./http-error";
import { ErrorCodes } from "../error-codes";

export class UnauthorizedError extends HttpError {
  constructor(errorCode: number, message: any, data?: any) {
    super(ErrorCodes.STATUS_UNAUTHORIZED, errorCode);
    this.errorCode = errorCode;
    this.message = message || "Unauthorized.";
    if (data) this.message = data;
  }
}
