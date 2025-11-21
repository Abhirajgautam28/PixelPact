
from playwright.sync_api import sync_playwright, expect

def verify_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Verify Demo Page Button
        print("Navigating to demo page...")
        page.goto("http://localhost:5173/demo")
        page.wait_for_load_state("networkidle")

        signup_btn = page.get_by_role("link", name="Sign Up to Save & Share")
        expect(signup_btn).to_be_visible()
        print("Found Sign Up button on Demo page")
        page.screenshot(path="verification/demo_page.png")

        # 2. Verify Guest Name Prompt
        # First create a room to get an invite link (simulated by just going to a board with invite param)
        # We don't need a real invite token from DB for the client-side prompt to appear,
        # as the prompt happens before the fetch to join-invite.
        print("Navigating to board with invite...")

        # Handle the prompt dialog
        def handle_dialog(dialog):
            print(f"Dialog appeared: {dialog.message}")
            dialog.accept("Test Guest")

        page.on("dialog", handle_dialog)

        page.goto("http://localhost:5173/board/room-test?invite=testtoken")

        # Wait a bit for the prompt to have triggered (it happens on mount/effect)
        page.wait_for_timeout(2000)

        page.screenshot(path="verification/guest_prompt_handled.png")

        browser.close()

if __name__ == "__main__":
    try:
        verify_changes()
        print("Verification script finished.")
    except Exception as e:
        print(f"Verification failed: {e}")
