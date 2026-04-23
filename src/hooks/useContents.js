import { getAllContents } from "@api/queries";
import { useEffect, useState } from "react";

const useContents = (reRenderSwitch) => {
  const [contents, setContents] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllContents();
        if (mounted) {
          setContents(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching contents:", error);
        if (mounted) {
          setContents([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [reRenderSwitch]);

  return contents;
};

export default useContents;
