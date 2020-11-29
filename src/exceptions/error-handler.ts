import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "./http-errors/bad-request-error";
import { HttpError } from "./http-errors/http-error";
import { ErrorCodes } from "./error-codes";
import { logger } from "../utils/logger";

export class ErrorHandler {
  private TAG = `[${ErrorHandler.name}]`;

  handleError(
    error: any,
    _request: Request,
    response: Response,
    next: NextFunction
  ) {
    if (error) {
      if (!(error instanceof HttpError)) {
        logger.error(this.TAG, "Http Error occurred.\n", error);
        const message = error.message || "Http Error occurred.";
        // eslint-disable-next-line no-param-reassign
        error = new BadRequestError(ErrorCodes.ERROR_UNKNOWN, message);
      }
      response
        .status(error.statusCode || ErrorCodes.STATUS_INTERNAL_SERVER_ERROR)
        .send(error);
    }
    logger.error(this.TAG, "Server Error occurred.\n", error);
    next();
  }
}
