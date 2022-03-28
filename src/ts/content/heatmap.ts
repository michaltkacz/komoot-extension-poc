import styles from '../../css/modules/content.module.css';

import {
  Map,
  GeolocateControl,
  NavigationControl,
  ScaleControl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Deck } from '@deck.gl/core';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';

import { HeatmapData, HeatmapPosition } from '../common/common';

export const createHeatmap = async (data: HeatmapData) => {
  window.navigator.geolocation.getCurrentPosition(
    (p) => {
      _createHeatmap(
        { lat: p.coords.latitude, lon: p.coords.longitude },
        9,
        data
      );
    },
    () => {
      _createHeatmap({ lat: 51.5, lon: -0.12 }, 9, data);
    }
  );
};

const _createHeatmap = (
  defaultPosition: { lat: number; lon: number },
  defaultZoom: number,
  data: HeatmapData
) => {
  const root = document.querySelector('.c-planview__body');
  if (!root) {
    throw new Error("Couldn't find the root element for heatmap.");
  }

  const oldContainer = root.querySelector('#container');
  if (oldContainer) {
    root.removeChild(oldContainer);
  }

  // create and inject containers
  const container = document.createElement('div');
  container.setAttribute('id', 'container');
  container.classList.add(styles.container);

  const button = document.createElement('button');
  button.classList.add(styles.button);
  button.innerText = '>';
  button.addEventListener('click', () => {
    if (!container) return;
    const hidden = container.classList.toggle(styles.hidden);
    if (hidden) button.innerText = '<';
    else button.innerText = '>';
  });
  container.appendChild(button);

  const heatmap = document.createElement('div');
  heatmap.setAttribute('id', 'heatmap');
  container.appendChild(heatmap);

  const deckCanvas = document.createElement('canvas');
  deckCanvas.setAttribute('id', 'deckcanvas');
  container.appendChild(deckCanvas);

  root.appendChild(container);

  // create heatmap
  const map = new Map({
    container: heatmap,
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
        },
      ],
      name: 'OSM',
    },
    interactive: false,
    center: defaultPosition,
  });

  map.addControl(
    new GeolocateControl({
      fitBoundsOptions: {
        maxZoom: 9,
      },
    }),
    'top-right'
  );
  map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(new ScaleControl({}), 'bottom-left');

  new ResizeObserver(() => {
    map.resize();
  }).observe(container);

  const deck = new Deck({
    canvas: deckCanvas,
    width: '100%',
    height: '100%',
    initialViewState: {
      latitude: defaultPosition.lat,
      longitude: defaultPosition.lon,
      zoom: defaultZoom,
    },
    controller: true,
    onViewStateChange: ({ viewState }) => {
      map.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
      });
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmapLayer',
        data,
        getPosition: (d: HeatmapPosition) => d.coords,
        threshold: 0.02,
        aggregation: 'SUM',
        radiusPixels: 5,
        intensity: 2,
      }),
    ],
  });
};
