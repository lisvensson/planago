import { authClient } from "~/shared/auth/client";

export default function SignIn() {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-primary">
          Logga in
        </h1>
        <p className="mt-4 text-center text-sm text-primary/75">
          Logga in för att planera din nästa utflykt med Planago.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="mt-6 flex items-center">
          <div className="flex-grow min-w-[40px] border-t border-primary/30" />
          <span className="mx-2 text-sm text-primary/75 bg-background px-2 whitespace-nowrap">
            Logga in med
          </span>
          <div className="flex-grow min-w-[40px] border-t border-primary/30" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: "google",
                callbackURL: "/planago/skapa-resplan",
              })
            }
            className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-md border border-primary/30 bg-background px-3 py-2 text-sm font-semibold text-primary shadow hover:bg-primary/10"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Google
          </button>
          <button
            type="button"
            onClick={() =>
              authClient.signIn.social({
                provider: "microsoft",
                callbackURL: "/planago/skapa-resplan",
              })
            }
            className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-md border border-primary/30 bg-background px-3 py-2 text-sm font-semibold text-primary shadow hover:bg-primary/10"
          >
            <img
              src="https://www.svgrepo.com/show/452062/microsoft.svg"
              alt="Microsoft"
              className="h-5 w-5"
            />
            Microsoft
          </button>
        </div>
      </div>
    </main>
  );
}
