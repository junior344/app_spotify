import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';
import scopes from '../model/model.mjs';
dotenv.config();
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});
export const loginController = (async (req, res) => {
    console.log('Login request received');
    const state = 'some-state-of-my-choice'; // You can generate a random state string here
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
    res.redirect(authorizeURL);
});
export const accessToken = (async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    const stateUser = req.session.state;
    if (state !== stateUser) {
        console.error('State mismatch:', state, stateUser);
        res.redirect('/error.html');
        return;
    }
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;
        res.redirect('/access.html');
    }
    catch (err) {
        console.error('Error during token retrieval:', err);
        res.redirect('/error.html');
    }
});
export const fetchToken = async (req, res) => {
    spotifyApi.setAccessToken(req.session.access_token);
    try {
        // Obtenir les données utilisateur (information de l'utilisateur connecté)
        const me = await spotifyApi.getMe();
        // Obtenir les top tracks
        const topTracksData = await spotifyApi.getMyTopTracks({ limit: 50 });
        const TopTracksFilter = topTracksData.body.items.filter((item) => item.type === 'track');
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
        console.log('track data fetched:', TopTracksFilter);
        // Préparer la réponse avec les données souhaitées
        const result = {
            topAlbum: filteredAlbums,
            user: me.body,
            topTracks: TopTracksFilter,
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
export const topTracks = async (req, res) => {
    try {
        res.redirect('/tracks.html');
    }
    catch (error) {
        console.error('Error fetching user data:', error);
        //res.status(500).json({ error: 'Failed to fetch user data' });
    }
};
export const isAuthenticated = (req, res, next) => {
    if (!req.session.access_token) {
        res.redirect('/login.html');
    }
    else {
        next();
    }
};
export default {
    loginController,
    accessToken,
    fetchToken,
    topAlbums,
    topTracks,
    isAuthenticated
};
