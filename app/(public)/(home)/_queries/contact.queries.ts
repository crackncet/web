import { useMutation } from "@tanstack/react-query";
import { submitContactQuery } from "../_api/contact.api";

export function useSubmitContactQuery() {
  return useMutation({
    mutationFn: submitContactQuery,
  });
}
