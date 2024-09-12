import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Transactions from '../../features/transactions'
import Product from '../../features/product'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Products"}))
      }, [])


    return(
        <Product />
    )
}

export default InternalPage