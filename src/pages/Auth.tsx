import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingParticles } from "@/components/FloatingParticles";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "1") setTab("signin");
      if (e.ctrlKey && e.key === "2") setTab("signup");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => emailRef.current?.focus(), 50);
    return () => clearTimeout(timeout);
  }, [tab]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/");
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const cleanupAuthState = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        localStorage.removeItem(key);
      }
    });
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith("supabase.auth.") || key.includes("sb-")) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields");

    setLoading(true);
    setError("");

    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: "global" });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.includes("Invalid login credentials"))
          setError("Invalid email or password. Please try again.");
        else if (error.message.includes("Email not confirmed"))
          setError("Check your email and confirm your account first.");
        else setError(error.message);
        return;
      }

      if (data.user) {
        rememberMe
          ? localStorage.setItem("rememberMe", email)
          : localStorage.removeItem("rememberMe");

        toast({ title: "Welcome back!", description: "Signed in successfully." });
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError("Please fill in all fields");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    setError("");

    try {
      cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (error) {
        if (error.message.includes("User already registered"))
          setError("Account exists. Please sign in.");
        else setError(error.message);
        return;
      }

      if (data.user) {
        rememberMe && localStorage.setItem("rememberMe", email);

        if (data.user.email_confirmed_at) {
          toast({ title: "Account created!", description: "You can now create reports." });
          window.location.href = "/";
        } else {
          toast({ title: "Check your email!", description: "Confirm your email before signing in." });
          setError("Please confirm your email, then sign in.");
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberMe");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10 w-full max-w-md space-y-6 backdrop-blur-xl bg-white/10 dark:bg-black/20 rounded-lg shadow-2xl border border-white/20">
        <div className="text-center space-y-2 pt-6 px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Field Report Generator</h1>
          </div>
          <p className="text-muted-foreground">
            Sign in to create and manage your field reports
          </p>
        </div>

        <Card className="bg-transparent shadow-none border-none">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Sign in or create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={(val) => setTab(val as "signin" | "signup")} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      ref={emailRef}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-muted-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="accent-primary"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me
                    </label>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      ref={emailRef}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        minLength={6}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-muted-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember-signup"
                      className="accent-primary"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-signup" className="text-sm text-muted-foreground">
                      Remember me
                    </label>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}