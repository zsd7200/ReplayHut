// render infopage
const infoPage = (req, res) => {
  res.render('info', { csrfToken: req.csrfToken() });
};

// render notfoundpage
const notFoundPage = (req, res) => {
  res.render('uhoh', { csrfToken: req.csrfToken() });
};

// export these to be used in router
module.exports.infoPage = infoPage;
module.exports.notFoundPage = notFoundPage;
