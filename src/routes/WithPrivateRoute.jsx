import { selectIsAuthenticated } from "@store/slices/profileSlice";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const withPrivateRoute = (Component, options = {}) => {
  const WrappedComponent = (props) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
      const redirectTo = options.redirectTo || "/auth";
      return (
        <Navigate
          to={redirectTo}
          state={{ from: location }}
          replace
        />
      );
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `WithPrivateRoute(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};

export default withPrivateRoute;
