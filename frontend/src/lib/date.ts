import type { Postcard } from "@/lib/api"

export type DateParts = {
  year: string
  month: string
  day: string
  unknown: boolean
}

export function getDateParts(
  postcard: Pick<Postcard, "adquisition_date" | "adquisition_date_precision">,
): DateParts {
  if (!postcard.adquisition_date || postcard.adquisition_date_precision === "unknown") {
    return { year: "", month: "", day: "", unknown: true }
  }

  const [year, month, day] = postcard.adquisition_date.split("-")

  return {
    year,
    month: postcard.adquisition_date_precision === "year" ? "" : month,
    day: postcard.adquisition_date_precision === "day" ? day : "",
    unknown: false,
  }
}

export function formatPostcardDate(
  postcard: Pick<Postcard, "adquisition_date" | "adquisition_date_precision">,
  uppercaseMonth = false,
): string {
  if (!postcard.adquisition_date) {
    return "Fecha desconocida"
  }

  const date = new Date(`${postcard.adquisition_date}T00:00:00`)

  if (postcard.adquisition_date_precision === "year") {
    return new Intl.DateTimeFormat("es", { year: "numeric" }).format(date)
  }
  if (postcard.adquisition_date_precision === "month") {
    const month = new Intl.DateTimeFormat("es", { month: "long" }).format(date)
    const year = new Intl.DateTimeFormat("es", { year: "numeric" }).format(date)
    const formattedMonth = uppercaseMonth
      ? `${month.charAt(0).toUpperCase()}${month.slice(1)}`
      : month
    return `${formattedMonth} del ${year}`
  }

  return new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function getDatePayload(parts: DateParts): {
  date?: string
  precision: "day" | "month" | "year" | "unknown"
} {
  if (parts.unknown || !parts.year) {
    return { precision: "unknown" }
  }

  const monthNumber = Number(parts.month)
  const dayNumber = Number(parts.day)
  const month = Number.isInteger(monthNumber) && monthNumber >= 1 && monthNumber <= 12
    ? String(monthNumber).padStart(2, "0")
    : "01"
  const day = Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 31
    ? String(dayNumber).padStart(2, "0")
    : "01"
  const precision = parts.day ? "day" : parts.month ? "month" : "year"

  return {
    date: `${parts.year}-${month}-${day}`,
    precision,
  }
}
