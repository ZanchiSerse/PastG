const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const port = 3000;
const cors = require('cors');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');


app.use(cors());
const corsOptions = {
    origin: 'http://localhost:3000', // Configura l'origine del client
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
//const DBMock = require('./DBMock');
//let dab = new DBMock();

// Connessione al database SQLite
let db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        return console.error('Errore di connessione al database:', err.message);
    }
    console.log('Connesso al database SQLite.');
});

app.use(session({
    secret: 'tuaChiaveSegreta', // Cambiala con una stringa sicura
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Metti `true` se usi HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 ore
    }
}));


//google 
// Inizializza Passport e sessioni
app.use(passport.initialize());
app.use(passport.session());

// Configurazione per il login tramite Google
passport.use(new GoogleStrategy({
    clientID: 'api',
    clientSecret: 'api',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Puoi salvare o gestire il profilo utente qui
    return done(null, profile);
}));

// Serializzazione e deserializzazione utente
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Rotte per il login tramite Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login'
}), (req, res) => {
    res.redirect('/sars.html'); // Reindirizza alla pagina desiderata
});


// Middleware per verificare se l'utente è autenticato
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated() || req.session.loggedin) {
        return next();
    }
    res.redirect('/login');
}




// Creazione tabella utenti
db.run(`CREATE TABLE IF NOT EXISTS utenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    residenza TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    telefono TEXT NOT NULL UNIQUE
)`);

// Creazione tabella clienti
db.run(`CREATE TABLE IF NOT EXISTS clienti (
    idclienti INTEGER PRIMARY KEY AUTOINCREMENT,
    nomecliente TEXT NOT NULL UNIQUE
)`);


/**
 * @swagger
 * /datetime:
 *   get:
 *     summary: Ottiene data e ora corrente
 *     responses:
 *       200:
 *         description: Data e ora formattata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datetime:
 *                   type: string
 */
app.get('/datetime', (req, res) => {
    const now = new Date();
    const formattedDate = now.toLocaleString('it-IT', {
        dateStyle: 'full',
        timeStyle: 'medium'
    });
    res.json({ datetime: formattedDate });
});

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Aggiunge un nuovo cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomecliente
 *             properties:
 *               nomecliente:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creato con successo
 *       400:
 *         description: Dati mancanti o non validi
 */
app.post('/clients', (req, res) => {
    const { nomecliente } = req.body;

    if (!nomecliente) {
        return res.status(400).json({ error: "Il nome del cliente è obbligatorio." });
    }

    const query = `INSERT INTO clienti (nomecliente) VALUES (?)`;
    db.run(query, [nomecliente], function (err) {
        if (err) {
            console.error('Errore SQL:', err.message);
            return res.status(500).json({ error: "Errore durante il salvataggio del cliente." });
        }
        res.status(201).json({ id: this.lastID, nomecliente });
    });
});

// Endpoint per ottenere i clienti ordinati
app.get('/clients/ordered', (req, res) => {
    console.log("here")
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
    const query = `SELECT * FROM clienti ORDER BY nomecliente ${order}`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Errore durante la lettura dei clienti:', err);
            return res.status(500).json({ error: "Errore del server." });
        }
        res.json(rows);
    });
});


app.get('/users/ordered', (req, res) => {
    db.all(`SELECT id, nome, email, telefono FROM utenti ORDER BY nome ASC`, [], (err, rows) => {
        if (err) {
            console.error('Errore nella ricerca degli utenti:', err.message); // Log dell'errore
            return res.status(500).json({ error: err.message });
        }
        console.log('Utenti trovati:', rows); // Log dei dati recuperati
        res.json(rows);
    });
});



app.post('/clients/add', (req, res) => {
    const { nomecliente } = req.body;

    if (!nomecliente) {
        return res.status(400).json({ error: "Il campo 'nomecliente' è obbligatorio" });
    }

    db.run(`INSERT INTO clienti (nomecliente) VALUES (?)`, [nomecliente], function (err) {
        if (err) {
            console.error('Errore nell\'aggiungere il cliente:', err.message); // Log dell'errore
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Cliente aggiunto con successo', id: this.lastID });
    });
});


// Route per eliminare un cliente
app.post('/clients/delete', (req, res) => {
    const { idclienti } = req.body;  // Riceviamo l'ID del cliente da eliminare

    if (!idclienti) {
        return res.status(400).json({ error: 'ID cliente non fornito' });
    }

    console.log(`Richiesta di eliminazione del cliente con ID: ${idclienti}`); // Aggiunto per il debug

    // Eseguiamo la query per eliminare il cliente dalla tabella
    db.run('DELETE FROM clienti WHERE idclienti = ?', [idclienti], function (err) {
        if (err) {
            console.error('Errore nella cancellazione del cliente:', err.message); // Log dell'errore
            return res.status(500).json({ error: 'Errore nella cancellazione del cliente' });
        }

        // Se il cliente è stato eliminato correttamente
        if (this.changes === 0) {
            console.log('Cliente non trovato per l\'eliminazione.'); // Aggiunto per il debug
            return res.status(404).json({ error: 'Cliente non trovato' });
        }

        console.log(`Cliente con ID ${idclienti} eliminato con successo!`);
        return res.status(200).json({ message: 'Cliente eliminato con successo!' });
    });
});
app.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({ error: 'Errore durante il logout' });
            } else {
                res.status(200).send();
            }
        });
    } else {
        res.status(200).send(); // Nessuna sessione da distruggere
    }
});

const validateEmail = async (email) => {
    try {
        const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=9de1734fe7c844f89aae6090e3cf6fca&email=${email}`);
        const data = await response.json();
        console.log('Risposta API:', data); // Debug
        return data.is_valid_format.value; // Accesso corretto al valore booleano
    } catch (error) {
        console.error('Errore validazione email:', error);
        throw error;
    }
};

app.post('/register', async (req, res) => {  // Aggiunto async
    const { nome, telefono, residenza, email, password } = req.body;

    try {
        const isValidEmail = await validateEmail(email);
        console.log('Risultato validazione:', isValidEmail); // Debug
        if (!isValidEmail) {
            return res.status(400).json({ error: "Formato email non valido" });
        }

        const query = `INSERT INTO utenti (nome, residenza, email, password, telefono) VALUES (?, ?, ?, ?, ?)`;
        db.run(query, [nome, residenza, email, password, telefono], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: "Email o telefono già registrati." });
                }
                return res.status(500).json({ error: "Errore durante la registrazione." });
            }
            res.status(201).json({ id: this.lastID, message: "Registrazione completata con successo." });
        });
    } catch (error) {
        console.error("Errore nella validazione email:", error);
        res.status(500).json({ error: "Errore durante la validazione dell'email." });
    }
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM utenti WHERE email = ?`;
    db.get(query, [email], (err, user) => {
        if (err || !user || user.password !== password) {
            return res.status(401).json({ error: "Credenziali non valide." });
        }
        res.status(200).json({ user: { id: user.id, nome: user.nome, email: user.email } });
    });
});

const host = '127.0.0.1'; // Può essere cambiato con il nome host desiderato
app.listen(port, host, () => {
    console.log(`Server in esecuzione su http://${host}:${port}`);
});



