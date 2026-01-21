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
      // Prisma Decimal serializes to string via toJSON; we explicitly cast to string/null.
      height: athlete.height ? String(athlete.height) : null,
      weight: athlete.weight ? String(athlete.weight) : null,
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

