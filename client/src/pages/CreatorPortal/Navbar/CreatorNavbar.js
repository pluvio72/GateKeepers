import React, { useState, useEffect, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { LogOut } from '../../../services/auth';
import { useNavigate } from 'react-router';
import { AuthContext } from '../../../services/AuthContext';

const CreatorNavbar = () => {
    const { loggedIn, setLoggedIn, username, setUsername, setToken } = useContext(AuthContext);

    let navigate = useNavigate();
    const toggleNavbar = () => document.getElementById("menu").classList.toggle("active");

    const logOutButton = () => {
        setLoggedIn(false);
        setUsername('');
        setToken('')
        LogOut();
        navigate('/login');
    }

    return (
        <div>
            <div className="toggle" onClick={toggleNavbar}>
                <FaBars style={{cursor: 'pointer', top: '10px', position: 'relative'}} size={30}/>
            </div>

            <div id="menu">
                <ul>
                    <li><NavLink to="/" className={"mb-2"} onClick={toggleNavbar}>Upload</NavLink></li>
                    <li><NavLink to="/about" className={"mb-2"} onClick={toggleNavbar}>Products</NavLink></li>
                    <li><NavLink to="/contact-us" className={"mb-2"}>Profile</NavLink></li>
                    {/* {loggedIn ? 
                        <li><NavLink to="/login" onClick={toggleNavbar} className={"mb-2"}>Login</NavLink></li>
                        :
                        <li><NavLink to="/profile" onClick={toggleNavbar} className={"mb-2"}>Profile</NavLink></li>
                    } */}
                </ul>
                <span onClick={() => {toggleNavbar(); logOutButton();}} style={{textDecoration: 'none'}} className="sign-out">Sign Out<FaSignOutAlt style={{marginLeft: '8px',marginBottom: '4px'}}/></span>
                <span style={{position: 'absolute', bottom: 'calc(.5rem + 10px)', left: 'calc(.5rem + 10px)'}}>{username}</span>
            </div>
        </div>
    )
}

export default CreatorNavbar;