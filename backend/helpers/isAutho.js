import SpotifyWebApi from 'spotify-web-api-node';
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});
export const isAuthenticated = async (req, res, next) => {
    const access_token = req.session.access_token;
    if (!access_token) {
        res.redirect('/login');
        return;
    }
    try {
        spotifyApi.setAccessToken(access_token);
        await spotifyApi.getMe(); // Teste si le jeton est valide
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.redirect('/login');
    }
};
export default isAuthenticated;
