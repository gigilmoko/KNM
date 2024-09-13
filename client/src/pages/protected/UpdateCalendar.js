import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Calendar from '../../features/calendar'
import NewCalendar from '../../components/CalendarView/NewCalendar'
import UpdateCalendar from '../../components/CalendarView/UpdateCalendar'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Update Event"}))
      }, [])


    return(
        <UpdateCalendar />
    )
}

export default InternalPage