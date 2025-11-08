import './globals.css'
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

interface Error1Props {
  errorCode?: string;
  errorMessage?: string;
  buttonText?: string;
  buttonLink?: string;
}

const Error1 = ({
  errorCode = "404",
  errorMessage = "The page you're looking for doesn't exist or has been moved.",
}: Error1Props) => {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-4xl font-bold">
                {errorCode}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">{errorMessage}</p>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
};
export default Error1;
