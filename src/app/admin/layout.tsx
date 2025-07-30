
"use client";

import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Settings, Database, MessageSquare, BookText, Cable, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/admin">
              <SidebarMenuButton>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/databases">
              <SidebarMenuButton>
                <Database />
                Databases
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/apis">
              <SidebarMenuButton>
                <Cable />
                APIs
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/content">
              <SidebarMenuButton>
                <BookText />
                Content
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton>
                <MessageSquare />
                Chatbot
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-auto">
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                        <LogOut />
                        Logout
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
      </Sidebar>
      <SidebarInset>
        <header className="p-4 flex items-center gap-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Admin Panel</h1>
        </header>
        <main className="p-4">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}
