# PastG
Un gestionale che consente di calcolare ai pasticceri la quantità totale di brioches da produrre per i clienti, i quali mandano l'ordine al pasticcere ed esso elabora il conto totale delle brioches.

### Requisiti Funzionali

1. **Gestione del database clienti**
   - Visualizzazione della lista clienti.
   - Aggiunta di nuovi clienti al database.
   - Modifica delle informazioni esistenti sui clienti.
   - Eliminazione di clienti dal database.

2. **Registrazione utenti**
   - Raccolta delle informazioni personali (nome, email, password, ecc.).

3. **Funzionalità di ricerca clienti**
   - Ricerca semplice per nome o ID cliente.
   - Ricerca avanzata basata su criteri multipli (es. data di registrazione, stato del cliente, ecc.).

4. **Calcolo dei prodotti**
   - Calcolo del numero totale di prodotti associati a ciascun cliente.
   - Calcolo del valore totale dei prodotti per cliente.

5. **Database prodotti per cliente**
   - Archiviazione dettagliata dei prodotti associati a ciascun cliente.
   - Visualizzazione della lista di prodotti per cliente.

### Requisiti Non Funzionali

1. **Usabilità**
   - Interfaccia utente intuitiva e facile da navigare.

2. **Performance**
   - Risposte tempestive per le operazioni di ricerca (meno di 2 secondi).
   - Capacità di gestire almeno 10.000 clienti simultaneamente.

3. **Scalabilità**
   - Sistema progettato per supportare un incremento del numero di utenti e clienti senza degrado delle performance.

4. **Affidabilità**
   - Alta disponibilità del sistema (99.9% di uptime).
   - Backup regolari del database per garantire la continuità dei dati.


![Diagramma UML](https://yuml.me/pastg/56d860f0.svg)
