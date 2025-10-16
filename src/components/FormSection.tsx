import React from "react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-primary border-b-2 border-primary pb-2 mb-6">
        {title}
      </h2>
      {children}
    </div>
  );
};