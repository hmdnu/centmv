export interface IAnime {
  getLatest(page: number): Promise<TGetLatest[]>;
  getByGenre(genre: string, page: number): Promise<TGetByGenre[]>;
  getComplete(page: number): Promise<TComplete[]>;
  find(anime: string): Promise<TFind[]>;
  getGenres(): Promise<TGenreList[]>;
  getDetail(name: string): Promise<TDetail>;
  getDownload(type: string, anime: string): Promise<TGetDownload>;
  getAnimeList(): Promise<TAnimeList[]>;
}

export type TGetLatest = {
  name: string;
  episode: number;
  detail: string;
  img: string;
};

export type TFind = {
  name: string;
  detail: string;
  status: string;
  img: string;
};

export type TGenreList = {
  name: string;
  href: string;
};

export interface TGetByGenre extends TGetLatest {
  status: string;
}

export interface TComplete extends TGetLatest {}

export type TBasicDetail = {
  name: string;
  type: string;
  status: string;
  releaseDate: string;
  studio: string;
};

export interface TDetail extends TBasicDetail {
  genre: TGenre[];
  synopsis: string[];
  download: TDownload;
  img: string;
}

export type TDownload = {
  batch: {
    episode: string;
    download: string;
  } | null;
  episode: {
    episode: string;
    download: string;
  }[];
};

export type TGenre = {
  name: string;
  detail: string;
};

export type TDownloadProvider = {
  name: string;
  url: string;
};

export interface TDownloadUrl {
  resolution: string;
  providers: TDownloadProvider[];
  size: string;
}

export type TGetDownload = {
  download: TDownloadUrl[];
  stream: string;
};

export type TAnimeList = {
  prefix: string;
  anime: {
    name: string;
    detail: string;
  }[];
};
