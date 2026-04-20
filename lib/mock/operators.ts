import { Operator } from "../types";

export function generateOperators(): Operator[] {
  return [
    {
      id: "parlour",
      name: "Parlour",
      properties: ["Parlour Casino", "Parlour Sports", "Parlour Live"],
      currency: "GBP",
    },
  ];
}
