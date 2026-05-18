const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { expect } = require("chai");

describe("Frontend UI Tests - Clothing Website", function () {
    this.timeout(30000);

    let driver;

  before(async () => {
    const options = new chrome.Options();
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");

    driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();
});

    after(async () => {
        await driver.quit();
    });

    it("should load homepage", async () => {
        await driver.get("http://localhost:3000");

        const title = await driver.getTitle();
        expect(title).to.not.be.null;
    });

   
});