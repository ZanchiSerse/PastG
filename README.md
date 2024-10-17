# PastG
Un gestionale che consente di calcolare ai pasticceri la quantità totale di brioches da produrre per i clienti, i quali mandano l'ordine al pasticcere ed esso elabora il conto totale delle brioches.

### Requisiti Funzionali

1. **Gestione dei profili utente**
   - Creazione di nuovi profili utente.
   - Modifica delle informazioni esistenti nei profili utente.
   - Eliminazione dei profili utente.

2. **Registrazione utenti**
   - Raccolta delle informazioni personali (nome, email, password, ecc.).
   - Verifica della validità delle informazioni inserite (es. email valida).
   - Invio di un'email di conferma per la registrazione.

3. **Gestione del database clienti**
   - Visualizzazione della lista clienti.
   - Aggiunta di nuovi clienti al database.
   - Modifica delle informazioni esistenti sui clienti.
   - Eliminazione di clienti dal database.

4. **Funzionalità di ricerca clienti**
   - Ricerca semplice per nome o ID cliente.
   - Ricerca avanzata basata su criteri multipli (es. data di registrazione, stato del cliente, ecc.).

5. **Calcolo dei prodotti**
   - Calcolo del numero totale di prodotti associati a ciascun cliente.
   - Calcolo del valore totale dei prodotti per cliente.

6. **Database prodotti per cliente**
   - Archiviazione dettagliata dei prodotti associati a ciascun cliente.
   - Visualizzazione della lista di prodotti per cliente, con dettagli su ogni prodotto.

### Requisiti Non Funzionali

1. **Usabilità**
   - Interfaccia utente intuitiva e facile da navigare.
   - Accessibilità per utenti con disabilità.

2. **Performance**
   - Risposte tempestive per le operazioni di ricerca (meno di 2 secondi).
   - Capacità di gestire almeno 10.000 clienti simultaneamente.

3. **Sicurezza**
   - Protezione delle informazioni personali degli utenti tramite crittografia.
   - Autenticazione degli utenti tramite username e password sicure.
   - Protezione contro attacchi comuni (SQL injection, XSS, ecc.).

4. **Scalabilità**
   - Sistema progettato per supportare un incremento del numero di utenti e clienti senza degrado delle performance.

5. **Affidabilità**
   - Alta disponibilità del sistema (99.9% di uptime).
   - Backup regolari del database per garantire la continuità dei dati.

### Requisiti di Dominio

1. **Normative**
   - Conformità alle leggi sulla protezione dei dati (es. GDPR in Europa).
   - Normative locali riguardanti la gestione delle informazioni sui clienti.

2. **Settore**
   - Applicabilità a specifici settori (es. vendite al dettaglio, e-commerce, ecc.).
   - Integrazione con sistemi di gestione esistenti nel settore.

3. **Terminologia**
   - Utilizzo di termini e definizioni riconosciuti nel dominio di applicazione (es. "cliente", "prodotto", "ordine", ecc.).

4. **Stakeholder**
   - Identificazione dei principali attori coinvolti (es. amministratori, utenti finali, manager).
   - Raccolta di requisiti specifici da parte degli stakeholder per personalizzazioni o funzionalità aggiuntive.
