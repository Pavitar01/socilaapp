import React, { Children, useEffect, useState } from "react";
import User from "./User";
import { useDispatch, useSelector } from "react-redux";
import { SetRoom } from "../../../redux/slice";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "../../../firebaseconfig";
import Message from "./Message";
const Chat = () => {
  const [users, setUsers] = useState([]);
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  //cureent user form selector
  const currentUser = useSelector((state) => state.userData.user);
  const RoomId = useSelector((state) => state.userData.roomId);

  //db collection
  const db = getFirestore(app);

  //query
  const q = query(collection(db, "User"), orderBy("createdAt", "asc"));
  //useffect to call all the user in db
  useEffect(() => {
    const sub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      sub();
    };
  }, []);

  //useffect for chats
  const chatQuery = query(collection(db, "Chat"), orderBy("createdAt", "asc"));
  useEffect(() => {
    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      const filteredData = data.filter((item) => item.roomId === RoomId);
      setChats(filteredData);
    });
    return () => {
      unsubscribeChat();
    };
  }, [RoomId]);

  //set user roomids
  const dispatch = useDispatch();

  const handleUserClick = (index, userId) => {
    const roomId = generateRoomId(currentUser?.uid, userId);
    dispatch(SetRoom({ sid: currentUser?.uid, rid: userId, roomId }));
  };

  const generateRoomId = (uid1, uid2) => {
    const sortedUids = [uid1, uid2].sort();
    return sortedUids.join("_");
  };

  //submit button click
  const submit = async () => {
    try {
      await addDoc(collection(db, "Chat"), {
        roomId: RoomId,
        senderId: currentUser.uid,
        message: text,
        url: currentUser.photoURL,
        createdAt: serverTimestamp(),
      });
      setText(""); // Clear the input field after sending a message
    } catch (err) {
      console.error("Error adding chat:", err);
    }
  };

  return (
    <div className="chat">
      <div className="top">
        {users?.map((user, index) => {
          if (user?.uid !== currentUser?.uid) {
            return (
              <div
                key={user?.id}
                onClick={() => handleUserClick(index, user.uid)}
                style={{ cursor: "pointer" }}
              >
                <User url={user?.url} />
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
      <div className="bottom">
        <div className="messages">
          {chats.map((item) => (
            <Message
              key={item?.id}
              message={item?.message}
              url={item?.url}
              user={item?.senderId === currentUser?.uid ? "me" : "other"}
              time={item?.createdAt}
            />
          ))}
        </div>
        <div className="inputs">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          />
          <button onClick={() => submit()}> send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
