"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    if (!session && status !== "loading") {
      router.push("/");
    }

    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good morning");
    } else if (hours < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, [session, status, router]);

  const isAdmin = session?.user?.isAdmin;

  // Function to generate invite code
  const handleGenerateInvite = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invite/generate", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedCode(data.code);
        setIsDialogOpen(true);
      } else {
        alert(`Failed to generate invite code: ${data.error}`);
      }
    } catch (error) {
      console.error("Error generating invite code:", error);
      alert("An error occurred while generating the invite code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (generatedCode) {
      navigator.clipboard
        .writeText(generatedCode)
        .then(() => {
          toast({
            title: "Invite Code Copied",
          });
        })
        .catch((err) => {
          console.error("Failed to copy invite code:", err);
          toast({
            title: "Failed to copy invite code",
            description: "Please try again.",
          });
        });
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen">
      <div className="text-red-900 hover:text-red-700 p-4 flex justify-between items-center">
        <Button className="hover:text-red-700 " variant="outline" onClick={() => signOut()}>
          Logout
        </Button>
        <div className="w-10"></div> 
      </div>
      <div className="p-52">
        <Card className="mb-4 text-center mx-auto max-w-md">
          <CardHeader>
            <CardTitle>
              <h1 className="text-3xl">Andi's Toys</h1>
            </CardTitle>
            <CardDescription>
              {greeting} {session?.user?.name || session?.user?.email}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          {isAdmin && (
            <>
              <CardHeader>
                <CardTitle>Generate Invite Code</CardTitle>
                <CardDescription>
                  Generate an invite code for your friends to use the app.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleGenerateInvite}
                  className="mr-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Invite Code"}
                </Button>
              </CardContent>
            </>
          )}
          <Separator />
          <CardHeader>
            <CardTitle>Track Your UPS Shipments</CardTitle>
            <CardDescription>
              Track all your UPS shipments in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/ups")}>
              Track Shipment
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Code Generated</DialogTitle>
            <DialogDescription>
              Here's your newly generated invite code:
            </DialogDescription>
          </DialogHeader>
          <div
            className="p-4 border border-primary rounded text-center cursor-pointer"
            onClick={handleCopyInviteCode}
          >
            <p className="text-lg font-bold">{generatedCode}</p>
          </div>
          <DialogClose asChild>
            <Button className="mt-4" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}