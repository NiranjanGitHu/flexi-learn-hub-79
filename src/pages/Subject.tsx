import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlayCircle, Video } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  difficulty: string;
  thumbnail_url: string;
}

const Subject = () => {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);

  useEffect(() => {
    if (id) {
      fetchSubject();
      fetchTutorials();
    }
  }, [id]);

  const fetchSubject = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching subject:", error);
    } else {
      setSubject(data);
    }
  };

  const fetchTutorials = async () => {
    const { data, error } = await supabase
      .from("tutorials")
      .select("*")
      .eq("subject_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tutorials:", error);
    } else {
      setTutorials(data || []);
    }
  };

  if (!subject) return null;

  // Check if this is the Chemistry subject and show the uploaded video
  const isChemistry = subject.name.toLowerCase().includes("chemistry");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <div className="container mx-auto px-4 py-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <div 
            className="inline-block px-4 py-2 rounded-lg mb-4"
            style={{ backgroundColor: `${subject.color}20` }}
          >
            <Badge 
              className="text-lg"
              style={{ backgroundColor: subject.color, color: "white" }}
            >
              {subject.category}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-2">{subject.name}</h1>
          <p className="text-xl text-muted-foreground">{subject.description}</p>
        </div>

        {isChemistry && (
          <Card className="mb-8 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Featured: Introduction to Organic Chemistry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <video 
                controls 
                className="w-full rounded-lg shadow-lg"
                poster="https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=800"
              >
                <source src="/videos/chemistry-intro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <p className="mt-4 text-muted-foreground">
                Explore the fascinating world of organic chemistry in this comprehensive introduction
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Video Tutorials</h2>
        </div>

        {tutorials.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No tutorials available yet for this subject</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <Card 
                key={tutorial.id}
                className="hover:scale-105 transition-all duration-300 hover:shadow-lg overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={tutorial.thumbnail_url} 
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{tutorial.difficulty}</Badge>
                    <Badge variant="secondary">{tutorial.duration_minutes} min</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {tutorial.description}
                  </p>
                  <Button className="w-full">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Watch Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subject;
