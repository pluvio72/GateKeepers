import React, { useEffect, useState, useContext } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { Flash } from '../../../components/FlashMessage/FlashMessage';
import { addProduct } from '../../../controllers/gatekeepers';
import { AuthContext } from '../../../services/AuthContext';
import DateTime from 'react-datetime';
import { useNavigate } from 'react-router';
import Compressor from 'compressorjs';
import heic2any from 'heic2any';
import 'react-datetime/css/react-datetime.css';
import './Upload.css';

const Upload = () => {
    let navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [price, setPrice] = useState(0);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState("made");
    const [count, setCount] = useState(0);
    const [sizes, setSizes] = useState([]);
    const [customSize, setCustomSize] = useState(false);

    const [imageOrder, setImageOrder] = useState([]);
    const { username, token } = useContext(AuthContext);

    const handleInputChange = event => {
        switch(event.target.name){
            case 'name':
                setName(event.target.value);
                break;
            case 'price':
                setPrice(event.target.value);
                break;
            case 'description':
                setDescription(event.target.value);
                break;
            case 'type':
                setType(event.target.value);
                break;
            case 'count':
                setCount(event.target.value);
                break;
            case 'customSize':
                setCustomSize(event.target.checked);
                break;
        }
    }
    
    const updateSizes = (event, index) => {
        var _sizes = sizes;
        sizes[index] = event.target.value;
        setSizes([]);
        setSizes(_sizes);
    }
    const addSize = event => {
        var _sizes = sizes;
        _sizes.push('empty');
        setSizes([..._sizes]);
    }
    const deleteSize = index => {
        var _sizes = sizes;
        _sizes.splice(index, 1);
        setSizes([..._sizes]);
    }

    const openFileInput = () => document.getElementById('image-input').click();
    const updateOrder = (event, index) => {
        var order = imageOrder;
        imageOrder[index] = parseInt(event.target.value)-1;
        setImageOrder([]);
        setImageOrder(order);
    }

    useEffect(() => {
        var imageInput = document.getElementById('image-input');
        imageInput.onchange = async function(event){
            var list = [];
            var order = [];
            for(var i = 0; i < event.target.files.length; i++){
                //compress images
                if(i <= 10){
                    var workingFile;
                    if(event.target.files[i].type.toLowerCase() === "image/heic"){
                        var currentFile = event.target.files[i];
                        await heic2any({ blob: currentFile, toType: "image/jpg", quality: 1 }).then((convertedImage) => {
                            var filename = currentFile.name.split('.');
                            workingFile = new File([convertedImage], filename.slice(0,filename.length-1).join('')+'.png', {
                                type: convertedImage.type
                            });
                        })
                    } else workingFile = event.target.files[i];

                    new Compressor(workingFile, {
                        quality: 0.7,
                        success(result){
                            var newFile = new File([result], result.name, {
                                type: result.type
                            });
                            list.push(newFile);
                            setImages([]);
                            if(i === event.target.files.length){
                                setImages(list);
                            }
                        }
                    })
                    order.push(i);
                } else break;
            }
            setImageOrder(order);
        }
    })

    const sendAddProduct = async event => {
        event.preventDefault();
        var formdata = document.getElementById('admin-upload-form');

        // check order is valid
        var orderTotal = 0;
        var desiredTotal = 0;
        for(var i = 0; i < images.length; i++){
            if(imageOrder[i] <= images.length-1){
                orderTotal += imageOrder[i]; 
            } else orderTotal += 100;
            desiredTotal += i;
        }

        
        if(orderTotal === desiredTotal){
            if(images && price && name && description && type && count){
                if((!sizes && customSize) || sizes){
                    var res = await addProduct(formdata, username, token, imageOrder, images, customSize, sizes);
                    if(res.success) {
                        Flash("Successfully added", "success");
                        navigate('../products');
                    }
                    else Flash("Failed", "dark");
                } else Flash("Enter size or allow custom size", "dark");
            } else {
                Flash("Fill all fields", "dark");
            }
        } else {
            Flash("Orders invalid", "dark");
        }
    }

    return (
        <form id="admin-upload-form" onSubmit={sendAddProduct}>
            <input onChange={handleInputChange}
                    className="form-control mb-2" name="name"
                    type="text" id="admin-upload-product-name" placeholder="Product Name"/>
            <input onChange={handleInputChange} className="visually-hidden" id="image-input" type="file"/>
            <div className="carousel slide mb-1" data-bs-ride="carousel" id="admin-upload-images">
                <div className="carousel-inner" id="admin-upload-images-slides">
                    {images.length > 0 ? images.map((image, index) => {
                        return (
                            <div className={index===0?"carousel-item h-100 active":"carousel-item h-100"} key={index}>
                                <img className={"w-100 d-block admin-upload-slide-image"}
                                        src={URL.createObjectURL(image)} alt="Slide Image"/>
                            </div>
                        )
                    }) :
                        <div className="carousel-item active h-100 pointer" onClick={openFileInput}>
                            <img className="w-100 d-block admin-upload-slide-image" src={"/images/default.jpg"} alt="Slide Image"/>
                            <span id="admin-upload-initial-slide-text">Click to upload image..</span>
                        </div>
                    }
                </div>
                <div>
                    <a className="carousel-control-prev" href="#admin-upload-images" role="button" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon"></span>
                        <span className="visually-hidden">Previous</span>
                    </a>
                    <a className="carousel-control-next" href="#admin-upload-images" role="button" data-bs-slide="next">
                        <span className="carousel-control-next-icon"></span>
                        <span className="visually-hidden">Next</span>
                    </a>
                </div>
                <ol className="carousel-indicators">
                    {images.length > 0 ? images.map((image, index) => (
                        <li data-bs-target="#admin-upload-images" data-bs-slide-to={index} className={index===0?"active":""}></li>
                    )) :
                        <li data-bs-target="#admin-upload-images" data-bs-slide-to="0" className={"active"}></li>
                    }
                </ol>
            </div>
            <div id="admin-upload-image-order-parent" className="mb-2">
                <label className="form-label">IMAGE ORDER</label>
                <div className="row g-0">
                    {images.length > 0 && images.map((image, index) => {
                        var imageSRC = (typeof image === 'string') ? `/images/products/${image}` : URL.createObjectURL(image); 
                        return (
                            <div className="col-3 col-sm-2 col-md-2 col-lg-2 col-xl-2 col-xxl-2 admin-upload-image-order" key={index}>
                                <img className="admin-upload-image-order-image" src={imageSRC}/>
                                <input onChange={(e) => updateOrder(e, index)} defaultValue={index+1}
                                        className="form-control admin-upload-image-order-input"
                                        type="number" min="1" step="1" />
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="input-group mb-1">
                <span className="input-group-text">£</span>
                <input onChange={handleInputChange} name="price"
                        className="form-control" type="number"
                        placeholder="0.00" min="0" step="0.01"/>
            </div>
            <input onChange={handleInputChange} name="description"
                    className="form-control mb-1" type="text"
                    placeholder="Description"/>
            <DateTime
                initialValue={new Date()}
                closeOnSelect={true}
                className="mb-2 mt-2 w-100"
                inputProps={{placeholder: 'Upload Date...',
                            className: "date-input-upload-form w-100 form-control bg-white",
                            readOnly: true,
                            name: 'dateToPost'
            }}/>
            <select onChange={handleInputChange} name="type" className="form-select mb-1">
                <option value="own" selected="">OWN</option>
                <option value="made">MADE</option>
            </select>
            <input onChange={handleInputChange} name="count"
                    className="form-control mb-3" type="number"
                    placeholder="Number of products" min="0" step="1"/>
            <label className="form-label">SIZES</label>
            <div id="admin-upload-product-sizes-parent" className="mb-4">
                    {sizes.length > 0 && sizes.map((size, index) => (
                        <div className="admin-upload-product-size mb-1" key={2+index}>
                            <input className="form-control"
                                    type="text" value={size}
                                    onChange={(e) => updateSizes(e, index)}
                                    placeholder="ENTER SIZE"/>
                            <button className="btn btn-dark ms-2" onClick={() => deleteSize(index)} type="button">DELETE</button>
                        </div>
                    ))}
                    <button className="btn btn-secondary w-100 mb-1" onClick={addSize} type="button">ADD SIZE</button>
                <div className="form-check">
                    <input className="form-check-input" type="radio" id="formCheck-1"/>
                    <label className="form-check-label" htmlFor="formCheck-1">Allow Custom Size</label>
                </div>
            </div>
            <button className="btn btn-success btn-lg fw-bold w-100" type="submit">CREATE</button>
        </form>
        // <div id="upload">
        //     <div className="text-center">
        //         <span className="fs-2">◆ Add Product ◆</span>
        //     </div>
        //     <hr className="mb-4"/>
        //     <Form onSubmit={sendAddProduct} id="upload-form">
        //         <Form.Control onChange={handleInputChange} name="name" type="text" placeholder="Product Name" className="mb-2 custom-input"/>
        //         <Form.Control multiple id="image-input" accept="image/jpeg,image/jpg,image/heic" type="file" className="mb-2 visually-hidden"/>
        //         <div id="product-images" className="mb-2">
        //             <Carousel className="carousel mb-2" width={'100%'} height='40vh' dragging>
        //                 {images.length > 0 ? images.map((image, index) => {
        //                         return <img className="product-upload-image" src={URL.createObjectURL(image)} key={index+"1"}/>
        //                     })
        //                     :
        //                     <img className="product-upload-image" src="/images/default.jpg"/>
        //                 }
        //             </Carousel>
        //             <Button onClick={openFileInput} variant="secondary" className="w-100 mb-1 radius-zero">Set Images</Button>
        //         </div>
        //         {images &&
        //             <div>
        //                 <Form.Text>Image Order</Form.Text>
        //                 <div id="image-order" className="mb-2">
        //                     {imageOrder.length > 0 &&
        //                         imageOrder.map((order, index) => {
        //                             return(
        //                                 <div className="order-image-parent" key={index+"2"}>
        //                                     {images[index] && 
        //                                         <img src={URL.createObjectURL(images[index])} className="image-order-picture"/>
        //                                     }
        //                                     <Form.Control className="image-order-element" key={index} type="number" defaultValue={order+1} onChange={(e) => changeImageOrder(e, index)}/>
        //                                 </div>
        //                             )
        //                         })
        //                     }
        //                 </div>
        //             </div>
        //         }

        //         <Form.Group>
        //             <Form.Text>Price</Form.Text>
        //             <InputGroup>
        //                 <InputGroup.Text className="custom-input">£</InputGroup.Text>
        //                 <Form.Control className="custom-input" type="number" placeholder="price" onChange={handleInputChange} name="price"/>
        //             </InputGroup>

        //         </Form.Group>
        //         <Form.Control onChange={handleInputChange} name="description" as="textarea" placeholder="Enter description..." className="custom-input mb-2 mt-2"/>
        //         <Form.Group>
        //             <Form.Text>Product Count</Form.Text>
        //             <Form.Control onChange={handleInputChange} name="count" type="number" min="1" placeholder="Number of products" className="custom-input mb-1"/>
        //         </Form.Group>
        //         <Form.Group>
        //             <Form.Text>Enter Sizes</Form.Text>
        //             <Form.Control onChange={handleInputChange} name="sizes" placeholder="'Small, Medium, Large', or '1 Size' ..." className="custom-input"/>
        //             <Form.Check onChange={handleInputChange} name="customSize" label="Allow custom size" className="custom-input"/>
        //         </Form.Group>
        //         <Form.Group>
        //             <Form.Text>Type</Form.Text>
        //             <Form.Select value={type} onChange={handleInputChange} name="type" className="custom-input">
        //                 <option value="made">Made To Order</option>
        //                 <option value="own">Creator's Own</option>
        //             </Form.Select>
        //         </Form.Group>
        //         <DateTime
        //             initialValue={new Date()}
        //             closeOnSelect={true}
        //             className="mb-2 mt-2 w-100"
        //             inputProps={{placeholder: 'Upload Date...',
        //                         className: "date-input-upload-form",
        //                         readOnly: true,
        //                         name: 'dateToPost'
        //             }}
        //         />
        //         <Button variant="secondary" type="submit" className="w-100">ADD</Button>
        //     </Form>
        // </div>
    )
}

export default Upload;