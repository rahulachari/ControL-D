import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2, Volume2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ReminderManagerProps {
  userId: string;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ReminderManager = ({ userId }: ReminderManagerProps) => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [reminders, setReminders] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    time: "",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    soundEnabled: true,
    notes: "",
  });

  useEffect(() => {
    fetchReminders();
    checkReminders();
    
    // Check reminders every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchReminders = async () => {
    const { data } = await supabase
      .from("reminders")
      .select("*")
      .eq("user_id", userId)
      .order("time");

    if (data) {
      setReminders(data);
    }
  };

  const checkReminders = async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = now.getDay();

    reminders.forEach(reminder => {
      if (
        reminder.is_active &&
        reminder.time === currentTime + ":00" &&
        reminder.days_of_week.includes(currentDay) &&
        reminder.sound_enabled
      ) {
        playAlarm(reminder);
      }
    });
  };

  const playAlarm = (reminder: any) => {
    // Play a 3-second alarm sound
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3);

    toast({
      title: "⏰ Reminder",
      description: reminder.title,
      duration: 5000,
    });
  };

  const testSound = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("reminders").insert({
        user_id: userId,
        title: formData.title,
        reminder_type: formData.type,
        time: formData.time,
        days_of_week: formData.daysOfWeek,
        sound_enabled: formData.soundEnabled,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Reminder Added",
        description: "Your reminder has been set",
      });

      setFormData({
        title: "",
        type: "",
        time: "",
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        soundEnabled: true,
        notes: "",
      });
      setShowForm(false);
      fetchReminders();
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

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Reminder Deleted",
        description: "The reminder has been removed",
      });
      fetchReminders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("reminders")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      fetchReminders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="w-6 h-6 text-secondary" />
            Reminders
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testSound}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Test Sound
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Reminder
            </Button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg bg-muted/20 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Take medication"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="glucose_check">Glucose Check</SelectItem>
                    <SelectItem value="meal">Meal</SelectItem>
                    <SelectItem value="exercise">Exercise</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="flex gap-2">
                {DAYS.map((day, index) => (
                  <Button
                    key={day}
                    type="button"
                    variant={formData.daysOfWeek.includes(index) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleDay(index)}
                    className="w-14"
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sound"
                checked={formData.soundEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, soundEnabled: checked })}
              />
              <Label htmlFor="sound">Enable alarm sound</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-primary" disabled={loading}>
                {loading ? "Adding..." : "Add Reminder"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {reminders.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No reminders yet. Add your first reminder to stay on track!
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Switch
                    checked={reminder.is_active}
                    onCheckedChange={() => toggleReminder(reminder.id, reminder.is_active)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{reminder.title}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-secondary/20 text-secondary capitalize">
                        {reminder.reminder_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reminder.time.slice(0, 5)} • {reminder.days_of_week.map((d: number) => DAYS[d]).join(', ')}
                      {reminder.sound_enabled && " • 🔔"}
                    </div>
                    {reminder.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{reminder.notes}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteReminder(reminder.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReminderManager;