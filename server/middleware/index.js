// page requires viewer to be logged in to view
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
};

// page requires user to be logged out to view
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/create');
  }

  return next();
};

// make sure user is connected securely
const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

// skip secure check
const bypassSecure = (req, res, next) => {
  next();
};

// exports to be used in router
module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
