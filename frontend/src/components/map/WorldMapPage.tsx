import { useMemo, useRef, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Filter, LoaderCircle, MapPinned, X } from "lucide-react"
import maplibregl, { type Map as MapLibreMap, type Marker } from "maplibre-gl"
import Supercluster from "supercluster"
import { useNavigate } from "react-router-dom"

import { getAllPostcards, getApiErrorMessage, getPostcardCoverUrl, type Postcard } from "@/lib/api"
import { MAP_STYLE_PICKER } from "@/lib/maps"

const SPAIN_CENTER: [number, number] = [-3.7038, 40.4168]
const DEFAULT_ZOOM = 5
const MAX_ZOOM = 18

type PostcardProperties = {
  postcard: Postcard
}

type MapPoint = Supercluster.PointFeature<PostcardProperties>
type ClusterPoint = Supercluster.ClusterFeature<Record<string, never>>

function isClusterPoint(feature: MapPoint | ClusterPoint): feature is ClusterPoint {
  return "cluster_id" in feature.properties
}

type StackSelection = {
  postcards: Postcard[]
  position: number
}

function createPostcardMarker(postcard: Postcard, onClick: () => void) {
  const element = document.createElement("button")
  element.type = "button"
  element.className = "map-postcard-marker"
  element.setAttribute("aria-label", `Abrir ${postcard.title}`)

  const card = document.createElement("span")
  card.className = "map-postcard-marker-card"
  const image = document.createElement("img")
  image.src = getPostcardCoverUrl(postcard.id)
  image.alt = ""
  image.loading = "lazy"
  card.append(image)
  element.append(card)
  element.addEventListener("click", (event) => {
    event.stopPropagation()
    card.classList.add("is-activating")
    window.setTimeout(onClick, 180)
  })

  return element
}

function createClusterMarker(
  postcards: Postcard[],
  count: number,
  onClick: () => void,
) {
  const element = document.createElement("button")
  element.type = "button"
  element.className = "map-postcard-cluster"
  element.setAttribute("aria-label", `${count} postales agrupadas`)

  const countLabel = document.createElement("span")
  countLabel.className = "map-postcard-cluster-count"
  countLabel.textContent = String(count)
  element.append(countLabel)

  const stack = document.createElement("span")
  stack.className = "map-postcard-cluster-stack"
  postcards.slice(0, 3).forEach((postcard, index) => {
    const image = document.createElement("img")
    image.src = getPostcardCoverUrl(postcard.id)
    image.alt = ""
    image.style.setProperty("--stack-index", String(index))
    stack.append(image)
  })
  element.append(stack)
  element.addEventListener("click", (event) => {
    event.stopPropagation()
    onClick()
  })

  return element
}

function PostcardStackNavigator({
  selection,
  onChange,
  onClose,
  onOpen,
}: {
  selection: StackSelection
  onChange: (position: number) => void
  onClose: () => void
  onOpen: (postcard: Postcard) => void
}) {
  const postcard = selection.postcards[selection.position]
  const total = selection.postcards.length

  return (
    <aside className="map-stack-navigator" aria-label="Postales agrupadas">
      <button
        type="button"
        className="map-stack-close"
        onClick={onClose}
        aria-label="Cerrar pila"
      >
        <X size={17} />
      </button>
      <div className="map-stack-preview">
        <button
          type="button"
          className="map-stack-arrow"
          onClick={() => onChange((selection.position - 1 + total) % total)}
          aria-label="Postal anterior"
        >
          ‹
        </button>
        <img
          src={getPostcardCoverUrl(postcard.id)}
          alt={`Portada de ${postcard.title}`}
        />
        <button
          type="button"
          className="map-stack-arrow"
          onClick={() => onChange((selection.position + 1) % total)}
          aria-label="Postal siguiente"
        >
          ›
        </button>
      </div>
      <p className="map-stack-position">
        {selection.position + 1} / {total}
      </p>
      <button
        type="button"
        className="primary-button map-stack-open"
        onClick={() => onOpen(postcard)}
      >
        Abrir postal
      </button>
    </aside>
  )
}

