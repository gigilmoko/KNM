import { useNavigate } from 'react-router-dom';
import { CALENDAR_EVENT_STYLE } from "./util";

const THEME_BG = CALENDAR_EVENT_STYLE;

function CalendarEventsBodyRightDrawer({ filteredEvents, closeRightDrawer }) {
    const navigate = useNavigate();

    const handleEventClick = (event) => {
        // Debug: Log the event object to see its structure
        console.log('Event clicked:', event);
        console.log('Event ID:', event._id);
        console.log('Event id:', event.id);
        
        // Try different possible ID fields
        const eventId = event._id || event.id || event.eventId;
        
        if (eventId) {
            navigate(`/admin/calendar/info/${eventId}`);
            // Close the right drawer after navigation
            if (closeRightDrawer) {
                closeRightDrawer();
            }
        } else {
            console.error('No valid event ID found:', event);
        }
    };

    return (
        <>
            {
                filteredEvents.map((e, k) => {
                    return (
                        <div
                            key={k}
                            className={`mt-3 p-3 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 ${THEME_BG[e.theme] || "bg-gray-100"}`}
                            onClick={() => handleEventClick(e)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    handleEventClick(e);
                                }
                            }}
                            style={{ 
                                userSelect: 'none',
                                WebkitUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none'
                            }}
                        >
                            <div className="flex flex-col gap-2">
                                <p className="font-semibold text-sm text-[#ed003f] pointer-events-none">
                                    {e.title}
                                </p>
                                {e.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2 pointer-events-none">
                                        {e.description}
                                    </p>
                                )}
                                {e.startDate && (
                                    <p className="text-xs text-gray-500 pointer-events-none">
                                        {new Date(e.startDate).toLocaleDateString()} at {new Date(e.startDate).toLocaleTimeString()}
                                    </p>
                                )}
                                {e.location && (
                                    <p className="text-xs text-gray-500 pointer-events-none">
                                        📍 {e.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })
            }
        </>
    );
}

export default CalendarEventsBodyRightDrawer;