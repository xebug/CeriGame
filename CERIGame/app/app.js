var app = angular.module('MonAppli', []); // on charge le module mon appli qui se trouve dans index
app.controller('MonCont', MonCont);
app.service("accessDataService", accessDataService);
app.service('session', sessionService);
app.service('auth', AuthService);
app.service('profil', ProfService);
app.service('jeu', JeuService);
app.service('defi', DefiService);
app.service('allumette', AlluService);
