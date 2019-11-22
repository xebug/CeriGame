/******** Chargement des Middleware *******/
const express = require('express'); // définit expressJS
const sha1 = require('sha1'); // Pour les mots de passe
const session = require('express-session'); //Gestionnaire de session
const pgClient = require('pg'); //Base de donnée postgreSQL
const MongoDBStore = require('connect-mongodb-session')(session); //Base de donnée MongoDB
const MongoClient = require('mongodb').MongoClient; //MongoDB pour quizz
var ObjectID = require('mongodb').ObjectID; // Mongo DB
var multer = require('multer'); // Module d'upload d'image

/******** UPLOAD IMAGE ********/
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, '/home/nas02a/etudiants/inf/uapv1604417/public_html/TheCeriGameFinal/APP/CERIGame/images/');

  },
  filename: function(req, file, cb) {
    cb(null, 'nouveau' + file.fieldname + Date.now() + '.png')
  }
})

var upload = multer({
  storage: storage
}) // Mettre le chemin + le nom de l'upload grâce au storage


/******** Declaration des variables ********/
const app = express(); // appel à expressJS
const mdb = "mongodb://127.0.0.1:27017/db";

var path = require('path');
app.use(express.static(__dirname + '/CERIGame/')); // Chemin du projet


/******** Utilisation de mongodb pour la session des utilisateurs ********/

app.use(session({
  secret: 'ma phrase secrete',
  saveUninitialized: false,
  resave: false,
  store: new MongoDBStore({
    uri: "mongodb://127.0.0.1:27017/db",
    collection: 'mySession_3291',
    touchAfter: 24 * 3600
  }),
  cookie: {
    maxAge: 24 * 3600 * 1000
  }
}));

/******** Utilisation de postgreSQL  ********/

var pool = new pgClient.Pool({
  user: 'uapv1604417',
  host: '127.0.0.1',
  database: 'etd',
  password: 'ixdyaz',
  port: 5432
});




/******** Configuration du serveur NodeJS - Port : 3201 ********/
var server = app.listen(3201, function() { //Spécification du port d’écoute de Node pour les requêtes HTTP
  console.log('Port 3201; RASSU,ELKADOURI'); // Message dans la console Node
});


/******** SOCKET  ********/
var socket = require('socket.io');

var io = socket(server);

// Etablir la connexion coté serveur
io.on('connection', function(socket) {

  console.log('Connexion établie avec le WebSocket - Identifiant du socket > ' + socket.id);

  socket.on('socketLogin', function(data) {
    socket.broadcast.emit('socketLoginFromServer', data);
  });

  socket.on('socketLogout', function(data) {
    socket.broadcast.emit('socketLogoutFromServer', data);
  });
});


/******** Chargerment de la page index à l'acces au site ********/
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/CERIGame/index.html'));
});


/*
Fonction qui s'execute a l'acces de /login
Explication :
-Verifie le bon duo Login/mdp.
-Met a jour statut a 1 dans fredouil.users.
Entrée: nom d'utilisateur.
Sortie:
*/
app.get('/login', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /login");
  console.log('Login: ', req.query.login, " mdp: ", req.query.mdp);
  /******** CONNECTION A LA BDD postgreSQL ********/
  sqlLog = "select * from fredouil.users where identifiant='" + req.query.login + "';";
  sqlLog2 = "update fredouil.users set statut='1' where identifiant='" + req.query.login + "';";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    }
    client.query(sqlLog, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if ((result.rows[0] != null) && (result.rows[0].motpasse == sha1(req.query.mdp))) {
        console.log("mot de passe correct");
        client.query(sqlLog2, function(err2, result2) {
          if (err2) {
            console.log('Erreur d’exécution de la requete' + err.stack);
          }
        })
        /******** on recupere les informations et les stockes session mongodb ********/
        req.session.isConnected = true;
        req.session.username = req.query.login;;
        req.session.UserId = result.rows[0].id;
        /******** On prepare la reponse pour l'envoie au service ********/
        responseData.userID = result.rows[0].id;
        responseData.name = result.rows[0].nom;
        responseData.username = req.query.login;
        responseData.firstName = result.rows[0].prenom;
        responseData.imageProfil = result.rows[0].avatar;
        responseData.statusMsg = 'Connexion réussie : bonjour ' + result.rows[0].prenom;

      } else {
        console.log('Connexion échouée : informations de connexion incorrecte');
        responseData.statusMsg = 'Connexion échouée : informations de connexion incorrecte';
      }
      res.send(responseData);
    });
    client.release();
  });
});

