import express from 'express';
import AppRoutes from './routes/routes.mjs';
import SpotifyWebApi from 'spotify-web-api-node';
import fileUpload from 'express-fileupload';
import session from 'express-session';
import config from './config.json' assert { type: 'json' };
import path from 'path';
import { fileURLToPath } from 'url';
console.log('CLIENT_ID:', config.CLIENT_ID);
console.log('SESSION_SECRET:', config.SESSION_SECRET);
const port = 3000;
const app = express();
app.use(express.urlencoded({ extended: true })); //
app.use(express.json());
app.use(fileUpload());
app.use(express.static('public'));
app.set('trust proxy', 1); // trust first proxy
app.use(session({
    secret: config.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: config.NODE_ENV === 'production' }
}));
// Obtenir le chemin du fichier courant
const __filename = fileURLToPath(import.meta.url);
// Obtenir le répertoire courant
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
// Middleware pour servir les fichiers statiques
const spotifyApi = new SpotifyWebApi({
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    redirectUri: config.REDIRECT_URI,
});
// Middleware pour s'assurer que l'utilisateur est authentifié
app.get('/', (req, res) => {
    res.redirect('/index');
});
app.use('/', AppRoutes);
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
