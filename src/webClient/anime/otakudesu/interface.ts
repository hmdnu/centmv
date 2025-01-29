export type TGetLatest = {
  name: string;
  episode: number;
  detail: string;
};

export type TFind = {
  name: string;
  detail: string;
  status: string;
};

export type TGenreList = {
  name: string;
  href: string;
};

export interface TGetByGenre extends TGetLatest {
  status: string;
}

export interface TComplete extends TGetLatest {}

// DONT CHANGE PROPERTY ORDER!!!
export interface TBasicDetail {
  name: string;
  nameJapanese: string;
  score: number;
  producer: string;
  type: string;
  status: string;
  totalEpisode: string;
  duration: string;
  releaseDate: string;
  studio: string;
}

export interface TDetail extends TBasicDetail {
  genre: TGenre[];
  synopsis: string[];
  download: TDownload;
}

export type TDownload = {
  batch: {
    episode: string;
    download: string;
  };
  episode: {
    episode: string;
    download: string;
  }[];
};

export type TGenre = {
  name: string;
  detail: string;
};
