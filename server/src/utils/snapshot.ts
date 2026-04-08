// HESA Snapshot Utility — creates immutable point-in-time records
// Once written, snapshots cannot be updated or deleted (enforced by DB trigger)

import prisma from './prisma';

export async function takeSnapshot(
  entityType: string,
  entityId: string,
  data: unknown,
  hesaReturnId: string,
  createdBy?: string,
): Promise<string> {
  const snapshot = await prisma.hESASnapshot.create({
    data: {
      hesaReturnId,
      entityType,
      entityId,
      snapshotData: JSON.parse(JSON.stringify(data)),
      snapshotDate: new Date(),
      createdBy,
    },
  });
  return snapshot.id;
}

export async function getSnapshot(
  hesaReturnId: string,
  entityType: string,
  entityId: string,
) {
  return prisma.hESASnapshot.findFirst({
    where: { hesaReturnId, entityType, entityId },
  });
}

export async function bulkSnapshot(
  hesaReturnId: string,
  entities: { entityType: string; entityId: string; data: unknown }[],
  createdBy?: string,
): Promise<number> {
  const records = entities.map(e => ({
    hesaReturnId,
    entityType: e.entityType,
    entityId: e.entityId,
    snapshotData: JSON.parse(JSON.stringify(e.data)),
    snapshotDate: new Date(),
    createdBy,
  }));

  const result = await prisma.hESASnapshot.createMany({ data: records });
  return result.count;
}

export async function getSnapshotsForReturn(hesaReturnId: string) {
  return prisma.hESASnapshot.findMany({
    where: { hesaReturnId },
    orderBy: [{ entityType: 'asc' }, { entityId: 'asc' }],
  });
}
