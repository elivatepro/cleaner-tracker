"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPin } from "lucide-react";

interface AssignmentRow {
  id: string;
  cleaner: { full_name: string } | null;
  location: { name: string } | null;
  is_active: boolean;
}

interface SelectOption {
  id: string;
  label: string;
}

interface AdminAssignmentsClientProps {
  assignments: AssignmentRow[];
  cleaners: SelectOption[];
  locations: SelectOption[];
}

export function AdminAssignmentsClient({
  assignments,
  cleaners,
  locations,
}: AdminAssignmentsClientProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cleanerId, setCleanerId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCleanerId("");
    setLocationId("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!cleanerId || !locationId) {
      showToast({ type: "error", message: "Select a cleaner and location." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cleaner_id: cleanerId,
          location_id: locationId,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to create assignment.",
        });
        return;
      }

      showToast({ type: "success", message: "Assignment created." });
      setIsModalOpen(false);
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error("Create assignment error:", error);
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
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="text-sm text-secondary-muted">
            Manage which cleaners are assigned to locations.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Assign Cleaner</Button>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No assignments yet"
          description="Assign cleaners to locations to start tracking."
          actionLabel="Assign Cleaner"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cleaner</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium text-white">
                  {assignment.cleaner?.full_name || "Unknown"}
                </TableCell>
                <TableCell className="text-secondary-muted">
                  {assignment.location?.name || "Unknown"}
                </TableCell>
                <TableCell>
                  <Badge variant={assignment.is_active ? "success" : "neutral"}>
                    {assignment.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="small" className="text-danger hover:text-danger hover:bg-danger-soft">
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Assign Cleaner"
        description="Link a cleaner to a location."
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-secondary-muted" htmlFor="cleaner-select">
              Cleaner
            </label>
            <select
              id="cleaner-select"
              className={cn(
                "h-12 w-full rounded-lg border border-primary-border bg-surface-raised px-3 text-base text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              )}
              value={cleanerId}
              onChange={(event) => setCleanerId(event.target.value)}
              disabled={isSubmitting}
              required
            >
              <option value="" className="bg-surface-raised text-secondary-muted">Select cleaner</option>
              {cleaners.map((cleaner) => (
                <option key={cleaner.id} value={cleaner.id} className="bg-surface-raised text-white">
                  {cleaner.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-secondary-muted" htmlFor="location-select">
              Location
            </label>
            <select
              id="location-select"
              className={cn(
                "h-12 w-full rounded-lg border border-primary-border bg-surface-raised px-3 text-base text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              )}
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              disabled={isSubmitting}
              required
            >
              <option value="" className="bg-surface-raised text-secondary-muted">Select location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id} className="bg-surface-raised text-white">
                  {location.label}
                </option>
              ))}
            </select>
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
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
