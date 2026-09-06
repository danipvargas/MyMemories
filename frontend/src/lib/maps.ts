import type { StyleSpecification } from "maplibre-gl"
import localMapStyle from "../../../shared/maps/style.json"

const mapTilerApiKey = import.meta.env.VITE_MAPTILER_API_KEY?.trim()

function addMapTilerApiKey(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      const url = new URL(value)
      if (url.origin === "https://api.maptiler.com" && mapTilerApiKey) {
        url.searchParams.set("key", mapTilerApiKey)
        return url.toString().replaceAll("%7B", "{").replaceAll("%7D", "}")
      }
    } catch {
      return value
    }

    return value
  }

  if (Array.isArray(value)) {
    return value.map(addMapTilerApiKey)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        addMapTilerApiKey(nestedValue),
      ]),
    )
  }

  return value
}

const mapStyle = addMapTilerApiKey(localMapStyle) as StyleSpecification

export const MAP_STYLE_PICKER = mapStyle
export const MAP_STYLE_POSTCARD = mapStyle
