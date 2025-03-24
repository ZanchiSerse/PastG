# 🥐 PastG: Gestionale per Pasticcerie 🍰

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/ZanchiSerse/PastG/actions)  <!-- GitHub Actions build status (if you set it up) -->
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

PastG è un'applicazione web 💻 creata appositamente per pasticcerie 🏭, fornai 🥖 e laboratori artigianali 🍩. Ti aiuta a gestire gli ordini dei clienti 🛍️ e a calcolare in un attimo quante brioches 🥐 e altri dolci 🍪 devi preparare. È costruita con Python, Flask e può essere eseguita facilmente con Docker e Docker Compose.

## A chi è rivolto? (Target) 🎯

*   Pasticcerie 🎂🍰
*   Artigiani del settore dolciario 🍩🍪
*   Fornai 🥖🍞
*   Piccoli laboratori di produzione 🏭

## Che problema risolve? 🤔

Senza PastG, calcolare quanti prodotti fare è un lavoro manuale ✍️, lungo ⏳ e pieno di possibili errori ❌. PastG fa tutto in automatico 🤖: più efficienza ✅, meno sbagli 💯 e più tempo per te 💪!

*   **Meno errori:** Addio ai calcoli sbagliati! 🧮❌➡️🤖✅
*   **Più tempo:** Calcoli automatici, più tempo per creare dolci! ⏳➡️🍰
*   **Ordini sotto controllo:** Tutto in un unico posto, facile da gestire! 📝➡️💻
*   **Niente sprechi:** Produci solo quello che serve! 🗑️➡️🌱

## Concorrenti (Competitors) ⚔️

*   Danea Easyfatt (software gestionale *generale*, non solo per pasticcerie)
*   *Altri software specifici per pasticcerie/panifici* (fai una ricerca per completare questa sezione!)
*   Fogli Excel, quaderni... (PastG è molto meglio! 😉) 📝❌➡️💻✅

## Requisiti (Requirements) 📜

### Requisiti di Dominio (Cosa deve fare il sistema nel suo contesto) 🌍

*   **Gestione Ordini:** Gestire gli ordini dei clienti (quantità e tipo di dolci). 📝
*   **Calcolo Produzione:** Calcolare quanti dolci fare in totale. ➕
*   **Gestione Clienti:** Salvare e gestire i dati dei clienti. 👤
*   **Catalogo Prodotti:** Avere una lista dei dolci disponibili. 🍩🍪

### Requisiti Funzionali (Cosa deve fare il software) ⚙️

1.  **Gestione Utenti (User Management):** 👤
    *   1.1 **Registrazione Utente:** I pasticceri 👨‍🍳 si registrano (nome, email, password, ecc.). 📝
    *   1.2 **Login:** Accesso con email e password. 🔑
    *   1.3 **Profilo:** Modificare le proprie informazioni. ✏️

2.  **Gestione Clienti (Customer Management):** 👥
    *   2.1 **Nuovo Cliente:** Aggiungere un cliente (nome, indirizzo, telefono...). ➕👤
    *   2.2 **Lista Clienti:** Vedere tutti i clienti. 👁️👥
    *   2.3 **Modifica Cliente:** Cambiare i dati di un cliente. ✏️👤
    *   2.4 **Elimina Cliente:** Cancellare un cliente (con conferma!). 🗑️👤
    *   2.5 **Cerca Cliente:** Trovare un cliente per nome. 🔍👤

3.  **Gestione Prodotti (Product Management):** 🥐🍩🍪
    *   3.1 **Nuovo Prodotto:** Aggiungere un dolce al catalogo. ➕🥐
    *   3.2 **Lista Prodotti:** Vedere tutti i dolci. 👁️🥐🍩🍪
    *   3.3 **Modifica Prodotto:** Cambiare i dati di un dolce. ✏️🥐
    *   3.4 **Elimina Prodotto:** Cancellare un dolce. 🗑️🥐

