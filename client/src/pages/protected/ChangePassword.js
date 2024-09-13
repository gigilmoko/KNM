import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ChangePassword from '../../features/settings/changepassword'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Change Password"}))
      }, [])


    return(
        <ChangePassword />
    )
}

export default InternalPage