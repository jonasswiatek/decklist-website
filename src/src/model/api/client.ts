import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./decklist-api-schema";

export const fetchClient = createFetchClient<paths>({
    baseUrl: "/",
});

export const $api = createClient(fetchClient);
