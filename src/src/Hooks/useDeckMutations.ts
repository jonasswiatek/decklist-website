import { UseMutationOptions } from "@tanstack/react-query";
import { FetchResponse, MaybeOptionalInit } from "openapi-fetch";
import { HttpMethod, MediaType, PathsWithMethod } from "openapi-typescript-helpers";
import { $api } from "../model/api/client";
import type { paths } from "../model/api/decklist-api-schema";

type MutationOptions<
    Method extends HttpMethod,
    Path extends PathsWithMethod<paths, Method>,
    Op = paths[Path][Method] & Record<string, unknown>,
    Init = MaybeOptionalInit<paths[Path], Method>,
    Response = Required<FetchResponse<Op & Record<string, unknown>, Init, MediaType>>,
> = Omit<
    UseMutationOptions<
        Response extends { data: infer D } ? D : never,
        Response extends { error: infer E } ? E : never,
        Init
    >,
    "mutationKey" | "mutationFn"
>;

export function useSubmitDeckMutation(options?: MutationOptions<"post", "/api/events/{event_id}/deck">) {
    return $api.useMutation("post", "/api/events/{event_id}/deck", options);
}

export function useDeleteDeckMutation(options?: MutationOptions<"delete", "/api/events/{event_id}/deck">) {
    return $api.useMutation("delete", "/api/events/{event_id}/deck", options);
}

export function useSetDeckCheckedMutation(options?: MutationOptions<"post", "/api/events/{event_id}/deck/set-checked">) {
    return $api.useMutation("post", "/api/events/{event_id}/deck/set-checked", options);
}

export function useDeleteLibraryDeckMutation(options?: MutationOptions<"delete", "/api/decks/library/{deckId}">) {
    return $api.useMutation("delete", "/api/decks/library/{deckId}", options);
}
