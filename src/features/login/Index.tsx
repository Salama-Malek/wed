import React, { useEffect, useState } from "react";
import logo from "@/assets/logo.svg";
import FormWrapper from "@/shared/components/form/FormWrapper";
import * as jose from "jose";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCookieState } from "../initiate-hearing/hooks/useCookieState";
import { toHijri_YYYYMMDD } from "@/shared/lib/helpers";
const userTypes = [
  { value: "EstablishmentUser", label: "Establishment" },
  { value: "worker", label: "Worker" },

];

const LanguageArray = [
  { value: "AR", label: "Arabic" },
  { value: "EN", label: "English" },
];

interface InputFieldProps {
  title?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const InputForm: React.FC<InputFieldProps> = ({
  title,
  id,
  name,
  placeholder,
  value,
  className,
  onChange,
  type = "text",
}) => {
  return (
    <div className="p-2 lg:w-1/2 w-full">
      {title && (
        <label htmlFor={id}>
          {title} {""}
          <span className="text-red-300">*</span>
        </label>
      )}
      <input
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
      />
    </div>
  );
};

interface FormState {
  AcceptedLanguage: string;
  File_Number: string;
  UserDOB: string;
  UserID: string;
  UserName: string;
  UserType: string;
}

const getCurrentDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};




const LoginForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromURL = searchParams.get("MyClientsToken");

  // useEffect(() => {
  //   if (!tokenFromURL) {
  //     window.location.href = `${process.env.VITE_REDIRECT_URL}`;
  //   }
  // }, [tokenFromURL]);


  const userLoginlistData = [
    {
      lable: "embasy user",
      data: {
        File_Number: "",
        UserDOB: "07/11/1985",
        UserID: "1022190118",
        UserName: "Embasy User",
        AcceptedLanguage: LanguageArray[1].value,
        UserType: userTypes[1].value,
      }
    },
    {
      lable: "Legel Rep User",
      data: {
        File_Number: "",
        UserID: "1078229067",
        UserName: "Worker User",
        UserDOB: "26/11/1962",
        AcceptedLanguage: LanguageArray[1].value,
        UserType: userTypes[1].value,
      }
    },
    {
      lable: "worker",
      data: {
        File_Number: "",
        UserID: "1003489059",
        UserName: "Worker User",
        UserDOB: "25/10/1965",
        AcceptedLanguage: LanguageArray[1].value,
        UserType: userTypes[1].value,
      }
    },
    {
      lable: "Worker Agent User",
      data: {
        File_Number: "",
        UserDOB: "18/05/1997",
        UserID: "1099099598",
        UserName: "Agent User",
        AcceptedLanguage: LanguageArray[1].value,
        UserType: userTypes[1].value,
      }
    },
    {
      lable: "Worker Agent User 222",
      data: {
        File_Number: "",
        UserDOB: "26/10/1965",
        UserID: "1003489059",
        UserName: "Agent User",
        AcceptedLanguage: LanguageArray[1].value,
        UserType: userTypes[1].value,
      }
    },
    // {
    //   lable: "Worker Agent User 222",
    //   data: {
    //     File_Number: "",
    //     UserDOB: "13/09/1984",
    //     UserID: "1028308656",
    //     UserName: "Agent User",
    //     AcceptedLanguage: LanguageArray[1].value,
    //     UserType: userTypes[1].value,
    //   }
    // },
    {
      lable: "Esablishment User",
      data: {
        // File_Number: "8-71322",
        File_Number: "8-71322",
        UserDOB: "01/01/1980",
        UserID: "1124878024",
        UserName: "Est User",
        AcceptedLanguage: LanguageArray[1].value,
        UserType: userTypes[0].value,
      }
    },
    {
      lable: "Esablishment User without city",
      data: {
         File_Number: "11-1437115",
        UserDOB: "01/01/1980",
        UserID: "1100055753",
        UserName: "Est User",
        AcceptedLanguage: LanguageArray[1].value,
        UserType: userTypes[0].value,
      }
    },
    {
      lable: "Esablishment User without Rigion",
      data: {
         File_Number: "8-71322",
        UserDOB: "01/01/1980",
        UserID: "1124878024",
        UserName: "Est User",
        AcceptedLanguage: LanguageArray[1].value,
        UserType: userTypes[0].value,
      }
    }
  ]


  const [form, setForm] = useState<FormState>({
    File_Number: "",
    UserDOB: "07/11/1985",
    UserID: "1022190118",
    UserName: "Embasy User",
    AcceptedLanguage: LanguageArray[1].value,
    UserType: userTypes[1].value,
  });

  const [, , , removeAll] = useCookieState();

  const navegator = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    removeAll();
    localStorage.clear();
  }, [])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = userLoginlistData.find(user => user.lable === e.target.value);
    if (selectedUser) {
      setForm(selectedUser.data);
    }
  };

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const secret = new TextEncoder().encode(`${process.env.VITE_API_SECRET}`);
      const token = await new jose.SignJWT({
        UserType: form.UserType,
        UserID: form.UserID,
        UserName: form.UserName,
        UserDOB: form.UserDOB,
        File_Number: form.File_Number,
        AcceptedLanguage: form.AcceptedLanguage,
      })
        .setProtectedHeader({ alg: `${process.env.VITE_API_SECRET_ALG}` })
        .setIssuer(`${process.env.VITE_API_ISSUSER}`)
        .setAudience(`${process.env.VITE_API_AUDIENCE}`)
        .setIssuedAt()
        .setExpirationTime(`${process.env.VITE_API_EXPIR_TIME}`)
        .sign(secret);

      navegator(`/?MyClientsToken=${token}`)

    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <section className="container m-auto min-h-screen flex justify-center items-center">
        <div className="shadow-3 card mx-auto mt-10 p-10 max-w-lg shadow-lg rounded-lg bg-white flex flex-col gap-10">
          <img src={logo} alt="Logo" className="lg:h-12 md:h-12 sm:h-12 h-10" />
          <FormWrapper isValid={!isLoading} onSubmit={handleSubmit}>
            <p className="text-red-500 text-center">The Date Format Should Be  (DD/MM/YYYY)</p>
            <p className="text-red-500 text-center">In Worker User , Delete File Number</p>

            <div className="w-full p-2">
              <label className="block mb-2">
                Select User
                <span className="text-red-300">*</span>
              </label>
              <select
                onChange={handleUserSelect}
                className="input border border-gray-300 rounded-md p-2 w-full"
                defaultValue=""
              >
                <option value="" disabled>Select a user</option>
                {userLoginlistData.map((user) => (
                  <option key={user.lable} value={user.lable}>
                    {user.lable}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap ">
              <InputForm
                title={"File Number"}
                name="File_Number"
                placeholder={"Enter file number"}
                value={form.File_Number}
                onChange={handleChange}
                className="input border border-gray-300 rounded-md p-2 w-full"
              />
              <InputForm
                title={"Date of Birth"}
                name="UserDOB"
                type="text"
                placeholder={"yyy-dd-mm ex: 1400-18-01"}
                value={form.UserDOB}
                onChange={handleChange}
                className="input border border-gray-300 rounded-md p-2 w-full"
              />
              <InputForm
                title={"User ID"}
                name="UserID"
                placeholder={"Enter user ID"}
                value={form.UserID}
                onChange={handleChange}
                className="input border border-gray-300 rounded-md p-2 w-full"
              />
              <InputForm
                title={"User Name"}
                name="UserName"
                placeholder={"Enter user name"}
                value={form.UserName}
                onChange={handleChange}
                className="input border border-gray-300 rounded-md p-2 w-full"
              />
              <div className="lg:w-1/2 w-full p-1">
                <label>
                  User Type
                </label>
                <select
                  name="UserType"
                  value={form.UserType}
                  onChange={handleChange}
                  className="input border border-gray-300 rounded-md p-2 w-full"
                >
                  {userTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:w-1/2 w-full p-1">
                <label>
                  Accepted Language
                </label>
                <select
                  name="AcceptedLanguage"
                  value={form.AcceptedLanguage}
                  onChange={handleChange}
                  className="input border border-gray-300 rounded-md p-2 w-full"
                >
                  {LanguageArray.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormWrapper>
        </div>
      </section>
    </main>
  );
};

export default LoginForm;
