const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());
const corsOptions = {
    origin: 'http://localhost:3000', // Configura l'origine del client
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

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



app.get('/datetime', (req, res) => {
    const now = new Date();
    const formattedDate = now.toLocaleString('it-IT', { 
        dateStyle: 'full', 
        timeStyle: 'medium' 
    });
    res.json({ datetime: formattedDate });
});

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
app.post('/register', (req, res) => {
    const { nome, telefono, residenza, email, password } = req.body;

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

// Avvio del server
const host = '127.0.0.1'; // Può essere cambiato con il nome host desiderato
app.listen(port, host, () => {
    console.log(`Server in esecuzione su http://${host}:${port}`);
});
