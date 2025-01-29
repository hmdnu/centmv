export interface IAnime<
  TLatest,
  TByGenre,
  TComplete,
  TFind,
  TGenreList,
  TDetail,
> {
  getLatest(page: number): Promise<TLatest[]>;
  getByGenre(genre: string, page: number): Promise<TByGenre[]>;
  getComplete(page: number): Promise<TComplete[]>;
  find(anime: string): Promise<TFind[]>;
  getGenres(): Promise<TGenreList[]>;
  getDetail(name: string): Promise<TDetail>;
}
