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

  // if (!response.ok) {
  //   throw new Error(response.statusText);
  // }

  console.log("get response", response);

  const responseJson = await response.json();

  if (responseJson.data.payload !== undefined) {
    console.log("data.payload", responseJson.data.payload);
    return responseJson.data.payload;
  }

  if (responseJson.data.isLoggedIn !== undefined) {
    // console.log("data.isLoggedIn", responseJson.data.isLoggedIn);
    return responseJson.data.isLoggedIn;
  }

  return await responseJson;
}

type PostOptions = {
  url: string;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  body?: Record<any, any>;
};

export async function post({ url, params, headers, body }: PostOptions) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(params ?? body),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
}
