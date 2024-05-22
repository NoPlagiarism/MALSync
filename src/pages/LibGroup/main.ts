import { urlPart } from '../../utils/general';
import { ScriptProxy } from '../../utils/scriptProxy';
import { pageInterface } from '../pageInterface';
import { getIDFromSlug, getSlugUrl, isTypeNotSync, libObjectData } from './utils';

const proxy = new ScriptProxy('MangaLib');
let proxy_data: any = null;
const logger = con.m('MangaLib', '#ff9c1a');

// loader-wrapper is-full-page - loader classes

export const MangaLib: pageInterface = {
  name: 'MangaLib',
  domain: ['https://test-front.mangalib.me', 'https://test-front.slashlib.me'], // FIXME: Fix when new UI comes in
  languages: ['Russian'],
  type: 'manga',
  isSyncPage(url) {
    // example: slashlib.me/ru/123120--kinninaru-hito-ga-otoko-jyanakatta/read/v1/c58.5
    return urlPart(url, 5) === 'read' || isURLSync(url);
  },
  isOverviewPage(url) {
    // example: slashlib.me/ru/manga/123120--kinninaru-hito-ga-otoko-jyanakatta
    return (urlPart(url, 4) === 'manga' && urlPart(url, 6) === '') || isURLSync(url);
  },
  getImage() {
    const data = getProxyInfoById(getIDFromSlug(getSlugUrl(window.location.href)));
    if (data) return data.coverUrl;
    const imgElem = j.$('img.cover__img[src~="/uploads/cover/"]');
    if (imgElem) return imgElem.attr('src');
    return undefined;
  },
  overview: {
    getIdentifier: getSlugUrl,
    getTitle(url) {
      const data = getProxyInfoById(getIDFromSlug(getSlugUrl(url)));
      if (data) return data.engName;
      return j.$('h2').first().text();
    },
    uiSelector(selector) {
      const elem = j.$('.page > .container > div:nth-child(3) > div');
      elem.after(j.html(selector));
    },
  },
  sync: {
    getIdentifier: getSlugUrl,
    getTitle(url) {
      const data = getProxyInfoById(getIDFromSlug(getSlugUrl(url)));
      if (data) return data.engName;
      return j
        .$(`a[href^="/ru/manga/${getSlugUrl(url)}?section=chapters"] div:nth-child(1)`)
        .text();
    },
    getOverviewUrl(url) {
      return `https://${urlPart(url, 2)}/ru/manga/${getSlugUrl(url)}`;
    },
    nextEpUrl(url) {
      const nextSvgIcon = j.$('svg.fa-chevron-right');
      if (nextSvgIcon.length === 0) return undefined;
      return nextSvgIcon.parent().closest('a').attr('href');
    },
    // Example: mangalib.me/ru/2895--tomochan-wa-onnanoko/read/v5/c482
    getEpisode(url) {
      return Number(urlPart(url, 7).slice(1));
    },
    getVolume(url) {
      return Number(urlPart(url, 6).slice(1));
    },
  },
  init(page) {
    utils.waitUntilTrue(
      () => {
        return j.$('.loader-wrapper.is-full-page').length === 0;
      },
      () => {
        utils.urlChangeDetect(
          
        );
      }
    );
  },
};

function getProxyInfoById(objID: string): libObjectData | undefined {
  const psc = proxy_data;
  if (!psc || !psc[objID]) return psc[objID];
  return undefined;
}

function isURLSync(url: string): boolean {
  const objID = getIDFromSlug(getSlugUrl(url));
  const psc = proxy_data;
  if (!psc || !psc[objID]) return true;
  return !isTypeNotSync(psc[objID]);
}
