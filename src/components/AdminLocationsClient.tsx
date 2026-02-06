"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Slider } from "@/components/ui/Slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPin, Search } from "lucide-react";

interface LocationRow {
  id: string;
  name: string;
  address: string;
  geofence_radius: number;
  is_active: boolean;
}

interface AdminLocationsClientProps {
  locations: LocationRow[];
}

export function AdminLocationsClient({ locations }: AdminLocationsClientProps) {
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState("200");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredLocations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return locations;
    return locations.filter((location) =>
      `${location.name} ${location.address}`.toLowerCase().includes(normalized)
    );
  }, [locations, query]);

  const resetForm = () => {
    setName("");
    setAddress("");
    setRadius("200");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!name.trim() || !address.trim()) {
      showToast({ type: "error", message: "Name and address are required." });
      return;
    }

    const parsedRadius = Number(radius);
    if (Number.isNaN(parsedRadius) || parsedRadius < 50 || parsedRadius > 500) {
      showToast({
        type: "error",
        message: "Radius must be between 50 and 500 meters.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim(),
          geofence_radius: parsedRadius,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to create location.",
        });
        return;
      }

      showToast({ type: "success", message: "Location created." });
      setIsModalOpen(false);
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error("Create location error:", error);
      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Locations</h1>
          <p className="text-sm text-secondary-muted">
            Manage job locations and geofences.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Location</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-dim" />
        <Input
          placeholder="Search locations..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-10"
        />
      </div>

      {filteredLocations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No locations found"
          description={
            query
              ? "No locations match your search."
              : "Get started by adding your first location."
          }
          actionLabel={query ? "Clear search" : "Add Location"}
          onAction={query ? () => setQuery("") : () => setIsModalOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Radius</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium text-white">
                  {location.name}
                </TableCell>
                <TableCell className="text-secondary-muted max-w-xs truncate" title={location.address}>
                  {location.address}
                </TableCell>
                <TableCell className="text-secondary-muted">{location.geofence_radius}m</TableCell>
                <TableCell>
                  <Badge variant={location.is_active ? "success" : "danger"}>
                    {location.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    className="text-sm text-accent hover:text-white transition-colors"
                    href={`/admin/locations/${location.id}`}
                  >
                    View Details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Add Location"
        description="Address will be converted to GPS coordinates automatically."
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <Input
            label="Location Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. Downtown Office"
            required
          />
          <Input
            label="Address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. 123 Main St, New York, NY"
            required
          />
          
          <Slider
            label="Geofence Radius"
            valueDisplay={`${radius} meters`}
            min="50"
            max="500"
            step="10"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            disabled={isSubmitting}
          />

          <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Save Location
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
