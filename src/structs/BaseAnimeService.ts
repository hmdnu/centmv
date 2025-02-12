import { Animasu } from "@/scrappers/anime/animasu/Animasu";
import { OtakuDesu } from "@/scrappers/anime/otakudesu/OtakuDesu";

type TProvider = OtakuDesu | Animasu;

type TConstructor = {
  otakudesu: OtakuDesu;
  animasu: Animasu;
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
