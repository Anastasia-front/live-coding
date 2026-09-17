// useReducer manages state through explicit actions and a reducer function.
// It is useful when state transitions are related, branching, or easier to test as pure logic.
// Reducers must stay pure, and dispatching during render should be avoided in real components.
import { useReducer } from "react";

// Manages more complex state transitions via a reducer function
// ((state, action) => newState), similar to Redux's pattern but local.

type CounterState = {
  count: number;
};

type CounterAction = {
  type: "increment" | "decrement";
};

function reducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

export const useUpdate = () => {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  dispatch({ type: "increment" });
  console.log({ state });
};
