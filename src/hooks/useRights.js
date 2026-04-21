import { useRightsContext } from "../contexts/UserRightsContext";

export function useRights() {
  const { rights, loadingRights } = useRightsContext();
  return { rights, loadingRights };
}