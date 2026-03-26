import { useEffect } from "react";

const FeedbackForm = () => {
  useEffect(() => {
    // Charger le script Visme
    const script = document.createElement("script");
    script.src = "https://static-bundles.visme.co/forms/vismeforms-embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Nettoyer le script lors du démontage
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="py-12 bg-white bg-fixed">
      <div className="container mx-auto px-8">
        <div className="text-center">
          <p className="text-[#D4A843] font-semibold text-xs uppercase tracking-widest mb-1">
            Feedback
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0C1A35]">
            Donner votre avis
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div
            className="visme_d"
            data-title="Feedback"
            data-url="g0ogvp6x-feedback"
            data-domain="forms"
            data-full-page="false"
            data-min-height="300px"
            data-form-id="170941"
          />
        </div>
      </div>
    </section>
  );
};

export default FeedbackForm;
