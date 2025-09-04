import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Users, 
  CheckSquare, 
  Clock, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight,
  Star,
  Play,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Team Management",
      description: "Comprehensive user management with role-based access control and department organization."
    },
    {
      icon: <CheckSquare className="h-8 w-8 text-primary" />,
      title: "Project Tracking",
      description: "Advanced task management with Kanban boards, time tracking, and progress monitoring."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Time & Attendance",
      description: "Real-time attendance tracking, leave management, and automated time logging."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analytics & Reports",
      description: "Detailed insights and reports on productivity, attendance, and project performance."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based permissions and audit trails."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Real-time Updates",
      description: "Instant notifications and real-time collaboration across all team members."
    }
  ];

  const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Projects Managed", value: "500+" },
    { label: "Hours Tracked", value: "1M+" },
    { label: "Companies Trust Us", value: "100+" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Project Manager",
      company: "TechCorp",
      content: "EvolveSync has revolutionized how we manage our teams. The real-time collaboration features are game-changing.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "HR Director",
      company: "InnovateLabs",
      content: "The attendance and leave management system has saved us countless hours. Highly recommended!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Team Lead",
      company: "StartupXYZ",
      content: "The analytics dashboard gives us insights we never had before. Our productivity has increased by 40%.",
      rating: 5
    }
  ];

  if (user) {
    return null; // User is logged in, redirect will be handled by AuthGuard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary animate-pulse-glow" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                EvolveSync
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">Features</a>
              <a href="#testimonials" className="text-foreground/80 hover:text-primary transition-colors">Testimonials</a>
              <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors">Pricing</a>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300"
              >
                Get Started
              </Button>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-4 bg-gradient-primary/20 text-primary border-primary/30">
              <Zap className="h-4 w-4 mr-2" />
              Next-Gen Project Management
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Evolve Your
              </span>
              <br />
              <span className="text-foreground">Team Management</span>
            </h1>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto mb-8">
              Streamline your workflow with our comprehensive project management platform. 
              Track tasks, manage teams, monitor attendance, and boost productivity all in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              onClick={() => navigate('/login')}
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-lg hover:shadow-glass-xl transform hover:-translate-y-1"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-gradient-glass backdrop-blur-glass border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Everything you need to manage your team and projects efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-gradient-glass backdrop-blur-glass border-white/20 hover:border-primary/50 transition-all duration-300 hover:shadow-glass-lg transform hover:-translate-y-2"
              >
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                What Our Users Say
              </span>
            </h2>
            <p className="text-xl text-foreground/70">
              Trusted by teams worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="bg-gradient-glass backdrop-blur-glass border-white/20 hover:border-primary/50 transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-foreground/60">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-glass backdrop-blur-glass border-white/20">
            <CardContent className="pt-12 pb-12">
              <Globe className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">
                Ready to Transform Your Team?
              </h2>
              <p className="text-xl text-foreground/70 mb-8">
                Join thousands of teams already using EvolveSync to boost their productivity
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-glass-lg hover:shadow-glass-xl transform hover:-translate-y-1"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                EvolveSync
              </span>
            </div>
            <div className="text-foreground/60 text-center md:text-right">
              <p>&copy; 2024 EvolveSync. All rights reserved.</p>
              <p className="text-sm mt-1">Empowering teams worldwide</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
