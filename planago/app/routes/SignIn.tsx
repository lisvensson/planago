import { authClient } from "~/shared/auth/client";

export default function SignIn() {
  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-background">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-primary">
          Logga in
        </h1>

        <p className="mt-4 text-center text-sm text-primary/75">
          För att planera din utflykt måste du vara inloggad
        </p>

        <div className="mt-6 space-y-4">
          <button
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/",
              })
            }
            className="w-full inline-flex items-center justify-center gap-x-2 rounded-md bg-primary px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors"
          >
            <i className="fa-brands fa-google text-primary-foreground"></i>
            <span>Logga in med Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
