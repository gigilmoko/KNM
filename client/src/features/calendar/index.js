import { useState } from 'react'
import CalendarView from '../../components/CalendarView'
import moment from 'moment'
import { CALENDAR_INITIAL_EVENTS } from '../../utils/dummyData'
import { useDispatch } from 'react-redux'
import { openRightDrawer } from '../common/rightDrawerSlice'
import { RIGHT_DRAWER_TYPES } from '../../utils/globalConstantUtil'
import { showNotification } from '../common/headerSlice'



const INITIAL_EVENTS = CALENDAR_INITIAL_EVENTS

function Calendar(){

    const dispatch = useDispatch()

    const [events, setEvents] = useState(INITIAL_EVENTS)

    // Add your own Add Event handler, like opening modal or random event addition
    // Format - {title :"", theme: "", startTime : "", endTime : ""}, typescript version comming soon :)
    const addNewEvent = (date) => {
        // Redirect to the specified URL
        window.location.href = 'http://localhost:3000/app/calendar-new';
    };
    

    // Open all events of current day in sidebar 
    const openDayDetail = ({filteredEvents, title}) => {
        dispatch(openRightDrawer({header : title, bodyType : RIGHT_DRAWER_TYPES.CALENDAR_EVENTS, extraObject : {filteredEvents}}))
    }

    return(
        <>
           <CalendarView 
                calendarEvents={events}
                addNewEvent={addNewEvent}
                openDayDetail={openDayDetail}
           />
        </>
    )
}

export default Calendar