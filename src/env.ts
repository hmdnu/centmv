export type TEnv = {
  OTAKU_DESU: string;
  KUSONIME: string;
  BASE_URL: string;
  ANIMASU: string;
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
