import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapLibreMap = ({ startCoords, endCoords }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeAnimationRef = useRef(null);
  const markersRef = useRef([]);

  // Initialization Effect
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [78.9629, 20.5937],
      zoom: 4,
      antialias: true,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.FullscreenControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), "bottom-left");

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Map Update Effect
  useEffect(() => {
    if (!map.current) return;

    const mapInstance = map.current;
    let isStale = false;

    // Clear previous animations
    if (routeAnimationRef.current) {
      cancelAnimationFrame(routeAnimationRef.current);
    }

    const updateMapElements = async () => {
      // Deep comparison check to skip redundant updates
      const prevStart = mapInstance._lastStartCoords;
      const prevEnd = mapInstance._lastEndCoords;

      const isSame = (c1, c2) => {
        if (!c1 && !c2) return true;
        if (!c1 || !c2) return false;
        return c1[0] === c2[0] && c1[1] === c2[1];
      };

      const coordinatesChanged = !isSame(prevStart, startCoords) || !isSame(prevEnd, endCoords);

      mapInstance._lastStartCoords = startCoords;
      mapInstance._lastEndCoords = endCoords;

      // If coordinates haven't changed, ensure the route is fully drawn if it was mid-animation
      if (!coordinatesChanged) {
        if (mapInstance.getSource("route") && mapInstance._fullRouteCoords) {
          mapInstance.getSource("route").setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: mapInstance._fullRouteCoords },
          });
        }
        return;
      }

      // Cleanup existing markers using Ref instead of DOM search
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const getLngLat = (coords) => (coords && !isNaN(coords[0]) && !isNaN(coords[1]) ? [coords[1], coords[0]] : null);
      const startLL = getLngLat(startCoords);
      const endLL = getLngLat(endCoords);

      const createMarkerElement = (color) => {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.innerHTML = `
          <svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" fill="white" />
          </svg>
        `;
        return el;
      };

      if (startLL) {
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML('<strong>Start Location</strong>');
        const marker = new maplibregl.Marker({ element: createMarkerElement("#ef4444"), anchor: 'bottom' })
          .setLngLat(startLL)
          .setPopup(popup)
          .addTo(mapInstance);
        markersRef.current.push(marker);
      }
      if (endLL) {
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML('<strong>Destination</strong>');
        const marker = new maplibregl.Marker({ element: createMarkerElement("#3b82f6"), anchor: 'bottom' })
          .setLngLat(endLL)
          .setPopup(popup)
          .addTo(mapInstance);
        markersRef.current.push(marker);
      }

      if (startLL && endLL) {
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLL[0]},${startLL[1]};${endLL[0]},${endLL[1]}?geometries=geojson&overview=full`;
          const response = await fetch(osrmUrl);
          const data = await response.json();

          if (isStale) return; // Cleanup check

          if (data.routes && data.routes.length > 0) {
            const roadCoordinates = data.routes[0].geometry.coordinates;
            mapInstance._fullRouteCoords = roadCoordinates;
            setupRouteLayers(roadCoordinates);
          } else {
            const fallback = [startLL, endLL];
            mapInstance._fullRouteCoords = fallback;
            setupRouteLayers(fallback);
          }
        } catch (error) {
          console.error("OSRM Routing Error:", error);
          if (!isStale) setupRouteLayers([startLL, endLL]);
        }
      } else {
        removeRoute();
        // Fly to single marker if only one exists
        if (startLL) mapInstance.flyTo({ center: startLL, zoom: 14, speed: 1.2 });
        else if (endLL) mapInstance.flyTo({ center: endLL, zoom: 14, speed: 1.2 });
      }
    };

    const removeRoute = () => {
      if (mapInstance.getLayer("route")) mapInstance.removeLayer("route");
      if (mapInstance.getLayer("route-glow")) mapInstance.removeLayer("route-glow");
      if (mapInstance.getSource("route")) mapInstance.removeSource("route");
    };

    const setupRouteLayers = (fullCoordinates) => {
      if (isStale) return;
      removeRoute();

      mapInstance.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [fullCoordinates[0], fullCoordinates[0]],
          },
        },
      });

      mapInstance.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        paint: { "line-color": "#ec4899", "line-width": 10, "line-blur": 8, "line-opacity": 0.3 },
      });

      mapInstance.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#ec4899", "line-width": 5 },
      });

      // Frame the full route immediately
      const bounds = fullCoordinates.reduce((b, coord) => b.extend(coord), new maplibregl.LngLatBounds(fullCoordinates[0], fullCoordinates[0]));
      mapInstance.fitBounds(bounds, { padding: 60, animate: true, duration: 2000, maxZoom: 14 });

      // Robust Animation Loop
      let currentStep = 0;
      const totalSteps = fullCoordinates.length;
      const stepSize = Math.max(1, Math.ceil(totalSteps / 60)); // Complete in ~1 second (60fps)

      const animateLine = () => {
        if (isStale) return;

        currentStep += stepSize;

        if (currentStep >= totalSteps) {
          // ENSURE COMPLETION: Set the exact full geom at the end
          if (mapInstance.getSource("route")) {
            mapInstance.getSource("route").setData({
              type: "Feature",
              geometry: { type: "LineString", coordinates: fullCoordinates },
            });
          }
          return;
        }

        const partialCoords = fullCoordinates.slice(0, currentStep);
        if (mapInstance.getSource("route")) {
          mapInstance.getSource("route").setData({
            type: "Feature",
            geometry: { type: "LineString", coordinates: partialCoords },
          });
        }

        routeAnimationRef.current = requestAnimationFrame(animateLine);
      };

      animateLine();
    };

    if (mapInstance.loaded()) {
      updateMapElements();
    } else {
      mapInstance.once("load", updateMapElements);
    }

    return () => {
      isStale = true;
      if (routeAnimationRef.current) cancelAnimationFrame(routeAnimationRef.current);
    };
  }, [startCoords, endCoords]);

  return (
    <div className="map-wrapper" style={{ position: "relative", width: "100%", height: "450px", marginTop: "1rem" }}>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(0,0,0,0.05)",
          animation: "fadeIn 0.8s ease-out"
        }}
      />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .maplibregl-ctrl-group {
          border-radius: 12px !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        .maplibregl-popup-content {
          border-radius: 12px !important;
          padding: 8px 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default MapLibreMap;
