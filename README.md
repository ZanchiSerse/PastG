# 🥐 PastG: Gestionale per Pasticcerie 🍰

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/ZanchiSerse/PastG/actions)  <!-- GitHub Actions build status (if you set it up) -->
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

PastG è un'applicazione web 💻 creata appositamente per pasticcerie 🏭, fornai 🥖 e laboratori artigianali 🍩. Ti aiuta a gestire gli ordini dei clienti 🛍️ e a calcolare in un attimo quante brioches 🥐 e altri dolci 🍪 devi preparare. È costruita con Hbs, Javascript e può essere eseguita facilmente con Docker e Docker Compose.

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

*   **Linguaggio:** Javascript 
*   **Database:** SQLite (integrato in Js)
*   **Frontend:** Hbs, CSS, Bootstrap (per un layout responsive)
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
```

Questo comando arresta e rimuove i container, le reti e i volumi. Per rimuovere anche le immagini, usa docker-compose down --rmi all.

## Credenziali di Accesso (Demo) 🔑

Per provare rapidamente PastG, puoi utilizzare le seguenti credenziali di esempio:

**Utente Amministratore (Admin):**

*   **Email:** `admin@example.com`
*   **Password:** `admin123`

**Utente Cliente (qualsiasi email):**
Per provare ad aggiungere un nuovo cliente puoi utilizzare una email a tuo piacimento, questo ti permette di testare meglio l applicazione.

**Importante:**

*   Queste credenziali sono solo per scopi dimostrativi e di test.
*   In un ambiente di produzione, *non utilizzare mai* password predefinite o facilmente indovinabili.
*   È consigliabile creare nuovi utenti con password robuste per un utilizzo reale.
*   Non condividere mai le tue credenziali reali con nessuno.

## Utilizzo 📝

Ecco come usare PastG:

1.  **Registrazione/Login:**
    *   Se è la prima volta, clicca su "Registrati" 📝 nella pagina principale e crea un nuovo account.
    *   Se hai già un account, clicca su "Login" 🔑 e inserisci email e password o fai login con Google.

2.  **Gestione Clienti (👤):**
    *   **Visualizza/Modifica/Elimina:** Nella lista clienti, puoi vedere i dettagli, modificare le informazioni.

3.  **Gestione Prodotti (🥐🍩🍪):**
    *   **Aggiungi un prodotto:** Vai alla sezione "Prodotti" e clicca su "Aggiungi Prodotto". Inserisci nome e descrizione.
    *    **Visualizza/Modifica/Elimina:** Nella lista prodotti, puoi vedere i dettagli, modificare le informazioni o eliminare un prodotto.

4.  **Gestione Ordini (📝📦):**
    *   **Crea un nuovo ordine:** Vai alla sezione "Ordini" e clicca su "Nuovo Ordine".
        *   Seleziona il cliente dall'elenco a discesa.
        *   Aggiungi i prodotti e le quantità desiderate.
        *   Clicca su "Salva Ordine".
    *   **Visualizza/Modifica/Elimina:** Nella lista ordini, puoi vedere i dettagli di un ordine, modificarlo (aggiungere/rimuovere prodotti, cambiare quantità) o eliminarlo.

**Suggerimenti:**

*   L'interfaccia è intuitiva e progettata per essere facile da usare. 👍
*   Tutti i dati inseriti vengono salvati automaticamente. ✅
*   Usa il pulsante "Logout" per uscire dall'applicazione in modo sicuro. 🚪

## Contribuire (Contributing) 🤝

PastG è un progetto open-source e il tuo contributo è benvenuto! Ecco come puoi aiutare:

1.  **Segnalare Bug (🐛):**
    *   Se trovi un errore o un comportamento inaspettato, apri una *Issue* su GitHub.
    *   Sii il più dettagliato possibile:
        *   Descrivi cosa stavi facendo quando si è verificato il problema.
        *   Includi i passaggi per riprodurre il bug.
        *   Specifica il tuo sistema operativo, browser e versione di Python (se rilevante).
        *   Allega screenshot o messaggi di errore, se possibile.

2.  **Proporre Nuove Funzionalità (✨):**
    *   Hai un'idea per migliorare PastG? Apri una *Issue* su GitHub e descrivi la tua proposta.
    *   Spiega chiaramente i vantaggi della nuova funzionalità.
    *   Se possibile, fornisci esempi di come dovrebbe funzionare.

3.  **Contribuire al Codice (📝 - Fork & Pull Request):**

    Questo è il modo più diretto per contribuire al progetto.  Ecco i passaggi:

    *   **Fork:** Clicca sul pulsante "Fork" in alto a destra nella pagina del repository GitHub di PastG ([https://github.com/ZanchiSerse/PastG](https://github.com/ZanchiSerse/PastG)).  Questo creerà una copia del progetto nel tuo account GitHub.
    *   **Clone:** Clona il tuo fork sul tuo computer:
        ```bash
        git clone https://github.com/TUO_USERNAME/PastG.git  # Sostituisci TUO_USERNAME
        cd PastG
        ```
    *   **Crea un Branch:** Crea un nuovo branch per le tue modifiche (usa un nome descrittivo, es. `fix-bug-registrazione` o `feature-nuovo-report`):
        ```bash
        git checkout -b nome-del-tuo-branch
        ```
    *   **Apporta le Modifiche:** Modifica il codice, aggiungi nuove funzionalità, correggi bug, ecc.
    *   **Test:** Assicurati che le tue modifiche funzionino correttamente e non introducano nuovi problemi. *Aggiungere test unitari è molto apprezzato!*
    *   **Commit:**  Salva le tue modifiche con commit significativi:
        ```bash
        git add .
        git commit -m "Descrivi brevemente le tue modifiche"
        ```
    *   **Push:**  Invia le modifiche al tuo fork su GitHub:
        ```bash
        git push origin nome-del-tuo-branch
        ```
    *   **Pull Request:**  Vai alla pagina del tuo fork su GitHub.  Dovresti vedere un pulsante per creare una "Pull Request".  Cliccalo, compila il modulo (descrivendo le tue modifiche) e invia la richiesta.

4.  **Migliorare la Documentazione (📖):**

     Anche migliorare la documentazione (come questo README!) è un contributo prezioso.  Puoi seguire lo stesso processo di Fork & Pull Request per apportare modifiche.

**Linee Guida:**

*   Segui lo stile del codice esistente.
*   Scrivi commit chiari e concisi.
*   Sii rispettoso e collaborativo nelle discussioni.
*   Se hai dubbi, chiedi!

Grazie per il tuo interesse a contribuire a PastG! 🙌
## Diagramma UML 📊
![alt text](https://yuml.me/pastg/PASTg.svg)
