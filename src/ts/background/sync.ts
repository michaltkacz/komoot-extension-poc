import { HeatmapData, StoredHeatmapData, UserData } from '../common/common';
import { K_Coords, K_Tour, K_ToursPage } from '../common/komoot';

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const saveToStorage = (userId: string, tours: StoredHeatmapData): void => {
  // always overwrite
  chrome.storage.local.get('userData', (result) => {
    const userData = result?.userData as UserData;
    if (userData) {
      chrome.storage.local.set({ userData: { ...userData, [userId]: tours } });
      return;
    }

    chrome.storage.local.set({ userData: { [userId]: tours } });
  });
};

const loadFromStorage = async (
  userId: string
): Promise<{
  storedTours: StoredHeatmapData;
  storedToursLength: number;
}> => {
  const result = await chrome.storage.local.get('userData');
  const userData = result?.userData as UserData;
  if (userData) {
    const storedTours = userData?.[userId];
    if (storedTours) {
      return {
        storedTours,
        storedToursLength: Object.keys(storedTours).length,
      };
    }
  }
  return { storedTours: {}, storedToursLength: 0 };
};

const mapStoredHeatmapDataToHeatmapData = (
  tours: StoredHeatmapData
): HeatmapData => {
  const heatmapData: HeatmapData = Object.values(tours).flat();
  return heatmapData;
};

const toursUrlBase = (id: string | number): string =>
  `https://www.komoot.com/api/v007/users/${id}/tours`;

const toursUrlParams = (page: string | number, limit: string | number) =>
  `/?sport_types=&type=tour_recorded&sort_field=date&sort_direction=desc&status=public&page=${page}&limit=${limit}`;

const toursUrl = (
  id: string | number,
  page: string | number,
  limit: string | number
): string => toursUrlBase(id) + toursUrlParams(page, limit);

const coordsUrl = (id: string | number): string =>
  `http://api.komoot.de/v007/tours/${id}/coordinates`;

export const syncData = async (userId: string): Promise<HeatmapData> => {
  let currentPageIndex = 0;
  let totalItems = 0;
  let totalPages = 0;

  const { storedTours, storedToursLength } = await loadFromStorage(userId);

  //console.log('storedTours', storedTours);
  //console.log('storedToursLength', storedToursLength);

  const toursPageResponse = await fetch(toursUrl(userId, currentPageIndex, 1));
  if (!toursPageResponse.ok) {
    throw new Error("Can't sync with Komoot");
  }

  const toursPageData = (await toursPageResponse.json()) as K_ToursPage;
  const latestTourId = toursPageData['_embedded']['tours'][0]['id'];

  if (currentPageIndex === 0) {
    totalPages = toursPageData['page']['totalPages'];
    totalItems = toursPageData['page']['totalElements'];
  }

  // are there any tours in the first place?
  if (totalItems === 0) {
    throw new Error('No tours saved on Komoot account');
  }

  // have there been any changes?
  // would be a problem in case of deleting one tour and uploading another (like swapping)
  // but its very rare case
  if (storedToursLength === totalItems) {
    //console.log('storedToursItemsNumber === totalItems is true');
    return mapStoredHeatmapDataToHeatmapData(storedTours);
  }

  const coordsResponse = await fetch(coordsUrl(latestTourId));
  const coordsData = (await coordsResponse.json()) as K_Coords;

  // maybe only one latest tour is missing?
  if (
    storedToursLength === totalItems - 1 &&
    !Object.keys(storedTours).includes(latestTourId)
  ) {
    //console.log('storedToursItemsNumber === totalItems - 1 is true');
    Object.assign(storedTours, {
      [latestTourId]: coordsData.items.map((i) => ({
        coords: [i.lng, i.lat],
      })),
    });

    saveToStorage(userId, storedTours);
    return mapStoredHeatmapDataToHeatmapData(storedTours);
  }

  // nope, have to check all tours
  const tourIds: string[] = [];
  do {
    const toursPageResponse = await fetch(
      toursUrl(userId, currentPageIndex, 0)
    );
    if (!toursPageResponse.ok) {
      throw new Error("Can't sync with Komoot");
    }

    const toursPageData = (await toursPageResponse.json()) as K_ToursPage;
    if (currentPageIndex === 0) {
      totalPages = toursPageData['page']['totalPages'];
      totalItems = toursPageData['page']['totalElements'];
    }

    toursPageData['_embedded']['tours'].forEach((tour: K_Tour) =>
      tourIds.push(tour.id)
    );
  } while (++currentPageIndex < totalPages);

  // fetching coords only for missing tours
  // let index = 0;
  for (const tourId of tourIds) {
    // if (index++ >= 50) break;
    if (Object.keys(storedTours).includes(tourId)) {
      continue;
    }

    // api calls throttling
    await sleep(1000);
    const coordsResponse = await fetch(coordsUrl(tourId));
    if (!coordsResponse.ok) {
      throw new Error("Can't sync with Komoot");
    }
    const coordsData = (await coordsResponse.json()) as K_Coords;

    Object.assign(storedTours, {
      [tourId]: coordsData.items.map((i) => ({
        coords: [i.lng, i.lat],
      })),
    });
  }

  //console.log('storedTours', storedTours);
  saveToStorage(userId, storedTours);
  return mapStoredHeatmapDataToHeatmapData(storedTours);
};
