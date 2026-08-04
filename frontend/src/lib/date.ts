export type DateParts = {
  year: string
  month: string
  day: string
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
