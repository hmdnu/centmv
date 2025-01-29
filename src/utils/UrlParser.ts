export class UrlParser {
  private providerUrl: string;
  private baseUrl: string;

  constructor(providerUrl: string, baseUrl: string) {
    this.providerUrl = providerUrl;
    this.baseUrl = baseUrl;
  }

  parseDetailUrl(url: string) {
    const parsed = url
      .split(this.providerUrl)[1]
      .split("/")
      .filter((e) => e !== "");
    const parsedUrl = `/${parsed[0]}/detail/${parsed[1]}`;

    return this.baseUrl + parsedUrl;
  }

  parseGenreUrl(url: string) {
    if (!url.includes(this.providerUrl)) {
      return this.baseUrl + url.slice(0, -1);
    }

    if (url.match(/\bgenres?\b/)) {
      const parsed = url
        .split(this.providerUrl)[1]
        .split("/")
        .filter((e) => e !== "");
      const parsedUrl = `/anime/${parsed[0].slice(0, -1)}/${parsed[1]}`;
      return this.baseUrl + parsedUrl;
    }

    return "";
  }

  parseDownloadUrl(url: string) {
    return this.baseUrl + "/download" + url.split(this.providerUrl)[1];
  }
}
