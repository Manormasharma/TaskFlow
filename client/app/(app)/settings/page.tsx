"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { LogOut } from "lucide-react";
import { Avatar, Button, Card, PageHeader } from "@/components/ui";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Your account details." />
      <Card className="max-w-xl space-y-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.full_name ?? "?"} />
          <p className="font-semibold text-slate-900">{user?.full_name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Name</p>
          <p className="text-slate-900">{user?.full_name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Email</p>
          <p className="text-slate-900">{user?.email}</p>
        </div>
        <p className="text-xs text-slate-500">Profile editing is not available yet.</p>
      </Card>
      <Button variant="secondary" onClick={handleLogout}><LogOut size={16} className="mr-1" /> Log out</Button>
    </div>
  );
}
