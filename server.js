require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const port = 3000;
const cors = require('cors');
const hbs = require('express-handlebars');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const http = require('http');
const socketIo = require('socket.io');

// Use environment variable to determine which DB to use
const useMockData = process.env.USE_MOCK_DATA === 'true';
console.log(`Using ${useMockData ? 'mock' : 'real'} database`);

// Import database module based on environment setting
const db = useMockData ? require('./dbmock') : require('./db');

// Initialize Brevo API client
const defaultBrevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultBrevoClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY; 
const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

// Setup Handlebars
app.engine('hbs', hbs.engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        eq: function(a, b) {
            return a === b;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// SESSION SETUP - CRITICAL: Must come before passport
const sessionConfig = {
    secret: 'tuaChiaveSegreta',
    resave: false,            
    saveUninitialized: false, 
    cookie: {
        secure: false,       // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
};

// Create session middleware
const sessionMiddleware = session(sessionConfig);
app.use(sessionMiddleware);

// Debug middleware - keep this to monitor session state
app.use((req, res, next) => {
    console.log('Session ID:', req.session?.id || 'No session');
    next();
});

// Initialize Passport AFTER session is set up
app.use(passport.initialize());
app.use(passport.session());

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - password
 *         - telefono
 *         - residenza
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         nome:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password
 *         telefono:
 *           type: string
 *           description: User's phone number
 *         residenza:
 *           type: string
 *           description: User's residence address
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User's role
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Order ID
 *         user_id:
 *           type: integer
 *           description: User ID who created the order
 *         cliente_id:
 *           type: integer
 *           description: Client ID associated with the order
 *         descrizione:
 *           type: string
 *           description: Order description
 *         stato:
 *           type: string
 *           enum: [pending, completed, refused]
 *           description: Order status
 *         data_creazione:
 *           type: string
 *           format: date-time
 *           description: Order creation date
 *     Client:
 *       type: object
 *       properties:
 *         idclienti:
 *           type: integer
 *           description: Client ID
 *         nomecliente:
 *           type: string
 *           description: Client name
 *   securitySchemes:
 *     sessionAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */

// PASSPORT CONFIGURATION
// Fixed serialization methods to properly handle sessions
passport.serializeUser((user, done) => {
    // Just store the user ID in the session
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.getUserById(id)
        .then(user => {
            if (!user) {
                return done(null, false);
            }
            done(null, user);
        })
        .catch(err => done(err, null));
});

// Google authentication strategy
passport.use(new GoogleStrategy({
    clientID: '904869527919-j02ntogp6nvnnol35vl1j40v9viec9i3.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    // Check if user exists in database
    db.getUserByEmail(profile.emails[0].value)
        .then(user => {
            if (user) {
                // User exists, return user
                return done(null, user);
            } 
            
            // Create new user
            const newUser = {
                nome: profile.displayName,
                email: profile.emails[0].value,
                password: 'google-auth', 
                telefono: `google-${Date.now()}`,
                residenza: 'Non specificato',
                role: 'user'
            };
            
            return db.createUser(newUser)
                .then(userId => {
                    newUser.id = userId;
                    return done(null, newUser);
                });
        })
        .catch(err => done(err));
}));

// Google Client ID verification
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Authentication middleware
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated() || req.session.loggedin) {
        return next();
    }
    res.redirect('/');
}

function ensureAdmin(req, res, next) {
    if ((req.session.user && req.session.user.role === 'admin') || 
        (req.user && req.user.role === 'admin')) {
        return next();
    }
    res.status(403).send('Accesso non autorizzato');
}

// ROUTES
app.get('/', (req, res) => {
    if (req.isAuthenticated() || req.session.loggedin) {
        const role = req.session.user ? req.session.user.role : (req.user ? req.user.role : 'user');
        if (role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/user/dashboard');
        }
    } else {
        // Changed from sendFile to render
        res.render('index', { 
            title: 'PastG - Registrazione e Login',
            layout: 'login' // Use our custom login layout
        });
    }
});

app.get('/login', (req, res) => {
    if (req.isAuthenticated() || req.session.loggedin) {
        const role = req.session.user ? req.session.user.role : (req.user ? req.user.role : 'user');
        if (role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/user/dashboard');
        }
    }
    
    res.render('login', { title: 'Accedi' });
});

// User dashboard
app.get('/user/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : (req.user ? req.user.id : null);
        if (!userId) {
            return res.status(401).redirect('/login');
        }
        
        const [clienti, ordini] = await Promise.all([
            db.getAllClients(),
            db.getOrdersByUserId(userId)
        ]);
        
        res.render('user-dashboard', {
            title: 'Dashboard Utente',
            userName: req.session.user ? req.session.user.nome : (req.user ? req.user.nome : 'Utente'),
            clienti: clienti,
            ordini: ordini
        });
    } catch (error) {
        console.error('Error loading user dashboard:', error);
        res.status(500).render('error', { message: 'Errore del server' });
    }
});

