export default function PrivacyPolicy() {
  return (
    <main className="flex-grow bg-background justify-center items-center px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="lg:pt-4 lg:pr-8">
          <div className="w-full">
            <h2 className="text-sm sm:text-base font-semibold text-accent sm:text-left">
              Planago
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-primary sm:text-left">
              Integritetspolicy
            </p>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-primary/75 sm:text-left">
              Vi värnar om din integritet. Den här policyn förklarar hur vi
              hanterar dina uppgifter när du använder Planago.
            </p>

            <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8 text-sm sm:text-base text-primary/75">
              <section>
                <h3 className="font-semibold text-primary">Inloggning</h3>
                <p className="mt-1 sm:mt-2">
                  Vi använder tredjepartsinloggning (Google eller Discord) för
                  att autentisera dig. Vi sparar endast den information som
                  krävs för att du ska kunna logga in och använda tjänsten.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-primary">Datahantering</h3>
                <p className="mt-1 sm:mt-2">
                  Dina resplaner lagras i vår databas och är kopplade till ditt
                  konto. Vi delar aldrig dina personliga uppgifter med tredje
                  part.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-primary">Cookies</h3>
                <p className="mt-1 sm:mt-2">
                  Planago kan använda cookies för att förbättra
                  användarupplevelsen, till exempel för sessionshantering.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-primary">Rättigheter</h3>
                <p className="mt-1 sm:mt-2">
                  Du har rätt att begära att vi raderar dina uppgifter. Kontakta
                  oss om du vill avsluta ditt konto.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-primary">Ändringar</h3>
                <p className="mt-1 sm:mt-2">
                  Vi kan uppdatera denna policy vid behov. Fortsatt användning
                  av Planago innebär att du accepterar den nya policyn.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
