import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import UserSlice from './slice';
import CommentSlice from './CommentSlice';

const persistConfig = {
  key: 'userdata',
  storage,
  blacklist: [],
};
const rootReducer = combineReducers({
  userData: UserSlice,
  commentsSlice:CommentSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
