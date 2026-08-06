import { divIcon } from "leaflet"
import { MapContainer, Marker, TileLayer } from "react-leaflet"

type PostcardLocationMapProps = {
  coordinates: [number, number]
}

const markerIcon = divIcon({
  className: "postcard-static-map-marker",
  html: "<span></span>",
  iconSize: [20, 27],
  iconAnchor: [10, 27],
})

function PostcardLocationMap({ coordinates }: PostcardLocationMapProps) {
  return (
    <div className="postcard-location-map" aria-label="Mapa de localización de la postal">
      <MapContainer
        center={coordinates}
        zoom={5}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coordinates} icon={markerIcon} />
      </MapContainer>
    </div>
  )
}

export default PostcardLocationMap
