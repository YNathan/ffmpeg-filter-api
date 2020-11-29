import "reflect-metadata";
import {InversifyExpressServer, getRouteInfo} from "inversify-express-utils";
import * as swagger from "swagger-express-ts";
import express from "express";
import * as prettyjson from "prettyjson";
import * as bodyParser from "body-parser";
import * as fileUpload from "express-fileupload";
import {loadContainer} from "./ioc/ioc";
import {TYPES} from "./ioc/types";
import { initLogger, logger } from "./logger/logger";
import {ErrorHandler} from "./exceptions/error-handler";
import {SwaggerApplicationOptions} from "./swagger-options";
import {Config} from "./config/config";
import path from "path";
import * as https from 'https';
import { readFileSync } from "fs";

(global as any).appRootDir = path.resolve(__dirname,'..');

// Binding manually to container...
const testContainer = loadContainer();
const config: Config = testContainer.get<Config>(TYPES.Config);
const server = new InversifyExpressServer(testContainer);
const TAG = "[App]";
initLogger(`[${config.appName}]`);
logger.debug(TAG, "Server spinning up!");

server.setConfig((app) => {
    // swagger related middleware
    app.use("/api-docs/swagger", express.static("swagger"));
    app.use(
        "/api-docs/swagger/assets",
        express.static("node_modules/swagger-ui-dist")
    );

    // app.use(cors())

    app.use(bodyParser.urlencoded({
            extended: true,
        })
    );
    app.use(bodyParser.json());

    app.use(fileUpload.default());

    app.use(swagger.express(SwaggerApplicationOptions));
});

server.setErrorConfig((app) => {
    app.use((error, request, response, next) => {
        new ErrorHandler().handleError(error, request, response, next);
    });
});
const app = server.build();

// replace this with your private key
const privateKey  = readFileSync(`${(global as any).appRootDir}/${config.sslKeyPath}`, 'utf8');
// replace this with you certificate
const certificate = readFileSync(`${(global as any).appRootDir}/${config.sslCrtPath}`, 'utf8');
const credentials = {key: privateKey, cert: certificate,passphrase: config.sslPassPhrase};

// create the https server
const httpsServer = https.createServer(credentials, app);

try {
    httpsServer.listen(config.serverPort, () => {
        logger.debug(
            TAG,
            `server is running! listening to port ${config.serverPort}`
        );
    });
} catch (error) {
    logger.error("Express server 'listen' failed.", error);
    console.log(error);
    process.exit();
}

const routeInfo = getRouteInfo(testContainer);

logger.debug(routeInfo);

if(routeInfo){
    routeInfo.forEach(r=>{
        console.log(r.controller);
        r.endpoints.forEach(ep=>{
            console.log(ep.route)
        })
    })
}

logger.info(TAG, prettyjson.render({routes: routeInfo}));
export {app};
