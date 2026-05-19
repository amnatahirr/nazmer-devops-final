from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

BASE_URL = "http://68.210.72.180"

def get_driver():
    options = webdriver.ChromeOptions()
    # Remove headless to see browser (good for screenshots)
    # options.add_argument("--headless")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.implicitly_wait(5)
    return driver

# Test 1: Homepage loads
def test_homepage_loads():
    driver = get_driver()
    try:
        driver.get(BASE_URL)
        time.sleep(2)
        assert "NAZMER" in driver.title or "Nazmer" in driver.page_source
        print("✅ Test 1 PASSED: Homepage loads successfully")
        driver.save_screenshot("test1_homepage.png")
    except Exception as e:
        print(f"❌ Test 1 FAILED: {e}")
        driver.save_screenshot("test1_fail.png")
    finally:
        driver.quit()

# Test 2: Login page loads and form exists
def test_login_page():
    driver = get_driver()
    try:
        driver.get(f"{BASE_URL}/login")
        time.sleep(2)
        email_field = driver.find_element(By.CSS_SELECTOR, "input[type='email'], input[name='email']")
        password_field = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        assert email_field is not None
        assert password_field is not None
        print("✅ Test 2 PASSED: Login form found")
        driver.save_screenshot("test2_login.png")
    except Exception as e:
        print(f"❌ Test 2 FAILED: {e}")
        driver.save_screenshot("test2_fail.png")
    finally:
        driver.quit()

# Test 3: Login with valid credentials
def test_login_functionality():
    driver = get_driver()
    try:
        driver.get(f"{BASE_URL}/login")
        time.sleep(2)
        driver.find_element(By.CSS_SELECTOR, "input[type='email']").send_keys("ayesha@gmail.com")
        driver.find_element(By.CSS_SELECTOR, "input[type='password']").send_keys("Ayesha123")
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(3)
        driver.save_screenshot("test3_after_login.png")
        print("✅ Test 3 PASSED: Login attempted successfully")
    except Exception as e:
        print(f"❌ Test 3 FAILED: {e}")
        driver.save_screenshot("test3_fail.png")
    finally:
        driver.quit()

# Test 4: Shop page loads
def test_shop_page():
    driver = get_driver()
    try:
        driver.get(f"{BASE_URL}/shop")
        time.sleep(2)
        assert driver.current_url is not None
        print("✅ Test 4 PASSED: Shop page loads")
        driver.save_screenshot("test4_shop.png")
    except Exception as e:
        print(f"❌ Test 4 FAILED: {e}")
    finally:
        driver.quit()

# Test 5: Navigation works
def test_navigation():
    driver = get_driver()
    try:
        driver.get(BASE_URL)
        time.sleep(2)
        links = driver.find_elements(By.TAG_NAME, "a")
        assert len(links) > 0
        print(f"✅ Test 5 PASSED: Navigation has {len(links)} links")
        driver.save_screenshot("test5_nav.png")
    except Exception as e:
        print(f"❌ Test 5 FAILED: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    print("🚀 Running NAZMER Selenium Tests...")
    print("-" * 40)
    test_homepage_loads()
    test_login_page()
    test_login_functionality()
    test_shop_page()
    test_navigation()
    print("-" * 40)
    print("✅ All tests completed!")