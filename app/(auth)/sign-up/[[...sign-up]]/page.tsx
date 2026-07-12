import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { AuthScreen } from "@/components/auth/AuthScreen";

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ "sign-up"?: string[] }>;
}) {
  const resolved = await params;
  const segments = resolved["sign-up"];

  if (segments?.[0] === "sso-callback") {
    return (
      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      />
    );
  }

  return <AuthScreen initialMode="signup" />;
}
