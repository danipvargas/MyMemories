const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "")

export const ADMIN_USER_ID = 1

export type DatePrecision = "day" | "month" | "year" | "unknown"

export type CreatePostcardPayload = {
  title: string
  acquisitionDate?: string
  datePrecision: DatePrecision
  country: string
  city?: string
  region?: string
  description?: string
  latitude: number
  longitude: number
  image: File
  cover: File
}

export class ApiError extends Error {
  readonly status: number
  readonly detail: unknown

  constructor(status: number, detail: unknown) {
    super("API request failed")
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

export async function createPostcard(
  payload: CreatePostcardPayload,
): Promise<unknown> {
  const formData = new FormData()

  formData.append("user_id", String(ADMIN_USER_ID))
  formData.append("title", payload.title)
  formData.append("adquisition_date_precision", payload.datePrecision)
  formData.append("country", payload.country)
  formData.append("latitude", String(payload.latitude))
  formData.append("longitude", String(payload.longitude))
  formData.append("postcard_image", payload.image, "postcard.jpg")
  formData.append("postcard_cover", payload.cover, "cover.jpg")

  if (payload.acquisitionDate) {
    formData.append("adquisition_date", payload.acquisitionDate)
  }
  if (payload.city) {
    formData.append("city", payload.city)
  }
  if (payload.region) {
    formData.append("region", payload.region)
  }
  if (payload.description) {
    formData.append("description", payload.description)
  }

  const response = await fetch(`${API_BASE_URL}/postcards/`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    let detail: unknown

    try {
      detail = await response.json()
    } catch (parseError) {
      detail = parseError
    }

    throw new ApiError(response.status, detail)
  }

  return response.json()
}

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo."
  }

  if (error.status === 413) {
    return "La imagen supera el tamaño máximo permitido."
  }
  if (error.status === 415) {
    return "El formato de la imagen no está permitido. Usa JPG, JPEG o PNG."
  }
  if (error.status === 422) {
    return "Algunos datos no son válidos. Revisa el formulario."
  }
  if (error.status === 404) {
    return "No se ha encontrado el usuario administrador."
  }

  if (
    typeof error.detail === "object" &&
    error.detail !== null &&
    "detail" in error.detail &&
    typeof error.detail.detail === "string"
  ) {
    return error.detail.detail
  }

  return "No se pudo guardar la postal. Inténtalo de nuevo."
}
