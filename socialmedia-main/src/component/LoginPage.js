import React, { useState, useEffect } from "react";
import Signup from "./Signup";
import Login from "./Login";
import { app } from "../firebaseconfig";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopu,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import { AddUser } from "../redux/slice";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import FrontPage from "./Postgram/FrontPage";
const LoginPage = () => {
  const db = getFirestore(app);

  const [islogin, setIslogin] = useState(true);
  const [val, setVal] = useState("");
  const [val2, setVal2] = useState([]);
  const [user, setUser] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    onAuthStateChanged(auth, (data) => {
      dispatch(AddUser(data));
      setUser(data);
    });
  }, []);

  const data = useSelector((state) => {
    return state.userData.user;
  });
  const q = query(collection(db, "User"), orderBy("createdAt", "asc"));

  useEffect(() => {
    const a = onSnapshot(q, (snapshot) => {
      const data1 = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const filteredData = data1?.filter((item) => item?.uid === data?.uid);
      setVal2([filteredData]);
    });

    return () => {
      a();
    };
  }, []);

  const auth = getAuth(app);
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then(async (res) => {
        const user = res?.user;
        const q1 = query(collection(db, "User"), where("uid", "==", user.uid));
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
      .catch((err) => alert("Login Page: " + err));
  };

  return (
    <>
      {user ? (
        <FrontPage />
      ) : (
        <div className="login" style={{ position: "relative" }}>
          {islogin ? (
            <>
              <Login />
            </>
          ) : (
            <Signup setIslogin={setIslogin}/>
          )}
          <p
            style={{
              position: "absolute",
              left: "20px",
              fontWeight: "100",
              marginTop: "-10px",
              color:"purple",
              cursor: "pointer",
            }}
            onClick={() => (islogin ? setIslogin(false) : setIslogin(true))}
          >
            {islogin ? "Register urself" : "Login with Email"}
          </p>
          {islogin ? (
            <>
              <p style={{ width: "100%", textAlign: "center" }}>- Or -</p>
              <button className="gbutton" onClick={googleSignIn}></button>
            </>
          ) : (
            ""
          )}
          {val}
        </div>
      )}
    </>
  );
};

export default LoginPage;
