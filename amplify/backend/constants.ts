/* Library imports */
import { HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";

/* One path under a group's base path */
export interface RouteDefinition {
  path: string;          /* Segment below the base path, "" means the base path itself */
  methods: HttpMethod[];
}

/* A base path with the routes below it */
export interface RouteGroupDefinition {
  basePath: string;
  routes: RouteDefinition[];
}

/* Every route the API exposes under /api/v1, all served by the auth Lambda */
export const API_ROUTES: RouteGroupDefinition[] = [
  {
    basePath: "auth",
    routes: [
      { path: "setup-admin", methods: [HttpMethod.POST] },
      { path: "signup", methods: [HttpMethod.POST] },
      { path: "login", methods: [HttpMethod.POST] },
      { path: "refresh", methods: [HttpMethod.POST] },
      { path: "logout", methods: [HttpMethod.POST] },
    ],
  },
  {
    basePath: "me",
    routes: [
      { path: "", methods: [HttpMethod.GET, HttpMethod.PUT] },
      { path: "password", methods: [HttpMethod.PUT] },
    ],
  },
  {
    basePath: "users",
    routes: [
      { path: "", methods: [HttpMethod.GET, HttpMethod.POST] },
      { path: "{userId}", methods: [HttpMethod.GET, HttpMethod.PUT, HttpMethod.DELETE] },
      { path: "{userId}/enable", methods: [HttpMethod.POST] },
      { path: "{userId}/disable", methods: [HttpMethod.POST] },
    ],
  },
];
