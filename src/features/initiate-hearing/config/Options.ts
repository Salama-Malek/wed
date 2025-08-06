  //<===================== Claimant’s Details Government Entity Against a Worker ====================>
    // const formLayout: SectionLayout[] = [
    //   {
    //     title: "Claimant’s Details",
    //     isRadio: true,
    //     children: [
    //       {
    //         type: "radio",
    //         name: "claimantStatus",
    //         label: "Claimant’s Status",
    //         options: ApplicantRadioOptions,
    //         value: selectedStatus,
    //         onChange: setSelectedStatus,
    //       },
    //     ],
    //   },
    //   {
    //     title: "",
    //     children: [
    //       {
    //         type: "autocomplete",
    //         label: "Main Category of the Government Entity",
    //         options: options,
    //         value: selectedOption,
    //         onChange: setSelectedOption,
    //         invalidFeedback: selectedOption === "" ? "Select" : "",
    //       },
    //       {
    //         type: "autocomplete",
    //         label: "Subcategory of the Government Entity",
    //         options: options,
    //         value: selectedOption,
    //         onChange: setSelectedOption,
    //         invalidFeedback: selectedOption === "" ? "Select" : "",
    //       }
    //     ],
    //   },
    //   {
    //     title:"Legal Representative's Details",
    //     children: [
    //       {
    //         type: "input",
    //         name: "phoneNumber",
    //         label: "Legal Representative's ID",
    //         inputType: "text",
    //         register: register,
    //         errors: errors,
    //       },
    //       {
    //         type: "input",
    //         name: "phoneNumber",
    //         label: "Legal Representative's Name",
    //         inputType: "text",
    //         register: register,
    //         errors: errors,
    //       },
    //       {
    //         type: "input",
    //         name: "phoneNumber",
    //         label: "Phone Number",
    //         inputType: "text",
    //         register: register,
    //         errors: errors,
    //       },
    //       {
    //         type: "input",
    //         name: "phoneNumber",
    //         label: "Email",
    //         inputType: "text",
    //         register: register,
    //         errors: errors,
    //       },
    //     ],
    //   }
    // ];




      //<===================== Claimant’s Details for Non-Governmental Establishment Against a Worker ====================>
  // const formLayout: SectionLayout[] = [
  //   {
  //     title: "",
  //     children: [
  //       {
  //         type: "input",
  //         name: "username",
  //         label: "Establishment Name",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //       {
  //         type: "input",
  //         name: "idNumber",
  //         label: "File Number",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //       {
  //         type: "input",
  //         name: "idNumber",
  //         label: "Commercial Registration Number",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //       {
  //         type: "input",
  //         name: "idNumber",
  //         label: "Unified National Number",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //       {
  //         type: "autocomplete",
  //         label: "Region",
  //         options: options,
  //         value: selectedOption,
  //         onChange: setSelectedOption,
  //         invalidFeedback: selectedOption === "" ? "Select" : "",
  //       },
  //       {
  //         type: "autocomplete",
  //         label: "City",
  //         options: options,
  //         value: selectedOption,
  //         onChange: setSelectedOption,
  //         invalidFeedback: selectedOption === "" ? "Select" : "",
  //       },
  //       {
  //         type: "input",
  //         name: "idNumber",
  //         label: "City",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //     ]
  //   }
  // ];

  //<===================== 	2.	Defendant’s Details+ for Non-Governmental Establishment Against a Worker ====================>-
  // const formLayout: SectionLayout[] = [
  //   {
  //     title: "",
  //     children: [
  //       {
  //         type: "input",
  //         name: "username",
  //         label: "Establishment Name",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //       {
  //         type: "input",
  //         name: "idNumber",
  //         label: "File Number",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //       {
  //         type: "input",
  //         name: "idNumber",
  //         label: "Commercial Registration Number",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //       {
  //         type: "input",
  //         name: "idNumber",
  //         label: "Unified National Number",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //       {
  //         type: "autocomplete",
  //         label: "Region",
  //         options: options,
  //         value: selectedOption,
  //         onChange: setSelectedOption,
  //         invalidFeedback: selectedOption === "" ? "Select" : "",
  //       },
  //       {
  //         type: "autocomplete",
  //         label: "City",
  //         options: options,
  //         value: selectedOption,
  //         onChange: setSelectedOption,
  //         invalidFeedback: selectedOption === "" ? "Select" : "",
  //       },
  //       {
  //         type: "input",
  //         name: "idNumber",
  //         label: "City",
  //         inputType: "text",
  //         register: register,
  //         errors: errors,
  //       },
  //     ]
  //   }
  // ];


  export const options = [
    { value: "WR-1", label: "Wage Request 1" },
    { value: "WR-2", label: "Wage Request 2" },
    {value:"MIR-1",label:"Medical Insurance Request"},
    {value:"BPSR-1",label:"Bonus Profit Share Request"},
    {value:"BR-1",label:"Bonus Request"}

  ];