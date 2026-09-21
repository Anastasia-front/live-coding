// useReducer manages related state through explicit actions and a reducer function.
// It is useful when one event changes several values or when transitions have branching rules.
// Reducers must stay pure: calculate and return state without requests, timers, or mutations.
import { useReducer } from "react";

type CheckoutState = {
  email: string;
  delivery: "standard" | "express";
  promoCode: string;
  discount: number;
  error: string | null;
  isSubmitting: boolean;
};

type CheckoutAction =
  | { type: "emailChanged"; email: string }
  | { type: "deliveryChanged"; delivery: CheckoutState["delivery"] }
  | { type: "promoApplied"; promoCode: string; discount: number }
  | { type: "submitStarted" }
  | { type: "submitFailed"; error: string }
  | { type: "reset" };

const initialState: CheckoutState = {
  email: "",
  delivery: "standard",
  promoCode: "",
  discount: 0,
  error: null,
  isSubmitting: false,
};

function checkoutReducer(
  state: CheckoutState,
  action: CheckoutAction,
): CheckoutState {
  switch (action.type) {
    case "emailChanged":
      return { ...state, email: action.email, error: null };
    case "deliveryChanged":
      return { ...state, delivery: action.delivery };
    case "promoApplied":
      return {
        ...state,
        promoCode: action.promoCode,
        discount: action.discount,
        error: null,
      };
    case "submitStarted":
      return { ...state, isSubmitting: true, error: null };
    case "submitFailed":
      return { ...state, isSubmitting: false, error: action.error };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export function useCheckoutForm() {
  return useReducer(checkoutReducer, initialState);
}
