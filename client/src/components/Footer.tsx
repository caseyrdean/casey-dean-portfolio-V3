/* Design Philosophy: Neon Apocalypse Footer
 * Angular design with neon borders and grid background
 * Contact information and social links with glowing effects
 */

import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="relative border-t border-primary/30 bg-card mt-32">
      {/* Diagonal top edge */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
      
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-primary bg-background flex items-center justify-center neon-border">
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
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Designing and implementing scalable cloud architectures that transform business operations.
            </p>
          </div>
          
          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-display text-primary tracking-wider">
              CONTACT
            </h3>
            <div className="space-y-3">
              <a 
                href="mailto:casey.dean@cloudarchitect.io" 
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <Mail className="w-4 h-4 group-hover:text-primary" />
                <span className="font-body">casey.dean@cloudarchitect.io</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-body">San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-body">AWS Certified Solutions Architect - Professional</span>
              </div>
            </div>
          </div>
          
          {/* Social Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-display text-secondary tracking-wider">
              CONNECT
            </h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com/caseyrdean" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 border border-primary/30 bg-background flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
              >
                <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="https://linkedin.com/in/caseyrdean" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 border border-primary/30 bg-background flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a 
                href="mailto:casey.r.dean1990@gmail.com"
                className="w-12 h-12 border border-primary/30 bg-background flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 group"
              >
                <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground font-body mt-6">
              Available for consulting and speaking engagements
            </p>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground font-body">
              © 2026 Casey Dean. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground font-body">
              Built with React + AWS • Designed with <span className="text-primary">passion</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `linear-gradient(oklch(0.7 0.3 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.3 195) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}></div>
    </footer>
  );
}
