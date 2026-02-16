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

export function useCreateTournamentMutation(options?: MutationOptions<"post", "/api/timers">) {
    return $api.useMutation("post", "/api/timers", options);
}

export function useAddManagerMutation(options?: MutationOptions<"post", "/api/timers/{tournamentId}/managers">) {
    return $api.useMutation("post", "/api/timers/{tournamentId}/managers", options);
}

export function useDeleteManagerMutation(options?: MutationOptions<"delete", "/api/timers/{tournamentId}/managers/{userId}">) {
    return $api.useMutation("delete", "/api/timers/{tournamentId}/managers/{userId}", options);
}

export function useCreateClockMutation(options?: MutationOptions<"post", "/api/timers/{tournamentId}/clocks">) {
    return $api.useMutation("post", "/api/timers/{tournamentId}/clocks", options);
}

export function useUpdateClockMutation(options?: MutationOptions<"post", "/api/timers/{tournamentId}/clocks/{clockId}">) {
    return $api.useMutation("post", "/api/timers/{tournamentId}/clocks/{clockId}", options);
}

export function useResetClockMutation(options?: MutationOptions<"post", "/api/timers/{tournamentId}/clocks/{clockId}/reset">) {
    return $api.useMutation("post", "/api/timers/{tournamentId}/clocks/{clockId}/reset", options);
}

export function useAdjustClockMutation(options?: MutationOptions<"post", "/api/timers/{tournamentId}/clocks/{clockId}/adjust">) {
    return $api.useMutation("post", "/api/timers/{tournamentId}/clocks/{clockId}/adjust", options);
}

export function useDeleteClockMutation(options?: MutationOptions<"delete", "/api/timers/{tournamentId}/clocks/{clockId}">) {
    return $api.useMutation("delete", "/api/timers/{tournamentId}/clocks/{clockId}", options);
}

export function useDeleteTournamentMutation(options?: MutationOptions<"delete", "/api/timers/{tournamentId}">) {
    return $api.useMutation("delete", "/api/timers/{tournamentId}", options);
}

export function useForceSyncMutation(options?: MutationOptions<"post", "/api/timers/{tournamentId}/force-update">) {
    return $api.useMutation("post", "/api/timers/{tournamentId}/force-update", options);
}
