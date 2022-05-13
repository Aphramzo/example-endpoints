import {
  APIGatewayEvent,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import Debug from "debug";
import { v4 } from "uuid";
import { asyncHandlerWithStatus } from "../utils/utils";
import jwt from "jsonwebtoken";
import Fakerator from "fakerator";
import internal from "stream";

const logger = Debug("handler");
const fakerator = Fakerator();

type Role = {
  id: string;
  name: string;
};

type User = {
  firstName: string;
  lastName: string;
  address: any; // So sue me
  roles: Array<Role>;
};

function generateRole(): Role {
  return { id: v4(), name: fakerator.lorem.word() };
}

async function asyncLogin(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  logger("in asyncLogin handler", event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({
      userId: v4(),
      token: jwt.sign({ fake: "data" }, "alsofakedata"),
    }),
  };
}

async function asyncGetUser(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  logger("in getUser");

  const user: User = {
    firstName: fakerator.names.firstName(),
    lastName: fakerator.names.lastName(),
    address: fakerator.entity.address(),
    roles: [],
  };

  for (var i = 0; i < fakerator.random.number(2, 15); i++) {
    user.roles.push(generateRole());
  }

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}

export async function login(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  return asyncHandlerWithStatus(event, asyncLogin);
}

export async function getUser(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  return asyncHandlerWithStatus(event, asyncGetUser);
}
