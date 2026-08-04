import type { CropperRef } from "react-advanced-cropper"

export async function createCroppedImage(
  cropper: CropperRef,
  fileName: string,
): Promise<File> {
  const canvas = cropper.getCanvas()

  if (!canvas) {
    throw new Error("Could not create crop canvas")
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) {
          resolve(value)
        } else {
          reject(new Error("Could not create image"))
        }
      },
      "image/jpeg",
      0.92,
    )
  })

  return new File([blob], fileName, { type: "image/jpeg" })
}
