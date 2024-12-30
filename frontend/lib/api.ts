import axios, { AxiosResponse } from "axios";

interface GetOptions {
  url: string;
  params?: Record<string, any>;
  headers?: any;
}

export async function get({ url, params, headers }: GetOptions) {
  const response = await fetch(url + "?" + new URLSearchParams(params), {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  console.log("get response", response);

  const responseJson = await response.json();

  if (responseJson.data.payload !== undefined) {
    console.log("data.payload", responseJson.data.payload);
    return responseJson.data.payload;
  }

  if (responseJson.data.isLoggedIn !== undefined) {
    console.log("data.isLoggedIn", responseJson.data.isLoggedIn);

    return responseJson.data.isLoggedIn;
  }

  return await responseJson;
}

interface PostParams {
  url: string;
  params?: Record<string, any>;
}

export const post = async ({ url, params }: PostParams): Promise<any> => {
  try {
    const response: AxiosResponse = await axios.post(url, params);
    return response.data;
  } catch (error) {
    console.error("POST request error:", error);
    throw error;
  }
};
