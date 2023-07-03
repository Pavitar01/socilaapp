import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import { app } from "../firebaseconfig";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const Signup = ({ setIslogin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [cpass, setCpass] = useState("");
  const [err, setErr] = useState("");
  const [Image, setImage] = useState(
    "https://merchantadvocate.com/wp-content/uploads/2018/06/user.png"
  );
  const auth = getAuth(app);
  const db = getFirestore(app);
  const SignUp = async () => {
    if (email === "" || pass === "" || cpass === "") {
      setErr("Please Fill the Feild");
    } else if (pass !== cpass) {
      setErr("Both Pass Should Match");
    } else {
      try {
        createUserWithEmailAndPassword(auth, email, pass)
          .then(async (res) => {
            console.log(res);
            const user = res.user;
            await updateProfile(user, {
              displayName: email.slice(1, 5),
              photoURL: Image,
            });
            alert("Thanks For Becoming A  User");
            setIslogin(true);
            const q1 = query(
              collection(db, "User"),
              where("uid", "==", user.uid)
            );
            const querysnap = await getDocs(q1);

            if (querysnap.empty) {
              await addDoc(collection(db, "User"), {
                name: user.displayName,
                uid: user.uid,
                url: user.photoURL,
                flag: true,
                createdAt: serverTimestamp(),
              });
            } else {
              let i = "";
              querysnap.forEach((doc) => (i = doc.id));

              const ref = doc(db, "User", i);
              await updateDoc(ref, {
                flag: true,
              });
            }
          })
          .catch((err) => {
            switch (err.code) {
              case "auth/user-exists":
                setErr(`User Already Exist`);
                break;
              case "auth/invalid-email":
                setErr(`Invalid Email`);

                break;
              case "auth/user-disabled":
                setErr(`Your Account Is Disabled`);

                break;
              case "auth/weak-password":
                setErr(`Password must atleat 6 characters`);

                break;
              case "auth/wrong-password":
                setErr(`Wrong Password`);
                break;
              default:
                setErr("Error From FireBase");
              // alert("User already exists");
            }
            // alert("error:" + );
          });
      } catch (err) {
        alert("err");
      }
    }
  };
  const onChangePicture = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (ev) {
      const url = ev.target.result;
      setImage(url);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <div className="text">
        <h1>Register Form</h1>
      </div>
      <div className="signup">
        <div
          className="userimage"
          style={{
            backgroundImage: `url('${Image}')`,
            width: "200px",
            marginLeft: "170px",
            height: "200px",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
          }}
        >
          <input
            type="file"
            onChange={onChangePicture}
            style={{
              opacity: "0",
              width: "100%",
              height: "100%",
              cursor: "pointer",
            }}
          />
        </div>
        <input
          type="text"
          placeholder="username.."
          onChange={(e) => {
            setEmail(e.target.value)
            setErr("");
          }}
        />
        <input
          type="password"
          placeholder="Password.."
          onChange={(e) => {
            setPass(e.target.value);
            setErr("");
          }}
        />
        <input
          type="password"
          placeholder="confirm password.."
          onChange={(e) => {
            setCpass(e.target.value);
            setErr("");
          }}
        />
        <button onClick={() => SignUp()}>Signup</button>
      </div>
      <p style={{ textAlign: "center", color: "crimson" }}>{err}</p>
    </div>
  );
};

export default Signup;
