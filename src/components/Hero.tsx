import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import eduflexLogo from "@/assets/eduflex-logo.jpeg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <img 
            src={eduflexLogo} 
            alt="EduFlex - Future-Ready Learning" 
            className="w-48 h-48 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent animate-fade-in">
          Welcome to EduFlex
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto animate-fade-in delay-200">
          Future-Ready Learning Platform
        </p>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in delay-300">
          Master subjects with interactive flashcards, live tutoring, personalized quizzes, and flexible scheduling
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg px-8 py-6 group"
            >
              Get Started
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 hover:border-primary hover:bg-primary/5"
            >
              <BookOpen className="mr-2" />
              Explore Subjects
            </Button>
          </Link>
        </div>

        {/* Features grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in delay-500">
          <FeatureCard 
            icon="📚" 
            title="Smart Flashcards" 
            description="Quick revision tools"
            color="bg-blue-500/10"
          />
          <FeatureCard 
            icon="🎯" 
            title="Interactive Quizzes" 
            description="Test your knowledge"
            color="bg-purple-500/10"
          />
          <FeatureCard 
            icon="🔥" 
            title="Live Hotseat" 
            description="Real-time learning sessions"
            color="bg-orange-500/10"
          />
          <FeatureCard 
            icon="📅" 
            title="Smart Schedule" 
            description="Plan your learning"
            color="bg-green-500/10"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) => (
  <div className={`p-6 rounded-xl ${color} backdrop-blur-sm border border-border hover:scale-105 transition-transform duration-300 shadow-card`}>
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-semibold text-lg mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Hero;
