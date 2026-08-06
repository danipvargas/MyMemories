from datetime import date

import httpx

from tests.helpers import image_bytes, postcard_files


def create_postcard(
    client: httpx.Client,
    user_id: int,
    title: str = "Test postcard",
    latitude: float = 40.4168,
    longitude: float = -3.7038,
    acquisition_date: str | None = None,
    date_precision: str = "unknown",
) -> dict[str, object]:
    data = {
        "user_id": str(user_id),
        "title": title,
        "adquisition_date_precision": date_precision,
        "country": "Spain",
        "latitude": str(latitude),
        "longitude": str(longitude),
    }
    if acquisition_date is not None:
        data["adquisition_date"] = acquisition_date

    response = client.post(
        "/postcards/",
        data=data,
        files=postcard_files(),
    )

    assert response.status_code == 201, response.text
    return response.json()


def test_admin_seed_is_available(client: httpx.Client):
    user_response = client.get("/users/1")
    profile_response = client.get("/users/1/profile-pic")

    assert user_response.status_code == 200
    assert user_response.json()["username"] == "danipvargas"
    assert user_response.json()["email"] == "danipvargas@gmail.com"
    assert profile_response.status_code == 200
    assert profile_response.headers["content-type"] == "image/jpeg"


def test_create_and_retrieve_postcard(client: httpx.Client, user: dict[str, object]):
    postcard = create_postcard(client, int(user["id"]), title="Madrid postcard")

    response = client.get(f"/postcards/{postcard['id']}")

    assert response.status_code == 200
    assert response.json() == postcard
    assert response.json()["title"] == "Madrid postcard"
    assert response.json()["coordinates"] == [40.4168, -3.7038]
    assert response.json()["adquisition_date"] is None

    map_response = client.get(f"/postcards/{postcard['id']}/map")

    assert map_response.status_code == 200
    assert map_response.headers["content-type"] == "image/webp"


def test_invalid_coordinates_are_rejected_on_create(
    client: httpx.Client,
    user: dict[str, object],
):
    response = client.post(
        "/postcards/",
        data={
            "user_id": str(user["id"]),
            "title": "Invalid coordinates",
            "adquisition_date_precision": "unknown",
            "country": "Spain",
            "latitude": "91",
            "longitude": "0",
        },
        files=postcard_files(),
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "latitude"]


def test_invalid_coordinates_are_rejected_on_update(
    client: httpx.Client,
    user: dict[str, object],
):
    postcard = create_postcard(client, int(user["id"]))

    out_of_range_response = client.patch(
        f"/postcards/{postcard['id']}",
        data={"latitude": "91", "longitude": "0"},
    )
    partial_response = client.patch(
        f"/postcards/{postcard['id']}",
        data={"latitude": "41"},
    )

    assert out_of_range_response.status_code == 422
    assert partial_response.status_code == 400


def test_update_and_image_endpoints(client: httpx.Client, user: dict[str, object]):
    postcard = create_postcard(client, int(user["id"]))

    response = client.patch(
        f"/postcards/{postcard['id']}",
        data={
            "title": "Updated postcard",
            "latitude": "41.3874",
            "longitude": "2.1686",
        },
        files=postcard_files(),
    )

    assert response.status_code == 200, response.text
    assert response.json()["title"] == "Updated postcard"
    assert response.json()["coordinates"] == [41.3874, 2.1686]

    image_response = client.get(f"/postcards/{postcard['id']}/image")
    cover_response = client.get(f"/postcards/{postcard['id']}/cover")

    assert image_response.status_code == 200
    assert cover_response.status_code == 200
    assert image_response.headers["content-type"] == "image/jpeg"
    assert cover_response.headers["content-type"] == "image/jpeg"


def test_update_can_clear_optional_fields(
    client: httpx.Client,
    user: dict[str, object],
):
    postcard = create_postcard(
        client,
        int(user["id"]),
        acquisition_date="2024-06-12",
        date_precision="day",
    )

    response = client.patch(
        f"/postcards/{postcard['id']}",
        data={
            "title": "Without optional details",
            "adquisition_date_precision": "unknown",
            "country": "ES",
            "city": "",
            "region": "",
            "description": "",
            "latitude": "40",
            "longitude": "-3",
        },
    )

    assert response.status_code == 200, response.text
    assert response.json()["adquisition_date"] is None
    assert response.json()["city"] is None
    assert response.json()["region"] is None
    assert response.json()["description"] is None


