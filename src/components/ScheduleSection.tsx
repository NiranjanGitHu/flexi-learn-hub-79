import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { format } from "date-fns";

interface Schedule {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  type: string;
  subjects: {
    name: string;
    color: string;
  } | null;
}

interface ScheduleSectionProps {
  userId: string;
}

const ScheduleSection = ({ userId }: ScheduleSectionProps) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    if (userId) {
      fetchSchedules();
    }
  }, [userId]);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select(`
        *,
        subjects (
          name,
          color
        )
      `)
      .eq("user_id", userId)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error fetching schedules:", error);
    } else {
      setSchedules(data || []);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      class: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      study: "bg-green-500/10 text-green-700 dark:text-green-300",
      exam: "bg-red-500/10 text-red-700 dark:text-red-300",
      hotseat: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
      other: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
    };
    return colors[type] || colors.other;
  };

  const getTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      class: "📚",
      study: "📖",
      exam: "📝",
      hotseat: "🔥",
      other: "📅",
    };
    return emojis[type] || emojis.other;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-2">Your Schedule</h3>
          <p className="text-muted-foreground">
            Plan and manage your learning sessions
          </p>
        </div>
        <Button className="bg-gradient-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No upcoming events</p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((schedule) => (
            <Card 
              key={schedule.id}
              className="hover:shadow-lg transition-all duration-300 border-l-4"
              style={{ borderLeftColor: schedule.subjects?.color || "#6B7280" }}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeEmoji(schedule.type)}</span>
                    <Badge className={getTypeColor(schedule.type)}>
                      {schedule.type}
                    </Badge>
                  </div>
                  {schedule.subjects && (
                    <Badge 
                      style={{ 
                        backgroundColor: `${schedule.subjects.color}20`,
                        color: schedule.subjects.color 
                      }}
                    >
                      {schedule.subjects.name}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{schedule.title}</CardTitle>
                <CardDescription>{schedule.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(schedule.start_time), "PPP")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(schedule.start_time), "p")} - {format(new Date(schedule.end_time), "p")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleSection;
