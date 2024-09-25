import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      alert("Invalid credentials");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] bg-black">
      <DialogHeader>
        <DialogTitle>Login</DialogTitle>
        <DialogDescription>
          Enter your email and password to login.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSignIn} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input name="password" type="password" placeholder="Your password" required />
        </div>
        <DialogFooter>
          <Button type="submit">
            Login
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}