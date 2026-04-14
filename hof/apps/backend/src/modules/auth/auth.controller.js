const service = require('./auth.service');

exports.login = async (req, res) => {
  try {
    const { username, senha } = req.body;

    const result = await service.login(username, senha);

    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};