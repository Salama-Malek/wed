export interface Step {
    title: string;
    description?: string;
  }
  
  export interface StepperProps {
    steps: Step[];
    currentStep: number;
  }
  
  export interface Step {
    title: string;
  }
  
  export interface MultiStepFormProps {
    steps?: Step[];
    components?: React.ComponentType[];
  }