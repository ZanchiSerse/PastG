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

app.post('/register', (req, res) => {
    const { nome, residenza, email, password, telefono } = req.body;

    if (!nome || !residenza || !email || !password || !telefono) {
        return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "La password deve avere almeno 6 caratteri" });
    }

    // Verifica esistenza utente
    db.get(`SELECT * FROM utenti WHERE email = ? OR telefono = ?`, [email, telefono], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Errore durante la registrazione' });
        }

        if (row) {
            return res.status(400).json({ error: "Email o telefono già registrati" });
        }

        // Hash della password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: 'Errore durante la registrazione' });
            }

            // Inserimento utente
            db.run(`INSERT INTO utenti (nome, residenza, email, password, telefono) VALUES (?, ?, ?, ?, ?)`,
                [nome, residenza, email, hashedPassword, telefono], function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Errore durante la registrazione' });
                    }
                    res.json({ message: 'Registrazione avvenuta con successo', id: this.lastID });
                }
            );
        });
    });
});
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e password sono obbligatori' });
    }

    db.get('SELECT * FROM utenti WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Errore database:', err);
            return res.status(500).json({ error: 'Errore interno del server' });
        }

        if (!row) {
            return res.status(400).json({ error: 'Email o password errati' });
        }

        // Verifica la password
        bcrypt.compare(password, row.password, (err, isMatch) => {
            if (err) {
                console.error('Errore durante la verifica della password:', err);
                return res.status(500).json({ error: 'Errore interno del server' });
            }

            if (!isMatch) {
                return res.status(400).json({ error: 'Email o password errati' });
            }

            // Login riuscito
            res.json({ message: 'Login avvenuto con successo', user: { id: row.id, nome: row.nome, email: row.email } });
        });
    });
});


app.get('/clients', (req, res) => {
    console.log('Richiesta ricevuta per /clients');
    db.all(`SELECT * FROM clienti`, (err, rows) => {
        if (err) {
            console.error('Errore nel recupero dei clienti:', err.message);
            return res.status(500).json({ error: 'Errore nel recupero dei dati' });
        }
        console.log('Clienti trovati:', rows); // Aggiunto per debug
        res.json(rows);
    });
});


app.get('/datetime', (req, res) => {
    const now = new Date();
    const formattedDate = now.toLocaleString('it-IT', { 
        dateStyle: 'full', 
        timeStyle: 'medium' 
    });
    res.json({ datetime: formattedDate });
});

// Endpoint per ottenere tutti i clienti
app.get('/clients', (req, res) => {
    console.log('Richiesta ricevuta per /clients');
    db.all(`SELECT * FROM clienti`, (err, rows) => {
        if (err) {
            console.error('Errore nel recupero dei clienti:', err.message);
            return res.status(500).json({ error: 'Errore nel recupero dei dati' });
        }
        console.log('Clienti trovati:', rows); // Aggiunto per debug
        res.json(rows); // Restituisce i clienti come JSON
    });
});

// Endpoint per ottenere i clienti ordinati (A-Z o Z-A)
app.get('/clients/ordered', (req, res) => {
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';
    db.all(`SELECT * FROM clienti ORDER BY nomecliente ${order}`, (err, rows) => {
        if (err) {
            console.error('Errore nel recupero dei clienti:', err.message);
            return res.status(500).json({ error: 'Errore nel recupero dei dati' });
        }
        res.json(rows); // Restituisce i clienti ordinati
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

// Avvio del server
const host = '127.0.0.1'; // Può essere cambiato con il nome host desiderato
app.listen(port, host, () => {
    console.log(`Server in esecuzione su http://${host}:${port}`);
});
