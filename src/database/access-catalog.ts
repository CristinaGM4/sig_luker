import type { PrismaClient } from "../generated/prisma/client.js";

const participantPermission = ["ibite:complete", "Completar IBITE"] as const;

const psychosocialPermissions = [
  ["records:read", "Consultar información individual"],
  ["records:read-identity", "Consultar datos nominales"],
  ["records:create", "Crear registros"],
  ["records:update", "Corregir registros"],
  ["records:approve", "Aprobar registros"],
  ["records:delete", "Eliminar registros según la política aplicable"],
  ["imports:execute", "Gestionar importaciones"],
  ["exports:execute", "Gestionar exportaciones"],
  ["audit:read", "Consultar auditoría"],
] as const;

const participantRoles = [
  ["STUDENT", "Estudiante"],
  ["CAREGIVER", "Acudiente"],
  ["TEACHER", "Docente"],
  ["COUNSELOR", "Orientador"],
  ["ADMINISTRATIVE", "Administrativo"],
  ["SCHOOL_LEADERSHIP", "Directivo"],
] as const;

export async function seedAccessCatalog(client: PrismaClient) {
  const roles = [
    ...participantRoles.map(([code, label]) => ({
      code,
      label,
      permissions: [participantPermission],
    })),
    {
      code: "PSYCHOSOCIAL_SUPPORT",
      label: "Equipo de Apoyo Psicosocial",
      permissions: psychosocialPermissions,
    },
  ];

  await client.$transaction(async (transaction) => {
    const permissionIds = new Map<string, string>();

    for (const [code, label] of [
      participantPermission,
      ["scope:manage", "Gestionar asignaciones psicosociales"],
      ["ibite:campaign-control", "Activar y desactivar campañas IBITE-17"],
      ["imports:review", "Revisar diagnósticos históricos"],
      ...psychosocialPermissions,
    ]) {
      const permission = await transaction.permission.upsert({
        where: { code },
        create: { code, label },
        update: { label },
      });
      permissionIds.set(code, permission.id);
    }

    for (const { code, label, permissions } of roles) {
      const role = await transaction.role.upsert({
        where: { code },
        create: { code, label },
        update: { label },
      });

      await transaction.rolePermission.createMany({
        data: permissions.map(([permissionCode]) => ({
          roleId: role.id,
          permissionId: permissionIds.get(permissionCode)!,
        })),
        skipDuplicates: true,
      });
    }
  });
}