def test_filters_and_pagination(client: httpx.Client, user: dict[str, object]):
    user_id = int(user["id"])
    create_postcard(
        client,
        user_id,
        title="Paris postcard",
        latitude=48.8566,
        longitude=2.3522,
        acquisition_date="2024-01-01",
        date_precision="day",
    )
    create_postcard(
        client,
        user_id,
        title="Madrid postcard",
        acquisition_date="2025-01-01",
        date_precision="day",
    )

    filtered_response = client.get(
        "/postcards/",
        params={"user_id": user_id, "title": "Paris"},
    )
    first_page_response = client.get(
        "/postcards/",
        params={
            "user_id": user_id,
            "sort_by": "adquisition_date",
            "page": 1,
            "page_size": 1,
        },
    )
    second_page_response = client.get(
        "/postcards/",
        params={
            "user_id": user_id,
            "sort_by": "adquisition_date",
            "page": 2,
            "page_size": 1,
        },
    )

    assert filtered_response.status_code == 200
    assert [item["title"] for item in filtered_response.json()] == ["Paris postcard"]
    assert first_page_response.status_code == 200
    assert second_page_response.status_code == 200
    assert len(first_page_response.json()) == 1
    assert len(second_page_response.json()) == 1
    assert date.fromisoformat(
        first_page_response.json()[0]["adquisition_date"]
    ) < date.fromisoformat(second_page_response.json()[0]["adquisition_date"])


def test_pagination_validation(client: httpx.Client):
    response = client.get("/postcards/", params={"page": 0, "page_size": 101})

    assert response.status_code == 422


def test_delete_postcard_removes_access_to_images(
    client: httpx.Client,
    user: dict[str, object],
):
    postcard = create_postcard(client, int(user["id"]))
    postcard_id = postcard["id"]

    delete_response = client.delete(f"/postcards/{postcard_id}")
    detail_response = client.get(f"/postcards/{postcard_id}")
    image_response = client.get(f"/postcards/{postcard_id}/image")
    cover_response = client.get(f"/postcards/{postcard_id}/cover")
    map_response = client.get(f"/postcards/{postcard_id}/map")

    assert delete_response.status_code == 200
    assert detail_response.status_code == 404
    assert image_response.status_code == 404
    assert cover_response.status_code == 404
    assert map_response.status_code == 404


def test_delete_user_cascades_postcards(client: httpx.Client, user: dict[str, object]):
    postcard = create_postcard(client, int(user["id"]))

    delete_response = client.delete(f"/users/{user['id']}")
    postcard_response = client.get(f"/postcards/{postcard['id']}")

    assert delete_response.status_code == 200
    assert postcard_response.status_code == 404


def test_duplicate_user_is_rejected(client: httpx.Client, user: dict[str, object]):
    response = client.post(
        "/users/",
        data={
            "username": user["username"],
            "email": user["email"],
            "password": "another-password",
        },
        files={
            "profile_image": ("profile.png", image_bytes(), "image/png"),
        },
    )

    assert response.status_code == 409


def test_missing_resources_return_not_found(client: httpx.Client):
    user_response = client.get("/users/999999")
    postcard_response = client.get("/postcards/999999")
    image_response = client.get("/postcards/999999/image")
    cover_response = client.get("/postcards/999999/cover")
    map_response = client.get("/postcards/999999/map")

    assert user_response.status_code == 404
    assert postcard_response.status_code == 404
    assert image_response.status_code == 404
    assert cover_response.status_code == 404
    assert map_response.status_code == 404


def test_invalid_user_is_rejected_on_postcard_creation(client: httpx.Client):
    response = client.post(
        "/postcards/",
        data={
            "user_id": "999999",
            "title": "Unknown user",
            "adquisition_date_precision": "unknown",
            "country": "Spain",
            "latitude": "40",
            "longitude": "-3",
        },
        files=postcard_files(),
    )

    assert response.status_code == 404


def test_unsupported_postcard_image_format_is_rejected(
    client: httpx.Client,
    user: dict[str, object],
):
    files = postcard_files()
    files["postcard_image"] = ("postcard.gif", files["postcard_image"][1], "image/gif")

    response = client.post(
        "/postcards/",
        data={
            "user_id": str(user["id"]),
            "title": "Unsupported image",
            "adquisition_date_precision": "unknown",
            "country": "Spain",
            "latitude": "40",
            "longitude": "-3",
        },
        files=files,
    )

    assert response.status_code == 415
