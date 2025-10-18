import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  subjects: {
    name: string;
    color: string;
  };
}

const FlashcardSection = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    const { data, error } = await supabase
      .from("flashcards")
      .select(`
        *,
        subjects (
          name,
          color
        )
      `)
      .limit(20);

    if (error) {
      console.error("Error fetching flashcards:", error);
    } else {
      setFlashcards(data || []);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No flashcards available yet</p>
        </CardContent>
      </Card>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">Flashcards</h3>
        <p className="text-muted-foreground">
          Quick revision tools to boost your memory
        </p>
      </div>

      <div className="perspective-1000">
        <Card 
          className={`relative min-h-[400px] cursor-pointer transition-all duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            borderLeftColor: currentCard.subjects.color,
            borderLeftWidth: '4px'
          }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge 
                style={{ 
                  backgroundColor: `${currentCard.subjects.color}20`,
                  color: currentCard.subjects.color 
                }}
              >
                {currentCard.subjects.name}
              </Badge>
              <Badge variant="outline">{currentCard.difficulty}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px]">
            <div className="text-center p-8">
              {!isFlipped ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">Question</p>
                  <p className="text-2xl font-medium">{currentCard.question}</p>
                  <p className="text-sm text-muted-foreground mt-6">
                    Click to reveal answer
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">Answer</p>
                  <p className="text-xl">{currentCard.answer}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={flashcards.length <= 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={flashcards.length <= 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardSection;
