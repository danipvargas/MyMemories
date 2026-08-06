import { useEffect, useRef } from "react"
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl"

import { MAP_STYLE_PICKER } from "@/lib/maps"

const DEFAULT_CENTER: [number, number] = [40.4168, -3.7038]
const DEFAULT_ZOOM = 5

type LocationPickerProps = {
  value: [number, number] | null
  onChange: (coordinates: [number, number]) => void
}

function createMarkerElement() {
  const marker = document.createElement("div")
  marker.className = "postcard-map-marker"
  marker.innerHTML = "<span></span>"
  return marker
}

function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const initialValueRef = useRef(value)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!mapContainerRef.current || !MAP_STYLE_PICKER) {
      return
    }

    const initialCoordinates = initialValueRef.current ?? DEFAULT_CENTER
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_PICKER,
      center: [initialCoordinates[1], initialCoordinates[0]],
      zoom: DEFAULT_ZOOM,
      cooperativeGestures: false,
    })
    const navigationControl = new maplibregl.NavigationControl({
      showCompass: false,
    })

    map.addControl(navigationControl, "top-right")
    mapRef.current = map

    const updateCoordinates = (longitude: number, latitude: number) => {
      onChangeRef.current([latitude, longitude])
    }

    const ensureMarker = (longitude: number, latitude: number) => {
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({
          anchor: "bottom",
          draggable: true,
          element: createMarkerElement(),
        })
          .setLngLat([longitude, latitude])
          .addTo(map)

        markerRef.current.on("dragend", () => {
          const coordinates = markerRef.current?.getLngLat()
          if (coordinates) {
            updateCoordinates(coordinates.lng, coordinates.lat)
          }
        })
        return
      }

      markerRef.current.setLngLat([longitude, latitude])
    }

    if (initialValueRef.current) {
      ensureMarker(initialValueRef.current[1], initialValueRef.current[0])
    }

    const handleMapClick = (event: maplibregl.MapMouseEvent) => {
      ensureMarker(event.lngLat.lng, event.lngLat.lat)
      updateCoordinates(event.lngLat.lng, event.lngLat.lat)
    }

    map.on("click", handleMapClick)

    return () => {
      markerRef.current?.remove()
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !value) {
      return
    }

    const center: [number, number] = [value[1], value[0]]
    markerRef.current?.setLngLat(center)
    map.setCenter(center)
  }, [value])

  return (
    <div className="location-picker">
      <div className="location-picker-heading">
        <div>
          <label>Ubicación</label>
          <p>Marca en el mapa el lugar de adquisición.</p>
        </div>
        {value && (
          <span className="coordinates-badge">
            {value[0].toFixed(4)}, {value[1].toFixed(4)}
          </span>
        )}
      </div>
      <div className="map-frame">
        {!MAP_STYLE_PICKER ? (
          <p className="map-frame-error">Configura VITE_MAP_STYLE_PICKER para mostrar el mapa.</p>
        ) : (
          <div ref={mapContainerRef} className="map-canvas" />
        )}
      </div>
    </div>
  )
}

export default LocationPicker
