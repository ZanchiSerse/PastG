const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

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

// Registrazione utente
app.post('/register', (req, res) => {
    const { nome, residenza, email, password,  telefono } = req.body;

    // Verifica che tutti i campi siano presenti
    if (!nome || !residenza || !email || !password || !telefono) {
        return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }

    // Controllo che la password sia uguale a conferma password
    

    // Controllo che la password abbia almeno 6 caratteri
    if (password.length < 6) {
        return res.status(400).json({ error: "La password deve avere almeno 6 caratteri" });
    }

    // Verifica se l'email o il telefono sono già presenti
    db.get(`SELECT * FROM utenti WHERE email = ? OR telefono = ?`, [email, telefono], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: "Email o telefono già registrati" });
        }

        // Inserimento utente nel database
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

// Login utente
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Verifica che tutti i campi siano presenti
    if (!email || !password) {
        return res.status(400).json({ error: "Email e password sono obbligatorie" });
    }

    // Cerca l'utente nel database
    db.get(`SELECT * FROM utenti WHERE email = ?`, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(400).json({ error: "Utente non trovato" });
        }

        // Verifica che la password sia corretta
        if (user.password !== password) {
            return res.status(400).json({ error: "Password errata" });
        }

        res.json({ message: 'Login effettuato con successo', user: { id: user.id, nome: user.nome, residenza: user.residenza, telefono: user.telefono } });
    });
});

// Chiusura del database al termine del processo
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Chiusura del database.');
        process.exit(0);
    });
});

app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});
