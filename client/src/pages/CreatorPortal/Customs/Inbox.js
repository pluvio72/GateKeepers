import React from 'react';

const Inbox = ({ inboxRecipients, loading, getUnreadMessageCount, selectInboxUser, getActiveUser }) => {
    const getBadge = (_accepted, _user) => {
        if(_accepted){
            // if accepted and unread message > 0 show badge else nothing
            var unreadMessageCount = getUnreadMessageCount(_user);
            if(unreadMessageCount > 0) {
                return (<span
                            className="badge bg-primary align-self-center ms-auto">
                            {getUnreadMessageCount(_user)}
                        </span>)
            }
        }
        else return (<span className="badge bg-success align-self-center ms-auto">NEW</span>)
    }

    const getTextClassName = (_user) => {
        var unreadMessageCount = getUnreadMessageCount(_user);
        if(unreadMessageCount > 0) return "fw-bold customs-content-msg"
        else return "customs-content-msg"
    }

    const getActiveClassName = (_user) => {
        if(_user === getActiveUser(_user)) return "creator-customs-inbox-item active"
        else return "creator-customs-inbox-item"
    }

    const _emptyInbox = () => {
        return (
            <div className="p-2">
                <span className="placeholder col-5"></span>
                <span className="placeholder col-8 me-2"></span>
                <span className="placeholder col-3"></span>
                <span className="placeholder col-4 me-2"></span>
                <span className="placeholder col-7"></span>
                <span className="placeholder col-4"></span><br/>
                <span className="placeholder col-4 me-2"></span>
                <span className="placeholder col-2 me-2"></span>
                <span className="placeholder col-3 me-2"></span>
            </div>
        )
    }

    return (
        <div id="creator-customs-inbox-parent">
            {!loading ?
                inboxRecipients.size > 0 ?
                    Array.from(inboxRecipients.keys()).map((user, index) => {
                        return (
                            <div className={getActiveClassName(user)}
                                onClick={() => selectInboxUser(user)} key={index}>
                                <span className="price fw-bold">£{inboxRecipients.get(user).price}</span>
                                <div className="customs-content w-100 pe-2">
                                    <div className="d-flex flex-column">
                                        <span>@{user}</span>
                                        <span className={getTextClassName(user)}>{inboxRecipients.get(user).description}</span>
                                    </div>
                                    {getBadge(inboxRecipients.get(user).accepted, user)}
                                </div>
                            </div>
                        )
                    }):
                        _emptyInbox():
                _emptyInbox()
            }
        </div>
    )
}

export default Inbox;