4.  **Gestione Ordini (Order Management):** 📝📦
    *   4.1 **Nuovo Ordine:** Creare un ordine per un cliente (scegli i dolci e le quantità). ➕📝
    *   4.2 **Lista Ordini:** Vedere tutti gli ordini. 👁️📝
    *   4.3 **Modifica Ordine:** Cambiare un ordine. ✏️📝
    *   4.4 **Elimina Ordine:** Cancellare un ordine (con conferma!). 🗑️📝
    *   4.5 **Calcolo Totale Ordine:** Il software calcola in automatico il totale. 🧮📝
    *  4.6 **Calcolo Totale Produzione:** Il software calcola il totale di prodotti da produrre sommando tutti gli ordini. ➕📝

5.  **Reportistica (Reporting):** 📊📈
    *   5.1 Vedere quanti dolci di ogni tipo fare

### Requisiti Non Funzionali (Come deve funzionare il software) ✨

1.  **Usabilità (Usability):** 👍
    *   Facile da usare e da capire. 👌
    *   Tutto deve essere logico e veloce. ⚡➡️
    *   Pochi passaggi per fare le cose.

2.  **Prestazioni (Performance):** 🚀
    *   Veloce nel caricare le pagine e fare i calcoli.

3.  **Scalabilità (Scalability):** 📈
    *   Deve poter gestire un aumento di utenti, clienti, prodotti e ordini in futuro.

4.  **Sicurezza (Security):** 🔒
    *   Password salvate in modo sicuro.
    *   Protezione dei dati dei clienti.

5.  **Affidabilità (Reliability):** ✅
    *   Deve funzionare bene, senza errori.

6.  **Manutenibilità (Maintainability):** 🛠️
    *   Codice ben scritto, modulare.
    *   Codice ben documentato.

7. **Portabilità (Portability):** 🌍
    *  Il sistema dovrebbe essere portabile.

## Tecnologie Utilizzate (Tech Stack) 💻

*   **Linguaggio:** Python 🐍
*   **Framework:** Flask 🌶️
*   **Database:** SQLite (integrato in Python)
*   **Template Engine:** Jinja2 (integrato in Flask)
*   **Frontend:** HTML, CSS, Bootstrap (per un layout responsivo)
*   **Containerizzazione:** Docker 🐳, Docker Compose

## Installazione con Docker (Installation with Docker) 🐳

Questa è la *modalità di installazione consigliata* per la massima semplicità e portabilità.

### Prerequisiti

Prima di iniziare, assicurati di avere quanto segue:

