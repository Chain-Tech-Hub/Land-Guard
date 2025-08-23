import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MapPin, Users, FileCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Secure Land Ownership with <span className="text-accent">Blockchain Technology</span>
            </h1>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Land Guard prevents disputes, ensures verified ownership, and empowers inclusive access to land in Ouagadougou through blockchain-powered verification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link to="/verify">
                  Verify Land Ownership
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link to="/login">Access Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Secure, Transparent, Inclusive</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our blockchain-powered platform ensures every land transaction is verified, transparent, and prevents disputes before they occur.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Secure Verification</CardTitle>
                <CardDescription>
                  Blockchain-powered ownership verification prevents multiple allocations and fraud
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Land Registry</CardTitle>
                <CardDescription>
                  Complete digital registry with GPS coordinates and boundary documentation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Dispute Resolution</CardTitle>
                <CardDescription>
                  Multi-steward conflict resolution system with transparent evidence handling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-soft hover:shadow-medium transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <FileCheck className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Document Storage</CardTitle>
                <CardDescription>
                  IPFS-powered secure document storage with cryptographic verification
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Land?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of landowners in Ouagadougou who trust Land Guard for secure, verified land ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-primary border-0">
                <Link to="/login">Get Started Today</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/verify">Verify Existing Land</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;