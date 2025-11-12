import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    age: "",
    diabetesType: "",
    weight: "",
    height: "",
    targetGlucoseMin: "80",
    targetGlucoseMax: "130",
    activityLevel: "",
    medications: [] as string[],
    allergies: [] as string[],
    dietaryPreferences: [] as string[],
  });

  const [currentInput, setCurrentInput] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const addItem = (field: 'medications' | 'allergies' | 'dietaryPreferences') => {
    if (currentInput.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], currentInput.trim()]
      }));
      setCurrentInput("");
    }
  };

  const removeItem = (field: 'medications' | 'allergies' | 'dietaryPreferences', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          age: parseInt(formData.age),
          diabetes_type: formData.diabetesType,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          target_glucose_min: parseInt(formData.targetGlucoseMin),
          target_glucose_max: parseInt(formData.targetGlucoseMax),
          activity_level: formData.activityLevel,
          medications: formData.medications,
          allergies: formData.allergies,
          dietary_preferences: formData.dietaryPreferences,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Complete!",
        description: "Your health profile has been saved",
      });
      navigate("/dashboard");
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diabetesType">Diabetes Type</Label>
              <Select value={formData.diabetesType} onValueChange={(value) => setFormData({ ...formData, diabetesType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type1">Type 1</SelectItem>
                  <SelectItem value="type2">Type 2</SelectItem>
                  <SelectItem value="prediabetes">Prediabetes</SelectItem>
                  <SelectItem value="gestational">Gestational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={formData.activityLevel} onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Health Details</h2>

            <div className="space-y-2">
              <Label>Medications</Label>
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Enter medication name"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('medications'))}
                />
                <Button type="button" onClick={() => addItem('medications')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.medications.map((med, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => removeItem('medications', i)}>
                    {med} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Allergies</Label>
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Enter allergy"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('allergies'))}
                />
                <Button type="button" onClick={() => addItem('allergies')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.allergies.map((allergy, i) => (
                  <Badge key={i} variant="destructive" className="cursor-pointer" onClick={() => removeItem('allergies', i)}>
                    {allergy} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dietary Preferences</Label>
              <div className="flex gap-2">
                <Input
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder="Enter dietary preference"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('dietaryPreferences'))}
                />
                <Button type="button" onClick={() => addItem('dietaryPreferences')}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.dietaryPreferences.map((pref, i) => (
                  <Badge key={i} className="cursor-pointer bg-accent" onClick={() => removeItem('dietaryPreferences', i)}>
                    {pref} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetMin">Target Glucose Min (mg/dL)</Label>
                <Input
                  id="targetMin"
                  type="number"
                  value={formData.targetGlucoseMin}
                  onChange={(e) => setFormData({ ...formData, targetGlucoseMin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetMax">Target Glucose Max (mg/dL)</Label>
                <Input
                  id="targetMax"
                  type="number"
                  value={formData.targetGlucoseMax}
                  onChange={(e) => setFormData({ ...formData, targetGlucoseMax: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Activity className="w-12 h-12 text-secondary mx-auto mb-4" />
          <h1 className="text-3xl font-bold gradient-text mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Step {step} of 2
          </p>
        </div>

        <div className="glass-card p-8 rounded-xl">
          {renderStep()}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
            )}
            
            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="ml-auto bg-gradient-primary"
                disabled={!formData.age || !formData.diabetesType || !formData.weight || !formData.height || !formData.activityLevel}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="ml-auto bg-gradient-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;