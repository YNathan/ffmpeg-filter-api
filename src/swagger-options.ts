import { SwaggerDefinitionConstant } from "swagger-express-ts";

const SwaggerApplicationOptions: unknown = {
  definition: {
    info: {
      title: "Application API",
      version: "1.0",
    },
    securityDefinitions: {
      apiKeyHeader: {
        type: SwaggerDefinitionConstant.Security.Type.API_KEY,
        in: SwaggerDefinitionConstant.Security.In.HEADER,
        name: "authorization",
      },
    },
    models: {
   
    },
    externalDocs: {
      url: "None",
    },
  },
};

export { SwaggerApplicationOptions };
