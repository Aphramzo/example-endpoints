import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import * as cdk from "@aws-cdk/core";

export enum Env {
  local = "local",
  prd = "prd",
}

export type DefaultProcessEnv = {
  ENV_NAME: Env;
  CORS_DOMAIN: string;
  LOG_LEVEL: string;
};

export class ExampleEndpointsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      ENV_NAME: envName,
      CORS_DOMAIN: corsDomain,
      LOG_LEVEL: logLevel,
    } = process.env as DefaultProcessEnv;
    const stackName = `${envName}-example-endpoints`;

    const api = new apigateway.RestApi(this, `${stackName}-api`, {
      defaultCorsPreflightOptions: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: [corsDomain],
      },
    });

    const plan = api.addUsagePlan("UsagePlan", {
      name: "Easy",
      throttle: {
        rateLimit: 100,
        burstLimit: 20,
      },
    });

    const apiKey = api.addApiKey("ApiKey");
    plan.addApiKey(apiKey);

    const defaultLambdaEnvs = {
      corsDomain,
      envName,
      logLevel,
    };

    const loginFunction = createFunction(
      this,
      "login",
      "login",
      `src/handlers/handler.ts`,
      defaultLambdaEnvs
    );

    const loginResource = api.root.addResource("login");
    // loginResource.addMethod("OPTIONS", apigateway.LambdaIntegration, {
    //   apiKeyRequired: true,
    // });
    loginResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(loginFunction),
      {
        apiKeyRequired: true,
      }
    );

    new cdk.CfnOutput(this, "apiUrl", { value: api.url || "" });

    function createFunction(
      stack: cdk.Stack,
      name: string,
      handler: string,
      entry: string,
      env: Object
    ): NodejsFunction {
      return new NodejsFunction(stack, name, {
        memorySize: 1024,
        timeout: cdk.Duration.seconds(15),
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: handler,
        entry: entry,
        environment: env as Record<string, string>,
      });
    }
  }
}
