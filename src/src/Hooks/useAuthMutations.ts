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

export function useStartLoginMutation(options?: MutationOptions<"post", "/api/login/start">) {
    return $api.useMutation("post", "/api/login/start", options);
}

export function useContinueLoginMutation(options?: MutationOptions<"post", "/api/login/continue">) {
    return $api.useMutation("post", "/api/login/continue", options);
}

export function useGoogleLoginMutation(options?: MutationOptions<"post", "/api/login/google">) {
    return $api.useMutation("post", "/api/login/google", options);
}

export function useLogoutMutation(options?: MutationOptions<"post", "/api/logout">) {
    return $api.useMutation("post", "/api/logout", options);
}
