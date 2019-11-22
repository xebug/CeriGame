/*
-Titre Service : accessDataService
Fonction du service:
-getInfo = function(url)
*/
function accessDataService($http) {
  /**
   * getInfo : la fonction getInfo retourne une promesse provenant du service http
   * @param url
   * @returns {*|Promise}
   */
  this.getInfo = function(url) {
    // Appel Ajax
    return $http
      .get(url)
      .then(function(response) { //First function handles success
          return (response.data);
        },
        function(response) {
          //Second function handles error
          return ("Something went wrong");
        });
  }
}
// ******************** FIN SERVICE ******************** //



/*
-Titre Service : AuthService
Fonction du service:
-logIn = function(login, pwd)
-logOut = function(login)
*/
function AuthService($http, session) {

  /*
  -Titre Fonction : logIn = function(login, pwd)
  Explication fonction: Permet la connexion d'un utilisateur.
  Entrée: nom d'utilisateur et mot de passe
  Sortie: tableau de reponse du serveur
  */
  this.logIn = function(login, pwd) {
    return $http // ne pas retourner une promesse a enlever, envoyer vers controller sans return http
      .get('/login?login=' + login + '&mdp=' + pwd)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service AuthService / Fonction Login / response.data :", response.data);
        var data = response.data;
        if (typeof data.username !== 'undefined') {
          var date = new Date();
          date.jour = date.getDate();
          date.mois = date.getMonth() + 1;
          date.annee = date.getFullYear().toString().substr(-2);
          date.heure = date.getHours();
          date.minute = date.getMinutes();
          date.seconde = date.getSeconds();
          if (date.annee <= 9) {
            date.annee = "0" + date.annee
          }
          if (date.jour <= 9) {
            date.jour = "0" + date.jour
          }
          if (date.mois <= 9) {
            date.mois = "0" + date.mois
          }
          if (date.minute <= 9) {
            date.minute = "0" + date.minute
          }
          if (date.seconde <= 9) {
            date.seconde = "0" + date.seconde
          }


          data.last_connect2 = session.getInfo('last_connect');

          session.setUser(data.name);
          session.setInfo('name', data.name);
          session.setInfo('username', data.username);
          session.setInfo('firstName', data.firstName);
          session.setInfo('last_connect', date.jour + "/" + date.mois + "/" + date.annee + " à " + date.heure + ":" + date.minute + ":" + date.seconde);


        }
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : logOut = function(login)
  Explication fonction: Permet la deconnection d'un utilisateur.
  Entrée: nom d'utilisateur
  Sortie: tableau de reponse du serveur
  */
  this.logOut = function(login) {
    return $http
      .get('/logout?login=' + login)
      .then(function(response) {
        session.destroy();
        return (response.data);
      });

  };
}
// ******************** FIN SERVICE ******************** //



/*
-Titre Service : ProfService
Fonction du service:
-chanGerNom = function(newname, username)
-chanGerPrenom = function(newfirstname, username)
-chanGerPhoto = function(newphoto, username)
-voirHisto = function()
-voirHistoDefi = function()
-voirTopTen = function()
*/
function ProfService($http, session) {

  /*
  -Titre Fonction : recupNom = function(id)
  Explication fonction: Permet de recuperer le username d'un l'utilisateur
  Entrée: id
  Sortie: username
  */
  this.recupNom = function(id) {
    return $http
      .get('/recupNomByID?iduser=' + id)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service ProfService / Fonction recupNom / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : chanGerNom = function(newname, username)
  Explication fonction: Permet la modification du nom de l'utilisateur
  Entrée: nouveau nom , nom d'utilisateur
  Sortie: tableau de reponse du serveur
  */
  this.chanGerNom = function(newname, username) {
    return $http
      .get('/modificationnom?nouveaunom=' + newname + '&username=' + username)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service ProfService / Fonction chanGerNom / responseData :", response.data);
        var data = response.data;
        if (typeof data.sucess == 'sucess') {
          session.setInfo('name', data.nom);
        }
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : chanGerPrenom = function(newfirstname, username)
  Explication fonction: Permet la modification du prenom de l'utilisateur
  Entrée: nouveau prenom , nom d'utilisateur
  Sortie: tableau de reponse du serveur
  */
  this.chanGerPrenom = function(newfirstname, username) {
    return $http
      .get('/modificationprenom?nouveauprenom=' + newfirstname + '&username=' + username)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service ProfService / Fonction chanGerPrenom / responseData :", response.data);
        var data = response.data;
        if (typeof data.sucess == 'sucess') {
          session.setInfo('firstName', data.prenom);
        }
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }


  /*
  -Titre Fonction : chanGerPhoto = function(newphoto)
  Explication fonction: Permet la modification de la photo de l'utilisateur
  Entrée: nouvelle photo
  Sortie: tableau de reponse du serveur
  */

  this.chanGerPhoto = function(newphoto) {
    return $http
      .get('/modificationphoto')
      .then(function(response) { //response de server.js avec res.send(responseData)
        var data = response.data;
        if (typeof data.sucess == 'sucess') {
          session.setInfo('photo', data.photo);
        }
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : voirHisto = function()
  Explication fonction: Permet de recuperer l'historique de jeu (solo) de l'utilisateur
  Entrée:
  Sortie: tableau de reponse du serveur
  */
  this.voirHisto = function() {
    return $http
      .get('/VoirHist?idutilisateur=')
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service ProfService / Fonction voirHisto / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : voirHistoDefi = function()
  Explication fonction: Permet de recuperer l'historique de jeu (defi) de l'utilisateur
  Entrée:
  Sortie: tableau de reponse du serveur
  */

  this.voirHistoDefi = function() {
    return $http
      .get('/VoirHistodefi')
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service ProfService / Fonction voirHistoDefi / responseData :", response.data);
        var data = response.data;

        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : voirTopTen = function()
  Explication fonction: Permet de recuperer le top 10 des utilisateurs
  Entrée:
  Sortie: tableau de reponse du serveur
  */

  this.voirTopTen = function() {
    return $http
      .get('/voirMeilleursJoueurs')
      .then(function(response) { //response de server.js avec res.send(responseData2)
        console.log("Service ProfService / Fonction TopTen / responseData :", response.data);
        var data = response.data;

        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : getUsers = function()
  Explication fonction: Permet d'obtenir la liste des utilisateurs connectés
  Entrée:
  Sortie: Tableau de reponse du serveur.
  */

  this.getUsers = function() {
    return $http
      .get('/getListOfUsers')
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Fonction getListOfUsers / responseData :", response.data);
        var data = response.data;

        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }


}
// ******************** FIN SERVICE ******************** //




/*
-Titre Service : JeuService
Fonction du service:
-getTheme = function()
-getQuestionParTheme = function(theme)
-sendScore = function(username,date,nbrep,temps,score)
-voirHisto = function(iduser)
*/
function JeuService($http) {

  /*
  -Titre Fonction : getTheme = function()
  Explication fonction: Permet de recuperer la liste des themes
  Entrée:
  Sortie: Tableau de reponse du serveur qui contient la liste de tous les themes
  */
  this.getTheme = function() {
    return $http
      .get('/ThemeList')
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service JeuService / Fonction ThemeList / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : getQuestionParTheme = function(theme)
  Explication fonction: Permet de recuperer la des questions d'un theme
  Entrée: theme
  Sortie: Tableau de reponse du serveur qui contient les questions de theme
  */
  this.getQuestionParTheme = function(theme) {
    return $http
      .get('/ThemeQuestion?theme=' + theme)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service JeuService / Fonction getQuestionParTheme / responseData :", response.data);
        var data = response.data;

        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : sendScore = function(username,date,nbrep,temps,score)
  Explication fonction: Permet d'envoyer le score a la fin d'une partie
  Entrée: nom d'utilisateur, date, nombre de bonne reponse, temps de la partie, score.
  Sortie: Tableau de reponse du serveur.
  */
  this.sendScore = function(username, date, nbrep, temps, score) {
    return $http
      .get('/sendScore?user=' + username + '&date=' + date + '&nbrep=' + nbrep + '&time=' + temps + '&score=' + score)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service JeuService / Fonction sendScore / responseData :", response.data);
        var data = response.data;

        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

}
// ******************** FIN SERVICE ******************** //



/*
-Titre Service : DefiService
Fonction du service:
-getUsersToDefi
-SendDefi
-getNbDefi
-getLastDefi
-CancelDefi
-sendWinner

*/
function DefiService($http) {


  /*
  -Titre Fonction : getUsersToDefi = function()
  Explication fonction: Permet d'obtenir la liste des utilisateurs pour leurs lancer un defi
  Entrée:
  Sortie: Tableau de reponse du serveur.
  */

  this.getUsersToDefi = function() {
    return $http
      .get('/getListOfUsers')
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service DefiService / Fonction getListOfUsers / responseData :", response.data);
        var data = response.data;

        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : SendDefi = function()
  Explication fonction: Permet d'envoyer un defi
  Entrée: json du defi
  Sortie: Tableau de reponse du serveur.
  */

  this.SendDefi = function(json) {
    return $http
      .get('/SendDefiToUsers?json=' + json)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service DefiService / Fonction SendDefi / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : getNbDefi = function()
  Explication fonction: Permet d'obtenir le nombre de defi en attente
  Entrée:
  Sortie: Tableau de reponse du serveur.
  */

  this.getNbDefi = function() {
    return $http
      .get('/getNombreDefi?idutilisateur=')
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service DefiService / Fonction getNbDefi / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : getLastDefi = function()
  Explication fonction: Permet d'obtenir le dernier defi à accepter ou refuser.
  Entrée: id utilisateur
  Sortie: Tableau de reponse du serveur.
  */

  this.getLastDefii = function(id) {
    return $http
      .get('/getLastDefi?idutilisateur=' + id)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service DefiService / Fonction getLastDefi / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : CancelDefi = function()
  Explication fonction: Permet de refuser un defi et de se déclarer perdant
  Entrée: identifiant mongodb du defi, id user defie, id user defiant, id user gagnant, date.
  Sortie: Tableau de reponse du serveur.
  */

  this.CancelDefi = function(idmongo, defie, defiant, gagnant, date) {
    return $http
      .get('/RefuseDefi?idmongo=' + idmongo + '&defie=' + defie + '&defiant=' + defiant + '&gagnant=' + gagnant + '&date=' + date)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service DefiService / Fonction CancelDefi / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  /*
  -Titre Fonction : sendWinner = function()
  Explication fonction: Permet de declarer qu'on a gagné un defi
  Entrée: id sql du defi, id utilisateur gagnant
  Sortie: Tableau de reponse du serveur.
  */
  this.sendWinner = function(idsql, idGagnant) {
    return $http
      .get('/SendWinner?idsql=' + idsql + '&gagnant=' + idGagnant)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service DefiService / Fonction SendWinner / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }




}
// ******************** FIN SERVICE ******************** //



/*
-Titre Service : AlluService
Fonction du service:

*/
function AlluService($http) {

  this.SendDefi = function(json) {
    return $http
      .get('/SendDefiToUsersAllu?json=' + json)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service AlluService / Fonction SendDefi / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }


  this.getLastDefii = function() {
    return $http
      .get('/getLastDefiAllu')
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service AlluService / Fonction getLastDefi / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  this.GagnerDefi = function(defie, defiant, gagnant, date) {
    return $http
      .get('/GagnerDefiAllu?defie=' + defie + '&defiant=' + defiant + '&gagnant=' + gagnant + '&date=' + date)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service AlluService / Fonction CancelDefi / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  this.SupprDefi = function(idmongo) {
    return $http
      .get('/SupprMongoAllum?idmongo=' + idmongo)
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service AlluService / Fonction CancelDefi / responseData :", response.data);
        var data = response.data;
        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }

  this.voirHisto = function() {
    return $http
      .get('/VoirHistodefiAllumette')
      .then(function(response) { //response de server.js avec res.send(responseData)
        console.log("Service ProfService / Fonction VoirHistodefiAllumette / responseData :", response.data);
        var data = response.data;

        return (response.data); // data retourne ici et est renvoyé vers controller
      });
  }



}
// ******************** FIN SERVICE ******************** //



/*
-Titre Service : sessionService
Fonction du service:
-getUser = function()
-setUser = function(user)
-setInfo = function(key, value)
-getInfo = function(key)
-destroy = function()
*/
function sessionService($log, $window) {
  this._user = JSON.parse($window.localStorage.getItem('session.user'));
  this.getUser = function() {
    return this._user;
  };
  this.setUser = function(user) {
    this._user = user;
    $window.localStorage.setItem('session.user', JSON.stringify(user));
    return this;
  };
  this.setInfo = function(key, value) {
    $window.localStorage.setItem('session.' + key, JSON.stringify(value));
  };
  this.getInfo = function(key) {
    return JSON.parse($window.localStorage.getItem('session.' + key));
  }
  this.destroy = function() {
    // On supprime toute les donnee sauf la date de derniere connexion
    $window.localStorage.removeItem('session.name');
    $window.localStorage.removeItem('session.username');
    $window.localStorage.removeItem('session.firstName');
    //this._user = null;

  }
}
// ******************** FIN SERVICE ******************** //
