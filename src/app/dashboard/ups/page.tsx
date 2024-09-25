"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./column"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home } from "lucide-react"; 

type Tracking = {
  id: string;
  name: string;
  trackingNumber: string;
  createdAt: string;
  trackingData?: any;
};

export default function UPSMultiTrack() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // State for fetching tracking details
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // State for row selection
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});

  // State for deleting
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);

  const fetchTrackings = async () => {
    try {
      const res = await fetch("/api/tracking", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) {
        throw new Error(`Error fetching trackings: ${res.statusText}`);
      }
  
      const data = await res.json();
      setTrackings(data);
    } catch (error) {
      console.error("Error fetching trackings:", error);
      toast({
        title: "Error fetching trackings",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    fetchTrackings();
  }, []);

  // Function to fetch tracking details from UPS API
  const fetchTrackingDetails = async (trackingNumber: string) => {
    try {
      const res = await fetch("/api/ups/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error fetching tracking details");
      }
      const data = await res.json();
      console.log(data);
      return data.trackingData;
    } catch (error) {
      console.error("Error fetching tracking details:", error);

      toast({
        title: "Error Fetching Tracking Details",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });

      return null;
    }
  };

  // Fetch tracking details for all trackings
  useEffect(() => {
    const fetchAllTrackingDetails = async () => {
      setIsFetchingDetails(true);
      const updatedTrackings = await Promise.all(
        trackings.map(async (tracking) => {
          const trackingData = await fetchTrackingDetails(
            tracking.trackingNumber
          );
          return { ...tracking, trackingData };
        })
      );
      setTrackings(updatedTrackings);
      setIsFetchingDetails(false);
    };

    if (trackings.length > 0) {
      fetchAllTrackingDetails();
    }
  }, [trackings.length]);

  // Function to refresh tracking data
  const refreshTrackingData = async () => {
    setIsFetchingDetails(true);
    try {
      const updatedTrackings = await Promise.all(
        trackings.map(async (tracking) => {
          const trackingData = await fetchTrackingDetails(
            tracking.trackingNumber
          );
          return {
            ...tracking,
            trackingData,
          };
        })
      );
      setTrackings(updatedTrackings);
      toast({
        title: "Tracking Data Refreshed",
        description: "All tracking data has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing tracking data:", error);
      toast({
        title: "Error Refreshing Tracking Data",
        description: "There was an error refreshing tracking data.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Function to handle adding a new tracking
  const handleAddTracking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, trackingNumber }),
      });

      const data = await res.json();

      if (res.ok) {
        const newTracking = data;


        const trackingData = await fetchTrackingDetails(
          newTracking.trackingNumber
        );

        setTrackings((prev) => [...prev, { ...newTracking, trackingData }]);

        setName("");
        setTrackingNumber("");
        setIsDialogOpen(false);
        toast({
          title: "Tracking Added",
          description: "The UPS tracking code has been added successfully.",
        });
      } else {
        toast({
          title: "Error adding tracking",
          description: data.error || "Failed to add tracking.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding tracking:", error);
      toast({
        title: "Error adding tracking",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = () => {
    const selectedRowIds = Object.keys(rowSelection);
    if (selectedRowIds.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to delete.",
        variant: "destructive",
      });
      return;
    }

    setIdsToDelete(selectedRowIds);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/tracking", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: idsToDelete }),
      });
  
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete tracking entries.");
      }
  
      await fetchTrackings();
  
      setRowSelection({});
  
      toast({
        title: "Trackings Deleted",
        description: "Selected tracking entries have been deleted.",
      });
    } catch (error) {
      console.error("Error deleting trackings:", error);
      toast({
        title: "Error Deleting Trackings",
        description:
          (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    // Send them back to "/" *Insert kirby falling gif*
    router.push("/");
    return null;
  }

  return (
    <>
    <div className="text-primary-foreground p-4 flex justify-between items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="text-white"
        >
          <Home className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Andi's Toys</h1>
        <div className="w-10"></div>
      </div>
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            UPS MultiTrack
            <div className="flex items-center space-x-2">
              <Button onClick={() => setIsDialogOpen(true)}>
                Add Tracking
              </Button>
              <Button
                variant="outline"
                onClick={refreshTrackingData}
                disabled={isFetchingDetails}
              >
                {isFetchingDetails ? "Refreshing..." : "Refresh"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Selected"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={trackings}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
            <div className="flex-1 text-sm text-muted-foreground mt-2">
              {Object.keys(rowSelection).length} of {trackings.length} row(s) selected.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Tracking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New UPS Tracking</DialogTitle>
            <DialogDescription>
              Enter the details of the package you want to track.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTracking} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Office Supplies"
              />
            </div>
            <div>
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                name="trackingNumber"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                required
                placeholder="e.g., 1Z123AA12345678964"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="mr-2">
                {isLoading ? "Adding..." : "Add Tracking"}
              </Button>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
    <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogDescription>
            Are you sure you want to delete the selected item(s)? This action cannot be undone.
        </DialogDescription>
        </DialogHeader>
        <DialogFooter>
        <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isDeleting}
        >
            {isDeleting ? "Deleting..." : "Delete"}
        </Button>
        <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
        </DialogClose>
        </DialogFooter>
    </DialogContent>
    </Dialog>
    </div>
    </>
  );
}