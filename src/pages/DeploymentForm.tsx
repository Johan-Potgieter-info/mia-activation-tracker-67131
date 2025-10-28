import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FormSection } from "@/components/FormSection";
import { CounterInput } from "@/components/CounterInput";
import { CustomCounterInput } from "@/components/CustomCounterInput";
import { EquipmentChecklist } from "@/components/EquipmentChecklist";
import { supabase } from "@/integrations/supabase/client";

interface CustomMetric {
  name: string;
  value: number;
}

interface FormData {
  eventName: string;
  address: string;
  contact: string;
  lead: string;
  support: string;
  officer: string;
  startTime: string;
  endTime: string;
  peopleEngaged: number;
  bookings: number;
  customMetric1: CustomMetric;
  customMetric2: CustomMetric;
  customMetric3: CustomMetric;
  customMetric4: CustomMetric;
  selectedEquipment: string[];
  notes: string;
  success: string;
  improve: string;
  actions: string;
}

const teamMembers = ["Johan Potgieter (JP)", "Sethu Lucas (SL)", "Stefan Schoof (SS)"];

const timeOptions = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

export const DeploymentForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    eventName: "",
    address: "",
    contact: "",
    lead: "",
    support: "",
    officer: "",
    startTime: "",
    endTime: "",
    peopleEngaged: 0,
    bookings: 0,
    customMetric1: { name: "", value: 0 },
    customMetric2: { name: "", value: 0 },
    customMetric3: { name: "", value: 0 },
    customMetric4: { name: "", value: 0 },
    selectedEquipment: [],
    notes: "",
    success: "",
    improve: "",
    actions: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.eventName.trim()) newErrors.eventName = "Event name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.lead) newErrors.lead = "Team lead is required";
    if (!formData.support) newErrors.support = "Support member is required";
    if (!formData.officer) newErrors.officer = "Wellness officer is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";

    if (formData.endTime && formData.startTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number | string[] | CustomMetric) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCustomMetricNameChange = (metricKey: keyof FormData, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [metricKey]: { ...(prev[metricKey] as CustomMetric), name },
    }));
  };

  const handleCustomMetricValueChange = (metricKey: keyof FormData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [metricKey]: { ...(prev[metricKey] as CustomMetric), value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare custom metrics - only include ones with names
      const customMetrics: Record<string, any> = {};
      [
        { key: "customMetric1", data: formData.customMetric1 },
        { key: "customMetric2", data: formData.customMetric2 },
        { key: "customMetric3", data: formData.customMetric3 },
        { key: "customMetric4", data: formData.customMetric4 },
      ].forEach(({ key, data }, index) => {
        if (data.name.trim()) {
          customMetrics[`customMetric${index + 1}Name`] = data.name;
          customMetrics[`customMetric${index + 1}Value`] = data.value;
        }
      });

      // Prepare submission data
      const submissionData = {
        eventName: formData.eventName,
        address: formData.address,
        contact: formData.contact,
        lead: formData.lead,
        support: formData.support,
        officer: formData.officer,
        startTime: formData.startTime,
        endTime: formData.endTime,
        peopleEngaged: formData.peopleEngaged,
        bookings: formData.bookings,
        ...customMetrics,
        equipment: formData.selectedEquipment.join(", "),
        notes: formData.notes,
        success: formData.success,
        improve: formData.improve,
        actions: formData.actions,
        timestamp: new Date().toISOString(),
      };

      const GOOGLE_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbz0V3zAmGiAv8EKw-m-CSOqSwizfUUNiiQnMbcmATWflZ8daSiB0K70Ors_ARiqx9-9/exec";

      // Submit to Google Apps Script
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (result.status === "success") {
        // Also save to Lovable Cloud backend
        const { error: dbError } = await supabase
          .from("deployments")
          .insert({
            submission_id: result.submissionId,
            event_name: formData.eventName,
            address: formData.address,
            contact: formData.contact,
            lead: formData.lead,
            support: formData.support,
            officer: formData.officer,
            start_time: formData.startTime,
            end_time: formData.endTime,
            people_engaged: formData.peopleEngaged,
            bookings: formData.bookings,
            custom_metric_1_name: formData.customMetric1.name,
            custom_metric_1_value: formData.customMetric1.value,
            custom_metric_2_name: formData.customMetric2.name,
            custom_metric_2_value: formData.customMetric2.value,
            custom_metric_3_name: formData.customMetric3.name,
            custom_metric_3_value: formData.customMetric3.value,
            custom_metric_4_name: formData.customMetric4.name,
            custom_metric_4_value: formData.customMetric4.value,
            selected_equipment: formData.selectedEquipment,
            notes: formData.notes,
            success: formData.success,
            improve: formData.improve,
            actions: formData.actions,
          });

        if (dbError) {
          console.error("Database save error:", dbError);
          // Show warning but don't fail the submission since Google Sheets succeeded
          toast({
            title: "Partial Success",
            description: `Entry ${result.action === "updated" ? "updated" : "created"} in Google Sheets (ID: ${result.submissionId}), but backend save failed.`,
            variant: "destructive",
          });
        } else {
          const actionText = result.action === "updated" ? "updated" : "created";
          toast({
            title: `Success! Entry ${actionText}`,
            description: `Submission ID: ${result.submissionId}. Saved to both Google Sheets and backend.`,
          });
        }
      } else {
        throw new Error(result.message || "Submission failed");
      }

      // Reset form
      setFormData({
        eventName: "",
        address: "",
        contact: "",
        lead: "",
        support: "",
        officer: "",
        startTime: "",
        endTime: "",
        peopleEngaged: 0,
        bookings: 0,
        customMetric1: { name: "", value: 0 },
        customMetric2: { name: "", value: 0 },
        customMetric3: { name: "", value: 0 },
        customMetric4: { name: "", value: 0 },
        selectedEquipment: [],
        notes: "",
        success: "",
        improve: "",
        actions: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-2xl font-bold">Mia Healthcare – Demo Deployment</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormSection title="Deployment Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="eventName" className="text-base font-semibold">
                      Event Name *
                    </Label>
                    <Input
                      id="eventName"
                      placeholder="e.g., CPT | Check-Up | Mobile | FRG Portside | July 2025"
                      value={formData.eventName}
                      onChange={(e) => handleInputChange("eventName", e.target.value)}
                      className={errors.eventName ? "border-destructive" : ""}
                    />
                    {errors.eventName && <p className="text-sm text-destructive mt-1">{errors.eventName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-base font-semibold">
                      Site Address *
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="contact" className="text-base font-semibold">
                      Site Contact *
                    </Label>
                    <Input
                      id="contact"
                      placeholder="e.g., Jane Smith – 082 123 4567"
                      value={formData.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                      className={errors.contact ? "border-destructive" : ""}
                    />
                    {errors.contact && <p className="text-sm text-destructive mt-1">{errors.contact}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lead" className="text-base font-semibold">
                      Team Lead *
                    </Label>
                    <Select value={formData.lead} onValueChange={(value) => handleInputChange("lead", value)}>
                      <SelectTrigger className={errors.lead ? "border-destructive" : ""}>
                        <SelectValue placeholder="-- Select --" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.lead && <p className="text-sm text-destructive mt-1">{errors.lead}</p>}
                  </div>

                  <div>
                    <Label htmlFor="support" className="text-base font-semibold">
                      Support Member *
                    </Label>
                    <Select value={formData.support} onValueChange={(value) => handleInputChange("support", value)}>
                      <SelectTrigger className={errors.support ? "border-destructive" : ""}>
                        <SelectValue placeholder="-- Select --" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.support && <p className="text-sm text-destructive mt-1">{errors.support}</p>}
                  </div>

                  <div>
                    <Label htmlFor="officer" className="text-base font-semibold">
                      Wellness Officer *
                    </Label>
                    <Select value={formData.officer} onValueChange={(value) => handleInputChange("officer", value)}>
                      <SelectTrigger className={errors.officer ? "border-destructive" : ""}>
                        <SelectValue placeholder="-- Select --" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member} value={member}>
                            {member}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.officer && <p className="text-sm text-destructive mt-1">{errors.officer}</p>}
                  </div>

                  <div>
                    <Label htmlFor="startTime" className="text-base font-semibold">
                      Start Time *
                    </Label>
                    <Select value={formData.startTime} onValueChange={(value) => handleInputChange("startTime", value)}>
                      <SelectTrigger className={errors.startTime ? "border-destructive" : ""}>
                        <SelectValue placeholder="-- Select Start Time --" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.startTime && <p className="text-sm text-destructive mt-1">{errors.startTime}</p>}
                  </div>

                  <div>
                    <Label htmlFor="endTime" className="text-base font-semibold">
                      End Time
                    </Label>
                    <Select value={formData.endTime} onValueChange={(value) => handleInputChange("endTime", value)}>
                      <SelectTrigger className={errors.endTime ? "border-destructive" : ""}>
                        <SelectValue placeholder="-- Select End Time --" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.endTime && <p className="text-sm text-destructive mt-1">{errors.endTime}</p>}
                  </div>
                </div>
              </FormSection>

              <FormSection title="Metrics">
                <CounterInput
                  label="People Engaged"
                  value={formData.peopleEngaged}
                  onChange={(value) => handleInputChange("peopleEngaged", value)}
                />
                <CounterInput
                  label="Bookings Captured"
                  value={formData.bookings}
                  onChange={(value) => handleInputChange("bookings", value)}
                />

                <div className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">Additional Metrics (Optional)</h3>
                  <CustomCounterInput
                    label="Custom Metric 1"
                    metricName={formData.customMetric1.name}
                    value={formData.customMetric1.value}
                    onNameChange={(name) => handleCustomMetricNameChange("customMetric1", name)}
                    onValueChange={(value) => handleCustomMetricValueChange("customMetric1", value)}
                  />
                  <CustomCounterInput
                    label="Custom Metric 2"
                    metricName={formData.customMetric2.name}
                    value={formData.customMetric2.value}
                    onNameChange={(name) => handleCustomMetricNameChange("customMetric2", name)}
                    onValueChange={(value) => handleCustomMetricValueChange("customMetric2", value)}
                  />
                  <CustomCounterInput
                    label="Custom Metric 3"
                    metricName={formData.customMetric3.name}
                    value={formData.customMetric3.value}
                    onNameChange={(name) => handleCustomMetricNameChange("customMetric3", name)}
                    onValueChange={(value) => handleCustomMetricValueChange("customMetric3", value)}
                  />
                  <CustomCounterInput
                    label="Custom Metric 4"
                    metricName={formData.customMetric4.name}
                    value={formData.customMetric4.value}
                    onNameChange={(name) => handleCustomMetricNameChange("customMetric4", name)}
                    onValueChange={(value) => handleCustomMetricValueChange("customMetric4", value)}
                  />
                </div>
              </FormSection>

              <FormSection title="Checklist">
                <EquipmentChecklist
                  selectedEquipment={formData.selectedEquipment}
                  onChange={(equipment) => handleInputChange("selectedEquipment", equipment)}
                />
              </FormSection>

              <FormSection title="Notes">
                <div>
                  <Label htmlFor="notes" className="text-base font-semibold">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Anything else to note..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </FormSection>

              <FormSection title="Post Mortem">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="success" className="text-base font-semibold">
                      What went well?
                    </Label>
                    <Textarea
                      id="success"
                      value={formData.success}
                      onChange={(e) => handleInputChange("success", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="improve" className="text-base font-semibold">
                      What needs improvement?
                    </Label>
                    <Textarea
                      id="improve"
                      value={formData.improve}
                      onChange={(e) => handleInputChange("improve", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="actions" className="text-base font-semibold">
                      Follow-up Actions
                    </Label>
                    <Textarea
                      id="actions"
                      value={formData.actions}
                      onChange={(e) => handleInputChange("actions", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </FormSection>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary-hover"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeploymentForm;
