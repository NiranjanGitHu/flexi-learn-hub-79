import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, Target } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  time_limit_minutes: number;
  subjects: {
    name: string;
    color: string;
  };
}

const QuizSection = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("quizzes")
      .select(`
        *,
        subjects (
          name,
          color
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching quizzes:", error);
    } else {
      setQuizzes(data || []);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Easy: "bg-green-500/10 text-green-700 dark:text-green-300",
      Medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
      Hard: "bg-red-500/10 text-red-700 dark:text-red-300",
    };
    return colors[difficulty] || "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  };

  if (quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No quizzes available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Interactive Quizzes</h3>
        <p className="text-muted-foreground">
          Test your knowledge and track your progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card 
            key={quiz.id}
            className="hover:scale-105 transition-all duration-300 hover:shadow-lg border-l-4"
            style={{ borderLeftColor: quiz.subjects.color }}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge 
                  style={{ 
                    backgroundColor: `${quiz.subjects.color}20`,
                    color: quiz.subjects.color 
                  }}
                >
                  {quiz.subjects.name}
                </Badge>
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {quiz.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.time_limit_minutes} min</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-primary">
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizSection;
