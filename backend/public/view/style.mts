document.addEventListener('DOMContentLoaded', () => {
    // Sélectionne tous les liens
    const links = document.querySelectorAll('nav a');
  
    // Ajoute un gestionnaire d'événement sur chaque lien
    links.forEach(link => {
      link.addEventListener('click', event => {
        // Empêche le comportement par défaut si nécessaire (optionnel)
        event.preventDefault();
  
        // Supprime la classe active de tous les liens
        links.forEach(link => link.classList.remove('active'));
  
        // Ajoute la classe active au lien cliqué
        (event.target as HTMLElement)?.classList.add('active');
      });
    });
  });
  