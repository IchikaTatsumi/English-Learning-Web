import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-4xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          <Link href="/" className="mt-4 inline-block">
             <Button>Go Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}