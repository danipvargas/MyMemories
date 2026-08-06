import { useEffect } from "react"
import { useMap, useMapEvents } from "react-leaflet"
import { divIcon } from "leaflet"
import { MapContainer, Marker, TileLayer } from "react-leaflet"

const DEFAULT_CENTER: [number, number] = [40.4168, -3.7038]

type LocationPickerProps = {
  value: [number, number] | null
  onChange: (coordinates: [number, number]) => void
}

const markerIcon = divIcon({
  className: "postcard-map-marker",
  html: "<span></span>",
  iconSize: [28, 38],
  iconAnchor: [14, 38],
})

function MapClickHandler({
  onChange,
}: Pick<LocationPickerProps, "onChange">) {
  useMapEvents({
    click: (event) => {
      onChange([event.latlng.lat, event.latlng.lng])
    },
  })

  return null
}

function MapViewport({ value }: Pick<LocationPickerProps, "value">) {
  const map = useMap()

  useEffect(() => {
    if (value) {
      map.setView(value, map.getZoom(), { animate: false })
    }
  }, [map, value])

  return null
}

function LocationPicker({ value, onChange }: LocationPickerProps) {
  return (
    <div className="location-picker">
      <div className="location-picker-heading">
        <div>
          <p>Marca en el mapa el lugar de adquisición.</p>
        </div>
        {value && (
          <span className="coordinates-badge">
            {value[0].toFixed(4)}, {value[1].toFixed(4)}
          </span>
        )}
      </div>
      <div className="map-frame">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={5}
          scrollWheelZoom
          attributionControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onChange={onChange} />
          <MapViewport value={value} />
          {value && <Marker position={value} icon={markerIcon} />}
        </MapContainer>
      </div>
    </div>
  )
}

export default LocationPicker
