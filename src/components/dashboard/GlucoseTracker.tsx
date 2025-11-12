import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { LineChart, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GlucoseTrackerProps {
  userId: string;
}

const GlucoseTracker = ({ userId }: GlucoseTrackerProps) => {
  const { toast } = useToast();
  const [reading, setReading] = useState("");
  const [context, setContext] = useState("");
  const [notes, setNotes] = useState("");
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetMin, setTargetMin] = useState(80);
  const [targetMax, setTargetMax] = useState(130);

  useEffect(() => {
    fetchReadings();
    fetchTargets();
  }, [userId]);

  const fetchTargets = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("target_glucose_min, target_glucose_max")
      .eq("id", userId)
      .single();

    if (data) {
      setTargetMin(data.target_glucose_min || 80);
      setTargetMax(data.target_glucose_max || 130);
    }
  };

  const fetchReadings = async () => {
    const { data } = await supabase
      .from("glucose_readings")
      .select("*")
      .eq("user_id", userId)
      .order("reading_time", { ascending: false })
      .limit(10);

    if (data) {
      setReadings(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("glucose_readings").insert({
        user_id: userId,
        reading: parseInt(reading),
        meal_context: context || null,
        notes: notes || null,
      });

      if (error) throw error;

      toast({
        title: "Reading Added",
        description: "Your glucose reading has been recorded",
      });

      setReading("");
      setContext("");
      setNotes("");
      fetchReadings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getReadingStatus = (value: number) => {
    if (value < targetMin) return { label: "Low", variant: "destructive" as const };
    if (value > targetMax) return { label: "High", variant: "warning" as const };
    return { label: "Normal", variant: "success" as const };
  };

  const averageReading = readings.length > 0
    ? Math.round(readings.reduce((sum, r) => sum + r.reading, 0) / readings.length)
    : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="glass-card p-6 lg:col-span-1">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-secondary" />
          Add Reading
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reading">Glucose Reading (mg/dL)</Label>
            <Input
              id="reading"
              type="number"
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              required
              placeholder="Enter reading"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger>
                <SelectValue placeholder="Select context" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fasting">Fasting</SelectItem>
                <SelectItem value="before_meal">Before Meal</SelectItem>
                <SelectItem value="after_meal">After Meal</SelectItem>
                <SelectItem value="bedtime">Bedtime</SelectItem>
                <SelectItem value="random">Random</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes"
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-primary" disabled={loading}>
            {loading ? "Adding..." : "Add Reading"}
          </Button>
        </form>
      </Card>

      <Card className="glass-card p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <LineChart className="w-5 h-5 text-secondary" />
            Recent Readings
          </h3>
          {readings.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Average: </span>
              <span className="font-semibold text-lg">{averageReading} mg/dL</span>
            </div>
          )}
        </div>

        {readings.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No readings yet. Add your first reading to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {readings.map((r) => {
              const status = getReadingStatus(r.reading);
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-bold">{r.reading}</span>
                      <span className="text-muted-foreground">mg/dL</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(r.reading_time).toLocaleString()}
                      {r.meal_context && ` • ${r.meal_context.replace('_', ' ')}`}
                    </div>
                    {r.notes && (
                      <p className="text-sm mt-1 text-muted-foreground">{r.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default GlucoseTracker;