import { UseMutationOptions, useQueryClient } from "@tanstack/react-query";
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

const eventListQueryKey = $api.queryOptions("get", "/api/events").queryKey;

export function useCreateEventMutation(options?: MutationOptions<"post", "/api/events">) {
    const queryClient = useQueryClient();
    return $api.useMutation("post", "/api/events", {
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: eventListQueryKey });
            options?.onSuccess?.(...args);
        },
    });
}

export function useUpdateEventMutation(options?: MutationOptions<"post", "/api/events/{eventId}">) {
    return $api.useMutation("post", "/api/events/{eventId}", options);
}

export function useDeleteEventMutation(options?: MutationOptions<"delete", "/api/events/{eventId}">) {
    const queryClient = useQueryClient();
    return $api.useMutation("delete", "/api/events/{eventId}", {
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: eventListQueryKey });
            options?.onSuccess?.(...args);
        },
    });
}

export function useAddJudgeMutation(options?: MutationOptions<"post", "/api/events/{eventId}/users">) {
    return $api.useMutation("post", "/api/events/{eventId}/users", options);
}

export function useAddPlayerMutation(options?: MutationOptions<"post", "/api/events/{eventId}/players">) {
    return $api.useMutation("post", "/api/events/{eventId}/players", options);
}

export function useDeleteEventUserMutation(options?: MutationOptions<"delete", "/api/events/{eventId}/users">) {
    return $api.useMutation("delete", "/api/events/{eventId}/users", options);
}

export function useLeaveEventMutation(options?: MutationOptions<"delete", "/api/events/{eventId}/users">) {
    const queryClient = useQueryClient();
    return $api.useMutation("delete", "/api/events/{eventId}/users", {
        ...options,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: eventListQueryKey });
            options?.onSuccess?.(...args);
        },
    });
}