/*
Fonction qui s'execute a l'acces de /logout
Explication : Met a jour statut a 0 dans fredouil.users.
Entrée: nom d'utilisateur.
Sortie:
*/
app.get('/logout', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /logout");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  sqlDeco = "update fredouil.users set statut='0' where identifiant='" + req.query.login + "';";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    }
    client.query(sqlDeco, function(err2, result2) {
      if (err2) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      }

      req.session.destroy(); // destruction des informations dans la session mongodb
      console.log("Deconnection...");
      res.send('/');
    });
  });
});

/*
Fonction qui s'execute a l'acces de /modificationnom
Explication : Met a jour nom dans fredouil.users.
Entrée: Nouveau nom.
Sortie:
*/
app.get('/modificationnom', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /modificationnom");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  console.log('Nouveau nom: ', req.query.nouveaunom, "pour l'utilisateur : ", req.query.username);
  sqlModifnom = "update fredouil.users set nom='" + req.query.nouveaunom + "' where identifiant='" + req.query.username + "';";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlModifnom, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {
        console.log('modif nom reussi');
        responseData.nom = req.query.nouveaunom;
        responseData.statusMsg = 'Modification reussi ';
        responseData.sucess = 'sucess';

      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Modification échouée';
        responseData.sucess = 'erreur';
      }
      res.send(responseData);
    });
    client.release();
  });
});

/*
Fonction qui s'execute a l'acces de /modificationprenom
Explication : Met a jour prenom dans fredouil.users.
Entrée: Nouveau prenom.
Sortie:
*/
app.get('/modificationprenom', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /modificationprenom");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  console.log('Nouveau prenom: ', req.query.nouveauprenom, "pour l'utilisateur : ", req.query.username);
  sqlModifprenom = "update fredouil.users set prenom='" + req.query.nouveauprenom + "' where identifiant='" + req.query.username + "';";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlModifprenom, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {
        console.log('Modification du prenom reussi.');

        responseData.prenom = req.query.nouveauprenom;
        responseData.statusMsg = 'Modification reussi ';
        responseData.sucess = 'sucess';

      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Modification échouée';
        responseData.sucess = 'erreur';
      }
      res.send(responseData);
    });
    client.release();
  });
});

/*
Fonction qui s'execute à l'acces de /photo
Explication : Heberge la photo sur pedago et la met a jour dans la BDD.
Entrée: Nouvelle photo a mettre a jour.
Sortie:
*/
app.post('/photo', upload.single('avatar'), function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /ThemeList");
  console.log("Utilisé par l'utilisateur : ", req.session.username);
  var cheminImage = 'http://pedago02a.univ-avignon.fr/~uapv1604417/TheCeriGameFinal/APP/CERIGame/images/' + req.file.filename;
  sql = "update fredouil.users set avatar='" + cheminImage + "' where identifiant='" + req.session.username + "';";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sql, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {
        console.log('Fonction photo : Ajout image réussi')
        responseData.photo = cheminImage;
        responseData.statusMsg = 'Modification reussi ';
        responseData.sucess = 'sucess';

      } else {
        console.log('Fonction photo : Ajout image échoué')
        responseData.statusMsg = 'Modification échouée';
        responseData.sucess = 'erreur';
      }

      res.send(responseData);
    });
    client.release();

  });

});

/*
Fonction qui s'execute à l'acces de /modificationphoto
Explication : Récupère l'avatar dans fredouil.users.
Entrée:
Sortie: Récupère le lien de l'avatar
*/
app.get('/modificationphoto', function(req, res) {
  sql = "select avatar from fredouil.users where identifiant='" + req.session.username + "';";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sql, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (1 == 1) // verifier que c'est un .jpg .png .gif plus tard
      {
        responseData.photo = result.rows[0].avatar;
        responseData.statusMsg = 'Recuperation de la photo reussi ';
        responseData.statusMsg = 'Modification reussi ';
        responseData.sucess = 'sucess';
        console.log(result);

      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Modification échouée';
        responseData.sucess = 'erreur';
      }
      res.send(responseData);
    });
    client.release();
  });
});





