import { Browser, Builder, By, Key, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";
import { expect } from "chai";
import chromedriver from "chromedriver";

describe("Testiranje funkcionalnosti OLX.ba sistema", function () {
  let driver;

  beforeEach(async function () {
    this.timeout(60000);
    
    let options = new chrome.Options();
    
    
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-infobars');
    options.excludeSwitches('enable-logging');
    
    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
    
    await driver.get("https://www.olx.ba");
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: 10000 });
    
   
    await driver.sleep(3000);
    
   
    try {
      let acceptButton = await driver.wait(
        until.elementLocated(By.css("button[mode='primary']")),
        5000
      );
      await driver.wait(until.elementIsVisible(acceptButton), 3000);
      await acceptButton.click();
      await driver.sleep(1000);
    } catch (error) {
      console.log("Cookie popup već zatvoren ili nije pronađen");
    }
  });

  afterEach(async function () {
    if (driver) {
      try {
        await driver.quit();
      } catch (error) {
        console.log("Greška pri zatvaranju drivera:", error.message);
      }
    }
  });

  it("Test 1: Testiranje pretrage i validacija URL parametara", async function () {
    this.timeout(40000);
    
   
    let searchField = await driver.wait(
      until.elementLocated(By.css("input[type='search']")),
      10000
    );
    await driver.wait(until.elementIsVisible(searchField), 5000);
    await searchField.click();
    await searchField.clear();
    await searchField.sendKeys("laptop");
    await driver.sleep(500);
    await searchField.sendKeys(Key.ENTER);
    
    await driver.wait(
      until.urlContains("pretraga"),
      10000
    );
    
    let currentUrl = await driver.getCurrentUrl();
    let pageSource = await driver.getPageSource();
    let hasResults = pageSource.includes("pretraga") || pageSource.includes("laptop");
    
  
    expect(currentUrl).to.include("pretraga");
    expect(currentUrl).to.include("q=laptop");
    expect(hasResults).to.be.true;
    console.log(" Pretraga URL:", currentUrl);
  });

  it("Test 2: Testiranje filtriranja po kategoriji Automobili", async function () {
    this.timeout(40000);
    
    
    let kategorijeLink = await driver.wait(
      until.elementLocated(By.linkText("Kategorije")),
      10000
    );
    await driver.wait(until.elementIsVisible(kategorijeLink), 5000);
    await kategorijeLink.click();
    
    await driver.sleep(2000);
    
    let automobiliLink = await driver.wait(
      until.elementLocated(By.linkText("Automobili")),
      10000
    );
    await driver.wait(until.elementIsVisible(automobiliLink), 5000);
    await automobiliLink.click();
    
    await driver.wait(
      until.urlContains("category_id"),
      10000
    );
    
    let currentUrl = await driver.getCurrentUrl();
    let pageTitle = await driver.getTitle();
    
   
    expect(currentUrl).to.include("category_id");
    expect(pageTitle.toLowerCase()).to.include("automobil");
    console.log("Kategorija učitana:", currentUrl);
  });

  it("Test 3: Testiranje scroll funkcionalnosti", async function () {
    this.timeout(40000);
    
   
    let heightBefore = await driver.executeScript("return window.pageYOffset;");
    
    await driver.executeScript("window.scrollTo(0, 1000);");
    await driver.sleep(1000);
    
    let heightAfter = await driver.executeScript("return window.pageYOffset;");
    
    
    expect(heightAfter).to.be.greaterThan(heightBefore);
    console.log(` Scroll: ${heightBefore} → ${heightAfter}px`);
  });

  it("Test 4: Testiranje navigacije kroz kategorije", async function () {
    this.timeout(40000);
    
    
    let pocetniUrl = await driver.getCurrentUrl();
    
    
    let kategorijeLink = await driver.wait(
      until.elementLocated(By.linkText("Kategorije")),
      10000
    );
    await driver.wait(until.elementIsVisible(kategorijeLink), 5000);
    await kategorijeLink.click();
    
    await driver.sleep(2000);
    
    let nekretnineLink = await driver.wait(
      until.elementLocated(By.linkText("Nekretnine")),
      10000
    );
    await driver.wait(until.elementIsVisible(nekretnineLink), 5000);
    await nekretnineLink.click();
    
    await driver.wait(
      until.urlContains("category_id"),
      10000
    );
    
    let urlNekretnine = await driver.getCurrentUrl();
    
    await driver.navigate().back();
    await driver.sleep(3000);
    
    let urlNazad = await driver.getCurrentUrl();
    
    
    expect(pocetniUrl).to.equal("https://olx.ba/");
    expect(urlNekretnine).to.include("category_id");
    expect(urlNazad).to.not.equal(urlNekretnine);
    console.log(" Navigacija: Početna → Nekretnine → Nazad");
  });

  it("Test 5: Testiranje validacije prazne pretrage", async function () {
    this.timeout(40000);
    
    
    let searchField = await driver.wait(
      until.elementLocated(By.css("input[type='search']")),
      10000
    );
    await driver.wait(until.elementIsVisible(searchField), 5000);
    await searchField.click();
    await searchField.clear();
    
    let vrijednostPrije = await searchField.getAttribute("value");
    
    await searchField.sendKeys(Key.ENTER);
    await driver.sleep(3000);
    
    let currentUrl = await driver.getCurrentUrl();
    
  
    expect(vrijednostPrije).to.equal("");
    expect(currentUrl).to.include("olx.ba");
    expect(currentUrl).to.satisfy((url) => 
      url === "https://olx.ba/" || url.includes("pretraga?q=")
    );
    console.log(" Prazna pretraga validirana:", currentUrl);
  });

  it("Test 6: Testiranje input funkcionalnosti search polja", async function () {
    this.timeout(40000);
    
    
    let searchField = await driver.wait(
      until.elementLocated(By.css("input[type='search']")),
      10000
    );
    await driver.wait(until.elementIsVisible(searchField), 5000);
    
    await searchField.click();
    await searchField.sendKeys("telefon");
    await driver.sleep(500);
    let vrijednost1 = await searchField.getAttribute("value");
    
    
    await searchField.click();
    await searchField.sendKeys(Key.CONTROL, "a"); // Selektuj sve
    await searchField.sendKeys(Key.BACK_SPACE); // Obriši
    await driver.sleep(500);
    let vrijednost2 = await searchField.getAttribute("value");
    
    await searchField.sendKeys("auto");
    await driver.sleep(500);
    let vrijednost3 = await searchField.getAttribute("value");
    
    
    expect(vrijednost1).to.equal("telefon");
    expect(vrijednost2).to.equal("");
    expect(vrijednost3).to.equal("auto");
    console.log(" Input: 'telefon' → clear → 'auto'");
  });

  it("Test 7: Testiranje logo elementa i povratka na početnu", async function () {
    this.timeout(40000);
    
    
    let logo = await driver.wait(
      until.elementLocated(By.css("a[aria-label*='OLX']")),
      10000
    );
    await driver.wait(until.elementIsVisible(logo), 5000);
    let isLogoDisplayed = await logo.isDisplayed();
    
    
    let kategorijeLink = await driver.wait(
      until.elementLocated(By.linkText("Kategorije")),
      10000
    );
    await driver.wait(until.elementIsVisible(kategorijeLink), 5000);
    await kategorijeLink.click();
    
    await driver.sleep(2000);
    
    let automobiliLink = await driver.wait(
      until.elementLocated(By.linkText("Automobili")),
      10000
    );
    await driver.wait(until.elementIsVisible(automobiliLink), 5000);
    await automobiliLink.click();
    
    await driver.wait(
      until.urlContains("category_id"),
      10000
    );
    
    let urlPrije = await driver.getCurrentUrl();
 
    logo = await driver.wait(
      until.elementLocated(By.css("a[aria-label*='OLX']")),
      10000
    );
    await driver.wait(until.elementIsVisible(logo), 5000);
    await logo.click();
    
    await driver.sleep(3000);
    
    let urlPoslije = await driver.getCurrentUrl();
    
    
    expect(isLogoDisplayed).to.be.true;
    expect(urlPrije).to.include("category_id");
    expect(urlPoslije).to.equal("https://olx.ba/");
    console.log(" Logo vraća na početnu stranicu");
  });

  it("Test 8: Testiranje višestrukih pretraga", async function () {
    this.timeout(50000);
    

    let searchField = await driver.wait(
      until.elementLocated(By.css("input[type='search']")),
      10000
    );
    await driver.wait(until.elementIsVisible(searchField), 5000);
    await searchField.sendKeys("telefon");
    await driver.sleep(500);
    await searchField.sendKeys(Key.ENTER);
    
    await driver.wait(
      until.urlContains("q=telefon"),
      10000
    );
    
    let url1 = await driver.getCurrentUrl();
    
    
    await driver.navigate().back();
    await driver.sleep(3000);
    
    searchField = await driver.wait(
      until.elementLocated(By.css("input[type='search']")),
      10000
    );
    await driver.wait(until.elementIsVisible(searchField), 5000);
    await searchField.clear();
    await searchField.sendKeys("bicikl");
    await driver.sleep(500);
    await searchField.sendKeys(Key.ENTER);
    
    await driver.wait(
      until.urlContains("q=bicikl"),
      10000
    );
    
    let url2 = await driver.getCurrentUrl();
    
    // Assert
    expect(url1).to.include("q=telefon");
    expect(url2).to.include("q=bicikl");
    console.log("Telefon → nazad → bicikl");
  });

  it("Test 9: Testiranje prisustva navigacionih elemenata", async function () {
    this.timeout(40000);
    
    
    let allLinks = await driver.findElements(By.css("a"));
    let brojLinkova = allLinks.length;
    
    let searchField = await driver.wait(
      until.elementLocated(By.css("input[type='search']")),
      10000
    );
    let isSearchVisible = await searchField.isDisplayed();
    
    let logo = await driver.wait(
      until.elementLocated(By.css("a[aria-label*='OLX']")),
      10000
    );
    let isLogoVisible = await logo.isDisplayed();
    
    let kategorijeLink = await driver.wait(
      until.elementLocated(By.linkText("Kategorije")),
      10000
    );
    let isKategorijeVisible = await kategorijeLink.isDisplayed();
    
    
    expect(brojLinkova).to.be.greaterThan(10);
    expect(isSearchVisible).to.be.true;
    expect(isLogoVisible).to.be.true;
    expect(isKategorijeVisible).to.be.true;
    console.log(` ${brojLinkova} linkova, search, logo i kategorije vidljivi`);
  });

  it("Test 10: Testiranje metapodataka stranice", async function () {
    this.timeout(40000);
    
  
    let pageTitle = await driver.getTitle();
    let currentUrl = await driver.getCurrentUrl();
    
    let searchField = await driver.wait(
      until.elementLocated(By.css("input[type='search']")),
      10000
    );
    await driver.wait(until.elementIsVisible(searchField), 5000);
    
    let placeholder = await searchField.getAttribute("placeholder");
    let searchType = await searchField.getAttribute("type");
    
  
    expect(pageTitle).to.include("OLX");
    expect(currentUrl).to.equal("https://olx.ba/");
    expect(placeholder).to.not.be.empty;
    expect(searchType).to.equal("search");
    console.log(` Naslov: "${pageTitle}", Type: ${searchType}`);
  });
});