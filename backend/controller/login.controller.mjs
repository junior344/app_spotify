import fs from 'fs';
import SpotifyWebApi from 'spotify-web-api-node';
import scopes from '../model/model.mjs';
const spotifyApi = new SpotifyWebApi({
    clientId: '77a9d98ed0964e99819d30803fa44e75',
    clientSecret: 'e1e1bbd60a94411eb9e733a807b27c4f',
    redirectUri: 'http://localhost:3000/callback'
});
export const loginController = (async (req, res) => {
    console.log('Login request received');
    const state = 'some-state-of-my-choice'; // You can generate a random state string here
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL);
});
export const accessToken = (async (req, res) => {
    const code = req.query.code;
    const error = req.query.error;
    if (error) {
        console.error('Error:', error);
        res.redirect('/error.html'); // Redirige vers une page d'erreur (optionnel)
        return;
    }
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
        const tokens = JSON.stringify({ access_token, refresh_token, expires_in });
        fs.writeFileSync('public/accessToken.json', tokens);
        //res.json({ access_token, refresh_token, expires_in });
        // Redirige vers la page de succès
        res.redirect('/access.html');
    }
    catch (err) {
        console.error('Error during token retrieval:', err);
        res.redirect('/error.html'); // Redirige en cas d'erreur
    }
});
export const fetchToken = async (req, res) => {
    try {
        console.log('Fetching user data...');
        // Obtenir les données utilisateur (information de l'utilisateur connecté)
        const me = await spotifyApi.getMe();
        // Obtenir les top tracks
        const topTracksData = await spotifyApi.getMyTopTracks({ limit: 50 });
        // Récupérer les pistes
        const tracks = topTracksData.body.items;
        // Regrouper les pistes par album et calculer le nombre de lectures
        const albumPlayCounts = tracks.reduce((acc, track) => {
            const albumId = track.album.id; // Utiliser l'ID de l'album pour éviter les doublons
            if (!acc[albumId]) {
                acc[albumId] = {
                    album: track.album,
                    count: 0,
                };
            }
            acc[albumId].count += 1; // Incrémenter le nombre de lectures pour chaque album
            return acc;
        }, {});
        // Extraire les albums uniques
        const uniqueAlbums = Object.values(albumPlayCounts).map(item => item.album);
        // Filtrer les albums pour ne garder que ceux avec un nombre de pistes >= 10
        const filteredAlbums = uniqueAlbums.filter(album => album && album.total_tracks >= 10);
        // Obtenir les top artists
        const topArtists = await spotifyApi.getMyTopArtists();
        // Préparer la réponse avec les données souhaitées
        const result = {
            topAlbum: filteredAlbums,
            user: me.body,
            topArtists: topArtists.body.items,
        };
        // Renvoie les données utilisateur au client
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
};
export const topAlbums = async (req, res) => {
    try {
        res.redirect('/TopAlbums.html');
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        // res.status(500).json({ error: 'Failed to fetch user data' });
    }
};
export default {
    loginController,
    accessToken,
    fetchToken,
    topAlbums
};
