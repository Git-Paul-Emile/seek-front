import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Bed, Bath, Maximize, MapPin, Star, Users, Sofa, Calendar,
  Building2, ShieldCheck, ShoppingCart, GraduationCap, Eye, Phone, Mail,
  Lock, Info, CheckCircle, XCircle, Droplets, Zap, Wifi, Snowflake,
  MessageCircle, ChevronLeft, ChevronRight, Pause, Play, Home, User,
  Briefcase, GraduationCap as GradIcon, Coffee, Tv, UtensilsCrossed,
  MessageSquare, PhoneCall, Clock, Check
} from "lucide-react";
import { Property, formatPrice, typeLabels, rentalModeLabels, equipmentLabels, contractTypeLabels, chargeTypeLabels, mockProperties, roomStatusLabels, targetProfileLabels, formatRoomPrice } from "@/data/properties";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/properties/PropertyCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PropertyAnnounceDetailProps {
  property: Property;
  ownerPhone?: string;
  ownerWhatsapp?: string;
  ownerEmail?: string;
}

const PropertyAnnounceDetail = ({ property, ownerPhone, ownerWhatsapp, ownerEmail }: PropertyAnnounceDetailProps) => {
  const [activeImage, setActiveImage] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showVisitRequest, setShowVisitRequest] = useState(false);
  const [visitRequestStep, setVisitRequestStep] = useState<1 | 2 | 3>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: `Bonjour, je suis intéressé(e) par l'annonce "${property.title}" située ${property.location.neighborhood}, ${property.location.city}. Merci de me contacter pour plus d'informations.`,
  });
  const [visitFormData, setVisitFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    timeSlot: "",
    message: "",
  });
  const [visitConfirmation, setVisitConfirmation] = useState(false);
  const [contactMethod, setContactMethod] = useState<"form" | "whatsapp" | "phone">("form");

  const allImages = [property.coverImage, ...property.images];
  const totalImages = allImages.length;

  // Auto-scroll
  useEffect(() => {
    if (!isAutoPlaying || totalImages <= 1) return;

    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % totalImages);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalImages]);

  const nextImage = useCallback(() => {
    setActiveImage((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const prevImage = useCallback(() => {
    setActiveImage((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  const goToImage = useCallback((index: number) => {
    setActiveImage(index);
  }, []);

  const similar = mockProperties
    .filter((p) => p.id !== property.id && (p.type === property.type || p.location.city === property.location.city))
    .slice(0, 3);

  const proximityItems = [
    { icon: Building2, label: "Hôpital", value: property.proximity.hospital },
    { icon: ShieldCheck, label: "Poste de police", value: property.proximity.police },
    { icon: ShoppingCart, label: "Supermarché", value: property.proximity.supermarket },
    { icon: GraduationCap, label: "École", value: property.proximity.school },
  ];

  const equipmentIcons: Record<string, React.ReactNode> = {
    climatisation: <Snowflake className="w-4 h-4 text-blue-500" />,
    ventilateur: <div className="w-4 h-4 flex items-center justify-center">🌀</div>,
    eau: <Droplets className="w-4 h-4 text-blue-600" />,
    electricite: <Zap className="w-4 h-4 text-yellow-500" />,
    internet: <Wifi className="w-4 h-4 text-green-500" />,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR").format(amount);
  };

  // Handle WhatsApp redirect
  const handleWhatsApp = () => {
    const phone = ownerWhatsapp || ownerPhone;
    if (!phone) return;
    
    const cleanPhone = phone.replace(/\+/g, "").replace(/\s/g, "");
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par l'annonce "${property.title}" sur SEEK.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  // Handle phone call
  const handlePhoneCall = () => {
    const phone = ownerPhone;
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'envoi du formulaire (à connecter avec le backend)
    console.log("Formulaire de contact envoyé:", contactFormData);
    alert("Votre message a été envoyé avec succès ! Le propriétaire vous contactera sous peu.");
    setShowContactForm(false);
  };

  // Handle visit request submission
  const handleVisitRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Demande de visite envoyée:", visitFormData);
    setVisitConfirmation(true);
  };

  // Reset visit form
  const resetVisitForm = () => {
    setShowVisitRequest(false);
    setVisitRequestStep(1);
    setVisitFormData({
      name: "",
      phone: "",
      email: "",
      date: "",
      timeSlot: "",
      message: "",
    });
    setVisitConfirmation(false);
  };

  // Get available dates (next 14 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  // Time slots
  const timeSlots = [
    { id: "09:00-10:00", label: "09:00 - 10:00" },
    { id: "10:00-11:00", label: "10:00 - 11:00" },
    { id: "11:00-12:00", label: "11:00 - 12:00" },
    { id: "14:00-15:00", label: "14:00 - 15:00" },
    { id: "15:00-16:00", label: "15:00 - 16:00" },
    { id: "16:00-17:00", label: "16:00 - 17:00" },
    { id: "17:00-18:00", label: "17:00 - 18:00" },
  ];

  const formatAvailability = () => {
    if (!property.availableFrom) return "Disponible immédiatement";
    const date = new Date(property.availableFrom);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date <= today) {
      return "Disponible immédiatement";
    }
    
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
    return `Disponible à partir du ${date.toLocaleDateString("fr-FR", options)}`;
  };

  const renderChargeInfo = () => {
    if (!property.charges) return null;
    
    const chargeLabel = chargeTypeLabels[property.charges.type];
    
    if (property.charges.type === "compris") {
      return (
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">{chargeLabel}</span>
        </div>
      );
    }
    
    if (property.charges.amount) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-700">
            <Info className="w-5 h-5" />
            <span className="font-medium">{chargeLabel}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Charges mensuelles estimées: {formatCurrency(property.charges.amount)} FCFA
          </p>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-amber-700">
        <Info className="w-5 h-5" />
        <span className="font-medium">{chargeLabel}</span>
      </div>
    );
  };

  const renderSecurityInfo = () => (
    <div className="bg-muted/50 rounded-lg p-4 border border-border">
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="font-medium text-sm">Sécurité & Confidentialité</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              L'adresse exacte vous sera communiquée après contact
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Contact direct après votre demande
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Visit Request Dialog Component
  const VisitRequestDialog = () => (
    <Dialog open={showVisitRequest} onOpenChange={resetVisitForm}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Demander une visite
          </DialogTitle>
          <DialogDescription>
            Planifiez votre visite du bien "{property.title}"
          </DialogDescription>
        </DialogHeader>

        {visitConfirmation ? (
          // Confirmation View
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Demande de visite envoyée !</h3>
            <p className="text-muted-foreground">
              Votre visite est prévue le {new Date(visitFormData.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} de {visitFormData.timeSlot.replace("-", " à ")}.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                📱 Vous recevrez une confirmation par SMS/WhatsApp au {visitFormData.phone}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Le propriétaire vous contactera pour confirmer votre créneau.
            </p>
            <Button onClick={resetVisitForm} className="w-full mt-4">
              Fermer
            </Button>
          </motion.div>
        ) : (
          // Multi-step Form
          <form onSubmit={handleVisitRequestSubmit} className="space-y-4">
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    visitRequestStep === step
                      ? "bg-primary text-primary-foreground"
                      : visitRequestStep > step
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {visitRequestStep > step ? <Check className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>

            {/* Step 1: Date & Time */}
            {visitRequestStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Sélectionnez une date *</Label>
                  <select
                    className="w-full p-2 border border-border rounded-md"
                    value={visitFormData.date}
                    onChange={(e) => setVisitFormData({ ...visitFormData, date: e.target.value })}
                    required
                  >
                    <option value="">Choisir une date...</option>
                    {getAvailableDates().map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Créneau horaire *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        className={`p-2 rounded-md border text-sm transition-colors ${
                          visitFormData.timeSlot === slot.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setVisitFormData({ ...visitFormData, timeSlot: slot.id })}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  disabled={!visitFormData.date || !visitFormData.timeSlot}
                  onClick={() => setVisitRequestStep(2)}
                >
                  Suivant
                </Button>
              </motion.div>
            )}

            {/* Step 2: Contact Info */}
            {visitRequestStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <Label htmlFor="visit-name" className="text-sm font-medium mb-1 block">Votre nom *</Label>
                  <Input
                    id="visit-name"
                    type="text"
                    placeholder="Entrez votre nom"
                    value={visitFormData.name}
                    onChange={(e) => setVisitFormData({ ...visitFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="visit-phone" className="text-sm font-medium mb-1 block">
                    Numéro de téléphone *
                    <span className="text-xs text-muted-foreground ml-2">(pour SMS/WhatsApp)</span>
                  </Label>
                  <Input
                    id="visit-phone"
                    type="tel"
                    placeholder="+221 XX XXX XX XX"
                    value={visitFormData.phone}
                    onChange={(e) => setVisitFormData({ ...visitFormData, phone: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="visit-email" className="text-sm font-medium mb-1 block">Email</Label>
                  <Input
                    id="visit-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={visitFormData.email}
                    onChange={(e) => setVisitFormData({ ...visitFormData, email: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setVisitRequestStep(1)}>
                    Retour
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={!visitFormData.name || !visitFormData.phone}
                    onClick={() => setVisitRequestStep(3)}
                  >
                    Suivant
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {visitRequestStep === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <h4 className="font-medium">Récapitulatif de votre visite</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>
                        {new Date(visitFormData.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{visitFormData.timeSlot.replace("-", " à ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>{visitFormData.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{visitFormData.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="visit-message" className="text-sm font-medium mb-1 block">Message (optionnel)</Label>
                  <Textarea
                    id="visit-message"
                    placeholder="Ajoutez un message pour le propriétaire..."
                    value={visitFormData.message}
                    onChange={(e) => setVisitFormData({ ...visitFormData, message: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>Vous recevrez la confirmation par SMS/WhatsApp</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setVisitRequestStep(2)}>
                    Retour
                  </Button>
                  <Button type="submit" className="flex-1">
                    Confirmer la demande
                  </Button>
                </div>
              </motion.div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Back */}
        <Link to="/annonces" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux annonces
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image with Carousel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-lg overflow-hidden group"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={allImages[activeImage]}
                  alt={`Photo ${activeImage + 1}`}
                  className="w-full h-[400px] md:h-[500px] object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Auto-play Control */}
              {totalImages > 1 && (
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                  aria-label={isAutoPlaying ? "Pause" : "Lecture automatique"}
                >
                  {isAutoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              )}

              {/* Image Counter */}
              {totalImages > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                  {activeImage + 1} / {totalImages}
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {totalImages > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 mt-4">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      index === activeImage
                        ? "border-primary opacity-100"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Miniature ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-secondary text-secondary-foreground">{typeLabels[property.type]}</Badge>
                {property.rentalMode === "colocation" && (
                  <Badge className="bg-primary text-primary-foreground gap-1">
                    <Users className="w-3 h-3" /> Colocation
                  </Badge>
                )}
                {property.featured && (
                  <Badge className="bg-featured text-featured-foreground gap-1">
                    <Star className="w-3 h-3" /> Vedette
                  </Badge>
                )}
                <Badge variant="outline">{property.status === "libre" ? "Disponible" : property.status}</Badge>
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">{property.title}</h1>

              {/* Approximate Location - No exact address */}
              <div className="flex items-center gap-1.5 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4 text-primary" />
                <span>
                  {property.location.neighborhood}, {property.location.city}
                </span>
                <Badge variant="secondary" className="text-xs ml-2 gap-1">
                  <Info className="w-3 h-3" />
                  Quartier
                </Badge>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(property.price, property.status, property.rentalMode)}
                </p>
                {property.rentalMode !== "colocation" && property.charges?.type !== "compris" && (
                  <span className="text-sm text-muted-foreground">
                    + charges
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              {property.type !== "terrain" && property.type !== "bureau" && (
                <div className="flex gap-6 mb-6 p-4 bg-muted rounded-lg">
                  {property.bedrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.bedrooms}</p>
                        <p className="text-xs text-muted-foreground">Chambre{property.bedrooms > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.bathrooms}</p>
                        <p className="text-xs text-muted-foreground">SDB</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{property.area} m²</p>
                      <p className="text-xs text-muted-foreground">Surface</p>
                    </div>
                  </div>
                  {property.furnished !== undefined && (
                    <div className="flex items-center gap-2">
                      <Sofa className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.furnished ? "Meublé" : "Non meublé"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Colocation Details - Chambres disponibles, Parties communes, Profil recherché */}
            {property.rentalMode === "colocation" && (
              <div className="space-y-6">
                {/* Target Profile */}
                {property.colocationRules?.targetProfile && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      Profil recherché
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {targetProfileLabels[property.colocationRules.targetProfile]}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Available Rooms */}
                {(property.rooms && property.rooms.length > 0) ? (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                      <Bed className="w-5 h-5 text-primary" />
                      Chambres disponibles ({property.rooms.filter(r => r.status === "libre").length}/{property.rooms.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {property.rooms.map((room) => (
                        <div 
                          key={room.id} 
                          className={`p-4 rounded-lg border transition-colors ${
                            room.status === "libre" 
                              ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" 
                              : "bg-muted/50 border-border"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{room.name}</p>
                              <p className="text-sm text-muted-foreground">{room.area} m²</p>
                            </div>
                            <Badge variant={room.status === "libre" ? "default" : "secondary"}>
                              {roomStatusLabels[room.status]}
                            </Badge>
                          </div>
                          <p className="font-bold text-lg text-primary">{formatRoomPrice(room.price)}</p>
                          {room.description && (
                            <p className="text-sm text-muted-foreground mt-2">{room.description}</p>
                          )}
                          {room.equipment && room.equipment.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {room.equipment.slice(0, 3).map((eq, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {equipmentLabels[eq]}
                                </Badge>
                              ))}
                              {room.equipment.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{room.equipment.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Fallback for properties without rooms array
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-primary" />
                      <span className="font-medium">
                        {property.bedrooms} chambre{property.bedrooms > 1 ? "s" : ""} disponible{property.bedrooms > 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Prix par chambre: {formatPrice(property.price, property.status, property.rentalMode)}
                    </p>
                  </div>
                )}

                {/* Common Areas */}
                {property.commonAreas && property.commonAreas.length > 0 && (
                  <div>
                    <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                      <Home className="w-5 h-5 text-primary" />
                      Parties communes
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.commonAreas.map((area, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg"
                        >
                          <Coffee className="w-4 h-4 text-primary" />
                          <span className="text-sm">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            {/* Key Features */}
            {property.keyFeatures && property.keyFeatures.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">Points forts</h2>
                <div className="grid grid-cols-2 gap-3">
                  {property.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {property.equipment && property.equipment.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">Équipements</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.equipment.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg"
                    >
                      {equipmentIcons[item] || null}
                      <span className="text-sm">{equipmentLabels[item]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Details */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-3">Informations financières</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Security Deposit */}
                {property.securityDeposit && (
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Caution demandée</p>
                    <p className="font-bold text-lg">{formatCurrency(property.securityDeposit)} FCFA</p>
                    <p className="text-xs text-muted-foreground"> Généralement 1 à 3 mois de loyer</p>
                  </div>
                )}

                {/* Charges */}
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Charges</p>
                  {renderChargeInfo()}
                </div>

                {/* Contract Type */}
                {property.contractType && (
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Type de contrat</p>
                    <p className="font-medium">{contractTypeLabels[property.contractType]}</p>
                  </div>
                )}

                {/* Minimum Stay */}
                {property.minStayMonths && (
                  <div className="p-4 bg-card border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Durée minimum</p>
                    <p className="font-medium">
                      {property.minStayMonths === 1 ? "1 mois" : `${property.minStayMonths} mois`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-3">Disponibilité</h2>
              <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{formatAvailability()}</span>
              </div>
            </div>

            {/* Colocation Rules */}
            {property.rentalMode === "colocation" && property.colocationRules && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">Règles de colocation</h2>
                <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                  {/* Gender Preference */}
                  {property.colocationRules.genderPreference && (
                    <div>
                      <p className="text-sm font-medium mb-2">Préférence de genre</p>
                      <Badge variant="outline">
                        {property.colocationRules.genderPreference === "mixte" ? "Mixte" :
                         property.colocationRules.genderPreference === "femme" ? "Femmes uniquement" :
                         "Hommes uniquement"}
                      </Badge>
                    </div>
                  )}

                  {/* Pets & Smoking */}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      {property.colocationRules.petsAllowed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">Animaux autorisés</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {property.colocationRules.smokingAllowed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm">Fumeurs acceptés</span>
                    </div>
                  </div>

                  {/* Allowed */}
                  {property.colocationRules.allowed && property.colocationRules.allowed.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-green-700">✓ Autorisé</p>
                      <ul className="space-y-1">
                        {property.colocationRules.allowed.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Forbidden */}
                  {property.colocationRules.forbidden && property.colocationRules.forbidden.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-red-700">✗ Interdit</p>
                      <ul className="space-y-1">
                        {property.colocationRules.forbidden.map((item, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Noise Rules */}
                  {property.colocationRules.noiseRules && (
                    <div>
                      <p className="text-sm font-medium mb-1">Quiet hours</p>
                      <p className="text-sm text-muted-foreground">{property.colocationRules.noiseRules}</p>
                    </div>
                  )}

                  {/* Visitor Rules */}
                  {property.colocationRules.visitorRules && (
                    <div>
                      <p className="text-sm font-medium mb-1">Visiteurs</p>
                      <p className="text-sm text-muted-foreground">{property.colocationRules.visitorRules}</p>
                    </div>
                  )}

                  {/* Cleaning Schedule */}
                  {property.colocationRules.cleaningSchedule && (
                    <div>
                      <p className="text-sm font-medium mb-1">Nettoyage</p>
                      <p className="text-sm text-muted-foreground">{property.colocationRules.cleaningSchedule}</p>
                    </div>
                  )}

                  {/* Common Space Rules */}
                  {property.colocationRules.commonSpaceRules && (
                    <div>
                      <p className="text-sm font-medium mb-1">Espaces communs</p>
                      <p className="text-sm text-muted-foreground">{property.colocationRules.commonSpaceRules}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proximity */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">À proximité</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {proximityItems.map((item) => (
                  <div key={item.label} className="bg-card border border-border rounded-lg p-4 text-center">
                    <item.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-semibold">{item.value} km</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Contact Card - SECURE */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Contacter le propriétaire / agence
              </h3>

              {/* Contact Methods */}
              <AnimatePresence mode="wait">
                {showContactForm ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Contact Method Tabs */}
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant={contactMethod === "form" ? "default" : "outline"}
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => setContactMethod("form")}
                      >
                        <MessageCircle className="w-4 h-4" /> Message
                      </Button>
                      {ownerWhatsapp && (
                        <Button
                          variant={contactMethod === "whatsapp" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 gap-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
                          onClick={() => setContactMethod("whatsapp")}
                        >
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </Button>
                      )}
                      {ownerPhone && (
                        <Button
                          variant={contactMethod === "phone" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 gap-1"
                          onClick={() => setContactMethod("phone")}
                        >
                          <PhoneCall className="w-4 h-4" /> Appeler
                        </Button>
                      )}
                    </div>

                    {/* Message Form */}
                    {contactMethod === "form" && (
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Votre nom *</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="Entrez votre nom"
                            value={contactFormData.name}
                            onChange={(e) => setContactFormData({...contactFormData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Téléphone</label>
                          <input
                            type="tel"
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="+221 XX XXX XX XX"
                            value={contactFormData.phone}
                            onChange={(e) => setContactFormData({...contactFormData, phone: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email *</label>
                          <input
                            type="email"
                            className="w-full p-2 border border-border rounded-md"
                            placeholder="votre@email.com"
                            value={contactFormData.email}
                            onChange={(e) => setContactFormData({...contactFormData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Message *</label>
                          <textarea
                            className="w-full p-2 border border-border rounded-md h-24 resize-none"
                            placeholder="Je suis intéressé(e) par cette annonce..."
                            value={contactFormData.message}
                            onChange={(e) => setContactFormData({...contactFormData, message: e.target.value})}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full gap-2" size="lg">
                          <MessageSquare className="w-4 h-4" /> Envoyer ma demande
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={() => setShowContactForm(false)}
                        >
                          Annuler
                        </Button>
                      </form>
                    )}

                    {/* WhatsApp */}
                    {contactMethod === "whatsapp" && ownerWhatsapp && (
                      <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-400">Contacter via WhatsApp</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Vous allez être redirigé vers WhatsApp pour envoyer un message au propriétaire.
                          </p>
                          <Button
                            className="w-full gap-2 bg-green-600 hover:bg-green-700"
                            size="lg"
                            onClick={handleWhatsApp}
                          >
                            <MessageCircle className="w-4 h-4" /> Ouvrir WhatsApp
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setContactMethod("form")}
                        >
                          Retour au formulaire
                        </Button>
                      </div>
                    )}

                    {/* Phone Call */}
                    {contactMethod === "phone" && ownerPhone && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <PhoneCall className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-700 dark:text-blue-400">Appeler directement</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Le propriétaire vous répondra pendant les heures ouvrables.
                          </p>
                          <Button
                            className="w-full gap-2"
                            size="lg"
                            onClick={handlePhoneCall}
                          >
                            <PhoneCall className="w-4 h-4" /> {ownerPhone}
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setContactMethod("form")}
                        >
                          Retour au formulaire
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Security Info */}
                    {renderSecurityInfo()}

                    {/* Main Contact Button */}
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={() => setShowContactForm(true)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contacter
                    </Button>

                    {/* Visit Request Button */}
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      size="lg"
                      onClick={() => setShowVisitRequest(true)}
                    >
                      <Calendar className="w-4 h-4" />
                      Demander une visite
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      L'adresse exacte vous sera communiquée après votre demande
                    </p>

                    {/* Alternative Contact Options */}
                    {(ownerWhatsapp || ownerPhone) && (
                      <>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                              Autres moyens de contact
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {ownerWhatsapp && (
                            <Button
                              variant="outline"
                              className="gap-2 bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                              onClick={() => {
                                setContactMethod("whatsapp");
                                setShowContactForm(true);
                              }}
                            >
                              <MessageCircle className="w-4 h-4" /> WhatsApp
                            </Button>
                          )}
                          {ownerPhone && (
                            <Button
                              variant="outline"
                              className="gap-2"
                              onClick={() => {
                                setContactMethod("phone");
                                setShowContactForm(true);
                              }}
                            >
                              <PhoneCall className="w-4 h-4" /> Appeler
                            </Button>
                          )}
                        </div>
                      </>
                    )}

                    {/* Hidden contact info - only visible after action */}
                    <div className="space-y-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer rounded-lg p-3 bg-muted/30">
                      <p className="text-xs text-center text-muted-foreground mb-2">
                        Contact après demande
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="blur-sm select-none">{ownerPhone || "+221 XX XXX XX XX"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="blur-sm select-none">{ownerEmail || "contact@email.com"}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
                <p>Annonce publiée le {new Date(property.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-6">Annonces similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visit Request Dialog */}
      <VisitRequestDialog />
    </div>
  );
};

export default PropertyAnnounceDetail;
