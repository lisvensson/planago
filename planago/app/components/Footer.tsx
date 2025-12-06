import logo from "../assets/planago-logo-white.svg";

export default function Footer() {
  return (
    <footer className="bg-primary/70 text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse items-center justify-between py-6 sm:flex-row">
          <div className="flex items-center space-x-3">
            <a
              href="/"
              className="flex items-center hover:text-accent transition-colors"
            >
              <img
                src={logo}
                alt="Planago logo"
                className="h-14 w-auto object-contain sm:h-16"
              />
              <span className="sr-only">Planago</span>
            </a>
          </div>

          <p className="mt-4 text-sm sm:mt-0">
            &copy; 2025 Planago. Alla rättigheter förbehållna.
          </p>
        </div>
      </div>
    </footer>
  );
}
