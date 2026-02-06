"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckSquare, GripVertical, Trash2 } from "lucide-react";

interface ChecklistItemRow {
  id: string;
  label: string;
  is_active: boolean;
}

interface AdminChecklistClientProps {
  items: ChecklistItemRow[];
}

export function AdminChecklistClient({ items }: AdminChecklistClientProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labelsText, setLabelsText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedLabels = useMemo(
    () =>
      labelsText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    [labelsText]
  );

  const resetForm = () => setLabelsText("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (parsedLabels.length === 0) {
      showToast({ type: "error", message: "Add at least one checklist item." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labels: parsedLabels }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast({
          type: "error",
          message: data?.error || "Unable to create checklist item.",
        });
        return;
      }

       const createdCount = Array.isArray(data?.data) ? data.data.length : 1;
       showToast({
         type: "success",
         message: `${createdCount} item${createdCount > 1 ? "s" : ""} created.`,
       });
      setIsModalOpen(false);
      resetForm();
      window.location.reload();
    } catch (error) {
      console.error("Create checklist error:", error);
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
          <h1 className="text-2xl font-bold text-white">Checklist</h1>
          <p className="text-sm text-secondary-muted">
            Manage default checklist items for all checkouts.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Item</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No checklist items"
          description="Create default items that cleaners need to complete during checkout."
          actionLabel="Add Item"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-col min-w-[500px]">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between py-3 border-b border-primary-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-secondary-dim cursor-grab" />
                  <span className="text-sm text-white">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={item.is_active ? "success" : "neutral"}>
                    {item.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="small" className="text-secondary-dim hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        title="Add Checklist Item"
        description="Default checklist items appear on every checkout."
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
      >
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-secondary-muted" htmlFor="checklist-multi">
              Checklist Items
            </label>
            <textarea
              id="checklist-multi"
              className="min-h-[140px] w-full rounded-lg border border-primary-border bg-surface-raised px-3.5 py-3 text-base text-white placeholder:text-secondary-dim focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-40 transition-colors duration-150"
              value={labelsText}
              onChange={(event) => setLabelsText(event.target.value)}
              disabled={isSubmitting}
              placeholder="Add one item per line (e.g. Empty trash, Wipe counters, Mop floors)"
            />
            <p className="text-xs text-secondary-dim">Tip: Paste multiple lines to add several items at once.</p>
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
              Save Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
