import {injectable} from "inversify";
import {BaseMiddleware} from "inversify-express-utils";
import {NextFunction, Request, Response} from "express";
import {UnauthorizedError} from "../exceptions/http-errors/unauthorized-error";
import {ErrorCodes} from "../exceptions/error-codes";



@injectable()
export class VideoRequestMiddleware extends BaseMiddleware {
    private TAG = `[${VideoRequestMiddleware.name}]`;
    requiredFields: string[] = [];

    handler(request: Request,
            response: Response,
            next: NextFunction): void {

        if (!request.body['urls'] || !request.body['urls'].length) {
            next(new UnauthorizedError(ErrorCodes.ERROR_BAD_TOKEN, `Failed to request url missing request body field: ${'url'}`
            ));
            return;
        }

        next();
    }
}
