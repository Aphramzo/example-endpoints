import * as AWSXRay from "aws-xray-sdk-core";
import { APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import Debug from "debug";
// import { APIGatewayEvent } from '../models/handlers';
const logger = Debug("utils");
AWSXRay.captureHTTPsGlobal(require("http"), false); // eslint-disable-line @typescript-eslint/no-var-requires
AWSXRay.captureHTTPsGlobal(require("https"), false); // eslint-disable-line @typescript-eslint/no-var-requires

function getAllowedOrigin(
  e: APIGatewayEvent,
  allAllowedDomains: string[]
): string {
  const { headers } = e;
  const requestOrigin =
    headers && headers.origin ? headers.origin.toLowerCase() : undefined;

  const allowedDomain = allAllowedDomains.find(
    (domain) => domain.toLowerCase() === requestOrigin
  );
  let corsDomain: string;
  if (allowedDomain) {
    corsDomain = allowedDomain;
  } else {
    [corsDomain] = allAllowedDomains;
  }

  return corsDomain;
}

function addHeaders(
  result: APIGatewayProxyResult,
  event: APIGatewayEvent
): APIGatewayProxyResult {
  const { corsDomain } = process.env;
  const allowedCors = corsDomain?.split(",");
  if (!allowedCors) return result;
  result.headers = result.headers || {};

  result.headers["Access-Control-Allow-Origin"] = getAllowedOrigin(
    event,
    allowedCors
  );
  result.headers["content-type"] = "application/json";

  return result;
}

export async function asyncHandlerWithStatus(
  event: APIGatewayEvent,
  method: (event: APIGatewayEvent) => Promise<APIGatewayProxyResult>
): Promise<APIGatewayProxyResult> {
  try {
    AWSXRay.capturePromise();
    const result = await method(event);
    logger("result", result);
    return addHeaders(result, event);
  } catch (e: any) {
    logger(e);
    // if we return a status code in the 400's, return it to the user instead of throwing
    if (e.statusCode && e.statusCode < 500) {
      return addHeaders(e, event);
    }
    throw e;
  }
}
