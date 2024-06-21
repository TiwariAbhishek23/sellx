from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import os
import requests
from bs4 import BeautifulSoup
from PIL import Image, UnidentifiedImageError
from io import BytesIO
import logging

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/healthcheck")
def hello_world():
    return {"message": "Healthcheck is working fine"}

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Define the base destination folder
desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
base_destination_folder = os.path.join(desktop_path, "sellx")

class ScrapeRequest(BaseModel):
    url: HttpUrl

class ScrapeResponse(BaseModel):
    images: list[str]
    dataText: str

@app.post("/api/scrape", response_model=ScrapeResponse, responses={200: {"description": "Scraping successful"}, 500: {"description": "Scraping failed"}})
async def scrape(request: ScrapeRequest):
    url = request.url
    if not url:
        raise HTTPException(status_code=400, detail="URL not provided")

    try:
        # Fetch the webpage
        logging.info(f"Fetching webpage: {url}")
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract heading and description
        heading_element = soup.find(class_='VU-ZEz')
        description_element = soup.find(class_='yN+eNk w9jEaj')

        if not heading_element or not description_element:
            raise HTTPException(status_code=404, detail="Heading or description not found")

        heading = heading_element.get_text(strip=True)
        description = description_element.get_text(strip=True)

        # Create destination folder
        folder_path = os.path.join(base_destination_folder, heading)
        os.makedirs(folder_path, exist_ok=True)
        logging.info(f"Created directory: {folder_path}")

        # Write description to a text file
        data_text = f"Heading: {heading}\nDescription: {description}"
        with open(os.path.join(folder_path, 'Data.txt'), 'w') as file:
            file.write(data_text)
        logging.info(f"Saved description to text file")

        # Download and convert images
        image_elements = soup.find_all(class_='_0DkuPH')
        # Fallback mechanism for images
        if not image_elements:
            image_elements = soup.find_all(class_='DByuf4 IZexXJ jLEJ7H')
        image_urls = []
        for index, img in enumerate(image_elements):
            img_url = img.get('src')
            if not img_url:
                continue

            img_url = img_url.replace('/128/128/', '/720/720/').replace('.webp', '.jpg')
            try:
                img_response = requests.get(img_url)
                img_response.raise_for_status()
                image = Image.open(BytesIO(img_response.content))
                image_path = os.path.join(folder_path, f'image_{index + 1}.jpg')
                image.save(image_path, 'JPEG')
                image_urls.append(image_path)
                logging.info(f"Saved image {image_path}")
            except (requests.RequestException, UnidentifiedImageError) as e:
                logging.warning(f"Failed to process image {img_url}: {e}")
                continue

        return ScrapeResponse(
            images=image_urls,
            dataText=data_text
        )

    except requests.RequestException as e:
        logging.error(f"Request error: {e}")
        raise HTTPException(status_code=400, detail=f"Request error: {e}")
    except Exception as e:
        logging.error(f"Internal server error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

