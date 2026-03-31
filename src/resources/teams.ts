import type { VyncoClient } from "../client.js";
import type { ResponseMeta, VyncoResponse } from "../response.js";
import type {
  BillingSummary,
  CreateTeamRequest,
  Invitation,
  InviteMemberRequest,
  Team,
  TeamMember,
  UpdateMemberRoleRequest,
} from "../types.js";

export class Teams {
  #client: VyncoClient;

  /** @internal */
  constructor(client: VyncoClient) {
    this.#client = client;
  }

  async me(): Promise<VyncoResponse<Team>> {
    return this.#client._request("GET", "/v1/teams/me");
  }

  async create(request: CreateTeamRequest): Promise<VyncoResponse<Team>> {
    return this.#client._requestWithBody("POST", "/v1/teams", request);
  }

  async members(): Promise<VyncoResponse<TeamMember[]>> {
    return this.#client._request("GET", "/v1/teams/me/members");
  }

  async inviteMember(request: InviteMemberRequest): Promise<VyncoResponse<Invitation>> {
    return this.#client._requestWithBody("POST", "/v1/teams/me/members", request);
  }

  async updateMemberRole(
    id: string,
    request: UpdateMemberRoleRequest,
  ): Promise<VyncoResponse<TeamMember>> {
    return this.#client._requestWithBody(
      "PUT",
      `/v1/teams/me/members/${encodeURIComponent(id)}`,
      request,
    );
  }

  async removeMember(id: string): Promise<ResponseMeta> {
    return this.#client._requestEmpty(
      "DELETE",
      `/v1/teams/me/members/${encodeURIComponent(id)}`,
    );
  }

  async billingSummary(): Promise<VyncoResponse<BillingSummary>> {
    return this.#client._request("GET", "/v1/teams/me/billing-summary");
  }
}
