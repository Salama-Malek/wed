import HearingTopicsDetails from ".";
import EditHearingTopicsDetails from "./edit-index";
// import HearingTopicsRefactored from "./HearingTopicsRefactored"; 

const AddHearing = ({ displayFooter }: { displayFooter: boolean }) => {
  // console.log("[🔍 ADD HEARING DEBUG] displayFooter:", displayFooter);
  // console.log("[🔍 ADD HEARING DEBUG] Using component:", displayFooter ? "HearingTopicsDetails" : "EditHearingTopicsDetails");
  
  return (
    <>
      {displayFooter && (
        <div>
          <HearingTopicsDetails showFooter={displayFooter} />
        </div>
      )}
      {!displayFooter && (
        <div>
          {/* <HearingTopicsRefactored showFooter={displayFooter} /> */}
          <EditHearingTopicsDetails showFooter={displayFooter} />
        </div>
      )}
    </>
  );
};

export default AddHearing;
