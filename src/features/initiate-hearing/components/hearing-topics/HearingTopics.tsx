import { FormResetProvider } from '@/providers/FormResetProvider';
import { useFormContext } from 'react-hook-form';

interface HearingTopicsProps {
  t: (key: string) => string;
  isEditing?: boolean;
  editTopic?: any;
}

export const HearingTopics = ({ t, isEditing, editTopic }: HearingTopicsProps) => {
  const { control, setValue, watch, clearErrors } = useFormContext();

  return (
    <FormResetProvider setValue={setValue} clearErrors={clearErrors}>
      <div className="flex flex-col gap-4">
        {/* ... existing form content ... */}
      </div>
    </FormResetProvider>
  );
}; 