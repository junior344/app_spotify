import SpotifyWebApi from 'spotify-web-api-node';
import dotenv from 'dotenv';
import config from '../config.json' assert { type: 'json' };
import scopes from '../model/model.mjs';
dotenv.config();
const spotifyApi = new SpotifyWebApi({
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    redirectUri: config.REDIRECT_URI,
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
    req.session.state = state;
    const stateUser = req.session.state;
    console.log('Received code:', code);
    if (state !== stateUser) {
        console.error('State mismatch:', state, stateUser);
        res.redirect('/error.html');
        return;
    }
    console.log('Retrieving access token');
    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
        res.redirect('/access.html');
    }
    catch (err) {
        console.error('Error during token retrieval:', err);
        res.redirect('/error.html');
    }
});
export const fetchToken = async (req, res) => {
    // console.log('Fetching token');
    // spotifyApi.setAccessToken((req as CustomRequest).session.access_token as string);
    try {
        console.log('Fetching user data');
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
// export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
//   const access_token = (req as CustomRequest).session.access_token;
//   if (!access_token) {
//     res.redirect('/login');
//     return;
//   }
//   try {
//     spotifyApi.setAccessToken(access_token);
//     await spotifyApi.getMe(); // Teste si le jeton est valide
//     next();
//   } catch (error) {
//     console.error('Authentication error:', error);
//     res.redirect('/login');
//   }
// };
export default {
    loginController,
    accessToken,
    fetchToken,
    topAlbums,
    topTracks,
    //isAuthenticated,
};
