import type { StyleSpecification } from "maplibre-gl"
import localMapStyle from "../../../shared/maps/style.json"

const mapStyle = localMapStyle as unknown as StyleSpecification

export const MAP_STYLE_PICKER = mapStyle
export const MAP_STYLE_POSTCARD = mapStyle
