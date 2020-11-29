import { expect } from "chai";
import { Request, Response, NextFunction } from "express";

import { TYPES } from "../../src/ioc/types";

import { getTestContainer } from "../utils/bootstrap";

import { config } from "../../src/config/config";
import {VideoService} from "../../src/service/video.service";

describe("video - unit", () => {
  const container = getTestContainer();

  let videoService: VideoService;

  let status: number;
  let error: unknown;

  function initRequestAndResponse(

    request_: any
  ): { request: Request; response: Response; next: NextFunction } {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let request: Request;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let response: Response;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let next: NextFunction;
    (request as unknown) = request_;


    (response as any) = {};

    (response as any).status = (status_: number) => {
      status = status_;

      (response as any).send = (result: any) => result;
      return response;
    };

    (response as any).send = (result: any) => result;

    // eslint-disable-next-line prefer-const
    next = (error_: unknown) => {
      error = error_;
    };
    return { request, response, next };
  }

  before(async () => {
    videoService = container.get<VideoService>(TYPES.VideoService);

  });

  it("video parse request ", async () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { request, response, next } = initRequestAndResponse({
      urls: []});
    const result = await videoService.parseVideo(request, response, next);

    expect((result as any).user.name).equals("video resposne");
  })
});
