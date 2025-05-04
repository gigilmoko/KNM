import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment";
import { showNotification } from '../Layout/common/headerSlice';
import Subtitle from '../Layout/components/Typography/Subtitle';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify"; 
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import InputText from "../Layout/components/Input/InputText";

function ProfileUpdate() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [user, setUser] = useState({
        fname: '',
        lname: '',
        middlei: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        avatar: '',
        googleLogin: false,
    });

    const nameRegex = /^[A-Za-z\s]+$/;
    const middleInitialRegex = /^[A-Z]$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{11}$/;

    useEffect(() => {
        if (!localStorage.getItem('theme')) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            setUser(data.user || {}); // Ensure user state is updated
        } catch (error) {
            console.log(error);
        }
    };

    const updateFormValue = (updateType, value) => {
        if (['houseNo', 'streetName', 'barangay', 'city'].includes(updateType)) {
            setUser((prevUser) => ({
                ...prevUser,
                deliveryAddress: [
                    {
                        ...prevUser.deliveryAddress?.[0], // Preserve existing address fields
                        [updateType]: value, // Update the specific field
                    },
                ],
            }));
        } else {
            setUser((prevUser) => ({
                ...prevUser,
                [updateType]: value,
            }));
        }
    };

    const handleUpdateAddress = async () => {
        if (!user._id) {
          toast.error("User ID is missing");
          return;
        }
      
        const updatedAddress = [
          {
            houseNo: user.deliveryAddress?.[0]?.houseNo || "N/A",
            streetName: user.deliveryAddress?.[0]?.streetName || "N/A",
            barangay: user.deliveryAddress?.[0]?.barangay || "N/A",
            city: user.deliveryAddress?.[0]?.city || "N/A",
          },
        ];
      
        // Log the updatedAddress data
        console.log("Data being sent:", {
          userId: user._id,
          deliveryAddress: updatedAddress,
        });
      
        try {
          await axios.put(
            `${process.env.REACT_APP_API}/api/me/update/address`,
            { userId: user._id, deliveryAddress: updatedAddress },
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          );
          toast.success("Address updated successfully!");
        } catch (error) {
          console.error("Error updating address:", error);
          toast.error("Failed to update address.");
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'ml_default'); 
    
            try {
                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                const imageUrl = response.data.secure_url;
                setUser((prevUser) => ({ ...prevUser, avatar: imageUrl })); 
                toast.success("Avatar uploaded successfully!"); 
            } catch (error) {
                console.error('Failed to upload avatar', error);
                toast.error('Failed to upload avatar. Please try again.'); 
            }
        }
    };

    const validateForm = () => {
        const errors = {};
    
        if (!user.fname.trim()) {
            errors.fname = "First name is required.";
        } else if (!nameRegex.test(user.fname)) {
            errors.fname = "First name must contain only letters and spaces.";
        }
    
        if (!user.lname.trim()) {
            errors.lname = "Last name is required."; 
        } else if (!nameRegex.test(user.lname)) {
            errors.lname = "Last name must contain only letters and spaces.";
        }
    
        if (user.middlei && !user.middlei.trim()) {
            errors.middlei = "Middle initial is required."; 
        } else if (user.middlei && !middleInitialRegex.test(user.middlei)) {
            errors.middlei = "Middle initial must be a single uppercase letter.";
        }
    
        if (!user.email.trim()) {
            errors.email = "Email is required."; 
        } else if (!emailRegex.test(user.email)) {
            errors.email = "Please enter a valid email address.";
        }
        if (!user.phone.trim()) {
            errors.phone = "Phone number is required.";
        } else if (!phoneRegex.test(user.phone)) {
            errors.phone = "Phone number must be an 11-digit number.";
        }
    
        return errors;
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error) => {
                toast.error(error); 
            });
            return; 
        }
    
        const profileData = { 
            fname: user.fname, 
            lname: user.lname, 
            middlei: user.middlei, 
            dateOfBirth: user.dateOfBirth, 
            email: user.email, 
            phone: user.phone, 
            avatar: user.avatar
        };
    
        try {
            await axios.put(`${process.env.REACT_APP_API}/api/me/update`, profileData, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            toast.success("Profile updated successfully!"); 
            dispatch(showNotification({ message: "Profile Updated", status: 1 })); 
            navigate('/profile'); 
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error("An error occurred while updating the profile.");
        }
    };

    return (
        <div className={`min-h-screen bg-base-200 flex flex-col`}>
            <HeaderPublic />
            <div className="flex items-center justify-center flex-grow">
                <ToastContainer/>
                <div className={`mx-auto w-full max-w-2xl shadow-xl p-6 my-12 bg-base-100 rounded-xl border border-gray-300`}>
                    <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Update Profile</h2>
                    <p className={`text-center mb-6 text-gray-600`}>Edit your personal information</p>

                    <div className='h-full w-full pb-4'>
                        <div className="flex items-center justify-center mb-4">
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                                <img
                                    src={user.avatar && user.avatar.trim() ? user.avatar : "https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"}
                                    alt="User Avatar"
                                    className="rounded-full h-24 w-24 object-cover"
                                />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputText
                                    type="text"
                                    defaultValue={user.fname}
                                    containerStyle="mt-1"
                                    labelTitle="First Name"
                                    updateFormValue={({ value }) => updateFormValue('fname', value)}
                                />
                                <InputText
                                    type="text"
                                    defaultValue={user.lname}
                                    containerStyle="mt-1"
                                    labelTitle="Last Name"
                                    updateFormValue={({ value }) => updateFormValue('lname', value)}
                                />
                                <InputText
                                    type="text"
                                    defaultValue={user.middlei}
                                    containerStyle="mt-1"
                                    labelTitle="Middle Initial"
                                    updateFormValue={({ value }) => updateFormValue('middlei', value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                <InputText
                                    type="email"
                                    defaultValue={user.email}
                                    containerStyle="mt-1"
                                    labelTitle="Email"
                                    updateFormValue={({ value }) => updateFormValue('email', value)}
                                />
                                <InputText
                                    type="text"
                                    defaultValue={user.phone}
                                    containerStyle="mt-1"
                                    labelTitle="Phone"
                                    updateFormValue={({ value }) => updateFormValue('phone', value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputText
                                    type="text"
                                    defaultValue={user.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : 'N/A'}
                                    containerStyle="mt-1"
                                    labelTitle="Date of Birth"
                                    updateFormValue={({ value }) => updateFormValue('dateOfBirth', value)}
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-4">
                                <button
                                    type="submit"
                                    className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200"
                                >
                                    Update Profile
                                </button>
                            </div>
                            <div className="divider mt-4"></div>
                            <p className={`font-bold text-[#df1f47]`}>Address</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                <InputText
                                    type="text"
                                    defaultValue={user.deliveryAddress?.[0]?.houseNo || ""}
                                    containerStyle="mt-1"
                                    labelTitle="House No."
                                    updateFormValue={({ value }) => updateFormValue('houseNo', value)}
                                />
                                <InputText
                                    type="text"
                                    defaultValue={user.deliveryAddress?.[0]?.streetName || ""}
                                    containerStyle="mt-1"
                                    labelTitle="Street Name"
                                    updateFormValue={({ value }) => updateFormValue('streetName', value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                <InputText
                                    type="text"
                                    defaultValue={user.deliveryAddress?.[0]?.barangay || 'N/A'}
                                    containerStyle="mt-1"
                                    labelTitle="Barangay"
                                    updateFormValue={({ value }) => updateFormValue('barangay', value)}
                                />
                                <InputText
                                    type="text"
                                    defaultValue={user.deliveryAddress?.[0]?.city || 'N/A'}
                                    containerStyle="mt-1"
                                    labelTitle="City"
                                    updateFormValue={({ value }) => updateFormValue('city', value)}
                                />
                            </div>

                            <div className="flex justify-end gap-4 mt-4">
                                <button
                                    onClick={handleUpdateAddress}
                                    className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200"
                                >
                                    Update Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <FooterPublic />
        </div>
    );
}

export default ProfileUpdate;