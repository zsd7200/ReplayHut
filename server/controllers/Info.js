const infoPage = (req, res) => {
  res.render('info', { csrfToken: req.csrfToken() });
};

module.exports.infoPage = infoPage;
