# Frontend

## Design philosophy

The application is designed as a digital photo album.

Browsing images is the primary interaction.

The interface should remain simple and require as few interactions as possible.

---

## Navigation

- On mobile version:
    - Bottom navigation.

        - Album
        - Add
        - Map

    - Upper navigation.

        - Profile (probably on the top right corner with a simple menu)

- On web version:
    - Lateral navigation: The same options appear now at the left, while the rest of the page will
      show the gallery, add option, map, etc.

    - The profile button maintains on the top right corner, as usual in webpages.


---

## Main screens

Album with dynamic filter:

- By default, browse all postcards.
- Includes option to search and filter.
- When click on a postcard, it opens a new page opening the complete image (not the thumbnail)
  and display the details of the postcards. This will be also de place to edit the postcard.


Add postcard:

- Create a new postcard.
- The frontend must manage the postcard crop, rotate, and the thumbnail proportion crop.
  Resize is backend responsible.

Map:

- Display postcards geographically.
- When zooming, the postcard must appear as a thumbnail, not a cluster with a number.
- When click on a thumbnail, a page to display the information similar to the album one must appear.
  The option to edit may be or not included here (to disscuss).

Profile:

- User information and statistics.
- Option to logout.
- Option to edit user personal information.

---

## Shared components (Open to change during development)

- Bottom navigation
- Search bar
- Page header
- Postcard card
- Country selector

---

## Responsive design

Primary target

Mobile.

Desktop

Responsive adaptation without changing functionality.

---

## Design principles

- Mobile first
- Consistent spacing
- Reusable components
- Images first
- Simple interactions
