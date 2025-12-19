import img from "../assets/about-img.png";

export default function About() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <p className="mt-2 text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
                Bakgrunden till Planago
              </p>
              <p className="mt-6 text-lg text-primary/75">
                Den här sidan är en del av ett examensarbete där idén för
                Planago växte fram. Jag alltid gillat att planera resor och
                aktiviteter i detalj men upplevt att det är tidskrävande och
                kräver mycket research. Därför kom tanken om att skapa en
                webbaserad applikation som automatiskt kan generera personliga
                dagsplaner baserat på användarens preferenser.
              </p>
              <p className="mt-6 text-lg text-primary/75">
                Målet är att göra det enklare och roligare att hitta relevanta
                aktiviteter, oavsett om det handlar om en helgutflykt, en resa
                till en ny stad eller inspiration för något att göra i sin egen
                hemstad. Planago är tänkt att spara tid och ge struktur så att
                användaren kan fokusera på själva upplevelsen istället för
                planeringen.
              </p>
            </div>
          </div>
          <div className="relative overflow-hidden">
            <img
              width="2432"
              height="1442"
              src={img}
              alt="Planago skärmbild"
              className="w-3xl max-w-none sm:w-228 lg:ml-25"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
