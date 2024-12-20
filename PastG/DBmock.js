class DBMock {
    constructor() {
        // Tabelle simulate in memoria
        this.utenti = [
            { id: 1, nome: 'Mario Rossi', residenza: 'Roma', email: 'mario.rossi@example.com', password: 'hashedpassword123', telefono: '1234567890' },
            { id: 2, nome: 'Anna Bianchi', residenza: 'Milano', email: 'anna.bianchi@example.com', password: 'hashedpassword456', telefono: '0987654321' },
        ];
        this.clienti = [
            { idclienti: 1, nomecliente: 'Cliente A' },
            { idclienti: 2, nomecliente: 'Cliente B' },
        ];

        this.nextUserId = this.utenti.length ? this.utenti[this.utenti.length - 1].id + 1 : 1;
        this.nextClientId = this.clienti.length ? this.clienti[this.clienti.length - 1].idclienti + 1 : 1;
    }

    // Metodi per la tabella utenti
    getAllUsers() {
        return this.utenti.map(user => ({ ...user, password: undefined })); // Escludi la password
    }

    getUserById(id) {
        return this.utenti.find(user => user.id === id) || null;
    }

    getUserByEmail(email) {
        return this.utenti.find(user => user.email === email) || null;
    }

    createUser({ nome, residenza, email, password, telefono }) {
        if (!nome || !residenza || !email || !password || !telefono) {
            throw new Error('Tutti i campi sono obbligatori: nome, residenza, email, password, telefono.');
        }
        const newUser = {
            id: this.nextUserId++,
            nome,
            residenza,
            email,
            password, // In una simulazione reale, potresti usare bcrypt per hash
            telefono,
        };
        this.utenti.push(newUser);
        return newUser;
    }

    updateUser(id, updates) {
        const user = this.utenti.find(user => user.id === id);
        if (!user) return null;

        Object.assign(user, updates);
        return user;
    }

    deleteUser(id) {
        const index = this.utenti.findIndex(user => user.id === id);
        if (index === -1) return false;

        this.utenti.splice(index, 1);
        return true;
    }

    // Metodi per la tabella clienti
    getAllClients(order = 'ASC') {
        const sortedClients = [...this.clienti].sort((a, b) => {
            return order === 'DESC'
                ? b.nomecliente.localeCompare(a.nomecliente)
                : a.nomecliente.localeCompare(b.nomecliente);
        });
        return sortedClients;
    }

    createClient({ nomecliente }) {
        if (!nomecliente) {
            throw new Error('Il nome del cliente è obbligatorio.');
        }
        const newClient = {
            idclienti: this.nextClientId++,
            nomecliente,
        };
        this.clienti.push(newClient);
        return newClient;
    }

    deleteClient(idclienti) {
        const index = this.clienti.findIndex(client => client.idclienti === idclienti);
        if (index === -1) return false;

        this.clienti.splice(index, 1);
        return true;
    }
}

module.exports = DBMock;