/*
Fonction qui s'execute a l'acces de /ThemeList
Explication : Fais un find dans la BDD MongoDB en affichant que les themes.
Entrée:
Sortie: Liste des themes
*/
app.get('/ThemeList', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /ThemeList");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      mongoClient.db().collection('quizz').distinct('thème', function(err, data) {
        if (err) return console.log('erreur base de données');
        if (data) {
          console.log('requete ok ');
          mongoClient.close();
          res.send(data);
        }
      });
    }
  });
});

/*
Fonction qui s'execute a l'acces de /ThemeQuestion
Explication : Fais un find dans la BDD MongoDB sur le theme choisi.
Entrée: theme choisi.
Sortie: Les questions du theme.
*/
app.get('/ThemeQuestion', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /ThemeQuestion");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  var theme = req.query.theme;
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      mongoClient.db().collection('quizz').find({
        'thème': theme
      }, {
        "quizz": 1,
        _id: 0
      }).toArray(function(err, data) { // DATA RESTE VIDE
        if (err) return console.log('erreur base de données');
        if (data) {
          console.log('requete ok ');
          mongoClient.close();
          res.send(data);
        }
      });
    }
  });
});



/*
Fonction qui s'execute a l'acces de /sendScore
Explication : Insert dans la base de donnée psql fredouil.historique
Entrée: nom d'utilisateur, date, nombre de bonne reponse, temps total, score.
Sortie:
*/
app.get('/sendScore', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /sendScore");
  console.log("Utilisé par l'utilisateur : ", req.session.username);
  console.log('Pour username: ', req.query.user, "a la date : ", req.query.date, "avc le nb de bonne rep : ", req.query.nbrep, "avec le temps : ", req.query.time, "et le score : ", req.query.score, );
  sqlSend = "INSERT INTO fredouil.historique(id_users,date,nbreponse,temps,score) VALUES ('" + req.query.user + "','" + req.query.date + "','" + req.query.nbrep + "','" + req.query.time + "','" + req.query.score + "');";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlSend, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) // verifier que c'est un .jpg .png .gif plus tard
      {
        console.log('Ajout dans historique reussi');

        responseData.statusMsg = 'Modification reussi ';
        responseData.sucess = 'sucess';

      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Modification échouée';
        responseData.sucess = 'erreur';
      }
      res.send(responseData);
    });
    client.release();
  });
});

/*
Fonction qui s'execute a l'acces de /VoirHist
Entrée:
Sortie:
*/
app.get('/VoirHist', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /VoirHist");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  console.log('Voir historique de : ', req.session.UserId);
  histoId = parseInt(req.session.UserId, 10);
  sqlVoirHist = "select date,nbreponse,temps,score from fredouil.historique where id_users='" + histoId + "'ORDER BY id DESC LIMIT 10;";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlVoirHist, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {
        responseData.statusMsg = 'Recuperation reussi ';
        responseData.sucess = 'sucess';
        responseData.resultat = result;
      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Recuperation échouée';
        responseData.sucess = 'erreur';
      }
      res.send(responseData);
    });
    client.release();
  });
});


