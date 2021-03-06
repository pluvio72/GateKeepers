import React, { useContext, useEffect, useState } from 'react';
import './Login.css';
import { login } from '../../controllers/auth';
import { getActivationToken } from '../../controllers/users';
import { Flash } from '../../components/FlashMessage/FlashMessage';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../services/AuthContext';
import Event from '../../utils/events';
import ActivateAccount from '../../components/ActivateAccount/ActivateAccount';
import PasswordRecoveryBox from '../../components/PasswordRecoveryBox/PasswordRecoveryBox';
import { CartContext } from '../../services/CartContext';
import { APP_ID, APP_REDIRECT } from '../../config';
import { FaInstagram } from 'react-icons/fa';

const Login = () => {

    const { setLoggedIn, setUsername, setToken, loggedIn } = useContext(AuthContext);
    const { clearCart } = useContext(CartContext);

    let navigate = useNavigate();

    const [inputUsername, setInputUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showActivationDialog, setShowActivationDialog] = useState(false);
    const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);

    const handleUsernameChange = event => setInputUsername(event.target.value);
    const handlePasswordChange = event => setPassword(event.target.value);

    const activationCodeSuccess = async () => {
        // var res = await login(inputUsername, password);
        // setToken(res.token);
        // setUsername(inputUsername);
        // setLoggedIn(true);

        setShowActivationDialog(false);
        Flash("Account activated.", "dark");
        navigate('/login');
    }

    useEffect(() => {
        if(loggedIn) navigate('/')
    }, []);

    const sendLogin = async event => {
        event.preventDefault();
        if(inputUsername && password){
            var res = await login(inputUsername, password);
            if(res.success){
                setToken(res.token);
                setUsername(inputUsername);
                setLoggedIn(true);
                clearCart();
                navigate('/', { state: 'logged-in' });
                Event.emit('loggedIn');
            }
            else {
                if(res.message === "activate account") {
                    getActivationToken(inputUsername);
                    setShowActivationDialog(true);
                } else Flash(res.message, "danger")
            };
        } else Flash("Enter Username & Password", "dark");
    }

    return (
        <div id="login-parent">
            <PasswordRecoveryBox
                showPasswordRecovery={showPasswordRecovery}
                hidePasswordRecovery={() => setShowPasswordRecovery(false)}/>
            <ActivateAccount
                showDialog={showActivationDialog}
                username={inputUsername}
                activationSuccess={activationCodeSuccess}
                hideDialog={() => setShowActivationDialog(false)}/>

            <form id="login-form" onSubmit={sendLogin}>
                <label className="form-label" htmlFor="#username">USERNAME</label>
                <input onChange={handleUsernameChange} className="form-control mb-1 fw-bold" type="text" id="username" placeholder="JOHN DOE" required="" name="username" inputMode="katakana"/>
                <label className="form-label" htmlFor="#password">PASSWORD</label>
                <input onChange={handlePasswordChange} className="form-control mb-2 fw-bold" type="password" id="password" placeholder="PASSWORD123"/>
                <button className="btn btn-dark fw-bold w-100 mb-1" type="submit">LOGIN</button>
                <a href={`https://api.instagram.com/oauth/authorize?client_id=${APP_ID}&redirect_uri=${APP_REDIRECT}&scope=user_profile&response_type=code`}
                    className="btn btn-primary fw-bold pb-2 instagram-button w-100"
                    type="button">Sign In
                    <FaInstagram className='icon-3'/>
                </a>
                <hr className="my-4"/>
                <span className="text-muted">Don't have an account?
                    <Link to="/create-account"><span id="create-account-button" className="ps-1 text-primary">CREATE ONE</span></Link>
                </span>
                <br/>
                <a onClick={() => setShowPasswordRecovery(true)} className="text-danger no-text-decoration">Forgot Password</a>
            </form>
        </div>

        //             <Link style={{textDecoration: 'none'}} to="/create-account"><span id="create-account-link">Create</span></Link>
        //         </div>
        //     </div>
        // </div>
    )
};

export default Login;