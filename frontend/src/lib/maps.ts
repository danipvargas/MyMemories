const configuredPickerStyle = import.meta.env.VITE_MAP_STYLE_PICKER?.trim() || undefined
const configuredPostcardStyle = import.meta.env.VITE_MAP_STYLE_POSTCARD?.trim() || undefined

export const MAP_STYLE_PICKER = configuredPickerStyle ?? configuredPostcardStyle ?? ""
export const MAP_STYLE_POSTCARD = configuredPostcardStyle ?? configuredPickerStyle ?? ""
