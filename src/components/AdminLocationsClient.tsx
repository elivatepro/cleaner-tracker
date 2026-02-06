"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
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
  geofence_enabled: boolean;
  is_active: boolean;
}

interface AdminLocationsClientProps {
  locations: LocationRow[];
}

export function AdminLocationsClient({ locations }: AdminLocationsClientProps) {
  const { showToast } = useToast();
  const [rows, setRows] = useState(locations);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState("200");
  const [geofenceEnabled, setGeofenceEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredLocations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((location) =>
      `${location.name} ${location.address}`.toLowerCase().includes(normalized)
    );
  }, [rows, query]);

  const resetForm = () => {
    setName("");
    setAddress("");
    setRadius("200");
    setGeofenceEnabled(true);
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
          geofence_enabled: geofenceEnabled,
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

  const handleGeofenceToggle = async (locationId: string, enabled: boolean) => {
    if (updatingId === locationId) return;
    setUpdatingId(locationId);

    try {
      const response = await fetch(`/api/admin/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geofence_enabled: enabled }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to update geofence status.",
        });
        return;
      }

      const updated = data?.data;
      setRows((prev) =>
        prev.map((location) =>
          location.id === locationId
            ? { ...location, geofence_enabled: updated?.geofence_enabled ?? enabled }
            : location
        )
      );

      showToast({
        type: "success",
        message: enabled ? "Geofence enabled." : "Geofence disabled.",
      });
    } catch (error) {
      console.error("Update geofence error:", error);
      showToast({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setUpdatingId(null);
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
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Radius</TableHead>
              <TableHead>Geofence</TableHead>
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
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={location.geofence_enabled}
                      onChange={(e) => handleGeofenceToggle(location.id, e.target.checked)}
                      disabled={updatingId === location.id}
                      aria-label={location.geofence_enabled ? "Disable geofence" : "Enable geofence"}
                    />
                    <span className="text-xs text-secondary-muted">
                      {location.geofence_enabled ? "On" : "Off"}
                    </span>
                  </div>
                </TableCell>
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

          <div className="flex items-center justify-between rounded-lg border border-primary-border bg-surface-raised px-4 py-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Enforce geofence for this location</span>
              <span className="text-xs text-secondary-muted">Cleaners must be within radius to check in/out.</span>
            </div>
            <Checkbox
              checked={geofenceEnabled}
              onChange={(e) => setGeofenceEnabled(e.target.checked)}
              disabled={isSubmitting}
              aria-label="Enforce geofence"
            />
          </div>

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
