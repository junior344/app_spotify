import express from 'express';
import AppRoutes from './routes/routes.mjs';
import SpotifyWebApi from 'spotify-web-api-node';
import path from 'path';
import { fileURLToPath } from 'url';
const port = 3000;
const app = express();
// Obtenir le chemin du fichier courant
const __filename = fileURLToPath(import.meta.url);
// Obtenir le répertoire courant
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));
const router = express.Router();
const spotifyApi = new SpotifyWebApi({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'http://localhost:3000/callback'
});
// Middleware pour s'assurer que l'utilisateur est authentifié
router.use((req, res, next) => {
    if (!spotifyApi.getAccessToken()) {
        return res.redirect('/index');
    }
    next();
});
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