/*
Fonction qui s'execute a l'acces de /VoirHistoDefi
Entrée:
Sortie:
*/
app.get('/VoirHistodefi', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /voirHistoDefi");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  console.log('Voir historique de : ', req.session.UserId);

  // Cherche ou l'utilisateur connecté apprais dans défiant ou défié, trié par l'id avec une taille de 10 lignes.
  sqlVoirHistodefi = "SELECT * FROM fredouil.hist_defi WHERE (id_users_defiant='" + req.session.UserId + "' OR id_users_defie='" + req.session.UserId + "') ORDER BY id DESC LIMIT 10;";

  var responseData = {}; // creation de la reponse


  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlVoirHistodefi, function(err, result) {
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {
        var i = 0;
        responseData.tableau = [];

        replace(i);

        function replace(i) {
          if (i < result.rows.length) {
            sql1= "SELECT identifiant FROM fredouil.users WHERE id ='"+result.rows[i].id_users_defiant+"';";
            sql2= "SELECT identifiant FROM fredouil.users WHERE id ='"+result.rows[i].id_users_defie+"';";
            sql3= "SELECT identifiant FROM fredouil.users WHERE id ='"+result.rows[i].id_users_gagnant+"';";
            responseData.tableau[i] = {};
            responseData.tableau[i].date = result.rows[i].date;
            date = responseData.tableau[i].date;
            date = 'Le ' + ("0" + date.getDate()).slice(-2) + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + ' à ' + ("0" + date.getHours()).slice(-2) + 'h' + ("0" + date.getMinutes()).slice(-2);
            responseData.tableau[i].date = date;
            client.query(sql1, (err, result1) => {
              client.query(sql2, (err, result2) => {
                client.query(sql3, (err, result3) => {
                  // mettre contre qui on à joué
                  if (result1.rows[0].identifiant != req.session.username) {
                    responseData.tableau[i].contre = result1.rows[0].identifiant;
                  } else {
                    responseData.tableau[i].contre = result2.rows[0].identifiant;
                  }
                  //voir si on a gagné
                  if (result3.rows[0].identifiant == req.session.username) {
                    responseData.tableau[i].winner = "Victoire";
                  } else {
                    responseData.tableau[i].winner = "Défaite";
                  }
                  i += 1;
                  if (i == result.rows.length) { // Quand on a parcouru tous le tableau on renvoi les données
                    client.release();
                    res.send(responseData);
                  }
                  replace(i);
                });
              });
            });
          }
        }
        responseData.statusMsg = 'Recuperation reussi ';
        responseData.sucess = 'sucess';
      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Recuperation échouée';
        responseData.sucess = 'erreur';
        client.release();
        res.send(responseData);
      }

    });

  });
});



/*
Fonction qui s'execute a l'acces de /getListOfUsers
Entrée: idutilisateur
Sortie:
*/
app.get('/getListOfUsers', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /getListOfUsers");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  sqlGetList = "select id,identifiant,statut,nom,prenom,avatar from fredouil.users;";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlGetList, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {
        responseData.statusMsg = 'Recuperation reussi ';
        responseData.sucess = 'sucess';
        responseData.resultat = result;
      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Recuperation échouée';
        responseData.sucess = 'erreur';
      }
      res.send(responseData);
    });
    client.release();
  });
});


/*
Fonction qui s'execute a l'acces de /ThemeQuestion
Explication : Fais un find dans la BDD MongoDB sur le theme choisi.
Entrée: theme choisi.
Sortie: Les questions du theme.
*/
app.get('/SendDefiToUsers', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /SendDefiToUsers");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  var jsonVar = req.query.json;
  var jsonVar2 = JSON.parse(jsonVar);
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      mongoClient.db().collection('defi').insertOne(jsonVar2, function(err, data) {
        if (err) return console.log('erreur base de données');
        if (data) {
          var responseData = {}; // creation de la reponse
          console.log('requete ok ');
          responseData.statusMsg = 'Recuperation reussi ';
          responseData.sucess = 'sucess';
          mongoClient.close();
          res.send(responseData);
        } else {
          var responseData = {}; // creation de la reponse
          console.log('requete non réussi ');
          responseData.statusMsg = 'Ajout dans la bdd echouée ';
          responseData.sucess = 'erreur';
          mongoClient.close();
          res.send(responseData);
        }
      });
    }
  });
});


/*
Fonction qui s'execute a l'acces de /getDefi
Explication : Permet de voir si un defi à été lancé a un ID.
Entrée: ID utilisateur.
Sortie: Defi à accepté ou refusé.
*/
app.get('/getNombreDefi', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /getNombreDefi");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  var id = req.query.idutilisateur;
  console.log("Chercher un defi pour l utilisateur ", req.session.UserId);
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      idNb = parseInt(req.session.UserId, 10);
      mongoClient.db().collection('defi').find({
        'id_user_defie': idNb
      }).toArray(function(err, data) {
        if (err) return console.log('erreur base de données');
        if (data) {
          var responseData = {}; // creation de la reponse
          responseData.defienattente = data.length;
          mongoClient.close();
          res.send(responseData);
        } else {
          var responseData = {}; // creation de la reponse
          console.log('requete non réussi ');
          responseData.statusMsg = 'Recuperation echouée ';
          responseData.sucess = 'erreur';
          mongoClient.close();
          res.send(responseData);
        }
      });
    }
  });
});


