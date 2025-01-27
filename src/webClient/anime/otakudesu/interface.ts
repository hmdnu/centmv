export type TGetLatest = {
  name: string;
  episode: number;
  href: string;
};

export type TFind = {
  name: string;
  href: string;
  status: string;
};

export type TGenreList = {
  name: string;
  href: string;
};

export type TGetByGenre = {
  name: string;
  episode: number;
  href: string;
  status: string;
};
