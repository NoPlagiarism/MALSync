import { urlPart } from '../../utils/general';

export interface libObjectData {
  id: string; // Numeric, but let's keep it string, LOL
  model: 'anime' | 'manga';
  name: string;
  engName: string;
  typeID: number;
  siteID: number;
  slugUrl: string;
  coverUrl: string;
}

export function getSlugUrl(url: string): string {
  // Get full slug with id (slugUrl) from url

  // anilib.me/ru/anime/20729--tomo-chan-wa-onnanoko-anime or mangalib.me/ru/manga/2895--tomochan-wa-onnanoko
  // also api.lib.social/api/manga/2895--tomochan-wa-onnanoko
  if (urlPart(url, 4) === 'manga' || urlPart(url, 4) === 'anime') return urlPart(url, 5);

  // if syncpage and not overview/anime => it's reader
  // mangalib.me/ru/2895--tomochan-wa-onnanoko/read/v5/c482
  return urlPart(url, 4);
}

export function getIDFromSlug(slug: string): string {
  return slug.split('-')[0];
}

export function isTypeNotSync(obj: libObjectData | number): boolean {
  let typeID: number;
  if (typeof obj === 'number') typeID = obj;
  else typeID = obj.typeID;
  // 8 - "Руманга"/"RuManga" manga made originally made on Russian
  // 9 - "Западный комикс"/"West Comics" - it's literally comics
  return typeID === 8 || typeID === 9;
}
