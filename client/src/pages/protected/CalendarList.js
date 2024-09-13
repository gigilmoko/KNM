import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Transactions from '../../features/transactions'
import CalendarList from '../../components/CalendarView/CalendarList'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Calendar List"}))
      }, [])


    return(
        <CalendarList />
    )
}

export default InternalPage