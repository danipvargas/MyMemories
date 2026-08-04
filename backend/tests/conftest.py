from collections.abc import Generator
from os import environ
from uuid import uuid4

import httpx
import pytest

from tests.helpers import image_bytes


@pytest.fixture(scope="session")
def api_url() -> str:
    url = environ.get("API_BASE_URL", "http://localhost:8000").rstrip("/")

    try:
        response = httpx.get(f"{url}/openapi.json", timeout=5)
        response.raise_for_status()
    except httpx.HTTPError as error:
        pytest.fail(
            f"API is not available at {url}. Start the backend before running "
            f"the integration tests: {error}"
        )

    return url


@pytest.fixture
def client(api_url: str) -> Generator[httpx.Client]:
    with httpx.Client(base_url=api_url, timeout=10) as test_client:
        yield test_client


@pytest.fixture
def user(client: httpx.Client) -> Generator[dict[str, object]]:
    suffix = uuid4().hex[:10]
    response = client.post(
        "/users/",
        data={
            "username": f"test-{suffix}",
            "email": f"test-{suffix}@example.com",
            "password": "test-password",
        },
        files={
            "profile_image": (
                "profile.png",
                image_bytes(),
                "image/png",
            )
        },
    )

    assert response.status_code == 201, response.text
    created_user = response.json()

    yield created_user

    client.delete(f"/users/{created_user['id']}")
