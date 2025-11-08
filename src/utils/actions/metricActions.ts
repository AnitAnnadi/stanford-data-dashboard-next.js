import { renderError } from "../helpers";

export const downloadData = async (prevState: any, formData: FormData) => {
  try {
    return { message: "Successfully downloaded data" };
  } catch (error) {
    return renderError(error);
  }
};
