"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, MapPin, XCircle } from "lucide-react";
import { AddToHomeTip } from "@/components/AddToHomeTip";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { isWithinGeofence } from "@/lib/geofence";
import { getCurrentPosition } from "@/lib/geolocation";

interface LocationAssignment {
  id: string;
  location: {
    id: string;
    name: string;
    address: string;
    geofence_radius: number;
    latitude: number | null;
    longitude: number | null;
  } | null;
}

interface ActiveCheckin {
  id: string;
  checkin_time: string;
  location: LocationAssignment["location"];
}

interface CleanerHomeClientProps {
  assignments: LocationAssignment[];
  initialActiveCheckin: ActiveCheckin | null;
}

type CheckinState = "idle" | "locating" | "outside" | "error";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CleanerHomeClient({
  assignments,
  initialActiveCheckin,
}: CleanerHomeClientProps) {
  const { showToast } = useToast();
  const [activeCheckin, setActiveCheckin] = useState<ActiveCheckin | null>(
    initialActiveCheckin
  );
  const [primaryId, setPrimaryId] = useState(assignments[0]?.id ?? "");
  const [checkinState, setCheckinState] = useState<CheckinState>("idle");
  const [distance, setDistance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [durationLabel, setDurationLabel] = useState(
    initialActiveCheckin?.checkin_time
      ? buildDuration(initialActiveCheckin.checkin_time)
      : "0m"
  );

  useEffect(() => {
    if (!activeCheckin?.checkin_time) return;
    const interval = window.setInterval(() => {
      setDurationLabel(buildDuration(activeCheckin.checkin_time));
    }, 60000);
    return () => window.clearInterval(interval);
  }, [activeCheckin?.checkin_time]);

  const primaryAssignment = assignments.find((item) => item.id === primaryId);
  const otherAssignments = assignments.filter((item) => item.id !== primaryId);

  const handleCheckin = async () => {
    if (!primaryAssignment?.location || isSubmitting) return;
    setIsSubmitting(true);
    setCheckinState("locating");
    setDistance(null);

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      if (
        primaryAssignment.location.latitude !== null &&
        primaryAssignment.location.longitude !== null
      ) {
        const { within, distance: clientDistance } = isWithinGeofence(
          latitude,
          longitude,
          primaryAssignment.location.latitude,
          primaryAssignment.location.longitude,
          primaryAssignment.location.geofence_radius
        );

        if (!within) {
          setDistance(clientDistance);
          setCheckinState("outside");
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch("/api/cleaner/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: primaryAssignment.location.id,
          lat: latitude,
          lng: longitude,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (data?.error === "outside_geofence") {
          setDistance(Number(data.distance) || null);
          setCheckinState("outside");
        } else {
          showToast({
            type: "error",
            message: data?.error || "Unable to check in.",
          });
          setCheckinState("idle");
        }
        return;
      }

      showToast({ type: "success", message: "Checked in successfully." });
      setActiveCheckin({
        id: data.data.checkin_id,
        checkin_time: data.data.checkin_time,
        location: primaryAssignment.location,
      });
      setDurationLabel(buildDuration(data.data.checkin_time));
      setCheckinState("idle");
    } catch (error) {
      console.error("Check-in error:", error);
      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
      setCheckinState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCheckinState("idle");
    setDistance(null);
  };

  const handleCheckout = () => {
    if (!activeCheckin?.id) return;
    window.location.assign(`/cleaner/checkout?checkin=${activeCheckin.id}`);
  };

  if (activeCheckin?.location) {
    return (
      <div className="flex flex-col gap-6">
        <Card variant="active" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-secondary-muted uppercase tracking-wider font-semibold">Current Location</p>
              <h2 className="text-xl font-bold text-white mt-1">
                {activeCheckin.location.name}
              </h2>
              <p className="text-sm text-secondary-dim mt-1">
                {activeCheckin.location.address}
              </p>
            </div>

            <div className="flex flex-col gap-1 p-4 rounded-lg bg-surface-raised border border-primary-border">
              <p className="text-xs text-secondary-muted uppercase tracking-wider font-medium">Session Duration</p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {durationLabel}
              </p>
              <p className="text-xs text-secondary-dim">
                Started at {formatTime(activeCheckin.checkin_time)}
              </p>
            </div>

            <Button size="large" className="w-full" onClick={handleCheckout}>
              Check Out
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!assignments.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="h-20 w-20 rounded-full bg-surface-raised border border-primary-border flex items-center justify-center">
          <MapPin className="h-10 w-10 text-secondary-dim" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-white">
            No assignments yet
          </h2>
          <p className="text-sm text-secondary-muted max-w-[260px] mx-auto">
            Your admin will assign you to a location soon.
          </p>
        </div>
        <AddToHomeTip className="text-xs text-secondary-dim mt-4" />
      </div>
    );
  }

  const location = primaryAssignment?.location;

  return (
    <div className="flex flex-col gap-8">
      {location ? (
        <Card
          variant={checkinState === "outside" ? "warning" : "default"}
          className="relative overflow-hidden"
        >
          {checkinState === "outside" ? (
            <div className="flex flex-col gap-6 text-center items-center">
              <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-warning" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-white">Too Far Away</p>
                <p className="text-sm text-secondary-muted">
                  You are <span className="font-bold text-white">{distance ?? "--"}m</span> away from location.
                </p>
                <p className="text-xs text-secondary-dim">
                  Must be within {location.geofence_radius}m to check in.
                </p>
              </div>
              <div className="w-full space-y-3">
                <Button size="large" className="w-full" onClick={handleCheckin}>
                  Try Again
                </Button>
                <Button variant="ghost" className="w-full" onClick={handleReset}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : checkinState === "error" ? (
            <div className="flex flex-col gap-6 text-center items-center">
              <div className="h-16 w-16 rounded-full bg-danger/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-danger" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-white">
                  Location Required
                </p>
                <p className="text-sm text-secondary-muted">
                  Please enable location access in your browser settings to
                  check in.
                </p>
              </div>
              <Button size="large" className="w-full" onClick={handleCheckin}>
                Try Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {location.name}
                  </h2>
                  <p className="text-sm text-secondary-muted">{location.address}</p>
                </div>
              </div>
              
              <div className="mt-2">
                <Button
                  size="large"
                  className="w-full h-14 text-lg"
                  isLoading={isSubmitting}
                  onClick={handleCheckin}
                >
                  Check In
                </Button>
                {checkinState === "locating" ? (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-secondary-dim">
                    <Spinner size="small" />
                    <span>Getting your location...</span>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-xs text-secondary-dim">
                    Geofence: {location.geofence_radius}m radius
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      ) : null}

      {otherAssignments.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-secondary-muted uppercase tracking-wider">
            My Locations
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {otherAssignments.map((assignment) =>
              assignment.location ? (
                <div
                  key={assignment.id}
                  className="min-w-[200px] max-w-[200px] snap-start"
                  onClick={() => setPrimaryId(assignment.id)}
                >
                  <Card className="h-full cursor-pointer hover:border-secondary-dim transition-colors group">
                    <p className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                      {assignment.location.name}
                    </p>
                    <p className="mt-1 text-xs text-secondary-muted truncate">
                      {assignment.location.address}
                    </p>
                  </Card>
                </div>
              ) : null
            )}
          </div>
        </div>
      ) : null}

      <div className="mt-auto pt-8">
        <AddToHomeTip className="text-xs text-secondary-dim text-center" />
      </div>
    </div>
  );
}

function buildDuration(checkinTime: string) {
  const diffMs = Date.now() - new Date(checkinTime).getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
