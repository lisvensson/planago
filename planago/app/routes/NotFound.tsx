export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center relative px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-accent">404</p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-primary sm:text-7xl">
          Sidan kunde inte hittas
        </h1>
        <p className="mt-6 text-lg font-medium text-gray-600 sm:text-xl">
          Sidan du söker finns inte eller har flyttats.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Gå tillbaka till startsidan
          </a>
        </div>
      </div>
    </main>
  );
}
