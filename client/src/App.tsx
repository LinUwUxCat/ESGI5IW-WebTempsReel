import { useEffect, useState } from 'react'

import './App.css'
import { socket } from './socket';

interface Message {
  message: string;
  isSystem: boolean;
}

function App() {

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [channelList, setChannelList] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [adminPw, setAdminPw] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [channelToAdd, setChannelToAdd] = useState<string>("");

  function getChannelOptions() {
    return channelList.map(channel => <option value={channel} key={channel}>{channel}</option>)
  }

  useEffect(() => {

    function onLogin(success : true | string, channels : string[], isAdmin : boolean){
      console.log("Onlogin" + success + channels);
      if (success === true) {
        setIsConnected(true);
        setChannelList(channels);
      } else {
        console.log(success);
      }
      setIsAdmin(isAdmin);
    }

    function onJoin(username : string){ 
      console.log("onjoin" + username)
      setMessageList([...messageList, {isSystem: true, message: `${username} has joined the chat.`}])
    }

    function onJoinSuccess(){ 
      setMessageList([{isSystem: true, message: `You have joined the chat.`}])
    }

    function onMessage(time : string, username : string, message : string) {
      console.log(messageList)
      console.log(`onmessage ${time} ${username} ${message}`)
      setMessageList([...messageList, { isSystem: false, message: username + " at " + time + " | " + message} ])
    }

    socket.on("login", onLogin);
    socket.on("join", onJoin);
    socket.on("joinsuccess", onJoinSuccess);
    socket.on("message", onMessage);

    return () => {
      socket.off("login", onLogin);
      socket.off("join", onJoin);
      socket.off("joinsuccess", onJoinSuccess);
      socket.off("message", onMessage);
    };
  }, [messageList]);


  function joinChatting() {
    if (username.trim() == "") return;
    socket.emit("login", {username : username, adminPw: adminPw});
  }

  function changeChannel(){
    socket.emit("join", {room: selectedChannel});
  }

  function sendMessage(){
    socket.emit("message", {message: message});
    setMessage("");
  }

  function deleteChannel(name: string){
    socket.emit("deleteChannel", {name: name})
  }

  function createChannel(){
    socket.emit("createChannel", {name: channelToAdd})
  }

  return (
    <>
      {!isConnected && (
        <>
          <div>Nom d'utilisateur : <input type="text" id="username" onChange={e => setUsername(e.target.value)} /></div>
          <div>Mot de passe (admin): <input type='text' id="adminpw" onChange={e => setAdminPw(e.target.value)} /></div>
          <button id="joinBtn" onClick={joinChatting}>Join</button>
        </>
      )}

      {isConnected && (
        <>
          <div style={{display: "flex", flexDirection: "row"}}>
            <div>
              <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)}>
                {getChannelOptions()}
              </select> <button onClick={changeChannel}>Join</button>
              <pre id="chatbox" style={{ display: "flex", flexDirection: "column" }}>
                {messageList.map(e => {return <span>{e.message}</span>})}
              </pre>
              <input type="text" id="message" value={message} onKeyDown={e => {if (e.code=="Enter") sendMessage()}} onChange={e => setMessage(e.target.value)}/><button id="sendBtn" onClick={sendMessage}>Send</button>
            </div>
            {isAdmin && (
              <div style={{display: "flex", flexDirection: "column"}}>
                {channelList.map(c => <div>{c}{c != 'lobby'? <button onClick={()=>deleteChannel(c)}>X</button> : ""}</div>)}
                <div><input onChange={e => setChannelToAdd(e.target.value)}/><button onClick={createChannel}>+</button></div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default App
