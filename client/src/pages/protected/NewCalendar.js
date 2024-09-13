import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Calendar from '../../features/calendar'
import NewCalendar from '../../components/CalendarView/NewCalendar'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Add Event"}))
      }, [])


    return(
        <NewCalendar />
    )
}

export default InternalPage