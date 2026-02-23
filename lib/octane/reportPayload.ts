import { prisma } from "@/lib/db/prisma";
import { notFound } from "@/lib/responses";

export type AthleteReportPayload = {
  generatedAt: string;
  athlete: {
    athleteUuid: string;
    name: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    height?: string | null;
    weight?: string | null;
    email?: string | null;
    /** Octane app user UUID when resolved (matched via email). */
    octaneAppUuid?: string | null;
  };
  counts: {
    armAction: number;
    athleticScreen: number;
    mobility: number;
    proSup: number;
    proteus: number;
    readinessScreen: number;
    kinematicsPitching: number;
    kinematicsHitting: number;
    curveballTest: number;
  };
};

export async function buildAthleteReportPayload(
  athleteUuid: string
): Promise<AthleteReportPayload> {
  const athlete = await prisma.d_athletes.findUnique({
    where: { athlete_uuid: athleteUuid },
    select: {
      athlete_uuid: true,
      name: true,
      date_of_birth: true,
      gender: true,
      height: true,
      weight: true,
      email: true,
      app_db_uuid: true,
    },
  });

  if (!athlete) {
    throw notFound("Athlete not found");
  }

  const [
    armAction,
    athleticScreen,
    mobility,
    proSup,
    proteus,
    readinessScreen,
    kinematicsPitching,
    kinematicsHitting,
    curveballTest,
  ] = await Promise.all([
    prisma.f_arm_action.count({ where: { athlete_uuid: athleteUuid } }),
    prisma.f_athletic_screen.count({ where: { athlete_uuid: athleteUuid } }),
    prisma.f_mobility.count({ where: { athlete_uuid: athleteUuid } }),
    prisma.f_pro_sup.count({ where: { athlete_uuid: athleteUuid } }),
    prisma.f_proteus.count({ where: { athlete_uuid: athleteUuid } }),
    prisma.f_readiness_screen.count({ where: { athlete_uuid: athleteUuid } }),
    prisma.f_kinematics_pitching.count({ where: { athlete_uuid: athleteUuid } }),
    prisma.f_kinematics_hitting.count({ where: { athlete_uuid: athleteUuid } }),
    prisma.f_curveball_test.count({ where: { athlete_uuid: athleteUuid } }),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    athlete: {
      athleteUuid: athlete.athlete_uuid,
      name: athlete.name,
      dateOfBirth: athlete.date_of_birth?.toISOString() ?? null,
      gender: athlete.gender ?? null,
      height: athlete.height ? String(athlete.height) : null,
      weight: athlete.weight ? String(athlete.weight) : null,
      email: athlete.email ?? null,
      octaneAppUuid: athlete.app_db_uuid ?? null,
    },
    counts: {
      armAction,
      athleticScreen,
      mobility,
      proSup,
      proteus,
      readinessScreen,
      kinematicsPitching,
      kinematicsHitting,
      curveballTest,
    },
  };
}