/*
Fonction qui s'execute a l'acces de /getLastDefi
Entrée: idutilisateur
Sortie: dernier defi avec nom de l'utilisateur qui a défié ajouté dans la réponse
*/

app.get('/getLastDefi', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /getLastDefi");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  var id = req.query.idutilisateur;
  console.log("Chercher un defi pour l utilisateur ", id);
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      idNb = parseInt(id, 10);
      mongoClient.db().collection('defi').findOne({
        'id_user_defie': idNb
      }, function(err, data) {
        if (err) return console.log('erreur base de données');
        if (data) {
          var responseData = {}; // creation de la reponse
          var name = data.id_user_defiant;
          sqlLastDefi = "select identifiant from fredouil.users where id='" + name + "';";
          pool.connect(function(err, client, done) {
            if (err) {
              console.log('Error connecting to pg server' + err.stack);
            } else {
              console.log('Connection established with pg db server');
            };
            client.query(sqlLastDefi, function(err, result) {

              data.name = result.rows[0].identifiant;
              console.log('requete ok ');
              responseData.defienattente = data;
              client.release();
              mongoClient.close();
              res.send(responseData);
            });
          });
        } else {
          var responseData = {}; // creation de la reponse
          console.log('requete non réussi ');
          responseData.statusMsg = 'Recuperation echouée ';
          responseData.sucess = 'erreur';
          mongoClient.close();
          res.send(responseData);
        }
      });
    }
  });
});

/*
Fonction qui s'execute a l'acces de /recupNomByID
Entrée: idutilisateur
Sortie: identifiant
*/
app.get('/recupNomByID', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces /recupNomByID");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  console.log("Recherche du username de ", req.query.iduser);
  sqlRecupNom = "select identifiant from fredouil.users where id='" + req.query.iduser + "';";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlRecupNom, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {

        responseData.statusMsg = 'Recuperation reussi ';
        responseData.sucess = 'sucess';
        responseData.resultat = result;
      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Recuperation échouée';
        responseData.sucess = 'erreur';
      }
      res.send(responseData);
    });
    client.release();
  });
});



/*
Fonction qui s'execute a l'acces de /RefuseDefi
Entrée: id du defie, id defié, id défiant, score, date
Explication : Utilisé si on refuse un defi mais aussi en acceptant le défi. Supprime le defi de mongo db et déclare le défié perdant.
Sortie:
*/
app.get('/RefuseDefi', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /RefuseDefi");
  console.log("Utilisé par l'utilisateur : ", req.session.username);
  var idmongo = req.query.idmongo;
  console.log("id mongo a suppr ", idmongo);
  var idDefie = req.query.defie;
  var idDefiant = req.query.defiant;
  var idGagnant = req.query.gagnant;
  var date = req.query.date;
  console.log("Supprimer dans mongoDb le defi ", idmongo);
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      mongoClient.db().collection('defi').deleteOne({
        '_id': new ObjectID(idmongo)
      }, function(err, data) {
        if (err) return console.log('erreur base de données');
        if (data) {
          var responseData = {}; // creation de la reponse
          sqlRefuse = "INSERT INTO fredouil.hist_defi(id_users_defiant,id_users_defie,id_users_gagnant,date) VALUES ('" + idDefiant + "','" + idDefie + "','" + idGagnant + "','" + date + "') RETURNING id;";
          pool.connect(function(err, client, done) {
            if (err) {
              console.log('Error connecting to pg server' + err.stack);
            } else {
              console.log('Connection established with pg db server');
            };
            client.query(sqlRefuse, function(err, result) {
              console.log('Modification de hist_defi bien effectué ');
              responseData.sucess = "Success";
              responseData.idsql = result.rows;
              mongoClient.close();
              res.send(responseData);
            });
          });
        } else {
          var responseData = {};
          console.log('requete non réussi ');
          responseData.statusMsg = 'Recuperation echouée ';
          responseData.sucess = 'erreur';
          mongoClient.close();
          client.release();
          res.send(responseData);
        }
      });
    }
  });
});

