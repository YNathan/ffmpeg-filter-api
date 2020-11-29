import { interfaces, controller, request, response, next, injectHttpContext, httpPost } from "inversify-express-utils";

import {ApiPath} from "swagger-express-ts";
import {Request, Response, NextFunction} from "express";
import {TYPES} from "../ioc/types";
import {inject} from "inversify";

import { VideoService } from "../service/video.service";
import {VideoResponseDto} from "../models/dto/video.response.dto";


@ApiPath({ path: "/video", name: "video" })
@controller("/video")
export class VideoController implements interfaces.Controller {
    @injectHttpContext private readonly _httpContext: interfaces.HttpContext;
    @inject(TYPES.VideoService) private readonly videoService: VideoService;


    @httpPost("/parse_video", TYPES.VideoRequestMiddleware)
    private parseVideo(
        @request() request_: Request,
        @response() response_: Response,
        @next() next_: NextFunction
    ): Promise<Response<VideoResponseDto>> {
        return this.videoService.parseVideo(request_, response_, next_);
    }


}
