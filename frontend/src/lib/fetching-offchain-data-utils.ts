import axios from "axios";

export const fetchStringDataOffChain = async (
  url: string
): Promise<string | undefined> => {
  return axios
    .get(url)
    .then((response) => {
      console.log("Data fetched successfully:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      return undefined;
    });
};

export const fetchJsonDataOffChain = async (
  url: string
): Promise<any | undefined> => {
  return axios
    .get(url)
    .then((response) => {
      console.log("Data fetched successfully:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      return undefined;
    });
}
