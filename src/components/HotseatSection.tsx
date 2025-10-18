import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Users, Clock, Video } from "lucide-react";
import { format } from "date-fns";

interface HotseatSession {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  max_participants: number;
  current_participants: number;
  status: string;
  subjects: {
    name: string;
    color: string;
  };
  tutors: {
    name: string;
    avatar_url: string;
  } | null;
}

const HotseatSection = () => {
  const [sessions, setSessions] = useState<HotseatSession[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from("hotseat_sessions")
      .select(`
        *,
        subjects (
          name,
          color
        ),
        tutors (
          name,
          avatar_url
        )
      `)
      .in("status", ["upcoming", "live"])
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error fetching hotseat sessions:", error);
    } else {
      setSessions(data || []);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      upcoming: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      live: "bg-red-500/10 text-red-700 dark:text-red-300 animate-pulse",
      ended: "bg-gray-500/10 text-gray-700 dark:text-gray-300",
    };
    return colors[status] || colors.upcoming;
  };

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Flame className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No hotseat sessions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Flame className="h-8 w-8 text-orange-500" />
          Hotseat Sessions
        </h3>
        <p className="text-muted-foreground">
          Join live interactive learning sessions with expert tutors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <Card 
            key={session.id}
            className="hover:scale-105 transition-all duration-300 hover:shadow-lg border-l-4"
            style={{ borderLeftColor: session.subjects.color }}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge 
                  style={{ 
                    backgroundColor: `${session.subjects.color}20`,
                    color: session.subjects.color 
                  }}
                >
                  {session.subjects.name}
                </Badge>
                <Badge className={getStatusColor(session.status)}>
                  {session.status === "live" ? "🔴 LIVE" : "Upcoming"}
                </Badge>
              </div>
              <CardTitle className="text-xl">{session.title}</CardTitle>
              <CardDescription>{session.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {session.tutors && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <img 
                    src={session.tutors.avatar_url} 
                    alt={session.tutors.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{session.tutors.name}</p>
                    <p className="text-xs text-muted-foreground">Session Host</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(session.start_time), "PPp")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {session.current_participants} / {session.max_participants} participants
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-secondary"
                disabled={session.current_participants >= session.max_participants}
              >
                <Video className="mr-2 h-4 w-4" />
                {session.status === "live" ? "Join Now" : "Register"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HotseatSection;
