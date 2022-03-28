import { Position } from '@deck.gl/core';

// ---------------
// --- Heatmap ---
// ---------------

export type HeatmapData = HeatmapPosition[];

export type HeatmapPosition = {
  coords: Position;
};

// ---------------
// --- Storage ---
// ---------------

export type LocalStorage = {
  userIds: UserIds;
  userData: UserData;
};

export type UserIds = string[];

export type UserData = { [userId: string]: StoredHeatmapData };

export type StoredHeatmapData = {
  [tourId: string]: HeatmapData;
};
