import os
from playwright.sync_api import sync_playwright

def run_verification():
    print("Starting Playwright verification...")

    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)

    with sync_playwright() as p:
        # Launch Chromium headless
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()

        try:
            # CUJ 1: Load Homepage
            print("Navigating to http://localhost:4028...")
            page.goto("http://localhost:4028")
            page.wait_for_timeout(2000)
            page.screenshot(path="/home/jules/verification/screenshots/homepage.png")

            # CUJ 2: Navigate to Albums page
            print("Navigating to http://localhost:4028/albums...")
            page.goto("http://localhost:4028/albums")
            page.wait_for_timeout(2000)
            page.screenshot(path="/home/jules/verification/screenshots/albums_page.png")

            # CUJ 3: Navigate to Album Details
            print("Navigating to http://localhost:4028/album-detail?id=void-frequencies...")
            page.goto("http://localhost:4028/album-detail?id=void-frequencies")
            page.wait_for_timeout(2000)
            page.screenshot(path="/home/jules/verification/screenshots/album_detail.png")

            # CUJ 4: Click on first track "Free Fall" to trigger player screen
            print("Clicking play track button...")
            first_track_btn = page.get_by_text("Free Fall", exact=True).first
            if first_track_btn.is_visible():
                first_track_btn.click()
                print("Clicked play track.")
                page.wait_for_timeout(2000)
                page.screenshot(path="/home/jules/verification/screenshots/album_player.png")
            else:
                print("Warning: Track button not found.")

            print("Verification CUJs completed successfully!")

        except Exception as e:
            print(f"Error during verification: {e}")
            page.screenshot(path="/home/jules/verification/screenshots/error.png")
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    run_verification()
