/* Labo 3 thème clair/sombre, validation du formulaire d'inscription, mémoire des demandes */

const CLE_THEME = "theme";
const CLE_DEMANDES = "demandes";
const CLE_SAISIE = "derniereSaisie";   // prénom, nom et courriel 
const AGE_MINIMUM = 16;
const AGE_CLASSE_3 = 18;               
const MOTIF_COURRIEL = /^\S+@\S+\.\S+$/;
const MOTIF_TELEPHONE = /^[0-9]{10}$/;

/* ---------- localStorage  */


function lireJSON(cle, valeurParDefaut) {
    try {
        return JSON.parse(localStorage.getItem(cle)) || valeurParDefaut;
    } catch (erreur) {
        return valeurParDefaut;
    }
}

// Range un texte 
function ranger(cle, texte) {
    try {
        localStorage.setItem(cle, texte);
    } catch (erreur) {
        
    }
}

function rangerJSON(cle, valeur) {
    ranger(cle, JSON.stringify(valeur));
}

/* ---------- 1. Thème  */

// Le bouton annonce l'action 
function mettreAJourBoutonTheme(bouton) {
    const sombre = document.documentElement.getAttribute("data-theme") === "sombre";
    bouton.textContent = sombre ? "Mode clair" : "Mode sombre";
    bouton.setAttribute("aria-label", sombre ? "Activer le mode clair" : "Activer le mode sombre");
}

function initialiserTheme() {
    const bouton = document.getElementById("bouton-theme");
    if (!bouton) {
        return;
    }
    mettreAJourBoutonTheme(bouton);
    bouton.addEventListener("click", function () {
        const sombre = document.documentElement.getAttribute("data-theme") === "sombre";
        const nouveau = sombre ? "clair" : "sombre";
        document.documentElement.setAttribute("data-theme", nouveau);
        ranger(CLE_THEME, nouveau);
        mettreAJourBoutonTheme(bouton);
    });
}

/* ---------- 2. Validation du formulaire */

// AAAA-MM-JJ 
function calculerAge(dateTexte) {
    const parties = dateTexte.split("-");
    const mois = Number(parties[1]);
    const jour = Number(parties[2]);
    const aujourdhui = new Date();
    let age = aujourdhui.getFullYear() - Number(parties[0]);
    const moisCourant = aujourdhui.getMonth() + 1;
    if (moisCourant < mois || (moisCourant === mois && aujourdhui.getDate() < jour)) {
        age = age - 1;
    }
    return age;
}

// les messages d'erreurs
function validerTexte(champ) {
    return champ.value.trim().length < 2 ? "Entre au moins 2 caractères." : "";
}

function validerCourriel(champ) {
    return MOTIF_COURRIEL.test(champ.value.trim()) ? "" : "Entre un courriel valide, par exemple nom@exemple.com.";
}

function validerTelephone(champ) {
    return MOTIF_TELEPHONE.test(champ.value.trim()) ? "" : "Entre exactement 10 chiffres, sans espace ni tiret.";
}

function validerNaissance(champ) {
    if (champ.value === "") {
        return "Choisis ta date de naissance.";
    }
    const age = calculerAge(champ.value);
    if (age < 0) {
        return "La date de naissance ne peut pas être dans le futur.";
    }
    if (age < AGE_MINIMUM) {
        return "Tu dois avoir au moins " + AGE_MINIMUM + " ans pour t'inscrire.";
    }
    return "";
}

// le permis de classe 3 
function validerPermis(champ) {
    if (champ.value === "") {
        return "Choisis un type de permis.";
    }
    const naissance = document.getElementById("naissance").value;
    if (champ.value === "classe-3" && naissance !== "" && calculerAge(naissance) < AGE_CLASSE_3) {
        return "La classe 3 est réservée aux " + AGE_CLASSE_3 + " ans et plus. Choisis un autre permis ou vérifie ta date de naissance.";
    }
    return "";
}

function validerAccord(champ) {
    return champ.checked ? "" : "Tu dois accepter d'être contacté pour envoyer le formulaire.";
}

// Les champs validés
const CHAMPS = ["prenom", "nom", "courriel", "telephone", "naissance", "permis", "accord"];
const REGLES = {
    prenom: validerTexte,
    nom: validerTexte,
    courriel: validerCourriel,
    telephone: validerTelephone,
    naissance: validerNaissance,
    permis: validerPermis,
    accord: validerAccord
};

// Affiché  le message sous le champ (le crée la première fois) 
function afficherErreur(champ, message) {
    let zone = document.getElementById("erreur-" + champ.id);
    if (!zone) {
        zone = document.createElement("p");
        zone.id = "erreur-" + champ.id;
        zone.className = "message-erreur";
        champ.parentElement.appendChild(zone);
    }
    zone.textContent = message;
    champ.setAttribute("aria-invalid", "true");
    champ.setAttribute("aria-describedby", zone.id);
}

function effacerErreur(champ) {
    const zone = document.getElementById("erreur-" + champ.id);
    if (zone) {
        zone.remove();
    }
    champ.removeAttribute("aria-invalid");
    champ.removeAttribute("aria-describedby");
}

// Valide un champ
function validerChamp(champ) {
    const message = REGLES[champ.id](champ);
    if (message === "") {
        effacerErreur(champ);
        return true;
    }
    afficherErreur(champ, message);
    return false;
}

// Valide tout le formulaire 
function validerFormulaire() {
    let premierFautif = null;
    for (const id of CHAMPS) {
        const champ = document.getElementById(id);
        if (!validerChamp(champ) && premierFautif === null) {
            premierFautif = champ;
        }
    }
    return premierFautif;
}

