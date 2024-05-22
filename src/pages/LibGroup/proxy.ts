import { urlPart } from '../../utils/general';
import { getIDFromSlug, getSlugUrl, libObjectData } from './utils';

/* eslint-disable consistent-return */
export function script() {
  // Inject fetchOverride
  if (!(window as any).fetchOverride) {
    (window as any).malsyncData = {};

    // eslint-disable-next-line no-var
    var originalFetch = fetch;
    // eslint-disable-next-line no-global-assign
    fetch = (input, init) =>
      originalFetch(input, init).then(response => {
        try {
          const url = input.url || input;
          // overview
          if (url.includes('/api/manga/') || url.includes('/api/anime/')) {
            if (urlPart(url, 6) !== '') return; // /api/manga/{ID}/similar and etc
            const objectID = getIDFromSlug(getSlugUrl(url));
            if (Number.isNaN(objectID)) return response; // no ID => no object.
            const objDataCached = getCached(objectID);
            if (objDataCached) {
              (window as any).malsyncData[objectID] = objDataCached;
              return response;
            }

            const res = response.clone();
            res.json().then(rawData => {
              if (rawData.data && rawData.data.model && rawData.data.eng_name) {
                const { data } = rawData;
                const objData: libObjectData = {
                  id: objectID,
                  model: data.model,
                  name: data.name,
                  engName: data.eng_name,
                  typeID: data.type.id,
                  siteID: data.site,
                  slugUrl: data.slug_url,
                  coverUrl: data.cover.thumbnail,
                };
                console.log('LibGroup', objData); // FIXME: Delete/comment this before release. Only debugging purposes
                cache(objData);
                (window as any).malsyncData[objectID] = objData;
              }
            });
          }
        } catch (e) {
          console.error('MALSYNC', e);
        }
        return response;
      });
    console.log('MALSYNC', 'Fetch override added.');
    (window as any).fetchOverride = true;
  }

  if (Object.prototype.hasOwnProperty.call(window as any, 'malsyncData')) {
    return (window as any).malsyncData;
  }
  return undefined;

  // Caching in sessionStorage
  function getCached(objID: string): libObjectData | undefined {
    const storageObjString = window.sessionStorage.getItem(`malsyncData_${objID}`);
    if (storageObjString) return JSON.parse(storageObjString);
  }
  function cache(objDataToCache: libObjectData) {
    window.sessionStorage.setItem(
      `malsyncData_${objDataToCache.id}`,
      JSON.stringify(objDataToCache),
    );
  }
}
