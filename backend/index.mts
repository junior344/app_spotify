import express from 'express';
import AppRoutes from './routes/routes.mjs';
import SpotifyWebApi from 'spotify-web-api-node';
import fileUpload from 'express-fileupload';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config({ path: './.env' });
dotenv.config();

console.log('SESSION_SECRET:', process.env.SESSION_SECRET);
interface CustomRequest extends Request {
  session: session.Session & Partial<session.SessionData> & {
    access_token?: string;
  };
}

const port = 3000;
const app = express();


app.use(express.urlencoded({ extended: true })); //
app.use(express.json());
app.use(fileUpload());
app.use(express.static('public'));
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret' as string,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}))


// Obtenir le chemin du fichier courant
const __filename = fileURLToPath(import.meta.url);
// Obtenir le répertoire courant
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour servir les fichiers statiques
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
  });
 
// Middleware pour s'assurer que l'utilisateur est authentifié
app.get('/',(req:Request, res:Response) => {
    res.redirect('/index');
})

app.use('/', AppRoutes);

app.use((req:Request, res:Response) => {
    res.status(404).send('404 Not Found');
});
app.listen(port, ()=>{
    console.log(`Server is running on port http://localhost:${port}`);
})