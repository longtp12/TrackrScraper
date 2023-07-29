import { request } from "./requestMethod.js";
import puppeteer from "puppeteer";
import j2cp from "json2csv"
import fs from "fs";
import { uploadToDB, uploadToDBAnyway } from "./scrapeWebstoreType1.js";

const launchBrowser = async (stores) => {
  // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch({ 
    args:[
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote,"
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
  const page = await browser.newPage();
  try {
    await scrapeAllStoresType2(page, stores);
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
};

const scrapeAllStoresType2 = async (page, stores) => {
  let allScrapedGames = [];
  for (const store of stores) {
    if (store.type === 2) {
      console.log("Scraping from store: " + store.name);
      const scrapedGames = await scrapePlatformsType2(page, store);
      allScrapedGames = allScrapedGames.concat(scrapedGames);
    }
  }
  return allScrapedGames;
};

const scrapePlatformsType2 = async (page, store) => {
  let allScrapedGames = [];
  try {
    const urls = store.firstPageUrl;

    for (const platform in urls) {
      console.log("scraping from " + platform);
      const scrapedGames = await scrapeOneUrlType2(
        page,
        store,
        urls[platform],
        platform
      );
      allScrapedGames = allScrapedGames.concat(scrapedGames);
    }
  } catch (err) {
    console.log(err);
  }
  return allScrapedGames;
};

const scrapeOneUrlType2 = async (page, store, url, platform) => {
  if (!url) return [];
  await page.goto(url);
  try {
    let scrapedGames = [];
    while (true) {
      await page.waitForSelector(store.productSelector, { timeout: 5000 });

      const games = await page.evaluate(
        (store, platform) => {
          const productSelector = Array.from(
            document.querySelectorAll(store.productSelector)
          );

          const extractPriceValue = (price) => {
            return price ? price.replace(/[^\d]/g, "") : ""; // Replace non-numeric characters except period (.)
          };
          return productSelector
            .map((e) => {
              const title = e.querySelector(
                store.productTitleSelector
              )?.innerText;
              const currentPrice = Number(extractPriceValue(
                e.querySelector(store.productCurrentPriceSelector)?.innerText
              ));
              const originalPrice = extractPriceValue(
                e.querySelector(store.productOriginalPriceSelector)?.innerText
              );
              const link = e.querySelector(store.productLinkSelector)?.href;
              const storeName = store.name;

              if (!currentPrice) {
                return null;
              }
              return {
                title,
                platform,
                storeName,
                retailPrice: [
                  {
                    price: currentPrice,
                  },
                ],
                originalPrice: originalPrice ? originalPrice : "",
                link,
              };
            })
            .filter((game) => game !== null);
        },
        store,
        platform
      );

      scrapedGames = scrapedGames.concat(games);

      //   UPLOAD TO DB

      // await uploadToDB(games)
      await uploadToDBAnyway(games)

      const nextButton = await page.$(store.nextPageSelector);

      const isDisabled = await nextButton.evaluate((node) =>
        node.classList.contains("disabled" || "active")
      );
      if (isDisabled) {
        console.log("Next button is disabled. Ending scraping.");
        break; // End the scraping process
      }

      await nextButton.click();

      // Wait for the next page to load
      await page.waitForNavigation();
      // await page.screenshot({path:"example.png", fullPage:true})
    }

    return scrapedGames;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const writeFile = (scrapedGames) => {
  const fields = [
    "title",
    "platform",
    "storeName",
    "currentPrice",
    "originalPrice",
    "link",
  ];
  const parser = new j2cp.Parser({ fields });
  const csv = parser.parse(scrapedGames);
  fs.writeFileSync("./games.csv", csv);
};

const getStores = async () => {
  const response = await request.get("/store");
  return response.data;
};

export const scrapeAllStoreType2 = async (stores) => {
  launchBrowser(stores);
};
