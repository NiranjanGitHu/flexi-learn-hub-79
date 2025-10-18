import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  category: string;
  description: string;
  level: string;
  color: string;
  is_common: boolean;
}

const SubjectGrid = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching subjects:", error);
    } else {
      setSubjects(data || []);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Science: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      Language: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      "Social Science": "bg-green-500/10 text-green-700 dark:text-green-300",
      Humanities: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
      Technology: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
      Arts: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
      Commerce: "bg-red-500/10 text-red-700 dark:text-red-300",
    };
    return colors[category] || "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Your Subjects</h3>
        <p className="text-muted-foreground">
          Explore and master your curriculum with interactive learning tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link 
            key={subject.id} 
            to={`/subject/${subject.id}`}
            className="group"
          >
            <Card 
              className="h-full transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer border-l-4"
              style={{ borderLeftColor: subject.color }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div 
                    className="p-3 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${subject.color}20` }}
                  >
                    <BookOpen className="h-6 w-6" style={{ color: subject.color }} />
                  </div>
                  {subject.is_common && (
                    <Badge variant="secondary" className="text-xs">
                      Core
                    </Badge>
                  )}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {subject.name}
                </CardTitle>
                <CardDescription>{subject.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(subject.category)}>
                    {subject.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {subject.level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubjectGrid;
