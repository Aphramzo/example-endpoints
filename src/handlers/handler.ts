import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import Debug from "debug";
import { asyncHandlerWithStatus } from "../utils/utils";
const logger = Debug("handler");

async function asyncLogin(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  logger("in asyncLogin handler");

  return {
    statusCode: 200,
    body: JSON.stringify({
      firstName: "Faker",
      lastName: "Tester",
    }),
  };
}

export async function login(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  return asyncHandlerWithStatus(event, asyncLogin);
}
