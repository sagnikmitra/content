import { apiConnector } from "./apiConnector";
import {
  ADD_CONTENT_API,
  DELETE_CONTENT_API,
  GET_ALL_CONTENT,
  GET_CONTENT_BY_ID,
  UPDATE_CONTENT_API,
} from "./apiList";

const getResponseErrorMessage = (response, fallback) =>
  response.data?.error ||
  response.data?.message ||
  (response.status ? `${fallback} (${response.status})` : fallback);

export const createContent = async (content) => {
  const response = await apiConnector("POST", ADD_CONTENT_API, content);

  if (response.status !== 201) {
    throw new Error(getResponseErrorMessage(response, "Failed to create content"));
  }

  return response.data;
};

export const getAllContents = async () => {
  const response = await apiConnector("GET", GET_ALL_CONTENT);

  if (response.status !== 200) {
    throw new Error(getResponseErrorMessage(response, "Failed to load content"));
  }

  return response.data;
};

export const getContentById = async (id) => {
  const response = await apiConnector("GET", `${GET_CONTENT_BY_ID}/${id}`);

  if (response.status !== 200) {
    throw new Error(getResponseErrorMessage(response, "Failed to load content"));
  }

  return response.data;
};

export const updateContent = async (content, id) => {
  const response = await apiConnector("PUT", `${UPDATE_CONTENT_API}/${id}`, content);

  if (response.status !== 200) {
    throw new Error(getResponseErrorMessage(response, "Failed to update content"));
  }

  return response.data;
};

export const deleteContent = async (id) => {
  const response = await apiConnector("DELETE", `${DELETE_CONTENT_API}/${id}`);

  if (response.status !== 200) {
    throw new Error(getResponseErrorMessage(response, "Failed to delete content"));
  }

  return response.data;
};
