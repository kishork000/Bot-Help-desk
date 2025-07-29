import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Settings, Database, MessageSquare, BookText } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <Link href="/admin/content">
              <SidebarMenuButton>
                <BookText />
                Content
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton href="#">
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
      </Sidebar>
      <SidebarInset>
        <header className="p-4 flex items-center gap-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Admin Panel</h1>
        </header>
        <main className="p-4">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}
