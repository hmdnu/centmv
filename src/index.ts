import { Router } from "./cores/Router";
import { Env, TEnv } from "./env";

export default {
  async fetch(req, env, ctx) {
    const envWrap = new Env(env);
    const router = new Router(envWrap);
    const app = router.getApp();
    return app.fetch(req, env, ctx);
  },
} satisfies ExportedHandler<TEnv>;
