import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import { toast, ToastContainer } from 'react-toastify'; // Importing toast
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';

// Regular expressions for validation
const feedbackRegex = /^.{5,500}$/; // Feedback description, up to 500 characters (optional)

function NewFeedback() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const mainContentRef = useRef(null);

    const [feedbackData, setFeedbackData] = useState({
        feedback: '', // Use 'feedback' as the key for description
        rating: 0      // Rating is still part of the state
    });

    // Handle input changes for both feedback and rating
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFeedbackData({ ...feedbackData, [name]: value });
    };

    // Handle the rating star clicks
    const handleStarClick = (rating) => {
        setFeedbackData({ ...feedbackData, rating });
    };

    // Form validation to ensure both feedback and rating are provided
    const validateForm = () => {
        if (!feedbackRegex.test(feedbackData.feedback.trim())) {
            toast.error('Feedback must be between 5 and 500 characters!');
            return false;
        }

        // Ensure a rating is selected
        if (feedbackData.rating === 0) {
            toast.error('Please select a rating!');
            return false;
        }

        return true;
    };

    // Submit the feedback to the backend
    const submitFeedback = async () => {
        // Perform validation before submitting
        if (!validateForm()) {
            return; // Stop if validation fails
        }
    
        // Load token from sessionStorage
        const token = sessionStorage.getItem('token');
        
        // Set the headers with Authorization token
        const config = {
            headers: {
                Authorization: `Bearer ${token}`, // Include the token in headers
            },
        };
    
        // Log the data being sent (optional for debugging)
        console.log('Submitting Feedback:', feedbackData);
    
        try {
            // Send the feedback data to the backend (with 'feedback' and 'rating' keys)
            const response = await axios.post(`${process.env.REACT_APP_API}/api/feedback/new`, feedbackData, config);
    
            // Show success toast
            toast.success('Feedback submitted successfully!');
            setTimeout(() => {
                navigate('/admin/feedback');
            }, 3000);
    
        } catch (error) {
            // Log the error to the console (in case of failure)
            console.error('Error submitting feedback:', error.response ? error.response.data : error);
    
            // Show error toast
            toast.error('Failed to submit feedback');
        }
    };
    

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard title="Submit New Feedback" topMargin="mt-2">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Feedback Description</label>
                                    <textarea
                                        name="feedback" // Changed from 'description' to 'feedback'
                                        value={feedbackData.feedback} // Bind to 'feedback' state
                                        onChange={handleInputChange}
                                        className="textarea textarea-bordered w-full"
                                        placeholder="Enter your feedback here"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg
                                                key={star}
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill={feedbackData.rating >= star ? "yellow" : "gray"} // Color based on rating
                                                viewBox="0 0 24 24"
                                                width="24"
                                                height="24"
                                                className="cursor-pointer"
                                                onClick={() => handleStarClick(star)}
                                            >
                                                <path d="M12 .587l3.668 7.431 8.032 1.167-5.801 5.648 1.643 8.037-7.542-3.96-7.542 3.96 1.643-8.037-5.801-5.648 8.032-1.167z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="btn btn-primary"
                                        onClick={submitFeedback} // Trigger submit when clicked
                                    >
                                        Submit Feedback
                                    </button>
                                </div>
                            </div>
                        </TitleCard>
                    </main>
                </div>
                <LeftSidebar />
            </div>
            <RightSidebar />
            <ModalLayout />
        </>
    );
}

export default NewFeedback;
