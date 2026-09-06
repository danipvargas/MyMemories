const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const browserApiBaseUrl =
  typeof window === "undefined"
    ? "http://localhost:8000"
    : `${window.location.protocol}//${window.location.hostname}:8000`

export const API_BASE_URL = (configuredApiBaseUrl || browserApiBaseUrl).replace(/\/$/, "")

export type DatePrecision = "day" | "month" | "year" | "unknown"

export type User = {
  id: number
  username: string
  email: string
}

export type UserStats = {
  total_postcards: number
  total_countries: number
  total_cities: number
  oldest_postcard: string | null
  top_countries_with_postcards: Record<string, number>
  postcards_per_year: Record<string, number>
}

export type UpdateUserPayload = {
  username: string
  email: string
  oldPassword?: string
  newPassword?: string
  profileImage?: File
}

export type Postcard = {
  id: number
  user_id: number
  title: string
  adquisition_date: string | null
  adquisition_date_precision: DatePrecision
  country: string
  coordinates: [number, number]
  city: string | null
  region: string | null
  description: string | null
}

export type PostcardFilters = {
  title?: string
  country?: string
  city?: string
  region?: string
  startDate?: string
  endDate?: string
}

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

export type UpdatePostcardPayload = {
  title: string
  acquisitionDate?: string
  datePrecision: DatePrecision
  country: string
  city: string
  region: string
  description: string
  latitude: number
  longitude: number
  image?: File
  cover?: File
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

function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, credentials: "include" })
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiFetch(`${API_BASE_URL}/auth/me`)

  if (!response.ok) {
    throw new ApiError(response.status, await response.json().catch((error) => error))
  }

  return response.json() as Promise<User>
}

export async function login(identifier: string, password: string): Promise<User> {
  const response = await apiFetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.json().catch((error) => error))
  }

  return response.json() as Promise<User>
}

