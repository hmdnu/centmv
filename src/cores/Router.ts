import { Env, TEnv } from "@/env";
import { Anime } from "@/services/Anime";
import { Hono } from "hono";

export class Router {
  private app = new Hono<{ Bindings: TEnv }>();
  private anime: Anime;

  constructor(env: Env) {
    this.anime = new Anime(env);
    this.routes();
  }

  private routes() {
    this.app.get("/", (c) => c.text("hello there"));

    this.app.get("/anime/latest", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"), c.req.query("page"));
      return await this.anime.getLatest(c);
    });

    this.app.get("/anime/find", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"), c.req.query("page"));
      return this.anime.find(c);
    });

    this.app.get("/anime/genres", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"));
      return this.anime.getGenres(c);
    });

    this.app.get("/anime/genre/:genre", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"), c.req.query("page"));
      return this.anime.getByGenre(c);
    });

    this.app.get("/anime/detail/:anime", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"));
      return this.anime.getDetail(c);
    });

    this.app.get("/anime/complete", async (c) => {
      this.anime.setQueryParam(c.req.query("provider"), c.req.query("page"));
      return this.anime.getComplete(c);
    });
  }

  getApp() {
    return this.app;
  }
}
