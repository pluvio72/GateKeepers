import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FaBars, FaBook, FaBriefcase, FaCube, FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../../services/CartContext';
import { hasCustomsOn } from '../../controllers/gatekeepers';
import "./Nav.css";

const CreatorNav = () => {
    let navigate = useNavigate();
    const { products } = useContext(CartContext);
    const [customsOn, setCustomsOn] = useState(false);
    const { creator } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            var res = await hasCustomsOn(creator);
            setCustomsOn(res.customsOn);
        }
        fetchData();
    }, [])

    return (
        <nav className="navbar navbar-light d-flex align-items-stretch" id="creator-navbar">
            <div className="container-fluid">
                <button className="navbar-toggler" data-bs-toggle="offcanvas" id="custom-navbar-toggler" data-bs-target="#mobile-navigation">
                    <span className="visually-hidden">Toggle navigation</span>
                    <FaBars id="custom-navbar-toggle-icon"/>
                </button>
                <ul className="navbar-nav fs-5 flex-row flex-grow-1 justify-content-around justify-content-sm-center justify-content-md-center creator-nav h-100">
                    <NavLink to={`/${creator}/made`} className="nav-item d-flex align-items-center creator-nav-link h-100 no-text-decoration fw-bold">
                        PRODUCTS
                        <FaBriefcase className="d-none d-print-block d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block icon-3"/>
                    </NavLink>
                    <NavLink to={`/${creator}/own`} className="nav-item d-flex align-items-center creator-nav-link h-100 no-text-decoration fw-bold">
                        OWNED
                        <FaCube className="d-none d-print-block d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block icon-3"/>
                    </NavLink>
                    {customsOn ?
                        <NavLink to={`/${creator}/customs`} className="nav-item d-flex align-items-center creator-nav-link h-100 no-text-decoration fw-bold"> 
                            CUSTOMS
                            <FaBook className="d-none d-print-block d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block icon-3"/>
                        </NavLink>:
                        <NavLink to={`/${creator}/library`} className="nav-item d-flex align-items-center creator-nav-link h-100 no-text-decoration fw-bold"> 
                            OUTFITS
                            <FaBook className="d-none d-print-block d-sm-none d-md-none d-lg-block d-xl-block d-xxl-block icon-3"/>
                        </NavLink>
                    }
                </ul>
                <div className="desktop-shopping-cart" onClick={() => navigate("/shopping-basket")}>
                    <span>{products.length}</span>
                    <FaShoppingCart/>
                </div>
            </div>
        </nav>
    )
}

export default CreatorNav;