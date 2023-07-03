import {
    Firestore,
    collection,
    onSnapshot,
    where,
    query,
    orderBy,
    getFirestore,
  } from "firebase/firestore";
  import React, { useEffect, useState } from "react";
  import { app } from "../../../firebaseconfig";
  import { getAuth } from "firebase/auth";
  
  const Notification = () => {
    const [notify, setNotify] = useState([]);
    const db = getFirestore(app);
    const auth = getAuth(app);
  
    useEffect(() => {
      const q = query(collection(db, "User"), orderBy("createdAt", "asc"));
      const sub = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const filteredData = data.filter(
          (item) => item.uid === auth.currentUser.uid
        );
        setNotify(filteredData[0]?.notifications || []);
      });
  
      
      return () => {
        sub();
      };
    }, [db, auth]);
  
 

    return (
      <div className="cards" style={{ width: "500px" ,zIndex:"999999",overflow:"scroll"}} >
        <h1 style={{ textAlign: "center" }} >Notify🔔</h1>
        {notify &&
          notify.map((item, index) => (
            <div key={index} className="list" style={{position:"relative"}}>
              <img src={item.photoURL} alt="User" />
              <h5>{item.name}</h5>
              <h5>{item.type} your This post </h5>
              <img src={item?.post} style={{float:"right",position:"absolute",right:"30px"}}/>
            </div>
          ))}
      </div>
    );
  };
  
  export default Notification;
  