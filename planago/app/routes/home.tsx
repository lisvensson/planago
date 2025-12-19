import img from "../assets/home-img.png";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden blur-2xl transform-gpu">
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="absolute left-1/2 top-0 h-[36rem] w-[72rem] -translate-x-1/2 rotate-30 bg-gradient-to-tr from-accent to-primary opacity-20"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
          <div className="lg:pr-8">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-primary mb-6 text-left">
              Planera dina äventyr med Planago
            </h1>
            <p className="mt-4 text-lg font-medium text-primary/75 sm:text-xl text-left">
              Upptäck hur enkelt det är att skapa utflykter och resor som passar
              just dig. Med Planago får du inspiration, struktur och frihet att
              planera på ditt sätt.
            </p>
            <div className="mt-10 flex items-center justify-start gap-x-6">
              <a
                href="/planago/filter"
                className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Börja planera din nästa utflykt
              </a>
              <a
                href="/how-to-use"
                className="text-sm font-semibold text-accent hover:text-accent/80"
              >
                Hur fungerar Planago? →
              </a>
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

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden blur-2xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="absolute left-1/2 bottom-0 h-[36rem] w-[72rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-accent opacity-20"
        />
      </div>
    </main>
  );
}
