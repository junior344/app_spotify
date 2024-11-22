
interface Artist {
  external_urls: { spotify: string };
  followers: { total: number };
  genres: string[];
  images: { url: string }[];
  name: string;
}
const fetchTokens = async () => {
  try {
    const response = await fetch('/accessToken.json'); // Assurez-vous que cette route est correcte
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data); // Assurez-vous que la réponse est bien en JSON
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

const tokens = await fetchTokens();



// Fonction pour récupérer les données de l'utilisateur
function getMyData() {
  fetch('/access') // Appelle la route exposée par le backend
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse les données en JSON
    })
    .then((data) => {
      const {topAlbum, topArtists, user } = data;
      console.log("topAlbum", topAlbum);
      const head = document.querySelector('.head');
      if (head){
        head.innerHTML = `
        <h1>Welcome,<span> ${user.display_name || 'User'} </span> </h1>
        <div class="links">
          <nav>
              <li><a href="#" class="active">TopArtists</a></li>
              <li><a href="TopAlbums">TopAlbums</a></li>
              <li><a href="#">TopTracks</a></li>
              <li><a href="#">Playlists</a></li>
          </nav>
          <img src="${user.images[0]?.url || ''}" alt="Profile Image" width="150">
        </div>
        `;
      }

      
      displayArtists(topArtists); // Affiche les artistes
      albumsData = topAlbum; // Stocke les données des albums
      displayAlbums(currentPage); // Affiche les albums
      handlePagination(); // Gère la pagination
    })
    .catch((error) => {
      console.error('Error fetching user data:', error);
    });
}

// Appel de la fonction pour récupérer les données



function displayArtists(artists: Artist[]): void {
  console.log("artists");
  const gridContainer = document.querySelector(".artist-grid");

  artists.forEach((artist: Artist) => {
    // Création de la carte pour chaque artiste
    const card = document.createElement("div");
    card.classList.add("card");

    // Image de l'artiste
    const imageUrl = artist.images && artist.images.length > 0 ? artist.images[0].url : 'default-image-url.jpg'; // Utiliser une image par défaut si vide
    const artistGenres = artist.genres && artist.genres.length > 0 ? artist.genres : ['Genre inconnu']; // Genre par défaut si vide
    const img = document.createElement("img");
    img.src = artist.images[0].url;
    img.height = 200;
    img.alt = artist.name;

    // Corps de la carte
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // Nom de l'artiste
    const name = document.createElement("h3");
    name.textContent = artist.name;

    // Liste des genres
    const genresList = document.createElement("ul");
    genresList.classList.add("genres");
    artist.genres.forEach((genre: string) => {
      const genreItem = document.createElement("li");
      genreItem.textContent = genre;
      genresList.appendChild(genreItem);
    });

    // Nombre de followers
    const followers = document.createElement("div");
    followers.classList.add("followers");
    followers.textContent = `Followers: ${artist.followers.total.toLocaleString()}`;

    // Lien vers le profil Spotify
    const profileLink = document.createElement("a");
    profileLink.href = artist.external_urls.spotify;
    profileLink.target = "_blank";
    profileLink.textContent = "Voir le profil";

    // Ajout des éléments au corps de la carte
    cardBody.appendChild(name);
    cardBody.appendChild(genresList);
    cardBody.appendChild(followers);
    cardBody.appendChild(profileLink);

    // Ajout de l'image et du corps de la carte à la carte
    card.appendChild(img);
    card.appendChild(cardBody);

    // Ajout de la carte à la grille
    console.log(gridContainer)
    gridContainer?.appendChild(card);
  });
}

let currentPage = 1;
const albumsPerPage = 5;
interface Album {
  artists: string[];
  name: string;
  external_urls: { spotify: string };
  images: { url: string }[];
  release_date: string;
  total_tracks: number;
}

let albumsData: Album[] = [];

function displayAlbums(page: number): void {
  const startIndex = (page - 1) * albumsPerPage;
  const endIndex = startIndex + albumsPerPage;
  const albumsToDisplay = albumsData.slice(startIndex, endIndex);

  const albumContainer = document.querySelector('.album-container');
  // if (albumContainer) {
  //   albumContainer.innerHTML = ''; // Réinitialiser le contenu
  // }

  albumsToDisplay.forEach((album, index) => {
    const albumElement = document.createElement('div');
    albumElement.classList.add('album');
    
    albumElement.innerHTML = `
       <h3>${startIndex + index + 1}. ${album.name}</h3>
      
      <a href="${album.external_urls.spotify}" target="_blank">
        <img src="${album.images[1].url}" alt="${album.name}" />
      </a>
      <p>Release Date: ${album.release_date}</p>
      <p>Total Tracks: ${album.total_tracks}</p>
    `;
    
    albumContainer?.appendChild(albumElement);
  });
}

function handlePagination() {
  const prevButton = document.querySelector('.prev-page');
  const nextButton = document.querySelector('.next-page');
  
  if (prevButton) {
    (prevButton as HTMLButtonElement).disabled = currentPage === 1;
  }
  if (nextButton) {
    (nextButton as HTMLButtonElement).disabled = currentPage * albumsPerPage >= albumsData.length;
  }

  prevButton?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayAlbums(currentPage);
    }
  });

  nextButton?.addEventListener('click', () => {
    if (currentPage * albumsPerPage < albumsData.length) {
      currentPage++;
      displayAlbums(currentPage);
    }
  });
}
getMyData();