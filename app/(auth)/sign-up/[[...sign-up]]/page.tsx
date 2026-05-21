import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">FinAI</h1>
          <p className="text-muted-foreground mt-1">Start your smart finance journey</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
