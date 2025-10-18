import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, BookOpen, Brain, Calendar, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SubjectGrid from "@/components/SubjectGrid";
import FlashcardSection from "@/components/FlashcardSection";
import QuizSection from "@/components/QuizSection";
import ScheduleSection from "@/components/ScheduleSection";
import HotseatSection from "@/components/HotseatSection";
import eduflexLogo from "@/assets/eduflex-logo.jpeg";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Check auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
      if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
    } else {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "See you soon!",
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={eduflexLogo} 
              alt="EduFlex" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                EduFlex
              </h1>
              <p className="text-xs text-muted-foreground">Future-Ready Learning</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-medium">{profile?.full_name || "Student"}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || "Student"}! 👋
          </h2>
          <p className="text-muted-foreground">
            Let's continue your learning journey
          </p>
        </div>

        <Tabs defaultValue="subjects" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="subjects" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Flashcards</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="gap-2">
              <span className="text-lg">🎯</span>
              <span className="hidden sm:inline">Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="hotseat" className="gap-2">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Hotseat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="animate-fade-in">
            <SubjectGrid />
          </TabsContent>

          <TabsContent value="flashcards" className="animate-fade-in">
            <FlashcardSection />
          </TabsContent>

          <TabsContent value="quizzes" className="animate-fade-in">
            <QuizSection />
          </TabsContent>

          <TabsContent value="schedule" className="animate-fade-in">
            <ScheduleSection userId={user.id} />
          </TabsContent>

          <TabsContent value="hotseat" className="animate-fade-in">
            <HotseatSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
