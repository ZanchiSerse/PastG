// db.js - Real SQLite implementation
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize main database
const db = new sqlite3.Database(path.resolve(__dirname, './database.db'), (err) => {
  if (err) {
    console.error('Errore nella connessione al database principale:', err.message);
    process.exit(1);
  }
  console.log('Connesso al database SQLite principale.');
});

// Initialize database schema
db.serialize(() => {
  // Create users table if not exists
  db.run(`
    CREATE TABLE IF NOT EXISTS utenti (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      residenza TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      telefono TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'user' NOT NULL
    )
  `);
  
  // Create clients table if not exists
  db.run(`
    CREATE TABLE IF NOT EXISTS clienti (
      idclienti INTEGER PRIMARY KEY AUTOINCREMENT,
      nomecliente TEXT NOT NULL UNIQUE
    )
  `);
  
  // Create orders table if not exists
  db.run(`
    CREATE TABLE IF NOT EXISTS ordini (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      cliente_id INTEGER NOT NULL,
      descrizione TEXT NOT NULL,
      stato TEXT DEFAULT 'pending' NOT NULL,
      data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES utenti (id),
      FOREIGN KEY (cliente_id) REFERENCES clienti (idclienti)
    )
  `);
});

// Database operations object
const dbOperations = {
  // User operations
  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM utenti WHERE id = ?', [id], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
  },

  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM utenti WHERE email = ?', [email], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
  },

  createUser: ({ nome, residenza, email, password, telefono, role = 'user' }) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO utenti (nome, residenza, email, password, telefono, role) VALUES (?, ?, ?, ?, ?, ?)',
        [nome, residenza, email, password, telefono, role],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  updateUser: (id, { nome, residenza, email, password, telefono, role }) => {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE utenti SET nome = ?, residenza = ?, email = ?, password = ?, telefono = ?, role = ? WHERE id = ?',
        [nome, residenza, email, password, telefono, role, id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  },

  deleteUser: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM utenti WHERE id = ?', [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM utenti', [], (err, users) => {
        if (err) reject(err);
        else resolve(users);
      });
    });
  },

  // Client operations
  getClientById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM clienti WHERE idclienti = ?', [id], (err, client) => {
        if (err) reject(err);
        else resolve(client);
      });
    });
  },

  getAllClients: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM clienti ORDER BY nomecliente ASC', [], (err, clients) => {
        if (err) reject(err);
        else resolve(clients);
      });
    });
  },

  createClient: ({ nomecliente }) => {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO clienti (nomecliente) VALUES (?)', [nomecliente], function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  },

  // Order operations
  getOrderById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM ordini WHERE id = ?', [id], (err, order) => {
        if (err) reject(err);
        else resolve(order);
      });
    });
  },

  getOrdersByUserId: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, c.nomecliente 
        FROM ordini o
        JOIN clienti c ON o.cliente_id = c.idclienti
        WHERE o.user_id = ?
        ORDER BY o.data_creazione DESC
      `, [userId], (err, orders) => {
        if (err) reject(err);
        else resolve(orders);
      });
    });
  },

  getAllOrders: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT o.*, u.nome as nome_utente, c.nomecliente
        FROM ordini o
        JOIN utenti u ON o.user_id = u.id
        JOIN clienti c ON o.cliente_id = c.idclienti
        ORDER BY o.data_creazione DESC
      `, [], (err, orders) => {
        if (err) reject(err);
        else resolve(orders);
      });
    });
  },

  createOrder: ({ user_id, cliente_id, descrizione, stato = 'pending' }) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO ordini (user_id, cliente_id, descrizione, stato) VALUES (?, ?, ?, ?)',
        [user_id, cliente_id, descrizione, stato],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  updateOrderStatus: (id, stato) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE ordini SET stato = ? WHERE id = ?', [stato, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  deleteOrder: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM ordini WHERE id = ?', [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  },

  searchOrders: ({ userId = null, clienteId = null, stato = null, searchText = null, isAdmin = false }) => {
    return new Promise((resolve, reject) => {
      let query;
      let params = [];
      
      if (isAdmin) {
        query = `
          SELECT o.*, u.nome as nome_utente, c.nomecliente
          FROM ordini o
          JOIN utenti u ON o.user_id = u.id
          JOIN clienti c ON o.cliente_id = c.idclienti
          WHERE 1=1
        `;
      } else {
        query = `
          SELECT o.*, c.nomecliente 
          FROM ordini o
          JOIN clienti c ON o.cliente_id = c.idclienti
          WHERE o.user_id = ?
        `;
        params.push(userId);
      }
      
      if (clienteId) {
        query += ` AND o.cliente_id = ?`;
        params.push(clienteId);
      }
      
      if (stato) {
        query += ` AND o.stato = ?`;
        params.push(stato);
      }
      
      if (searchText) {
        query += ` AND o.descrizione LIKE ?`;
        params.push(`%${searchText}%`);
      }
      
      query += ` ORDER BY o.data_creazione DESC`;
      
      db.all(query, params, (err, orders) => {
        if (err) reject(err);
        else resolve(orders);
      });
    });
  },

  getDetailedOrderById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT o.*, u.nome, u.email, c.nomecliente 
        FROM ordini o
        JOIN utenti u ON o.user_id = u.id
        JOIN clienti c ON o.cliente_id = c.idclienti
        WHERE o.id = ?
      `, [id], (err, order) => {
        if (err) reject(err);
        else resolve(order);
      });
    });
  }
};

// Close database connections properly during shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Errore nella chiusura del database:', err.message);
    } else {
      console.log('Connessione al database chiusa.');
    }
    process.exit(0);
  });
});

module.exports = dbOperations;