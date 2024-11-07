// Funzione per alternare tra i moduli di registrazione e login
document.getElementById('showRegister').addEventListener('click', function() {
    document.getElementById('register-container').style.display = 'block';
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('message').innerText = ''; // Resetta eventuali messaggi
});

document.getElementById('showLogin').addEventListener('click', function() {
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('message').innerText = ''; // Resetta eventuali messaggi
});

// Funzione per la registrazione
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previeni il comportamento predefinito del form

    const nome = document.getElementById('nome').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const residenza = document.getElementById('residenza').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Controllo se tutti i campi sono riempiti
    if (!nome || !telefono || !residenza || !email || !password) {
        document.getElementById('message').innerText = 'Tutti i campi sono obbligatori';
        return;
    }

    console.log('Inviando dati di registrazione:', { nome, telefono, residenza, email, password });

    // Invio dei dati al server con una richiesta POST
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            nome, 
            telefono, 
            residenza, 
            email, 
            password 
        })
    })
    .then(response => {
        console.log('Risposta dal server:', response);
        if (!response.ok) {
            return response.json().then(err => {
                console.error('Errore nella risposta:', err);
                throw new Error(err.error);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Dati ricevuti dal server:', data);
        if (data.error) {
            document.getElementById('message').innerText = data.error;
        } else {
            localStorage.setItem('user', JSON.stringify({ nome, email }));
            window.location.href = 'sars.html'; // Reindirizzamento alla pagina successiva
        }
    })
    .catch(error => {
        console.error('Errore nella richiesta:', error);
        document.getElementById('message').innerText = 'Errore durante la registrazione, riprova più tardi.';
    });
});

// Funzione per il login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Controllo se i campi di login sono riempiti
    if (!email || !password) {
        document.getElementById('message').innerText = 'Tutti i campi sono obbligatori';
        return;
    }

    console.log('Inviando dati di login:', { email, password });

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        console.log('Risposta dal server per il login:', response);
        if (!response.ok) {
            return response.json().then(err => {
                console.error('Errore nella risposta:', err);
                throw new Error(err.error);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Dati ricevuti dal server per il login:', data);
        if (data.error) {
            document.getElementById('message').innerText = data.error;
        } else {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'sars.html'; // Reindirizzamento alla pagina successiva
        }
    })
    .catch(error => {
        console.error('Errore nella richiesta di login:', error);
        document.getElementById('message').innerText = 'Errore durante il login, riprova più tardi.';
    });
});

// Mostra il login di default all'apertura della pagina
window.onload = function() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('message').innerText = ''; // Resetta eventuali messaggi
};
