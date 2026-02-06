"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, Users, Copy, Trash2, Power } from "lucide-react";
import { cn } from "@/lib/utils";

interface CleanerRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

interface InvitationRow {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
}

interface AdminCleanersClientProps {
  cleaners: CleanerRow[];
  invitations: InvitationRow[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function AdminCleanersClient({
  cleaners,
  invitations,
}: AdminCleanersClientProps) {
  const { showToast } = useToast();
  const [rows, setRows] = useState(cleaners);
  const [query, setQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingInvites, setPendingInvites] = useState(invitations);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredCleaners = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((cleaner) =>
      `${cleaner.full_name} ${cleaner.email}`
        .toLowerCase()
        .includes(normalized)
    );
  }, [rows, query]);

  const resetInviteModal = () => {
    setInviteEmail("");
    setInviteLink("");
  };

  const handleToggleActive = async (cleanerId: string, currentStatus: boolean) => {
    if (updatingId === cleanerId) return;
    setUpdatingId(cleanerId);

    try {
      const response = await fetch(`/api/admin/cleaners/${cleanerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to update cleaner status.",
        });
        return;
      }

      setRows((prev) =>
        prev.map((c) =>
          c.id === cleanerId ? { ...c, is_active: !currentStatus } : c
        )
      );

      showToast({
        type: "success",
        message: !currentStatus ? "Cleaner activated." : "Cleaner deactivated.",
      });
    } catch (error) {
      console.error("Toggle active error:", error);
      showToast({ type: "error", message: "Something went wrong." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteCleaner = async (cleanerId: string) => {
    if (updatingId === cleanerId) return;
    if (!confirm("Are you sure you want to permanently delete this cleaner? This action cannot be undone.")) return;

    setUpdatingId(cleanerId);

    try {
      const response = await fetch(`/api/admin/cleaners/${cleanerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showToast({
          type: "error",
          message: data?.error || "Unable to delete cleaner.",
        });
        return;
      }

      setRows((prev) => prev.filter((c) => c.id !== cleanerId));
      showToast({ type: "success", message: "Cleaner deleted successfully." });
    } catch (error) {
      console.error("Delete cleaner error:", error);
      showToast({ type: "error", message: "Something went wrong." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalizedEmail = inviteEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      showToast({ type: "error", message: "Email is required." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showToast({ type: "error", message: "Enter a valid email." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to create invitation.",
        });
        return;
      }

      setInviteLink(data?.data?.invite_link || "");
      setPendingInvites((prev) => [
        {
          id: data.data.id,
          email: data.data.email,
          created_at: data.data.created_at,
          expires_at: data.data.expires_at,
        },
        ...prev,
      ]);
      showToast({ type: "success", message: "Invitation created." });
    } catch (error) {
      console.error("Invite error:", error);
      showToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      showToast({ type: "success", message: "Invite link copied." });
    } catch (error) {
      console.error("Copy link error:", error);
      showToast({ type: "error", message: "Unable to copy invite link." });
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    if (updatingId === inviteId) return;
    setUpdatingId(inviteId);

    try {
      const response = await fetch(`/api/admin/invite/resend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invite_id: inviteId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to resend invitation.",
        });
        return;
      }

      showToast({ type: "success", message: "Invitation resent." });
    } catch (error) {
      console.error("Resend invite error:", error);
      showToast({ type: "error", message: "Something went wrong." });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (updatingId === inviteId) return;
    if (!confirm("Are you sure you want to cancel this invitation?")) return;

    setUpdatingId(inviteId);

    try {
      const response = await fetch(`/api/admin/invite/${inviteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showToast({
          type: "error",
          message: data?.error || "Unable to delete invitation.",
        });
        return;
      }

      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      showToast({ type: "success", message: "Invitation cancelled." });
    } catch (error) {
      console.error("Delete invite error:", error);
      showToast({ type: "error", message: "Something went wrong." });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cleaners</h1>
          <p className="text-sm text-secondary-muted">
            Manage cleaner accounts and invitations.
          </p>
        </div>
        <Button size="default" onClick={() => setIsInviteOpen(true)}>
          + Invite Cleaner
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-dim" />
        <Input
          placeholder="Search cleaners..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-10"
        />
      </div>

      {filteredCleaners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No cleaners found"
          description={
            query
              ? "No cleaners match your search."
              : "Get started by inviting your first cleaner."
          }
          actionLabel={query ? "Clear search" : "Invite Cleaner"}
          onAction={query ? () => setQuery("") : () => setIsInviteOpen(true)}
        />
      ) : (
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCleaners.map((cleaner) => {
              const initials = cleaner.full_name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <TableRow key={cleaner.id}>
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-3">
                      <Avatar src={cleaner.avatar_url} initials={initials} size="sm" />
                      {cleaner.full_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-secondary-muted">{cleaner.email}</TableCell>
                  <TableCell className="text-secondary-muted">{cleaner.phone || "--"}</TableCell>
                  <TableCell>
                    <Badge variant={cleaner.is_active ? "success" : "danger"}>
                      {cleaner.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        className="text-sm text-accent hover:text-white transition-colors"
                        href={`/admin/cleaners/${cleaner.id}`}
                      >
                        View Profile
                      </Link>
                      <span className="text-primary-border">|</span>
                      <button
                        onClick={() => handleToggleActive(cleaner.id, cleaner.is_active)}
                        disabled={updatingId === cleaner.id}
                        className={cn(
                          "text-sm transition-colors",
                          cleaner.is_active ? "text-warning hover:text-white" : "text-accent hover:text-white"
                        )}
                        title={cleaner.is_active ? "Deactivate" : "Activate"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <span className="text-primary-border">|</span>
                      <button
                        onClick={() => handleDeleteCleaner(cleaner.id)}
                        disabled={updatingId === cleaner.id}
                        className="text-sm text-danger hover:text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {pendingInvites.length > 0 ? (
        <div className="flex flex-col gap-4 mt-4">
          <h2 className="text-lg font-semibold text-white">
            Pending Invitations
          </h2>
          <div className="grid gap-3">
            {pendingInvites.map((invite) => (
              <Card key={invite.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{invite.email}</p>
                  <p className="text-xs text-secondary-dim mt-1">
                    Sent {formatDate(invite.created_at)} · Expires{" "}
                    {formatDate(invite.expires_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleResendInvite(invite.id)}
                    disabled={updatingId === invite.id}
                  >
                    {updatingId === invite.id ? "Sending..." : "Resend"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    className="text-secondary-dim hover:text-danger"
                    onClick={() => handleDeleteInvite(invite.id)}
                    disabled={updatingId === invite.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <Modal
        isOpen={isInviteOpen}
        title="Invite Cleaner"
        description="Send an invitation link to a cleaner."
        onClose={() => {
          setIsInviteOpen(false);
          resetInviteModal();
        }}
      >
        <form className="flex flex-col gap-5" onSubmit={handleInvite}>
          <Input
            label="Cleaner Email"
            type="email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            disabled={isSubmitting}
            placeholder="name@example.com"
            required
          />

          {inviteLink ? (
            <div className="rounded-lg bg-surface border border-primary-border p-4">
              <p className="text-xs font-medium text-secondary-muted uppercase tracking-wider mb-2">Invite link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-primary-lighter px-2 py-1 text-sm text-accent truncate">
                  {inviteLink}
                </code>
                <Button type="button" variant="secondary" size="small" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsInviteOpen(false);
                resetInviteModal();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
