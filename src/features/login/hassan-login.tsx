import React, { useState } from "react";
import logo from "@/assets/logo.svg";
import FormWrapper from "@/shared/components/form/FormWrapper";
import * as jose from "jose";
import { useNavigate } from "react-router-dom";
const userTypes = [
  { value: "establishment", label: "Establishment" },
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
  const [form, setForm] = useState<FormState>({
    File_Number: "",
    UserDOB: "14041218",
    UserID: "1028308656",
    UserName: "salama agent",
    AcceptedLanguage: LanguageArray[0].value,
    UserType: userTypes[0].value,
  });

  const navegator = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const secret = new TextEncoder().encode(
        "Your_Secure_Key_1234567890_ABCDEFGH"
      );
      const token = await new jose.SignJWT({
        UserType: form.UserType,
        UserID: form.UserID,
        UserName: form.UserName,
        UserDOB: form.UserDOB,
        File_Number: form.File_Number,
        AcceptedLanguage: form.AcceptedLanguage,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuer("MyClients")
        .setAudience("WEDDI_PORTAL")
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(secret);

      navegator(`/?MyClientsToken=${token}`);
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
                placeholder={"yyy-dd-mm ex: 1391-22-06"}
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
                <label>User Type</label>
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
                <label>Accepted Language</label>
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