export async function logout(): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/auth/logout`, { method: "POST" })
  if (!response.ok) {
    throw new ApiError(response.status, await response.json().catch((error) => error))
  }
}

export async function registerUser(payload: {
  username: string
  email: string
  password: string
  profileImage?: File
}): Promise<User> {
  const formData = new FormData()
  formData.append("username", payload.username)
  formData.append("email", payload.email)
  formData.append("password", payload.password)
  if (payload.profileImage) {
    formData.append("profile_image", payload.profileImage, "profile.jpg")
  }

  const response = await apiFetch(`${API_BASE_URL}/users/`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.json().catch((error) => error))
  }

  return response.json() as Promise<User>
}

export async function createPostcard(
  payload: CreatePostcardPayload,
): Promise<Postcard> {
  const formData = new FormData()

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

  const response = await apiFetch(`${API_BASE_URL}/postcards/`, {
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

  return response.json() as Promise<Postcard>
}

export async function getUser(userId: number): Promise<User> {
  const response = await apiFetch(`${API_BASE_URL}/users/${userId}`)

  if (!response.ok) {
    let detail: unknown

    try {
      detail = await response.json()
    } catch (parseError) {
      detail = parseError
    }

    throw new ApiError(response.status, detail)
  }

  return response.json() as Promise<User>
}

export async function getUserStats(userId: number): Promise<UserStats> {
  const response = await apiFetch(`${API_BASE_URL}/users/${userId}/stats`)

  if (!response.ok) {
    let detail: unknown

    try {
      detail = await response.json()
    } catch (parseError) {
      detail = parseError
    }

    throw new ApiError(response.status, detail)
  }

  return response.json() as Promise<UserStats>
}

export async function updateUser(
  userId: number,
  payload: UpdateUserPayload,
): Promise<User> {
  const formData = new FormData()
  formData.append("username", payload.username)
  formData.append("email", payload.email)

  if (payload.oldPassword) formData.append("old_password", payload.oldPassword)
  if (payload.newPassword) formData.append("new_password", payload.newPassword)
  if (payload.profileImage) {
    formData.append("profile_image", payload.profileImage, "profile.jpg")
  }

  const response = await apiFetch(`${API_BASE_URL}/users/${userId}`, {
    method: "PATCH",
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

  return response.json() as Promise<User>
}

export async function getPostcards(
  filters: PostcardFilters,
  page: number,
  pageSize = 20,
): Promise<Postcard[]> {
  const searchParams = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    sort_by: "adquisition_date",
    descending: "true",
  })

  if (filters.title) searchParams.set("title", filters.title)
  if (filters.country) searchParams.set("country", filters.country)
  if (filters.city) searchParams.set("city", filters.city)
  if (filters.region) searchParams.set("region", filters.region)
  if (filters.startDate) searchParams.set("start_date", filters.startDate)
  if (filters.endDate) searchParams.set("end_date", filters.endDate)

  const response = await apiFetch(`${API_BASE_URL}/postcards/?${searchParams}`)

  if (!response.ok) {
    let detail: unknown

    try {
      detail = await response.json()
    } catch (parseError) {
      detail = parseError
    }

    throw new ApiError(response.status, detail)
  }

  return response.json() as Promise<Postcard[]>
}

export async function getAllPostcards(
  filters: PostcardFilters = {},
): Promise<Postcard[]> {
  const pageSize = 100
  const pages: Postcard[][] = []
  let page = 1

  while (true) {
    const postcards = await getPostcards(filters, page, pageSize)
    pages.push(postcards)

    if (postcards.length < pageSize) {
      return pages.flat()
    }

    page += 1
  }
}

export async function getPostcard(postcardId: number): Promise<Postcard> {
  const response = await apiFetch(`${API_BASE_URL}/postcards/${postcardId}`)

  if (!response.ok) {
    let detail: unknown

    try {
      detail = await response.json()
    } catch (parseError) {
      detail = parseError
    }

    throw new ApiError(response.status, detail)
  }

  return response.json() as Promise<Postcard>
}

export async function updatePostcard(
  postcardId: number,
  payload: UpdatePostcardPayload,
): Promise<Postcard> {
  const formData = new FormData()

  formData.append("title", payload.title)
  formData.append("adquisition_date_precision", payload.datePrecision)
  formData.append("country", payload.country)
  formData.append("city", payload.city)
  formData.append("region", payload.region)
  formData.append("description", payload.description)
  formData.append("latitude", String(payload.latitude))
  formData.append("longitude", String(payload.longitude))

  if (payload.acquisitionDate) {
    formData.append("adquisition_date", payload.acquisitionDate)
  }
  if (payload.image && payload.cover) {
    formData.append("postcard_image", payload.image, "postcard.jpg")
    formData.append("postcard_cover", payload.cover, "cover.jpg")
  }

  const response = await apiFetch(`${API_BASE_URL}/postcards/${postcardId}`, {
    method: "PATCH",
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

  return response.json() as Promise<Postcard>
}

export async function deletePostcard(postcardId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE_URL}/postcards/${postcardId}`, {
    method: "DELETE",
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
}

export function getPostcardCoverUrl(postcardId: number): string {
  return `${API_BASE_URL}/postcards/${postcardId}/cover`
}

export function getPostcardImageUrl(postcardId: number): string {
  return `${API_BASE_URL}/postcards/${postcardId}/image`
}

export function getPostcardMapUrl(postcardId: number): string {
  return `${API_BASE_URL}/postcards/${postcardId}/map`
}

export function getUserProfilePicUrl(userId: number, version?: number): string {
  const suffix = version ? `?v=${version}` : ""
  return `${API_BASE_URL}/users/${userId}/profile-pic${suffix}`
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
  if (error.status === 401) {
    if (
      typeof error.detail === "object" &&
      error.detail !== null &&
      "detail" in error.detail &&
      typeof error.detail.detail === "string" &&
      error.detail.detail.includes("Invalid username")
    ) {
      return "El usuario, correo o contraseña no son correctos."
    }
    return "La contraseña actual no es correcta."
  }
  if (error.status === 409) {
    return "El nombre de usuario o correo ya está en uso."
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

export function isDateValidationError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 422) {
    return false
  }

  if (
    typeof error.detail !== "object" ||
    error.detail === null ||
    !("detail" in error.detail) ||
    !Array.isArray(error.detail.detail)
  ) {
    return false
  }

  return error.detail.detail.some((item) => {
    if (typeof item !== "object" || item === null || !("loc" in item)) {
      return false
    }

    return Array.isArray(item.loc) && (item.loc as unknown[]).some((part: unknown) => {
      return typeof part === "string" && part.includes("adquisition_date")
    })
  })
}
