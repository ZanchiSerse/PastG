// dbmock.js - Mock database implementation using in-memory JSON data

// Mock data storage
let utenti = [
  {
    id: 1,
    nome: 'Admin',
    residenza: 'Sede Centrale',
    email: 'admin@example.com',
    password: 'admin123',
    telefono: '1234567890',
    role: 'admin'
  },
  {
    id: 2,
    nome: 'Utente',
    residenza: 'Città',
    email: 'user@example.com',
    password: 'user123',
    telefono: '0987654321',
    role: 'user'
  }
];

let clienti = [
  { idclienti: 1, nomecliente: 'Cliente A S.p.A.' },
  { idclienti: 2, nomecliente: 'Cliente B S.r.l.' },
  { idclienti: 3, nomecliente: 'Cliente C Group' }
];

let ordini = [
  {
    id: 1,
    user_id: 2,
    cliente_id: 1,
    descrizione: 'Ordine di test',
    stato: 'pending',
    data_creazione: '2025-03-20T10:00:00.000Z'
  },
  {
    id: 2,
    user_id: 1, 
    cliente_id: 2,
    descrizione: 'Ordine admin di esempio',
    stato: 'completed',
    data_creazione: '2025-03-19T14:30:00.000Z'
  }
];

// ID counters for new records
let utenteIdCounter = 3;
let clienteIdCounter = 4;
let ordineIdCounter = 3;

