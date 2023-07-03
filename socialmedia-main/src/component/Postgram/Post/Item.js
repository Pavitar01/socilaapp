import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  updateDoc,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { app } from "../../../firebaseconfig";
import { getAuth } from "firebase/auth";

const Item = ({ url, metadata, isNew,caption }) => {
  const db = getFirestore(app);
  const [color, setColor] = useState("");
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState();
  const [commentInput, setCommentInput] = useState("");
  const [likes, setLikes] = useState(0);
  const [toggle, setToggle] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    if (isNew) {
      setShowNewMessage(true);
      const timer = setTimeout(() => {
        setShowNewMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  const auth = getAuth(app);
  useEffect(() => {
    const docRef = doc(db, metadata.fullPath);

    // Retrieve the likes count from the metadata
    const fetchLikesCount = async () => {
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const likesCount = data.likes || 0;
        setLikes(likesCount);
      }
    };
    
    // Retrieve the comments array from the metadata

    const fetchComments = async () => {
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const commentsArray = data.comments || [];
        setComments(commentsArray);
      }
    };
  fetchLikesCount()
    fetchComments();
  }, [db, metadata.fullPath]);

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


  const handleLike = async () => {
    const docRef = doc(db, metadata.fullPath);
  
    // Check if the document exists
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      // Document exists, retrieve the current likes count
      const currentLikesCount = docSnap.data().likes || 0;
      let newLikesCount;
      let newColor;
  
      if (color === "red") {
        // If already liked, decrease the like count and remove the like
        newLikesCount = currentLikesCount - 1;
        newColor = "";
      } else {
        // If not liked, increase the like count and set the like
        newLikesCount = currentLikesCount + 1;
        newColor = "red";
      }
  
      // Update the likes count and color in Firestore
      await updateDoc(docRef, {
        likes: newLikesCount,
      });
  
      // Add notification to the user who posted the photo
      const q1 = query(
        collection(db, "User"),
        where("uid", "==", metadata?.customMetadata?.sId)
      );
      const querysnap = await getDocs(q1);
      let docId = "";
      querysnap.forEach((doc) => (docId = doc.id));
  
      const userRef = doc(db, "User", docId);
      await updateDoc(userRef, {
        notifications: arrayUnion({
          type: "like",
          senderUID: auth.currentUser.uid,
          photoURL: auth.currentUser.photoURL,
          name: user[0].name,
          post: url,
        }),
      });
      // Update the local state with the new likes count and color
      setLikes(newLikesCount);
      setColor(newColor);
    } else {
      // Document does not exist, create the document with initial likes count of 1
      await setDoc(docRef, {
        likes: 1,
      });
  
      // Update the local state with the new likes count and color
      setLikes(1);
      setColor("red");
    }
  };
  
  
  const handleComment = async () => {

    const docRef = doc(db, metadata.fullPath);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      // Document exists, proceed with the update
      const newComment = commentInput + " By " + user[0].name;
      const updatedCommentsArray = [...comments, newComment];
  
      // Update the comments array in Firestore
      await updateDoc(docRef, {
        comments: updatedCommentsArray,
      });
  
      // Clear the comment input field
      setCommentInput("");
  
      // Add notification for the comment to the user who posted the photo
      const q1 = query(
        collection(db, "User"),
        where("uid", "==", metadata?.customMetadata?.sId)
      );
      const querysnap = await getDocs(q1);
      let docId = "";
      querysnap.forEach((doc) => (docId = doc.id));
  
      const userRef = doc(db, "User", docId);
      await updateDoc(userRef, {
        notifications: arrayUnion({
          type: "Comment",
          senderUID: auth.currentUser.uid,
          photoURL: auth.currentUser.photoURL,
          name: user[0].name,
          post: url,
        }),
      });
  
      // Update the local state with the updated comments array
      setComments(updatedCommentsArray);
    }
  
   
  };
  
  return (
    <div className="item">
      <div className="top">
        <div className="img" style={{ overflow: "hidden" }}>
          <img
            src={metadata?.customMetadata?.photo}
            width={50}
            height={50}
            alt="User"
          />
        </div>
        <div className="name">
          <h5>
            {metadata?.customMetadata?.addedBy || "Unknown User"}
            {showNewMessage && (
              <span
                className="new-message"
                style={{ marginLeft: "50px", color: "green" }}
              >
                New
              </span>
            )}
          </h5>
        </div>
      </div>
      <div className="middle">
        {metadata?.contentType?.includes("image") ? (
          <img src={url} alt={"image"} width="100%" height="100%" />
        ) : (
          <video controls style={{ width: "100%", height: "100%" }}>
            <source src={url} type={metadata?.contentType} />
          </video>
        )}
      </div>
      <div className="bottom" style={{ position: "relative" }}>
        <button onClick={handleLike}>
        <i class="fa-solid fa-heart" style={{ color: color }}><span style={{fontSize:"15px",paddingLeft:"10px"}}>{likes}</span></i>
        </button>
        <button>
          <i
            className="fa-regular fa-comment"
            onClick={() => {
              toggle ? setToggle(false) : setToggle(true);
            }}
          ></i>
        </button>
      <div className="divimg" style={{color:"black",margin:"-20px 0 0 20px",width:"90%",height:"50px",wordBreak:"break-all",overflow:"scroll"}}><p style={{fontWeight:"900"}}>Caption:<span style={{fontWeight:"400"}}>{caption}</span></p></div>

        {toggle ? (
          <>
            <div className="comments">
              <ul>
                {comments.map((comment, index) => (
                  <li key={index}>{comment}</li>
                ))}
              </ul>
              <div className="add-comment">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button onClick={handleComment}>Post</button>
              </div>
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default Item;
