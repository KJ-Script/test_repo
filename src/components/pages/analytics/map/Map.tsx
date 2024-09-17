"use client";
import Map, {
  Layer,
  Marker,
  Source,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
} from "react-map-gl";
import Pin from "./Pin";
import { useMemo } from "react";
import mapboxgl from "mapbox-gl";

// ,
const StationsMap = () => {
  const stations = [
    {
      name: "Jimma",
      latitude: 7.679363357876099,
      longitude: 37.08845286400589,
    },
    {
      name: "Babile",
      latitude: 9.228275687938549,
      longitude: 42.330177153929384,
    },
    {
      name: "Bishoftu",
      latitude: 8.734963545936738,
      longitude: 39.006448157314274,
    },
    {
      name: "Asela",
      latitude: 7.954238490908733,
      longitude: 39.133020624541494,
    },
    {
      name: "Shashemene",
      latitude: 7.201436842065682,
      longitude: 38.604315559008654,
    },
    // ,
    {
      name: "Batu",
      latitude: 7.936413424510235,
      longitude: 38.70981729793996,
    },
    {
      name: "Dodola",
      latitude: 6.977285182583228,
      longitude: 39.18291093889792,
    },
  ];
  const pins = useMemo(
    () =>
      stations.map((station, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={station.longitude}
          latitude={station.latitude}
          anchor="bottom"
          offset={new mapboxgl.Point(650, -520)}
        >
          <Pin />
        </Marker>
      )),
    []
  );
  return (
    <Map
      mapboxAccessToken="pk.eyJ1IjoiYnJpZGdlMjAyMyIsImEiOiJjbHFleTA1cWkwcXNmMmtvN3llamZ3MzE4In0.huztfyDfo-B7UEJVjFERmQ"
      initialViewState={{
        latitude: 8.734963545936738,
        longitude: 39.006448157314274,
        zoom: 8,
        bearing: 0,
        pitch: 0,
      }}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
      mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
      onClick={(e) => {}}
    >
      <GeolocateControl position="top-left" />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
      <ScaleControl />
      {pins}
    </Map>
  );
};

export default StationsMap;
