import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_TITLES: Array<[RegExp, string]> = [
  // Public
  [/^\/$/, "SeekTrouvez votre logement"],
  [/^\/annonces$/, "AnnoncesSeek"],
  [/^\/recherche$/, "RechercheSeek"],
  [/^\/annonce\/[^/]+$/, "AnnonceSeek"],
  [/^\/favoris$/, "Mes favorisSeek"],
  [/^\/proprietaires$/, "Espace propriétairesSeek"],

  // Owner auth
  [/^\/owner\/login$/, "Connexion propriétaireSeek"],
  [/^\/owner\/register$/, "Inscription propriétaireSeek"],
  [/^\/owner\/forgot-password$/, "Mot de passe oubliéSeek"],
  [/^\/owner\/reset-password$/, "Réinitialisation du mot de passeSeek"],

  // Owner espace
  [/^\/owner\/dashboard$/, "Tableau de bordSeek"],
  [/^\/owner\/verification$/, "VérificationSeek"],
  [/^\/owner\/profile$/, "Mon profilSeek"],
  [/^\/owner\/paiements$/, "Historique paiementsSeek"],
  [/^\/owner\/biens\/ajouter$/, "Ajouter un bienSeek"],
  [/^\/owner\/biens\/[^/]+\/paiements$/, "Paiements du bienSeek"],
  [/^\/owner\/biens\/[^/]+$/, "Détail du bienSeek"],
  [/^\/owner\/biens$/, "Mes biensSeek"],
  [/^\/owner\/locataires\/ajouter$/, "Ajouter un locataireSeek"],
  [/^\/owner\/locataires\/[^/]+$/, "Détail locataireSeek"],
  [/^\/owner\/locataires$/, "Mes locatairesSeek"],
  [/^\/owner\/stats\/vues$/, "Statistiques de vuesSeek"],
  [/^\/owner\/abonnement$/, "Mon abonnementSeek"],

  // Locataire auth
  [/^\/locataire\/activer$/, "Activation du compteSeek"],
  [/^\/locataire\/login$/, "Connexion locataireSeek"],
  [/^\/locataire\/forgot-password$/, "Mot de passe oubliéSeek"],
  [/^\/locataire\/reset-password$/, "Réinitialisation du mot de passeSeek"],

  // Locataire espace
  [/^\/locataire\/dashboard$/, "Mon espaceSeek"],
  [/^\/locataire\/profil$/, "Mon profilSeek"],
  [/^\/locataire\/paiements$/, "Mes paiementsSeek"],
  [/^\/locataire\/proprietaire$/, "Mon propriétaireSeek"],
  [/^\/locataire\/historique$/, "Historique logementSeek"],
  [/^\/locataire\/documents$/, "Mes documentsSeek"],
  [/^\/locataire\/etat-des-lieux$/, "État des lieuxSeek"],

  // Admin auth
  [/^\/admin\/login$/, "Connexion adminSeek"],

  // Admin espace
  [/^\/admin\/dashboard$/, "DashboardAdmin Seek"],
  [/^\/admin\/profile$/, "ProfilAdmin Seek"],
  [/^\/admin\/biens\/categories$/, "Types de logementAdmin Seek"],
  [/^\/admin\/biens\/transactions$/, "Types de transactionAdmin Seek"],
  [/^\/admin\/biens\/statuts$/, "Statuts des biensAdmin Seek"],
  [/^\/admin\/biens\/meuble-equipement$/, "Meubles & équipementsAdmin Seek"],
  [/^\/admin\/annonces\/[^/]+$/, "Détail annonceAdmin Seek"],
  [/^\/admin\/annonces$/, "AnnoncesAdmin Seek"],
  [/^\/admin\/verifications$/, "VérificationsAdmin Seek"],
  [/^\/admin\/proprietaires$/, "PropriétairesAdmin Seek"],
  [/^\/admin\/utilisateurs\/[^/]+$/, "UtilisateursAdmin Seek"],
  [/^\/admin\/suspensions$/, "SuspensionsAdmin Seek"],
  [/^\/admin\/geo\/pays$/, "PaysAdmin Seek"],
  [/^\/admin\/geo\/villes$/, "VillesAdmin Seek"],
  [/^\/admin\/geo\/quartiers$/, "QuartiersAdmin Seek"],
[/^\/admin\/transactions$/, "TransactionsAdmin Seek"],
  [/^\/admin\/premium\/historique$/, "Historique premiumAdmin Seek"],
  [/^\/admin\/premium\/formules$/, "Formules premiumAdmin Seek"],
  [/^\/admin\/locataires\/[^/]+\/documents$/, "Documents locataireAdmin Seek"],
  [/^\/admin\/stats\/revenus$/, "RevenusAdmin Seek"],
  [/^\/admin\/contrats\/modeles$/, "Modèles de contratAdmin Seek"],
  [/^\/admin\/monetisation\/config$/, "Config monétisationAdmin Seek"],
  [/^\/admin\/monetisation\/plans$/, "Plans d'abonnementAdmin Seek"],
  [/^\/admin\/monetisation\/abonnements$/, "AbonnementsAdmin Seek"],
  [/^\/admin\/monetisation\/mises-en-avant$/, "Mises en avantAdmin Seek"],
];

const DEFAULT_TITLE = "Seek";

export default function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = ROUTE_TITLES.find(([pattern]) => pattern.test(pathname));
    document.title = match ? match[1] : DEFAULT_TITLE;
  }, [pathname]);

  return null;
}
