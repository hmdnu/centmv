export type TEnv = {
  OTAKU_DESU: string;
  BASE_URL: string;
};

export class Env {
  private env: TEnv;

  constructor(env: TEnv) {
    this.env = env;
  }

  get() {
    return this.env;
  }
}
