import { Tick02Icon } from "hugeicons-react";
import { StepperProps } from "./stepper.types";
import HearingSideHeader from "@/shared/components/ui/hearing-side-header/HearingSideHeader";

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <aside className="w-auto bg-gray-50 h-full rounded-md overflow-hidden">
  
    <HearingSideHeader/>

      <div className="w-full pr-7xl py-11xl">
        <ol className="flex flex-col">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start transition-all duration-700 ease-linear">
              <div className="flex flex-col items-center pl-7xl">
                <span
                  className={`relative z-10 w-[32px] h-[32px] flex items-center justify-center rounded-full border-2 text-sm medium transition-all duration-700 ease-linear
                    ${
                      index === currentStep
                        ? "border-primary-600 bg-white text-primary-600"
                        : index < currentStep
                        ? "bg-primary-600 text-white border-primary-600"
                        : " text-gray-300 border-2 border-gray-300"
                    }
                  `}
                >
                  {index < currentStep ? <Tick02Icon strokeWidth={3} size={16} /> : index + 1}
                </span>

                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-24 transition-all duration-700 ease-linear ${
                      index < currentStep ? "bg-primary-600" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>

              <div className="ml-4">
                <h4
                  className={
                    index === currentStep
                      ? "text-gray-800 medium text-md transition-all duration-700 ease-linear"
                      : index < currentStep
                      ? "text-gray-700 normal text-md transition-all duration-700 ease-linear"
                      : "text-gray-990 normal  text-md transition-all duration-700 ease-linear"
                  }
                >
                  {step.title}
                </h4>
                <span
                  className={
                    index === currentStep
                      ? "text-gray-700 regular leading-3 text-sm transition-all duration-700 ease-linear"
                      : index < currentStep
                      ? "text-gray-700 regular text-md transition-all duration-700 ease-linear"
                      : "text-gray-990 ibn-400  text-sm transition-all duration-700 ease-linear"
                  }
                >
                  {step.description}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
};

export default Stepper;