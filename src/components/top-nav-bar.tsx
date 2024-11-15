"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Briefcase, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Jobs", href: "/" },
    { name: "Consulting", href: "/consulting" },
    { name: "Login", href: "/login" },
  ];

  const NavLinks = () => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`text-xl font-bold transition-colors hover:text-primary ${
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          }`}
          onClick={() => setIsOpen(false)}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <nav className="border-b">
      <div className="flex items-center justify-between px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center">
            <Briefcase className="size-16 text-primary" />
            <span className="ml-2 text-5xl font-bold">JobHub</span>
          </Link>
        </div>
        <div className="hidden space-x-8 lg:flex">
          <NavLinks />
        </div>
        <div className="hidden space-x-4 lg:flex">
          <Button
            variant="outline"
            className="text-xl font-bold h-20 border-4 border-green-500 rounded-xl"
            onClick={() => router.push("/consulting/new")}
          >
            Hire a Consultant
          </Button>
          <Button
            className="text-xl font-bold h-20 border-4 border-green-500 rounded-xl"
            onClick={() => router.push("/jobs/new")}
          >
            Post a Job
          </Button>
        </div>
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b">
                  <Link
                    href="/"
                    className="flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Briefcase className="w-8 h-8 text-primary" />
                    <span className="ml-2 text-xl font-bold">JobHub</span>
                  </Link>
                </div>
                <div className="flex flex-col py-4 space-y-4">
                  <NavLinks />
                </div>
                <div className="flex flex-col mt-auto space-y-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push("/consulting/new");
                      setIsOpen(false);
                    }}
                  >
                    Hire a Consultant
                  </Button>
                  <Button
                    onClick={() => {
                      router.push("/jobs/new");
                      setIsOpen(false);
                    }}
                  >
                    Post a Job
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
