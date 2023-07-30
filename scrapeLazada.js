import puppeteer from "puppeteer";
import { request } from "./requestMethod.js";

const scrapeSearch = async (page, url) => {
  await page.goto(url);

  const games = await page.evaluate(() => {
    const productSelector = Array.from(document.querySelectorAll(".qmXQo"));
    return productSelector.map((e) => {
      const title = e.querySelector(".RfADt a").innerText;
      const price = e.querySelector(".ooOxS").innerText;
      const link = e.querySelector(".RfADt a").href;
      const formattedPrice = price.replace(/[^\d]/g, "");
      console.log(title);
      return {
        title,
        retailPrice: [{ price: formattedPrice }],
        link,
        storeName: "Lazada",
      };
    });
  });
  return games;
};
// const scrapeDetail = async (detailUrl, page) => {
//   // const browser = await puppeteer.launch({ headless: "new" });
//   // const page = await browser.newPage();
//   await page.goto(detailUrl);
//   // await page.waitForSelector(".seller-name__detail a.seller-name__detail-name");
//   const sellerName = await page.$eval(
//     ".seller-name__detail a.seller-name__detail-name",
//     (e) => e.innerText
//   );
//   const positiveRating = await page.$eval(
//     ".pdp-seller-info-pc div:nth-child(1) > div.seller-info-value.rating-positive",
//     (e) => e.innerText
//   );
//   const deliveredOnTime = await page.$eval(
//     ".pdp-seller-info-pc div:nth-child(2) > div.seller-info-value",
//     (e) => e.innerText
//   );
//   const responseRate = await page.$eval(
//     ".pdp-seller-info-pc div:nth-child(3) > div.seller-info-value",
//     (e) => e.innerText
//   );
//   return { sellerName, positiveRating, deliveredOnTime, responseRate };
// };

const filterGames = (unFilteredGames, gameTitle) => {
  const filteredGames = unFilteredGames.filter((game) => {
    return game.title.toLowerCase().includes(gameTitle.toLowerCase());
  });
  return filteredGames;
};

const scrapeByGameTitles = async (page, browser, pageCounter) => {
  console.log(pageCounter);
  const games = await request.get(`/game/?gamesPerPage=15&page=${pageCounter}`);

  if (games.data.length === 0) {
    return await browser.close();
  }
  let gameTitles = games.data.map((game) => game.title);
  console.log(gameTitles);

  await request.put("/scrape/lastScrape", {
    lastScrapeAt: Date.now(),
    lastScrapeAtPage: pageCounter,
    lastScrapeGames: gameTitles,
  });

  for (const gameTitle of gameTitles) {
    const formatedGameTitle = gameTitle.toLowerCase().replace(/\s/g, "%20");

    const url = `https://www.lazada.vn/catalog/?q=đĩa%20game%20${formatedGameTitle}`;
    console.log(url);
    console.log(`scraping for copies of ${gameTitle}`);

    const unFilteredGames = await scrapeSearch(page, url);
    const filteredGames = await filterGames(unFilteredGames, gameTitle);
    await uploadToDB(filteredGames);
  }
  pageCounter++;
  gameTitles = [];

  await scrapeByGameTitles(page, browser, pageCounter);
};

const uploadToDB = async (gameData) => {
  try {
    for (const gameCopy of gameData) {
      const response = await request.post("/gameCopy/search/detail", {
        title: gameCopy.title,
        storeName: gameCopy.storeName,
        link: gameCopy.link,
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

export const scrapeLazada = async (isProcessing, initialPage) => {
  const oneHour = 60 * 60 * 1000;
  const twoMins = 2 * 60 * 1000;
  const browser = await puppeteer.launch({
    userDataDir: "./userDataDir",
    args:[
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote,"
    ],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
  if (!isProcessing) return;
  const page = await browser.newPage();

  const timeoutId = setTimeout(() => {
    isProcessing = false;
    console.log("Scraping stopped. Time limit exceeded (1 hour).");
    browser.close();
  }, oneHour);

  try {
    await scrapeByGameTitles(page, browser, initialPage);
  } catch (error) {
    // console.log(error);
  } 
};
