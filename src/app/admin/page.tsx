import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Welcome to your Admin Panel</CardTitle>
          <CardDescription>
            This is your central hub for managing your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            From here, you will be able to manage database connections,
            configure APIs, and monitor your application. We can build these features out step by step.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
