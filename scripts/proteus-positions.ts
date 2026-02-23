/**
 * One-off: list f_proteus positions and row counts.
 * Run: npx tsx scripts/proteus-positions.ts
 */
import { prisma } from "../lib/db/prisma";

async function main() {
  const rows = await prisma.f_proteus.groupBy({
    by: ["position"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const total = rows.reduce((sum, r) => sum + r._count.id, 0);
  console.log("f_proteus positions (position -> row count)\n");
  for (const r of rows) {
    const label = r.position ?? "(null)";
    console.log(`${label}: ${r._count.id}`);
  }
  console.log("\nTotal positions:", rows.length);
  console.log("Total rows:", total);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
