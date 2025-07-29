
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export default function DatabasesPage() {
  // Dummy data for now
  const [connections, setConnections] = useState([
    { id: '1', name: 'Primary DB (PostgreSQL)', host: 'localhost', status: 'Connected' },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // In a real app, this would come from a form state library like react-hook-form
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: '',
    host: '',
    port: '',
    user: '',
    password: '',
    dbName: ''
  });

  const handleAddConnection = () => {
    // Here you would typically add validation and call an API to save the connection.
    // For now, we'll just add it to our local state for demonstration.
    const newConn = {
      id: crypto.randomUUID(),
      name: newConnection.name || 'New Connection',
      host: newConnection.host || 'localhost',
      status: 'Pending'
    };
    setConnections(prev => [...prev, newConn]);
    setIsDialogOpen(false); // Close the dialog
    // Reset form
    setNewConnection({ name: '', type: '', host: '', port: '', user: '', password: '', dbName: '' });
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold">Database Connections</h2>
            <p className="text-muted-foreground">Manage your database connections here.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Database Connection</DialogTitle>
              <DialogDescription>
                Enter the details of your new database connection.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={newConnection.name} onChange={(e) => setNewConnection({...newConnection, name: e.target.value})} placeholder="My Awesome DB" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select onValueChange={(value) => setNewConnection({...newConnection, type: value})}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                        <SelectItem value="mongodb">MongoDB</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="host" className="text-right">Host</Label>
                <Input id="host" value={newConnection.host} onChange={(e) => setNewConnection({...newConnection, host: e.target.value})} placeholder="localhost" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="port" className="text-right">Port</Label>
                <Input id="port" value={newConnection.port} onChange={(e) => setNewConnection({...newConnection, port: e.target.value})} placeholder="5432" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="user" className="text-right">Username</Label>
                <Input id="user" value={newConnection.user} onChange={(e) => setNewConnection({...newConnection, user: e.target.value})} placeholder="admin" className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" value={newConnection.password} className="text-right">Password</Label>
                <Input id="password" type="password" onChange={(e) => setNewConnection({...newConnection, password: e.target.value})} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dbName" className="text-right">DB Name</Label>
                <Input id="dbName" value={newConnection.dbName} onChange={(e) => setNewConnection({...newConnection, dbName: e.target.value})} placeholder="mydatabase" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddConnection}>Save Connection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Connections</CardTitle>
          <CardDescription>
            Here is a list of your configured database connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {connections.length > 0 ? (
                        connections.map(conn => (
                            <TableRow key={conn.id}>
                                <TableCell className="font-medium">{conn.name}</TableCell>
                                <TableCell>{conn.host}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${conn.status === 'Connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                        {conn.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm">Manage</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                No database connections yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );

    