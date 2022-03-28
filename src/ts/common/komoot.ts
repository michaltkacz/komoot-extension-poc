// -------------
// --- TOURS ---
// -------------

export interface K_ToursPage {
  _embedded: K_ToursEmbedded;
  _links: K_ToursLinks;
  page: K_Page;
}

export interface K_ToursEmbedded {
  tours: K_Tour[];
}

export interface K_Tour {
  status: string;
  type: string;
  date: Date;
  name: string;
  source: string;
  distance: number;
  duration: number;
  sport: string;
  _links: K_TourLinks;
  kcal_active: number;
  kcal_resting: number;
  start_point: K_StartPoint;
  elevation_up: number;
  elevation_down: number;
  time_in_motion: number;
  _embedded: K_TourEmbedded;
  id: string;
  changed_at: Date;
  map_image: K_MapImage;
  map_image_preview: K_MapImage;
}

export interface K_TourEmbedded {
  creator: K_Creator;
}

export interface K_Creator {
  username: string;
  avatar: K_MapImage;
  status: string;
  _links: K_CreatorLinks;
  display_name: string;
  is_premium: boolean;
}

export interface K_CreatorLinks {
  self: K_Next;
  relation: K_Relation;
}

export interface K_Relation {
  href: string;
  templated: boolean;
}

export interface K_Next {
  href: string;
}

export interface K_MapImage {
  src: string;
  templated: boolean;
  type: string;
  attribution?: string;
}

export interface K_TourLinks {
  creator: K_Next;
  self: K_Next;
  coordinates: K_Next;
  participants: K_Next;
  timeline: K_Next;
}

export interface K_StartPoint {
  lat: number;
  lng: number;
  alt: number;
}

export interface K_ToursLinks {
  self: K_Next;
  next: K_Next;
}

export interface K_Page {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

// -------------
// ---COORDS ---
// -------------

export interface K_Coords {
  items: K_Item[];
  _links: K_Links;
}

export interface K_Links {
  self: K_Self;
}

export interface K_Self {
  href: string;
}

export interface K_Item {
  lat: number;
  lng: number;
  alt: number;
  t: number;
}
