import React, { useState } from "react";
import { app } from "../firebaseconfig";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setError] = useState("");
  const auth = getAuth(app);

  const login = async () => {
    if (email === "" || pass === "") {
      setError("Please Fill the Fld");
    } else {
      try {
        const user = await signInWithEmailAndPassword(auth, email, pass);
      } catch (err) {
        switch (err.code) {
          case "auth/user-exists":
            setError(`User Already Exist`);
            break;
          case "auth/invalid-email":
            setError(`Invalid Email`);

            break;
          case "auth/user-disabled":
            setError(`Your Account Is Disabled`);

            break;
          case "auth/weak-password":
            setError(`Password must atleat 6 characters`);

            break;
          case "auth/wrong-password":
            setError(`Wrong Password`);
            break;
          default:
            setError("Error From FireBase");
          // alert("User already exists");
        }
        // alert("error:" + );
      }
    }
  };
  return (
    <div>
      <div className="logo">
        <img src="https://www.pngall.com/wp-content/uploads/5/Profile-PNG-Images.png" />
      </div>
      <div className="text">
        <h1>Member Login</h1>
      </div>
      <div className="input">
        <input
          type="text"
          placeholder="username.."
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />
        <input
          type="password"
          placeholder="Password.."
          onChange={(e) => {
            setPass(e.target.value);
            setError("");
          }}
        />
        <button onClick={login}>Login</button>
      </div>
      <p style={{ textAlign: "center", color: "crimson" }}>{err}</p>
    </div>
  );
};

export default Login;
