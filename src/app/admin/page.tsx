import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';


export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Admin Panel</CardTitle>
          <CardDescription>
            This is your central hub for managing your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            From here, you will be able to manage database connections,
            configure APIs, and monitor your application. We can build these features out step by step.
          </p>
          <Link href="/admin/databases">
            <Button>
                Manage Databases
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}