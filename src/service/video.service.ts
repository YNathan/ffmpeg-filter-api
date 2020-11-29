import { Request, Response, NextFunction } from "express";
import {VideoResponseDto} from "../models/dto/video.response.dto";

export interface VideoService {
  parseVideo(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<Response<VideoResponseDto>>;
}
