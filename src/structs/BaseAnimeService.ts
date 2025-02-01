import { Kusonime } from "@/webClient/anime/kusonime/Kusonime";
import { OtakuDesu } from "@/webClient/anime/otakudesu/OtakuDesu";

type TProvider = OtakuDesu | Kusonime;

type TConstructor = {
  otakudesu: OtakuDesu;
  kusonime: Kusonime;
};

export abstract class BaseAnimeService {
  private providers: TConstructor;
  private providerInstance = new Map<string, TProvider>();

  constructor(providers: TConstructor) {
    this.providers = providers;
    this.createProviderInstance();
  }

  private createProviderInstance() {
    const key = Object.keys(this.providers);
    const value = Object.values(this.providers);

    for (let i = 0; i < key.length; i++) {
      this.providerInstance.set(key[i], value[i]);
    }
  }

  protected getProviderInstance(name: string) {
    return this.providerInstance.get(name);
  }
}
