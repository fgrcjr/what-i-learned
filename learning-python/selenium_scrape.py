import time
import random
import re
import math
import json

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException

from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from datetime import datetime, date as dt, time
from geopy.geocoders import Nominatim
from faker import Faker

options = Options()

# Comment this if execution is not headless
options.add_argument('--headless')
options.add_argument('--no-sandbox')
# Comment this if execution is not headless

options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

fake_name = Faker('en_PH')

def fake_client():
    name = fake_name.name()
    
    part_name = name.split()
    first_name = part_name[0].lower()
    last_name = part_name[1].lower()
    email = f"{first_name}.{last_name}@example.net"
    
    number = fake_name.mobile_number()
    number = number.replace("-", "")
    mobile_number = number

    return name,email,mobile_number
def get_location(coordinates):
    coordinates_str = coordinates.strip("[]")
    longitude_str, latitude_str  = coordinates_str.split(',')
    latitude = float(latitude_str)
    longitude = float(longitude_str)
    if (latitude is not None and longitude is not None) and ((-90 <= latitude <= 90) and (-180 <= longitude <= 180)) or (latitude != 0 and longitude != 0):
        geolocator = Nominatim(user_agent="reverse_geocoding")
        location = geolocator.reverse((latitude, longitude), exactly_one=True)
        location = str(location)
        pattern_to_remove = r", Pilipinas / Philippines"
        address = re.sub(pattern_to_remove, "", location)
    else:
        address = "No address"
    return address

def get_floor_lot(f_area, l_area):
    if f_area is not None:
        floor_area = int(math.ceil(float(f_area)))
    else:
        floor_area = random.randint(10, 80)

    if l_area is not None:
        lot_area = int(math.ceil(float(l_area)))
    else:
        lot_area = random.randint(50, 80)
    return floor_area, lot_area

def get_subdivision_name(subdivision):
    if subdivision is None:
        subdivision = fake_name.subdivision_name()
    return subdivision

def extract_data(listings):
    listing_array = []
    for listing in listings:
        price = listing.get_attribute("data-price")
        floor_area = listing.get_attribute("data-building_size")
        lot_area = listing.get_attribute("data-land_size")

        subdivision = listing.get_attribute('data-subdivisionname')
        subdivision = get_subdivision_name(subdivision)

        coordinates = listing.get_attribute('data-geo-point')
        address = get_location(coordinates)

        name, email, mobile_number = fake_client()
        
        interior = ["Bare","Semi-complete", "Complete"]
        interior = random.choice(interior)

        repair = ["Minor repair","Medium repair", "Major repair", "Ground-up"]
        repair = random.choice(repair)

        listing_text = {
            "address": address,
            "price": price,
            "lot_area": lot_area,
            "floor_area": floor_area,
            "subdivision": subdivision,
            "interior": interior,
            "repair": repair,
            "full_name": name,
            "email": email,
            "mobile_number": mobile_number
        }
        listing_array.append(listing_text)
    return listing_array


driver.maximize_window()
driver.get("https://www.lamudi.com.ph/")

select_house = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//select[@class="SearchWidget-el"]')))
select_house.click()

select = Select(select_house)
select.select_by_visible_text('House')

button_element = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//button[@class="SearchBar-button js-searchButton"]')))
button_element.click()

price_select = driver.find_element(By.XPATH, "(//div[contains(@class,'UiDropDown-header')])[5]")
price_select.click()

price_point = driver.find_element(By.XPATH, "//li[normalize-space()='Below 2.5M']")
price_point.click()

search = driver.find_element(By.XPATH, '//button[@class="UiButton  "]')
search.click()

pagination = "//select[@class='sorting nativeDropdown js-pagination-dropdown']"
element_found = False

while not element_found:
    try:
        page_number = driver.find_element(By.XPATH, pagination)
        element_found = True
    except NoSuchElementException:
        driver.execute_script("window.scrollBy(0, 30);")

list_url = []
csv_data = []
scrape ='source'

get_page_start = 20
get_page_end = 24

current_url = driver.current_url  

# check URL
for i in range(get_page_start, get_page_end):
     page_url = current_url + "?page=" + str(i)
     list_url.append(page_url)

# check listings per page
for urls in list_url:
        listings = driver.find_elements(By.XPATH, "//div[@class='ListingCell-AllInfo ListingUnit']")
        listing_array = extract_data(listings)
        csv_data.extend(listing_array)
        driver.get(urls)

json_filename = "output_" + str(scrape) + ".json"

try:
    with open(json_filename, 'w', encoding='utf-8') as json_file:
        json.dump(csv_data, json_file, default=str, indent=2)
except Exception as e:
    print("An error occurred:", e)        