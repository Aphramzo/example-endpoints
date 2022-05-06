#!/usr/bin/env node

import * as cdk from "@aws-cdk/core";
const envName = (process.env.ENV_NAME || "local").toLowerCase();
import { ExampleEndpointsStack } from "./example-endpoints-stack";

const app = new cdk.App();
new ExampleEndpointsStack(app, `${envName}-example-endpoints`);