function WorldMapPage() {
  const navigate = useNavigate()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const markersRef = useRef(new Map<string, Marker>())
  const [stackSelection, setStackSelection] = useState<StackSelection | null>(null)
  const query = useQuery({
    queryKey: ["map-postcards"],
    queryFn: () => getAllPostcards(),
    staleTime: Infinity,
  })
  const postcards = useMemo(() => query.data ?? [], [query.data])
  const clusterIndex = useMemo(() => {
    const features: MapPoint[] = postcards.map((postcard) => ({
      type: "Feature",
      properties: { postcard },
      geometry: {
        type: "Point",
        coordinates: [postcard.coordinates[1], postcard.coordinates[0]],
      },
    }))

    return new Supercluster<PostcardProperties, Record<string, never>>({
      maxZoom: MAX_ZOOM,
      radius: 64,
    }).load(features)
  }, [postcards])

  useEffect(() => {
    if (!mapContainerRef.current || !MAP_STYLE_PICKER) {
      return
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE_PICKER,
      center: SPAIN_CENTER,
      zoom: DEFAULT_ZOOM,
      maxZoom: MAX_ZOOM,
      renderWorldCopies: false,
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")
    mapRef.current = map

    const markers = markersRef.current

    return () => {
      markers.forEach((marker) => marker.remove())
      markers.clear()
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const renderMarkers = () => {
      const bounds = map.getBounds().toArray()
      const visibleFeatures = clusterIndex.getClusters(
        [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
        Math.floor(map.getZoom()),
      )
      const visibleKeys = new Set<string>()

      visibleFeatures.forEach((feature) => {
        const isCluster = isClusterPoint(feature)
        const key = isCluster
          ? `cluster-${feature.properties.cluster_id}`
          : `postcard-${feature.properties.postcard.id}`
        visibleKeys.add(key)

        let marker = markersRef.current.get(key)
        if (!marker) {
          const [longitude, latitude] = feature.geometry.coordinates
          const element = isCluster
            ? createClusterMarker(
                clusterIndex
                  .getLeaves(feature.properties.cluster_id, 3)
                  .map((leaf) => leaf.properties.postcard),
                feature.properties.point_count,
                () => {
                  const expansionZoom = clusterIndex.getClusterExpansionZoom(
                    feature.properties.cluster_id,
                  )
                  if (expansionZoom > MAX_ZOOM || expansionZoom <= map.getZoom() + 0.25) {
                    const leaves = clusterIndex
                      .getLeaves(feature.properties.cluster_id, Infinity)
                      .map((leaf) => leaf.properties.postcard)
                    setStackSelection({ postcards: leaves, position: 0 })
                    return
                  }

                  map.jumpTo({
                    center: [longitude, latitude],
                    zoom: expansionZoom,
                  })
                },
              )
            : createPostcardMarker(feature.properties.postcard, () => {
                navigate(`/postcards/${feature.properties.postcard.id}`)
              })

          marker = new maplibregl.Marker({
            anchor: "center",
            element,
          })
            .setLngLat([longitude, latitude])
            .addTo(map)
          markersRef.current.set(key, marker)
        } else {
          marker.setLngLat(feature.geometry.coordinates as [number, number])
        }
      })

      markersRef.current.forEach((marker, key) => {
        if (!visibleKeys.has(key)) {
          marker.remove()
          markersRef.current.delete(key)
        }
      })
    }

    if (map.loaded()) {
      renderMarkers()
    }
    map.on("load", renderMarkers)
    map.on("moveend", renderMarkers)

    return () => {
      map.off("load", renderMarkers)
      map.off("moveend", renderMarkers)
    }
  }, [clusterIndex, navigate])

  const openPostcard = (postcard: Postcard) => {
    const goToPostcard = () => navigate(`/postcards/${postcard.id}`)
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => unknown
    }

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(goToPostcard)
    } else {
      goToPostcard()
    }
  }

  return (
    <section className="world-map-page">
      <div className="world-map-toolbar">
        <div>
          <p className="eyebrow">Atlas de recuerdos</p>
          <h2>Explora tu colección</h2>
        </div>
        <button type="button" className="filter-trigger" onClick={() => navigate("/album")}>
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {query.isPending && (
        <div className="map-feedback" role="status">
          <LoaderCircle className="spin" size={22} />
          Colocando tus postales en el mundo...
        </div>
      )}

      {query.isError && (
        <div className="feedback feedback-error" role="alert">
          {getApiErrorMessage(query.error)}
        </div>
      )}

      {!MAP_STYLE_PICKER && (
        <div className="feedback feedback-error" role="alert">
          Configura VITE_MAP_STYLE_PICKER para mostrar el mapa.
        </div>
      )}

      <div className="world-map-shell">
        <div ref={mapContainerRef} className="world-map-canvas" />
        {stackSelection && (
          <PostcardStackNavigator
            selection={stackSelection}
            onChange={(position) => setStackSelection((current) => current && { ...current, position })}
            onClose={() => setStackSelection(null)}
            onOpen={openPostcard}
          />
        )}
      </div>

      {query.isSuccess && postcards.length === 0 && (
        <div className="map-feedback">
          <MapPinned size={24} />
          Aún no hay postales para colocar en el mapa.
        </div>
      )}
    </section>
  )
}

export default WorldMapPage
