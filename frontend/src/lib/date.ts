import type { Postcard } from "@/lib/api"

export type DateParts = {
  year: string
  month: string
  day: string
}

export function getDateParts(
  postcard: Pick<Postcard, "adquisition_date" | "adquisition_date_precision">,
): DateParts {
  if (!postcard.adquisition_date || postcard.adquisition_date_precision === "unknown") {
    return { year: "", month: "", day: "" }
  }

  const [year, month, day] = postcard.adquisition_date.split("-")

  return {
    year,
    month: postcard.adquisition_date_precision === "year" ? "" : month,
    day: postcard.adquisition_date_precision === "day" ? day : "",
  }
}

export function formatPostcardDate(
  postcard: Pick<Postcard, "adquisition_date" | "adquisition_date_precision">,
): string {
  if (!postcard.adquisition_date) {
    return "Fecha desconocida"
  }

  const date = new Date(`${postcard.adquisition_date}T00:00:00`)

  if (postcard.adquisition_date_precision === "year") {
    return new Intl.DateTimeFormat("es", { year: "numeric" }).format(date)
  }
  if (postcard.adquisition_date_precision === "month") {
    return new Intl.DateTimeFormat("es", {
      month: "long",
      year: "numeric",
    }).format(date)
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
  if (!parts.year) {
    return { precision: "unknown" }
  }

  const month = parts.month.padStart(2, "0") || "01"
  const day = parts.day.padStart(2, "0") || "01"

  return {
    date: `${parts.year}-${month}-${day}`,
    precision: parts.day ? "day" : parts.month ? "month" : "year",
  }
}
