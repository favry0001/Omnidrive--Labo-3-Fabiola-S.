const CLE_THEME_ENREGISTRE = "theme";

// Choix enregistré clair ou sombre
function lireChoixEnregistre() {
    try {
        const choix = localStorage.getItem(CLE_THEME_ENREGISTRE);
        if (choix === "clair" || choix === "sombre") {
            return choix;
        }
    } catch (erreur) {
        
    }
    return null;
}


function lirePreferenceSysteme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "sombre" : "clair";
}

document.documentElement.setAttribute("data-theme", lireChoixEnregistre() || lirePreferenceSysteme());
