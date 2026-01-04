import { createRoot } from "react-dom/client"; // Import createRoot properly
import { Provider } from "react-redux";
import store from "./stores/stores";
import App from "./App"

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
