import routeConfig from "@routes/routeConfig";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <main>
        <Routes>
          {routeConfig.map(({ path, element }, i) => (
            <Route key={i} path={path} element={element} />
          ))}
        </Routes>
      </main>
    </Router>
  );
};

export default App;
