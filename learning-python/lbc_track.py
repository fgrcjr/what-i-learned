import pandas as pd
import time  # Importing time module for sleep functionality
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import StaleElementReferenceException, TimeoutException

# Set up Chrome options
options = Options()
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.maximize_window()

# Initialize tracking numbers and empty list for collected data
tracking_numbers = ['123124', '142004582685', '1402020009176.']  # First should show no records, second has records
all_data = []  # List to collect data as dictionaries

# Open the tracking page
driver.get("https://www.lbcexpress.com/track/")

# Define error messages in an array
error_messages = [
    "We didn't find any records.",
    "Check your Tracking No. Make sure it's 5 to 17 digits",
    "Tracking No is invalid"
]

try:
    for tracking_number in tracking_numbers:
        driver.refresh()
        time.sleep(2)  # Adding a short delay after refreshing the page

        try:
            # Locate the tracking number input field, clear it, and enter the new tracking number
            enter_track_number = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.ID, "inputTrackingSearchForm"))
            )
            enter_track_number.clear()
            enter_track_number.send_keys(tracking_number)

            # Click the tracking button
            track_button = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.XPATH, "//div[@class='tt-sec-2 btntrackingSearchForm']"))
            )
            track_button.click()

            # Allow some time for the results to load
            time.sleep(1)  

            # Check for error messages
            found_error = False  # Flag to track if an error is found
            for error in error_messages:
                error_element = driver.find_elements(By.XPATH, f"//div[@class='status-tracking' and contains(text(), \"{error}\")]")
                if error_element:
                    if error == error_messages[0]:  # No records found
                        all_data.append({'Tracking Number': tracking_number, 'Date': 'No records', 'Status': 'No records'})
                        print(f"No records found for tracking number {tracking_number}")
                    elif error == error_messages[1]:  # Check digits message
                        all_data.append({'Tracking Number': tracking_number, 'Date': 'Invalid', 'Status': error})
                        print(f"Tracking number {tracking_number} is invalid due to digit check.")
                    elif error == error_messages[2]:  # Tracking No is invalid
                        all_data.append({'Tracking Number': tracking_number, 'Date': 'Invalid', 'Status': error})
                        print(f"Tracking number {tracking_number} is invalid.")
                    found_error = True  # Set the flag
                    break  # Exit the loop if any error is found

            if found_error:
                continue  # Move to the next tracking number if an error was found

            # Get date elements
            span_elements = WebDriverWait(driver, 15).until(
                EC.presence_of_all_elements_located((By.XPATH, "//span[contains(@class, 'date-track-a')]"))
            )

            # Get status elements and extract their text
            status_elements = WebDriverWait(driver, 15).until(
                EC.presence_of_all_elements_located((By.XPATH, "//span[contains(@class, 'status-tracking')]"))
            )

            # Extract the status text from the located elements
            statuses = [status.text for status in status_elements]

            # Extract the dates from the located elements
            dates = [element.text for element in span_elements]

            # Collect results in a list of dictionaries
            for date, status in zip(dates, statuses):
                all_data.append({'Tracking Number': tracking_number, 'Date': date, 'Status': status})

        except (StaleElementReferenceException, TimeoutException) as e:
            print(f"Exception encountered for tracking number {tracking_number}: {e}. Retrying...")

        # Adding a delay before processing the next tracking number
        time.sleep(1)  # Delay of 1 second before the next tracking number

    # Convert list of dictionaries to a DataFrame and print
    all_data_df = pd.DataFrame(all_data)
    print("Collected Tracking Data:")
    print(all_data_df)

finally:
    # Close the driver
    driver.quit()
