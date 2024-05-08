import { setValidator } from "@Vendor";

export type Validator = {
  signup: { firstname: string };
};

export const testValidator = setValidator<Validator>({
  signup: (provider, data) => {},
});
