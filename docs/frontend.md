# Frontend

## Design philosophy

The application is designed as a digital photo album.

Browsing images is the primary interaction.

The interface is Spanish, mobile-first, and responsive. The visual language is
warm and paper-inspired, but the palette remains open to refinement during
development.

---

## Navigation

The navigation is shared between mobile and desktop layouts.

- Album
- Add
- Map

The Add screen is currently implemented. Album and Map currently display a
Coming soon state.

The admin profile remains visible in the upper navigation. Logout is hidden in
the current MVP.

On mobile, navigation is shown at the bottom. On larger screens, it becomes a
lateral navigation rail.

---

## Main screens

### Album

The initial album view is implemented.

It loads the admin user's postcards ordered by most recent acquisition date,
displays their 3:2 covers, and supports title search plus country, city,
region, and acquisition date filters. Additional results are loaded with a
Load more action.

### Postcard detail

The initial detail view is implemented. It opens from an album card and shows
the original image without a fixed aspect ratio, the postcard metadata, and
the stored coordinates. Deleting a postcard is available with confirmation.

Metadata, coordinates, and images can be edited from the detail view. The
detail map remains deferred.

### Add postcard

The current screen supports the complete create flow for the MVP:

- Select a JPG, JPEG, or PNG image from the gallery or camera.
- Crop and rotate the original image using a free aspect ratio.
- Crop a separate cover with a fixed 3:2 aspect ratio.
- Select the acquisition date by year, month, and day. The frontend derives
  the API date precision from the fields selected.
- Select a country through a searchable Spanish combobox. The API receives the
  ISO Alpha-2 code.
- Enter optional city, region, and description values.
- Select latitude and longitude by clicking an OpenStreetMap map centered on
  Spain. No geocoding is performed.
- Submit the original image and cover to the backend using the admin user with
  `user_id=1`.

The original image keeps the aspect ratio selected by the user. Only the cover
uses a fixed aspect ratio for consistent album thumbnails.

### Map

The global map is not implemented in the MVP. The navigation entry currently
shows Coming soon.

The map used during postcard creation is the only active map flow for now.

### Profile

The first version only needs to display the admin user's information and
profile image. Profile editing and password management are deferred.

---

## Shared components

- Bottom or lateral navigation
- Page header
- Searchable country combobox with ISO Alpha-2 values and flags
- Postcard image cropper
- OpenStreetMap location picker
- Feedback messages for loading, success, and errors

---

## Frontend integration

- API base URL is configured with `VITE_API_BASE_URL`.
- TanStack Query is used for API mutations and future server state.
- The API currently uses the admin user with `user_id=1`.
- Backend image errors are translated into Spanish feedback messages.

---

## Responsive design

Mobile is the primary target. Desktop adapts the same functionality using a
lateral navigation rail and wider form layout.

Image cropping supports touch gestures on mobile and mouse interactions on
desktop.

---

## Design principles

- Mobile first
- Consistent spacing
- Reusable components
- Images first
- Simple interactions
