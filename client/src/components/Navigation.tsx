/* Design Philosophy: Neon Apocalypse Navigation
 * Minimal header with glowing logo and angular design
 * Fixed position with backdrop blur for depth
 */

import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (location !== "/") {
      window.location.href = "/#" + sectionId;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/30 bg-background/80 backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-16 h-16 border-2 border-primary bg-card flex items-center justify-center neon-border transition-all duration-300 group-hover:scale-110 overflow-hidden rounded">
              <img src="/images/casey-profile.jpg" alt="Casey Dean" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display text-foreground tracking-wider">
                CASEY DEAN
              </span>
              <span className="text-xs font-subhead text-muted-foreground tracking-widest">
                AWS SOLUTIONS ARCHITECT
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => scrollToSection("projects")}
              className="font-subhead text-sm tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300 uppercase cursor-pointer bg-transparent border-none"
            >
              Projects
            </button>
            <button 
              onClick={() => scrollToSection("awards")}
              className="font-subhead text-sm tracking-wider text-muted-foreground hover:text-secondary transition-colors duration-300 uppercase cursor-pointer bg-transparent border-none"
            >
              Credentials
            </button>
            <button 
              onClick={() => scrollToSection("contact")}
              className="font-subhead text-sm tracking-wider text-muted-foreground hover:text-accent transition-colors duration-300 uppercase cursor-pointer bg-transparent border-none"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
