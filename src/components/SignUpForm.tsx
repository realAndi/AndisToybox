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
  import { useRouter } from "next/navigation";
  
  export function SignUpForm() {
    const router = useRouter();
  
    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
  
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const inviteCode = formData.get("inviteCode") as string;
  
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, inviteCode }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Registration successful. Please log in.");
        router.push("/"); // Redirect to home for login
      } else {
        alert(`Registration failed: ${data.error}`);
      }
    };
  
    return (
      <DialogContent className="sm:max-w-[425px] bg-black">
        <DialogHeader>
          <DialogTitle>Create an Account</DialogTitle>
          <DialogDescription>
            Enter your details below to sign up.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSignUp} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input name="name" type="text" placeholder="Your full name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              name="password"
              type="password"
              placeholder="Create a password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code</Label>
            <Input
              name="inviteCode"
              type="text"
              placeholder="Enter your invite code"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">
              Sign Up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    );
  }