// Admin dashboard
app.get('/admin/dashboard', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const ordini = await db.getAllOrders();
        
        res.render('admin-dashboard', {
            title: 'Dashboard Admin',
            userName: req.session.user ? req.session.user.nome : (req.user ? req.user.nome : 'Admin'),
            ordini: ordini,
            isAdmin: true
        });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.status(500).render('error', { message: 'Errore del server' });
    }
});

// Search orders
app.get('/orders/search', ensureAuthenticated, async (req, res) => {
    try {
        const cliente_id = req.query.cliente_id || '';
        const stato = req.query.stato || '';
        const searchText = req.query.search_text || '';
        
        const isAdmin = (req.session.user && req.session.user.role === 'admin') || 
                        (req.user && req.user.role === 'admin');
        
        const userId = req.session.user ? req.session.user.id : (req.user ? req.user.id : null);
        
        const [clienti, ordini] = await Promise.all([
            db.getAllClients(),
            db.searchOrders({
                userId: !isAdmin ? userId : null,
                clienteId: cliente_id || null,
                stato: stato || null,
                searchText: searchText || null,
                isAdmin
            })
        ]);
        
        res.render('search-orders', {
            title: 'Ricerca Ordini',
            userName: req.session.user ? req.session.user.nome : (req.user ? req.user.nome : 'Utente'),
            clienti: clienti,
            ordini: ordini,
            selectedCliente: parseInt(cliente_id) || '',
            selectedStato: stato,
            searchText: searchText,
            isAdmin: isAdmin
        });
    } catch (error) {
        console.error('Error searching orders:', error);
        res.status(500).render('error', { message: 'Errore del server' });
    }
});

