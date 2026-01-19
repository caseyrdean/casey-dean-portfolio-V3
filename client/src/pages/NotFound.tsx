/* Design Philosophy: Neon Apocalypse 404 Page
 * Glitch effect with neon styling
 */

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(oklch(0.7 0.3 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.3 195) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-20"></div>
      
      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-9xl font-display chrome-text leading-none">
              404
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-primary via-secondary to-accent"></div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-display text-foreground">
              SYSTEM ERROR
            </h2>
            <p className="text-lg font-body text-muted-foreground leading-relaxed">
              Please excuse our dust as we curate your experience! It looks like this page can't be found. That's ok! Everything is backed up on my LinkedIn!
            </p>
          </div>
          
          <div className="pt-8">
            <Link href="/">
              <Button 
                size="lg"
                className="font-subhead tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary neon-border"
              >
                <Home className="w-5 h-5 mr-2" />
                RETURN HOME
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
