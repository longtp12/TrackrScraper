import axios from "axios";
import cheerio from "cheerio";
import { request } from "./requestMethod.js";


export const scrapeAllStoresType1Cheerio = async (filteredStores,stores) => {
  try {
    const scrapedGames = [];

    for (const store of filteredStores) {
      if (store.type === 1) {
        const storeIndex = stores.indexOf(store);
        await request.put("/scrape/lastScrapeWebstore", {
          lastScrapeAt: Date.now(),
          lastScrapeAtStore: store.name,
          lastScrapeAtStoreIndex: storeIndex,
        });
        console.log("Scraping from store: " + store.name);
        await scrapePlatformsType1Cheerio(store, scrapedGames);
      }
    }

    return scrapedGames;
  } catch (err) {
    // console.error(err);
    return [];
  }
};

const scrapePlatformsType1Cheerio = async (store, scrapedGames) => {
  try {
    const urls = store.firstPageUrl;

    for (const platform in urls) {
      console.log("Scraping from platform: " + platform);
      const platformGames = await scrapeOneUrlType1Cheerio(
        urls[platform],
        store,
        platform,
        1
      );
      scrapedGames.push(...platformGames);
    }
  } catch (err) {
    // console.log(err);
  }
};





const scrapeOneUrlType1Cheerio = async (
  url,
  store,
  platform,
  pageCounter,
  scrapedGames = []
) => {
  if (store.type === 2) return scrapedGames;

  if (!url) return scrapedGames;
  console.log(url);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const game = $(store.productSelector);

    // CHECK PRODUCT ELEMENTS
    if (game.length === 0) {
      console.log("Product selector not found. Ending scraping.");
      return scrapedGames;
    }

    let duplicateFound = false;
    const gameDataArr = [];

    game.each((index, element) => {

      const title = $(element).find(store.productTitleSelector).text().trim();

      const currentPriceElement = $(element).find(
        store.productCurrentPriceSelector
      );
      const originalPriceElement = $(element).find(
        store.productOriginalPriceSelector
      );

      let currentPrice = extractPriceValue(currentPriceElement.text().trim());
      let originalPrice = extractPriceValue(originalPriceElement.text().trim());
      // Exclude original price from current price if it exists
      if (originalPrice) {
        currentPrice = Number(currentPrice.replace(originalPrice, "").trim());
      } else if (!originalPrice) {
        currentPrice = Number(currentPrice);
      }

      const link = $(element).find(store.productLinkSelector).attr("href");

      // CHECK IF THERE IS A PRICE
      if (!currentPrice) {
        return;
      }

      const gameData = {
        title,
        platform,
        storeName: store.name,
        retailPrice: [{ price: currentPrice }],
        originalPrice,
        link: store.baseUrl + link,
      };

      // CHECK DUPLICATES
      if (
        scrapedGames.some(
          (existingGame) =>
            existingGame.link === gameData.link &&
            existingGame.platform === gameData.platform
        )
      ) {
        console.log("Duplicate found:", gameData);
        duplicateFound = true;
        return false; // Stop the each loop
      }

      scrapedGames.push(gameData);
      gameDataArr.push(gameData);
    });
    if (duplicateFound) return scrapedGames;

    // await uploadToDB(gameDataArr);
    await uploadToDBAnyway(gameDataArr);

    pageCounter++;
    store.nextPageUrl.splice(1, 1, pageCounter);
    const nextPage = store.firstPageUrl[platform] + store.nextPageUrl.join("");

    return await scrapeOneUrlType1Cheerio(
      nextPage,
      store,
      platform,
      pageCounter,
      scrapedGames
    );
  } catch (error) {
    // console.error(error);
    return scrapedGames;
  }
};

function extractPriceValue(price) {
  return price.replace(/[^\d]/g, ""); // Replace non-numeric characters except period (.)
}

export const uploadToDB = async (gameData) => {
  try {
    // console.log(gameData);
    for (const gameCopy of gameData) {
      // console.log(gameCopy);
      const response = await request.post("/gameCopy/search/detail", {
        title: gameCopy.title,
        storeName: gameCopy.storeName,
        platform: gameCopy.platform,
      });
      const existedGame = response.data[0];
      if (existedGame) {
        if (
          existedGame.retailPrice[0].price !== gameCopy.retailPrice[0].price
        ) {
          await request.put(`/gameCopy/${existedGame._id}`, {
            newPrice: gameCopy.retailPrice[0].price,
          });
          console.log("Updated Price on copy of " + gameCopy.title);
        } else if (
          existedGame.retailPrice[0].price === gameCopy.retailPrice[0].price
        ) {
          console.log("No changes on " + gameCopy.title);
          continue;
        }
      } else if (!existedGame) {
        await request.post("/gameCopy", { gameCopies: gameCopy });
        console.log("Uploaded " + gameCopy.title);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
export const uploadToDBAnyway = async (gameData) => {
  try {
    for (const gameCopy of gameData) {
      const response = await request.post("/gameCopy/search/detail", {
        title: gameCopy.title,
        storeName: gameCopy.storeName,
        platform: gameCopy.platform,
        link: gameCopy.link
      });
      const existedGame = response.data[0];
      if (existedGame) {
        await request.put(`/gameCopy/${existedGame._id}`, {
          newPrice: gameCopy.retailPrice[0].price,
        });
        console.log("Updated Price on copy of " + gameCopy.title);
      } else if (!existedGame) {
        await request.post("/gameCopy", { gameCopies: gameCopy });
        console.log("Uploaded " + gameCopy.title);
      }
    }
  } catch (err) {
    console.error(err);
  }
};
