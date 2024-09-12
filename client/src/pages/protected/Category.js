import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Transactions from '../../features/transactions'
import Category from '../../features/category'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Categories"}))
      }, [])


    return(
        <Category />
    )
}

export default InternalPage