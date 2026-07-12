import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ "sign-in"?: string[] }>;
}) {
  const resolved = await params;
  const segments = resolved["sign-in"];

  if (segments?.[0] === "sso-callback") {
    return (
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      />
    );
  }

  return <AuthScreen initialMode="signin" />;
}
