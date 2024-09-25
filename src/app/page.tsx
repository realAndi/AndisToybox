"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; 
import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";
import { SignUpForm } from "@/components/SignUpForm";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 p-6 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <h1 className="text-5xl font-bold mb-4">Andi's Toys</h1>
        <p className="text-lg mb-8">
          A private dashboard where your data is encrypted.
        </p>
        <div className="space-x-4">
          {/* Login Button */}
          <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Login</Button>
            </DialogTrigger>
            <LoginForm />
          </Dialog>

          {/* Sign Up Button */}
          <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">Sign Up</Button>
            </DialogTrigger>
            <SignUpForm />
          </Dialog>
        </div>
      </section>

      {/* Footer (optional) */}
      <footer className="p-4 text-center text-gray-500">
        &copy; {new Date().getFullYear()} Andi
      </footer>
    </div>
  );
}