import Game from "../models/Game.js";

export const getGamesPaging = async (req, res) => {
  const page = parseInt(req.query.page);
  const gamesPerPage = parseInt(req.query.gamesPerPage);

  try {
    const skipCount = (page - 1) * gamesPerPage;

    const games = await Game.find().skip(skipCount).limit(gamesPerPage);

    res.status(200).json(games);
  } catch (error) {
    res.status(500).json(error);
  }
};

export const addGames = async (req, res) => {
  const gamesData = req.body.games;
  try {
    const newGames = [];

    for (const gameData of gamesData) {
      const { title } = gameData;

      // Check if the game copy already exists
      const existingGame = await Game.findOne({ title });

      if (existingGame) {
        console.log(`Skipping existing game copy: ${title}`);
        continue; // Skip to the next game copy
      }

      const newGame = await Game.create(gameData);
      newGames.push(newGame);
    }

    res.status(200).json(newGames);
  } catch (error) {
    res.status(500).json(error);
  }
};