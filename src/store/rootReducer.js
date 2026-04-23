import { globalSlice } from "./slices/globalSlice";
import profileReducer from "./slices/profileSlice";
import { taskSlice } from "./slices/taskSlice";

const rootReducer = {
  task: taskSlice.reducer,
  global: globalSlice.reducer,
  profile: profileReducer,
};

export default rootReducer;
