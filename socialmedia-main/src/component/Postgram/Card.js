import { getAuth, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { app } from "../../firebaseconfig";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

const Card = () => {
  const auth = getAuth(app);
  const [user, setUser] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [fname, setName] = useState("");
  const [Image, setImage] = useState(
    "https://merchantadvocate.com/wp-content/uploads/2018/06/user.png"
  );

  //declare db
  const db = getFirestore(app);
  const q = query(collection(db, "User"), orderBy("createdAt", "asc"));

  //get details of users
  useEffect(() => {
    const sub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const filteredData = data.filter(
        (item) => item.uid === auth.currentUser.uid
      );
      setUser(filteredData);
    });
    return () => {
      sub();
    };
  }, [db, auth]);

  const update = async () => {
    const q1 = query(
      collection(db, "User"),
      where("uid", "==", auth.currentUser.uid)
    );

    const querysnap = await getDocs(q1);
    let docId = "";
    querysnap.forEach((doc) => (docId = doc.id));

    const userRef = doc(db, "User", docId);
    await updateDoc(userRef, {
      name: fname,
    });
  };
  return (
    <div
      className="cards"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: "9999999",
      }}
    >
      <i
        class="fa-solid fa-user-pen"
        style={{
          position: "absolute",
          right: "10px",
          top: "10px",
          cursor: "pointer",
        }}
        onClick={() => (toggle ? setToggle(false) : setToggle(true))}
      ></i>
      {toggle ? (
        <div className="edit">
          <h1>Update</h1>
          <div className="imag" style={{ backgroundImage: `url(${Image})` }}>
            <input
              type="file"
              onChange={(e) => {
                setImage(e.target.files[0]);
              }}
              style={{ width: "100%", height: "100%", opacity: "0" }}
              alt="UserImage"
              readOnly
            />
          </div>
          <input
            type="text"
            placeholder="Update name"
            onChange={(e) => setName(e.target.value)}
            value={fname}
          />
          <div>
            <button
              onClick={() => {
                update();
                setToggle(false);
                setName("");
              }}
            >
              Update
            </button>
            <button
              onClick={() => {
                setToggle(false);
                setName("");
              }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <>
          <img
            src={auth.currentUser.photoURL}
            width={80}
            height={80}
            style={{ borderRadius: "100%" }}
          />
          <h1>{user[0]?.name}</h1>
          <p>{auth.currentUser.email}</p>
          <button
            onClick={() => {
              signOut(auth);
            }}
          >
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </>
      )}
    </div>
  );
};

export default Card;
