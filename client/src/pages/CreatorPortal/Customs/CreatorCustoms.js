import React, { useContext, useEffect, useState } from 'react';
import { getCreator } from '../../../controllers/creators';
import { acceptGatekeeperCustom,
        declineGatekeeperCustom,
        getGatekeeperCustomsMessages,
        markReadCustomsChat,
        sendCustomsMessage } from '../../../controllers/gatekeepers';

import { AuthContext } from '../../../services/AuthContext';
import { createSocket,
        joinGeneralRoom,
        joinRoom,
        onCustomsRequestRecieved,
        onMessageRecieved,
        sendMessage } from '../../../services/ClientSocket';

import Chatbox from './Chatbox';
import CustomsRequest from './CustomsRequest';
import Inbox from './Inbox';
import "./CreatorCustoms.css";


const CreatorCustoms = () => {
    const [socket, setSocket] = useState(null);
    const { username, token } = useContext(AuthContext);
    const [customs, setCustoms] = useState({});
    const [messages, setMessages] = useState({});
    const [loading, setLoading] = useState(true);

    const [selectedChat, setSelectedChat] = useState('');
    const [message, setMessage] = useState('');
    const [paymentLink, setPaymentLink] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            var res = await getGatekeeperCustomsMessages(username, token);
            if(res.success){
                setMessages(res.messages);
                setCustoms(res.customs);
                setSelectedChat(Object.keys(res.messages)[0]);

                // socket join room
                var _socket = createSocket();
                joinRoom(_socket, Object.keys(res.messages)[0], username);
                joinGeneralRoom(_socket, username);
                setSocket(_socket);
                scrollBottomMessages();
            }
            var res1 = await getCreator(username);
            if(res1.success) setPaymentLink(res1.user.paymentLink);
        }
        fetchData();
    }, []);
    
    // when customs and messages are set set loading false
    useEffect(() => {
        if(Object.keys(customs).length > 0 && Object.keys(messages).length > 0){
            setLoading(false);
        }
    }, [customs, messages]);
    
    useEffect(() => {
        if(socket) joinRoom(socket, selectedChat, username);
    }, [socket, selectedChat])

    const eventMessageRecieved = (_user_1, _user_2, _message, _type) => {
        console.log(customs);
        var _customs = customs;
        _customs[_user_1].messages.push({
            from: _user_1,
            to: _user_2,
            message: _message,
            type: _type,
            read: false
        });
        setCustoms({..._customs});
        scrollBottomMessages();
    }

    const eventCustomsRequestRecieved = (_user, _creator, _description, _price) => {
        var _customs = customs;
        _customs[_user] = {
            messages: [
                {
                    from: _user,
                    to: _creator,
                    message: _description,
                    read: false
                }
            ],
            description: _description,
            accepted: false,
            price: _price
        }
        setCustoms({..._customs});
    }

    useEffect(() => {
        if(socket){
            // initialize event subscribers
            onMessageRecieved(socket, eventMessageRecieved);
            onCustomsRequestRecieved(socket, eventCustomsRequestRecieved);
        }
    }, [socket]);

    // scroll to bottom of chatbox element
    const scrollBottomMessages = () => {
        var c = document.getElementById("creator-customs-chatbox");
        if(c) c.scrollTop = c.scrollHeight;
    }

    const fetchSendMessage = async () => {
        var res = await sendCustomsMessage(username, token, message, selectedChat, "message");
        if(res.success){
            var _messages = customs;
            _messages[selectedChat].messages.push({
                from: username,
                to: selectedChat,
                message: message,
                read: false
            });
            setCustoms({..._messages});
            setMessage('');
            sendMessage(socket, selectedChat, username, message);
            scrollBottomMessages();
        }
    }

    const sendPaymentLink = async () => {
        var res = await sendCustomsMessage(username, token, paymentLink, selectedChat, "link");
        if(res.success){
            var _messages = customs;
            _messages[selectedChat].messages.push({
                from: username,
                to: selectedChat,
                message: paymentLink,
                read: false,
                type: 'link'
            });
            setCustoms({..._messages});
            sendMessage(socket, selectedChat, username, message, 'link');
            scrollBottomMessages();
        }
    }

    const fetchAcceptCustom = async () => {
        var res = await acceptGatekeeperCustom(username, token, selectedChat);
        if(res.success){
            var _messages = customs;
            _messages[selectedChat].accepted = true;
            setCustoms({..._messages});
        }
    }

    const fetchDeclineCustom = async () => {
        var res = await declineGatekeeperCustom(username, token, selectedChat);
        if(res.success){
            var _messages = customs;
            delete _messages[selectedChat];
            setCustoms({..._messages});
        }
    }

    const toggleInbox = () => {
        document.getElementById("creator-customs-inbox-parent").classList.toggle("show");
        document.getElementById("creator-customs-mobile-chat-popout-button").classList.toggle("toggled");
        document.getElementById("creator-customs-chatbox").classList.toggle("blur");
    }
    const resetInboxLayout = () => {
        try{
            document.getElementById("creator-customs-inbox-parent").classList.remove("show");
            document.getElementById("creator-customs-mobile-chat-popout-button").classList.remove("toggled");
            document.getElementById("creator-customs-chatbox").classList.remove("blur");
        } catch(err) {  }
    }

    const fetchChatRead = async (user) => {
        var res = await markReadCustomsChat(username, token, user);
        if(res.success){
            var _messages = customs;
            for(var i = 0; i < _messages[user].messages.length; i++){
                if(_messages[user].messages[i].from !== username) _messages[user].messages[i].read = true;
            }
            setCustoms({..._messages});
        }
    }

    const selectInboxUser = (_user) => {
        setSelectedChat(_user);
        resetInboxLayout();
        // if showing messages send read chat
        if(customs[_user].accetped) fetchChatRead(_user);
    }

    const getUnreadMessageCount = (_user) => {
        return customs[_user].accepted ?
            messages[_user].filter(x => (x.read === false && x.from !== username)).length
            : 0;
    }

    const getActiveUser = (_user) => { return _user === selectedChat }

    return (
        <div id="creator-customs">
            <Inbox inboxRecipients={customs}
                    loading={loading}
                    getUnreadMessageCount={getUnreadMessageCount}
                    selectInboxUser={selectInboxUser}
                    getActiveUser={getActiveUser}/>
            {!loading ? customs[selectedChat].accepted ?
                <Chatbox creatorUsername={username}
                            loading={loading}
                            messages={messages}
                            selectedChat={selectedChat}
                            fetchSend={fetchSendMessage}
                            toggleInbox={toggleInbox}/>:
                <CustomsRequest description={customs[selectedChat]?.description}
                                price={customs[selectedChat]?.price}/>
                :
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            }
        </div>
    )
}

export default CreatorCustoms;