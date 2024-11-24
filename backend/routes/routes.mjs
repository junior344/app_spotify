import AppController from '../controller/login.controller.mjs';
import express from 'express';
const app = express();
// Middleware pour servir les fichiers statiques
app.get('/login', AppController.loginController);
// Route pour démarrer la connexion
// Callback Spotify
app.get('/callback', AppController.isAuthenticated, AppController.accessToken);
// Route pour obtenir le token d'accès
app.get('/access', AppController.isAuthenticated, AppController.fetchToken);
// Route pour obtenir les données du topAlbum
app.get('/TopAlbums', AppController.isAuthenticated, AppController.topAlbums);
// Route pour obtenir les données du topTracks
app.get('/TopTracks', AppController.isAuthenticated, AppController.topTracks);
export default app;
