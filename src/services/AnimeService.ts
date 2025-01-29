import { OtakuDesu } from "@/webClient/anime/otakudesu/OtakuDesu";
import { Env } from "../env";
import { Context } from "hono";
import { wrapPromise } from "@/utils/promise";

interface IAnimeProvider {
  new (env: Env): OtakuDesu;
}

export class AnimeService {
  private env: Env;
  private providerName: string = "";
  private pageNumber: number = 0;
  private defaultProvider = "otakudesu";

  private providers: Record<string, IAnimeProvider> = {
    otakudesu: OtakuDesu,
  };

  constructor(env: Env) {
    this.env = env;
  }

  setQueryParam(providerName?: string, pageNumber?: string) {
    this.providerName = providerName || this.defaultProvider;
    this.pageNumber = parseInt(pageNumber || "1");
  }

  async getLatest(c: Context) {
    const object = this.providers[this.providerName];

    if (!object) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const instance = new object(this.env);
    const { res, err } = await wrapPromise(instance.getLatest(this.pageNumber));

    if (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 505);
    }

    return c.json(res);
  }

  async find(c: Context) {
    const object = this.providers[this.providerName];

    if (!object) {
      return c.json({ error: "Provider not found" });
    }
    const query = c.req.query("q");

    if (!query) {
      return c.json({ error: "Query is not provided" });
    }

    const instance = new object(this.env);
    const { res, err } = await wrapPromise(instance.find(query));

    if (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 505);
    }

    if (Array.isArray(res) && res.length === 0) {
      return c.json({ error: `${query} not found` });
    }

    return c.json(res);
  }

  async getGenres(c: Context) {
    const object = this.providers[this.providerName];

    if (!object) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const instance = new object(this.env);
    const { res, err } = await wrapPromise(instance.getGenres());

    if (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 505);
    }
    return c.json(res);
  }

  async getByGenre(c: Context) {
    const object = this.providers[this.providerName];

    if (!object) {
      return c.json({ error: "Provider not found" }, 404);
    }

    const genre = c.req.param("genre");
    const instance = new object(this.env);
    const { res, err } = await wrapPromise(
      instance.getByGenre(genre, this.pageNumber),
    );

    if (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 505);
    }

    return c.json(res);
  }

  async getDetail(c: Context) {
    const object = this.providers[this.providerName];
    if (!object) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const instance = new object(this.env);
    const { res, err } = await wrapPromise(
      instance.getDetail(c.req.param("anime")),
    );

    if (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 505);
    }

    return c.json(res);
  }

  async getComplete(c: Context) {
    const object = this.providers[this.providerName];
    if (!object) {
      return c.json({ error: "Provider not found" }, 404);
    }
    const instance = new object(this.env);
    const { res, err } = await wrapPromise(
      instance.getComplete(this.pageNumber),
    );

    if (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 505);
    }

    return c.json(res);
  }

  async getDownload(c: Context) {
    const object = this.providers[this.providerName];
    if (!object) {
      return c.json({ error: "Provider not found" });
    }
    const instance = new object(this.env);
    const { type, anime } = c.req.param();
    const { res, err } = await wrapPromise(instance.getDownload(type, anime));
    if (err) {
      console.error(err);
      return c.json({ error: "Internal server error" }, 505);
    }
    return c.json(res);
  }
}
