import { useEffect } from 'react';
import { useGetNICDetailsQuery } from '@/features/initiate-hearing/api/create-case/plaintiffDetailsApis';
import type { NICDetailsResponse } from '@/features/initiate-hearing/api/create-case/plaintiffDetailsApis';
import { toWesternDigits, isHijriDateInFuture } from '@/shared/lib/helpers';
import { useNICServiceErrorContext } from '@/shared/context/NICServiceErrorContext';






interface UseNICTriggerResult {
  refetch: () => void;
  isFetching: boolean;
}

/**
 * Hook to trigger NIC fetch when both ID and Hijri DOB are valid.
 *
 * @param id          10-digit ID string
 * @param hijriDob    8-digit Hijri DOB string
 * @param onSuccess   callback with NICDetails on successful fetch
 * @param onError     callback on fetch failure or no data
 * @param language    ISO language code, e.g. "EN" or "AR"
 */
export function useNICTrigger(
  id: string,
  hijriDob: string,
  onSuccess: (nicDetails: NICDetailsResponse['NICDetails']) => void,
  onError: () => void,
  language: string = 'EN'
): UseNICTriggerResult {
  const shouldSkip = !(id.length === 10 && hijriDob.length === 8) || isHijriDateInFuture(hijriDob);

  const { data, isFetching, isError, refetch } = useGetNICDetailsQuery(
    {
      IDNumber: id,
      DateOfBirth: toWesternDigits(hijriDob),
      AcceptedLanguage: language,
      SourceSystem: 'E-Services',
    },
    { skip: shouldSkip }
  );

  // Handle service errors
  const handleTryAgain = () => {
    refetch();
  };

  const { handleNICResponse, setTryAgainCallback } = useNICServiceErrorContext();

  // Set the try again callback when hook is used
  useEffect(() => {
    setTryAgainCallback(handleTryAgain);
  }, [setTryAgainCallback, handleTryAgain]);

  useEffect(() => {
    if (shouldSkip) return;
    
    // Check for service errors first
    if (data && handleNICResponse(data)) {
      return; // Service error was handled
    }
    
    if (isError || !data?.NICDetails) {
      onError();
    } else {
      onSuccess(data.NICDetails);
    }
  }, [data, isError, shouldSkip, onSuccess, onError, handleNICResponse]);

  return { refetch, isFetching };
}
