import type { VyncoClient } from "../client.js";
import type { VyncoResponse } from "../response.js";
import type { ChangePasswordRequest, UpdateProfileRequest, UserProfile } from "../types.js";

export class Users {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async me(): Promise<VyncoResponse<UserProfile>> {
    return this.#client._request("GET", "/auth/me");
  }

  async updateProfile(
    request: UpdateProfileRequest,
  ): Promise<VyncoResponse<UserProfile>> {
    return this.#client._requestWithBody("PUT", "/auth/profile", request);
  }

  async changePassword(
    request: ChangePasswordRequest,
  ): Promise<VyncoResponse<unknown>> {
    return this.#client._requestWithBody("PUT", "/auth/password", request);
  }
}
