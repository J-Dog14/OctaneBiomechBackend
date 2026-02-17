import { prisma } from "@/lib/db/prisma";

const athleteListSelect = {
  athlete_uuid: true,
  name: true,
  normalized_name: true,
  email: true,
  date_of_birth: true,
  gender: true,
  age_group: true,
  created_at: true,
  updated_at: true,
  app_db_uuid: true,
  app_db_synced_at: true,
  has_pitching_data: true,
  has_hitting_data: true,
  has_athletic_screen_data: true,
  has_mobility_data: true,
  has_pro_sup_data: true,
  has_proteus_data: true,
  has_readiness_screen_data: true,
  has_arm_action_data: true,
  has_curveball_test_data: true,
  pitching_session_count: true,
  hitting_session_count: true,
  athletic_screen_session_count: true,
  mobility_session_count: true,
  pro_sup_session_count: true,
  proteus_session_count: true,
  readiness_screen_session_count: true,
  arm_action_session_count: true,
  curveball_test_session_count: true,
} as const;

export async function getAthletesList(opts: {
  q?: string;
  limit?: number;
  cursor?: string;
  /** When true, only return athletes with no email (non-app athletes). */
  filterNonApp?: boolean;
}) {
  const { q, limit = 50, cursor, filterNonApp } = opts;
  const nameWhere =
    q && q.trim().length > 0
      ? {
          OR: [
            { name: { contains: q.trim(), mode: "insensitive" as const } },
            {
              normalized_name: {
                contains: q.trim().toLowerCase(),
              },
            },
          ],
        }
      : undefined;
  const nonAppWhere = filterNonApp
    ? { OR: [{ email: null }, { email: "" }] }
    : undefined;
  const where =
    nameWhere && nonAppWhere
      ? { AND: [nameWhere, nonAppWhere] }
      : nameWhere ?? nonAppWhere ?? undefined;

  // Cursor for alphabetical (name) pagination: need name + athlete_uuid
  let cursorPayload: { name: string; athlete_uuid: string } | undefined;
  if (cursor) {
    const cursorAthlete = await prisma.d_athletes.findUnique({
      where: { athlete_uuid: cursor },
      select: { name: true, athlete_uuid: true },
    });
    if (cursorAthlete) {
      cursorPayload = {
        name: cursorAthlete.name,
        athlete_uuid: cursorAthlete.athlete_uuid,
      };
    }
  }

  const items = await prisma.d_athletes.findMany({
    where,
    take: limit + 1,
    skip: cursorPayload ? 1 : 0,
    cursor: cursorPayload,
    orderBy: [{ name: "asc" }, { athlete_uuid: "asc" }],
    select: athleteListSelect,
  });

  const hasNext = items.length > limit;
  const results = hasNext ? items.slice(0, limit) : items;
  const nextCursor =
    hasNext && results.length > 0 ? results[results.length - 1].athlete_uuid : null;

  return { items: results, nextCursor };
}
