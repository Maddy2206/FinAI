import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">FinAI</h1>
          <p className="text-muted-foreground mt-1">Smart money management</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