/*
Fonction qui s'execute a l'acces de /SupprMongoAllum
Entrée:
Explication :
Sortie:
*/
app.get('/SupprMongoAllum', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /SupprMongAllum");
  console.log("Utilisé par l'utilisateur : ", req.session.username);
  var idmongo = req.query.idmongo;
  console.log("id mongo a suppr ", idmongo);
  console.log("Supprimer dans mongoDb le defi ", idmongo);
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      mongoClient.db().collection('allumettes').deleteOne({
        '_id': new ObjectID(idmongo)
      }, function(err, data) {
        if (err) return console.log('erreur base de données');
        if (data) {
          var responseData = {}; // creation de la reponse

          console.log('Suppression mongodb effectué ');
          responseData.sucess = "Success";
          mongoClient.close();
          res.send(responseData);

        } else {
          var responseData = {};
          console.log('requete non réussi ');
          responseData.statusMsg = 'Recuperation echouée ';
          responseData.sucess = 'erreur';
          mongoClient.close();
          res.send(responseData);
        }
      });
    }
  });
});



/*
Fonction qui s'execute a l'acces de /sendWinner
Entrée: id gagnant , id sql
Explication : utilisé a la fin du défi seulement si il a gagné, la bdd hist_defi est modifié avec l'id du gagnant.
Sortie:
*/
app.get('/SendWinner', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /SendWinner");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  console.log("Mettre gagnant :", req.query.gagnant, "sur le defi à l'id :", req.query.idsql, "dans la table hist_defi");
  sqlSendWinner = "UPDATE fredouil.hist_defi set id_users_gagnant='" + req.query.gagnant + "' where id='" + req.query.idsql + "';";
  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlSendWinner, function(err, result) {
      var responseData = {}; // creation de la reponse
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {
        responseData.statusMsg = 'Recuperation reussi ';
        responseData.sucess = 'sucess';
        responseData.resultat = result;
      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Recuperation échouée';
        responseData.sucess = 'erreur';
      }
      client.release();
      res.send(responseData);
    });
  });
});

/*
Fonction qui s'execute a l'acces de /voirMeilleursJoueurs
Permet de recuperer le top 10 des meilleurs joueurs.
Entrée:
Sortie:
*/
app.get('/voirMeilleursJoueurs', function(req, res2) {
  console.log("-------------------------------------");
  console.log("Acces a /voirMeilleursJoueurs");
  console.log("Utilisé par l'utilisateur : ", req.session.username);


  // Cherche ou l'utilisateur connecté apprais dans défiant ou défié, trié par l'id avec une taille de 10 lignes.
  sqlVoirTop = "select * from fredouil.historique ORDER BY score DESC LIMIT 10;"

  var responseData2 = {}; // creation de la reponse


  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlVoirTop, function(err, resultvoirtop) {
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (resultvoirtop) {
        var i = 0;
        responseData2.tableau = [];
        replace(i);

        function replace(i) {
          if (i < resultvoirtop.rows.length) {
            sql1 = "SELECT identifiant FROM fredouil.users WHERE id ='" + resultvoirtop.rows[i].id_users + "';";
            responseData2.tableau[i] = {};
            responseData2.tableau[i].date = resultvoirtop.rows[i].date;
            date = responseData2.tableau[i].date;
            date = 'Le ' + ("0" + date.getDate()).slice(-2) + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + ' à ' + ("0" + date.getHours()).slice(-2) + 'h' + ("0" + date.getMinutes()).slice(-2);
            responseData2.tableau[i].date = date;
            client.query(sql1, function(err, result1) {
              responseData2.tableau[i].nom = result1.rows[0].identifiant;
              responseData2.tableau[i].score = resultvoirtop.rows[i].score;
              i += 1;
              if (i == resultvoirtop.rows.length) { // Quand on a parcouru tous le tableau on renvoi les données
                client.release();
                res2.send(responseData2);
              }
              replace(i);


            });
          }
        }
        responseData2.statusMsg = 'Recuperation reussi ';
        responseData2.sucess = 'sucess';
      } else {
        console.log('Modification échouée');
        responseData2.statusMsg = 'Recuperation échouée';
        responseData2.sucess = 'erreur';
        client.release();
        res.send(responseData2);
      }

    });

  });
});

/*
				Fonction qui s'execute a l'acces de /RefuseDefiAllu
				Entrée: id du defie, id defié, id défiant, score, date
				Sortie:
				*/
