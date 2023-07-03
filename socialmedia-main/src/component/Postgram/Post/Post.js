import React, { useState, useEffect, useRef } from "react";
import bg1 from "../../../assets/images/bg.jpg";
import Item from "../Post/Item";
import { app } from "../../../firebaseconfig";
import { useSelector, useStore } from "react-redux";
import { storage } from "../../../firebaseconfig";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";
import { v4 } from "uuid";
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
const Post = () => {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [trigger, setTrigger] = useState(false);
  const [isToggle, setIsToggle] = useState(false);
  const [users, setUser] = useState();
  const imageListRef = ref(storage, "images/");
  const [caption, setCaption] = useState("");
  const user = useSelector((state) => state.userData.user);
  const [add, setAdd] = useState("");
  const bg =
    "'https://dataquality.pl/wp-content/uploads/2019/06/Button-choose-file.png'";
  const auth = getAuth(app);
  const db = getFirestore(app);
  const q = query(collection(db, "User"), orderBy("createdAt", "asc"));
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

  useEffect(() => {
    listAll(imageListRef)
      .then((res) => {
        const promises = res.items.map((i) =>
          Promise.all([
            getDownloadURL(ref(storage, i.fullPath)),
            getMetadata(ref(storage, i.fullPath)),
          ])
        );

        Promise.all(promises)
          .then((results) => {
            const updatedItems = results.map(([url, metadata], index) => ({
              url,
              name: res.items[index].name,
              metadata: {
                ...metadata,
                caption: metadata.customMetadata.caption, // Include the caption from custom metadata
              },
              isNew: false, // Initially set isNew as false for all items
            }));
            setItems(updatedItems);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      })
      .catch((error) => {
        console.error("Error listing items:", error);
      });
  }, [trigger]);

  const handleAddItem = async () => {
    setIsToggle(false)
    try {
      if (!file) return;

      const fileRef = ref(storage, `images/${file.name + v4()}`);

      // Check if the file is an image
      if (file.type.includes("image")) {
        uploadBytes(fileRef, file, {
          customMetadata: {
            addedBy: users[0].name,
            sId: user.uid,
            photo: user.photoURL,
            sec: 5,
            caption:caption
          },
        }).then(() => {
          setTrigger((prev) => !prev);
          setAdd("Image Posted Successfully..");
          // Toggle trigger value to fetch updated data
        });
      }
      // Check if the file is a video
      else if (file.type.includes("video")) {
        uploadBytes(fileRef, file, {
          customMetadata: {
            addedBy: users[0].name,
            sId: user.uid,
            photo: user.photoURL,
            caption: caption, 
          },
        }).then(() => {
          setTrigger((prev) => !prev);
          setAdd("Video Posted Successfully..");
          // Toggle trigger value to fetch updated data
        });
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="post" style={{ position: "relative" }}>
      <div className="posts">
        {items.length === 0 ? (
          <div className="no-posts">
            <img src={bg1} alt="Big Image" width="100%" height="100%" />
            <h1 style={{ margin: "-50px 0 0 220px" }}>
              Add <span style={{ color: "#5e5eb9" }}>Post</span>
            </h1>
          </div>
        ) : (
          items.map((item) => (
            <Item
              key={item.id}
              url={item.url}
              metadata={item.metadata}
              isNew={item.isNew} 
              caption={item.metadata.caption}// Pass the isNew property to Item component
            />
          ))
        )}
      </div>
      <button
        style={{
          width: "50px",
          fontSize: "30px",
          borderRadius: "100%",
          height: "50px",
          border: "1px solid black",
          position: "absolute",
          cursor: "pointer",
          bottom: "20px",
          color: "white",
          backgroundColor: "#5e5eb9",
        }}
        onClick={() => {
          isToggle ? setIsToggle(false) : setIsToggle(true);
          setAdd("");
        }}
      >
        +
      </button>
      {isToggle && (
        <div
          style={{
            width: "300px",
            fontSize: "20px",
            height: "150px",
            border: "1px solid black",
            position: "absolute",
            cursor: "pointer",
            bottom: "0",
            marginBottom: "100px",
            boxSizing: "border-box",
            paddingTop: "20px",
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              backgroundImage: `url(${bg})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              width: "90%",
              height: "60px",
              border: "1px solid black",
              borderRadius: "20px",
              marginLeft: "10px",
            }}
          >
         
            <input
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setAdd("");
              }}
              style={{
                width: "100%",
                height: "100%",
                opacity: "0",
                cursor: "pointer",
              }}
            />
            
          </div>
          <input
              type="text"
              placeholder="Add a caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{
                width: "80%",
                height: "30px",
                marginLeft:"10px",
                border:"none",
                borderBottom:"1px solid black",
                marginLeft:"20px"
              
              }}
            />
          <button
            onClick={handleAddItem}
            style={{
              width: "100%",
              border: "none",
              cursor: "pointer",
              height:"20px",

              marginTop:"-10px",
              backgroundColor:"transparent"
            }}
          >
            <h1 style={{ fontSize: "20px" }}>upload</h1>
          </button>
          <p
            style={{
              color: "green",
              margin: "-10px 0 0 50px",
              fontSize: "15px",
            }}
          >
            {add}
          </p>
        </div>
      )}
    </div>
  );
};

export default Post;
