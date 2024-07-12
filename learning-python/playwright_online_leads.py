import time
import json
import random
import re

from faker import Faker

from playwright.sync_api import Playwright, sync_playwright

# Path of Photo file
photo_path_1 = 'stock_photos/stock1.jpeg'
photo_path_2 = 'stock_photos/stock2.jpeg'

def fake_client():
    fake_name = Faker('en_PH')
    name = fake_name.name()

    address = fake_name.luzon_province_address()
    subdivision = fake_name.subdivision_name()

    # part_name = name.split()
    # first_name = part_name[0].lower()
    # last_name = part_name[1].lower()
    # email = f"{first_name}.{last_name}@example.net"
    
    # number = fake_name.mobile_number()
    # number = number.replace("-", "")
    # mobile_number = number

    return name,address,subdivision

def run(playwright: Playwright) -> None:

    browser = playwright.chromium.launch(args=['--start-maximized'],headless=False)
    context = browser.new_context(no_viewport=True)
    page = context.new_page()

    page.goto("https://www.lhoopa.online/houseandlot-test")
    
    name, address, subdivision = fake_client()

    # Address
    page.locator("#autocomplete-input").click()
    page.locator("#autocomplete-input").fill('San Agustin II, Dasmariñas, Cavite')

    # Subdivision
    page.locator("[placeholder='Subdivision']").click()
    page.locator("[placeholder='Subdivision']").fill('Southcrest Village')

    # Lot Area
    page.locator("[placeholder='Lot Area (sqm)']").click()
    page.locator("[placeholder='Lot Area (sqm)']").fill('36')

    # Asking Price
    random_amount = random.randint(100000, 2000000)
    random_amount_rounded = round(random_amount, -3)
    price = str(random_amount_rounded)
    page.locator("[id='wi-w0znfkjz']").click()
    page.locator("[id='wi-w0znfkjz']").fill(price)

    # Property Type
    page.locator("[value='House and lot']").click()
    
    # Owner of property
    page.locator("[value='Yes']").click()

    # Land title
    page.locator("[id='42lyride']").click()

    page.mouse.wheel(0, 50)
    page.wait_for_timeout(1500)

    # Leads Source Info
    page.locator("[id='wi-h62motz2']").click()
    page.locator("[id='wi-h62motz2']").fill('Existing data sample')

    page.locator("[id='wi-s8hmuxlx']").click()
    page.locator("[id='wi-s8hmuxlx']").fill('ferdinand.gracia.lhoopa@gmail.com')

    page.locator("[id='wi-c3vyr6u6']").click()
    page.locator("[id='wi-c3vyr6u6']").fill('09176570129')

    # Interior
    interior = ["Bare","Semi-complete", "Complete"]
    sel_interior = random.choice(interior)
    page.select_option("select[name='interior']", sel_interior)

    # Repair
    repair = ["Minor repair","Medium repair", "Major repair", "Ground-up"]
    sel_repair = random.choice(repair)
    page.select_option("select[name='construct']", sel_repair)

    # Upload Photo 1
    file_input = page.locator('input[name="Photo_1"]')
    file_input.set_input_files(photo_path_1)

    # Upload Photo 2
    file_input = page.locator('input[name="Photo_2"]')
    file_input.set_input_files(photo_path_2)
    # page.wait_for_timeout(30000)

    # Submit
    page.locator("div").filter(has_text=re.compile(r"^Submit$")).nth(1).click()
    page.locator("div").filter(has_text=re.compile(r"^Close$")).nth(1).click()


    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