*   Un computer con sistema operativo Windows, Linux o macOS.
*   Docker e Docker Compose installati.  Segui le istruzioni ufficiali per il tuo sistema operativo:
    *   **Windows:** [Docker Desktop per Windows](https://www.docker.com/products/docker-desktop/)
    *   **macOS:** [Docker Desktop per Mac](https://www.docker.com/products/docker-desktop/)
    *   **Linux (Ubuntu):**
        ```bash
        sudo apt update
        sudo apt install docker.io docker-compose
        sudo systemctl enable --now docker
        sudo usermod -aG docker $USER  # Aggiungi l'utente al gruppo docker
        # Disconnettiti e riconnettiti, o riavvia, per applicare le modifiche.
        ```
*   Un file `.env` (vedi la sezione "Configurazione del File .env" sotto).

### Installazione di Docker (Istruzioni Dettagliate - Ridondanti, ma Utili)

#### Windows

1.  **Scarica Docker Desktop:** Visita la pagina di [Docker Desktop per Windows](https://www.docker.com/products/docker-desktop/) e scarica l'installer.
2.  **Installa Docker:** Esegui l'installer scaricato e segui le istruzioni. Docker dovrebbe avviarsi automaticamente.
3.  **Verifica l'Installazione:** Apri il Prompt dei comandi ed esegui: `docker --version`. Dovresti vedere la versione di Docker.

#### macOS

1.  **Scarica Docker Desktop:** Visita la pagina di [Docker Desktop per Mac](https://www.docker.com/products/docker-desktop/) e scarica l'installer.
2.  **Installa Docker:** Apri il file scaricato e trascina l'icona di Docker nella cartella Applicazioni. Avvia Docker dalle Applicazioni.
3.  **Verifica l'Installazione:** Apri il Terminale ed esegui: `docker --version`.

#### Linux (Ubuntu)

1.  **Aggiorna il Database dei Pacchetti:** `sudo apt update`
2.  **Installa Docker:** `sudo apt install docker.io`
3.  **Abilita e Avvia Docker:** `sudo systemctl enable --now docker`
4.  **Verifica l'Installazione:** `docker --version`
5.  **Aggiungi l'utente al gruppo docker:** `sudo usermod -aG docker $USER` (disconnettiti/riconnettiti o riavvia).

### Installazione di Docker Compose

*   **Windows & macOS:** Docker Compose è incluso in Docker Desktop.
*   **Linux (Ubuntu):**
    ```bash
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    docker-compose --version
    ```

### Configurazione del File .env

1.  **Copia il file di esempio:**  Nella directory principale del progetto (dove c'è `docker-compose.yml`), esegui:
    ```bash
    cp .env.example .env
    ```
2.  **Modifica il file .env:** Apri il file `.env` con un editor di testo e inserisci le tue credenziali per il database (se necessario, in questo caso SQLite non richiede credenziali particolari) e altre variabili d'ambiente.  *Non committare mai il file `.env` su GitHub!*

### Avvio di PastG con Docker

1.  **Clona la Repository (opzionale, ma consigliato):**
    ```bash
    git clone https://github.com/ZanchiSerse/PastG.git
    cd PastG
    ```
    Clonare la repository ti permette di avere il codice sorgente e di modificarlo se necessario.

2.  **Avvia l'Applicazione:**
    ```bash
    docker-compose up --build -d
    ```
    *   `docker-compose up`: Avvia i servizi definiti in `docker-compose.yml`.
    *   `--build`: Ricostruisce le immagini Docker (importante se hai modificato il codice).
    *   `-d`: Avvia i container in background (modalità "detached").

### Verificare che l'app sia in esecuzione

*   **Vedi i log:**
    ```bash
    docker-compose logs -f
    ```
    (`-f` mostra i log in tempo reale).

*   **Accedi all'applicazione:** Apri il tuo browser e vai all'indirizzo `http://localhost:5000` (o l'indirizzo/porta specificati nel `docker-compose.yml`).

### Fermare l'applicazione

```bash
docker-compose down
Use code with caution.
Markdown
Questo comando arresta e rimuove i container, le reti e i volumi. Per rimuovere anche le immagini, usa docker-compose down --rmi all.

Utilizzo (Usage) 📝
Registrazione: Clicca su "Registrati" e crea un nuovo account.

Login: Accedi con le tue credenziali.

Gestione Clienti: Aggiungi, modifica, visualizza ed elimina clienti.

Gestione Prodotti: Aggiungi, modifica, visualizza ed elimina i prodotti (brioches, ecc.).

Gestione Ordini: Crea nuovi ordini, seleziona il cliente e i prodotti, e le relative quantità. Visualizza, modifica ed elimina gli ordini esistenti.

Visualizza Report: Visualizza la quantita totale di prodotti da fare.

Contribuire (Contributing) 🤝
Al momento, il progetto è gestito principalmente da un singolo sviluppatore. Se sei interessato a contribuire, puoi:

Segnalare bug: Apri una "Issue" su GitHub per segnalare problemi o errori. 🐛

Proporre nuove idee: Apri una "Issue" per suggerire nuove funzionalità o miglioramenti. ✨

Fork & Pull Request: Se vuoi contribuire direttamente al codice:

Fai un "fork" del repository.

Crea un nuovo branch per le tue modifiche.

Invia una "Pull Request" quando le tue modifiche sono pronte. 📝

Licenza (License) 📄
Questo progetto è rilasciato sotto licenza MIT - vedi il file LICENSE per i dettagli.

Diagramma UML 📊
