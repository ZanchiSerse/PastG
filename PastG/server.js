const express = require('express'); 
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configurazione di Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API di esempio',
            version: '1.0.0',
            description: 'API per registrazione e login utenti',
        },
    },
    apis: ['./server.js'], // Percorso al file che contiene i commenti Swagger (in questo caso server.js)
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Connessione al database SQLite
let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connesso al database SQLite.');
});

// Creazione tabella utenti
db.run(`CREATE TABLE IF NOT EXISTS utenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    residenza TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    telefono TEXT NOT NULL UNIQUE
)`);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registra un nuovo utente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               residenza:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registrazione avvenuta con successo
 *       400:
 *         description: Errore nei dati forniti
 */
app.post('/register', (req, res) => {
    const { nome, residenza, email, password, telefono } = req.body;

    if (!nome || !residenza || !email || !password || !telefono) {
        return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "La password deve avere almeno 6 caratteri" });
    }

    db.get(`SELECT * FROM utenti WHERE email = ? OR telefono = ?`, [email, telefono], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: "Email o telefono già registrati" });
        }

        db.run(`INSERT INTO utenti (nome, residenza, email, password, telefono) VALUES (?, ?, ?, ?, ?)`,

            [nome, residenza, email, password, telefono],
            function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Registrazione avvenuta con successo', id: this.lastID });
            }
        );
    });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Effettua il login di un utente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *       400:
 *         description: Errore nei dati di login
 */
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email e password sono obbligatorie" });
    }

    db.get(`SELECT * FROM utenti WHERE email = ?`, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(400).json({ error: "Utente non trovato" });
        }

        if (user.password !== password) {
            return res.status(400).json({ error: "Password errata" });
        }

        res.json({ message: 'Login effettuato con successo', user: { id: user.id, nome: user.nome, residenza: user.residenza, telefono: user.telefono } });
    });
});

/**
 * @swagger
 * /users/ordered:
 *   get:
 *     summary: Recupera la lista di utenti ordinata alfabeticamente
 *     responses:
 *       200:
 *         description: Lista degli utenti ordinata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   email:
 *                     type: string
 *                   telefono:
 *                     type: string
 */
app.get('/users/ordered', (req, res) => {
    db.all(`SELECT id, nome, email, telefono FROM utenti ORDER BY nome ASC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // Restituisce gli utenti ordinati
    });
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Recupera la lista di tutti i prodotti
 *     responses:
 *       200:
 *         description: Lista dei prodotti recuperata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   descrizione:
 *                     type: string
 *                   prezzo:
 *                     type: number
 */
app.get('/products', (req, res) => {
    db.all(`SELECT id, nome, descrizione, prezzo FROM prodotti`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Gestione della chiusura del database
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Chiusura del database.');
        process.exit(0);
    });
});

// Creazione della tabella prodotti (se non esiste già)
db.run(`CREATE TABLE IF NOT EXISTS prodotti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descrizione TEXT,
    prezzo REAL NOT NULL
)`);

// Avvio del server
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
    console.log(`Documentazione Swagger disponibile su http://localhost:${port}/api-docs`);
});