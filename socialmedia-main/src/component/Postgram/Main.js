import React from "react";
import Chat from "./Chat/Chat";
import Post from "./Post/Post";

const Main = ({ isChat }) => {
  return (
    <div className="main">
      <div className="left">
        <Post />
      </div>
      {isChat && (
        <div className="right">
          <Chat />
        </div>
      )}
    </div>
  );
};

export default Main;
