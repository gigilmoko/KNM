import { configureStore } from '@reduxjs/toolkit'
import headerSlice from './headerSlice'
import modalSlice from './modalSlice'
import rightDrawerSlice from './rightDrawerSlice'
import leadSlice from './components/leadSlice'

const combinedReducer = {
  header : headerSlice,
  rightDrawer : rightDrawerSlice,
  modal : modalSlice,
  lead : leadSlice
}

export default configureStore({
    reducer: combinedReducer
})