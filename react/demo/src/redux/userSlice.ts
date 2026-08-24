import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. Define the interface for the slice state
interface UserState {
  name: string;
  score: number;
}

// 2. Set the initial state with the explicit interface
const initialState: UserState = {
  name: 'Alex',
  score: 100,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Reducers automatically infer 'state' as UserState
    incrementScore: (state) => {
      state.score += 1;
    },
    // Use PayloadAction<T> to type payload data
    setScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    },
  },
});

export const { incrementScore, setScore } = userSlice.actions;
export default userSlice.reducer;