export type MembershipRole = "organizer" | "member";

export type MembershipCheckResult = {
  isMember: boolean;
  role?: MembershipRole;
};

