import { Env, TEnv } from "@/env";
import { AnimeRouter } from "@/routes/AnimeRouter";
import { Hono } from "hono";

export class Router {
  private app = new Hono<{ Bindings: TEnv }>();
  private animeRouterInstance;
  private animeRouter: AnimeRouter;

  constructor(env: Env) {
    this.animeRouter = new AnimeRouter(env);
    this.animeRouterInstance = this.animeRouter.getInstance();
    this.routes();
  }

  private routes() {
    this.app.get("/", (c) => c.text("hello there"));
    this.app.route("/anime", this.animeRouterInstance);
  }

  getApp() {
    return this.app;
  }
}
