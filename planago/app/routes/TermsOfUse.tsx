export default function TermsOfUse() {
  return (
    <main className="flex-grow bg-background justify-center items-center px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="lg:pt-4 lg:pr-8">
          <div className="w-full">
            <h2 className="text-sm sm:text-base font-semibold text-accent sm:text-left">
              Planago
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary sm:text-left">
              Användarvillkor
            </p>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-primary/75 sm:text-left">
              Genom att använda Planago godkänner du följande villkor. Vi vill
              att du ska känna dig trygg och förstå hur tjänsten fungerar.
            </p>

            <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8 text-sm sm:text-base text-primary/75">
              <section>
                <h3 className="font-semibold text-primary">Syfte</h3>
                <p className="mt-1 sm:mt-2">
                  Planago är en tjänst för att skapa, spara och hantera
                  personliga resplaner.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-primary">Ansvar</h3>
                <p className="mt-1 sm:mt-2">
                  Vi strävar efter att tjänsten ska fungera stabilt, men vi kan
                  inte garantera att all information alltid är korrekt eller att
                  tjänsten är tillgänglig utan avbrott.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-primary">Användning</h3>
                <p className="mt-1 sm:mt-2">
                  Du får endast använda Planago för personligt bruk. Missbruk,
                  försök till intrång eller användning som strider mot lag är
                  förbjudet.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-primary">Ändringar</h3>
                <p className="mt-1 sm:mt-2">
                  Vi kan uppdatera dessa villkor vid behov. Fortsatt användning
                  av Planago innebär att du accepterar de nya villkoren.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
