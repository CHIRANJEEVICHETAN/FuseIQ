import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft, Users, CheckSquare, Clock, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        console.error('Login error:', error);
        const message =
          error instanceof Error
            ? error.message
            : "Invalid credentials";
        toast({
          title: "Login Failed",
          description: message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Welcome back!",
        });
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login exception:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-primary opacity-10 rounded-full animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-accent opacity-15 rounded-lg rotate-45 animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-32 left-16 w-20 h-20 bg-gradient-secondary opacity-20 rounded-full animate-float" style={{ animationDelay: '4s', animationDuration: '7s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-primary opacity-10 rounded-lg rotate-12 animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }}></div>
        <div className="absolute top-60 left-1/2 w-16 h-16 bg-gradient-accent opacity-15 rounded-full animate-float" style={{ animationDelay: '3s', animationDuration: '5s' }}></div>
        
        {/* Floating Icons */}
        <div className="absolute top-32 right-16 animate-float" style={{ animationDelay: '1.5s', animationDuration: '6.5s' }}>
          <Users className="h-12 w-12 text-primary/20" />
        </div>
        <div className="absolute bottom-40 left-1/3 animate-float" style={{ animationDelay: '2.5s', animationDuration: '7.5s' }}>
          <CheckSquare className="h-10 w-10 text-accent/25" />
        </div>
        <div className="absolute top-1/2 right-1/4 animate-float" style={{ animationDelay: '0.5s', animationDuration: '8.5s' }}>
          <Clock className="h-14 w-14 text-primary/15" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-float" style={{ animationDelay: '3.5s', animationDuration: '6s' }}>
          <BarChart3 className="h-11 w-11 text-accent/20" />
        </div>
        
        {/* Sparkle Effects */}
        <div className="absolute top-24 left-1/4 animate-pulse-glow" style={{ animationDelay: '0s' }}>
          <Sparkles className="h-6 w-6 text-primary/30" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 animate-pulse-glow" style={{ animationDelay: '2s' }}>
          <Sparkles className="h-8 w-8 text-accent/25" />
        </div>
        <div className="absolute top-1/3 right-1/2 animate-pulse-glow" style={{ animationDelay: '4s' }}>
          <Sparkles className="h-5 w-5 text-primary/35" />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-16 right-1/3 w-40 h-40 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-xl animate-float" style={{ animationDelay: '1s', animationDuration: '10s' }}></div>
        <div className="absolute bottom-16 left-1/3 w-36 h-36 bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-xl animate-float" style={{ animationDelay: '3s', animationDuration: '12s' }}></div>
      </div>
      
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 bg-gradient-glass backdrop-blur-glass border-white/20 hover:bg-white/20 transition-all duration-300"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 bg-gradient-glass backdrop-blur-glass border-white/20 shadow-glass-xl animate-float">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              EvolveSync
            </CardTitle>
          </div>
          <CardDescription className="text-lg">
            Project Management & Employee Tracking
          </CardDescription>
          <div className="w-16 h-1 bg-gradient-primary mx-auto rounded-full"></div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 bg-gradient-glass backdrop-blur-glass-sm border-white/20 focus:border-primary/50 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-sm hover:shadow-glass-lg transform hover:-translate-y-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Contact your administrator to create an account.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};