import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ApplyToBeMember from '../../features/applymember'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Already a member?"}))
      }, [])


    return(
        <ApplyToBeMember />
    )
}

export default InternalPage