/**
 * @swagger
 * /orders/create:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - cliente_id
 *               - descrizione
 *             properties:
 *               cliente_id:
 *                 type: integer
 *               descrizione:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to user dashboard on success
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
app.post('/orders/create', ensureAuthenticated, async (req, res) => {
    try {
        const { cliente_id, descrizione } = req.body;
        const userId = req.session.user ? req.session.user.id : req.user.id;
        
        if (!cliente_id || !descrizione) {
            return res.status(400).json({ error: "Tutti i campi sono obbligatori." });
        }
        
        await db.createOrder({
            user_id: userId,
            cliente_id: cliente_id,
            descrizione: descrizione
        });
        
        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: "Errore durante il salvataggio dell'ordine." });
    }
});

// Function to send order confirmation email
async function sendOrderConfirmationEmail(orderId, userEmail, userName, clientName, orderDescription) {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
        sendSmtpEmail.subject = `Order #${orderId} Confirmed`;
        sendSmtpEmail.htmlContent = `
            <html>
                <body>
                    <h2>Order Confirmation</h2>
                    <p>Hello ${userName},</p>
                    <p>Your order #${orderId} for client ${clientName} has been confirmed.</p>
                    <p><strong>Order details:</strong> ${orderDescription}</p>
                    <p>Thank you for using our service!</p>
                </body>
            </html>
        `;
        sendSmtpEmail.sender = {
            name: "PastG Order System",
            email: "padovanimarco488@gmail.com" // Replace with your sender email
        };
        sendSmtpEmail.to = [{ email: userEmail, name: userName }];
        
        const data = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
        console.log('Email sent successfully. Returned data:', data);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

/**
 * @swagger
 * /orders/update:
 *   post:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - stato
 *             properties:
 *               orderId:
 *                 type: integer
 *               stato:
 *                 type: string
 *                 enum: [pending, completed, refused]
 *     responses:
 *       302:
 *         description: Redirects to admin dashboard on success
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
app.post('/orders/update', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { orderId, stato } = req.body;
        
        if (!orderId || !stato || !['pending', 'completed', 'refused'].includes(stato)) {
            return res.status(400).json({ error: "Dati non validi." });
        }
        
        await db.updateOrderStatus(orderId, stato);
        
        // Send email notification if order was completed
        if (stato === 'completed') {
            try {
                const order = await db.getDetailedOrderById(orderId);
                
                if (order) {
                    await sendOrderConfirmationEmail(
                        order.id,
                        order.email,
                        order.nome,
                        order.nomecliente,
                        order.descrizione
                    );
                }
            } catch (emailError) {
                console.warn(`Failed to send confirmation email for order #${orderId}:`, emailError);
            }
        }
        
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: "Errore durante l'aggiornamento dell'ordine." });
    }
});

/**
 * @swagger
 * /orders/delete:
 *   post:
 *     summary: Delete an order (admin only)
 *     tags: [Orders]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *     responses:
 *       302:
 *         description: Redirects to admin dashboard on success
 *       400:
 *         description: Missing order ID
 *       403:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
app.post('/orders/delete', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ error: "ID ordine non fornito." });
        }
        
        await db.deleteOrder(orderId);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: "Errore durante l'eliminazione dell'ordine." });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redirectUrl:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.getUserByEmail(email);
        
        if (!user || user.password !== password) {
            return res.status(401).json({ 
                error: "Credenziali non valide."
            });
        }
        
        // Set session data
        req.session.loggedin = true;
        req.session.user = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role
        };
        
        // Save session explicitly
        req.session.save(err => {
            if (err) {
                console.error('Errore nel salvataggio della sessione:', err);
                return res.status(500).json({ error: "Errore durante il login." });
            }
            
            res.json({
                redirectUrl: user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
            });
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: "Errore durante il login." });
    }
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - password
 *               - telefono
 *               - residenza
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               telefono:
 *                 type: string
 *               residenza:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 redirectUrl:
 *                   type: string
 *       400:
 *         description: Email or phone number already registered
 *       500:
 *         description: Server error
 */
