import { useContext } from "react";
import { ScrollContext } from "./ScrollProvider";

export const useScroll = () => useContext(ScrollContext);