import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router";

export const ScrollToTop = (props: {children: ReactNode}) => {
    const { pathname } = useLocation();
  
    useEffect(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }, [pathname]);
  
    return props.children;
  }
  