app.post('/register', async (req, res) => {
    try {
        const { nome, telefono, residenza, email, password, role = 'user' } = req.body;

        // Validate role
        const validRole = ['user', 'admin'].includes(role) ? role : 'user';

        // Create the user
        const userId = await db.createUser({
            nome,
            residenza, 
            email,
            password,
            telefono,
            role: validRole
        });
        
        // Set session data after registration
        req.session.loggedin = true;
        req.session.user = {
            id: userId,
            nome: nome,
            email: email,
            role: validRole
        };
        
        req.session.save(err => {
            if (err) {
                console.error('Errore nel salvataggio della sessione:', err);
                return res.status(500).json({ error: "Errore durante la registrazione." });
            }
            
            // Return success with redirect URL based on role
            res.status(201).json({ 
                redirectUrl: validRole === 'admin' ? '/admin/dashboard' : '/user/dashboard'
            });
        });
    } catch (error) {
        console.error("Errore nella registrazione:", error);
        if (error.message && (error.message.includes('già in uso') || error.message.includes('UNIQUE'))) {
            return res.status(400).json({ error: "Email o telefono già registrati." });
        }
        res.status(500).json({ error: "Errore durante la registrazione." });
    }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout the current user
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       302:
 *         description: Redirects to home page after logout
 */
app.post('/logout', (req, res) => {
    // First determine where to redirect after logout
    const redirectUrl = '/';
    
    // Function to complete the logout process
    const completeLogout = () => {
        // Clear the cookie explicitly
        res.clearCookie('connect.sid');
        res.redirect(redirectUrl);
    };
    
    // Handle the session destruction
    if (req.session) {
        const logoutAndDestroy = () => {
            req.session.destroy(err => {
                if (err) {
                    console.error('Session destruction error:', err);
                }
                completeLogout();
            });
        };
        
        // If using Passport and req.logout exists
        if (req.logout) {
            try {
                // For Passport.js v0.6.0+
                req.logout(function(err) {
                    if (err) {
                        console.error('Passport logout error:', err);
                    }
                    logoutAndDestroy();
                });
            } catch (err) {
                console.error('Error during Passport logout:', err);
                logoutAndDestroy();
            }
        } else {
            // No Passport or older Passport version
            logoutAndDestroy();
        }
    } else {
        // No session to destroy
        completeLogout();
    }
});

/**
 * @swagger
 * /check-auth:
 *   get:
 *     summary: Check if user is authenticated
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Authentication status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 redirectUrl:
 *                   type: string
 */
app.get('/check-auth', (req, res) => {
    if (req.isAuthenticated() || req.session.loggedin) {
        const role = req.session.user ? req.session.user.role : (req.user ? req.user.role : 'user');
        res.json({
            authenticated: true,
            redirectUrl: role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// Google Sign-In callback
app.post('/auth/callback', async (req, res) => {
    try {
        const { credential } = req.body;
        
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID || 'api',
        });
        
        const payload = ticket.getPayload();
        const email = payload.email;
        
        let user = await db.getUserByEmail(email);
        
        if (user) {
            // User exists, create session
            req.session.loggedin = true;
            req.session.user = {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role
            };
            
            req.session.save(err => {
                if (err) {
                    console.error('Errore nel salvataggio della sessione:', err);
                    return res.status(500).json({ error: 'Errore del server' });
                }
                
                return res.json({ 
                    success: true, 
                    redirectUrl: user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
                });
            });
        } else {
            // Create new user
            const newUser = {
                nome: payload.name,
                residenza: 'Non specificato',
                email: email,
                password: 'google-auth',
                telefono: `google-${Date.now()}`,
                role: 'user'
            };
            
            const userId = await db.createUser(newUser);
            
            // User created, create session
            req.session.loggedin = true;
            req.session.user = {
                id: userId,
                nome: newUser.nome,
                email: newUser.email,
                role: newUser.role
            };
            
            req.session.save(err => {
                if (err) {
                    console.error('Errore nel salvataggio della sessione:', err);
                    return res.status(500).json({ error: 'Errore del server' });
                }
                
                return res.json({ 
                    success: true, 
                    redirectUrl: '/user/dashboard'
                });
            });
        }
    } catch (error) {
        console.error('Errore nella verifica del token Google:', error);
        res.status(400).json({ error: 'Token non valido' });
    }
});

// FIX: Google OAuth routes with proper session handling
app.get('/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email']
}));

// Fixed Google callback route to ensure session integrity
app.get('/auth/google/callback', (req, res, next) => {
    // Ensure session exists
    if (!req.session) {
        console.error('No session available for Google authentication');
        return res.redirect('/');
    }
    next();
}, passport.authenticate('google', { 
    failureRedirect: '/' 
}), (req, res) => {
    // Manual session management in case Passport's isn't working
    req.session.loggedin = true;
    
    if (req.user) {
        req.session.user = {
            id: req.user.id,
            nome: req.user.nome,
            email: req.user.email,
            role: req.user.role
        };
    }
    
    req.session.save(err => {
        if (err) {
            console.error('Error saving session after Google auth:', err);
            return res.redirect('/');
        }
        
        if (req.user && req.user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/user/dashboard');
        }
    });
});

/**
 * @swagger
 * /api/orders/search:
 *   get:
 *     summary: Search for orders based on criteria
 *     tags: [API]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: integer
 *         description: Filter by client ID
 *       - in: query
 *         name: stato
 *         schema:
 *           type: string
 *           enum: [pending, completed, refused]
 *         description: Filter by order status
 *       - in: query
 *         name: search_text
 *         schema:
 *           type: string
 *         description: Search text in order description
 *     responses:
 *       200:
 *         description: List of orders matching the criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ordini:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       500:
 *         description: Server error
 */
app.get('/api/orders/search', ensureAuthenticated, async (req, res) => {
    try {
        const cliente_id = req.query.cliente_id || '';
        const stato = req.query.stato || '';
        const searchText = req.query.search_text || '';
        
        // Check if user is admin
        const isAdmin = (req.session.user && req.session.user.role === 'admin') || 
                        (req.user && req.user.role === 'admin');
        
        // Get user ID
        const userId = req.session.user ? req.session.user.id : (req.user ? req.user.id : null);
        
        // Get orders
        const orders = await db.searchOrders({
            userId: !isAdmin ? userId : null,
            clienteId: cliente_id || null,
            stato: stato || null,
            searchText: searchText || null,
            isAdmin
        });
        
        res.json({ success: true, ordini: orders });
    } catch (error) {
        console.error('Error in API search orders:', error);
        res.status(500).json({ error: 'Errore del server' });
    }
});

/**
 * @swagger
 * /api/orders/update:
 *   post:
 *     summary: Update order status via API (admin only)
 *     tags: [API]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - stato
 *             properties:
 *               orderId:
 *                 type: integer
 *               stato:
 *                 type: string
 *                 enum: [pending, completed, refused]
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
app.post('/api/orders/update', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { orderId, stato } = req.body;
        
        if (!orderId || !stato || !['pending', 'completed', 'refused'].includes(stato)) {
            return res.status(400).json({ error: "Dati non validi." });
        }
        
        await db.updateOrderStatus(orderId, stato);
        
        // Send email notification if order was completed
        if (stato === 'completed') {
            try {
                const order = await db.getDetailedOrderById(orderId);
                
                if (order) {
                    await sendOrderConfirmationEmail(
                        order.id,
                        order.email,
                        order.nome,
                        order.nomecliente,
                        order.descrizione
                    );
                }
            } catch (emailError) {
                console.warn(`Failed to send confirmation email for order #${orderId}:`, emailError);
            }
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error in API update order:', error);
        res.status(500).json({ error: "Errore durante l'aggiornamento dell'ordine." });
    }
});

/**
 * @swagger
 * /api/orders/delete:
 *   post:
 *     summary: Delete order via API (admin only)
 *     tags: [API]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Missing order ID
 *       403:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
app.post('/api/orders/delete', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ error: "ID ordine non fornito." });
        }
        
        await db.deleteOrder(orderId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in API delete order:', error);
        res.status(500).json({ error: "Errore durante l'eliminazione dell'ordine." });
    }
});

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Get list of all clients
 *     tags: [API]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 clienti:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *       500:
 *         description: Server error
 */
app.get('/api/clients', ensureAuthenticated, async (req, res) => {
    try {
        const clienti = await db.getAllClients();
        res.json({ success: true, clienti: clienti });
    } catch (error) {
        console.error('Error in API get clients:', error);
        res.status(500).json({ error: 'Errore del server' });
    }
});

/**
 * @swagger
 * /api/clients/create:
 *   post:
 *     summary: Create a new client (admin only)
 *     tags: [API]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomecliente
 *             properties:
 *               nomecliente:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: integer
 *       400:
 *         description: Invalid data or client already exists
 *       403:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
app.post('/api/clients/create', ensureAuthenticated, ensureAdmin, async (req, res) => {
    try {
        const { nomecliente } = req.body;
        
        if (!nomecliente) {
            return res.status(400).json({ error: "Nome cliente non fornito." });
        }
        
        const clientId = await db.createClient({ nomecliente });
        res.json({ success: true, id: clientId });
    } catch (error) {
        console.error('Error in API create client:', error);
        if (error.message && error.message.includes('già esistente')) {
            return res.status(400).json({ error: "Cliente già esistente." });
        }
        res.status(500).json({ error: "Errore durante la creazione del cliente." });
    }
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).render('error', { 
        message: 'Si è verificato un errore del server', 
        error: process.env.NODE_ENV === 'development' ? err : {} 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { message: 'Pagina non trovata' });
});

// Start the server
const host = '127.0.0.1';
const server = http.createServer(app);
const io = socketIo(server, {
    pingTimeout: 60000, // Longer timeout
    pingInterval: 25000, // More frequent pings
    transports: ['websocket', 'polling'] // Prefer WebSocket but fallback to polling
});

// Store online users
const onlineUsers = new Map();

// Share session data with Socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// Socket.io connection handling
io.on('connection', (socket) => {
    const session = socket.request.session;
    
    // Only handle authenticated connections
    if (session && (session.loggedin || session.passport?.user)) {
        // Get user data from either custom session or passport
        let user;
        if (session.user) {
            user = session.user;
        } else if (session.passport?.user) {
            // Passport only stores the user id after deserialization; use it directly.
            user = { id: session.passport.user, nome: 'Utente', role: 'user' };
        }
        
        const userId = user.id;
        const userName = user.nome;
        const userRole = user.role;
        
        console.log(`User connected: ${userName} (${userId}), role: ${userRole}`);
        
        // Add user to online users
        onlineUsers.set(userId, {
            id: userId,
            name: userName,
            role: userRole,
            socketId: socket.id,
            lastActive: new Date()
        });
        
        // Broadcast updated user list to admin users immediately on connection
        broadcastOnlineUsers();
        
        // Allow clients to request user list updates explicitly
        socket.on('request-users', () => {
            if (userRole === 'admin') {
                socket.emit('online-users', global.cachedUserList || Array.from(onlineUsers.values()));
            }
        });
        
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userName} (${userId})`);
            onlineUsers.delete(userId);
            broadcastOnlineUsers(); // Broadcast user list after disconnect
        });
        
        // Update last activity timestamp periodically
        socket.on('heartbeat', () => {
            if (onlineUsers.has(userId)) {
                onlineUsers.get(userId).lastActive = new Date();
            }
        });
    } else {
        // Handle unauthenticated connections
        console.log('Unauthenticated socket connection attempt');
        socket.disconnect(true);
    }
});

// Function to broadcast online users to all admin clients
function broadcastOnlineUsers() {
    const userList = Array.from(onlineUsers.values()).map(user => ({
        id: user.id,
        name: user.name,
        role: user.role,
        lastActive: user.lastActive
    }));
    
    console.log(`Broadcasting online users update: ${userList.length} users online`);
    
    // Approach 1: Send to all admin sockets directly
    let adminCount = 0;
    for (const [adminId, adminData] of onlineUsers.entries()) {
        if (adminData.role === 'admin' && adminData.socketId) {
            io.to(adminData.socketId).emit('online-users', userList);
            adminCount++;
        }
    }
    
    // Approach 2: Also broadcast to a room for admins as a fallback
    io.emit('online-users', userList);
    
    console.log(`Broadcast sent to ${adminCount} admin users and all connected clients as fallback`);
    
    // Cache the list for future connections
    global.cachedUserList = userList;
}


server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
// Update server startup to use the http server
//server.listen(port, host, () => {
  //  console.log(`Server in esecuzione su http://${host}:${port}`);
//});

// Handle termination signals properly
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    server.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Server shutting down...');
    server.close();
    process.exit(0);
});