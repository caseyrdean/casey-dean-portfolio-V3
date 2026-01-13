/* Design Philosophy: Neon Apocalypse Navigation
 * Minimal header with glowing logo and angular design
 * Fixed position with backdrop blur for depth
 */

import { Link } from "wouter";

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/30 bg-background/80 backdrop-blur-md">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 border-2 border-primary bg-card flex items-center justify-center neon-border transition-all duration-300 group-hover:scale-110">
              <span className="text-2xl font-display text-primary neon-glow">CD</span>
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
            <Link href="/#projects" className="font-subhead text-sm tracking-wider text-muted-foreground hover:text-primary transition-colors duration-300 uppercase">
              Projects
            </Link>
            <Link href="/#awards" className="font-subhead text-sm tracking-wider text-muted-foreground hover:text-secondary transition-colors duration-300 uppercase">
              Awards
            </Link>
            <Link href="/#contact" className="font-subhead text-sm tracking-wider text-muted-foreground hover:text-accent transition-colors duration-300 uppercase">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
