// import { useCallback, useState } from 'react';
// import {
//   useSaveClaimantDetailsMutation,
//   useSaveDefendantDetailsMutation,
//   useSaveWorkDetailsMutation,
//   useSaveHearingTopicsMutation,
//   useSubmitReviewMutation,
// } from '../api/create-case/apis';
// import { useCookieService } from '@/shared/hooks/useCookies';
// import { update } from 'lodash';

// export const useCaseAPI = () => {
//   const [caseNumber, setCaseNumber] = useState<string | null>(null);
//   const { set, get } = useCookieService(); 

//   const savedCaseNumber = get<string>('caseNumber');
//   if (savedCaseNumber && !caseNumber) {
//     setCaseNumber(savedCaseNumber);
//   }

//   const [saveClaimantDetails,isSuccess] = useSaveClaimantDetailsMutation();
//   const [saveDefendantDetails] = useSaveDefendantDetailsMutation();
//   const [saveWorkDetails] = useSaveWorkDetailsMutation();
//   const [saveHearingTopics] = useSaveHearingTopicsMutation();
//   const [submitReview] = useSubmitReviewMutation();

//   const handleSaveOrSubmit = useCallback(
//     async (currentStep: number, currentTab: number, payload: any) => {
//       try {
//         let response;

//         const updatedPayload = { ...payload, CaseNumber: caseNumber ?? payload.CaseNumber };

//         if (currentStep === 0) {
//           switch (currentTab) {
//             case 0:
//               response = await saveClaimantDetails(updatedPayload).unwrap();
//               if (response?.CaseNumber) {
//                 setCaseNumber(response.CaseNumber);
//                 set('caseNumber', response.CaseNumber, { path: '/', maxAge: 60 * 60 * 24 }); 
//               }
//               break;
//             case 1:
//               response = await saveDefendantDetails(updatedPayload).unwrap();
//               break;
//             case 2:
//               response = await saveWorkDetails(updatedPayload).unwrap();
//               break;
//             default:
//               throw new Error('Invalid tab');
//           }
//         } else if (currentStep === 1) {
//           response = await saveHearingTopics(updatedPayload).unwrap();
//         } else if (currentStep === 2) {
//           response = await submitReview(updatedPayload).unwrap();
//         } else {
//           throw new Error('Invalid step');
//         }

//         return response;
//       } catch (error) {
//         throw error;
//       }
//     },
//     [caseNumber, saveClaimantDetails, saveDefendantDetails, saveWorkDetails, saveHearingTopics, submitReview, set]
//   );

//   return { handleSaveOrSubmit, caseNumber };
// };