/* ---------- 3. Mémoire des demandes  */

// Les disponibilités cochées
function lireDisponibilites() {
    const textes = [];
    for (const caseCochee of document.querySelectorAll('input[name="dispo"]:checked')) {
        textes.push(document.querySelector('label[for="' + caseCochee.id + '"]').textContent.trim());
    }
    return textes;
}

// Objet d'une demande  le téléphone et la date de naissance ne sont PAS rangés
function construireDemande() {
    const permis = document.getElementById("permis");
    return {
        id: Date.now(),
        prenom: document.getElementById("prenom").value.trim(),
        nom: document.getElementById("nom").value.trim(),
        courriel: document.getElementById("courriel").value.trim(),
        permis: permis.options[permis.selectedIndex].text,
        disponibilites: lireDisponibilites(),
        date: new Date().toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })
    };
}

// Une carte par demande  tout le texte passe par textContent
function creerCarteDemande(demande) {
    const carte = document.createElement("li");
    carte.className = "carte-demande";

    const titre = document.createElement("h3");
    titre.textContent = demande.permis;
    carte.appendChild(titre);

    const personne = document.createElement("p");
    personne.textContent = demande.prenom + " " + demande.nom + " : " + demande.courriel;
    carte.appendChild(personne);

    const details = document.createElement("p");
    const dispos = demande.disponibilites.length > 0 ? demande.disponibilites.join(", ") : "aucune indiquée";
    details.textContent = "Envoyée le " + demande.date + ". Disponibilités : " + dispos + ".";
    carte.appendChild(details);

    const supprimer = document.createElement("button");
    supprimer.type = "button";
    supprimer.className = "btn btn-contour btn-sm";
    supprimer.textContent = "Supprimer cette demande";
    supprimer.addEventListener("click", function () {   // l'écouteur est posé à la création du bouton
        supprimerDemande(demande.id);
    });
    carte.appendChild(supprimer);

    return carte;
}

// Mes demandes partir du localStorage
function afficherDemandes() {
    const demandes = lireJSON(CLE_DEMANDES, []);
    const liste = document.getElementById("liste-demandes");
    liste.innerHTML = "";
    for (const demande of demandes) {
        liste.appendChild(creerCarteDemande(demande));
    }
    document.getElementById("message-vide").hidden = demandes.length > 0;
    document.getElementById("bouton-effacer").disabled = demandes.length === 0;
}

function supprimerDemande(identifiant) {
    const restantes = [];
    for (const demande of lireJSON(CLE_DEMANDES, [])) {
        if (demande.id !== identifiant) {
            restantes.push(demande);
        }
    }
    rangerJSON(CLE_DEMANDES, restantes);
    afficherDemandes();
}

function toutEffacer() {
    if (window.confirm("Effacer toutes les demandes enregistrées sur cet appareil ?")) {
        localStorage.removeItem(CLE_DEMANDES);
        localStorage.removeItem(CLE_SAISIE);
        afficherDemandes();
    }
}

// Remet prénom, nom et courriel de la dernière saisie
function preremplirFormulaire() {
    const saisie = lireJSON(CLE_SAISIE, null);
    if (saisie) {
        document.getElementById("prenom").value = saisie.prenom;
        document.getElementById("nom").value = saisie.nom;
        document.getElementById("courriel").value = saisie.courriel;
    }
}

/* ---------- Branchement sur la page d'inscription  */
function gererEnvoi(evenement) {
    evenement.preventDefault();
    const confirmation = document.getElementById("confirmation");
    confirmation.hidden = true;

    const premierFautif = validerFormulaire();
    if (premierFautif !== null) {
        premierFautif.focus();
        return;
    }

    const demande = construireDemande();
    const demandes = lireJSON(CLE_DEMANDES, []);
    demandes.push(demande);
    rangerJSON(CLE_DEMANDES, demandes);
    rangerJSON(CLE_SAISIE, { prenom: demande.prenom, nom: demande.nom, courriel: demande.courriel });
    evenement.target.reset();
    preremplirFormulaire();
    afficherDemandes();

    confirmation.textContent = "Merci " + demande.prenom + " ! Ta demande (" + demande.permis + ") est enregistrée. Elle apparaît dans « Mes demandes » plus bas.";
    confirmation.hidden = false;
    confirmation.focus();
}


// à la sortie d'un champ ça valide ce champ
function validerEnDirect(evenement) {
    const champ = evenement.target;
    if (!REGLES[champ.id]) {
        return;   
    }
    if (evenement.type === "input" && champ.getAttribute("aria-invalid") !== "true") {
        return;
    }
    validerChamp(champ);
    const permis = document.getElementById("permis");
    if (champ.id === "naissance" && permis.value !== "") {
        validerChamp(permis);   
    }
}

function initialiserFormulaire() {
    const formulaire = document.getElementById("formulaire-inscription");
    if (!formulaire) {
        return;
    }
    
    // navigateur,  validation et affichage de messages
    formulaire.noValidate = true;
    formulaire.addEventListener("submit", gererEnvoi);
    formulaire.addEventListener("input", validerEnDirect);
    formulaire.addEventListener("change", validerEnDirect);
    preremplirFormulaire();
}

function initialiserMemoire() {
    if (!document.getElementById("liste-demandes")) {
        return;
    }
    afficherDemandes();
    document.getElementById("bouton-effacer").addEventListener("click", toutEffacer);
}

initialiserTheme();
initialiserFormulaire();
initialiserMemoire();