app.get('/GagnerDefiAllu', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /RefuseDefiAllu");
  console.log("Utilisé par l'utilisateur : ", req.session.username);
  var idmongo = req.query.idmongo;
  console.log("id mongo a suppr ", idmongo);
  var idDefie = req.query.defie;
  var idDefiant = req.query.defiant;
  var idGagnant = req.query.gagnant;
  var date = req.query.date;
  console.log("Supprimer dans mongoDb le defi ", idmongo);
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      mongoClient.db().collection('allumettes').deleteOne({
        '_id': new ObjectID(idmongo)
      }, function(err, data) {
        if (err) return console.log('erreur base de données');
        if (data) {
          var responseData = {}; // creation de la reponse
          allumettes = "allumettes";
          sqlRefuse = "INSERT INTO fredouil.hist_jeu(id_users_defiant,id_users_defie,id_users_gagnant,type_jeu,date) VALUES ('" + idDefiant + "','" + idDefie + "','" + req.session.UserId + "','" + allumettes + "','" + date + "') RETURNING id;";
          pool.connect(function(err, client, done) {
            if (err) {
              console.log('Error connecting to pg server' + err.stack);
            } else {
              console.log('Connection established with pg db server');
            };
            client.query(sqlRefuse, function(err, resultAllu) {
              console.log('Ajout dans hist_jeu bien effectué ');
              console.log(err);
              console.log(resultAllu);
              responseData.sucess = "Success";
              responseData.idsql = resultAllu.rows;
              mongoClient.close();
              client.release();
              res.send(responseData);
            });
          });
        } else {
          var responseData = {};
          console.log('requete non réussi ');
          responseData.statusMsg = 'Recuperation echouée ';
          responseData.sucess = 'erreur';
          mongoClient.close();
          res.send(responseData);
        }
      });
    }
  });
});

/*
Fonction qui s'execute a l'acces de /getLastDefiAllu
Entrée: idutilisateur
Sortie: dernier defi avec nom de l'utilisateur qui a défié ajouté dans la réponse
*/

app.get('/getLastDefiAllu', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /getLastDefiAllu");
  console.log("Utilisé par l'utilisateur : ", req.session.username);
  console.log("A la date : ", new Date());

  var id = req.session.UserId;
  console.log("Chercher un defi allumete pour l utilisateur ", req.session.UserId);
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      console.log("reussi base de données mongodb");
      idNb = parseInt(id, 10);
      mongoClient.db().collection('allumettes').findOne({
        'id_user_defie': idNb
      }, function(err, dataAllu) {
        if (err) return console.log('erreur base de données');
        if (dataAllu) {
          console.log("mongo db allu trouvé", dataAllu);
          var responseData = {}; // creation de la reponse
          var name = dataAllu.id_user_defiant;
          console.log("data Allu ID user defiant : ", dataAllu.id_user_defiant);
          sqlRechercheAllu = "select identifiant from fredouil.users where id='" + name + "';";
          pool.connect(function(err, client, done) { // ne rentre pas dans pool.connect selon son humeur
            console.log("je rentre dans pool connect")
            if (err) {
              console.log('Error connecting to pg server' + err.stack);
            } else {
              console.log('Connection established with pg db server');
            }
            client.query(sqlRechercheAllu, function(err, resultRechercheAllu) {

              dataAllu.name = resultRechercheAllu.rows[0].identifiant;
              console.log('requete ok ');
              responseData.defienattente = dataAllu;
              mongoClient.close();
              client.release();
              res.send(responseData);
            });
          });
        } else {
          var responseData = {}; // creation de la reponse
          console.log("Aucun defi allumete a jouer.")
          responseData.sucess = "erreur";
          mongoClient.close();
          res.send(responseData);
        }
      });
    }
  });
});

