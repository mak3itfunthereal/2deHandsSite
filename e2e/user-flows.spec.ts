import { test, expect } from "@playwright/test";

test.describe("Main User Flows", () => {
  test.beforeEach(async ({ context, page }) => {
    // Pre-set cookie consent to avoid modal blocking interaction
    await context.addCookies([
      {
        name: "bidzaar_cookie_consent",
        value: "necessary",
        domain: "localhost",
        path: "/",
      },
    ]);
    // Navigate to homepage before each test
    await page.goto("/#/");
    // Wait for the app container to render
    await expect(page.locator(".app")).toBeVisible();
  });

  test("1. Login flow: user can log in with valid credentials and access account", async ({ page }) => {
    // Navigate to login page
    await page.goto("/#/login");
    await expect(page.locator("h1")).toContainText("Log in to Bidzaar");

    // Fill in credentials
    await page.fill('input[type="email"]', "testuser@example.com");
    await page.fill('input[type="password"]', "supersecret123");

    // Submit login form
    await page.click('button[type="submit"].primary');

    // Verify redirect to account page
    await expect(page).toHaveURL(/#\/account/);
    await expect(page.locator(".action-notice")).toBeVisible();
    await expect(page.locator(".action-notice")).toContainText("You are logged in again");

    // Verify account profile info is shown
    await expect(page.locator(".profile-summary h1")).toBeVisible();
  });

  test("2. Ad post flow: user can create and publish a new listing", async ({ page }) => {
    // Navigate to sell page
    await page.goto("/#/sell");
    await expect(page.locator("h1")).toContainText("Add photos");

    // Step 1: Photos -> proceed
    await page.click('button.primary:has-text("Next step")');

    // Step 2: Details -> fill title, category, description
    await expect(page.locator("h1")).toContainText("Tell us about your item");
    const listingTitle = "Playwright Vintage Gazelle Fiets";
    await page.fill('input[placeholder="e.g. Product 1"]', listingTitle);
    await page.fill(
      'textarea[placeholder*="Describe any damage"]',
      "Zeer nette Gazelle fiets, inclusief slot en werkende verlichting via de test runner.",
    );
    await page.click('button.primary:has-text("Next step")');

    // Step 3: Price -> fill asking price
    await expect(page.locator("h1")).toContainText("Set your price");
    await page.fill('.big-price-input input[type="number"]', "185");
    await page.click('button.primary:has-text("Next step")');

    // Step 4: Delivery / Pickup -> proceed
    await expect(page.locator("h1")).toContainText("Delivery or pickup");
    await page.click('button.primary:has-text("Next step")');

    // Step 5: Review listing and publish
    await expect(page.locator("h1")).toContainText("Review your listing");
    await expect(page.locator(".review-ad h2")).toContainText(listingTitle);
    await expect(page.locator(".review-ad strong")).toContainText("€ 185");

    // Publish listing
    await page.click('button.primary:has-text("Post listing")');

    // Verify success notification and success screen
    await expect(page.locator(".action-notice")).toBeVisible();
    await expect(page.locator(".action-notice")).toContainText(
      "Your listing has been posted successfully!",
    );
    await expect(page.locator("h1")).toContainText("Your listing is live!");

    // Navigate to newly created product
    await page.click('button.primary:has-text("View your listing")');
    await expect(page).toHaveURL(/#\/product\/\d+/);
    await expect(page.locator(".detail-page h1")).toContainText(listingTitle);
  });

  test("3. Bidding flow: user can place an offer and view highest bid", async ({ page }) => {
    // Navigate to product detail page
    await page.goto("/#/product/1");
    await expect(page.locator(".detail-page h1")).toBeVisible();

    // Click "Make an offer"
    const offerButton = page.locator('button:has-text("Make an offer")');
    await expect(offerButton).toBeVisible();
    await offerButton.click();

    // Verify offer modal appears
    const modal = page.locator(".modal");
    await expect(modal).toBeVisible();
    await expect(modal.locator(".eyebrow")).toContainText("Make an offer");

    // Set offer amount higher than existing bids
    const offerInput = modal.locator('.offer-input input[type="number"]');
    await offerInput.fill("199");

    // Optional message
    await modal.locator("textarea").fill("Ik kan de fiets vanavond ophalen.");

    // Submit offer
    await modal.locator('button.primary:has-text("Send offer via chat")').click();

    // Modal closes and user is redirected to conversation
    await expect(modal).not.toBeVisible();
    await expect(page).toHaveURL(/#\/chat/);
    await expect(page.locator(".bubble.mine").last()).toContainText("I offer €199");

    // Return to product to verify bid is recorded in bids list
    await page.goto("/#/product/1");
    await expect(page.locator(".bids-card")).toContainText("€ 199");
    await expect(page.locator(".highest-bid-badge")).toContainText("€199");
  });

  test("4. Buy now flow: user can buy with Buyer Protection and complete purchase", async ({
    page,
  }) => {
    // Navigate to product detail page for product 2
    await page.goto("/#/product/2");
    await expect(page.locator(".detail-page h1")).toBeVisible();

    // Click "Buy now with Buyer Protection"
    const buyNowBtn = page.locator("button.buy-now");
    await expect(buyNowBtn).toBeVisible();
    await buyNowBtn.click();

    // Verify secure checkout modal opens
    const checkoutModal = page.locator(".checkout-modal");
    await expect(checkoutModal).toBeVisible();
    await expect(checkoutModal.locator("h2")).toContainText("Complete your order");

    // Verify Buyer Protection fee is included
    await expect(checkoutModal.locator(".checkout-breakdown")).toContainText("Buyer Protection service");
    await expect(checkoutModal.locator(".checkout-breakdown")).toContainText("€0.99");
    await expect(checkoutModal.locator(".checkout-row.total")).toBeVisible();

    // Click pay button to confirm order
    const payBtn = checkoutModal.locator("button.primary");
    await expect(payBtn).toBeVisible();
    await payBtn.click();

    // Verify order success confirmation
    await expect(checkoutModal.locator(".checkout-success-view")).toBeVisible();
    await expect(checkoutModal.locator("h2")).toContainText("Thank you for your purchase");
    await expect(checkoutModal).toContainText("BID-");

    // Verify system notice
    await expect(page.locator(".action-notice")).toBeVisible();
    await expect(page.locator(".action-notice")).toContainText(
      "Your purchase is protected by Buyer Protection",
    );

    // Close checkout and verify product is marked as sold
    await checkoutModal.locator('button.secondary:has-text("Go to home")').click();
    await page.goto("/#/product/2");
    await expect(page.locator('span:has-text("This item has been sold")')).toBeVisible();
  });
});
