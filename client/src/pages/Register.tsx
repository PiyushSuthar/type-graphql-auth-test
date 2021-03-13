import React, { useState } from "react";
import { RouteComponentProps } from "react-router";
import { useRegisterMutation } from "../generated/graphql";

const Register: React.FC<RouteComponentProps> = ({ history }) => {
  const [email, setEmail] = useState("");
  const [password, setPasssword] = useState("");
  const [register] = useRegisterMutation();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        console.log("Form Submited");
        const response = await register({
          variables: {
            email,
            password,
          },
        });
        history.push('/')
        console.log(response);
      }}
    >
      <div>
        <input
          type="email"
          value={email}
          placeholder="email"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <input
          type="password"
          value={password}
          placeholder="password"
          onChange={(e) => {
            setPasssword(e.target.value);
          }}
        />
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