/*
Fonction qui s'execute a l'acces de /SendDefiToUsersAllu
Explication : Envoi un defi du jeu allumette à un utilisateurs choisis
Entrée:
Sortie:
*/
app.get('/SendDefiToUsersAllu', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /SendDefiToUsersAllu");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  var jsonVar = req.query.json;
  var jsonVar2 = JSON.parse(jsonVar);
  MongoClient.connect(mdb, {
    useNewUrlParser: true
  }, function(err, mongoClient) {
    if (err) {
      return console.log("erreur connexion base de données");
    }
    if (mongoClient) {
      mongoClient.db().collection('allumettes').insertOne(jsonVar2, function(err, data) {
        if (err) return console.log('erreur base de données');
        if (data) {
          var responseData = {}; // creation de la reponse
          console.log('requete ok ');
          responseData.statusMsg = 'Recuperation reussi ';
          responseData.sucess = 'sucess';
          mongoClient.close();
          res.send(responseData);
        } else {
          var responseData = {}; // creation de la reponse
          console.log('requete non réussi ');
          responseData.statusMsg = 'Ajout dans la bdd echouée ';
          responseData.sucess = 'erreur';
          mongoClient.close();
          res.send(responseData);
        }
      });
    }
  });
});


/*
Fonction qui s'execute a l'acces de /VoirHistodefiAllumette
Explication : Recupere les 10 derniers historique dans hist_jeu et recupere le nom des ID avant de le renvoyer au service.
Entrée:
Sortie:
*/
app.get('/VoirHistodefiAllumette', function(req, res) {
  console.log("-------------------------------------");
  console.log("Acces a /VoirHistodefiAllumette");
  console.log("Utilisé par l'utilisateur : ", req.session.username);

  console.log('Voir historique de : ', req.session.UserId);

  // Cherche ou l'utilisateur connecté apprais dans défiant ou défié, trié par l'id avec une taille de 10 lignes.
  sqlVoirHistodefi = "SELECT * FROM fredouil.hist_jeu WHERE (id_users_defiant='" + req.session.UserId + "' OR id_users_defie='" + req.session.UserId + "') ORDER BY id DESC LIMIT 10;";

  var responseData = {}; // creation de la reponse


  pool.connect(function(err, client, done) {
    if (err) {
      console.log('Error connecting to pg server' + err.stack);
    } else {
      console.log('Connection established with pg db server');
    };
    client.query(sqlVoirHistodefi, function(err, result) {
      if (err) {
        console.log('Erreur d’exécution de la requete' + err.stack);
      } else if (result) {
        var i = 0;
        responseData.tableau = [];

        replace(i);

        function replace(i) {
          if (i < result.rows.length) {
            sql1= "SELECT identifiant FROM fredouil.users WHERE id ='"+result.rows[i].id_users_defiant+"';";
            sql2= "SELECT identifiant FROM fredouil.users WHERE id ='"+result.rows[i].id_users_defie+"';";
            sql3= "SELECT identifiant FROM fredouil.users WHERE id ='"+result.rows[i].id_users_gagnant+"';";
            responseData.tableau[i] = {};
            responseData.tableau[i].date = result.rows[i].date;
            date = responseData.tableau[i].date;
            date = 'Le ' + ("0" + date.getDate()).slice(-2) + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + ' à ' + ("0" + date.getHours()).slice(-2) + 'h' + ("0" + date.getMinutes()).slice(-2);
            responseData.tableau[i].date = date;
            client.query(sql1, (err, result1) => {
              client.query(sql2, (err, result2) => {
                client.query(sql3, (err, result3) => {
                  // mettre contre qui on à joué
                  if (result1.rows[0].identifiant != req.session.username) {
                    responseData.tableau[i].contre = result1.rows[0].identifiant;
                  } else {
                    responseData.tableau[i].contre = result2.rows[0].identifiant;
                  }
                  //voir si on a gagné
                  if (result3.rows[0].identifiant == req.session.username) {
                    responseData.tableau[i].winner = "Victoire";
                  } else {
                    responseData.tableau[i].winner = "Défaite";
                  }
                  i += 1;
                  if (i == result.rows.length) { // Quand on a parcouru tous le tableau on renvoi les données
                    client.release();
                    res.send(responseData);
                  }
                  replace(i); // Rappel la fonction replace avec le i incrémenté
                });
              });
            });
          }
        }
        responseData.statusMsg = 'Recuperation reussi ';
        responseData.sucess = 'sucess';
      } else {
        console.log('Modification échouée');
        responseData.statusMsg = 'Recuperation échouée';
        responseData.sucess = 'erreur';
        client.release();
        res.send(responseData);
      }

    });

  });
});
