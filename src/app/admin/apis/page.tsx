
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Shield, KeyRound } from "lucide-react";

type ApiConnection = {
    id: string;
    name: string;
    baseUrl: string;
    authType: 'none' | 'apiKey' | 'bearer';
    status: 'Connected' | 'Pending' | 'Error';
};

export default function ApisPage() {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // In a real app, this would use a form library like react-hook-form
  const [newConnection, setNewConnection] = useState({
    name: '',
    baseUrl: '',
    authType: 'none' as ApiConnection['authType'],
    apiKey: '',
    bearerToken: ''
  });

  const handleAddConnection = () => {
    // This is where you would call a service to securely save the connection details.
    // For now, we'll just add it to our local state for this demo.
    const newConn: ApiConnection = {
      id: crypto.randomUUID(),
      name: newConnection.name,
      baseUrl: newConnection.baseUrl,
      authType: newConnection.authType,
      status: 'Pending'
    };
    setConnections(prev => [...prev, newConn]);
    setIsDialogOpen(false); // Close the dialog
    // Reset form
    setNewConnection({ name: '', baseUrl: '', authType: 'none', apiKey: '', bearerToken: '' });
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold">API Connections</h2>
            <p className="text-muted-foreground">Manage connections to external APIs.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add API Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New API Connection</DialogTitle>
              <DialogDescription>
                Enter the details for the external API you want to connect to.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="api-name">Connection Name</Label>
                <Input id="api-name" value={newConnection.name} onChange={(e) => setNewConnection({...newConnection, name: e.target.value})} placeholder="e.g., Weather API" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="base-url">Base URL</Label>
                <Input id="base-url" value={newConnection.baseUrl} onChange={(e) => setNewConnection({...newConnection, baseUrl: e.target.value})} placeholder="https://api.example.com/v1" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="auth-type">Authentication</Label>
                <Select value={newConnection.authType} onValueChange={(value) => setNewConnection({...newConnection, authType: value as ApiConnection['authType']})}>
                    <SelectTrigger id="auth-type">
                        <SelectValue placeholder="Select an authentication method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="apiKey">API Key</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {newConnection.authType === 'apiKey' && (
                 <div className="grid gap-2 p-4 border rounded-md bg-muted/50">
                    <Label className="flex items-center gap-2 font-semibold"><KeyRound className="w-4 h-4"/> API Key Authentication</Label>
                    <Input value={newConnection.apiKey} onChange={(e) => setNewConnection({...newConnection, apiKey: e.target.value})} placeholder="Enter your API key" />
                    <p className="text-xs text-muted-foreground">The API key will be sent in an `x-api-key` header.</p>
                 </div>
              )}

              {newConnection.authType === 'bearer' && (
                 <div className="grid gap-2 p-4 border rounded-md bg-muted/50">
                    <Label className="flex items-center gap-2 font-semibold"><Shield className="w-4 h-4"/> Bearer Token</Label>
                    <Input value={newConnection.bearerToken} onChange={(e) => setNewConnection({...newConnection, bearerToken: e.target.value})} placeholder="Enter your bearer token" />
                     <p className="text-xs text-muted-foreground">The token will be sent in an `Authorization` header.</p>
                 </div>
              )}

            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddConnection}>Save Connection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your API Connections</CardTitle>
          <CardDescription>
            List of your configured connections to external services.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Base URL</TableHead>
                        <TableHead>Auth</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {connections.length > 0 ? (
                        connections.map(conn => (
                            <TableRow key={conn.id}>
                                <TableCell className="font-medium">{conn.name}</TableCell>
                                <TableCell className="truncate max-w-xs">{conn.baseUrl}</TableCell>
                                <TableCell className="capitalize">{conn.authType}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Manage</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                No API connections yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
