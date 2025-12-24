import { authClient } from "~/shared/auth/client";
import logo from "../assets/planago-logo-brown.svg";

export default function SignIn() {
  return (
    <main className="flex flex-col flex-grow justify-start items-center px-6 py-12 pt-24 bg-background">
      <div className="w-full max-w-md bg-background border border-primary/10 rounded-2xl shadow-sm p-10 space-y-10">
        <div className="flex justify-center">
          <img
            src={logo}
            alt="Planago-logo"
            className="h-14 sm:h-16 md:h-20 w-auto opacity-90"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-center text-3xl font-bold text-primary">
            Logga in
          </h1>
          <p className="text-center text-primary/70 text-sm leading-relaxed">
            För att få tillgång till dina sparade resplaner och skapa nya
            resplaner med Planago behöver du vara inloggad.
          </p>
        </div>

        <div className="flex items-center">
          <div className="flex-grow h-px bg-primary/20" />
          <span className="mx-4 text-sm text-primary/70">
            Välj inloggningsmetod
          </span>
          <div className="flex-grow h-px bg-primary/20" />
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/planago/skapa-resplan",
              })
            }
            className="flex w-full justify-center items-center gap-3 rounded-xl border border-primary/20 bg-background px-5 py-4 text-sm font-semibold text-primary shadow-sm hover:bg-primary/10 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Fortsätt med Google
          </button>

          <button
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: "discord",
                callbackURL: "/planago/skapa-resplan",
              })
            }
            className="flex w-full justify-center items-center gap-3 rounded-xl border border-primary/20 bg-background px-5 py-4 text-sm font-semibold text-primary shadow-sm hover:bg-primary/10 transition"
          >
            <img
              src="https://www.svgrepo.com/show/353655/discord-icon.svg"
              alt="Discord"
              className="h-5 w-5"
            />
            Fortsätt med Discord
          </button>
        </div>

        <p className="text-xs text-primary/60 text-center mt-8 leading-relaxed">
          Genom att logga in godkänner du våra{" "}
          <a
            href="/anvandarvillkor"
            className="underline hover:text-primary transition"
          >
            Användarvillkor
          </a>{" "}
          och{" "}
          <a
            href="/integritetspolicy"
            className="underline hover:text-primary transition"
          >
            Integritetspolicy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
