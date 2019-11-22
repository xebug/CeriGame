function MonCont($scope, auth, profil, accessDataService, jeu, defi, allumette, $interval, $timeout, $anchorScroll) {

  // Declaration des variables scope
  $scope.userid = null; // Id utilisateur.
  $scope.username = null; // Nom d'utilisateur.
  $scope.password = null; // Mot de passe.
  $scope.connected = false; // Statut connecté ou non.
  $scope.JeuLance = false; // Statut jeu lancé ou non.
  $scope.messageConnexion = ""; // Message d'erreur de connexions
  $scope.bandeauPrincipal = false; // Bandeau principal qui contient le menu.
  $scope.bandeauVisible = false; // Bandeau de notification.
  $scope.bandeauProfil = false;
  $scope.bandeauChoisirUtilisateurDefiAllu = false;
  $scope.bandeauHistoriqueDefi = false;
  $scope.bandeauProfilConnect = false; // Bandeau d'affichage des profils connectés.
  $scope.bandeauChangerProfil = false; // Bandeau d'affichage de modification du profil.
  $scope.bandeauQuizzChoixTheme = false; //Bandeau d'affichage du choix de thème.
  $scope.bandeauQuizzJeuEnCours = false; //Bandeau de jeu en cours (choix d'une reponse).
  $scope.bandeauHistorique = false; // Bandeau d'affichage de l'historique.
  $scope.bandeauChoisirUtilisateurDefi = false; // Bandeau choisir utilisateur pour defi
  $scope.bandeauSiDefiEnAttente = false; // Bandeau qui affiches le defi en attentes
  $scope.bandeauDefiAttente = false; // Bandeau qui dis si il y a un défi en attente
  $scope.bandeauNouveauJeu = false; // bandeau ETAPE 5.
  $scope.bandoTopTen = false; // Bandeau qui affiche le top 10 du quizz


  /*
  	-Titre fonction : $scope.menu = function()
  	-Explication fonction : Fonction servant à retourner au menu principal
  	-Entrée :
  	-Sortie:
  */

  $scope.menu = function() {
    $scope.bandeau = null;
    $scope.JeuLance = false;
    $scope.bandeauQuizzChoixTheme = false;
    $scope.bandeauQuizzChoixNiveau = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauPrincipal = true;
    $scope.bandeauNouveauJeu = false;
    $scope.bandoTopTen = false;
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;
    $scope.bandeauProfilConnect = false;
    $scope.bandeauChangerProfil = false;

  }

  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.login = function()
  -Explication fonction : Fonction servant à la connexion d'un utilisateur
  Appel la fonction auth.logIn de service avec en entré username et password.
  -Entrée :
  -Sortie: Mise a jour des variables scopes : connected,userid,nom,prenom,photo,bandeau.
  */
  $scope.login = function() {
    auth.logIn($scope.username, $scope.password).then(function(data) {
      if (typeof data.username == 'undefined') {
        $scope.bandeau = data.statusMsg;
        $scope.bandeauVisible = true;
        $scope.messageConnexion = data.statusMsg;
      } else {
        $scope.bandeau = "Bonjour " + data.username + ". Derniere connexion : " + data.last_connect2;
        $scope.connected = true;
        $scope.bandeauPrincipal = true;
        $scope.bandeauVisible = true;
        $scope.userid = data.userID;
        $scope.nom = data.name;
        $scope.prenom = data.firstName;
        $scope.username = data.username;
        $scope.photo = data.imageProfil;
        $scope.nbDefiEnAttente = 0;
        $scope.recup = $interval(function() {
          $scope.recupNbDefi();
        }, 10000); // verifie si il à un defi toute les 10 secondes
        $scope.chercherDefiAllumete10 = $interval(function() {
          $scope.RecupLastDefiAllu();
        }, 10000); // verifie si il à un defi allumete toute les 10 secondes				$scope.initalisationVariableJeu(); //initialise les variables jeux.
        $scope.initalisationVariableModifProfil(); // initialisation variables modifications profil
        $scope.initalisationVariableJeu();

        $scope.socket = io.connect(); //$scope.socket pour afficher les connexions/deconnection



        //ecoute de connexion
        $scope.socket.on('socketLoginFromServer', function(data) { // On écoute la réponse du serveur
          $scope.$apply(function() {
            console.log('Quequ un s est connecte');
            if (data.pseudo != $scope.username && $scope.connected == true) {
              $anchorScroll(); // Permet de remonter en haut de page pour voir une notification.
              $scope.bandeausocketOn = true;
              $scope.bandeausocket = data.pseudo + " est " + data.statut;
            }
          });
          $timeout(function() {

            $scope.$apply(function() {
              $scope.bandeausocketOn = false;
              $scope.bandeausocket = null;
            });
          }, 4000);
        });
        // ecoute de Deconnexion
        $scope.socket.on('socketLogoutFromServer', function(data) { // On écoute la réponse du serveur
          $scope.$apply(function() {
            console.log('Quequ un s est deconnecte');
            if (data.pseudo != $scope.username && $scope.connected == true) {
              $anchorScroll(); // Permet de remonter en haut de page pour voir une notification.
              $scope.bandeausocketOn = true;
              $scope.bandeausocket = data.pseudo + " est " + data.statut;
            }
          });
          $timeout(function() {

            $scope.$apply(function() {
              $scope.bandeausocketOn = false;
              $scope.bandeausocket = null;
            });
          }, 4000);
        });

        // Parties $scope.socketS
        $scope.socket.emit('socketLogin', { //$scope.socket émit au serveur lorsque l'utilisateur se connecte
          pseudo: data.username,
          statut: "en ligne !"
        });

      }
    });
  };
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.logOut = function()
  -Explication fonction : Fonction servant à la deconnection d'un utilisateur
  Appel la fonction auth.logOut de service avec en entré username.
  -Entrée :
  -Sortie: Mise a jour des variables scopes : connected,userid,nom,prenom,photo,bandeau.
  */
  $scope.logOut = function() {
    $scope.bandeauVisible = false; // on masque les bandeaux
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;
    // on masque les bandeaux
    $scope.bandeauProfilConnect = false; // On masque les bandeaux
    $scope.connected = false; // statut de connection OFF
    $scope.bandeauPrincipal = false; // statut de connection OFF
    $scope.bandeauQuizzChoixTheme = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauQuizzChoixNiveau = false;
    $scope.bandeauQuizzJeuEnCours = false;
    $scope.bandeauChangerProfil = false;
    $scope.bandeauChoisirUtilisateurDefi = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandoTopTen = false;
    $scope.JeuLance = false;
    $scope.bandeauDefiAttente = false;
    $scope.messageConnexion = "";
    $scope.socket.emit('socketLogout', { // socket émit au serveur lorsque l'utilisateur se déconnecte
      pseudo: $scope.username,
      statut: "hors ligne !"
    });
    $scope.socket.off();
    auth.logOut($scope.username); // appel de la fonction logOut dans service
    $interval.cancel($scope.recup); // arret recherche defi
    $interval.cancel($scope.chercherDefiAllumete10); // arret defi allumete

  }
  // **************** FIN DE FONCTION **************** //






  /*
  -Titre fonction : $scope.AfficheProfil = function()
  -Explication fonction : Fonction servant a afficher le profil
  -Entrée :
  -Sortie:
  */
  $scope.AfficheProfil = function() {
    $scope.bandeauChoisirUtilisateurDefi = false;
    $scope.bandeauVisible = false; // on desafiche le bandeau de notification
    $scope.bandeauProfil = true; // on affiche le bandeau profil
    $scope.bandeauProfilConnect = false; // on affiche le bandeau profil
    $scope.bandoTopTen = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandeauDefiAttente = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;


  }
  // **************** FIN DE FONCTION **************** //






  /*
  -Titre fonction : $scope.DesafficheProfil = function()
  -Explication fonction : Fonction servant à masque le profil
  -Entrée :
  -Sortie:
  */
  $scope.DesafficheProfil = function() {

    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;
    // on masque le bandeau profil
    $scope.bandeauVisible = false; // on masque le bandeau de notification
    $scope.bandeauChangerProfil = false;


  }
  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.AfficheProfilConnect = function()
  -Explication fonction : Fonction servant à afficher le profil des utilisateurs connectés
  -Entrée :
  -Sortie:
  */
  $scope.AfficheProfilConnect = function() {
    $scope.bandeauChoisirUtilisateurDefi = false;
    $scope.bandeauVisible = false; // on masque le bandeau de notification
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;

    $scope.bandeauProfilConnect = true; // on affiche le bandeau profil des utilisateurs connectés
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandeauDefiAttente = false;
    $scope.bandoTopTen = false;
    $scope.pasdephoto = "http://pedago02a.univ-avignon.fr/~uapv1604417/TheCeriGameProfil/APP/CERIGame/images/pasdephoto.png";
    $scope.recupProfil();

  }
  // **************** FIN DE FONCTION **************** //

  /*
  -Titre fonction : $scope.DesafficheProfilConnect = function()
  -Explication fonction : Fonction servant à masquer le profil des utilisateurs connectés
  -Entrée :
  -Sortie:
  */
  $scope.DesafficheProfilConnect = function() {

    $scope.bandeauProfilConnect = false; // on masque le bandeau profil des utilisateurs connectés
    $scope.bandeauVisible = false; // on masque le bandeau de notification
    $scope.bandeauChangerProfil = false;
    $scope.bandoTopTen = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandeauDefiAttente = false;

  }
  // **************** FIN DE FONCTION **************** //

  /*
  -Titre fonction : $scope.choisirDefi()
  -Explication fonction : Permet de choisir un utilisateur a défié apres la fin d'une partie ou d'un defi.
  -Entrée : id du défi
  -Sortie:
  */

  $scope.recupProfil = function() {
    profil.getUsers().then(function(data) {
      $scope.listeUtilisateur = data;
      $scope.listeUtilisateur = $scope.listeUtilisateur.resultat.rows;
      console.log("utilisateur", $scope.listeUtilisateur);
    });
  }

  // **************** FIN DE FONCTION **************** //

  /*
  -Titre fonction : $scope.VoirHistorique = function()
  -Explication fonction : Fonction servant a afficher l'historique de jeu et de fi
  Elle fais appel a la fonction voirHisto et voirHistoDefi du service qui lui renvoie les tableau des historiques.
  -Entrée :
  -Sortie: Tableau historique utilisateur
  */
  $scope.VoirHistorique = function() {

    $scope.bandeauChoisirUtilisateurDefi = false;
    $scope.bandeauHistorique = true;
    $scope.bandeauHistoriqueDefi = true;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandoTopTen = true;
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;
    // on desafiche le bandeau profil
    $scope.bandeauProfilConnect = false;
    $scope.bandeauVisible = false; // on desafiche le bandeau de notification
    $scope.bandeauChangerProfil = false;
    $scope.bandeauDefiAttente = false;

    profil.voirHisto().then(function(data) {
      if (data.resultat.rows.length != '0') {
        $scope.historique = data.resultat.rows;
        for (i = 0; i < $scope.historique.length; i++) {
          date = new Date($scope.historique[i].date);
          date = 'Le ' + ("0" + date.getDate()).slice(-2) + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + ' à ' + ("0" + date.getHours()).slice(-2) + 'h' + ("0" + date.getMinutes()).slice(-2);
          $scope.historique[i].date = date;
        }
      } else {
        $scope.bandeau = "Historique vide";
        $scope.bandeauVisible = true;
        $scope.bandeauHistorique = false;
      }
    });

    profil.voirHistoDefi().then(function(data) {
      if (data.tableau.length != '0') {
        //$scope.historiqueDefi = data.resultat;
        console.log("retour de histo defi", data.tableau);
        $scope.bandeauHistoriqueDefi = true;
        $scope.histoDefi = data.tableau;



      } else {
        $scope.bandeau = "Historique defi vide";
        $scope.bandeauVisible = true;
        $scope.bandeauHistoriqueDefi = false;
      }
    });
    $scope.gettopTen();

  }
  // **************** FIN DE FONCTION **************** //





  /*
  -Titre fonction : $scope.DesafficheHistorique = function()
  -Explication fonction : Fonction servant a dessaficher l'historique
  -Entrée :
  -Sortie:
  */
  $scope.DesafficheHistorique = function() {

    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;
    // on desafiche le bandeau profil
    $scope.bandeauProfilConnect = false; // on masque le bandeau profil connecté
    $scope.bandeauVisible = false; // on desafiche le bandeau de notification
    $scope.bandeauChangerProfil = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandoTopTen = false;

  }
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.changerProfil = function()
  -Explication fonction : Fonction servant a afficher l'interface de modification du profil
  -Entrée :
  -Sortie:
  */
  $scope.changerProfil = function() {
    $scope.bandeauChangerProfil = true;

  }
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.modifierProfil = function()
  -Explication fonction : Fonction servant a modifier le profil
  Verifie si les variables scope modifnom, modifprenom ou modifphoto on été modifié, si oui il appel le service profil.
  -Entrée :
  -Sortie:
  */
  $scope.modifierProfil = function() //fonction qui gere toute les modification du profil
  {
    $scope.bandeauChangerProfil = false;

    if ($scope.modifnom != null) {
      console.log("nouveau nom dans controller :", $scope.modifnom, "coller");
      profil.chanGerNom($scope.modifnom, $scope.username).then(function(data) {
        if (data.sucess == 'erreur') {
          $scope.bandeau = data.statusMsg;
          $scope.bandeauVisible = true;
          $scope.initalisationVariableModifProfil(); // on remet toute les variables a null pour pouvoir remodifier apres
        } else {
          $scope.bandeau = data.statusMsg;
          $scope.bandeauVisible = true;
          $scope.nom = data.nom;
          $scope.initalisationVariableModifProfil(); // on remet toute les variables a null pour pouvoir remodifier apres
        }
      });
    }


    if ($scope.modifprenom != null) {
      profil.chanGerPrenom($scope.modifprenom, $scope.username).then(function(data) {
        if (data.sucess == 'erreur') {
          $scope.bandeau = data.statusMsg;
          $scope.bandeauVisible = true;
          $scope.initalisationVariableModifProfil(); // on remet toute les variables a null pour pouvoir remodifier apres

        } else {
          $scope.bandeau = data.statusMsg;
          $scope.bandeauVisible = true;
          $scope.prenom = data.prenom;
          $scope.initalisationVariableModifProfil(); // on remet toute les variables a null pour pouvoir remodifier apres
        }
      });
    }

  }

  // **************** FIN DE FONCTION **************** //

  /*
  -Titre fonction : $scope.choisirDefi()
  -Explication fonction : Permet de choisir un utilisateur a défié apres la fin d'une partie ou d'un defi.
  -Entrée : id du défi
  -Sortie:
  */

  $scope.choisirDefi = function(id_defie) {
    $scope.bandeauChoisirUtilisateurDefi = true;
    defi.getUsersToDefi().then(function(data) {
      console.log("Cherche Utilisateur à défié");
      $scope.listeUtilisateur = data;
      $scope.listeUtilisateur = $scope.listeUtilisateur.resultat.rows;
    });
  }

  // **************** FIN DE FONCTION **************** //

  /*
  -Titre fonction : $scope.ActualisePhoto = function()
  -Explication fonction : Fonction servant à actualiser la photo
  Elle recupere le nouvel avatar.
  -Entrée :
  -Sortie: Renvoi le nouvel avatar
  */

  $scope.ActualisePhoto = function() {

    $timeout(function() {
      $scope.bandeauChangerProfil = false;
      profil.chanGerPhoto($scope.modifphoto).then(function(data) { // enlever then, recuperer data sans passer par .then

        if (data.sucess == 'erreur') {
          $scope.bandeau = data.statusMsg;
          $scope.bandeauVisible = true;
          $scope.initalisationVariableModifProfil(); // on remet toute les variables a null pour pouvoir remodifier apres
        } else {
          $scope.bandeau = data.statusMsg;
          $scope.bandeauVisible = true;
          $scope.photo = data.photo;
          $scope.initalisationVariableModifProfil(); // on remet toute les variables a null pour pouvoir remodifier apres

        }
      });
    }, 1000);
  };


  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.CommencerPartie = function()
  -Explication fonction : Fonction servant a lancer la partie
  recupere la liste des themes avec le service jeu et la fonction jeu.getTheme.
  -Entrée :
  -Sortie: Renvoi la liste les themes
  */

  $scope.CommencerPartie = function() {
    //gestion des bandeaux//
    $scope.bandeauChoisirUtilisateurDefi = false;
    $scope.JeuLance = true;
    $scope.bandeauQuizzChoixNiveau = true;
    $scope.bandeauVisible = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;

    $scope.bandeauProfilConnect = false;
    $scope.bandeauChangerProfil = false;
    $scope.bandeauDefiAttente = false;
    $scope.bandoTopTen = false;
    $scope.isDefi = false;
    $scope.initalisationVariableJeu();

    //appel du service jeu pour avoir la liste des themes.
    jeu.getTheme().then(function(data) {
      $scope.quizz = data;
    });

  }
  // **************** FIN DE FONCTION **************** //

  $scope.initalisationVariableModifProfil = function() {
    $scope.modifnom = null; // utiliser pour la modification du profil.
    $scope.modifprenom = null; // utiliser pour la modification du profil.
    $scope.modifphoto = null; // utiliser pour la modification du profil.
  }

  $scope.initalisationVariableJeu = function() {
    $scope.niveau = ['Facile', 'Moyen', 'Difficile']; // Tableau des trois niveaux possibles.
    $scope.niveauChoisi = null; // Niveau choisi par l'utilisateur.
    $scope.questionsquizz = []; //Tableau des questions du quizz.
    $scope.questionsquizz[0] = {};
    $scope.questionsquizz[0].quizz = [];
    $scope.questionEnCours = null; // Question courante.
    $scope.Proposition = null; // Tableau des propositions de reponses.
    $scope.reponseUtilisateur = null; // Reponse choisi par l'utilisateur.
    $scope.bonneReponse = null; // Bonne reponse a la question en cours.
    $scope.indexQuestion = null; // Index de la question en cours.
    $scope.indexPrec = null; // Index de la question précédente.
    $scope.nbBonneRep = 0; //Nombre de bonne reponse de l'utilisateur.
    $scope.nbQuestionRep = 0; // Nombre de questions repondu par l'utilisateur.
    $scope.questionDejaFaite = ['200']; // Tableau des questions déjà faites.
    $scope.tempsdebut = 0; // Temps au lancement du quizz.
    $scope.tempsfin = 0; // Temps a la fin du quizz.
    $scope.temps = 0; // Temps temporaire.
    $scope.tempsCourant = 0; // Temps courant.
    $scope.isDefi = false;
  }


  /*
  -Titre fonction : $scope.choixNiveau()
  -Explication fonction : Permet de choisir entre le niveau facile, moyen et Difficile
  -Entrée :
  -Sortie: variable scope niveau choisi mis a jour.
  */
  $scope.choixNiveau = function(niveauchoisi) {
    $scope.bandeauQuizzChoixNiveau = false;
    $scope.bandeauPrincipal = false;
    $scope.bandeauQuizzChoixTheme = true;

    $scope.niveauChoisi = niveauchoisi;

  }
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.choixTheme()
  -Explication fonction : Permet de choisir un theme et d'en retourner toutes ses questions.
  -Entrée : Theme choisi
  -Sortie: Questions du theme choisi.
  */
  $scope.choixTheme = function(themechoisi) {

    theme = themechoisi.trim();
    jeu.getQuestionParTheme(themechoisi).then(function(data) {
      $scope.bandeauQuizzJeuEnCours = true;
      $scope.bandeauQuizzChoixTheme = false;
      $scope.questionsquizz = data;
      $scope.nombreQuestions = ($scope.questionsquizz[0].quizz).length;
      $scope.indexQuestion = $scope.ChoixQuestion($scope.nombreQuestions);
      $scope.questionEnCours = $scope.questionsquizz[0].quizz[$scope.indexQuestion].question;
      $scope.Proposition = $scope.ChoixProposition($scope.questionsquizz[0].quizz[$scope.indexQuestion].propositions, $scope.questionsquizz[0].quizz[$scope.indexQuestion].réponse);
      $scope.bonneReponse = $scope.questionsquizz[0].quizz[$scope.indexQuestion].réponse;

      $scope.defiInitialisation();
      $scope.DefiMAJ($scope.questionEnCours, $scope.Proposition, $scope.bonneReponse);



    });
    $scope.startTimer(); // lancement du timer.
  }
  // **************** FIN DE FONCTION **************** //





  /*
  -Titre fonction : $scope.choixReponse()
  -Explication fonction : Choisir une reponse et verifier si elle est bonne ou mauvaise
  -Entrée : reponse choisi
  -Sortie: $scope.indexQuestion mis a jour a la question suivante.
  */
  $scope.choixReponse = function(reponseChoisi) {
    $scope.indexPrec = $scope.indexQuestion;
    if ($scope.isDefi == false) {
      $scope.indexQuestion = $scope.ChoixQuestion($scope.nombreQuestions);
      console.log("Controller / Fonction choix reponse / index question (version normal) : ", $scope.indexQuestion)

    } else {
      $scope.indexQuestion = $scope.indexQuestion + 1;
      console.log("Controller / Fonction choix reponse / index question (version defi) : ", $scope.indexQuestion)

      if ($scope.indexQuestion == $scope.nombreQuestions) // fin de la partie
      {
        console.log("Controller / Fonction choix reponse / detection nombre de question maximal atteint");
        $scope.indexQuestion = $scope.indexQuestion - 1; //eviter depassement tableau.

      }
    }
    $scope.nbQuestionRep = $scope.nbQuestionRep + 1;



    if ($scope.bonneReponse == reponseChoisi) {
      $scope.questionEnCours = $scope.questionsquizz[0].quizz[$scope.indexQuestion].question;
      $scope.Proposition = $scope.ChoixProposition($scope.questionsquizz[0].quizz[$scope.indexQuestion].propositions, $scope.questionsquizz[0].quizz[$scope.indexQuestion].réponse);
      $scope.bonneReponse = $scope.questionsquizz[0].quizz[$scope.indexQuestion].réponse;
      if ($scope.isDefi == false) {
        $scope.bandeau = "Bonne réponse : " + $scope.questionsquizz[0].quizz[$scope.indexPrec].anecdote;
      } else {
        $scope.bandeau = "Bonne réponse";

      }
      $scope.bandeauVisible = true;
      $scope.nbBonneRep = $scope.nbBonneRep + 1;
    } else {
      $scope.questionEnCours = $scope.questionsquizz[0].quizz[$scope.indexQuestion].question;
      $scope.Proposition = $scope.ChoixProposition($scope.questionsquizz[0].quizz[$scope.indexQuestion].propositions, $scope.questionsquizz[0].quizz[$scope.indexQuestion].réponse);
      $scope.bonneReponse = $scope.questionsquizz[0].quizz[$scope.indexQuestion].réponse;
      if ($scope.isDefi == false) {
        $scope.bandeau = "Mauvaise réponse : " + $scope.questionsquizz[0].quizz[$scope.indexPrec].anecdote;
      } else {
        $scope.bandeau = "Mauvaise réponse";

      }
      $scope.bandeauVisible = true;
    }


    $scope.DefiMAJ($scope.questionEnCours, $scope.Proposition, $scope.bonneReponse);


    if ($scope.isDefi == false) {
      if ($scope.nbQuestionRep == 5) // fin de la partie
      {
        console.log("Controller / Parti fini ");
        $scope.stop();
      }

    } else {
      if ($scope.nbQuestionRep == $scope.nombreQuestions) // fin de la partie
      {
        console.log("Controller / Defi fini");
        $scope.stopQuizz();
      }

    }







  }
  // **************** FIN DE FONCTION **************** //





  /*
  -Titre fonction : $scope.startTimer()
  -Explication fonction : Permet de lancer le timer.
  Initialise la variable scope tempsdebut
  Appel la fonction timer toute les secondes.
  -Entrée :
  -Sortie:
  */
  $scope.startTimer = function() {
    $scope.tempsdebut = Date.now();
    $scope.inter = $interval(function() {
      $scope.timer();
    }, 1000); // appel la fonction timer toute les secondes
  }
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.timer()
  -Explication fonction : Appel la fonction updateChrono()
  -Entrée :
  -Sortie:
  */
  $scope.timer = function() {
    $scope.tempsCourant = $scope.updateChrono();
  }
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.updateChrono()
  -Explication fonction : Calcul au temps t le temps écoulé depuis le debut
  -Entrée :
  -Sortie: temps passé depuis le lancement du timer.
  */
  $scope.updateChrono = function() {
    $scope.temps = Date.now() - $scope.tempsdebut;
    $scope.temps = Math.floor($scope.temps / 1000);
    return $scope.temps;
  }
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.stop()
  -Explication fonction : Met fin au timer et a la partie.
  Calcul le temps final et appel la fonction du service jeu sendScore.
  -Entrée :
  -Sortie:
  */
  // Fin de partie
  $scope.stop = function() {
    $scope.tempsfin = Date.now() - $scope.tempsdebut;
    $scope.tempsfin = Math.floor($scope.tempsfin / 1000);
    console.log("temps fin : ", $scope.tempsfin);
    $scope.score = ($scope.nbBonneRep * 1398) / $scope.tempsfin;
    $scope.score = Math.round($scope.score);
    $scope.bandeau = "Fin de la partie, votre score est de " + $scope.score;
    var dateFinPartie = new Date();
    var dateFinPartie = dateFinPartie.getFullYear() + '-' + (dateFinPartie.getMonth() + 1) + '-' + dateFinPartie.getDate() + ' ' + dateFinPartie.getHours() + ':' + dateFinPartie.getMinutes() + ':' + dateFinPartie.getSeconds();
    jeu.sendScore($scope.userid, dateFinPartie, $scope.nbBonneRep, $scope.tempsfin, $scope.score); // appel service jeu pour envoyer au serveur
    $scope.bandeauVisible = true;
    $scope.bandeauQuizzJeuEnCours = false;
    $scope.JeuLance = false
    $scope.bandeauPrincipal = true;
    $scope.resetGame();
    $scope.defiSave.id_user_defiant = $scope.userid;
    $scope.defiSave.score_user_defiant = $scope.score;
    $scope.choisirDefi();
  }
  // **************** FIN DE FONCTION **************** //

  /*
  -Titre fonction : $scope.stopQuizz()
  -Explication fonction : Met fin au timer et a la partie.
  Calcul le temps final et appel la fonction du service jeu sendScore.
  -Entrée :
  -Sortie:
  */
  // Fin de partie
  $scope.stopQuizz = function() {
    $scope.tempsfin = Date.now() - $scope.tempsdebut;
    $scope.tempsfin = Math.floor($scope.tempsfin / 1000);
    console.log("temps fin : ", $scope.tempsfin);
    $scope.score = ($scope.nbBonneRep * 1398) / $scope.tempsfin;
    $scope.score = Math.round($scope.score);
    if ($scope.score > $scope.defiEnAttente.score_user_defiant) {
      $scope.gagnant = $scope.userid;
      $scope.bandeau = "Fin de la partie, votre score est de " + $scope.score + " celui de votre adversaire etait de" + $scope.defiEnAttente.score_user_defiant + "Vous avez donc gagné.";

    } else {
      $scope.gagnant = $scope.defiEnAttente.id_user_defiant;
      $scope.bandeau = "Fin de la partie, votre score est de " + $scope.score + " celui de votre adversaire etait de" + $scope.defiEnAttente.score_user_defiant + "Vous avez donc perdu.";

    }
    var dateFinPartie = new Date();
    var dateFinPartie = dateFinPartie.getFullYear() + '-' + (dateFinPartie.getMonth() + 1) + '-' + dateFinPartie.getDate() + ' ' + dateFinPartie.getHours() + ':' + dateFinPartie.getMinutes() + ':' + dateFinPartie.getSeconds();
    defi.sendWinner($scope.idsqldefiencours, $scope.gagnant).then(function(data) {
      if (data.sucess = "sucess") {
        $scope.nbDefiEnAttente = $scope.nbDefiEnAttente - 1;
        if ($scope.nbDefiEnAttente == 0) {
          $scope.defiEnAttente = null;
          $scope.bandeauSiDefiEnAttente = false;
        } else {
          $scope.RecupLastDefi();
        }
      }
    });
    $scope.bandeauVisible = true;
    $scope.bandeauQuizzJeuEnCours = false;
    $scope.JeuLance = false
    $scope.bandeauPrincipal = true;
    $scope.isDefi = false;
    $scope.resetGame();
    $scope.defiSave.id_user_defiant = $scope.userid;
    $scope.defiSave.score_user_defiant = $scope.score;
    $scope.choisirDefi();
  }
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.ChoixQuestion()
  -Explication fonction : Permet de choisir une question au hasard et qui n'a pas déjà été faite.
  Utilise le tableau questionDejaFaite et math.random pour le "hasard".
  -Entrée : Nombre de questions parmis lesquels choisir.
  -Sortie: L'index de la question choisi au hasard.
  */
  $scope.ChoixQuestion = function(nbQuestion) {

    $scope.indexQuestion = Math.floor(Math.random() * Math.floor(nbQuestion));


    while ($scope.questionDejaFaite.includes($scope.indexQuestion)) {
      $scope.indexQuestion = Math.floor(Math.random() * Math.floor(nbQuestion));
    }

    $scope.questionDejaFaite.push($scope.indexQuestion);

    return $scope.indexQuestion;

  }
  // **************** FIN DE FONCTION **************** //




  /*
  -Titre fonction : $scope.ChoixProposition()
  -Explication fonction : Permet de selectionner les propositions à afficher.
  Et change l'ordre des proposition afin de ne pas avoir toujours la bonne réponse au même endroit.
  -Entrée : les 4 propositions ainsi que la bonne reponse
  -Sortie: Le tableaux des x propositions
  */
  $scope.ChoixProposition = function(proposition, bonneReponse) {

    if ($scope.niveauChoisi == 'Facile') {
      var NouveauTab = [];
      var placementBonneReponse = Math.floor(Math.random() * Math.floor(2));
      if (placementBonneReponse == 0) {
        NouveauTab.push(bonneReponse);
      }


      var quelQuestion = Math.floor(Math.random() * Math.floor(4));
      while (proposition[quelQuestion] == bonneReponse) {
        quelQuestion = Math.floor(Math.random() * Math.floor(4));
      }
      NouveauTab.push(proposition[quelQuestion]);
      if (placementBonneReponse == 1) {
        NouveauTab.push(bonneReponse);
      }
      return NouveauTab;

      //enlever deux mauvaise reponse et retourner
    }
    if ($scope.niveauChoisi == 'Moyen') {
      var NouveauTab = [];
      var placementBonneReponse = Math.floor(Math.random() * Math.floor(3));
      if (placementBonneReponse == 0) {
        NouveauTab.push(bonneReponse);
      }
      var quelQuestion = Math.floor(Math.random() * Math.floor(4));
      while ((proposition[quelQuestion] == bonneReponse) || NouveauTab.includes(proposition[quelQuestion])) {
        quelQuestion = Math.floor(Math.random() * Math.floor(4));
      }
      NouveauTab.push(proposition[quelQuestion]);
      if (placementBonneReponse == 1) {
        NouveauTab.push(bonneReponse);
      }
      while ((proposition[quelQuestion] == bonneReponse) || NouveauTab.includes(proposition[quelQuestion])) {
        quelQuestion = Math.floor(Math.random() * Math.floor(4));
      }
      NouveauTab.push(proposition[quelQuestion]);
      if (placementBonneReponse == 2) {
        NouveauTab.push(bonneReponse);
      }
      //on ajoute deux question
      return NouveauTab;
    }
    if ($scope.niveauChoisi == 'Difficile') {
      return proposition; //on retourne le tableau avec les 4 propositions
    }

  }
  // **************** FIN DE FONCTION **************** //



  /*
  -Titre fonction : $scope.resetGame()
  -Explication fonction : Permet de "nettoyer" les variables scopes afin d'être pret a relancer une partie.
  -Entrée :
  -Sortie:
  */
  $scope.resetGame = function() {
    $interval.cancel($scope.inter); //arret du chrono
    $scope.questionsquizz = null;
    $scope.questionEnCours = null;
    $scope.Proposition = null;
    $scope.reponseUtilisateur = null;
    $scope.bonneReponse = null;
    $scope.indexQuestion = null;
    $scope.nbBonneRep = 0;
    $scope.nbQuestionRep = 0;
    $scope.questionDejaFaite = ['200'];
    $scope.tempsdebut = 0;
    $scope.tempsfin = 0;
    $scope.temps = 0;
    $scope.tempsCourant = 0;
  }


  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.defiInitialisation()
  -Explication fonction : Permet de "nettoyer" ou initialiser les variables scopes afin d'être pret a relancer un defi.
  -Entrée :
  -Sortie:
  */

  $scope.defiInitialisation = function() {
    $scope.defiSave = {}; // Va contenir le defi a envoyé
    $scope.defiSave.quizz = [];
    $scope.defiSaveIndex = 0; //Index du tableau defiSave
    $scope.defiSave.score_user_defiant = 0;
    $scope.defiSave.id_user_defie = 0;
    $scope.defiSave.id_user_defiant = 0;
    $scope.defiSave.quizz.length = 5; // Notre quizz est de 5 questions dont celui de defi aussi.
    //initalisation tableau
    var i = 0;
    for (i; i < $scope.defiSave.quizz.length; i++) {
      $scope.defiSave.quizz[i] = {};
    }
  }

  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.DefiMAJ(question,proposition,reponse)
  -Explication fonction : Au cours d'une partie solo, le tableau defiSave est rempli des questions qu'on est entrain de répondre
  afin de pouvoir lancer un defi de la partie (ou du defi) qu'on viens de jouer.
  -Entrée : question repondu, propositions, bonne réponse
  -Sortie:
  */
  $scope.DefiMAJ = function(question, proposition, reponse) {
    if ($scope.defiSaveIndex < $scope.defiSave.quizz.length) // evite depassement tableau.
    {
      $scope.defiSave.quizz[$scope.defiSaveIndex].id = $scope.defiSaveIndex + 1;
      $scope.defiSave.quizz[$scope.defiSaveIndex].question = question;
      $scope.defiSave.quizz[$scope.defiSaveIndex].propositions = proposition;
      $scope.defiSave.quizz[$scope.defiSaveIndex].réponse = reponse;
      $scope.defiSaveIndex = $scope.defiSaveIndex + 1;
    }
    console.log("Controller:DefiMaj:defiSave.quizz", $scope.defiSave.quizz);
  }
  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.choisirDefi()
  -Explication fonction : Permet de choisir un utilisateur a défié apres la fin d'une partie ou d'un defi.
  -Entrée : id du défi
  -Sortie:
  */

  $scope.choisirDefi = function(id_defie) {
    $scope.bandeauChoisirUtilisateurDefi = true;
    defi.getUsersToDefi().then(function(data) {
      console.log("Cherche Utilisateur à défié");
      $scope.listeUtilisateur = data;
      $scope.listeUtilisateur = $scope.listeUtilisateur.resultat.rows;
    });
  }

  // **************** FIN DE FONCTION **************** //



  /*
  -Titre fonction : $scope.LancerDefi(usersToDefi)
  -Explication fonction : Permet de lancer un défi à un utilisateur
  -Entrée : id de l'utilisateur a défié.
  -Sortie:
  */
  $scope.LancerDefi = function(usersToDefi) {
    $scope.defiSave.id_user_defie = usersToDefi.id;
    $scope.defiJSON = JSON.stringify($scope.defiSave);
    defi.SendDefi($scope.defiJSON).then(function(data) {
      $scope.bandeau = "Vous avez bien lancé un défi à " + usersToDefi.identifiant + ".";
      $scope.bandeauChoisirUtilisateurDefi = false;
      $scope.bandeauVisible = true;
    });

  }
  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.recupNbDefi()
  -Explication fonction : Permet de recuperer le nombre de défi en attente.
  -Entrée :
  -Sortie: Nombre de défi en attente
  */

  $scope.recupNbDefi = function() // voit si il y a un defi pour tel id.
  {
    $scope.nbDefiEnAttentePrec = $scope.nbDefiEnAttente;
    defi.getNbDefi().then(function(data) {
      $scope.nbDefiEnAttente = data.defienattente;
      console.log("Nombre de defi en attente :", $scope.nbDefiEnAttente);
      if ($scope.nbDefiEnAttente > 0) {
        if ($scope.nbDefiEnAttente != $scope.nbDefiEnAttentePrec) {
          console.log('Quequ un vous a envoye un defi');
          $scope.bandeaunouveaudefiOn = true;
          $anchorScroll(); // Permet de remonter en haut de page pour voir une notification.
          $scope.bandeaunouveaudefi = "Vous avez un nouveau défi";
          $scope.nbDefiEnAttentePrec = $scope.nbDefiEnAttente;
        }
      }

    });
    $timeout(function() {
      $scope.bandeaunouveaudefiOn = false;
      $scope.bandeaunouveaudefi = null;

    }, 4000);
  }

  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.AfficheDefi()
  -Explication fonction : Permet de d'afficher le dernier défi recu pour l'accepter ou le refuser.
  -Entrée :
  -Sortie:
  */

  $scope.AfficheDefi = function() {
    defi.getNbDefi().then(function(data) {
      $scope.nbDefiEnAttente = data.defienattente;
      console.log("Nombre de defi en attente :", $scope.nbDefiEnAttente);
      $scope.bandeauVisible = false;
      $scope.bandeauDefiAttente = true;
      $scope.bandeauHistoriqueDefi = false;
      $scope.bandeauHistoriqueDefiAllu = false;
      $scope.bandeauProfil = false;
      $scope.bandeauChoisirUtilisateurDefiAllu = false;

      $scope.bandeauProfilConnect = false;
      $scope.bandeauHistorique = false;
      $scope.bandeauChangerProfil = false;
      $scope.bandoTopTen = false;
      $scope.RecupLastDefi();
      if ($scope.nbDefiEnAttente > 0) {
        $scope.bandeauSiDefiEnAttente = true;
      }
    });

  }
  // **************** FIN DE FONCTION **************** //



  /*
  -Titre fonction : $scope.DessaficheDefi()
  -Explication fonction : Permet de masquer le bandeau qui affiche le dernier defi à accepter ou refuser.
  -Entrée :
  -Sortie:
  */
  $scope.DessaficheDefi = function() {
    $scope.bandeauDefiAttente = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandeauChangerProfil = false;
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;

    $scope.bandeauProfilConnect = false;


  }
  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.recupNomParId(id)
  -Explication fonction : Permet d'avoir l'identifiant(nom) d'un utilisateur en fonction de son id.
  -Entrée : id utilisateur
  -Sortie: identifiant utilisateur
  */
  $scope.recupNomParId = function(id) {
    profil.recupNom(id).then(function(data) {
      console.log("Controller : Fonction recupNomParId id = ", id, "Nom : ", data.resultat.rows[0].identifiant);
      return data.resultat.rows[0].identifiant;

    });

  }
  // **************** FIN DE FONCTION **************** //


  /*
  -Titre fonction : $scope.AccepterDefi(defiObj)
  -Explication fonction : Permet d'accepter un défi
  -Entrée : objet du défi
  -Sortie:
  */
  $scope.AccepterDefi = function(defiObj) {
    $scope.defiInitialisation();
    var dateDefi = new Date();
    var dateDefi = dateDefi.getFullYear() + '-' + (dateDefi.getMonth() + 1) + '-' + dateDefi.getDate() + ' ' + dateDefi.getHours() + ':' + dateDefi.getMinutes() + ':' + dateDefi.getSeconds();
    // envoyé au serveur dans sql médaille qu'il a perdu et supprimé le defi de la base de données mongo
    defi.CancelDefi(defiObj._id, defiObj.id_user_defiant, defiObj.id_user_defie, defiObj.id_user_defiant, dateDefi).then(function(data) {
      if (data.sucess = "sucess") {
        $scope.questionsquizz = [];
        $scope.questionsquizz[0] = {};

        $scope.isDefi = true;
        console.log("Controller : Defi en attente:", data);
        $scope.idsqldefiencours = data.idsql[0].id;
        $scope.questionsquizz[0].quizz = $scope.defiEnAttente.quizz;
        console.log("quizz apres ajout", $scope.questionsquizz[0].quizz);

        $scope.bandeauQuizzJeuEnCours = true;
        $scope.bandeauQuizzChoixTheme = false;
        $scope.bandeauSiDefiEnAttente = false;
        $scope.bandeauDefiAttente = false;
        $scope.niveauChoisi = "Difficile";
        $scope.nombreQuestions = ($scope.questionsquizz[0].quizz).length;
        console.log("Controller : Nombre questions du quizz defi : ", $scope.nombreQuestions);
        $scope.indexQuestion = 0;
        $scope.questionEnCours = $scope.questionsquizz[0].quizz[$scope.indexQuestion].question;
        $scope.Proposition = $scope.ChoixProposition($scope.questionsquizz[0].quizz[$scope.indexQuestion].propositions, $scope.questionsquizz[0].quizz[$scope.indexQuestion].réponse);
        $scope.bonneReponse = $scope.questionsquizz[0].quizz[$scope.indexQuestion].réponse;
        $scope.startTimer();
      }
    });
  }

  // **************** FIN DE FONCTION **************** //



  /*
  -Titre fonction : $scope.RefuseDefi(defiObj)
  -Explication fonction : Permet de refuser un défi
  -Entrée : objet du défi
  -Sortie:
  */
  $scope.RefuserDefi = function(defiObj) {

    var dateDefi = new Date();
    var dateDefi = dateDefi.getFullYear() + '-' + (dateDefi.getMonth() + 1) + '-' + dateDefi.getDate() + ' ' + dateDefi.getHours() + ':' + dateDefi.getMinutes() + ':' + dateDefi.getSeconds();
    console.log(dateDefi);
    defi.CancelDefi(defiObj._id, defiObj.id_user_defiant, defiObj.id_user_defie, defiObj.id_user_defiant, dateDefi).then(function(data) {
      if (data.sucess = "sucess") {
        $scope.nbDefiEnAttente = $scope.nbDefiEnAttente - 1;
        if ($scope.nbDefiEnAttente == 0) {
          $scope.defiEnAttente = null;
          $scope.bandeauSiDefiEnAttente = false;
        } else {
          $scope.RecupLastDefi();
        }
      }
    });
  }

  // **************** FIN DE FONCTION **************** //

  /*
  -Titre fonction : $scope.RecupLastDefi()
  -Explication fonction : Permet de recuperer le dernier defi à accepter ou refuser.
  -Entrée : objet du défi
  -Sortie:
  */
  $scope.RecupLastDefi = function() {
    defi.getLastDefii($scope.userid).then(function(data) {
      console.log("data last defi= ", data);
      $scope.defiEnAttente = data.defienattente;


    });
  }

  // **************** FIN DE FONCTION **************** //



  /*
  -Titre fonction : $scope.gettopTen()
  -Explication fonction : Permet de recuperer le dernier defi à accepter ou refuser.
  -Entrée : objet du défi
  -Sortie:
  */
  $scope.gettopTen = function() {
    profil.voirTopTen().then(function(data) {
      console.log("TOP TENNNNN= ", data);
      $scope.topTenArray = data.tableau;

    });
  }

  // **************** FIN DE FONCTION **************** //




  // -----------         ----------- //

  // ----------- ETAPE 5 ----------- //

  // -----------         ----------- //


  $scope.RecupLastDefiAllu = function() {
    console.log("Cherche de defi allumete");
    console.log("Is defi :", $scope.isDefi, " et jeu lance : ", $scope.JeuLance);
    if ($scope.isDefi == false && $scope.JeuLance == false) // ne pas lancer un defi allumette si le joueur jouer une partie de quizz;de defi quizz; de defi allumete déjà en cours.
    {
      allumette.getLastDefii().then(function(data) {
        console.log(data);
        if (data.sucess != "erreur") {
          console.log("data last defi allumete= ", data);
          $scope.defiAlluEnAttente = data.defienattente;
          $scope.AlluObj = {}
          $scope.AlluObj.id_user_defie = data.defienattente.id_user_defie;
          $scope.AlluObj.id_user_defiant = data.defienattente.id_user_defiant;
          $scope.adervsaireAllumeteID = data.defienattente.id_user_defiant;
          $scope.adervsaireAllumeteNom = data.defienattente.name;
          $scope.NomAdversaireAllu = data.defienattente.name;
          var defiObj = $scope.defiAlluEnAttente;
          var dateDefi = new Date();
          var dateDefi = dateDefi.getFullYear() + '-' + (dateDefi.getMonth() + 1) + '-' + dateDefi.getDate() + ' ' + dateDefi.getHours() + ':' + dateDefi.getMinutes() + ':' + dateDefi.getSeconds();
          allumette.SupprDefi(defiObj._id).then(function(data) {
            if (data.sucess = "sucess") {

              //gestion des bandeaux//
              $scope.bandeauChoisirUtilisateurDefi = false;
              $scope.bandeauNouveauJeu = true;
              $scope.bandeauQuizzChoixNiveau = false;
              $scope.bandeauJeuLance = false;
              $scope.bandeauPrincipal = false;
              $scope.bandeauVisible = false;
              $scope.bandeauHistorique = false;
              $scope.bandeauHistoriqueDefi = false;
              $scope.bandeauHistoriqueDefiAllu = false;
              $scope.bandeauProfil = false;
              $scope.bandeauChoisirUtilisateurDefiAllu = false;
              $scope.bandeauChangerProfil = false;
              $scope.bandeauDefiAttente = false;
              $scope.bandoTopTen = false;
              //gestion des variables du jeu.
              $scope.autoriser = false;
              $scope.nbcoup = 0;
              $scope.nbutilise = 0;
              $scope.isButtonVisibleChoix = true;
              $scope.isButtonVisibleMenu = false;
              $scope.bandeau = "Defi Allumette contre " + $scope.NomAdversaireAllu;
              $scope.allumette = "http://pedago02a.univ-avignon.fr/~uapv1604417/TheCeriGameFinal/APP/CERIGame/imagesNouveauJeu/allum.png";

              $interval.cancel($scope.chercherDefiAllumete10); // arret defi allumete
              $interval.cancel($scope.chercherDefiAllumete3); // arret defi allumete

              $scope.tableau = new Array(16);
              for (i = 0; i < 16; i++) {
                $scope.tableau[i] = true;
              }
              $scope.repriseallu = defiObj.nbAllum;
              $scope.reprise();
            }
          });

        } else {
          console.log("Aucun defi allumette à jouer.");
        }

      });

    } else {
      console.log("Je suis actuellement en cours de partie je ne peut accepter un defi allumette ! ");
    }

  }



  $scope.ChoisirJoueurAllumette = function() {

    //Gestion des bandeaux.
    $scope.bandeauVisible = false;
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;
    $scope.bandeauProfilConnect = false;
    $scope.bandeauQuizzChoixTheme = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauQuizzChoixNiveau = false;
    $scope.bandeauQuizzJeuEnCours = false;
    $scope.bandeauChangerProfil = false;
    $scope.bandeauChoisirUtilisateurDefi = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandoTopTen = false;
    $scope.bandeauDefiAttente = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = true;
    defi.getUsersToDefi().then(function(data) { // Appel a la fonction qui permet de recuper la liste des utilisateurs pour défié quelqu'un.
      $scope.listeUtilisateur = data;
      $scope.listeUtilisateur = $scope.listeUtilisateur.resultat.rows;
    });


  }

  $scope.ChoixAdversaireAllumette = function(users) {

    $scope.adervsaireAllumeteID = users.id;
    $scope.adervsaireAllumeteNom = users.identifiant;
    $scope.AlluObj = {}
    $scope.AlluObj.id_user_defie = $scope.adervsaireAllumeteID;
    $scope.AlluObj.id_user_defiant = $scope.userid;
    $scope.AlluObj.nbAllum = 16;
    $interval.cancel($scope.chercherDefiAllumete10); // arret defi allumete

    $scope.CommencerPartieAllumette();


  }



  /* -Titre fonction : $scope.CommencerPartieAllumette()
  -Explication fonction : Permet de commencer la partie en preparant le plateau d'allumette
  -Entrée :
  -Sortie:
  */
  $scope.CommencerPartieAllumette = function() {
    //gestion des bandeaux//
    $scope.bandeauChoisirUtilisateurDefi = false;
    $scope.bandeauNouveauJeu = true;
    $scope.bandeauQuizzChoixNiveau = false;
    $scope.bandeauJeuLance = false; // Bandeau principal qui contient le menu.
    $scope.JeuLance = true;
    $scope.bandeauPrincipal = false; // Bandeau principal qui contient le menu.
    $scope.bandeauVisible = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;
    $scope.bandeauChangerProfil = false;
    $scope.bandeauDefiAttente = false;
    //gestions des variables du jeu.
    $scope.autoriser = false;
    $scope.nbcoup = 0;
    $scope.nbutilise = 0;
    $scope.isButtonVisibleChoix = true;
    $scope.isButtonVisibleMenu = false;
    $scope.nballuencours = 16;
    $scope.bandeau = "Le but est d'enlever à tour de rôle un à trois allumettes à la fois. Le perdant est celui qui enlève la dernière allumette.";
    $scope.allumette = "http://pedago02a.univ-avignon.fr/~uapv1604417/TheCeriGameFinal/APP/CERIGame/imagesNouveauJeu/allum.png";
    $scope.tableau = new Array(16);
    for (i = 0; i < 16; i++) {
      $scope.tableau[i] = true;
    }
    $scope.nballuchoisi = "Combien d'allumette souhaitez-vous enlever ? ";
  }

  /* -Titre fonction : $scope.reprise()
  -Explication fonction : Permet de recupérer le nombre d'allumettre dans la base de donnée lorsque l'adversaire a joué
  -Entrée :
  -Sortie:
  */
  $scope.reprise = function() {
    //on recup le nb d'allumettre depuis la bdd dans une variable qui s'appellera $scope.repriseallu
    $scope.JeuLance = true;
    $scope.nballuencours = $scope.repriseallu;
    if ($scope.nballuencours == 1) {
      $interval.cancel($scope.chercherDefiAllumete3); // arret recherche rapide
      $scope.chercherDefiAllumete = $interval(function() {
        $scope.RecupLastDefiAllu();
      }, 10000); // verifie si il à un defi allumete toute les 10 secondes
      $scope.menu();
      $scope.bandeau = "Vous avez perdu votre partie allumette contre " + $scope.NomAdversaireAllu;
      $scope.bandeauVisible = true;
      $timeout(function() {
        $scope.JeuLance = false;
        $scope.$apply(function() {
          $scope.bandeauVisible = false;
        });
      }, 4000);
    }
    for (i = 0; i < 16; i++) {
      $scope.tableau[i] = false;
    }
    for (i = 0; i < $scope.nballuencours; i++) {
      $scope.tableau[i] = true;
    }
    $scope.nballuchoisi = "Il reste donc actuellement " + $scope.nballuencours + " allumettes en jeu. Combien d'allumette souhaitez-vous enlever ? ";
    $scope.isButtonVisibleChoix = true;
    $scope.nbcoup = 0;
    $scope.nbutilise = 0;
    console.log($scope.nballuencours);


  }

  /* -Titre fonction : $scope.attendedujoueuradversaire()
  -Explication fonction : Permet de vérifier dans la base de donnée si le joueur adversaire a joué ou non
  -Entrée :
  -Sortie:
  */
  $scope.attendedujoueuradversaire = function() {
    $scope.menu(); // Renvoi au menu pour ne pas rester à attendre la réponse de l'adversaire sans rien faire.
    console.log($scope.nballuencours);
    $scope.AlluObj = {}
    $scope.AlluObj.id_user_defie = $scope.adervsaireAllumeteID;
    $scope.AlluObj.id_user_defiant = $scope.userid;
    $scope.AlluObj.nbAllum = $scope.nballuencours;
    $scope.AlluJson = JSON.stringify($scope.AlluObj);
    console.log("Mon json defi allumette : ", $scope.AlluJson);
    allumette.SendDefi($scope.AlluJson).then(function(data) {
      $scope.bandeau = "Vous avez bien lancé un défi allumette à " + $scope.adervsaireAllumeteNom + ".";
      $scope.bandeauChoisirUtilisateurDefiAllu = false;
      $scope.bandeauVisible = true;
      if ($scope.nballuencours != 1) {

        $scope.chercherDefiAllumete3 = $interval(function() {
          $scope.RecupLastDefiAllu();
        }, 3000); // verifie si il à un defi allumete toute les 10 secondes
      }


    });
  }

  /* -Titre fonction : $scope.choixun()
  -Explication fonction : Permet de comprendre que le joueur ne souhaite retirer qu'une allumette
  -Entrée :
  -Sortie:
  */
  $scope.choixun = function() {
    $scope.isButtonVisibleChoix = false;
    $scope.nballuchoisi = "Vous avez choisi de retirer une allumette. Cliquez dessus !  ";
    $scope.autoriser = true;
    $scope.nbcoup = 1;

  }

  /* -Titre fonction : $scope.choixdeux()
  -Explication fonction : Permet de comprendre que le joueur ne souhaite retirer que deux allumettes
  -Entrée :
  -Sortie:
  */
  $scope.choixdeux = function() {
    $scope.isButtonVisibleChoix = false;
    if ($scope.nballuencours == 2) {
      $scope.nballuchoisi = "On sait que vous n'êtes pas très futé mais on est gentil. On vous laisse la chance de ne pas perdre .Vous ne pouvez donc pas retirer ce nombre d'allumettes sinon vous perdez la partie... reessayez !";
      $scope.isButtonVisibleChoix = true;
    } else {
      $scope.nballuchoisi = "Vous avez choisi de retirer deux allumettes. Cliquez dessus !  ";
      $scope.autoriser = true;
      $scope.nbcoup = 2;
    }

  }

  /* -Titre fonction : $scope.choixtrois()
  -Explication fonction : Permet de comprendre que le joueur ne souhaite retirer que trois allumettes
  -Entrée :
  -Sortie:
  */
  $scope.choixtrois = function() {
    $scope.isButtonVisibleChoix = false;
    if ($scope.nballuencours == 3 || $scope.nballuencours == 2) {
      $scope.nballuchoisi = "On sait que vous n'êtes pas très futé mais on est gentil. On vous laisse la chance de ne pas perdre .Vous ne pouvez donc pas retirer ce nombre d'allumettes sinon vous perdez la partie... reessayez !";
      $scope.isButtonVisibleChoix = true;
    } else {
      $scope.nballuchoisi = "Vous avez choisi de retirer trois allumettes. Cliquez dessus !  ";
      $scope.autoriser = true;
      $scope.nbcoup = 3;
    }
  }

  /* -Titre fonction : $scope.changerjoueur()
  -Explication fonction : Permet d'envoyer dans la base de donnée le nombre d'allumette restant après avoir joué son tour
  -Entrée :
  -Sortie:
  */
  $scope.changerjoueur = function() {
    $interval.cancel($scope.chercherDefiAllumete10sec); // arret defi allumete
    if ($scope.nballuencours == 1) {
      $interval.cancel($scope.chercherDefiAllumete3); // arret recherche rapide
      $scope.attendedujoueuradversaire();
      $scope.nballuchoisi = "Il reste donc une allumettes en jeu. Vous avez gagné !!!";
      $scope.gagnant = $scope.userid;
      var defiObj = $scope.defiAlluEnAttente;
      var dateDefi = new Date();
      var dateDefi = dateDefi.getFullYear() + '-' + (dateDefi.getMonth() + 1) + '-' + dateDefi.getDate() + ' ' + dateDefi.getHours() + ':' + dateDefi.getMinutes() + ':' + dateDefi.getSeconds();
      allumette.GagnerDefi(defiObj.id_user_defiant, defiObj.id_user_defie, defiObj.id_user_defiant, dateDefi).then(function(data) { // Appel la fonction GagnerDefi du service allumette
        if (data.sucess = "sucess") {
          $scope.chercherDefiAllumete = $interval(function() {
            $scope.RecupLastDefiAllu();
          }, 10000); // verifie si il à un defi allumete toute les 10 secondes
          $scope.bandeau = "Vous avez gagnez votre partie allumette contre " + $scope.NomAdversaireAllu;
          $timeout(function() {
            $scope.JeuLance = false;
            $scope.menu();
            $scope.$apply(function() {
              $scope.bandeauVisible = false;
            });
          }, 4000);
        }
      });
    } else {
      $scope.nballuchoisi = "Il reste donc actuellement " + $scope.nballuencours + " allumettes en jeu. En attente de l'adversaire...";
      $scope.isButtonVisibleMenu = true;
      $scope.JeuLance = true;
      $scope.repriseallu = $scope.nballuencours;
      $scope.attendedujoueuradversaire();
    }
  }

  /* -Titre fonction : $scope.EnleverAllumette()
  -Explication fonction : Permet de retirer le nombre d'allumettes que le joueur a choisi
  -Entrée : event car c'est un click afin de savoir quelle allumette a été choisi à l'aide de son id
  -Sortie:
  */
  $scope.EnleverAllumette = function(event) {

    if ($scope.autoriser == true) {
      if (event.target.id == 1 && $scope.tableau[0] == true) {
        $scope.tableau[0] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }


      if (event.target.id == 2 && $scope.tableau[1] == true) {
        $scope.tableau[1] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();

      }
      if (event.target.id == 3 && $scope.tableau[2] == true) {
        $scope.tableau[2] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }

      if (event.target.id == 4 && $scope.tableau[3] == true) {
        $scope.tableau[3] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 5 && $scope.tableau[4] == true) {
        $scope.tableau[4] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 6 && $scope.tableau[5] == true) {
        $scope.tableau[5] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 7 && $scope.tableau[6] == true) {
        $scope.tableau[6] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 8 && $scope.tableau[7] == true) {
        $scope.tableau[7] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 9 && $scope.tableau[8] == true) {
        $scope.tableau[8] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 10 && $scope.tableau[9] == true) {
        $scope.tableau[9] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 11 && $scope.tableau[10] == true) {
        $scope.tableau[10] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 12 && $scope.tableau[11] == true) {
        $scope.tableau[11] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 13 && $scope.tableau[12] == true) {
        $scope.tableau[12] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 14 && $scope.tableau[13] == true) {
        $scope.tableau[13] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 15 && $scope.tableau[14] == true) {
        $scope.tableau[14] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
      if (event.target.id == 16 && $scope.tableau[15] == true) {
        $scope.tableau[15] = false;
        $scope.nballuencours -= 1;
        $scope.testcoup();
      }
    }
  }

  /* -Titre fonction : $scope.testcoup()
  -Explication fonction : Permet de savoir si le joueur a encore une allumette à enlever ou non
  -Entrée :
  -Sortie:
  */
  $scope.testcoup = function() {
    if ($scope.nbcoup == 1) {
      $scope.autoriser = false;
      $scope.changerjoueur();
    }
    if ($scope.nbcoup == 2) {
      if ($scope.nbcoup != $scope.nbutilise) {
        $scope.nbutilise += 1;
        $scope.EnleverAllumette(event);

      }
      if ($scope.nbcoup == $scope.nbutilise) {
        $scope.autoriser = false;
        $scope.changerjoueur();
      }
    }
    if ($scope.nbcoup == 3) {
      if ($scope.nbcoup != $scope.nbutilise) {
        $scope.nbutilise += 1;
        $scope.EnleverAllumette(event);
      }
      if ($scope.nbcoup == $scope.nbutilise) {
        $scope.autoriser = false;
        $scope.changerjoueur();
      }
    }
  }

  /* -Titre fonction : $scope.VoirHistoAllu()
  -Explication fonction : Permet d'afficher l'historique des parties du jeu allumette
  -Entrée :
  -Sortie:
  */
  $scope.VoirHistoAllu = function() {

    // Gestion des bandeaux
    $scope.bandeauChoisirUtilisateurDefi = false;
    $scope.bandeauProfil = false;
    $scope.bandeauChoisirUtilisateurDefiAllu = false;
    $scope.bandeauProfilConnect = false;
    $scope.bandeauVisible = false;
    $scope.bandeauChangerProfil = false;
    $scope.bandeauDefiAttente = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandoTopTen = false;

    allumette.voirHisto().then(function(data) { // appel a la fonction voirHisto du service allumette
      if (data.tableau.length != '0') {
        $scope.bandeauHistoriqueDefiAllu = true;
        $scope.histodefiAllumette = data.tableau;
      } else {
        $scope.bandeau = "Historique allumette vide";
        $scope.bandeauVisible = true;
        $scope.bandeauHistoriqueDefiAllu = false;
      }
    });

  }

  /* -Titre fonction : $scope.MasquerHistoAllu()
  -Explication fonction : Permet de dessaficher l'historique des parties du jeu allumette
  -Entrée :
  -Sortie:
  */
  $scope.MasquerHistoAllu = function() {
    $scope.bandeauProfilConnect = false; // on masque le bandeau profil des utilisateurs connectés
    $scope.bandeauVisible = false; // on masque le bandeau de notification
    $scope.bandeauChangerProfil = false;
    $scope.bandoTopTen = false;
    $scope.bandeauHistorique = false;
    $scope.bandeauHistoriqueDefi = false;
    $scope.bandeauHistoriqueDefiAllu = false;
    $scope.bandeauDefiAttente = false;
  }
  // **************** FIN DE FONCTION **************** //



} //FIN CONTROLLER
