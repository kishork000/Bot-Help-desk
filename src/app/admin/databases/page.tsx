import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

export default function DatabasesPage() {
  // Dummy data for now
  const connections = [
    { id: '1', name: 'Primary DB (PostgreSQL)', host: 'localhost', status: 'Connected' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold">Database Connections</h2>
            <p className="text-muted-foreground">Manage your database connections here.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Connection
        </Button>
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
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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
}