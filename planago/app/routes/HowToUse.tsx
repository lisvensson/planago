export default function HowToUse() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold text-accent">Planago</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
                Så fungerar Planago
              </p>
              <p className="mt-6 text-lg text-primary/75">
                Planago gör det enkelt att planera utflykter och resor. Du
                slipper lägga timmar på planering och får istället ett smidigt
                verktyg där du kan filtrera aktiviteter, bygga din egen resplan
                och snabbt få en tydlig översikt över dina äventyr.
              </p>

              <dl className="mt-10 max-w-xl space-y-8 text-base text-primary/75 lg:max-w-none">
                <div className="relative pl-9">
                  <dt className="block font-semibold text-primary">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="absolute top-1 left-1 size-5 text-accent"
                    >
                      <path d="M9 12.75l2.25 2.25L15 9.75m6.75 2.25a9.75 9.75 0 11-19.5 0 9.75 9.75 0 0119.5 0z" />
                    </svg>
                    Filtrera aktiviteter
                  </dt>
                  <dd className="mt-2">
                    Välj mellan olika kategorier och filter för att snabbt hitta
                    utflykter som passar just dig.
                  </dd>
                </div>

                <div className="relative pl-9">
                  <dt className="block font-semibold text-primary">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="absolute top-1 left-1 size-5 text-accent"
                    >
                      <path d="M17.593 3.322a1.125 1.125 0 011.657.99v15.376a.75.75 0 01-1.133.65L12 17.25l-6.117 3.088a.75.75 0 01-1.133-.65V4.312a1.125 1.125 0 011.657-.99l6.493 3.246 6.493-3.246z" />
                    </svg>
                    Spara din plan
                  </dt>
                  <dd className="mt-2">
                    Spara dina resplaner i ditt konto och kom tillbaka till dem
                    när du vill. Perfekt för att förbereda framtida äventyr.
                  </dd>
                </div>

                <div className="relative pl-9">
                  <dt className="block font-semibold text-primary">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="absolute top-1 left-1 size-5 text-accent"
                    >
                      <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Snabb planering
                  </dt>
                  <dd className="mt-2">
                    Med Planago får du en färdig plan på några minuter – så du
                    kan fokusera på att njuta av din utflykt istället för att
                    fastna i planeringen.
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* TODO: Uppdatera med passande bild */}
          <img
            width="2432"
            height="1442"
            src="https://tailwindcss.com/plus-assets/img/component-images/project-app-screenshot.png"
            alt="Planago skärmbild"
            className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-primary/10 sm:w-228 md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  );
}
