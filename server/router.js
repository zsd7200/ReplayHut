const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/info', mid.requiresSecure, controllers.Info.infoPage);
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getAccounts', mid.requiresLogin, controllers.Account.getAccounts);
  app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/users', mid.requiresSecure, mid.requiresLogin, controllers.Account.userList);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
  app.get('/create', mid.requiresLogin, controllers.Replay.createPage);
  app.post('/createClip', mid.requiresLogin, controllers.Replay.createClip);
  app.post('/maker', mid.requiresLogin, controllers.Domo.make);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
