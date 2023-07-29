import axios from "axios"
import { request } from "./requestMethod.js";

const getGameDetails = async (gameId) => {
  const apiKey = "9bb25f76335d42f4a4be5b872a9dca9c"; // Replace with your RAWG API key
  const url = `https://api.rawg.io/api/games/${gameId}?key=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
};

// Usage

const getGamesByPlatform = async (platform, totalPages) => {
  const apiKey = "9bb25f76335d42f4a4be5b872a9dca9c";
  const pageSize = 35; // Set a large value for page_size (e.g., 40)

  try {
    for (let page = 18; page <= totalPages; page++) {
      const url = `https://api.rawg.io/api/games?key=${apiKey}&platforms=${platform}&page_size=${pageSize}&released=true&page=${page}`;
      const response = await axios.get(url);
      const gamesData = response.data.results;
      // Process each game data and retrieve the game details

      const retrievedGames = [];
      for (const game of gamesData) {
        const gameDetails = await getGameDetails(game.id);
        const shortScreenshots = game?.short_screenshots.map(
          (screenshots) => screenshots.image
        );
        const genres = game.genres?.map((genre) => genre.name);
        const platforms = game?.parent_platforms.map(
          (platform) => platform.platform.name
        );
        const developers = gameDetails?.developers.map(
          (developer) => developer.name
        );
        const publishers = gameDetails?.publishers.map(
          (publisher) => publisher.name
        );
        const title = game.name;
        const slug = game.slug;
        const backgroundImage = game.background_image;
        const metaScore = game?.metacritic;
        const description = gameDetails?.description;
        const releaseDate = gameDetails?.released;

        const gameObj = {
          title,
          slug,
          releaseDate,
          platforms,
          genres,
          developers,
          publishers,
          metaScore,
          backgroundImage,
          shortScreenshots,
          description,
        };

        retrievedGames.push(gameObj);
      }
      await request.post("/game", {
        games: retrievedGames,
      });
      console.log("Finished uploading: " + platform + " " + page);
      retrievedGames.length = 0;
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
};
const uploadGames = async () => {
  const ps5 = 187;
  const ps4 = 18;
  const ps3 = 16;
  const nintendoSwitch = 7;
  const totalPages = 92;
  await getGamesByPlatform(ps3, totalPages);
  // console.log(games);
  console.log("Finished Uploading");
};

// uploadGames();

const getGamesFromDB = async () => {
  const response = await request.get("/game");
  return response.data;
};

const getGameCopiesFromDB = async () => {
  const response = await request.get("/gameCopy");
  return response.data;
};

const searchForGameCopiesByName = async (title) => {
  const response = await request.post("/gameCopy/search", { title });
  return response.data;
};

const searchForGameCopiesByStore = async (store) => {
  const response = await request.get(`/gameCopy/search?storeName=${store}`);
  return response.data;
};

const filterGamesWithoutCopies = async () => {
  try {
    const games = await getGamesFromDB();
    console.log("get games successful");
    for (const game of games) {
      console.log("searching for copies of " + game.title);
      const gameCopies = await searchForGameCopiesByName(game.title);
      if (!gameCopies || gameCopies.length === 0) {
        console.log("No copies available! Delete " + game.title);
        await request.delete(`/game/${game._id}`);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// filterGamesWithoutCopies();

// const deleteGameByStore = async (store) => {
//   try {
//     const gameCopies = await searchForGameCopiesByStore(store);
//     // console.log(gameCopies);
//     for (const gameCopy of gameCopies) {
//       console.log("Deleting " + gameCopy.title);
//       await request.delete(`/gameCopy/${gameCopy._id}`);
//     }
//   } catch (error) {
//     console.error(error);
//   }
// };
const deleteGameByStore = async (store) => {
  try {
    const gameCopies = await searchForGameCopiesByStore(store);
    const batchSize = 100; // Define the batch size according to your needs

    for (let i = 0; i < gameCopies.length; i += batchSize) {
      const batch = gameCopies.slice(i, i + batchSize);
      const gameCopyIds = batch.map((gameCopy) => gameCopy._id);

      if (gameCopyIds.length > 0) {
        await request.delete("/gameCopy", {
          data: {
            condition: { _id: { $in: gameCopyIds } },
          },
        });
        console.log(`Deleted ${gameCopyIds.length} game copies`);
      }
    }
  } catch (error) {
    console.error(error);
  }
};



deleteGameByStore("gamestation");
