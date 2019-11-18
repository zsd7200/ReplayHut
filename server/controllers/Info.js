const infoPage = (req, res) => {
  res.render('info', { csrfToken: req.csrfToken() });
};

const notFoundPage = (req, res) => {
  res.render('uhoh', { csrfToken: req.csrfToken() });
};


module.exports.infoPage = infoPage;
module.exports.notFoundPage = notFoundPage;
