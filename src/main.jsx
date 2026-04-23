import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";
import "./index.css";
import store from "./store/index.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />

      <ToastContainer
        position="top-center"
        limit={3}
        hideProgressBar
        autoClose={2000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme={"dark"}
        toastStyle={{ borderRadius: "1rem" }}
        closeButton={false}
        className={"font-outfit"}
      />
    </Provider>
  </StrictMode>
);
