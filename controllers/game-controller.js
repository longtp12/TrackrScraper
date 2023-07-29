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
