FROM node:18

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di configurazione e installa le dipendenze
COPY package*.json ./
RUN npm install

# Copia il resto dei file dell'applicazione
COPY . .

# Espone la porta su cui gira l'applicazione (esempio: 3000)
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["node", "server.js"]