// Database mock operations
const dbMockOperations = {
  // User operations
  getUserById: (id) => {
    const user = utenti.find(u => u.id === parseInt(id)) || null;
    return Promise.resolve(user);
  },

  getUserByEmail: (email) => {
    const user = utenti.find(u => u.email === email) || null;
    return Promise.resolve(user);
  },

  createUser: ({ nome, residenza, email, password, telefono, role = 'user' }) => {
    // Check if email already exists
    const existingEmail = utenti.find(u => u.email === email);
    if (existingEmail) {
      return Promise.reject(new Error('Email già in uso'));
    }
    
    // Check if phone number already exists
    const existingPhone = utenti.find(u => u.telefono === telefono);
    if (existingPhone) {
      return Promise.reject(new Error('Numero di telefono già in uso'));
    }
    
    const newUser = {
      id: utenteIdCounter++,
      nome,
      residenza,
      email,
      password,
      telefono,
      role
    };
    
    utenti.push(newUser);
    return Promise.resolve(newUser.id);
  },

  updateUser: (id, { nome, residenza, email, password, telefono, role }) => {
    const index = utenti.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      return Promise.resolve(0);
    }
    
    // Check if new email already exists (not own email)
    if (email && email !== utenti[index].email) {
      const existingEmail = utenti.find(u => u.email === email);
      if (existingEmail) {
        return Promise.reject(new Error('Email già in uso'));
      }
    }
    
    // Check if new phone already exists (not own phone)
    if (telefono && telefono !== utenti[index].telefono) {
      const existingPhone = utenti.find(u => u.telefono === telefono);
      if (existingPhone) {
        return Promise.reject(new Error('Numero di telefono già in uso'));
      }
    }
    
    utenti[index] = {
      ...utenti[index],
      nome: nome || utenti[index].nome,
      residenza: residenza || utenti[index].residenza,
      email: email || utenti[index].email,
      password: password || utenti[index].password,
      telefono: telefono || utenti[index].telefono,
      role: role || utenti[index].role
    };
    
    return Promise.resolve(1);
  },

  deleteUser: (id) => {
    const initialLength = utenti.length;
    utenti = utenti.filter(u => u.id !== parseInt(id));
    const changes = initialLength - utenti.length;
    return Promise.resolve(changes);
  },

  getAllUsers: () => {
    return Promise.resolve([...utenti]);
  },

  // Client operations
  getClientById: (id) => {
    const client = clienti.find(c => c.idclienti === parseInt(id)) || null;
    return Promise.resolve(client);
  },

  getAllClients: () => {
    return Promise.resolve([...clienti].sort((a, b) => a.nomecliente.localeCompare(b.nomecliente)));
  },

  createClient: ({ nomecliente }) => {
    // Check if client name already exists
    const existingClient = clienti.find(c => c.nomecliente === nomecliente);
    if (existingClient) {
      return Promise.reject(new Error('Cliente già esistente'));
    }
    
    const newClient = {
      idclienti: clienteIdCounter++,
      nomecliente
    };
    
    clienti.push(newClient);
    return Promise.resolve(newClient.idclienti);
  },

  // Order operations
  getOrderById: (id) => {
    const order = ordini.find(o => o.id === parseInt(id)) || null;
    return Promise.resolve(order);
  },

  getOrdersByUserId: (userId) => {
    const userOrders = ordini
      .filter(o => o.user_id === parseInt(userId))
      .map(o => {
        const client = clienti.find(c => c.idclienti === o.cliente_id);
        return {
          ...o,
          nomecliente: client ? client.nomecliente : 'Cliente sconosciuto'
        };
      })
      .sort((a, b) => new Date(b.data_creazione) - new Date(a.data_creazione));
    
    return Promise.resolve(userOrders);
  },

  getAllOrders: () => {
    const allOrders = ordini.map(o => {
      const user = utenti.find(u => u.id === o.user_id);
      const client = clienti.find(c => c.idclienti === o.cliente_id);
      
      return {
        ...o,
        nome_utente: user ? user.nome : 'Utente sconosciuto',
        nomecliente: client ? client.nomecliente : 'Cliente sconosciuto'
      };
    })
    .sort((a, b) => new Date(b.data_creazione) - new Date(a.data_creazione));
    
    return Promise.resolve(allOrders);
  },

  createOrder: ({ user_id, cliente_id, descrizione, stato = 'pending' }) => {
    const now = new Date();
    
    const newOrder = {
      id: ordineIdCounter++,
      user_id: parseInt(user_id),
      cliente_id: parseInt(cliente_id),
      descrizione,
      stato,
      data_creazione: now.toISOString()
    };
    
    ordini.push(newOrder);
    return Promise.resolve(newOrder.id);
  },

  updateOrderStatus: (id, stato) => {
    const order = ordini.find(o => o.id === parseInt(id));
    if (!order) {
      return Promise.resolve(0);
    }
    
    order.stato = stato;
    return Promise.resolve(1);
  },

  deleteOrder: (id) => {
    const initialLength = ordini.length;
    ordini = ordini.filter(o => o.id !== parseInt(id));
    const changes = initialLength - ordini.length;
    return Promise.resolve(changes);
  },

  searchOrders: ({ userId = null, clienteId = null, stato = null, searchText = null, isAdmin = false }) => {
    let filteredOrders = [...ordini];
    
    // Filter by user if not admin
    if (!isAdmin && userId) {
      filteredOrders = filteredOrders.filter(o => o.user_id === parseInt(userId));
    }
    
    // Apply other filters if provided
    if (clienteId) {
      filteredOrders = filteredOrders.filter(o => o.cliente_id === parseInt(clienteId));
    }
    
    if (stato) {
      filteredOrders = filteredOrders.filter(o => o.stato === stato);
    }
    
    if (searchText) {
      filteredOrders = filteredOrders.filter(o => 
        o.descrizione.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Add client and user info
    const results = filteredOrders.map(o => {
      const client = clienti.find(c => c.idclienti === o.cliente_id);
      
      // Include user info only if admin view
      if (isAdmin) {
        const user = utenti.find(u => u.id === o.user_id);
        return {
          ...o,
          nome_utente: user ? user.nome : 'Utente sconosciuto',
          nomecliente: client ? client.nomecliente : 'Cliente sconosciuto'
        };
      }
      
      return {
        ...o,
        nomecliente: client ? client.nomecliente : 'Cliente sconosciuto'
      };
    })
    .sort((a, b) => new Date(b.data_creazione) - new Date(a.data_creazione));
    
    return Promise.resolve(results);
  },

  getDetailedOrderById: (id) => {
    const order = ordini.find(o => o.id === parseInt(id));
    
    if (!order) {
      return Promise.resolve(null);
    }
    
    const user = utenti.find(u => u.id === order.user_id);
    const client = clienti.find(c => c.idclienti === order.cliente_id);
    
    const detailedOrder = {
      ...order,
      nome: user ? user.nome : 'Utente sconosciuto',
      email: user ? user.email : 'email@sconosciuta.com',
      nomecliente: client ? client.nomecliente : 'Cliente sconosciuto'
    };
    
    return Promise.resolve(detailedOrder);
  },

  // Reset function for testing
  reset: () => {
    utenti = [
      {
        id: 1,
        nome: 'Admin',
        residenza: 'Sede Centrale',
        email: 'admin@example.com',
        password: 'admin123',
        telefono: '1234567890',
        role: 'admin'
      },
      {
        id: 2,
        nome: 'Utente',
        residenza: 'Città',
        email: 'user@example.com',
        password: 'user123',
        telefono: '0987654321',
        role: 'user'
      }
    ];
    
    clienti = [
      { idclienti: 1, nomecliente: 'Cliente A S.p.A.' },
      { idclienti: 2, nomecliente: 'Cliente B S.r.l.' },
      { idclienti: 3, nomecliente: 'Cliente C Group' }
    ];
    
    ordini = [
      {
        id: 1,
        user_id: 2,
        cliente_id: 1,
        descrizione: 'Ordine di test',
        stato: 'pending',
        data_creazione: '2025-03-20T10:00:00.000Z'
      },
      {
        id: 2,
        user_id: 1, 
        cliente_id: 2,
        descrizione: 'Ordine admin di esempio',
        stato: 'completed',
        data_creazione: '2025-03-19T14:30:00.000Z'
      }
    ];
    
    utenteIdCounter = 3;
    clienteIdCounter = 4;
    ordineIdCounter = 3;
    
    return Promise.resolve(true);
  }
};

module.exports = dbMockOperations;