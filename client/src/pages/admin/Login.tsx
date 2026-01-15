/**
 * Admin Login Page
 * 
 * Simple password-based authentication for admin access.
 * No external OAuth dependencies.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        // Redirect to admin dashboard
        setLocation("/admin/blog");
      } else {
        setError(data.error || "Login failed");
      }
    },
    onError: (err) => {
      setError(err.message || "An error occurred");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ password });
  };

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
        <div className="max-w-md mx-auto">
          <div className="border border-primary/30 bg-card p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-primary/50 bg-primary/10 rounded-full mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-display text-foreground">ADMIN ACCESS</h1>
              <p className="text-sm font-body text-muted-foreground">
                Enter your admin password to continue
              </p>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 border border-red-500/50 bg-red-500/10 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-body">{error}</span>
              </div>
            )}
            
            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-subhead tracking-widest text-primary uppercase">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-background border-primary/30 focus:border-primary"
                  disabled={loginMutation.isPending}
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                className="w-full font-subhead tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary"
                disabled={loginMutation.isPending || !password}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  "LOGIN"
                )}
              </Button>
            </form>
            
            {/* Back link */}
            <div className="text-center">
              <a 
                href="/" 
                className="text-sm font-body text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
