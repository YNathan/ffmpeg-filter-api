import "reflect-metadata";
import getDecorators from "inversify-inject-decorators";
import { Container, inject } from "inversify";
import {
  autoProvide,
  provide,
  fluentProvide,
  buildProviderModule,
} from "inversify-binding-decorators";
import { EventEmitter } from "events";
import { interfaces } from "inversify-express-utils";

import { Config, config } from "../config/config";
import { TYPES } from "./types";
import { VideoController } from "../controllers/video.controller";
import { VideoService } from "../service/video.service";
import {VideoServiceImpl} from "../service/video.service.impl";
import { VideoRequestMiddleware } from "../middlewares/video-request.middleware";


const container = new Container({
  defaultScope: "Singleton",
});
container.load(buildProviderModule());
const decObject = getDecorators(container, false);
const { lazyInject } = decObject;

const provideNamed = (identifier: any, name: string): any =>

  fluentProvide(identifier).whenTargetNamed(name).done();


const provideSingleton = (identifier: any): any =>

  fluentProvide(identifier).inSingletonScope().done();

const loadContainer = (): Container => {
  container.bind<Config>(TYPES.Config).toConstantValue(config);

  // controller
  container
      .bind<interfaces.Controller>("Controller")
      .to(VideoController)
      .whenTargetNamed("VideoController");

  container.bind<any>(TYPES.EventEmitter).toConstantValue(new EventEmitter());

  // midddlewares
  container.bind<VideoRequestMiddleware>(TYPES.VideoRequestMiddleware).to(VideoRequestMiddleware);

  // service
  container.bind<VideoService>(TYPES.VideoService).to(VideoServiceImpl);

  return container;
};

export {
  lazyInject,
  container,
  autoProvide,
  provide,
  provideSingleton,
  provideNamed,
  inject,
  loadContainer,
};

