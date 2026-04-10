import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, BookOpen, GraduationCap, FileEdit } from "lucide-react";

const portals = [
  {
    id: "admin",
    title: "Staff Portal",
    description: "Registry, Finance, Admissions, QA & Compliance",
    icon: Shield,
    colour: "bg-primary",
    hoverColour: "hover:bg-primary-600",
    route: "/admin",
  },
  {
    id: "academic",
    title: "Academic Portal",
    description: "Programme Leaders, Module Leaders, Tutors & Examiners",
    icon: BookOpen,
    colour: "bg-secondary",
    hoverColour: "hover:bg-secondary-600",
    route: "/academic",
  },
  {
    id: "student",
    title: "Student Portal",
    description: "View programme, modules, assessments & timetable",
    icon: GraduationCap,
    colour: "bg-accent",
    hoverColour: "hover:bg-accent-700",
    route: "/student",
  },
  {
    id: "applicant",
    title: "Applicant Portal",
    description: "Track your application, upload documents & view offers",
    icon: FileEdit,
    colour: "bg-success",
    hoverColour: "hover:bg-success/90",
    route: "/applicant",
  },
];

export default function Login() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleSignIn = (portalRoute: string) => {
    console.log('Sign In clicked for portal:', portalRoute);
    login(portalRoute);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent font-bold text-white text-xl shadow-lg">
            FH
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Future Horizons Education
        </h1>
        <p className="text-primary-200 text-lg">
          Student Journey Management System
        </p>
        <p className="text-primary-300 text-sm mt-1">Version 2.5</p>
      </div>

      {/* Portal cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
        {portals.map((portal) => {
          const Icon = portal.icon;
          return (
            <Card
              key={portal.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-0"
              onClick={() => handleSignIn(portal.route)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${portal.colour} text-white`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{portal.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {portal.description}
                </CardDescription>
                <Button
                  className={`mt-4 w-full ${portal.colour} ${portal.hoverColour} text-white border-0`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSignIn(portal.route);
                  }}
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-primary-300 text-sm">
        <p>&copy; 2026 Future Horizons Education. All rights reserved.</p>
        <p className="mt-1">
          <a href="#" className="underline hover:text-white">
            Privacy Policy
          </a>
          {" | "}
          <a href="#" className="underline hover:text-white">
            Terms of Use
          </a>
          {" | "}
          <a href="#" className="underline hover:text-white">
            Support
          </a>
        </p>
      </div>
    </div>
  );
}
