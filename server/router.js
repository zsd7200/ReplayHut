const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getAccounts', mid.requiresLogin, controllers.Account.getAccounts);
  app.get('/getMyAccount', mid.requiresLogin, controllers.Account.getMyAccount);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/users', mid.requiresSecure, mid.requiresLogin, controllers.Account.userList);

  app.get('/myAccount', mid.requiresSecure, mid.requiresLogin, controllers.Account.myAccount);

  app.post('/activatePremium', mid.requiresLogin, controllers.Account.activatePremium);
  app.post('/cancelPremium', mid.requiresLogin, controllers.Account.cancelPremium);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.get('/info', mid.requiresSecure, controllers.Info.infoPage);

  app.post('/createClip', mid.requiresLogin, controllers.Replay.createClip);
  app.get('/create', mid.requiresLogin, controllers.Replay.createPage);
  app.get('/gallery', mid.requiresSecure, mid.requiresLogin, controllers.Replay.galleryPage);
  app.get('/getClips', mid.requiresLogin, controllers.Replay.getClips);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
