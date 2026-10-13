import { test as base } from "@playwright/test";

export { expect, type Page, type Locator } from "@playwright/test";

/** Learning flows must not depend on the advertiser accepting the test machine's IP. */
export const test = base.extend<{ learningAds: void }>({
  learningAds: [async ({ context }, use) => {
    await context.route("**/ads/banner*", route => route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html lang='en'><head><title>Ad placeholder</title></head><body></body></html>",
    }));
    await use();
  }, { auto: true }],
});
