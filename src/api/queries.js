import { apiConnector } from "./apiConnector";
import {
  ADD_CONTENT_API,
  DELETE_CONTENT_API,
  GET_ALL_CONTENT,
  GET_CONTENT_BY_ID,
  UPDATE_CONTENT_API,
} from "./apiList";

export const createContent = async (content) => {
  const response = await apiConnector("POST", ADD_CONTENT_API, content);

  if (response.status !== 201) {
    throw new Error(JSON.stringify(response));
  }

  return response.data;
};

export const getAllContents = async () => {
  const response = await apiConnector("GET", GET_ALL_CONTENT);

  if (response.status !== 200) {
    throw new Error(JSON.stringify(response));
  }

  return response.data;
};

export const getContentById = async (id) => {
  const response = await apiConnector("GET", `${GET_CONTENT_BY_ID}/${id}`);

  if (response.status !== 200) {
    throw new Error(JSON.stringify(response));
  }

  return response.data;
};

export const updateContent = async (content, id) => {
  const response = await apiConnector("PUT", `${UPDATE_CONTENT_API}/${id}`, content);

  if (response.status !== 200) {
    throw new Error(response.data?.message || "Failed to update content");
  }

  return response.data;
};

export const deleteContent = async (id) => {
  const response = await apiConnector("DELETE", `${DELETE_CONTENT_API}/${id}`);

  if (response.status !== 200) {
    throw new Error(response.data?.message || "Failed to delete content");
  }

  return response.data;
};
