import { selectIsAuthenticated } from "@store/slices/profileSlice";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const withUserLoggedInRoute = (Component, options = {}) => {
  const WrappedComponent = (props) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    if (isAuthenticated) {
      const redirectTo = options.redirectTo || "/";
      return <Navigate to={redirectTo} replace />;
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `WithUserLoggedInRoute(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent;
};

export default withUserLoggedInRoute;
