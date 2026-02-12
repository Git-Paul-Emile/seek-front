import { Link } from "react-router-dom";
import { FileText, Users, Shield, Building2, HelpCircle, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const guideSections = [
  {
    id: "guide-louer",
    title: "Guide : Comment louer au Sénégal",
    icon: BookOpen,
    content: `
      <h3 class="text-xl font-semibold mb-4">Les étapes clés pour réussir votre location</h3>
      
      <div class="space-y-6">
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
          <div>
            <h4 class="font-semibold mb-2">Définir vos critères</h4>
            <p class="text-muted-foreground">Avant de commencer votre recherche, déterminez votre budget, la localisation souhaitée (Dakar, Thiès, Saint-Louis...), le type de bien (appartement, maison, studio) et la superficie нужная.</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
          <div>
            <h4 class="font-semibold mb-2">Rechercher votre bien</h4>
            <p class="text-muted-foreground">Parcourez les annonces sur Seek, filtrez par vos critères et n'hésitez pas à visiter plusieurs biens avant de vous décider. Au Sénégal, les visites sont généralement gratuites.</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
          <div>
            <h4 class="font-semibold mb-2">Négocier les conditions</h4>
            <p class="text-muted-foreground">Discutez du montant du loyer, de la durée du bail, des charges incluses et des conditions de renouvellement. Tout doit être clairement stipulé dans le contrat.</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
          <div>
            <h4 class="font-semibold mb-2">Signer le bail</h4>
            <p class="text-muted-foreground">Le contrat de bail doit être rédigé en deux exemplaires (ou plus si nécessaire), signé par les deux parties. Il est recommandé de le faire signer par un témoin ou de passer par une agence.</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
          <div>
            <h4 class="font-semibold mb-2">Régler le dépôt de garantie</h4>
            <p class="text-muted-foreground">Le dépôt de garantie (généralement 2 à 3 mois de loyer hors charges) doit être versé lors de la remise des clés. Conservez bien votre reçu.</p>
          </div>
        </div>
        
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">6</div>
          <div>
            <h4 class="font-semibold mb-2">Effectuer l'état des lieux</h4>
            <p class="text-muted-foreground">Un état des lieux d'entrée détaillé doit être réalisé et annexé au bail. Prenez des photos de chaque pièce pour vous protéger en cas de litige lors de la sortie.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: "colocation",
    title: "Conseils pour la colocation",
    icon: Users,
    content: `
      <h3 class="text-xl font-semibold mb-4">La colocation au Sénégal : mode d'emploi</h3>
      
      <p class="text-muted-foreground mb-6">
        La colocation est de plus en plus populaire au Sénégal, notamment dans les grandes villes comme Dakar. Elle permet de réduire les coûts et de partager un logement, mais nécessite une bonne organisation.
      </p>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-muted/50 p-4 rounded-lg">
          <h4 class="font-semibold mb-2">Avant de vous engager</h4>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground text-sm">
            <li>Vérifiez la solvabilité de chaque colocataire</li>
            <li>Établissez un contrat de colocation séparé</li>
            <li>Définissez les règles de vie commune (visites, bruit, ménage...)</li>
            <li>Clarifiez la répartition des charges et du loyer</li>
            <li>Mentionnez les conditions de départ d'un colocataire</li>
          </ul>
        </div>
        
        <div class="bg-muted/50 p-4 rounded-lg">
          <h4 class="font-semibold mb-2">Les points essentiels du contrat</h4>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground text-sm">
            <li>Clause de solidarité entre les colocataires</li>
            <li>Règlement intérieur du logement</li>
            <li>Répartition équitable des espaces communs</li>
            <li>Modalités de révision du loyer</li>
            <li>Préavis en cas de départ</li>
          </ul>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <h4 class="font-semibold mb-2">💡 Conseil Seek</h4>
        <p class="text-muted-foreground text-sm">
          Utilisez notre espace dédié aux colocataires pour gérer facilement les paiements, les charges et la communication entre membres. Notre plateforme vous aide à garder une trace de toutes les transactions.
        </p>
      </div>
    `
  },
  {
    id: "droits-locataire",
    title: "Droits & Devoirs du Locataire",
    icon: Shield,
    content: `
      <h3 class="text-xl font-semibold mb-4">Vos droits en tant que locataire</h3>
      
      <div class="space-y-4">
        <div class="border-l-4 border-primary pl-4">
          <h4 class="font-semibold">Droit à un logement décent</h4>
          <p class="text-muted-foreground text-sm">Le propriétaire doit vous fournir un logement salubre, équipé (cuisine, sanitaires) et conforme aux normes de sécurité.</p>
        </div>
        
        <div class="border-l-4 border-primary pl-4">
          <h4 class="font-semibold">Droit à la jouissance paisible</h4>
          <p class="text-muted-foreground text-sm">Vous pouvez jouir de votre logement sans ingérence du propriétaire, sauf pour les réparations urgentes.</p>
        </div>
        
        <div class="border-l-4 border-primary pl-4">
          <h4 class="font-semibold">Droit à l'information</h4>
          <p class="text-muted-foreground text-sm">Le propriétaire doit vous informer de toute augmentation de loyer et des changements dans les conditions du bail.</p>
        </div>
        
        <div class="border-l-4 border-primary pl-4">
          <h4 class="font-semibold">Droit de recevoir des quittances</h4>
          <p class="text-muted-foreground text-sm">Vous pouvez exiger une quittance pour chaque paiement de loyer effectué.</p>
        </div>
      </div>
      
      <h3 class="text-xl font-semibold mt-8 mb-4">Vos devoirs en tant que locataire</h3>
      
      <div class="space-y-4">
        <div class="border-l-4 border-muted-foreground pl-4">
          <h4 class="font-semibold">Payer le loyer</h4>
          <p class="text-muted-foreground text-sm">Le loyer doit être payé aux échéances prévues dans le contrat (généralement mensuellement).</p>
        </div>
        
        <div class="border-l-4 border-muted-foreground pl-4">
          <h4 class="font-semibold">Utiliser le logement conformément</h4>
          <p class="text-muted-foreground text-sm">Le logement doit être utilisé selon sa destination (habitation principale) et entretenu correctement.</p>
        </div>
        
        <div class="border-l-4 border-muted-foreground pl-4">
          <h4 class="font-semibold">Informer le propriétaire des dégradations</h4>
          <p class="text-muted-foreground text-sm">Vous devez signaler rapidement tout problème nécessitant une réparation.</p>
        </div>
        
        <div class="border-l-4 border-muted-foreground pl-4">
          <h4 class="font-semibold">Respecter le préavis</h4>
          <p class="text-muted-foreground text-sm">En cas de départ, respectez le délai de préavis prévu dans le bail (généralement 1 à 3 mois).</p>
        </div>
      </div>
    `
  },
  {
    id: "droits-proprietaire",
    title: "Droits & Devoirs du Propriétaire",
    icon: Building2,
    content: `
      <h3 class="text-xl font-semibold mb-4">Vos droits en tant que propriétaire</h3>
      
      <div class="space-y-4">
        <div class="border-l-4 border-primary pl-4">
          <h4 class="font-semibold">Droit de percevoir le loyer</h4>
          <p class="text-muted-foreground text-sm">Vous avez droit au paiement régulier du loyer selon les modalités convenues dans le bail.</p>
        </div>
        
        <div class="border-l-4 border-primary pl-4">
          <h4 class="font-semibold">Droit de choisir votre locataire</h4>
          <p class="text-muted-foreground text-sm">Vous êtes libre de sélectionner votre locataire, sous réserve de ne pas pratiquer de discrimination.</p>
        </div>
        
        <div class="border-l-4 border-primary pl-4">
          <h4 class="font-semibold">Droit de reprendre le bien</h4>
          <p class="text-muted-foreground text-sm">Sous réserve des conditions du bail, vous pouvez reprendre votre bien à l'échéance du contrat.</p>
        </div>
        
        <div class="border-l-4 border-primary pl-4">
          <h4 class="font-semibold">Droit de procéder à des travaux</h4>
          <p class="text-muted-foreground text-sm">Vous pouvez effectuer des travaux d'amélioration ou de réparation, en prévenant le locataire dans un délai raisonnable.</p>
        </div>
      </div>
      
      <h3 class="text-xl font-semibold mt-8 mb-4">Vos devoirs en tant que propriétaire</h3>
      
      <div class="space-y-4">
        <div class="border-l-4 border-muted-foreground pl-4">
          <h4 class="font-semibold">Délivrer un logement décent</h4>
          <p class="text-muted-foreground text-sm">Le logement doit être en bon état d'usage et de réparation, avec les équipements fonctionnels.</p>
        </div>
        
        <div class="border-l-4 border-muted-foreground pl-4">
          <h4 class="font-semibold">Assurer la jouissance paisible</h4>
          <p class="text-muted-foreground text-sm">Vous ne devez pas troubler la jouissance du locataire pendant la durée du bail.</p>
        </div>
        
        <div class="border-l-4 border-muted-foreground pl-4">
          <h4 class="font-semibold">Effectuer les réparations importantes</h4>
          <p class="text-muted-foreground text-sm">Les grosses réparations (toiture, structure, installations générales) sont à votre charge.</p>
        </div>
        
        <div class="border-l-4 border-muted-foreground pl-4">
          <h4 class="font-semibold">Restituer le dépôt de garantie</h4>
          <p class="text-muted-foreground text-sm">Le dépôt de garantie doit être restitué dans les délais convenus, déduction faite des sommes légitimement dues.</p>
        </div>
      </div>
    `
  },
  {
    id: "droits-agence",
    title: "Droits & Devoirs de l'Agence Immobilière",
    icon: FileText,
    content: `
      <h3 class="text-xl font-semibold mb-4">Le rôle de l'agence immobilière</h3>
      
      <p class="text-muted-foreground mb-6">
        L'agence immobilière joue un rôle d'intermédiaire entre le propriétaire et le locataire. Elle apporte son expertise pour sécuriser les transactions et accompagner les deux parties.
      </p>
      
      <h4 class="font-semibold mb-3">Les obligations de l'agence</h4>
      
      <div class="grid md:grid-cols-2 gap-4 mb-6">
        <div class="bg-muted/50 p-4 rounded-lg">
          <h5 class="font-semibold mb-2">Vis-à-vis du propriétaire</h5>
          <ul class="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>Vérifier la solvabilité du candidat</li>
            <li>Assurer un suivi régulier du bien</li>
            <li>Rendre compte de la gestion</li>
            <li>Transmettre les paiements rapidement</li>
          </ul>
        </div>
        
        <div class="bg-muted/50 p-4 rounded-lg">
          <h5 class="font-semibold mb-2">Vis-à-vis du locataire</h5>
          <ul class="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>Présenter des annonces conformes à la réalité</li>
            <li>Organiser les visites</li>
            <li>Expliquer clairement les conditions du bail</li>
            <li>Assurer un suivi pendant la location</li>
          </ul>
        </div>
      </div>
      
      <h4 class="font-semibold mb-3">La commission de l'agence</h4>
      <p class="text-muted-foreground mb-4">
        Au Sénégal, la commission d'agence est généralement à la charge du locataire et représente généralement un mois de loyer hors charges (ou pourcentage équivalent). Cette commission couvre les frais de recherche, de visite et de constitution du dossier.
      </p>
      
      <div class="p-4 bg-accent/50 rounded-lg">
        <h4 class="font-semibold mb-2">🔑 Avec Seek, simplifiez la gestion</h4>
        <p class="text-muted-foreground text-sm">
          Seek propose aux agences un espace de gestion complet pour suivre leurs propriétaires, locataires et biens. Automatisez les rappels de paiement, gérez les documents et suivez votre comptabilité en temps réel.
        </p>
      </div>
    `
  }
];

const faqItems = [
  {
    question: "Quel est le montant moyen d'un loyer au Sénégal ?",
    answer: "Les loyers varient considérablement selon la localisation et le type de bien. À Dakar, comptez en moyenne 100 000 à 500 000 XOF pour un studio, 150 000 à 800 000 XOF pour un appartement T2/T3, et plus de 500 000 XOF pour des demeures spacieuses. Les prix sont généralement plus accessibles dans les régions comme Thiès, Saint-Louis ou Ziguinchor."
  },
  {
    question: "Faut-il signer un bail notarié ?",
    answer: "Au Sénégal, le bail peut être écrit sous seing privé (entre les parties) ou établi par un notaire. Le bail sous seing privé est courant et parfaitement valide. Cependant, pour plus de sécurité juridique, notamment pour les baux commerciaux ou de longue durée, il est recommandé de faire appel à un notaire."
  },
  {
    question: "Comment calculer le budget total pour une location ?",
    answer: "Le budget total comprend : le loyer mensuel, le dépôt de garantie (2-3 mois), la commission d'agence (généralement 1 mois), les frais d'état des lieux, et les premières charges (eau, électricité, éventuellement menage ou gardiennage). Prévoyez l'équivalent de 4 à 6 mois de loyer pour votre budget initial."
  },
  {
    question: "Puis-je résilier mon bail avant la fin du contrat ?",
    answer: "Généralement, le bail prévoit un préavis de 1 à 3 mois. Si vous partez avant l'échéance, vous pouvez être tenu de verser une indemnité de départ (souvent équivalente à 1 ou 2 mois de loyer). Vérifiez les clauses de votre contrat et négociez avec le propriétaire."
  },
  {
    question: "Le propriétaire peut-il augmenter le loyer en cours de bail ?",
    answer: "En principe, le loyer est fixe pendant la durée du bail. Toutefois, le contrat peut prévoir une clause de révision annuelle. Si aucune clause n'existe, le propriétaire ne peut augmenter le loyer qu'à la date de renouvellement du bail, avec un préavis raisonnable."
  },
  {
    question: "Que faire en cas de litige avec le propriétaire ?",
    answer: "En cas de litige, essayez d'abord de trouver une solution à l'amiable par le dialogue. Si cela échoue, vous pouvez faire appel à un médiateur ou saisir le tribunal d'instance. Conservez tous les documents (bail, reçus, photos, échanges écrits) pour constituer votre dossier."
  },
  {
    question: "Est-il obligatoire de souscrire une assurance habitation ?",
    answer: "Au Sénégal, l'assurance habitation n'est pas obligatoire par la loi pour les locataires, mais elle est fortement recommandée. Elle vous protège contre les risques d'incendie, de dégâts des eaux et de vol. Certains propriétaires l'exigent toutefois dans le bail."
  },
  {
    question: "Comment trouver une colocation au Sénégal ?",
    answer: "Plusieurs options s'offrent à vous : consulter les sites d'annonces comme Seek, regarder les groupes Facebook dédiés, contacter directement les agences immobilières, ou encore repérer les annonces dans les universités et grandes écoles. Vérifiez toujours l'identité du propriétaire et l'état du logement avant de vous engager."
  }
];

const GuidePage = () => {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-4">
              Guide de la location au Sénégal
            </h1>
            <p className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto">
              Tout ce que vous devez savoir pour louer en toute confiance : vos droits, vos devoirs et nos conseils pratiques.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation rapide */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {guideSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border hover:border-primary hover:text-primary transition-colors text-sm"
              >
                <section.icon className="w-4 h-4" />
                {section.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Guide principal */}
            <div id="guide-louer">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Guide : Comment louer au Sénégal</h2>
                  <p className="text-muted-foreground text-sm">Les étapes essentielles pour réussir votre location</p>
                </div>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6" dangerouslySetInnerHTML={{ __html: guideSections[0].content }} />
                </CardContent>
              </Card>
            </div>

            {/* Sections suivantes */}
            {guideSections.slice(1).map((section, index) => (
              <div key={section.id} id={section.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-primary' : index === 1 ? 'bg-primary' : index === 2 ? 'bg-primary' : 'bg-primary'
                  }`}>
                    <section.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">{section.title}</h2>
                    <p className="text-muted-foreground text-sm">Informations essentielles</p>
                  </div>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* FAQ */}
            <div id="faq">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold">Questions Fréquentes (FAQ)</h2>
                  <p className="text-muted-foreground text-sm">Les réponses aux questions les plus posées</p>
                </div>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left font-medium">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Prêt à trouver votre nouveau logement ?
          </h2>
          <p className="text-primary-foreground/60 max-w-xl mx-auto mb-8">
            Parcourez nos centaines d'annonces immobilières vérifiées et trouvez le bien qui vous correspond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/annonces">
              <Button size="lg" className="gap-2 px-8 bg-white text-primary hover:bg-white/90">
                Explorer les annonces
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/agency/register">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 px-8 border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
              >
                <Building2 className="w-4 h-4" />
                Créer mon espace agence
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuidePage;
